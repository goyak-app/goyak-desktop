import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Key } from 'lucide-react';
import { AppSelector } from './AppSelector';
import { LanguageSelector } from './LanguageSelector';
import { AudioApplicationInfo, AudioDeviceInfo } from '../../types/audio';

interface DubbingSetupViewProps {
  applications: AudioApplicationInfo[];
  selectedAppId: string;
  onSelectApp: (appId: string) => void;
  onRefreshApps: () => void;
  sourceLanguage: string;
  targetLanguage: string;
  onSourceLanguageChange: (lang: string) => void;
  onTargetLanguageChange: (lang: string) => void;
  outputDevices: AudioDeviceInfo[];
  selectedOutputId: string;
  onSelectOutputId: (id: string) => void;
  isApiKeyMissing: boolean;
  onOpenSettings?: () => void;
  onStartDubbing: () => void;
  isDubbingActive: boolean;
}

export const DubbingSetupView: React.FC<DubbingSetupViewProps> = ({
  applications,
  selectedAppId,
  onSelectApp,
  onRefreshApps,
  sourceLanguage,
  targetLanguage,
  onSourceLanguageChange,
  onTargetLanguageChange,
  outputDevices,
  selectedOutputId,
  onSelectOutputId,
  isApiKeyMissing,
  onOpenSettings,
  onStartDubbing,
  isDubbingActive,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-lg mx-auto p-4 md:p-6 space-y-5 select-none animate-in fade-in duration-300">
      <div className="space-y-5 relative">
        <AppSelector
          applications={applications}
          selectedAppId={selectedAppId}
          onSelectApp={onSelectApp}
          onRefresh={onRefreshApps}
          disabled={isDubbingActive}
        />

        <LanguageSelector
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceChange={onSourceLanguageChange}
          onTargetChange={onTargetLanguageChange}
          disabled={isDubbingActive}
        />

        <div className="space-y-2 pt-1 relative z-10">
          <label className="text-xs font-semibold text-base-content/70 block text-start">
            {t('home.outputDevice')}
          </label>
          <select
            value={selectedOutputId}
            onChange={(e) => onSelectOutputId(e.target.value)}
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
          onClick={onStartDubbing}
          className="btn btn-lg btn-primary btn-block py-6 px-8 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 rtl:space-x-reverse shadow-xl transition-transform active:scale-95 cursor-pointer"
        >
          <Mic className="w-6 h-6" />
          <span>{t('home.startDubbing')}</span>
        </button>
      </div>
    </div>
  );
};
