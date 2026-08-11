import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { SUPPORTED_AUDIO_LANGUAGES } from '@dubly/shared';

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const handleSwap = () => {
    if (sourceLanguage !== 'auto') {
      const temp = sourceLanguage;
      onSourceChange(targetLanguage);
      onTargetChange(temp);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
        {t('home.languages')}
      </label>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground block">
            {t('home.sourceLanguage')}
          </span>
          <div className="relative">
            <select
              value={sourceLanguage}
              disabled={disabled}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full bg-secondary border border-border text-white text-sm rounded-lg p-3 pr-10 rtl:pl-10 rtl:pr-3 appearance-none focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            >
              {SUPPORTED_AUDIO_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-card text-white py-2">
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-3 pointer-events-none text-muted-foreground">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled || sourceLanguage === 'auto'}
          onClick={handleSwap}
          title="Swap Languages"
          className="self-end md:self-center mb-1 p-2.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground block">
            {t('home.targetLanguage')}
          </span>
          <div className="relative">
            <select
              value={targetLanguage}
              disabled={disabled}
              onChange={(e) => onTargetChange(e.target.value)}
              className="w-full bg-secondary border border-border text-white text-sm rounded-lg p-3 pr-10 rtl:pl-10 rtl:pr-3 appearance-none focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            >
              {SUPPORTED_AUDIO_LANGUAGES.filter((l) => l.code !== 'auto').map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-card text-white py-2">
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-3 pointer-events-none text-muted-foreground">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
