import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioApplicationInfo, AudioDeviceInfo, AudioSourceType, DubbingStatus } from '../types/audio';
import {
  fetchAudioApplications,
  fetchAudioDevices,
  startDubbingCommand,
  stopDubbingCommand,
  updateVolumeCommand,
  listenDubbingEvents,
} from '../lib/tauri';
import { useSettingsStore } from './settingsStore';

export interface AudioStoreState {
  status: DubbingStatus;
  selectedAppId: string;
  applications: AudioApplicationInfo[];
  outputDevices: AudioDeviceInfo[];
  selectedOutputId: string;
  dubbedVolume: number;
  isDubbedMuted: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  errorMessage: string | null;
}

export function useAudioStore() {
  const { settings, updateSettings } = useSettingsStore();

  const [status, setStatus] = useState<DubbingStatus>('ready');
  const [selectedAppId, setSelectedAppId] = useState<string>('chrome');
  const [applications, setApplications] = useState<AudioApplicationInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDeviceInfo[]>([]);
  const [selectedOutputId, setSelectedOutputId] = useState<string>(settings.outputDeviceId || 'default');

  const [dubbedVolume, setDubbedVolumeState] = useState<number>(settings.dubbedVolume);
  const [isDubbedMuted, setIsDubbedMutedState] = useState<boolean>(settings.isDubbedMuted);

  const [sourceLanguage, setSourceLanguage] = useState<string>(settings.sourceLanguage || 'auto');
  const [targetLanguage, setTargetLanguage] = useState<string>(settings.targetLanguage || 'fa');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [SYS] Dubly Real-Time Audio Engine Ready`,
  ]);

  const unlistenRef = useRef<(() => void) | null>(null);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-49), `[${time}] ${msg}`]);
  }, []);

  const refreshDevicesAndApps = useCallback(async () => {
    const apps = await fetchAudioApplications();
    const devs = await fetchAudioDevices();
    setApplications(apps);
    setOutputDevices(devs);
  }, []);

  useEffect(() => {
    refreshDevicesAndApps();
    const interval = setInterval(refreshDevicesAndApps, 5000);
    return () => clearInterval(interval);
  }, [refreshDevicesAndApps]);

  const setupTauriListeners = useCallback(async () => {
    if (unlistenRef.current) {
      unlistenRef.current();
      unlistenRef.current = null;
    }
    const unlisten = await listenDubbingEvents(
      (s) => {
        if (s === 'playing') setStatus('playing');
        else if (s === 'connecting') setStatus('connecting');
        else if (s === 'ready') setStatus('ready');
        else if (s === 'error') setStatus('error');
      },
      (log) => addLog(log),
      (err) => {
        setErrorMessage(err);
        setStatus('error');
        addLog(`[ERROR] ${err}`);
      },
    );
    unlistenRef.current = unlisten;
  }, [addLog]);

  useEffect(() => {
    setupTauriListeners();
    return () => {
      if (unlistenRef.current) unlistenRef.current();
    };
  }, [setupTauriListeners]);

  const toggleDubbing = async () => {
    if (status === 'ready' || status === 'error') {
      if (!settings.geminiApiKey || settings.geminiApiKey.trim() === '') {
        setStatus('error');
        setErrorMessage('Please enter your Gemini API Key in Settings (⚙️) to connect to Gemini Live AI.');
        addLog('[ERROR] Gemini API Key is missing. Live dubbing aborted.');
        return;
      }

      setStatus('connecting');
      setErrorMessage(null);
      addLog(`[SYS] Starting pipeline — App: ${selectedAppId}`);
      addLog(`[WASAPI] Initializing Windows loopback capture...`);
      addLog(`[GEMINI] Tone: ${settings.voiceTone} | Vibe: ${settings.voiceVibe}`);

      const success = await startDubbingCommand({
        appId: selectedAppId,
        sourceLanguage,
        targetLanguage,
        apiKey: settings.geminiApiKey,
        outputDeviceId: selectedOutputId,
        model: settings.geminiModel || 'gemini-3.5-live-translate-preview',
        voiceTone: settings.voiceTone,
        voiceVibe: settings.voiceVibe,
      });

      if (!success) {
        setStatus('error');
        setErrorMessage('Failed to start dubbing pipeline. Check your API key and try again.');
        addLog('[ERROR] Pipeline failed to start. Check Gemini API key.');
      } else {
        setStatus('listening');
        addLog(`[PCM] Audio capture active → sending to Gemini Live`);
      }
    } else {
      setStatus('ready');
      await stopDubbingCommand();
      addLog('[SYS] Dubbing pipeline stopped.');
    }
  };

  const setDubbedVolume = (val: number) => {
    setDubbedVolumeState(val);
    updateSettings({ dubbedVolume: val });
    updateVolumeCommand({ dubbedVolume: val, isDubbedMuted });
  };

  const toggleDubbedMute = () => {
    const next = !isDubbedMuted;
    setIsDubbedMutedState(next);
    updateSettings({ isDubbedMuted: next });
    updateVolumeCommand({ dubbedVolume, isDubbedMuted: next });
  };

  const changeOutputDevice = (id: string) => {
    setSelectedOutputId(id);
    updateSettings({ outputDeviceId: id });
    const dev = outputDevices.find((d) => d.id === id);
    if (dev) {
      addLog(`[AUDIO] Output device changed to: ${dev.name}`);
    }
  };

  const updateSourceLang = (lang: string) => {
    setSourceLanguage(lang);
    updateSettings({ sourceLanguage: lang });
  };

  const updateTargetLang = (lang: string) => {
    setTargetLanguage(lang);
    updateSettings({ targetLanguage: lang });
  };

  return {
    status,
    selectedAppId,
    setSelectedAppId,
    applications,
    outputDevices,
    selectedOutputId,
    setSelectedOutputId: changeOutputDevice,
    dubbedVolume,
    setDubbedVolume,
    isDubbedMuted,
    toggleDubbedMute,
    sourceLanguage,
    setSourceLanguage: updateSourceLang,
    targetLanguage,
    setTargetLanguage: updateTargetLang,
    errorMessage,
    logs,
    toggleDubbing,
    refreshDevicesAndApps,
  };
}
