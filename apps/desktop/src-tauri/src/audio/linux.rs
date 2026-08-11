use crate::errors::DublyError;
use crate::state::{AudioAppInfo, AudioDeviceInfo};

pub struct LinuxPipeWireCapture;

impl LinuxPipeWireCapture {
    pub fn new() -> Self {
        Self
    }

    pub fn list_applications(&self) -> Result<Vec<AudioAppInfo>, DublyError> {
        Ok(vec![AudioAppInfo {
            id: "firefox".to_string(),
            name: "Firefox PipeWire Stream".to_string(),
            process_id: 303,
            is_audio_active: true,
        }])
    }

    pub fn list_output_devices(&self) -> Result<Vec<AudioDeviceInfo>, DublyError> {
        Ok(vec![AudioDeviceInfo {
            id: "default".to_string(),
            name: "ALSA / PipeWire Sink".to_string(),
            is_default: true,
        }])
    }
}
