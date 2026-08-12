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
        use std::collections::HashSet;
        use windows::Win32::Foundation::{BOOL, HWND, LPARAM};
        use windows::Win32::UI::WindowsAndMessaging::{
            EnumWindows, GetWindowTextLengthW, GetWindowTextW, GetWindowThreadProcessId, IsWindowVisible,
        };

        let mut pids: HashSet<u32> = HashSet::new();
        let mut apps = Vec::new();

        unsafe extern "system" fn enum_window(hwnd: HWND, lparam: LPARAM) -> BOOL {
            if IsWindowVisible(hwnd).as_bool() {
                let length = GetWindowTextLengthW(hwnd);
                if length > 0 {
                    let mut buf = vec![0u16; (length + 1) as usize];
                    GetWindowTextW(hwnd, &mut buf);
                    let title = String::from_utf16_lossy(&buf);
                    let title = title.trim_end_matches('\0').trim();

                    if !title.is_empty() && title != "Program Manager" {
                        let mut pid = 0;
                        GetWindowThreadProcessId(hwnd, Some(&mut pid));
                        
                        let data = &mut *(lparam.0 as *mut (HashSet<u32>, Vec<AudioAppInfo>));
                        if data.0.insert(pid) {
                            data.1.push(AudioAppInfo {
                                id: pid.to_string(),
                                name: title.to_string(),
                                process_id: pid,
                                is_audio_active: true,
                            });
                        }
                    }
                }
            }
            BOOL::from(true)
        }

        unsafe {
            let mut data = (pids, apps);
            let data_ptr = &mut data as *mut _ as isize;
            let _ = EnumWindows(Some(enum_window), LPARAM(data_ptr));
            apps = data.1;
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
    pid: u32,
) {
    std::thread::spawn(move || {
        wasapi_loopback_thread(pcm_tx, stop, app, pid);
    });
}

use windows::core::{implement, w, HRESULT, Interface, PROPVARIANT};
use windows::Win32::Media::Audio::{IActivateAudioInterfaceCompletionHandler, IActivateAudioInterfaceCompletionHandler_Impl, IActivateAudioInterfaceAsyncOperation};

#[implement(IActivateAudioInterfaceCompletionHandler)]
struct AudioActivationHandler {
    tx: std::sync::mpsc::Sender<windows::core::Result<windows::Win32::Media::Audio::IAudioClient>>,
}

impl IActivateAudioInterfaceCompletionHandler_Impl for AudioActivationHandler_Impl {
    fn ActivateCompleted(
        &self,
        operation: Option<&IActivateAudioInterfaceAsyncOperation>,
    ) -> windows::core::Result<()> {
        if let Some(op) = operation {
            let mut status = HRESULT(0);
            let mut unk = None;
            unsafe {
                op.GetActivateResult(&mut status, &mut unk)?;
                if status.is_err() {
                    let _ = self.tx.send(Err(status.into()));
                } else if let Some(u) = unk {
                    let client: windows::Win32::Media::Audio::IAudioClient = u.cast()?;
                    let _ = self.tx.send(Ok(client));
                } else {
                    let _ = self.tx.send(Err(windows::core::Error::new(
                        HRESULT(0x80004005u32 as i32),
                        "Unknown activation error",
                    )));
                }
            }
        }
        Ok(())
    }
}

fn wasapi_loopback_thread(
    pcm_tx: tokio::sync::mpsc::Sender<Vec<u8>>,
    stop: Arc<AtomicBool>,
    app: tauri::AppHandle,
    pid: u32,
) {
    use windows::Win32::Media::Audio::*;
    use windows::Win32::System::Com::*;

    unsafe {
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);

        match wasapi_loopback_inner(&pcm_tx, &stop, &app, pid) {
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
    pid: u32,
) -> windows::core::Result<()> {
    use windows::Win32::Media::Audio::*;
    use windows::Win32::System::Com::*;
    use windows::Win32::Foundation::{HANDLE, WAIT_OBJECT_0};
    use windows::Win32::System::Threading::{CreateEventW, WaitForSingleObject};

    let audio_client: IAudioClient = if pid == 0 {
        let enumerator: IMMDeviceEnumerator =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)?;
        let device = enumerator.GetDefaultAudioEndpoint(eRender, eConsole)?;
        device.Activate::<IAudioClient>(CLSCTX_ALL, None)?
    } else {
        let loopback_params = AUDIOCLIENT_PROCESS_LOOPBACK_PARAMS {
            TargetProcessId: pid,
            ProcessLoopbackMode: PROCESS_LOOPBACK_MODE_INCLUDE_TARGET_PROCESS_TREE,
        };

        let mut activation_params: AUDIOCLIENT_ACTIVATION_PARAMS = unsafe { std::mem::zeroed() };
        activation_params.ActivationType = AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK;
        activation_params.Anonymous.ProcessLoopbackParams = loopback_params;

        #[repr(C)]
        struct InitPropVariant {
            vt: u16,
            reserved1: u16,
            reserved2: u16,
            reserved3: u16,
            blob: windows::Win32::System::Com::BLOB,
        }

        let blob = windows::Win32::System::Com::BLOB {
            cbSize: std::mem::size_of::<AUDIOCLIENT_ACTIVATION_PARAMS>() as u32,
            pBlobData: &mut activation_params as *mut _ as *mut u8,
        };

        let mut fake_prop: InitPropVariant = unsafe { std::mem::zeroed() };
        fake_prop.vt = 65; // VT_BLOB
        fake_prop.blob = blob;

        let render_id = w!(r#"VAD\Process_Loopback"#);
        let (tx, rx) = std::sync::mpsc::channel();
        let handler: IActivateAudioInterfaceCompletionHandler = AudioActivationHandler { tx }.into();
        let props_ptr = &fake_prop as *const _ as *const PROPVARIANT;

        ActivateAudioInterfaceAsync(render_id, &IAudioClient::IID, Some(unsafe { &*props_ptr }), &handler)?;

        match rx.recv() {
            Ok(Ok(client)) => client,
            Ok(Err(e)) => return Err(e),
            Err(_) => {
                return Err(windows::core::Error::new(
                    HRESULT(0x80004005u32 as i32),
                    "Failed to receive audio client from async activation",
                ))
            }
        }
    };

    let (format_ptr, sample_rate, channels, bits) = if pid == 0 {
        let ptr = audio_client.GetMixFormat()?;
        (ptr, (*ptr).nSamplesPerSec, (*ptr).nChannels as usize, (*ptr).wBitsPerSample)
    } else {
        const WAVE_FORMAT_EXTENSIBLE: u16 = 0xFFFE;
        const KSDATAFORMAT_SUBTYPE_IEEE_FLOAT: windows::core::GUID = windows::core::GUID {
            data1: 0x00000003,
            data2: 0x0000,
            data3: 0x0010,
            data4: [0x80, 0x00, 0x00, 0xaa, 0x00, 0x38, 0x9b, 0x71],
        };
        let mut wfx = WAVEFORMATEXTENSIBLE {
            Format: WAVEFORMATEX {
                wFormatTag: WAVE_FORMAT_EXTENSIBLE as u16,
                nChannels: 2,
                nSamplesPerSec: 48000,
                wBitsPerSample: 32,
                nBlockAlign: (2 * 32) / 8,
                nAvgBytesPerSec: 48000 * ((2 * 32) / 8),
                cbSize: (std::mem::size_of::<WAVEFORMATEXTENSIBLE>() - std::mem::size_of::<WAVEFORMATEX>()) as u16,
            },
            Samples: windows::Win32::Media::Audio::WAVEFORMATEXTENSIBLE_0 {
                wValidBitsPerSample: 32,
            },
            dwChannelMask: 3, // SPEAKER_FRONT_LEFT | SPEAKER_FRONT_RIGHT
            SubFormat: KSDATAFORMAT_SUBTYPE_IEEE_FLOAT,
        };
        // We have to heap-allocate this because we pass the pointer to Initialize
        // and COM might expect it to stay alive or we need to pass a valid pointer.
        // Wait, audio_client.Initialize just reads the structure. But usually CoTaskMemAlloc is used if it's returned.
        // For Initialize, a normal pointer is fine as it's synchronously read.
        let format_ptr = Box::into_raw(Box::new(wfx)) as *mut WAVEFORMATEX;
        (format_ptr, 48000, 2, 32)
    };

    let _ = app.emit(
        "dubbing_log",
        format!(
            "[WASAPI] Loopback format: {}Hz / {}ch / {}bit",
            sample_rate, channels, bits
        ),
    );

    let mut stream_flags = AUDCLNT_STREAMFLAGS_LOOPBACK;
    let mut buffer_duration = 10_000_000i64;
    let event_handle = if pid != 0 {
        stream_flags |= AUDCLNT_STREAMFLAGS_EVENTCALLBACK;
        buffer_duration = 0i64;
        unsafe { CreateEventW(None, false, false, None)? }
    } else {
        windows::Win32::Foundation::HANDLE::default()
    };

    audio_client.Initialize(
        AUDCLNT_SHAREMODE_SHARED,
        stream_flags,
        buffer_duration,
        0i64,
        format_ptr,
        None,
    )?;

    if pid != 0 {
        audio_client.SetEventHandle(event_handle)?;
    }

    let capture_client: IAudioCaptureClient = audio_client.GetService()?;
    audio_client.Start()?;
    let _ = app.emit("dubbing_log", "[WASAPI] Loopback capture active (AUDCLNT_STREAMFLAGS_LOOPBACK)");

    let target_rate: u32 = 16000;

    while !stop.load(Ordering::Relaxed) {
        if pid != 0 {
            unsafe { WaitForSingleObject(event_handle, 100); }
        }

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
    
    if pid != 0 {
        // Free the heap allocated format since it was not from GetMixFormat
        unsafe { let _ = Box::from_raw(format_ptr as *mut WAVEFORMATEXTENSIBLE); }
    } else {
        unsafe { CoTaskMemFree(Some(format_ptr as *mut _)); }
    }
    
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
