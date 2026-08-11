export type AudioSourceType = 'system' | 'application';

export interface AudioApplicationInfo {
  id: string;
  name: string;
  processId: number;
  icon?: string;
  isAudioActive: boolean;
}

export interface AudioDeviceInfo {
  id: string;
  name: string;
  isDefault: boolean;
}

export type DubbingStatus =
  | 'ready'
  | 'connecting'
  | 'listening'
  | 'translating'
  | 'playing'
  | 'reconnecting'
  | 'error';

export interface DubbingSessionState {
  status: DubbingStatus;
  sourceType: AudioSourceType;
  selectedAppId: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  originalVolume: number;
  dubbedVolume: number;
  isOriginalMuted: boolean;
  isDubbedMuted: boolean;
  outputDeviceId: string;
  latencyMs: number;
  errorMessage: string | null;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_UI_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' }
];

export const SUPPORTED_AUDIO_LANGUAGES: SupportedLanguage[] = [
  { code: 'auto', name: 'Auto Detect', nativeName: 'Auto Detect', flag: '✨' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
];

export const GEMINI_MODEL = 'gemini-3.5-live-translate-preview';
