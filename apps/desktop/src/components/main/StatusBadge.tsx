import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, CheckCircle2, Loader2, Radio } from 'lucide-react';
import { DubbingStatus } from '../../types/audio';

interface StatusBadgeProps {
  status: DubbingStatus;
  errorMessage?: string | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  errorMessage,
}) => {
  const { t } = useTranslation();

  const getStatusDetails = () => {
    switch (status) {
      case 'ready':
        return {
          label: t('common.ready'),
          color: 'bg-base-200 text-base-content/80 border-base-300',
          dot: 'bg-base-content/40',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'connecting':
        return {
          label: t('common.connecting'),
          color: 'bg-warning/10 text-warning border-warning/30',
          dot: 'bg-warning animate-pulse',
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        };
      case 'listening':
        return {
          label: t('common.listening'),
          color: 'bg-primary/10 text-primary border-primary/30',
          dot: 'bg-primary animate-ping',
          icon: <Radio className="w-3.5 h-3.5" />,
        };
      case 'translating':
        return {
          label: t('common.translating'),
          color: 'bg-primary/10 text-primary border-primary/30',
          dot: 'bg-primary animate-pulse',
          icon: <Activity className="w-3.5 h-3.5" />,
        };
      case 'playing':
        return {
          label: t('common.playing'),
          color: 'bg-success/10 text-success border-success/30',
          dot: 'bg-success animate-pulse',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
        };
      case 'reconnecting':
        return {
          label: t('common.reconnecting'),
          color: 'bg-warning/10 text-warning border-warning/30',
          dot: 'bg-warning animate-ping',
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        };
      case 'error':
        return {
          label: t('common.error'),
          color: 'bg-error/10 text-error border-error/30',
          dot: 'bg-error',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-error" />,
        };
    }
  };

  const current = getStatusDetails();
  const isDubbingActive = status === 'listening' || status === 'translating' || status === 'playing';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-base-200 border border-base-300 rounded-xl">
      <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${current.color}`}>
          <span className={`w-2 h-2 rounded-full ${current.dot}`} />
          {current.icon}
          <span>{current.label}</span>
        </span>
        <span className="text-xs text-base-content/70">
          {isDubbingActive ? t(`status.${status}Desc`) : t('status.readyDesc')}
        </span>
      </div>

      {isDubbingActive && (
        <div className="badge badge-outline border-base-300 text-xs font-mono gap-1.5 p-2.5">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span>LIVE</span>
        </div>
      )}

      {status === 'error' && errorMessage && (
        <span className="text-xs text-error line-clamp-1">{errorMessage}</span>
      )}
    </div>
  );
};
