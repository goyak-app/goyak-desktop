export interface AppSettings {
  uiLanguage: 'en' | 'fa';
  theme: 'dark' | 'light';
  launchAtStartup: boolean;
  minimizeToTray: boolean;
  startAutoDubbing: boolean;
  outputDeviceId: string;
  dubbedVolume: number;
  isDubbedMuted: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  geminiApiKey: string;
  geminiModel: string;
  bufferLatencyMs: number;
  hasCompletedOnboarding: boolean;
}
