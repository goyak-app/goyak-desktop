import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettings } from '../../types/settings';

interface AudioTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const AudioTab: React.FC<AudioTabProps> = ({ settings, onUpdateSettings }) => {
  const { t } = useTranslation();

  const toneOptions = [
    { id: 'natural',   label: t('settings.toneNatural'),   emoji: '🗣️' },
    { id: 'energetic', label: t('settings.toneEnergetic'), emoji: '⚡' },
    { id: 'calm',      label: t('settings.toneCalm'),      emoji: '🧘' },
    { id: 'dramatic',  label: t('settings.toneDramatic'),  emoji: '🎭' },
    { id: 'funny',     label: t('settings.toneFunny'),     emoji: '😜' },
  ] as const;

  const vibeOptions = [
    { id: 'gaming',      label: t('settings.vibeGaming'),      emoji: '🎮' },
    { id: 'movies',      label: t('settings.vibeMovies'),      emoji: '🎬' },
    { id: 'anime',       label: t('settings.vibeAnime'),       emoji: '⚔️' },
    { id: 'podcast',     label: t('settings.vibePodcast'),     emoji: '🎙️' },
    { id: 'vlog',        label: t('settings.vibeVlog'),        emoji: '📹' },
    { id: 'educational', label: t('settings.vibeEducational'), emoji: '📚' },
  ] as const;

  const latencyOptions = [
    { ms: 50,  label: t('settings.lowLatency'),  badge: '50ms' },
    { ms: 100, label: t('settings.balanced'),    badge: '100ms' },
    { ms: 200, label: t('settings.highQuality'), badge: '200ms' },
  ] as const;

  const selectedCls = 'bg-primary text-white border-primary shadow-md';
  const unselectedCls = 'bg-base-300 border-base-300/80 text-base-content/70 hover:bg-base-300/80 hover:text-white';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-base-content/80">{t('settings.voiceTone')}</p>
          <p className="text-[11px] text-base-content/45 mt-0.5">{t('settings.voiceToneDesc')}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {toneOptions.map((tone) => {
            const isSelected = settings.voiceTone === tone.id;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => onUpdateSettings({ voiceTone: tone.id as any })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-start ${
                  isSelected ? selectedCls : unselectedCls
                }`}
              >
                <span className="text-base leading-none shrink-0">{tone.emoji}</span>
                <span className="leading-tight">{tone.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="border-t border-base-300/50" />

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-base-content/80">{t('settings.voiceVibe')}</p>
          <p className="text-[11px] text-base-content/45 mt-0.5">{t('settings.voiceVibeDesc')}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {vibeOptions.map((vibe) => {
            const isSelected = settings.voiceVibe === vibe.id;
            return (
              <button
                key={vibe.id}
                type="button"
                onClick={() => onUpdateSettings({ voiceVibe: vibe.id as any })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-start ${
                  isSelected ? selectedCls : unselectedCls
                }`}
              >
                <span className="text-base leading-none shrink-0">{vibe.emoji}</span>
                <span className="leading-tight">{vibe.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="border-t border-base-300/50" />

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-base-content/80">{t('settings.bufferSize')}</p>
          <p className="text-[11px] text-base-content/45 mt-0.5">{t('settings.bufferSizeDesc')}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {latencyOptions.map((opt) => {
            const isSelected = settings.bufferLatencyMs === opt.ms;
            const fillPct = Math.round((opt.ms / 200) * 100);
            return (
              <button
                key={opt.ms}
                type="button"
                onClick={() => onUpdateSettings({ bufferLatencyMs: opt.ms })}
                className={`flex flex-col items-start gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected ? selectedCls : unselectedCls
                }`}
              >
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-base-100/80 text-base-content/50'
                }`}>
                  {opt.badge}
                </span>
                <span className="leading-tight">{opt.label}</span>
                <span className={`h-0.5 w-full rounded-full ${isSelected ? 'bg-white/25' : 'bg-base-100/60'}`}>
                  <span
                    className={`block h-full rounded-full ${isSelected ? 'bg-white' : 'bg-base-content/20'}`}
                    style={{ width: `${fillPct}%` }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

    </div>
  );
};
