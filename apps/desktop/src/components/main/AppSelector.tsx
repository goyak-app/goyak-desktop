import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, ChevronDown } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-0.5">
        <label className="text-xs font-semibold text-base-content/70 block">
          {t('home.selectApp')}
        </label>
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
        >
          <span>{t('home.refresh')}</span>
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-base-300 border border-base-300/80 text-base-content text-sm rounded-xl p-3.5 flex items-center justify-between focus:outline-none focus:border-primary transition-colors disabled:opacity-50 cursor-pointer min-w-0"
        >
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0 flex-1 overflow-hidden pr-2 rtl:pr-0 rtl:pl-2">
            <span className="truncate text-start font-medium block min-w-0">
              {selectedApp ? selectedApp.name : t('home.selectApp')}
            </span>
            {selectedApp?.isAudioActive && (
              <span className="badge badge-success badge-sm border-success/30 text-[10px] shrink-0 font-semibold bg-success/20 text-success">
                ● Audio
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-base-content/70 shrink-0 ml-2 rtl:ml-0 rtl:mr-2" />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-2 bg-base-300 border border-base-300/80 rounded-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto">
            {applications.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  onSelectApp(app.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors cursor-pointer text-start ${selectedAppId === app.id ? 'bg-primary text-primary-content font-bold' : 'text-base-content hover:bg-base-200'
                  }`}
              >
                <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0 flex-1 overflow-hidden pr-2 rtl:pr-0 rtl:pl-2">
                  <span className="truncate block min-w-0">{app.name}</span>
                </div>
                {app.isAudioActive && (
                  <span className={`badge badge-sm text-[10px] shrink-0 font-semibold ${selectedAppId === app.id
                      ? 'bg-primary-content/20 text-primary-content border-transparent'
                      : 'badge-success bg-success/20 text-success border-success/30'
                    }`}>
                    ● Audio Playing
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
