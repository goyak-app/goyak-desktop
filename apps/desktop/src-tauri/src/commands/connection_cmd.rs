use crate::errors::DublyError;
use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::{connect_async, tungstenite::Message};

const GEMINI_WS_BASE: &str = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

#[tauri::command]
pub async fn test_gemini_connection(api_key: String, model: String) -> Result<String, DublyError> {
    if api_key.trim().is_empty() {
        return Err(DublyError::GeminiConnectionError(
            "API key is empty".to_string(),
        ));
    }

    let url = format!("{}?key={}", GEMINI_WS_BASE, api_key.trim());

    let (ws_stream, response) = connect_async(&url).await.map_err(|e| {
        DublyError::GeminiConnectionError(format!("WebSocket handshake failed: {}", e))
    })?;

    let http_status = response.status();

    let (mut write, mut read) = ws_stream.split();

    let model_full = if model.starts_with("models/") {
        model.clone()
    } else {
        format!("models/{}", model)
    };

    let setup = serde_json::json!({
        "setup": {
            "model": model_full,
            "generationConfig": {
                "responseModalities": ["AUDIO"]
            }
        }
    });

    write
        .send(Message::Text(setup.to_string()))
        .await
        .map_err(|e| {
            DublyError::GeminiConnectionError(format!("Failed to send setup: {}", e))
        })?;

    let timeout_result = tokio::time::timeout(
        std::time::Duration::from_secs(10),
        read.next(),
    )
    .await;

    let _ = write.send(Message::Close(None)).await;

    match timeout_result {
        Ok(Some(Ok(Message::Text(text)))) => {
            let text_str = text;
            if text_str.contains("setupComplete") {
                Ok(format!(
                    "✅ Connected! HTTP {}, model '{}' accepted. Gemini Live is ready.",
                    http_status.as_u16(),
                    model_full
                ))
            } else if text_str.to_lowercase().contains("error")
                || text_str.to_lowercase().contains("invalid")
            {
                Err(DublyError::GeminiConnectionError(format!(
                    "API returned error: {}",
                    &text_str[..text_str.len().min(300)]
                )))
            } else {
                Ok(format!(
                    "✅ Connected (HTTP {}). Server response: {}",
                    http_status.as_u16(),
                    &text_str[..text_str.len().min(200)]
                ))
            }
        }
        Ok(Some(Ok(Message::Binary(text)))) => {
            let text_str = String::from_utf8(text).unwrap_or_else(|_| "invalid utf8".to_string());
            if text_str.contains("setupComplete") {
                Ok(format!(
                    "✅ Connected! HTTP {}, model '{}' accepted. Gemini Live is ready.",
                    http_status.as_u16(),
                    model_full
                ))
            } else if text_str.to_lowercase().contains("error")
                || text_str.to_lowercase().contains("invalid")
            {
                Err(DublyError::GeminiConnectionError(format!(
                    "API returned error: {}",
                    &text_str[..text_str.len().min(300)]
                )))
            } else {
                Ok(format!(
                    "✅ Connected (HTTP {}). Server response: {}",
                    http_status.as_u16(),
                    &text_str[..text_str.len().min(200)]
                ))
            }
        }
        Ok(Some(Ok(Message::Close(frame)))) => Err(DublyError::GeminiConnectionError(format!(
            "Server closed connection immediately. Reason: {}",
            frame
                .map(|f| f.reason.to_string())
                .unwrap_or_else(|| "unknown".to_string())
        ))),
        Ok(Some(Err(e))) => Err(DublyError::GeminiConnectionError(format!(
            "WebSocket error after connect: {}",
            e
        ))),
        Ok(None) => Err(DublyError::GeminiConnectionError(
            "Connection closed before receiving any response.".to_string(),
        )),
        Err(_) => Err(DublyError::GeminiConnectionError(format!(
            "Timeout (10s) — no response from Gemini API. Check API key and model name '{}'.",
            model_full
        ))),
        _ => Err(DublyError::GeminiConnectionError(format!(
            "Unexpected message type received from server: {:?}", timeout_result
        ))),
    }
}
