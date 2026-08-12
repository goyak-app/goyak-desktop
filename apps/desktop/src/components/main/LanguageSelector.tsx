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
        className="w-full bg-secondary border border-border/50 text-white text-sm rounded-xl p-3 rtl:pl-3 rtl:pr-3 flex items-center justify-between focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse truncate">
          {selected.countryCode ? (
            <span className={`fi fi-${selected.countryCode} text-lg rounded-sm shrink-0`} />
          ) : (
            <span className="text-lg shrink-0">{selected.flag}</span>
          )}
          <span className="truncate">{selected.name}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2 rtl:ml-0 rtl:mr-2" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-secondary border border-border rounded-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto">
          {options.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2.5 text-sm transition-colors ${
                value === lang.code ? 'bg-violet-600 text-white' : 'text-foreground hover:bg-zinc-800'
              }`}
            >
              {lang.countryCode ? (
                <span className={`fi fi-${lang.countryCode} text-lg rounded-sm shrink-0`} />
              ) : (
                <span className="text-lg shrink-0">{lang.flag}</span>
              )}
              <span className="truncate">{lang.name} <span className="opacity-70">({lang.nativeName})</span></span>
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
    <div className="space-y-2 pt-2 relative z-20">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
        {t('home.languages')}
      </label>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground block px-1">
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
          className="self-end md:self-center mb-0.5 p-2.5 rounded-xl bg-secondary border border-border/50 text-muted-foreground hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground block px-1">
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
