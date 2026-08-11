import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, CheckCircle2, Loader2, Radio } from 'lucide-react';
import { DubbingStatus } from '../../types/audio';

interface StatusBadgeProps {
  status: DubbingStatus;
  latencyMs: number;
  errorMessage?: string | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  latencyMs,
  errorMessage,
}) => {
  const { t } = useTranslation();

  const getStatusDetails = () => {
    switch (status) {
      case 'ready':
        return {
          label: t('common.ready'),
          color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          dot: 'bg-zinc-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'connecting':
        return {
          label: t('common.connecting'),
          color: 'bg-amber-900/30 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400 animate-pulse',
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        };
      case 'listening':
        return {
          label: t('common.listening'),
          color: 'bg-violet-950/40 text-violet-300 border-violet-500/40',
          dot: 'bg-violet-400 animate-ping',
          icon: <Radio className="w-3.5 h-3.5" />,
        };
      case 'translating':
        return {
          label: t('common.translating'),
          color: 'bg-indigo-950/40 text-indigo-300 border-indigo-500/40',
          dot: 'bg-indigo-400 animate-pulse',
          icon: <Activity className="w-3.5 h-3.5" />,
        };
      case 'playing':
        return {
          label: t('common.playing'),
          color: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400 animate-pulse',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'reconnecting':
        return {
          label: t('common.reconnecting'),
          color: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400 animate-ping',
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        };
      case 'error':
        return {
          label: t('common.error'),
          color: 'bg-rose-950/40 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
        };
    }
  };

  const current = getStatusDetails();
  const isDubbingActive = status === 'listening' || status === 'translating' || status === 'playing';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-secondary/50 border border-border rounded-xl">
      <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${current.color}`}>
          <span className={`w-2 h-2 rounded-full ${current.dot}`} />
          {current.icon}
          <span>{current.label}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {isDubbingActive ? t(`status.${status}Desc`) : t('status.readyDesc')}
        </span>
      </div>

      {isDubbingActive && (
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono bg-zinc-900 px-3 py-1 rounded-lg border border-border text-zinc-300">
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          <span>
            {t('common.latency')}: <strong className="text-white">{latencyMs} {t('common.ms')}</strong>
          </span>
        </div>
      )}

      {status === 'error' && errorMessage && (
        <span className="text-xs text-rose-400 line-clamp-1">{errorMessage}</span>
      )}
    </div>
  );
};
