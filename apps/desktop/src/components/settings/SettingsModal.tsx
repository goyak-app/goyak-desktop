import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sliders,
  Volume2,
  Globe,
  Key,
  ShieldCheck,
  Check,
  Wifi,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Github,
  Info,
  Eye,
  EyeOff,
  ExternalLink,
  Minimize2,
  Rocket,
  Sparkles,
} from 'lucide-react';
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

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: Globe },
    { id: 'audio', label: t('settings.audio'), icon: Volume2 },
    { id: 'gemini', label: t('settings.gemini'), icon: Key },
    { id: 'about', label: t('settings.about'), icon: Info },
  ] as const;

  const footerContent = (
    <div className="w-full flex items-center justify-between select-none">
      <div className="flex items-center gap-2">
        {isSaved && (
          <span className="text-xs text-success font-semibold flex items-center gap-1.5 animate-in fade-in duration-150 bg-success/20 px-3 py-1 rounded-xl border border-success/30">
            <Check className="w-3.5 h-3.5" /> {t('settings.settingsSaved')}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm rounded-xl text-xs text-base-content/70 hover:text-white cursor-pointer"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary btn-sm px-6 rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.title')}
      icon={<Sliders className="w-5 h-5" />}
      size="2xl"
      footer={footerContent}
      className="h-[520px] max-h-[90vh] w-full max-w-2xl"
      bodyClassName="p-0 flex flex-col md:flex-row h-full overflow-hidden"
    >
      <div className="w-full md:w-52 bg-base-200 border-b md:border-b-0 md:border-r rtl:md:border-r-0 rtl:md:border-l border-base-300/80 p-3.5 flex md:flex-col justify-between shrink-0 select-none h-full">
        <div className="flex md:flex-col space-x-1.5 md:space-x-0 md:space-y-1.5 w-full overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs w-full transition-all shrink-0 cursor-pointer text-start ${isActive
                  ? 'bg-primary text-white font-bold shadow-md'
                  : 'text-base-content/70 hover:bg-base-300/60 hover:text-white font-medium'
                  }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-white/20' : 'bg-base-300/70'
                    }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-base-content/60'}`} />
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center justify-between pt-3 mt-1 border-t border-base-300/80 px-1 text-[11px] text-base-content/50 select-none">
          <span>{t('common.appName')}</span>
          <span className="badge badge-sm badge-neutral font-mono">{appVersion}</span>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-base-200 h-full">
        {activeTab === 'general' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-zinc-400 block text-start">
                {t('settings.appLanguage')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SUPPORTED_UI_LANGUAGES.map((lang) => {
                  const isSelected = i18n.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => updateSettings({ uiLanguage: lang.code as 'en' | 'fa' })}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${isSelected
                        ? 'bg-primary text-white border-primary shadow-md ring-2 ring-primary/25'
                        : 'bg-base-300 border-base-300/80 text-base-content/70 hover:bg-base-300/80 hover:text-white'
                        }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 overflow-hidden ${isSelected ? 'bg-white/20' : 'bg-base-100/70'
                            }`}
                        >
                          {lang.countryCode ? (
                            <span className={`fi fi-${lang.countryCode} text-lg rounded-full shrink-0`} />
                          ) : (
                            <span className="text-lg shrink-0">{lang.flag}</span>
                          )}
                        </span>
                        <span>{lang.name}</span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-4 bg-base-300 border border-base-300/80 rounded-2xl gap-4">
                <div className="flex items-center gap-3 text-start">
                  <span className="w-9 h-9 rounded-xl bg-base-100/70 flex items-center justify-center shrink-0">
                    <Minimize2 className="w-4 h-4 text-primary" />
                  </span>
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white">{t('settings.minimizeToTray')}</div>
                    <div className="text-[11px] text-base-content/60">{t('settings.minimizeToTrayDesc')}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.minimizeToTray}
                  onChange={(e) => updateSettings({ minimizeToTray: e.target.checked })}
                  className="toggle toggle-primary toggle-sm cursor-pointer shrink-0"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-base-300 border border-base-300/80 rounded-2xl gap-4">
                <div className="flex items-center gap-3 text-start">
                  <span className="w-9 h-9 rounded-xl bg-base-100/70 flex items-center justify-center shrink-0">
                    <Rocket className="w-4 h-4 text-primary" />
                  </span>
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white">{t('settings.launchAtStartup')}</div>
                    <div className="text-[11px] text-base-content/60">{t('settings.launchAtStartupDesc')}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.launchAtStartup}
                  onChange={(e) => updateSettings({ launchAtStartup: e.target.checked })}
                  className="toggle toggle-primary toggle-sm cursor-pointer shrink-0"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-zinc-400 block text-start">
                {t('settings.bufferSize')}
              </label>
              <p className="text-xs text-base-content/60 text-start">{t('settings.bufferSizeDesc')}</p>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { ms: 50, label: t('settings.lowLatency'), badge: '50 ms' },
                  { ms: 100, label: t('settings.balanced'), badge: '100 ms' },
                  { ms: 200, label: t('settings.highQuality'), badge: '200 ms' },
                ].map((opt) => {
                  const isSelected = settings.bufferLatencyMs === opt.ms;
                  const fillPct = Math.round((opt.ms / 200) * 100);
                  return (
                    <button
                      key={opt.ms}
                      type="button"
                      onClick={() => updateSettings({ bufferLatencyMs: opt.ms })}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-3 text-center transition-all cursor-pointer ${isSelected
                        ? 'bg-primary text-white border-primary shadow-md font-bold'
                        : 'bg-base-300 border-base-300/80 text-base-content/70 hover:bg-base-300/80 hover:text-white'
                        }`}
                    >
                      <span className="text-xs font-semibold">{opt.label}</span>

                      <span
                        className={`h-1.5 w-full rounded-full overflow-hidden ${isSelected ? 'bg-white/25' : 'bg-base-100/70'
                          }`}
                      >
                        <span
                          className={`block h-full rounded-full transition-all ${isSelected ? 'bg-white' : 'bg-primary/60'
                            }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </span>

                      <span
                        className={`badge badge-sm font-mono ${isSelected ? 'bg-white/20 text-white border-transparent' : 'badge-ghost text-base-content/50'
                          }`}
                      >
                        {opt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gemini' && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 text-start">
                {t('settings.model')}
              </label>
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="gemini-3.5-live-translate-preview"
                className="w-full bg-base-300 border border-base-300/80 text-white text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 text-start">
                {t('settings.apiKey')}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={t('settings.apiKeyPlaceholder')}
                  className="w-full bg-base-300 border border-base-300/80 text-white text-xs rounded-xl p-3 pr-10 rtl:pr-3 rtl:pl-10 font-mono focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-white transition-colors cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="alert-dashed border border-success/30 text-success text-[11px] p-2 rounded-2xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{t('settings.apiKeyNote')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                id="test-connection-btn"
                onClick={handleTestConnection}
                disabled={testState === 'loading'}
                className="btn btn-md  btn-primary  w-full rounded-xl text-xs font-bold disabled:opacity-60 cursor-pointer"
              >
                {testState === 'loading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wifi className="w-3.5 h-3.5" />
                )}
                {testState === 'loading' ? t('settings.testingConnection') : t('settings.testConnection')}
              </button>

              {testState === 'success' && (
                <div className="alert alert-success bg-success/10 border border-success/30 text-success text-[11px] p-3 rounded-2xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{testMessage}</span>
                </div>
              )}

              {testState === 'error' && (
                <div className="alert alert-error bg-error/20 border border-error/30 text-error text-[11px] p-3 rounded-2xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{testMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-5 animate-in fade-in duration-150 flex flex-col items-center text-center py-2">
            <div className="w-20 h-20 rounded-3xl bg-base-300/60 border border-base-300/80 flex items-center justify-center">
              <img src={MascotImage} alt="Goyak Mascot" className="w-12 h-12 object-contain drop-shadow-md" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">{t('common.appName')}</h3>
              <p className="text-xs text-base-content/60 max-w-[220px] mx-auto">{t('settings.aboutTagline')}</p>
              <span className="badge badge-neutral font-mono text-[10px] mt-1">
                {t('settings.versionInfo', { version: appVersion })}
              </span>
            </div>

            <div className="w-full pt-4 border-t border-base-300/80">
              <button
                type="button"
                onClick={() => openExternalUrl('https://github.com/sajjadmrx/goyak')}
                className="btn btn-outline btn-lg w-full text-sm  font-medium gap-2 rounded-full border-base-content/5"
              >
                <Github className="w-4 h-4" />
                <span>{t('settings.visitGithub')}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-auto rtl:ml-0 rtl:mr-auto" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};