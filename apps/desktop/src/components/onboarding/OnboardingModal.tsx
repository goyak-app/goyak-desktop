import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Mic } from 'lucide-react';
import { SUPPORTED_UI_LANGUAGES } from '@dubly/shared';
import { useSettingsStore } from '../../stores/settingsStore';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();

  if (!isOpen) return null;

  const handleSelectLanguage = (langCode: 'en' | 'fa') => {
    updateSettings({ uiLanguage: langCode });
  };

  const handleContinue = () => {
    updateSettings({ hasCompletedOnboarding: true });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center ring-8 ring-violet-600/10">
          <Mic className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t('onboarding.welcome')}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('onboarding.subtitle')}
          </p>
        </div>

        <div className="w-full space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block text-start">
            {t('onboarding.selectLanguage')}
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {SUPPORTED_UI_LANGUAGES.map((lang) => {
              const isSelected = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code as 'en' | 'fa')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                      : 'bg-secondary/50 text-foreground border-border hover:bg-secondary hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="text-xl">{lang.flag}</span>
                    <div className="text-start">
                      <div className="font-semibold">{lang.name}</div>
                      <div className="text-xs opacity-75">{lang.nativeName}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold rounded-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-background"
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
};
