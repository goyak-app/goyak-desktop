use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use crate::errors::DublyError;
use crate::state::{AudioAppInfo, AudioDeviceInfo};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::Emitter;

pub struct WindowsAudioCapture;

impl WindowsAudioCapture {
    pub fn new() -> Self {
        Self
    }

    pub fn list_applications(&self) -> Result<Vec<AudioAppInfo>, DublyError> {
        use sysinfo::System;

        let known: &[(&str, &str)] = &[
            ("chrome", "Google Chrome"),
            ("msedge", "Microsoft Edge"),
            ("firefox", "Mozilla Firefox"),
            ("opera", "Opera"),
            ("brave", "Brave Browser"),
            ("vivaldi", "Vivaldi"),
            ("spotify", "Spotify"),
            ("vlc", "VLC Media Player"),
            ("discord", "Discord"),
            ("teams", "Microsoft Teams"),
            ("zoom", "Zoom"),
            ("mpc-hc", "MPC-HC"),
            ("mpc-be", "MPC-BE"),
            ("potplayermini", "PotPlayer"),
            ("mpv", "MPV Player"),
            ("foobar2000", "Foobar2000"),
            ("aimp", "AIMP"),
            ("deezer", "Deezer"),
            ("iTunes", "iTunes"),
            ("winamp", "Winamp"),
        ];

        let mut sys = System::new_all();
        sys.refresh_all();

        let mut seen = std::collections::HashSet::<String>::new();
        let mut apps = Vec::new();

        for (pid, process) in sys.processes() {
            let raw_name = process.name().to_string_lossy();
            let lower = raw_name.to_lowercase();
            let clean = lower.trim_end_matches(".exe");

            for (key, display) in known {
                if clean.contains(key) {
                    let key_str = key.to_string();
                    if seen.insert(key_str.clone()) {
                        apps.push(AudioAppInfo {
                            id: key_str,
                            name: display.to_string(),
                            process_id: pid.as_u32(),
                            is_audio_active: true,
                        });
                        break;
                    }
                }
            }
        }

        if apps.is_empty() {
            apps.push(AudioAppInfo {
                id: "system".to_string(),
                name: "System Audio".to_string(),
                process_id: 0,
                is_audio_active: true,
            });
        }

        Ok(apps)
    }

    pub fn list_output_devices(&self) -> Result<Vec<AudioDeviceInfo>, DublyError> {
        let host = cpal::default_host();
        let mut devices_list = Vec::new();
        let default_device_name = host.default_output_device().and_then(|d| d.name().ok());

        if let Ok(devices) = host.output_devices() {
            for (idx, dev) in devices.enumerate() {
                if let Ok(name) = dev.name() {
                    let is_default = default_device_name
                        .as_ref()
                        .map_or(false, |d| d == &name);
                    devices_list.push(AudioDeviceInfo {
                        id: format!("dev_{}", idx),
                        name,
                        is_default,
                    });
                }
            }
        }

        if devices_list.is_empty() {
            devices_list.push(AudioDeviceInfo {
                id: "default".to_string(),
                name: "Default System Output Device".to_string(),
                is_default: true,
            });
        }

        Ok(devices_list)
    }
}

pub fn start_loopback_capture(
    pcm_tx: tokio::sync::mpsc::Sender<Vec<u8>>,
    stop: Arc<AtomicBool>,
    app: tauri::AppHandle,
) {
    std::thread::spawn(move || {
        wasapi_loopback_thread(pcm_tx, stop, app);
    });
}

fn wasapi_loopback_thread(
    pcm_tx: tokio::sync::mpsc::Sender<Vec<u8>>,
    stop: Arc<AtomicBool>,
    app: tauri::AppHandle,
) {
    use windows::Win32::Media::Audio::*;
    use windows::Win32::System::Com::*;

    unsafe {
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);

        match wasapi_loopback_inner(&pcm_tx, &stop, &app) {
            Ok(_) => {}
            Err(e) => {
                let _ = app.emit("dubbing_log", format!("[ERROR] WASAPI loopback: {}", e));
                let _ = app.emit("dubbing_status", "error");
                let _ = app.emit("dubbing_error", e.to_string());
            }
        }

        CoUninitialize();
    }
}

unsafe fn wasapi_loopback_inner(
    pcm_tx: &tokio::sync::mpsc::Sender<Vec<u8>>,
    stop: &Arc<AtomicBool>,
    app: &tauri::AppHandle,
) -> windows::core::Result<()> {
    use windows::Win32::Media::Audio::*;
    use windows::Win32::System::Com::*;
    let enumerator: IMMDeviceEnumerator =
        CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)?;

    let device = enumerator.GetDefaultAudioEndpoint(eRender, eConsole)?;

    let audio_client: IAudioClient = device.Activate(CLSCTX_ALL, None)?;

    let format_ptr = audio_client.GetMixFormat()?;
    let sample_rate = (*format_ptr).nSamplesPerSec;
    let channels = (*format_ptr).nChannels as usize;
    let bits = (*format_ptr).wBitsPerSample;

    let _ = app.emit(
        "dubbing_log",
        format!(
            "[WASAPI] Loopback format: {}Hz / {}ch / {}bit",
            sample_rate, channels, bits
        ),
    );

    audio_client.Initialize(
        AUDCLNT_SHAREMODE_SHARED,
        AUDCLNT_STREAMFLAGS_LOOPBACK,
        10_000_000i64,
        0i64,
        format_ptr,
        None,
    )?;

    let capture_client: IAudioCaptureClient = audio_client.GetService()?;
    audio_client.Start()?;
    let _ = app.emit("dubbing_log", "[WASAPI] Loopback capture active (AUDCLNT_STREAMFLAGS_LOOPBACK)");

    let target_rate: u32 = 16000;

    while !stop.load(Ordering::Relaxed) {
        let packet_size = capture_client.GetNextPacketSize()?;

        if packet_size == 0 {
            std::thread::sleep(std::time::Duration::from_millis(10));
            continue;
        }

        let mut data_ptr: *mut u8 = std::ptr::null_mut();
        let mut num_frames: u32 = 0;
        let mut flags: u32 = 0;

        capture_client.GetBuffer(
            &mut data_ptr,
            &mut num_frames,
            &mut flags,
            None,
            None,
        )?;

        if num_frames > 0 && !data_ptr.is_null() {
            let total_samples = num_frames as usize * channels;

            let float_samples: Vec<f32> = if bits == 32 {
                std::slice::from_raw_parts(data_ptr as *const f32, total_samples).to_vec()
            } else if bits == 16 {
                std::slice::from_raw_parts(data_ptr as *const i16, total_samples)
                    .iter()
                    .map(|&s| s as f32 / 32768.0)
                    .collect()
            } else {
                vec![]
            };

            capture_client.ReleaseBuffer(num_frames)?;

            if !float_samples.is_empty() {
                let mono: Vec<f32> = if channels > 1 {
                    float_samples
                        .chunks(channels)
                        .map(|c| c.iter().sum::<f32>() / channels as f32)
                        .collect()
                } else {
                    float_samples
                };

                let ratio = target_rate as f64 / sample_rate as f64;
                let out_len = (mono.len() as f64 * ratio) as usize;
                let mut pcm_bytes = Vec::with_capacity(out_len * 2);

                for i in 0..out_len {
                    let src = (i as f64 / ratio) as usize;
                    let s = mono.get(src).copied().unwrap_or(0.0);
                    let s16 = (s.max(-1.0).min(1.0) * 32767.0) as i16;
                    pcm_bytes.extend_from_slice(&s16.to_le_bytes());
                }

                let _ = pcm_tx.blocking_send(pcm_bytes);
            }
        } else {
            capture_client.ReleaseBuffer(0)?;
        }
    }

    audio_client.Stop()?;
    let _ = app.emit("dubbing_log", "[WASAPI] Loopback capture stopped");

    Ok(())
}

pub fn start_cpal_playback(
    playback_rx: std::sync::mpsc::Receiver<Vec<u8>>,
    stop: Arc<AtomicBool>,
    dubbed_volume: Arc<std::sync::Mutex<f32>>,
    is_dubbed_muted: Arc<std::sync::Mutex<bool>>,
    output_device_idx: Option<usize>,
    app: tauri::AppHandle,
) {
    std::thread::spawn(move || {
        let host = cpal::default_host();

        let device = if let Some(idx) = output_device_idx {
            host.output_devices()
                .ok()
                .and_then(|mut iter| iter.nth(idx))
                .unwrap_or_else(|| host.default_output_device().expect("no output device"))
        } else {
            host.default_output_device().expect("no output device")
        };

        let device_name = device.name().unwrap_or_else(|_| "Unknown".to_string());
        let _ = app.emit("dubbing_log", format!("[PLAYBACK] Output: {}", device_name));

        let config = device.default_output_config().expect("no output config");
        let sample_rate = config.sample_rate().0;
        let channels = config.channels() as usize;
        let gemini_rate: u32 = 24000;

        let audio_buf: Arc<std::sync::Mutex<std::collections::VecDeque<f32>>> =
            Arc::new(std::sync::Mutex::new(std::collections::VecDeque::new()));
        let audio_buf_cb = audio_buf.clone();
        let vol_cb = dubbed_volume.clone();
        let mute_cb = is_dubbed_muted.clone();

        let stream = device
            .build_output_stream(
                &config.into(),
                move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
                    let mut buf = audio_buf_cb.lock().unwrap();
                    let vol = *vol_cb.lock().unwrap();
                    let muted = *mute_cb.lock().unwrap();
                    for sample in data.iter_mut() {
                        let raw = buf.pop_front().unwrap_or(0.0);
                        *sample = if muted { 0.0 } else { raw * vol };
                    }
                },
                |err| eprintln!("[CPAL] Output error: {:?}", err),
                None,
            )
            .expect("failed to build output stream");

        stream.play().expect("failed to start playback");
        let _ = app.emit("dubbing_log", "[PLAYBACK] CPAL output stream started");

        while !stop.load(Ordering::Relaxed) {
            match playback_rx.try_recv() {
                Ok(pcm_bytes) => {
                    let ratio = sample_rate as f64 / gemini_rate as f64;
                    let in_samples = pcm_bytes.len() / 2;
                    let out_samples = (in_samples as f64 * ratio) as usize;
                    let mut buf = audio_buf.lock().unwrap();

                    for i in 0..out_samples {
                        let src = (i as f64 / ratio) as usize;
                        let byte = src * 2;
                        let s16 = if byte + 1 < pcm_bytes.len() {
                            i16::from_le_bytes([pcm_bytes[byte], pcm_bytes[byte + 1]])
                        } else {
                            0i16
                        };
                        let f = s16 as f32 / 32768.0;
                        for _ in 0..channels {
                            buf.push_back(f);
                        }
                    }
                }
                Err(std::sync::mpsc::TryRecvError::Empty) => {
                    std::thread::sleep(std::time::Duration::from_millis(5));
                }
                Err(std::sync::mpsc::TryRecvError::Disconnected) => break,
            }
        }

        drop(stream);
        let _ = app.emit("dubbing_log", "[PLAYBACK] CPAL output stream stopped");
    });
}
