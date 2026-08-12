# Goyak — AI Real-Time Dubbing & Live Translation Desktop Application

[![GitHub Repository](https://img.shields.io/badge/GitHub-goyak--app%2Fgoyak--desktop-blue?logo=github)](https://github.com/goyak-app/goyak-desktop)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red.svg)](https://github.com/goyak-app/goyak-desktop)
[![Donate](https://img.shields.io/badge/Donate-Coffeete-orange.svg)](https://coffeete.ir/sajjadmrx)

<p align="center">
  <img src=".github/assets/hero-banner.png" alt="Goyak Presentation Banner" width="100%" />
</p>

Goyak is an open-source cross-platform desktop application that provides real-time AI audio dubbing and live translation for system and application audio.

## ✨ Features

- 🎧 **Real-Time System Audio Translation**: Captures and translates audio directly from your system or specific applications.
- 🌐 **Multilingual UI (i18n)**: Fully internationalized with multi-language support (English `en` & Persian/Farsi `fa`), including native support for RTL (Right-to-Left) and LTR (Left-to-Right) layouts.
- ⚡ **High Performance Backend**: Powered by Rust and Tauri 2 for low resource utilization and low-latency audio processing.
- 🎨 **Modern Interface**: Designed with React, Vite, and Tailwind CSS.

## 📥 Downloads & Release Status

| Platform | Status | Download |
| :--- | :--- | :--- |
| **Windows** (x64) | 🟢 Available | [Download Latest Release](https://github.com/goyak-app/goyak-desktop/releases/latest) |
| **macOS** | 🟡 Under Development | Coming Soon |
| **Linux** | 🟡 Under Development | Coming Soon |

## 🛠️ Development & Getting Started

### Prerequisites

- **Bun**: Modern fast JavaScript package manager.
- **Rust**: Latest stable Rust toolchain.
- **Node.js**: v18+ recommended.
- **Tauri v2 Prerequisites**: System dependencies for building Tauri apps.

> [!IMPORTANT]
> **Administrator Privileges Required (Windows)**
> 
> To run the app in development mode, you **MUST** launch your terminal or IDE (VS Code, Windows Terminal, PowerShell, etc.) as **Administrator** (`Run as Administrator`).
> 
> Administrative permissions are required for low-level audio device loopback capture (WASAPI) and virtual audio hooks.

### Local Setup & Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/goyak-app/goyak-desktop.git
   cd goyak-desktop
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Run Desktop Application in Development Mode**:
   > Make sure your terminal is running as **Administrator**.
   ```bash
   bun run dev
   ```

4. **Run Web Interface Only**:
   ```bash
   bun run dev:web
   ```

5. **Typecheck & Build**:
   ```bash
   bun run check
   bun run build
   ```

## 💖 Support & Donate

If you find Goyak useful and would like to support its development, you can donate via Coffeete:

[![Donate Coffeete](https://img.shields.io/badge/Donate-Coffeete-orange?style=for-the-badge&logo=buy-me-a-coffee)](https://coffeete.ir/sajjadmrx)

- ☕ **Coffeete**: [https://coffeete.ir/sajjadmrx](https://coffeete.ir/sajjadmrx)

Your support is greatly appreciated!

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

