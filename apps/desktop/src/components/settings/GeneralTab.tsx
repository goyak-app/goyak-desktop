import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Minimize2, Rocket } from 'lucide-react';
import { SUPPORTED_UI_LANGUAGES } from '@dubly/shared';
import { AppSettings } from '../../types/settings';

interface GeneralTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const { t, i18n } = useTranslation();

  return (
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
                onClick={() => onUpdateSettings({ uiLanguage: lang.code as 'en' | 'fa' })}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md ring-2 ring-primary/25'
                    : 'bg-base-300 border-base-300/80 text-base-content/70 hover:bg-base-300/80 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 overflow-hidden ${
                      isSelected ? 'bg-white/20' : 'bg-base-100/70'
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
            onChange={(e) => onUpdateSettings({ minimizeToTray: e.target.checked })}
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
            onChange={(e) => onUpdateSettings({ launchAtStartup: e.target.checked })}
            className="toggle toggle-primary toggle-sm cursor-pointer shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
