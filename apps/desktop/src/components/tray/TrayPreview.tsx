import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Pause, Square, ExternalLink, Settings, Power, X } from 'lucide-react';
import { useAudioStore } from '../../stores/audioStore';

interface TrayPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const TrayPreview: React.FC<TrayPreviewProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const { t } = useTranslation();
  const { status, toggleDubbing, selectedAppId, targetLanguage } = useAudioStore();

  if (!isOpen) return null;

  const isDubbingActive = status === 'listening' || status === 'translating' || status === 'playing';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Dubly Tray Menu</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-secondary/50 border border-border rounded-lg p-3 space-y-1">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-semibold text-white">
            <span className={`w-2 h-2 rounded-full ${isDubbingActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
            <span>{isDubbingActive ? t('tray.activeSession') : t('common.ready')}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {selectedAppId.toUpperCase()} → {targetLanguage.toUpperCase()}
          </p>
        </div>

        <div className="space-y-1">
          {isDubbingActive && (
            <>
              <button
                onClick={toggleDubbing}
                className="w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-xs font-medium text-amber-300 hover:bg-secondary transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>{t('tray.pauseDubbing')}</span>
              </button>

              <button
                onClick={toggleDubbing}
                className="w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-secondary transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>{t('tray.stopDubbing')}</span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-xs font-medium text-white hover:bg-secondary transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-violet-400" />
            <span>{t('tray.openApp')}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>{t('tray.settings')}</span>
          </button>

          <div className="pt-2 border-t border-border">
            <button
              onClick={onClose}
              className="w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-950/30 transition-colors"
            >
              <Power className="w-4 h-4" />
              <span>{t('tray.quit')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
