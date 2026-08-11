pub mod audio;
pub mod commands;
pub mod errors;
pub mod gemini;
pub mod platform;
pub mod state;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            commands::get_audio_applications,
            commands::get_output_devices,
            commands::start_dubbing,
            commands::stop_dubbing,
            commands::update_audio_volumes,
            commands::get_gemini_model,
            commands::get_system_platform,
            commands::test_gemini_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running dubly tauri application");
}
