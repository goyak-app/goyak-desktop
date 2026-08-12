import React from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioControlsProps {
  dubbedVolume: number;
  isDubbedMuted: boolean;
  onDubbedVolumeChange: (val: number) => void;
  onToggleDubbedMute: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  dubbedVolume,
  isDubbedMuted,
  onDubbedVolumeChange,
  onToggleDubbedMute,
}) => {
  const { t } = useTranslation();
  const displayVolume = isDubbedMuted ? 0 : dubbedVolume;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-[11px] font-medium px-0.5">
        <span className="text-base-content/50 uppercase tracking-widest">{t('home.dubbedAudio')}</span>
        <span className={`font-mono tabular-nums ${isDubbedMuted ? 'text-error' : 'text-base-content/70'}`}>
          {isDubbedMuted ? 'Muted' : `${dubbedVolume}%`}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleDubbedMute}
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            isDubbedMuted
              ? 'bg-error/20 text-error hover:bg-error/30'
              : 'bg-base-300 text-base-content/60 hover:text-primary hover:bg-primary/15'
          }`}
        >
          {isDubbedMuted
            ? <VolumeX className="w-4 h-4" />
            : <Volume2 className="w-4 h-4" />
          }
        </button>

        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="100"
            value={displayVolume}
            onChange={(e) => onDubbedVolumeChange(Number(e.target.value))}
            className="range range-primary range-xs w-full cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
