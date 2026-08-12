import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Volume2, Key, Info, LucideIcon } from 'lucide-react';

export type SettingsTabId = 'general' | 'audio' | 'gemini' | 'about';

interface SettingsSidebarProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
  appVersion: string;
}

interface TabItem {
  id: SettingsTabId;
  labelKey: string;
  icon: LucideIcon;
}

const tabs: TabItem[] = [
  { id: 'general', labelKey: 'settings.general', icon: Globe },
  { id: 'audio', labelKey: 'settings.audio', icon: Volume2 },
  { id: 'gemini', labelKey: 'settings.gemini', icon: Key },
  { id: 'about', labelKey: 'settings.about', icon: Info },
];

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeTab,
  onTabChange,
  appVersion,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full md:w-52 bg-base-200 border-b md:border-b-0 md:border-r rtl:md:border-r-0 rtl:md:border-l border-base-300/80 p-3.5 flex md:flex-col justify-between shrink-0 select-none h-full">
      <div className="flex md:flex-col space-x-1.5 md:space-x-0 md:space-y-1.5 w-full overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs w-full transition-all shrink-0 cursor-pointer text-start ${
                isActive
                  ? 'bg-primary text-white font-bold shadow-md'
                  : 'text-base-content/70 hover:bg-base-300/60 hover:text-white font-medium'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-white/20' : 'bg-base-300/70'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-base-content/60'}`} />
              </span>
              <span>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden md:flex items-center justify-between pt-3 mt-1 border-t border-base-300/80 px-1 text-[11px] text-base-content/50 select-none">
        <span>{t('common.appName')}</span>
        <span className="badge badge-sm badge-neutral font-mono">{appVersion}</span>
      </div>
    </div>
  );
};
