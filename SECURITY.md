# Security Policy

## Reporting Security Issues

If you discover a security vulnerability within Dubly, please report it via security advisory or directly to the maintainers. Do not open public issues for sensitive security vulnerabilities.

## Security Architecture

- **No Hardcoded Secrets**: The client application does not store permanent production API keys or credentials.
- **Ephemeral Audio Streaming**: Captured audio is held temporarily in RAM buffers for PCM resampling and streamed live to Gemini API without local storage.
- **Least-Privilege Tauri Scope**: Tauri IPC commands are strictly scoped and validated.
