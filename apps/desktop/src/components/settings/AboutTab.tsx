import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github, ExternalLink } from 'lucide-react';
import MascotImage from '../../assets/mascot.png';
import { openExternalUrl } from '../../lib/tauri';

interface AboutTabProps {
  appVersion: string;
}

export const AboutTab: React.FC<AboutTabProps> = ({ appVersion }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 animate-in fade-in duration-150 flex flex-col items-center text-center py-2">
      <div className="w-20 h-20 rounded-3xl bg-base-300/60 border border-base-300/80 flex items-center justify-center">
        <img src={MascotImage} alt="Goyak Mascot" className="w-12 h-12 object-contain drop-shadow-md" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white tracking-tight">{t('common.appName')}</h3>
        <p className="text-xs text-base-content/60 max-w-[220px] mx-auto">{t('settings.aboutTagline')}</p>
        <span className="badge badge-neutral font-mono text-[10px] mt-1">
          {t('settings.versionInfo', { version: appVersion })}
        </span>
      </div>

      <div className="w-full pt-4 border-t border-base-300/80">
        <button
          type="button"
          onClick={() => openExternalUrl('https://github.com/sajjadmrx/goyak')}
          className="btn btn-outline btn-lg w-full text-sm font-medium gap-2 rounded-full border-base-content/5"
        >
          <Github className="w-4 h-4" />
          <span>{t('settings.visitGithub')}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-auto rtl:ml-0 rtl:mr-auto" />
        </button>
      </div>
    </div>
  );
};
