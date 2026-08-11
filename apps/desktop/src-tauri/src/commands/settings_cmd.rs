use crate::errors::DublyError;
use crate::platform::current_platform_name;

#[tauri::command]
pub async fn get_system_platform() -> Result<String, DublyError> {
    Ok(current_platform_name().to_string())
}
