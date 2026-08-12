import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Square, Key } from 'lucide-react';
import { useAudioStore } from '../../stores/audioStore';
import { AppSelector } from './AppSelector';
import { LanguageSelector } from './LanguageSelector';
import { AudioControls } from './AudioControls';
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
      <div className="w-full max-w-lg mx-auto p-8 space-y-8 select-none animate-in fade-in duration-300 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="badge badge-success bg-success/20 border border-success/30 text-success gap-2 px-3 py-2 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>

            <span>
              {status === 'connecting'
                ? t('common.connecting')
                : t('common.playing')}
            </span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-base-content tracking-tight max-h-48 overflow-y-auto scrollbar-none">
              {getAppName(selectedAppId)}
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-base-content/70 font-medium">
              <span>{getLanguageName(sourceLanguage)}</span>
              <span className="text-primary font-bold">→</span>
              <span className="text-base-content font-bold">{getLanguageName(targetLanguage)}</span>
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
          className="btn btn-error btn-block max-w-sm py-4 px-8 rounded-2xl font-bold text-base flex items-center justify-center space-x-3 rtl:space-x-reverse shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <Square className="w-4 h-4 fill-current" />
          <span>{t('home.stopDubbing')}</span>
        </button>

        {errorMessage && (
          <div className="alert alert-error text-xs text-error font-medium text-center bg-error/20 p-3 rounded-xl border border-error/30">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4 md:p-6 space-y-5 select-none animate-in fade-in duration-300">
      <div className="space-y-5 relative">

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

        <div className="space-y-2 pt-1 relative z-10">
          <label className="text-xs font-semibold text-base-content/70 block text-start">
            {t('home.outputDevice')}
          </label>
          <select
            value={selectedOutputId}
            onChange={(e) => setSelectedOutputId(e.target.value)}
            disabled={isDubbingActive}
            className="w-full bg-base-300 border border-base-300/80 text-base-content text-sm rounded-xl p-3.5 focus:outline-none focus:border-primary transition-colors disabled:opacity-50 appearance-none cursor-pointer"
          >
            {outputDevices.map((dev) => (
              <option key={dev.id} value={dev.id} className="bg-base-200 text-base-content py-2">
                {dev.name} {dev.isDefault ? `(${t('home.defaultDevice')})` : ''}
              </option>
            ))}
          </select>
        </div>

      </div>

      {isApiKeyMissing && (
        <div className="alert alert-warning p-4 bg-warning/20 border border-warning/30 rounded-2xl flex items-center justify-between gap-3 text-warning text-xs shadow-md">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <Key className="w-4 h-4 text-warning shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: t('home.missingApiKey') }} />
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="btn btn-warning btn-xs px-3.5 py-1.5 font-semibold rounded-xl shrink-0 transition-colors cursor-pointer"
            >
              {t('home.openSettings')}
            </button>
          )}
        </div>
      )}

      <div className="flex justify-center pt-1">
        <button
          onClick={toggleDubbing}
          className="btn btn-lg btn-primary btn-block py-6 px-8 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 rtl:space-x-reverse shadow-xl transition-transform active:scale-95 cursor-pointer"
        >
          <Mic className="w-6 h-6" />
          <span>{t('home.startDubbing')}</span>
        </button>
      </div>
    </div>
  );
};
