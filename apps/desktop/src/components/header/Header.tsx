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
  const { updateSettings } = useSettingsStore();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fa' : 'en';
    updateSettings({ uiLanguage: nextLang });
  };

  const currentLangObj = SUPPORTED_UI_LANGUAGES.find((l) => l.code === i18n.language);
  const appWindow = getCurrentWindow();

  return (
    <header data-tauri-drag-region className="w-full h-20 bg-transparent px-6 md:px-8 flex items-center justify-between select-none shrink-0">
      <div data-tauri-drag-region className="flex items-center gap-3.5 pointer-events-none">
        <img src={MascotImage} alt="Dubly Mascot" className="w-10 h-10 object-contain drop-shadow-md" />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-base-content tracking-tight flex items-center gap-2">
            {t('common.appName')}
          </h1>
          <p className="text-xs text-base-content/70 font-medium">{t('common.tagline')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          title={t('settings.appLanguage')}
          className="h-9 px-3.5 rounded-2xl bg-base-300 hover:bg-base-300/80 text-base-content text-xs font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
        >
          <span className="uppercase">{currentLangObj?.code}</span>
          {currentLangObj?.countryCode ? (
            <span className={`fi fi-${currentLangObj.countryCode} text-sm rounded-sm`} />
          ) : (
            <span>{currentLangObj?.flag}</span>
          )}
          <Globe className="w-4 h-4 text-base-content/70" />
        </button>

        <button
          onClick={onOpenSettings}
          title={t('settings.title')}
          className="w-9 h-9 rounded-2xl bg-base-300 hover:bg-base-300/80 text-base-content/70 hover:text-base-content flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-base-300/80 mx-0.5 shrink-0" />

        <button
          onClick={() => appWindow.minimize()}
          title="Minimize"
          className="w-9 h-9 rounded-2xl bg-base-300 hover:bg-base-300/80 text-base-content/70 hover:text-base-content flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={() => appWindow.close()}
          title="Close"
          className="w-9 h-9 rounded-2xl bg-base-300 hover:bg-base-300/80 text-base-content/70 hover:text-error flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
