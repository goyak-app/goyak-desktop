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
      <div className="flex flex-col items-center text-center space-y-7 p-4 sm:p-2">
        <img src={MascotImage} alt="Mascot" className="w-24 h-24 object-contain drop-shadow-xl" />

        <div className="space-y-2.5">
          <h2 className="text-2xl font-bold text-base-content tracking-tight">
            {t('onboarding.welcome')}
          </h2>
          <p className="text-sm text-base-content/70 leading-relaxed">
            {t('onboarding.subtitle')}
          </p>
        </div>

        <div className="w-full space-y-3.5">
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/50 block text-start px-1">
            {t('onboarding.selectLanguage')}
          </label>
          <div className="grid grid-cols-1 gap-3">
            {SUPPORTED_UI_LANGUAGES.map((lang) => {
              const isSelected = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code as 'en' | 'fa')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${isSelected
                    ? 'bg-primary text-white border-primary shadow-md ring-2 ring-primary/25'
                    : 'bg-base-300 border-base-300/80 text-base-content/70 hover:bg-base-300/80 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 overflow-hidden ${isSelected ? 'bg-white/20' : 'bg-base-100/70'
                        }`}
                    >
                      {lang.countryCode ? (
                        <span className={`fi fi-${lang.countryCode} text-2xl  rounded-full`} />
                      ) : (
                        <span className="text-2xl">{lang.flag}</span>
                      )}
                    </span>
                    <div className="text-start">
                      <div className={`font-bold text-sm leading-snug ${isSelected ? 'text-white' : 'text-base-content'}`}>{lang.name}</div>
                      <div className={`text-[11px] mt-0.5 font-medium ${isSelected ? 'text-white/80' : 'text-base-content/50'}`}>{lang.nativeName}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full pt-4 pb-2">
          <button
            onClick={handleContinue}
            className="btn btn-primary w-full shadow-lg rounded-2xl h-12 min-h-12 text-base font-bold"
          >
            {t('common.continue')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
