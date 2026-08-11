use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiVoiceConfig {
    pub voice_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiPrebuiltVoice {
    pub prebuilt_voice_config: GeminiVoiceConfig,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiSpeechConfig {
    pub voice_config: GeminiPrebuiltVoice,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiGenerationConfig {
    pub response_modalities: Vec<String>,
    pub speech_config: GeminiSpeechConfig,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeminiTextPart {
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeminiSystemInstruction {
    pub parts: Vec<GeminiTextPart>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiSetup {
    pub model: String,
    pub generation_config: GeminiGenerationConfig,
    pub system_instruction: GeminiSystemInstruction,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeminiSetupMessage {
    pub setup: GeminiSetup,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiMediaChunk {
    pub mime_type: String,
    pub data: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiRealtimeInput {
    pub media_chunks: Vec<GeminiMediaChunk>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiAudioInputMessage {
    pub realtime_input: GeminiRealtimeInput,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiInlineData {
    pub mime_type: String,
    pub data: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiPart {
    pub inline_data: Option<GeminiInlineData>,
    pub text: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiModelTurn {
    pub parts: Vec<GeminiPart>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiServerContent {
    pub model_turn: Option<GeminiModelTurn>,
    pub turn_complete: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiServerMessage {
    pub server_content: Option<GeminiServerContent>,
    pub setup_complete: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiSetupConfig {
    pub model: String,
    pub source_language: String,
    pub target_language: String,
}
