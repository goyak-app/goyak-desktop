import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sliders, Volume2, Globe, Key, ShieldCheck, Check, Wifi, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SUPPORTED_UI_LANGUAGES } from '@dubly/shared';
import { useSettingsStore } from '../../stores/settingsStore';
import { testGeminiConnection } from '../../lib/tauri';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'gemini'>('general');
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey);
  const [modelInput, setModelInput] = useState(settings.geminiModel);
  const [isSaved, setIsSaved] = useState(false);

  const [testState, setTestState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings({ geminiApiKey: apiKeyInput, geminiModel: modelInput });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestState('error');
      setTestMessage('API Key is empty. Enter your key first.');
      return;
    }
    setTestState('loading');
    setTestMessage('');
    try {
      const result = await testGeminiConnection(apiKeyInput.trim(), modelInput.trim());
      setTestState('success');
      setTestMessage(result);
    } catch (e: any) {
      setTestState('error');
      setTestMessage(String(e));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="h-14 px-6 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center space-x-2 rtl:space-x-reverse font-bold text-white text-base">
            <Sliders className="w-5 h-5 text-violet-400" />
            <span>{t('settings.title')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-48 bg-secondary/20 border-r rtl:border-r-0 rtl:border-l border-border p-2 flex md:flex-col space-x-1 md:space-x-0 md:space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center space-x-2.5 rtl:space-x-reverse px-3 py-2.5 rounded-lg text-xs font-semibold w-full transition-all ${activeTab === 'general'
                  ? 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:text-white hover:bg-secondary/60'
                }`}
            >
              <Globe className="w-4 h-4" />
              <span>{t('settings.general')}</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center space-x-2.5 rtl:space-x-reverse px-3 py-2.5 rounded-lg text-xs font-semibold w-full transition-all ${activeTab === 'audio'
                  ? 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:text-white hover:bg-secondary/60'
                }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{t('settings.audio')}</span>
            </button>

            <button
              onClick={() => setActiveTab('gemini')}
              className={`flex items-center space-x-2.5 rtl:space-x-reverse px-3 py-2.5 rounded-lg text-xs font-semibold w-full transition-all ${activeTab === 'gemini'
                  ? 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:text-white hover:bg-secondary/60'
                }`}
            >
              <Key className="w-4 h-4" />
              <span>{t('settings.gemini')}</span>
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white block">
                    {t('settings.appLanguage')}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.appLanguageDesc')}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {SUPPORTED_UI_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => updateSettings({ uiLanguage: lang.code as 'en' | 'fa' })}
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs font-semibold transition-all ${i18n.language === lang.code
                            ? 'bg-violet-600/20 border-violet-500 text-white'
                            : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary'
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {i18n.language === lang.code && <Check className="w-4 h-4 text-violet-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">{t('settings.minimizeToTray')}</div>
                      <div className="text-[11px] text-muted-foreground">Keep Dubly running in system tray when window is closed</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.minimizeToTray}
                      onChange={(e) => updateSettings({ minimizeToTray: e.target.checked })}
                      className="w-4 h-4 rounded accent-violet-600 bg-secondary border-border"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">{t('settings.launchAtStartup')}</div>
                      <div className="text-[11px] text-muted-foreground">Automatically launch Dubly when system boots</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.launchAtStartup}
                      onChange={(e) => updateSettings({ launchAtStartup: e.target.checked })}
                      className="w-4 h-4 rounded accent-violet-600 bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white block">
                    {t('settings.bufferSize')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { ms: 50, label: t('settings.lowLatency') },
                      { ms: 100, label: t('settings.balanced') },
                      { ms: 200, label: t('settings.highQuality') },
                    ].map((opt) => (
                      <button
                        key={opt.ms}
                        onClick={() => updateSettings({ bufferLatencyMs: opt.ms })}
                        className={`p-3 rounded-lg border text-center text-xs font-semibold transition-all ${settings.bufferLatencyMs === opt.ms
                            ? 'bg-violet-600 border-violet-500 text-white'
                            : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gemini' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white block">
                    Gemini Model Name
                  </label>
                  <input
                    type="text"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    placeholder="gemini-3.5-live-translate-preview"
                    className="w-full bg-secondary border border-border text-white text-xs font-mono rounded-lg p-3 focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Without <span className="font-mono text-violet-400">models/</span> prefix — it will be added automatically.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white block">
                    {t('settings.apiKey')}
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={t('settings.apiKeyPlaceholder')}
                    className="w-full bg-secondary border border-border text-white text-xs rounded-lg p-3 focus:outline-none focus:border-violet-500"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('settings.apiKeyNote')}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    id="test-connection-btn"
                    onClick={handleTestConnection}
                    disabled={testState === 'loading'}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full justify-center"
                  >
                    {testState === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wifi className="w-4 h-4 text-violet-400" />
                    )}
                    {testState === 'loading' ? 'Testing Connection...' : 'Test Gemini Connection'}
                  </button>

                  {testState === 'success' && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-[11px] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{testMessage}</span>
                    </div>
                  )}

                  {testState === 'error' && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-[11px] leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{testMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-16 px-6 border-t border-border flex items-center justify-between bg-secondary/30">
          {isSaved ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Settings Saved!
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-zinc-800 border border-border text-xs font-semibold transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md transition-colors"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
