pub mod linux;
pub mod macos;
pub mod pcm;
pub mod stream;
pub mod windows;

use crate::errors::DublyError;
use crate::state::{AudioAppInfo, AudioDeviceInfo};

pub use windows::{start_cpal_playback, start_loopback_capture};

pub trait AudioSource {
    fn list_applications(&self) -> Result<Vec<AudioAppInfo>, DublyError>;
    fn list_output_devices(&self) -> Result<Vec<AudioDeviceInfo>, DublyError>;
}

pub struct PlatformAudioEngine;

impl PlatformAudioEngine {
    pub fn get_applications() -> Result<Vec<AudioAppInfo>, DublyError> {
        #[cfg(target_os = "windows")]
        {
            let capture = windows::WindowsAudioCapture::new();
            return capture.list_applications();
        }

        #[cfg(target_os = "macos")]
        {
            let capture = macos::MacOSAudioCapture::new();
            return capture.list_applications();
        }

        #[cfg(target_os = "linux")]
        {
            let capture = linux::LinuxPipeWireCapture::new();
            return capture.list_applications();
        }

        #[allow(unreachable_code)]
        Ok(vec![])
    }

    pub fn get_output_devices() -> Result<Vec<AudioDeviceInfo>, DublyError> {
        #[cfg(target_os = "windows")]
        {
            let capture = windows::WindowsAudioCapture::new();
            return capture.list_output_devices();
        }

        #[cfg(target_os = "macos")]
        {
            let capture = macos::MacOSAudioCapture::new();
            return capture.list_output_devices();
        }

        #[cfg(target_os = "linux")]
        {
            let capture = linux::LinuxPipeWireCapture::new();
            return capture.list_output_devices();
        }

        #[allow(unreachable_code)]
        Ok(vec![])
    }
}
