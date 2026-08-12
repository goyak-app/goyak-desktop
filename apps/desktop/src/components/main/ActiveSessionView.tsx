import React from 'react';
import { useTranslation } from 'react-i18next';
import { Square } from 'lucide-react';
import { AudioControls } from './AudioControls';
import { DubbingStatus } from '../../types/audio';

interface ActiveSessionViewProps {
  status: DubbingStatus;
  appName: string;
  sourceLanguageName: string;
  targetLanguageName: string;
  dubbedVolume: number;
  isDubbedMuted: boolean;
  onDubbedVolumeChange: (val: number) => void;
  onToggleDubbedMute: () => void;
  onStopDubbing: () => void;
  errorMessage: string | null;
}

const WaveBar: React.FC<{ delay: string; height: string }> = ({ delay, height }) => (
  <span
    className="inline-block w-0.5 rounded-full bg-primary opacity-80"
    style={{
      height,
      animationName: 'dubWave',
      animationDuration: '1.1s',
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
      animationDirection: 'alternate',
      animationDelay: delay,
    }}
  />
);

export const ActiveSessionView: React.FC<ActiveSessionViewProps> = ({
  status,
  appName,
  sourceLanguageName,
  targetLanguageName,
  dubbedVolume,
  isDubbedMuted,
  onDubbedVolumeChange,
  onToggleDubbedMute,
  onStopDubbing,
  errorMessage,
}) => {
  const { t } = useTranslation();
  const isConnecting = status === 'connecting';

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-8 select-none px-4 animate-in fade-in duration-300">

      <div className="flex flex-col items-center gap-6 w-full">
        <div className="relative flex items-center justify-center w-24 h-24">
          <span
            className="absolute inset-0 rounded-full border border-primary/20"
            style={{
              animationName: 'dubPulseRing',
              animationDuration: '2.4s',
              animationTimingFunction: 'ease-out',
              animationIterationCount: 'infinite',
            }}
          />
          <span
            className="absolute inset-2 rounded-full border border-primary/15"
            style={{
              animationName: 'dubPulseRing',
              animationDuration: '2.4s',
              animationTimingFunction: 'ease-out',
              animationIterationCount: 'infinite',
              animationDelay: '0.6s',
            }}
          />
          <span className="relative z-10 w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            {isConnecting ? (
              <span
                className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent"
                style={{
                  animationName: 'spin',
                  animationDuration: '0.8s',
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                }}
              />
            ) : (
              <span className="flex items-end gap-[3px] h-5">
                {[
                  { delay: '0s', height: '6px' },
                  { delay: '0.15s', height: '14px' },
                  { delay: '0.3s', height: '10px' },
                  { delay: '0.45s', height: '18px' },
                  { delay: '0.1s', height: '8px' },
                  { delay: '0.25s', height: '14px' },
                  { delay: '0.35s', height: '6px' },
                ].map((b, i) => (
                  <WaveBar key={i} delay={b.delay} height={b.height} />
                ))}
              </span>
            )}
          </span>
        </div>

        <div className="text-center space-y-1.5">
          <div className="text-[11px] uppercase tracking-widest text-base-content/40 font-medium">
            {isConnecting ? t('common.connecting') : t('common.playing')}
          </div>
          <h2 className="text-xl font-bold text-base-content tracking-tight leading-snug px-2 max-h-16 overflow-hidden">
            {appName}
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs text-base-content/50">
            <span>{sourceLanguageName}</span>
            <span className="text-primary">→</span>
            <span className="text-base-content/80 font-semibold">{targetLanguageName}</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-base-300/50 border border-base-300/80 rounded-2xl p-5">
        <AudioControls
          dubbedVolume={dubbedVolume}
          isDubbedMuted={isDubbedMuted}
          onDubbedVolumeChange={onDubbedVolumeChange}
          onToggleDubbedMute={onToggleDubbedMute}
        />
      </div>

      {errorMessage && (
        <div className="w-full text-xs text-error bg-error/10 border border-error/25 rounded-xl px-4 py-3 text-center leading-relaxed">
          {errorMessage}
        </div>
      )}

      <button
        onClick={onStopDubbing}
        className="w-full rounded-2xl py-4 px-6 font-semibold text-sm flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 border border-base-300/70 text-base-content/50 bg-transparent hover:bg-error/15 hover:border-error/50 hover:text-error"
        style={{ transition: 'background-color 220ms ease, border-color 220ms ease, color 220ms ease, transform 120ms ease' }}
      >
        <Square className="w-3.5 h-3.5 fill-current" />
        <span>{t('home.stopDubbing')}</span>
      </button>

      <style>{`
        @keyframes dubWave {
          from { transform: scaleY(0.35); opacity: 0.5; }
          to   { transform: scaleY(1);    opacity: 1;   }
        }
        @keyframes dubPulseRing {
          0%   { transform: scale(0.92); opacity: 0.6; }
          60%  { transform: scale(1.08); opacity: 0.1; }
          100% { transform: scale(1.14); opacity: 0;   }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
