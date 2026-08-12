import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { SUPPORTED_AUDIO_LANGUAGES, SupportedLanguage } from '@dubly/shared';

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  disabled?: boolean;
}

const CustomSelect = ({
  value,
  options,
  onChange,
  disabled
}: {
  value: string;
  options: SupportedLanguage[];
  onChange: (val: string) => void;
  disabled: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.code === value) || options[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-base-300 border border-base-300/80 text-base-content text-sm rounded-xl p-3.5 rtl:pl-3.5 rtl:pr-3.5 flex items-center justify-between focus:outline-none focus:border-primary transition-colors disabled:opacity-50 cursor-pointer"
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse truncate">
          {selected.countryCode ? (
            <span className={`fi fi-${selected.countryCode} text-lg rounded-sm shrink-0`} />
          ) : (
            <span className="text-lg  shrink-0">{selected.flag}</span>
          )}
          <span className="truncate font-semibold mr-1">{selected.name}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-base-content/70 shrink-0 ml-2 rtl:ml-0 rtl:mr-2" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-base-300 border border-base-300/80 rounded-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto">
          {options.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2.5 text-sm transition-colors cursor-pointer ${value === lang.code ? 'bg-primary text-primary-content font-bold' : 'text-base-content hover:bg-base-200'
                }`}
            >
              {lang.countryCode ? (
                <span className={`fi fi-${lang.countryCode} text-lg rounded-sm shrink-0`} />
              ) : (
                <span className="text-lg shrink-0">{lang.flag}</span>
              )}
              <span className="truncate mr-1">{lang.name} <span className="opacity-70">({lang.nativeName})</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
    <div className="space-y-2 pt-1 relative z-20">
      <label className="text-xs font-semibold text-base-content/70 block text-start">
        {t('home.languages')}
      </label>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-base-content/70 block px-1 text-start">
            {t('home.sourceLanguage')}
          </span>
          <CustomSelect
            value={sourceLanguage}
            options={SUPPORTED_AUDIO_LANGUAGES}
            onChange={onSourceChange}
            disabled={disabled}
          />
        </div>

        <button
          type="button"
          disabled={disabled || sourceLanguage === 'auto'}
          onClick={handleSwap}
          title="Swap Languages"
          className="self-end md:self-center mb-0.5 p-3 rounded-xl bg-base-300 border border-base-300/80 text-base-content/70 hover:text-base-content hover:bg-base-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex cursor-pointer"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-base-content/70 block px-1 text-start">
            {t('home.targetLanguage')}
          </span>
          <CustomSelect
            value={targetLanguage}
            options={SUPPORTED_AUDIO_LANGUAGES.filter((l) => l.code !== 'auto')}
            onChange={onTargetChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};
