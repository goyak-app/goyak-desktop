import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders, Volume2, Globe, Key, ShieldCheck, Check, Wifi, Loader2, AlertCircle, CheckCircle2, Github, Info, Eye, EyeOff } from 'lucide-react';
import { SUPPORTED_UI_LANGUAGES } from '@dubly/shared';
import { useSettingsStore } from '../../stores/settingsStore';
import { testGeminiConnection, openExternalUrl, fetchAppVersion } from '../../lib/tauri';
import { Modal } from '../ui/Modal';
import MascotImage from '../../assets/mascot.png';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'gemini' | 'about'>('general');
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey);
  const [modelInput, setModelInput] = useState(settings.geminiModel);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('0.1.0');

  useEffect(() => {
    fetchAppVersion().then((ver) => setAppVersion(ver));
  }, []);

  const [testState, setTestState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

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

  const footerContent = (
    <>
      <div>
        {isSaved ? (
          <span className="text-sm text-emerald-400 font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <Check className="w-4 h-4" /> {t('settings.settingsSaved')}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => openExternalUrl('https://github.com/sajjadmrx/goyak')}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>github.com/sajjadmrx/goyak</span>
          </button>
        )}
      </div>
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white text-sm font-semibold transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-bold shadow-lg transition-transform active:scale-95"
        >
          {t('common.save')}
        </button>
      </div>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.title')}
      icon={<Sliders className="w-5 h-5" />}
      size="2xl"
      footer={footerContent}
      bodyClassName="p-0 flex flex-col md:flex-row min-h-[460px]"
    >
      <div className="w-full md:w-64 bg-zinc-950/60 border-b md:border-b-0 md:border-r rtl:md:border-r-0 rtl:md:border-l border-zinc-800 p-4 flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto shrink-0">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl text-sm font-semibold w-full transition-all shrink-0 ${activeTab === 'general'
            ? 'bg-white text-black font-bold shadow-md'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
        >
          <Globe className="w-4 h-4" />
          <span>{t('settings.general')}</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl text-sm font-semibold w-full transition-all shrink-0 ${activeTab === 'audio'
            ? 'bg-white text-black font-bold shadow-md'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{t('settings.audio')}</span>
        </button>

        <button
          onClick={() => setActiveTab('gemini')}
          className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl text-sm font-semibold w-full transition-all shrink-0 ${activeTab === 'gemini'
            ? 'bg-white text-black font-bold shadow-md'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
        >
          <Key className="w-4 h-4" />
          <span>{t('settings.gemini')}</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl text-sm font-semibold w-full transition-all shrink-0 ${activeTab === 'about'
            ? 'bg-white text-black font-bold shadow-md'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
        >
          <Info className="w-4 h-4" />
          <span>{t('settings.about')}</span>
        </button>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="space-y-3">
              <label className="text-sm font-bold text-white block">
                {t('settings.appLanguage')}
              </label>
              <p className="text-xs text-zinc-400">
                {t('settings.appLanguageDesc')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {SUPPORTED_UI_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateSettings({ uiLanguage: lang.code as 'en' | 'fa' })}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 text-sm font-semibold transition-all ${i18n.language === lang.code
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    {i18n.language === lang.code && <Check className="w-5 h-5 text-black" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-800/40 rounded-2xl border border-zinc-800">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-white">{t('settings.minimizeToTray')}</div>
                  <div className="text-xs text-zinc-400">{t('settings.minimizeToTrayDesc')}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.minimizeToTray}
                    onChange={(e) => updateSettings({ minimizeToTray: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/40 rounded-2xl border border-zinc-800">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-white">{t('settings.launchAtStartup')}</div>
                  <div className="text-xs text-zinc-400">{t('settings.launchAtStartupDesc')}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.launchAtStartup}
                    onChange={(e) => updateSettings({ launchAtStartup: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="space-y-3">
              <label className="text-sm font-bold text-white block">
                {t('settings.bufferSize')}
              </label>
              <p className="text-xs text-zinc-400">
                {t('settings.bufferSizeDesc')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { ms: 50, label: t('settings.lowLatency'), badge: '50 ms' },
                  { ms: 100, label: t('settings.balanced'), badge: '100 ms' },
                  { ms: 200, label: t('settings.highQuality'), badge: '200 ms' },
                ].map((opt) => (
                  <button
                    key={opt.ms}
                    onClick={() => updateSettings({ bufferLatencyMs: opt.ms })}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 text-center transition-all ${settings.bufferLatencyMs === opt.ms
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                  >
                    <span className="text-sm font-bold">{opt.label}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${settings.bufferLatencyMs === opt.ms
                      ? 'bg-zinc-200 text-zinc-900'
                      : 'bg-zinc-700/60 text-zinc-300'
                      }`}>
                      {opt.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gemini' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="space-y-3">
              <label className="text-sm font-bold text-white block">
                {t('settings.model')}
              </label>
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="gemini-3.5-live-translate-preview"
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm font-mono rounded-xl p-3.5 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {['gemini-3.5-live-translate-preview', 'gemini-2.0-flash'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModelInput(m)}
                    className="text-xs px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-mono"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-sm font-bold text-white block">
                {t('settings.apiKey')}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={t('settings.apiKeyPlaceholder')}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm font-mono rounded-xl p-3.5 pr-12 rtl:pr-3.5 rtl:pl-12 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3.5 rtl:right-auto rtl:left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('settings.apiKeyNote')}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <button
                id="test-connection-btn"
                onClick={handleTestConnection}
                disabled={testState === 'loading'}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full justify-center shadow-md"
              >
                {testState === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
                {testState === 'loading' ? t('settings.testingConnection') : t('settings.testConnection')}
              </button>

              {testState === 'success' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-medium leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{testMessage}</span>
                </div>
              )}

              {testState === 'error' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs font-medium leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{testMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200 flex flex-col items-center text-center py-4">
            <img src={MascotImage} alt="Goyak Mascot" className="w-20 h-20 object-contain drop-shadow-lg" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white tracking-tight">{t('common.appName')}</h3>
              <p className="text-xs text-zinc-400">{t('settings.aboutTagline')}</p>
              <p className="text-xs text-zinc-500 font-mono pt-1">{t('settings.versionInfo', { version: appVersion })}</p>
            </div>

            <div className="w-full pt-4 space-y-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => openExternalUrl('https://github.com/sajjadmrx/goyak')}
                className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 text-white text-sm font-semibold transition-all"
              >
                <Github className="w-5 h-5" />
                <span>{t('settings.visitGithub')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
