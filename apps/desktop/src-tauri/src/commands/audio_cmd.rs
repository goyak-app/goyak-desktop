use crate::audio::{start_cpal_playback, start_loopback_capture, PlatformAudioEngine};
use crate::errors::DublyError;
use crate::gemini::run_gemini_live_session;
use crate::state::{AppState, AudioAppInfo, AudioDeviceInfo};
use std::sync::atomic::Ordering;
use std::sync::Arc;
use tauri::{Emitter, State};

#[tauri::command]
pub async fn get_audio_applications() -> Result<Vec<AudioAppInfo>, DublyError> {
    PlatformAudioEngine::get_applications()
}

#[tauri::command]
pub async fn get_output_devices() -> Result<Vec<AudioDeviceInfo>, DublyError> {
    PlatformAudioEngine::get_output_devices()
}

#[tauri::command]
pub async fn start_dubbing(
    app: tauri::AppHandle,
    app_id: Option<String>,
    source_language: String,
    target_language: String,
    api_key: String,
    output_device_id: Option<String>,
    model: Option<String>,
    state: State<'_, AppState>,
) -> Result<bool, DublyError> {
    if api_key.trim().is_empty() {
        return Err(DublyError::IpcError("Gemini API key is required".to_string()));
    }

    state.pipeline_stop.store(false, Ordering::SeqCst);
    *state.is_dubbing_active.lock().unwrap() = true;
    *state.selected_app_id.lock().unwrap() = app_id.clone();
    *state.source_language.lock().unwrap() = source_language.clone();
    *state.target_language.lock().unwrap() = target_language.clone();
    *state.api_key.lock().unwrap() = api_key.clone();

    let stop = Arc::clone(&state.pipeline_stop);
    let dubbed_volume = Arc::clone(&state.dubbed_volume);
    let is_dubbed_muted = Arc::clone(&state.is_dubbed_muted);

    let (pcm_tx, pcm_rx) = tokio::sync::mpsc::channel::<Vec<u8>>(200);
    let (playback_tx, playback_rx) = std::sync::mpsc::sync_channel::<Vec<u8>>(200);

    let output_idx: Option<usize> = output_device_id.as_deref().and_then(|id| {
        id.strip_prefix("dev_").and_then(|n| n.parse::<usize>().ok())
    });

    let _ = app.emit("dubbing_log", format!(
        "[SYS] Starting real dubbing pipeline. Target lang: {}",
        target_language
    ));
    let _ = app.emit("dubbing_status", "connecting");

    let mut pid_to_capture = 0;
    if let Some(ref id) = app_id {
        if let Ok(pid) = id.parse::<u32>() {
            pid_to_capture = pid;
        }
    }

    start_loopback_capture(pcm_tx, Arc::clone(&stop), app.clone(), pid_to_capture);

    start_cpal_playback(
        playback_rx,
        Arc::clone(&stop),
        dubbed_volume,
        is_dubbed_muted,
        output_idx,
        app.clone(),
    );

    let stop_gemini = Arc::clone(&stop);
    let app_gemini = app.clone();

    let gemini_model = model.unwrap_or_else(|| "gemini-3.5-live-translate-preview".to_string());

    tokio::spawn(async move {
        let _ = app_gemini.emit("dubbing_log", "[GEMINI] Connecting to Gemini Live WebSocket...");
        match run_gemini_live_session(
            api_key,
            target_language,
            gemini_model,
            pcm_rx,
            playback_tx,
            stop_gemini,
            app_gemini.clone(),
        )
        .await
        {
            Ok(_) => {
                let _ = app_gemini.emit("dubbing_log", "[GEMINI] Session ended cleanly");
                let _ = app_gemini.emit("dubbing_status", "ready");
            }
            Err(e) => {
                let _ = app_gemini.emit("dubbing_log", format!("[ERROR] Gemini session error: {}", e));
                let _ = app_gemini.emit("dubbing_status", "error");
                let _ = app_gemini.emit("dubbing_error", e.to_string());
            }
        }
    });

    Ok(true)
}

#[tauri::command]
pub async fn stop_dubbing(state: State<'_, AppState>) -> Result<bool, DublyError> {
    state.pipeline_stop.store(true, Ordering::SeqCst);
    *state.is_dubbing_active.lock().unwrap() = false;
    Ok(true)
}

#[tauri::command]
pub async fn update_audio_volumes(
    dubbed_volume: f32,
    is_dubbed_muted: bool,
    state: State<'_, AppState>,
) -> Result<bool, DublyError> {
    *state.dubbed_volume.lock().unwrap() = dubbed_volume / 100.0;
    *state.is_dubbed_muted.lock().unwrap() = is_dubbed_muted;
    Ok(true)
}
