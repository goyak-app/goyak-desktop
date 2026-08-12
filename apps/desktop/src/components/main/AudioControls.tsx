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
    <div className="space-y-4 bg-secondary/30 border border-border rounded-xl p-4">
      <div className="grid grid-cols-1 gap-4">

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-violet-400">
              {t('home.dubbedAudio')}
            </span>
            <span className="font-mono text-white">
              {isDubbedMuted ? 'Muted' : `${dubbedVolume}%`}
            </span>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={onToggleDubbedMute}
              className={`p-2 rounded-lg border transition-colors ${
                isDubbedMuted
                  ? 'bg-rose-600/20 text-rose-400 border-rose-500/30'
                  : 'bg-violet-600/20 text-violet-400 border-violet-500/30'
              }`}
            >
              {isDubbedMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isDubbedMuted ? 0 : dubbedVolume}
              onChange={(e) => onDubbedVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
