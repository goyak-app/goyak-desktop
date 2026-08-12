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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[75vh]">
        <div className="h-12 px-2 border-b border-border/50 flex items-center justify-between bg-card">
          <div className="flex items-center space-x-2 rtl:space-x-reverse font-bold text-white text-md">
            <Sliders className="w-4 h-4 text-muted-foreground" />
            <span>{t('settings.title')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-64 bg-secondary/20 border-r rtl:border-r-0 rtl:border-l border-border/50 p-4 flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl text-sm font-semibold w-full transition-all shrink-0 ${activeTab === 'general'
                ? 'bg-white text-black shadow-sm'
                : 'text-muted-foreground hover:text-white hover:bg-secondary/60'
                }`}
            >
              <Globe className="w-5 h-5" />
              <span>{t('settings.general')}</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl text-sm font-semibold w-full transition-all shrink-0 ${activeTab === 'audio'
                ? 'bg-white text-black shadow-sm'
                : 'text-muted-foreground hover:text-white hover:bg-secondary/60'
                }`}
            >
              <Volume2 className="w-5 h-5" />
              <span>{t('settings.audio')}</span>
            </button>

            <button
              onClick={() => setActiveTab('gemini')}
              className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl text-sm font-semibold w-full transition-all shrink-0 ${activeTab === 'gemini'
                ? 'bg-white text-black shadow-sm'
                : 'text-muted-foreground hover:text-white hover:bg-secondary/60'
                }`}
            >
              <Key className="w-5 h-5" />
              <span>{t('settings.gemini')}</span>
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-background/50">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white block">
                    {t('settings.appLanguage')}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.appLanguageDesc')}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {SUPPORTED_UI_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => updateSettings({ uiLanguage: lang.code as 'en' | 'fa' })}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 text-sm font-semibold transition-all ${i18n.language === lang.code
                          ? 'bg-white text-black border-white shadow-soft'
                          : 'bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-white'
                          }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {i18n.language === lang.code && <Check className="w-5 h-5 text-black" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white">{t('settings.minimizeToTray')}</div>
                      <div className="text-xs text-muted-foreground">{t('settings.minimizeToTrayDesc')}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.minimizeToTray}
                        onChange={(e) => updateSettings({ minimizeToTray: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white">{t('settings.launchAtStartup')}</div>
                      <div className="text-xs text-muted-foreground">{t('settings.launchAtStartupDesc')}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.launchAtStartup}
                        onChange={(e) => updateSettings({ launchAtStartup: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white block">
                    {t('settings.bufferSize')}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.bufferSizeDesc')}
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { ms: 50, label: t('settings.lowLatency') },
                      { ms: 100, label: t('settings.balanced') },
                      { ms: 200, label: t('settings.highQuality') },
                    ].map((opt) => (
                      <button
                        key={opt.ms}
                        onClick={() => updateSettings({ bufferLatencyMs: opt.ms })}
                        className={`p-4 rounded-xl border-2 text-center text-sm font-semibold transition-all ${settings.bufferLatencyMs === opt.ms
                          ? 'bg-white text-black border-white shadow-soft'
                          : 'bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-white'
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
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white block">
                    {t('settings.model')}
                  </label>
                  <input
                    type="text"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    placeholder="gemini-3.5-live-translate-preview"
                    className="w-full bg-secondary/50 border border-border text-white text-sm font-mono rounded-xl p-4 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <p
                    className="text-xs text-muted-foreground pt-1"
                    dangerouslySetInnerHTML={{ __html: t('settings.modelDesc') }}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-sm font-semibold text-white block">
                    {t('settings.apiKey')}
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={t('settings.apiKeyPlaceholder')}
                    className="w-full bg-secondary/50 border border-border text-white text-sm font-mono rounded-xl p-4 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>{t('settings.apiKeyNote')}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-border/50">
                  <button
                    id="test-connection-btn"
                    onClick={handleTestConnection}
                    disabled={testState === 'loading'}
                    className="flex items-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-bold shadow-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full justify-center"
                  >
                    {testState === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Wifi className="w-5 h-5" />
                    )}
                    {testState === 'loading' ? t('settings.testingConnection') : t('settings.testConnection')}
                  </button>

                  {testState === 'success' && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium leading-relaxed">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>{testMessage}</span>
                    </div>
                  )}

                  {testState === 'error' && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium leading-relaxed">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{testMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-12 px-8 border-t border-border/50 flex items-center justify-between bg-card">
          {isSaved ? (
            <span className="text-sm text-emerald-400 font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2">
              <Check className="w-5 h-5" /> Settings Saved
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-secondary text-foreground hover:bg-zinc-800 text-sm font-bold transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-premium transition-transform active:scale-95"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
