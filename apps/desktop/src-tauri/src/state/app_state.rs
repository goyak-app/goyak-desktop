use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::sync::atomic::AtomicBool;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioAppInfo {
    pub id: String,
    pub name: String,
    pub process_id: u32,
    pub is_audio_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDeviceInfo {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}

pub struct AppState {
    pub is_dubbing_active: Arc<Mutex<bool>>,
    pub current_source_type: Arc<Mutex<String>>,
    pub selected_app_id: Arc<Mutex<Option<String>>>,
    pub source_language: Arc<Mutex<String>>,
    pub target_language: Arc<Mutex<String>>,
    pub original_volume: Arc<Mutex<f32>>,
    pub dubbed_volume: Arc<Mutex<f32>>,
    pub is_original_muted: Arc<Mutex<bool>>,
    pub is_dubbed_muted: Arc<Mutex<bool>>,
    pub pipeline_stop: Arc<AtomicBool>,
    pub api_key: Arc<Mutex<String>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            is_dubbing_active: Arc::new(Mutex::new(false)),
            current_source_type: Arc::new(Mutex::new("application".to_string())),
            selected_app_id: Arc::new(Mutex::new(Some("chrome".to_string()))),
            source_language: Arc::new(Mutex::new("auto".to_string())),
            target_language: Arc::new(Mutex::new("fa".to_string())),
            original_volume: Arc::new(Mutex::new(0.65)),
            dubbed_volume: Arc::new(Mutex::new(0.85)),
            is_original_muted: Arc::new(Mutex::new(false)),
            is_dubbed_muted: Arc::new(Mutex::new(false)),
            pipeline_stop: Arc::new(AtomicBool::new(false)),
            api_key: Arc::new(Mutex::new(String::new())),
        }
    }
}
