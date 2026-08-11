use crate::errors::DublyError;
use crate::state::{AudioAppInfo, AudioDeviceInfo};

pub struct MacOSAudioCapture;

impl MacOSAudioCapture {
    pub fn new() -> Self {
        Self
    }

    pub fn list_applications(&self) -> Result<Vec<AudioAppInfo>, DublyError> {
        Ok(vec![
            AudioAppInfo {
                id: "chrome".to_string(),
                name: "Google Chrome".to_string(),
                process_id: 101,
                is_audio_active: true,
            },
            AudioAppInfo {
                id: "safari".to_string(),
                name: "Safari".to_string(),
                process_id: 202,
                is_audio_active: false,
            },
        ])
    }

    pub fn list_output_devices(&self) -> Result<Vec<AudioDeviceInfo>, DublyError> {
        Ok(vec![AudioDeviceInfo {
            id: "default".to_string(),
            name: "MacBook Pro Speakers".to_string(),
            is_default: true,
        }])
    }
}
