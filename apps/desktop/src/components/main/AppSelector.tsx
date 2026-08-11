import React from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, RefreshCw, ChevronDown } from 'lucide-react';
import { AudioApplicationInfo } from '../../types/audio';

interface AppSelectorProps {
  applications: AudioApplicationInfo[];
  selectedAppId: string;
  onSelectApp: (appId: string) => void;
  onRefresh: () => void;
  disabled?: boolean;
}

export const AppSelector: React.FC<AppSelectorProps> = ({
  applications,
  selectedAppId,
  onSelectApp,
  onRefresh,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('home.selectApp')}
        </label>
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="relative">
        <select
          value={selectedAppId}
          disabled={disabled}
          onChange={(e) => onSelectApp(e.target.value)}
          className="w-full bg-secondary border border-border text-white text-sm rounded-lg p-3 pr-10 rtl:pl-10 rtl:pr-3 appearance-none focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        >
          {applications.map((app) => (
            <option key={app.id} value={app.id} className="bg-card text-white py-2">
              {app.name} {app.isAudioActive ? '● Audio Playing' : ''}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-3 pointer-events-none text-muted-foreground">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
