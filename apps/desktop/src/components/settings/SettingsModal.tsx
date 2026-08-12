import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders, Check } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { testGeminiConnection, fetchAppVersion } from '../../lib/tauri';
import { Modal } from '../ui/Modal';
import { SettingsSidebar, SettingsTabId } from './SettingsSidebar';
import { GeneralTab } from './GeneralTab';
import { AudioTab } from './AudioTab';
import { GeminiTab } from './GeminiTab';
import { AboutTab } from './AboutTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey);
  const [modelInput, setModelInput] = useState(settings.geminiModel);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('0.1.0');

  useEffect(() => {
    fetchAppVersion().then((ver) => setAppVersion(ver));
  }, []);

  const [testState, setTestState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleSave = () => {
    updateSettings({ geminiApiKey: apiKeyInput, geminiModel: modelInput });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestState('error');
      setTestMessage('API Key is empty. Enter your key first.');
      return;
    }
    setTestState('loading');
    setTestMessage('');
    try {
      const result = await testGeminiConnection(apiKeyInput.trim(), modelInput.trim());
      setTestState('success');
      setTestMessage(result);
    } catch (e: any) {
      setTestState('error');
      setTestMessage(String(e));
    }
  };

  const footerContent = (
    <div className="w-full flex items-center justify-between select-none">
      <div className="flex items-center gap-2">
        {isSaved && (
          <span className="text-xs text-success font-semibold flex items-center gap-1.5 animate-in fade-in duration-150 bg-success/20 px-3 py-1 rounded-xl border border-success/30">
            <Check className="w-3.5 h-3.5" /> {t('settings.settingsSaved')}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm rounded-xl text-xs text-base-content/70 hover:text-white cursor-pointer"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary btn-sm px-6 rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.title')}
      icon={<Sliders className="w-5 h-5" />}
      size="2xl"
      footer={footerContent}
      className="h-[560px] max-h-[90vh] w-full max-w-2xl"
      bodyClassName="p-0 flex flex-col md:flex-row h-full overflow-hidden"
    >
      <SettingsSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        appVersion={appVersion}
      />

      <div className="flex-1 p-6 overflow-y-auto bg-base-200 h-full space-y-5">
        {activeTab === 'general' && (
          <GeneralTab
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}

        {activeTab === 'audio' && (
          <AudioTab
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}

        {activeTab === 'gemini' && (
          <GeminiTab
            apiKeyInput={apiKeyInput}
            onApiKeyChange={setApiKeyInput}
            modelInput={modelInput}
            onModelChange={setModelInput}
            showApiKey={showApiKey}
            onToggleShowApiKey={() => setShowApiKey(!showApiKey)}
            testState={testState}
            testMessage={testMessage}
            onTestConnection={handleTestConnection}
          />
        )}

        {activeTab === 'about' && (
          <AboutTab appVersion={appVersion} />
        )}
      </div>
    </Modal>
  );
};