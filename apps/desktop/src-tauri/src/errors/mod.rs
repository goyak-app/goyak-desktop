use thiserror::Error;

#[derive(Error, Debug)]
pub enum DublyError {
    #[error("Audio device error: {0}")]
    AudioDeviceError(String),

    #[error("Gemini API connection error: {0}")]
    GeminiConnectionError(String),

    #[error("Platform unsupported operation: {0}")]
    PlatformError(String),

    #[error("Audio format conversion error: {0}")]
    PcmConversionError(String),

    #[error("IPC command error: {0}")]
    IpcError(String),
}

impl serde::Serialize for DublyError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
