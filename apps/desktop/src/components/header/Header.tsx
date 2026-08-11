import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Settings, Sliders, Globe } from 'lucide-react';
import { SUPPORTED_UI_LANGUAGES } from '@dubly/shared';
import { useSettingsStore } from '../../stores/settingsStore';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenTrayPreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenTrayPreview }) => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fa' : 'en';
    updateSettings({ uiLanguage: nextLang });
  };

  const currentLangObj = SUPPORTED_UI_LANGUAGES.find((l) => l.code === i18n.language);

  return (
    <header className="w-full h-16 bg-card border-b border-border px-6 flex items-center justify-between select-none">
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold shadow-md">
          <Mic className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {t('common.appName')}
            <span className="text-[10px] uppercase tracking-widest font-bold bg-violet-600/20 text-violet-400 border border-violet-500/30 px-1.5 py-0.5 rounded">
              Live
            </span>
          </h1>
          <p className="text-xs text-muted-foreground">{t('common.tagline')}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <button
          onClick={toggleLanguage}
          title={t('settings.appLanguage')}
          className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-zinc-800 border border-border text-xs font-medium transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-violet-400" />
          <span>{currentLangObj?.flag}</span>
          <span className="uppercase">{currentLangObj?.code}</span>
        </button>

        <button
          onClick={onOpenTrayPreview}
          title={t('settings.systemTray')}
          className="p-2 rounded-lg bg-secondary text-foreground hover:bg-zinc-800 border border-border transition-all"
        >
          <Sliders className="w-4 h-4 text-muted-foreground hover:text-white" />
        </button>

        <button
          onClick={onOpenSettings}
          title={t('settings.title')}
          className="p-2 rounded-lg bg-secondary text-foreground hover:bg-zinc-800 border border-border transition-all"
        >
          <Settings className="w-4 h-4 text-muted-foreground hover:text-white" />
        </button>
      </div>
    </header>
  );
};
