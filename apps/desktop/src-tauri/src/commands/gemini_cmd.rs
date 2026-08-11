use crate::errors::DublyError;
use crate::gemini::GEMINI_LIVE_MODEL;

#[tauri::command]
pub async fn get_gemini_model() -> Result<String, DublyError> {
    Ok(GEMINI_LIVE_MODEL.to_string())
}
