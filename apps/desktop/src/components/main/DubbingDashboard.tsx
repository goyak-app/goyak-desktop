import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Square, Sparkles } from 'lucide-react';
import { useAudioStore } from '../../stores/audioStore';
import { AudioSourceSelector } from './AudioSourceSelector';
import { AppSelector } from './AppSelector';
import { LanguageSelector } from './LanguageSelector';
import { AudioControls } from './AudioControls';
import { Visualizer } from './Visualizer';
import { StatusBadge } from './StatusBadge';

import { Key } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

interface DubbingDashboardProps {
  onOpenSettings?: () => void;
}

export const DubbingDashboard: React.FC<DubbingDashboardProps> = ({ onOpenSettings }) => {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const {
    status,
    sourceType,
    setSourceType,
    selectedAppId,
    setSelectedAppId,
    applications,
    outputDevices,
    selectedOutputId,
    setSelectedOutputId,
    originalVolume,
    setOriginalVolume,
    dubbedVolume,
    setDubbedVolume,
    isOriginalMuted,
    toggleOriginalMute,
    isDubbedMuted,
    toggleDubbedMute,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    latencyMs,
    errorMessage,
    audioActiveLevel,
    logs,
    toggleDubbing,
    refreshDevicesAndApps,
  } = useAudioStore();

  const [showLogs, setShowLogs] = React.useState(true);

  const isDubbingActive = status === 'listening' || status === 'translating' || status === 'playing' || status === 'connecting';
  const isApiKeyMissing = !settings.geminiApiKey || settings.geminiApiKey.trim() === '';

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 select-none animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <span>{t('home.title')}</span>
          <Sparkles className="w-5 h-5 text-violet-400" />
        </h2>
        <p className="text-sm text-muted-foreground">{t('common.subtagline')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border rounded-2xl p-6 shadow-xl">
        <div className="space-y-5">
          <AudioSourceSelector
            sourceType={sourceType}
            onSelectSource={setSourceType}
            disabled={isDubbingActive}
          />

          {sourceType === 'application' && (
            <AppSelector
              applications={applications}
              selectedAppId={selectedAppId}
              onSelectApp={setSelectedAppId}
              onRefresh={refreshDevicesAndApps}
              disabled={isDubbingActive}
            />
          )}
        </div>

        <div className="space-y-5">
          <LanguageSelector
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onSourceChange={setSourceLanguage}
            onTargetChange={setTargetLanguage}
            disabled={isDubbingActive}
          />
        </div>
      </div>

      <AudioControls
        originalVolume={originalVolume}
        dubbedVolume={dubbedVolume}
        isOriginalMuted={isOriginalMuted}
        isDubbedMuted={isDubbedMuted}
        outputDevices={outputDevices}
        selectedOutputId={selectedOutputId}
        onOriginalVolumeChange={setOriginalVolume}
        onDubbedVolumeChange={setDubbedVolume}
        onToggleOriginalMute={toggleOriginalMute}
        onToggleDubbedMute={toggleDubbedMute}
        onSelectOutputDevice={setSelectedOutputId}
      />

      <Visualizer status={status} activeLevel={audioActiveLevel} />

      {isApiKeyMissing && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3 text-amber-200 text-xs">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Enter your <strong>Gemini API Key</strong> in Settings to enable real-time AI audio streaming.</span>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shrink-0 transition-colors"
            >
              Open Settings ⚙️
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col items-center space-y-3">
        <button
          onClick={toggleDubbing}
          className={`w-full max-w-md py-4 px-8 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 rtl:space-x-reverse shadow-xl transition-all transform active:scale-98 ${
            isDubbingActive
              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-600/20'
              : 'bg-violet-600 hover:bg-violet-700 text-white ring-4 ring-violet-600/20 glow-primary'
          }`}
        >
          {isDubbingActive ? (
            <>
              <Square className="w-5 h-5 fill-current" />
              <span>{t('home.stopDubbing')}</span>
            </>
          ) : (
            <>
              <Mic className="w-6 h-6" />
              <span>{t('home.startDubbing')}</span>
            </>
          )}
        </button>

        <StatusBadge status={status} latencyMs={latencyMs} errorMessage={errorMessage} />
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="px-4 py-2.5 bg-secondary/40 border-b border-border flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-violet-400 flex items-center gap-2">
            <span>💻</span> Live Debug Logs (Temporary)
          </span>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-[11px] text-muted-foreground hover:text-white px-2 py-0.5 rounded bg-secondary border border-border"
          >
            {showLogs ? 'Hide Logs ▲' : 'Show Logs ▼'}
          </button>
        </div>
        {showLogs && (
          <div className="p-3 bg-zinc-950 font-mono text-[11px] text-emerald-400 h-36 overflow-y-auto space-y-1 dir-ltr text-left">
            {logs.map((log, idx) => (
              <div key={idx} className={log.includes('[ERROR]') ? 'text-rose-400 font-bold' : log.includes('[WARN]') ? 'text-amber-300' : 'text-emerald-400'}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
