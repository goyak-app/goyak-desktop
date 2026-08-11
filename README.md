# Dubly — AI Real-Time Dubbing & Live Translation Desktop Application

Dubly is a cross-platform desktop application that provides real-time AI audio dubbing and live translation for system and application audio.

```text
System / Application Audio
        ↓
Audio Capture (WASAPI / PipeWire / CoreAudio)
        ↓
Gemini Live Translate API (gemini-3.5-live-translate-preview)
        ↓
Translated Audio Stream
        ↓
User Headphones / Speakers
```

## Features

- **Real-Time Streaming Dubbing**: Continuous real-time translation without record-upload-playback delay.
- **Audio Source Selection**: Capture entire system audio or isolate specific application audio (e.g. Chrome, Spotify, VLC).
- **Independent UI & Audio Languages**: Separate UI language settings (English, Persian) from Audio Translation target language (Persian, English, Spanish, French, etc.).
- **First-Launch Onboarding**: Clean, friendly UI language onboarding modal saved locally.
- **Native Performance**: Rust native core for ultra-low latency audio processing and zero UI thread blocking.
- **System Tray Support**: Run seamlessly in the background with quick pause/stop tray controls.
- **Privacy & Security**: Ephemeral audio streaming without local storage or secret leaks.

## Architecture

Dubly uses a monorepo structure built with Tauri 2 and modern web technologies:

- **Frontend**: React, TypeScript, Vite, Tailwind CSS (solid dark aesthetic), Lucide React, i18next.
- **Backend**: Rust, Tauri 2 IPC, `cpal` / `wasapi` audio loopback, `tokio-tungstenite` WebSockets.
- **AI Model**: `gemini-3.5-live-translate-preview` via Google Gemini Live API.

```text
dubly/
├── apps/
│   └── desktop/
│       ├── src/          # React + TypeScript + i18next + Tailwind CSS
│       └── src-tauri/    # Rust Native Audio Capture & Gemini Streaming Engine
├── packages/
│   └── shared/           # Common types and constants
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── SECURITY.md
```

## Prerequisites

- **Bun**: `bun` v1.0+
- **Rust**: `rustc` and `cargo` v1.75+ (for building native Tauri binary)
- **C++ Build Tools**: MSVC (Windows) / Xcode CLI Tools (macOS) / `build-essential` & `libasound2-dev` (Linux)

## Development Setup

```bash
bun install
bun run dev
```

To run the Tauri desktop app:

```bash
cd apps/desktop
bun tauri dev
```

## Supported Platforms

- **Windows**: WASAPI system loopback and audio session discovery (Primary supported platform)
- **macOS**: CoreAudio / ScreenCaptureKit native audio capture
- **Linux**: PipeWire audio capture architecture

## Privacy & Security

- Audio is processed directly in memory and streamed via encrypted WebSockets to the Gemini Live API.
- Raw captured audio is never stored on disk or sent to third-party analytics.
- Client applications use short-lived authentication tokens.

## License

[MIT License](LICENSE)
