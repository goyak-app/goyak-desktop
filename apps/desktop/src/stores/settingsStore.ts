import { useState, useEffect } from 'react';
import { AppSettings } from '../types/settings';
import i18n from '../i18n';

const SETTINGS_KEY = 'dubly_app_settings';

const defaultSettings: AppSettings = {
  uiLanguage: (localStorage.getItem('dubly_ui_language') as 'en' | 'fa') || 'en',
  theme: 'dark',
  launchAtStartup: false,
  minimizeToTray: true,
  startAutoDubbing: false,
  outputDeviceId: 'default',
  dubbedVolume: 85,
  isDubbedMuted: false,
  sourceLanguage: 'auto',
  targetLanguage: 'fa',
  geminiApiKey: '',
  geminiModel: 'gemini-3.5-live-translate-preview',
  bufferLatencyMs: 100,
  hasCompletedOnboarding: localStorage.getItem('dubly_onboarded') === 'true',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed };
    }
  } catch (e) {}
  return defaultSettings;
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = loadSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  if (settings.uiLanguage) {
    localStorage.setItem('dubly_ui_language', settings.uiLanguage);
    i18n.changeLanguage(settings.uiLanguage);
  }
  if (settings.hasCompletedOnboarding !== undefined) {
    localStorage.setItem('dubly_onboarded', String(settings.hasCompletedOnboarding));
  }
  return updated;
}

export function useSettingsStore() {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings());

  useEffect(() => {
    const handleStorage = () => {
      setSettingsState(loadSettings());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = saveSettings(newSettings);
    setSettingsState(updated);
  };

  return {
    settings,
    updateSettings,
  };
}
