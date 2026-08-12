import React from 'react';
import { useAudioStore } from '../../stores/audioStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { SUPPORTED_AUDIO_LANGUAGES } from '@dubly/shared';
import { ActiveSessionView } from './ActiveSessionView';
import { DubbingSetupView } from './DubbingSetupView';

interface DubbingDashboardProps {
  onOpenSettings?: () => void;
}

export const DubbingDashboard: React.FC<DubbingDashboardProps> = ({ onOpenSettings }) => {
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
      <ActiveSessionView
        status={status}
        appName={getAppName(selectedAppId)}
        sourceLanguageName={getLanguageName(sourceLanguage)}
        targetLanguageName={getLanguageName(targetLanguage)}
        dubbedVolume={dubbedVolume}
        isDubbedMuted={isDubbedMuted}
        onDubbedVolumeChange={setDubbedVolume}
        onToggleDubbedMute={toggleDubbedMute}
        onStopDubbing={toggleDubbing}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <DubbingSetupView
      applications={applications}
      selectedAppId={selectedAppId}
      onSelectApp={setSelectedAppId}
      onRefreshApps={refreshDevicesAndApps}
      sourceLanguage={sourceLanguage}
      targetLanguage={targetLanguage}
      onSourceLanguageChange={setSourceLanguage}
      onTargetLanguageChange={setTargetLanguage}
      outputDevices={outputDevices}
      selectedOutputId={selectedOutputId}
      onSelectOutputId={setSelectedOutputId}
      isApiKeyMissing={isApiKeyMissing}
      onOpenSettings={onOpenSettings}
      onStartDubbing={toggleDubbing}
      isDubbingActive={isDubbingActive}
    />
  );
};
