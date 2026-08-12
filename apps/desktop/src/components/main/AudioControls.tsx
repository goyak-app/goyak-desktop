import React from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Headphones } from 'lucide-react';
import { AudioDeviceInfo } from '../../types/audio';

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
      <div className="flex items-center space-x-4 rtl:space-x-reverse bg-secondary/50 rounded-2xl p-4 shadow-soft">
        <button
          onClick={onToggleDubbedMute}
          className={`p-3 rounded-xl transition-colors ${
            isDubbedMuted
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
          }`}
        >
          {isDubbedMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">{t('home.dubbedAudio')}</span>
            <span className="text-white font-mono">{isDubbedMuted ? 'Muted' : `${dubbedVolume}%`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={isDubbedMuted ? 0 : dubbedVolume}
            onChange={(e) => onDubbedVolumeChange(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
