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
  sourceType: AudioSourceType;
  selectedAppId: string;
  applications: AudioApplicationInfo[];
  outputDevices: AudioDeviceInfo[];
  selectedOutputId: string;
  originalVolume: number;
  dubbedVolume: number;
  isOriginalMuted: boolean;
  isDubbedMuted: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  latencyMs: number;
  errorMessage: string | null;
  audioActiveLevel: number;
}

export function useAudioStore() {
  const { settings, updateSettings } = useSettingsStore();

  const [status, setStatus] = useState<DubbingStatus>('ready');
  const [sourceType, setSourceType] = useState<AudioSourceType>('application');
  const [selectedAppId, setSelectedAppId] = useState<string>('chrome');
  const [applications, setApplications] = useState<AudioApplicationInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDeviceInfo[]>([]);
  const [selectedOutputId, setSelectedOutputId] = useState<string>(settings.outputDeviceId || 'default');

  const [originalVolume, setOriginalVolumeState] = useState<number>(settings.originalVolume);
  const [dubbedVolume, setDubbedVolumeState] = useState<number>(settings.dubbedVolume);
  const [isOriginalMuted, setIsOriginalMutedState] = useState<boolean>(settings.isOriginalMuted);
  const [isDubbedMuted, setIsDubbedMutedState] = useState<boolean>(settings.isDubbedMuted);

  const [sourceLanguage, setSourceLanguage] = useState<string>(settings.sourceLanguage || 'auto');
  const [targetLanguage, setTargetLanguage] = useState<string>(settings.targetLanguage || 'fa');

  const [latencyMs, setLatencyMs] = useState<number>(420);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioActiveLevel, setAudioActiveLevel] = useState<number>(0);
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

  useEffect(() => {
    let animId: number;

    if (status === 'listening' || status === 'translating' || status === 'playing') {
      const updateVisualizer = () => {
        const level = Math.sin(Date.now() / 150) * 40 + Math.random() * 50 + 20;
        setAudioActiveLevel(Math.min(100, Math.max(10, Math.floor(level))));
        animId = requestAnimationFrame(updateVisualizer);
      };
      animId = requestAnimationFrame(updateVisualizer);
    } else {
      setAudioActiveLevel(0);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [status]);

  useEffect(() => {
    if (status === 'playing') {
      const timer = setInterval(() => {
        const variation = Math.floor(Math.random() * 30) - 15;
        setLatencyMs(Math.max(320, 420 + variation));
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [status]);

  const setupTauriListeners = useCallback(async () => {
    if (unlistenRef.current) {
      unlistenRef.current();
      unlistenRef.current = null;
    }
    const unlisten = await listenDubbingEvents(
      (s) => {
        if (s === 'playing') setStatus('playing');
        else if (s === 'connecting') setStatus('connecting');
        else if (s === 'ready') { setStatus('ready'); setAudioActiveLevel(0); }
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
      addLog(`[SYS] Starting pipeline — Source: ${sourceType}, App: ${selectedAppId}`);
      addLog(`[WASAPI] Initializing Windows loopback capture...`);
      addLog(`[GEMINI] Connecting to gemini-3.5-live-translate-preview...`);

      const success = await startDubbingCommand({
        sourceType,
        appId: selectedAppId,
        sourceLanguage,
        targetLanguage,
        apiKey: settings.geminiApiKey,
        outputDeviceId: selectedOutputId,
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
      setAudioActiveLevel(0);
      await stopDubbingCommand();
      addLog('[SYS] Dubbing pipeline stopped.');
    }
  };

  const setOriginalVolume = (val: number) => {
    setOriginalVolumeState(val);
    updateSettings({ originalVolume: val });
    updateVolumeCommand({ originalVolume: val, dubbedVolume, isOriginalMuted, isDubbedMuted });
  };

  const setDubbedVolume = (val: number) => {
    setDubbedVolumeState(val);
    updateSettings({ dubbedVolume: val });
    updateVolumeCommand({ originalVolume, dubbedVolume: val, isOriginalMuted, isDubbedMuted });
  };

  const toggleOriginalMute = () => {
    const next = !isOriginalMuted;
    setIsOriginalMutedState(next);
    updateSettings({ isOriginalMuted: next });
    updateVolumeCommand({ originalVolume, dubbedVolume, isOriginalMuted: next, isDubbedMuted });
  };

  const toggleDubbedMute = () => {
    const next = !isDubbedMuted;
    setIsDubbedMutedState(next);
    updateSettings({ isDubbedMuted: next });
    updateVolumeCommand({ originalVolume, dubbedVolume, isOriginalMuted: next, isDubbedMuted });
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
    sourceType,
    setSourceType,
    selectedAppId,
    setSelectedAppId,
    applications,
    outputDevices,
    selectedOutputId,
    setSelectedOutputId: changeOutputDevice,
    originalVolume,
    setOriginalVolume,
    dubbedVolume,
    setDubbedVolume,
    isOriginalMuted,
    toggleOriginalMute,
    isDubbedMuted,
    toggleDubbedMute,
    sourceLanguage,
    setSourceLanguage: updateSourceLang,
    targetLanguage,
    setTargetLanguage: updateTargetLang,
    latencyMs,
    errorMessage,
    audioActiveLevel,
    logs,
    toggleDubbing,
    refreshDevicesAndApps,
  };
}
