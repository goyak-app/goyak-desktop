use crate::errors::DublyError;
use crate::gemini::protocol::{
    GeminiAudioInputMessage, GeminiGenerationConfig, GeminiMediaChunk, GeminiPrebuiltVoice,
    GeminiRealtimeInput, GeminiServerMessage, GeminiSetup, GeminiSetupMessage,
    GeminiSpeechConfig, GeminiSystemInstruction, GeminiTextPart, GeminiVoiceConfig,
};
use base64::{engine::general_purpose, Engine as _};
use futures_util::{SinkExt, StreamExt};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::Emitter;
use tokio::sync::mpsc;
use tokio_tungstenite::{connect_async, tungstenite::Message};

pub const GEMINI_LIVE_MODEL: &str = "gemini-3.5-live-translate-preview";

const GEMINI_WS_URL: &str = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

fn target_lang_name(code: &str) -> &'static str {
    match code {
        "fa" => "Persian (Farsi)",
        "en" => "English",
        "es" => "Spanish",
        "fr" => "French",
        "de" => "German",
        "ar" => "Arabic",
        "zh" => "Chinese (Mandarin)",
        "ja" => "Japanese",
        "ko" => "Korean",
        "ru" => "Russian",
        "tr" => "Turkish",
        _ => "Persian (Farsi)",
    }
}

pub async fn run_gemini_live_session(
    api_key: String,
    target_language: String,
    model: String,
    voice_tone: Option<String>,
    voice_vibe: Option<String>,
    mut pcm_rx: mpsc::Receiver<Vec<u8>>,
    playback_tx: std::sync::mpsc::SyncSender<Vec<u8>>,
    stop: Arc<AtomicBool>,
    app: tauri::AppHandle,
) -> Result<(), DublyError> {
    let url = format!("{}?key={}", GEMINI_WS_URL, api_key);

    let (ws_stream, _) = connect_async(&url)
        .await
        .map_err(|e| DublyError::GeminiConnectionError(e.to_string()))?;

    let _ = app.emit("dubbing_log", format!("[GEMINI] WebSocket connected to Gemini Live API"));

    let (mut ws_write, mut ws_read) = ws_stream.split();

    let lang_name = target_lang_name(&target_language);

    let tone_str = voice_tone.as_deref().unwrap_or("natural");
    let vibe_str = voice_vibe.as_deref().unwrap_or("gaming");

    let tone_instruction = match tone_str {
        "energetic" => "Adopt an energetic, enthusiastic, and high-octane delivery style with expressive vocal peaks.",
        "calm" => "Adopt a calm, relaxed, gentle, and articulate delivery style with steady pacing.",
        "dramatic" => "Adopt a dramatic, intense, cinematic, and movie-trailer style voice full of emotion.",
        "funny" => "Adopt a playful, humorous, witty, and upbeat cartoon-like voice tone.",
        _ => "Adopt a natural, clear, and balanced human dubbing voice tone.",
    };

    let vibe_instruction = match vibe_str {
        "gaming" => "Context: Gaming & Esports stream. Speak like an excited gaming commentator or streamer.",
        "movies" => "Context: Movie or TV series dubbing. Match character acting, cinema drama, and theatrical dialogue.",
        "anime" => "Context: Anime & Cartoon dubbing. Use dynamic character voice acting with high emotion.",
        "podcast" => "Context: Podcast & Talkshow. Speak in a warm, personable, conversational podcast host style.",
        "vlog" => "Context: Vlog & Content creation. Speak in a friendly, engaging, casual vlogger tone.",
        "educational" => "Context: Educational documentary or tutorial. Speak clearly, authoritatively, and articulately.",
        _ => "Context: General dubbing. Maintain natural content flow.",
    };

    let system_prompt = format!(
        r#"
You are a real-time AI dubbing voice actor and translator.

Translate input audio into {language}.
Output ONLY the translated speech audio.

Voice Style & Tone Guidelines:
- {tone_instruction}
- {vibe_instruction}

Core Rules:
- Speak like a professional voice actor.
- Match emotional peaks, laughter, tension, and excitement of original speakers.
- Maintain consistent voice identity, speed, and character.
- Do NOT add commentary, explanations, or meta text.

Names & Technical Terms Rule
Keep brand names, product names, technologies, programming terms, acronyms, and other proper nouns in their original language.
Do not translate them unless a widely accepted translation exists in the target language.
 terms like: Docker, Kubernetes, GitHub, JavaScript, TypeScript, Node.js, React, API, SDK, SQL, MongoDB, Redis, AWS, Gemini, Goyak, Windows, Tauri.

Make the dubbing sound authentic, immersive, and natural!
"#,
        language = lang_name,
        tone_instruction = tone_instruction,
        vibe_instruction = vibe_instruction
    );

    let model_full = if model.starts_with("models/") {
        model.clone()
    } else {
        format!("models/{}", model)
    };

    let setup_msg = GeminiSetupMessage {
        setup: GeminiSetup {
            model: model_full.clone(),
            generation_config: GeminiGenerationConfig {
                response_modalities: vec!["AUDIO".to_string()],
                speech_config: GeminiSpeechConfig {
                    voice_config: GeminiPrebuiltVoice {
                        prebuilt_voice_config: GeminiVoiceConfig {
                            voice_name: "Aoede".to_string(),
                        },
                    },
                },
            },
            system_instruction: GeminiSystemInstruction {
                parts: vec![GeminiTextPart { text: system_prompt }],
            },
        },
    };

    let setup_json = serde_json::to_string(&setup_msg)
        .map_err(|e| DublyError::IpcError(e.to_string()))?;

    ws_write
        .send(Message::Text(setup_json))
        .await
        .map_err(|e| DublyError::GeminiConnectionError(e.to_string()))?;

    while let Some(msg) = ws_read.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&text) {
                    if parsed.get("setupComplete").is_some() {
                        let _ = app.emit("dubbing_log", "[GEMINI] Setup complete. Streaming audio...");
                        let _ = app.emit("dubbing_status", "playing");
                        break;
                    }
                }
            }
            Ok(Message::Binary(bin)) => {
                if let Ok(text) = String::from_utf8(bin) {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&text) {
                        if parsed.get("setupComplete").is_some() {
                            let _ = app.emit("dubbing_log", "[GEMINI] Setup complete. Streaming audio...");
                            let _ = app.emit("dubbing_status", "playing");
                            break;
                        }
                    }
                }
            }
            Ok(Message::Close(_)) => {
                return Err(DublyError::GeminiConnectionError(
                    "WebSocket closed before setup completed".to_string(),
                ));
            }
            Ok(Message::Ping(_)) | Ok(Message::Pong(_)) => {}
            Ok(msg) => {
                let _ = app.emit("dubbing_log", format!("[GEMINI] Unexpected setup frame: {:?}", msg));
            }
            Err(e) => {
                return Err(DublyError::GeminiConnectionError(format!("WS read error: {}", e)));
            }
        }
    }

    let stop_sender = stop.clone();
    let app_sender = app.clone();
    let mut ws_write = ws_write;

    let sender_task = tokio::spawn(async move {
        while !stop_sender.load(Ordering::Relaxed) {
            match tokio::time::timeout(
                std::time::Duration::from_millis(200),
                pcm_rx.recv(),
            )
            .await
            {
                Ok(Some(pcm_bytes)) => {
                    let b64 = general_purpose::STANDARD.encode(&pcm_bytes);
                    let audio_msg = GeminiAudioInputMessage {
                        realtime_input: GeminiRealtimeInput {
                            media_chunks: vec![GeminiMediaChunk {
                                mime_type: "audio/pcm;rate=16000".to_string(),
                                data: b64,
                            }],
                        },
                    };
                    if let Ok(json) = serde_json::to_string(&audio_msg) {
                        if ws_write.send(Message::Text(json)).await.is_err() {
                            break;
                        }
                        let _ = app_sender.emit("dubbing_log", "[STREAM] PCM chunk sent to Gemini Live");
                    }
                }
                Ok(None) => break,
                Err(_) => {}
            }
        }
    });

    while let Some(msg) = ws_read.next().await {
        if stop.load(Ordering::Relaxed) {
            break;
        }
        let text_payload = match msg {
            Ok(Message::Text(text)) => Some(text),
            Ok(Message::Binary(bin)) => String::from_utf8(bin).ok(),
            _ => None,
        };

        if let Some(text) = text_payload {
            if let Ok(server_msg) = serde_json::from_str::<GeminiServerMessage>(&text) {
                if let Some(server_content) = server_msg.server_content {
                    if let Some(model_turn) = server_content.model_turn {
                        for part in model_turn.parts {
                            if let Some(inline_data) = part.inline_data {
                                if let Ok(pcm_bytes) = general_purpose::STANDARD.decode(&inline_data.data) {
                                    let _ = app.emit("dubbing_log", format!(
                                        "[PLAYBACK] Received translated audio chunk ({} bytes)",
                                        pcm_bytes.len()
                                    ));
                                    let _ = playback_tx.try_send(pcm_bytes);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    sender_task.abort();
    Ok(())
}
