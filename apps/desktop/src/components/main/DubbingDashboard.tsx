import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Square, Sparkles } from 'lucide-react';
import { useAudioStore } from '../../stores/audioStore';
import { AppSelector } from './AppSelector';
import { LanguageSelector } from './LanguageSelector';
import { AudioControls } from './AudioControls';
import { StatusBadge } from './StatusBadge';

import { Key } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

import { SUPPORTED_AUDIO_LANGUAGES } from '@dubly/shared';

interface DubbingDashboardProps {
  onOpenSettings?: () => void;
}

export const DubbingDashboard: React.FC<DubbingDashboardProps> = ({ onOpenSettings }) => {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const {
    status,
    selectedAppId,
    setSelectedAppId,
    applications,
    outputDevices,
    selectedOutputId,
    setSelectedOutputId,
    dubbedVolume,
    setDubbedVolume,
    isDubbedMuted,
    toggleDubbedMute,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    errorMessage,
    toggleDubbing,
    refreshDevicesAndApps,
  } = useAudioStore();

  const isDubbingActive = status === 'listening' || status === 'translating' || status === 'playing' || status === 'connecting';
  const isApiKeyMissing = !settings.geminiApiKey || settings.geminiApiKey.trim() === '';

  const getLanguageName = (code: string) => {
    if (code === 'auto') return 'Auto';
    const lang = SUPPORTED_AUDIO_LANGUAGES.find((l) => l.code === code);
    return lang ? `${lang.flag} ${lang.nativeName}` : code;
  };

  const getAppName = (id: string) => {
    const app = applications.find(a => a.id === id);
    return app ? app.name : id;
  };

  if (isDubbingActive) {
    return (
      <div className="w-full max-w-lg mx-auto p-8 space-y-10 select-none animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            {status === 'connecting' ? t('common.connecting') : t('common.playing')}
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {getAppName(selectedAppId)}
            </h2>
            <div className="flex items-center justify-center gap-3 text-lg text-muted-foreground font-medium">
              <span>{getLanguageName(sourceLanguage)}</span>
              <span className="text-violet-400">→</span>
              <span className="text-white">{getLanguageName(targetLanguage)}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <AudioControls
            dubbedVolume={dubbedVolume}
            isDubbedMuted={isDubbedMuted}
            onDubbedVolumeChange={setDubbedVolume}
            onToggleDubbedMute={toggleDubbedMute}
          />
        </div>

        <button
          onClick={toggleDubbing}
          className="w-full max-w-sm py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 rtl:space-x-reverse bg-zinc-800 hover:bg-zinc-700 text-white shadow-soft transition-all transform active:scale-95"
        >
          <Square className="w-5 h-5 fill-current" />
          <span>{t('home.stopDubbing')}</span>
        </button>

        {errorMessage && (
          <div className="text-sm text-rose-400 font-medium text-center bg-rose-500/10 px-4 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4 md:p-6 space-y-6 select-none animate-in fade-in duration-300">
      <div className="space-y-5 bg-card/80 backdrop-blur-md border border-border/50 rounded-3xl p-5 md:p-6 shadow-premium relative">

        <AppSelector
          applications={applications}
          selectedAppId={selectedAppId}
          onSelectApp={setSelectedAppId}
          onRefresh={refreshDevicesAndApps}
          disabled={isDubbingActive}
        />

        <LanguageSelector
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceChange={setSourceLanguage}
          onTargetChange={setTargetLanguage}
          disabled={isDubbingActive}
        />

        <div className="space-y-2 pt-2 relative z-10">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            {t('home.outputDevice')}
          </label>
          <select
            value={selectedOutputId}
            onChange={(e) => setSelectedOutputId(e.target.value)}
            disabled={isDubbingActive}
            className="w-full bg-secondary border border-border/50 text-white text-sm rounded-xl p-3 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 appearance-none"
          >
            {outputDevices.map((dev) => (
              <option key={dev.id} value={dev.id} className="bg-card text-white py-2">
                {dev.name} {dev.isDefault ? `(${t('home.defaultDevice')})` : ''}
              </option>
            ))}
          </select>
        </div>

      </div>

      {isApiKeyMissing && (
        <div className="p-4 bg-amber-300/10 border border-amber-300/20 rounded-2xl flex items-center justify-between gap-3 text-amber-200 text-sm shadow-soft">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Key className="w-5 h-5 text-amber-400 shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: t('home.missingApiKey') }} />
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-xl shrink-0 transition-colors"
            >
              {t('home.openSettings')}
            </button>
          )}
        </div>
      )}

      <div className="flex justify-center pt-1">
        <button
          onClick={toggleDubbing}
          className="w-full py-3.5 px-8 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 rtl:space-x-reverse shadow-premium transition-all transform active:scale-95 bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Mic className="w-6 h-6" />
          <span>{t('home.startDubbing')}</span>
        </button>
      </div>
    </div>
  );
};
