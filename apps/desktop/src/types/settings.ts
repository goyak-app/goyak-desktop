export interface AppSettings {
  uiLanguage: 'en' | 'fa';
  theme: 'dark' | 'light';
  launchAtStartup: boolean;
  minimizeToTray: boolean;
  startAutoDubbing: boolean;
  outputDeviceId: string;
  originalVolume: number;
  dubbedVolume: number;
  isOriginalMuted: boolean;
  isDubbedMuted: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  geminiApiKey: string;
  bufferLatencyMs: number;
  hasCompletedOnboarding: boolean;
}
