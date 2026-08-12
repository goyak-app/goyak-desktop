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

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 rtl:space-x-reverse bg-base-200 border border-base-300/80 rounded-2xl p-4 shadow-md">
        <button
          onClick={onToggleDubbedMute}
          className={`p-3 rounded-xl transition-colors cursor-pointer ${
            isDubbedMuted
              ? 'bg-error/20 text-error'
              : 'bg-primary/20 text-primary hover:bg-primary/30'
          }`}
        >
          {isDubbedMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-base-content/70">{t('home.dubbedAudio')}</span>
            <span className="text-base-content font-mono">{isDubbedMuted ? 'Muted' : `${dubbedVolume}%`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={isDubbedMuted ? 0 : dubbedVolume}
            onChange={(e) => onDubbedVolumeChange(Number(e.target.value))}
            className="range range-primary range-xs w-full cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
