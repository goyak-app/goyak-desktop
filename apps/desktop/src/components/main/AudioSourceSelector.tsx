import React from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, AppWindow } from 'lucide-react';
import { AudioSourceType } from '../../types/audio';

interface AudioSourceSelectorProps {
  sourceType: AudioSourceType;
  onSelectSource: (type: AudioSourceType) => void;
  disabled?: boolean;
}

export const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({
  sourceType,
  onSelectSource,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
        {t('home.audioSource')}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectSource('system')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
            sourceType === 'system'
              ? 'bg-violet-600/10 border-violet-500 text-white shadow-sm'
              : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors ${
              sourceType === 'system'
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-800 text-muted-foreground'
            }`}
          >
            <Monitor className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold">{t('home.entireSystem')}</span>
          <span className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
            {t('home.entireSystemDesc')}
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectSource('application')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
            sourceType === 'application'
              ? 'bg-violet-600/10 border-violet-500 text-white shadow-sm'
              : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors ${
              sourceType === 'application'
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-800 text-muted-foreground'
            }`}
          >
            <AppWindow className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold">{t('home.specificApp')}</span>
          <span className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
            {t('home.specificAppDesc')}
          </span>
        </button>
      </div>
    </div>
  );
};
