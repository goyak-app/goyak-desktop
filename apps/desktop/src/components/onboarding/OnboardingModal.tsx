import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { SUPPORTED_UI_LANGUAGES } from '@dubly/shared';
import { useSettingsStore } from '../../stores/settingsStore';
import MascotImage from '../../assets/mascot.png';
import { Modal } from '../ui/Modal';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { t, i18n } = useTranslation();
  const { updateSettings } = useSettingsStore();

  const handleSelectLanguage = (langCode: 'en' | 'fa') => {
    updateSettings({ uiLanguage: langCode });
  };

  const handleContinue = () => {
    updateSettings({ hasCompletedOnboarding: true });
    onComplete();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleContinue}
      size="md"
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <div className="flex flex-col items-center text-center space-y-6 py-2">
        <img src={MascotImage} alt="Mascot" className="w-24 h-24 object-contain drop-shadow-xl" />

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-base-content tracking-tight">
            {t('onboarding.welcome')}
          </h2>
          <p className="text-sm text-base-content/70 leading-relaxed">
            {t('onboarding.subtitle')}
          </p>
        </div>

        <div className="w-full space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-base-content/60 block text-start">
            {t('onboarding.selectLanguage')}
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {SUPPORTED_UI_LANGUAGES.map((lang) => {
              const isSelected = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code as 'en' | 'fa')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-base-300 border-primary text-base-content shadow-sm'
                      : 'bg-base-200 border-base-300 text-base-content/70 hover:bg-base-300/50 hover:text-base-content'
                  }`}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    {lang.countryCode ? (
                      <span className={`fi fi-${lang.countryCode} text-2xl drop-shadow-sm rounded-sm`} />
                    ) : (
                      <span className="text-2xl drop-shadow-sm">{lang.flag}</span>
                    )}
                    <div className="text-start">
                      <div className="font-bold text-base-content">{lang.name}</div>
                      <div className="text-xs text-base-content/60">{lang.nativeName}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full pt-2">
          <button
            onClick={handleContinue}
            className="btn btn-primary w-full shadow-lg"
          >
            {t('common.continue')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
