import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ShieldCheck, Loader2, Wifi, CheckCircle2, AlertCircle } from 'lucide-react';

interface GeminiTabProps {
  apiKeyInput: string;
  onApiKeyChange: (val: string) => void;
  modelInput: string;
  onModelChange: (val: string) => void;
  showApiKey: boolean;
  onToggleShowApiKey: () => void;
  testState: 'idle' | 'loading' | 'success' | 'error';
  testMessage: string;
  onTestConnection: () => void;
}

export const GeminiTab: React.FC<GeminiTabProps> = ({
  apiKeyInput,
  onApiKeyChange,
  modelInput,
  onModelChange,
  showApiKey,
  onToggleShowApiKey,
  testState,
  testMessage,
  onTestConnection,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 text-start">
          {t('settings.model')}
        </label>
        <input
          type="text"
          value={modelInput}
          onChange={(e) => onModelChange(e.target.value)}
          placeholder="gemini-3.5-live-translate-preview"
          className="w-full bg-base-300 border border-base-300/80 text-white text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 text-start">
          {t('settings.apiKey')}
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKeyInput}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={t('settings.apiKeyPlaceholder')}
            className="w-full bg-base-300 border border-base-300/80 text-white text-xs rounded-xl p-3 pr-10 rtl:pr-3 rtl:pl-10 font-mono focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="button"
            onClick={onToggleShowApiKey}
            className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-white transition-colors cursor-pointer"
          >
            {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="alert-dashed border border-success/30 text-success text-[11px] p-2 rounded-2xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{t('settings.apiKeyNote')}</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          id="test-connection-btn"
          onClick={onTestConnection}
          disabled={testState === 'loading'}
          className="btn btn-md btn-primary w-full rounded-xl text-xs font-bold disabled:opacity-60 cursor-pointer"
        >
          {testState === 'loading' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wifi className="w-3.5 h-3.5" />
          )}
          {testState === 'loading' ? t('settings.testingConnection') : t('settings.testConnection')}
        </button>

        {testState === 'success' && (
          <div className="alert alert-success bg-success/10 border border-success/30 text-success text-[11px] p-3 rounded-2xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{testMessage}</span>
          </div>
        )}

        {testState === 'error' && (
          <div className="alert alert-error bg-error/20 border border-error/30 text-error text-[11px] p-3 rounded-2xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{testMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
