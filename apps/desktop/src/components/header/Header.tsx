import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Globe, X, Minus } from 'lucide-react';
import { SUPPORTED_UI_LANGUAGES } from '@dubly/shared';
import { useSettingsStore } from '../../stores/settingsStore';
import MascotImage from '../../assets/mascot.png';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fa' : 'en';
    updateSettings({ uiLanguage: nextLang });
  };

  const currentLangObj = SUPPORTED_UI_LANGUAGES.find((l) => l.code === i18n.language);
  const appWindow = getCurrentWindow();

  return (
    <header data-tauri-drag-region className="w-full h-20 bg-transparent px-6 md:px-8 flex items-center justify-between select-none shrink-0 border-b border-transparent hover:border-border/10 transition-colors">
      <div data-tauri-drag-region className="flex items-center space-x-4 rtl:space-x-reverse pointer-events-none">
        <img src={MascotImage} alt="Dubly Mascot" className="w-10 h-10 object-contain drop-shadow-md" />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {t('common.appName')}
          </h1>
          <p className="text-xs text-muted-foreground font-medium">{t('common.tagline')}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <button
          onClick={toggleLanguage}
          title={t('settings.appLanguage')}
          className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-xl bg-secondary/50 text-foreground hover:bg-secondary hover:text-white text-xs font-semibold transition-colors"
        >
          <Globe className="w-4 h-4 text-violet-400" />
          {currentLangObj?.countryCode ? (
            <span className={`fi fi-${currentLangObj.countryCode} text-sm rounded-sm`} />
          ) : (
            <span>{currentLangObj?.flag}</span>
          )}
          <span className="uppercase">{currentLangObj?.code}</span>
        </button>

        <button
          onClick={onOpenSettings}
          title={t('settings.title')}
          className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-border mx-2 hidden md:block"></div>

        <button
          onClick={() => appWindow.minimize()}
          title="Minimize"
          className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={() => appWindow.close()}
          title="Close"
          className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-rose-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
