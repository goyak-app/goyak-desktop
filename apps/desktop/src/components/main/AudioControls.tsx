import React from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Headphones } from 'lucide-react';
import { AudioDeviceInfo } from '../../types/audio';

interface AudioControlsProps {
  originalVolume: number;
  dubbedVolume: number;
  isOriginalMuted: boolean;
  isDubbedMuted: boolean;
  outputDevices: AudioDeviceInfo[];
  selectedOutputId: string;
  onOriginalVolumeChange: (val: number) => void;
  onDubbedVolumeChange: (val: number) => void;
  onToggleOriginalMute: () => void;
  onToggleDubbedMute: () => void;
  onSelectOutputDevice: (id: string) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  originalVolume,
  dubbedVolume,
  isOriginalMuted,
  isDubbedMuted,
  outputDevices,
  selectedOutputId,
  onOriginalVolumeChange,
  onDubbedVolumeChange,
  onToggleOriginalMute,
  onToggleDubbedMute,
  onSelectOutputDevice,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 bg-secondary/30 border border-border rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">
              {t('home.originalAudio')}
            </span>
            <span className="font-mono text-white">
              {isOriginalMuted ? 'Muted' : `${originalVolume}%`}
            </span>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={onToggleOriginalMute}
              className={`p-2 rounded-lg border transition-colors ${
                isOriginalMuted
                  ? 'bg-rose-600/20 text-rose-400 border-rose-500/30'
                  : 'bg-secondary text-muted-foreground hover:text-white border-border'
              }`}
            >
              {isOriginalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isOriginalMuted ? 0 : originalVolume}
              onChange={(e) => onOriginalVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>
        </div>

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

      <div className="pt-2 border-t border-border flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-muted-foreground">
          <Headphones className="w-4 h-4 text-violet-400" />
          <span>{t('home.outputDevice')}:</span>
        </div>
        <select
          value={selectedOutputId}
          onChange={(e) => onSelectOutputDevice(e.target.value)}
          className="bg-secondary border border-border text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500"
        >
          {outputDevices.map((dev) => (
            <option key={dev.id} value={dev.id} className="bg-card text-white">
              {dev.name} {dev.isDefault ? `(${t('home.defaultDevice')})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
