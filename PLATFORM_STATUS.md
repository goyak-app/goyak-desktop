# Goyak — Cross-Platform Support Status & Roadmap

This document details the current implementation status, technical architecture, and requirement roadmap for **macOS** and **Linux** support in Goyak.

---

## 📊 Platform Support Matrix

| Operating System | Status | Audio Capture Engine | Process Isolation | Packaging | CI/CD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Windows 10/11 (x64)** | 🟢 Production Ready | WASAPI Loopback (`cpal` + Win32 COM) | 🟢 Process Volume & Loopback Hooks | `.msi`, `.exe` (NSIS) | 🟢 Active |
| **macOS (Apple Silicon & Intel)** | 🟡 In Development | CoreAudio / Mock API | 🟡 Requires ScreenCaptureKit | `.dmg`, `.app` | 🔴 Planned |
| **Linux (x64)** | 🟡 In Development | PipeWire / Mock API | 🟡 Requires PipeWire Node Monitors | `.AppImage`, `.deb` | 🔴 Planned |

---

## 🍏 macOS Support Status & Requirements

### Current State
- The frontend UI supports macOS layout conventions.
- Rust audio module (`src-tauri/src/audio/macos.rs`) currently provides mock device and application listings for testing.

### Technical Requirements for Full macOS Support

1. **Audio Capture Engine**:
   - **macOS 13.0+ (Ventura and newer)**: Implement native process audio capture via **ScreenCaptureKit** (`SCStream` audio capture API). This allows process-specific and system audio capture without needing virtual audio drivers.
   - **macOS 12 and older (Fallback)**: Implement loopback capture using **BlackHole** (2ch/16ch) or CoreAudio HAL Audio Objects (`AudioObjectGetPropertyData`).
   - Crate / Dependency candidates: `screencapturekit` or custom Objective-C/Swift bindings via `objc2`.

2. **System Permissions & Entitlements**:
   - Add `NSAudioCaptureUsageDescription` and `NSScreenCaptureUsageDescription` in `Info.plist`.
   - Request runtime permissions for Audio & Screen Recording on macOS.

3. **Packaging & Code Signing**:
   - Configure Apple Developer ID signing & Notarization (`xcrun notarytool`).
   - Generate `.dmg` and bundle `.app` targets via Tauri bundle settings.

4. **CI/CD Workflow**:
   - Extend `.github/workflows/release.yml` with a `macos-latest` runner job.

---

## 🐧 Linux Support Status & Requirements

### Current State
- The frontend UI is fully compatible with Linux desktop environments (GNOME, KDE Plasma, X11, Wayland).
- Rust audio module (`src-tauri/src/audio/linux.rs`) currently provides mock audio sink listings.

### Technical Requirements for Full Linux Support

1. **Audio Capture Engine**:
   - **PipeWire (Recommended)**: Implement `libpipewire` / `pipewire-rs` stream API (`pw_stream`) to hook into PipeWire audio nodes and capture application output monitors dynamically.
   - **PulseAudio (Fallback)**: Implement PulseAudio monitor sink capture via `libpulse-binding` or `parec`.

2. **System Build Dependencies**:
   To compile Goyak on Linux distributions (Debian/Ubuntu/Fedora/Arch), the following packages are required:
   ```bash
   # Debian / Ubuntu
   sudo apt update
   sudo apt install -y build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libasound2-dev libpipewire-0.3-dev libpulse-dev

   # Fedora
   sudo dnf install -y gcc-c++ openssl-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel alsa-lib-devel pipewire-devel pulseaudio-libs-devel

   # Arch Linux
   sudo pacman -S --needed base-devel openssl gtk3 libappindicator-gtk3 librsvg alsa-lib pipewire libpulse
   ```

3. **Packaging & CI/CD**:
   - Generate `.AppImage` and `.deb` binaries via Tauri CLI:
     ```bash
     bun run build -- --target appimage,deb
     ```
   - Extend `.github/workflows/release.yml` with an `ubuntu-latest` runner job.

---

## 🤝 Contributing to macOS or Linux Support

If you want to help implement native audio capture for macOS or Linux:

1. Check the Rust audio architecture in `apps/desktop/src-tauri/src/audio/`.
2. Implement the `AudioSource` trait for `MacOSAudioCapture` or `LinuxPipeWireCapture`.
3. Submit a Pull Request targeting the `main` branch.
