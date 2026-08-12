import { AudioApplicationInfo, AudioDeviceInfo } from '../types/audio';

let invokeTauri: any = null;
let listenTauri: any = null;

let _tauriReadyResolve: () => void = () => {};
export const tauriReady: Promise<void> = new Promise((resolve) => {
  _tauriReadyResolve = resolve;
});

try {
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    Promise.all([
      import('@tauri-apps/api/core'),
      import('@tauri-apps/api/event'),
    ]).then(([coreMod, eventMod]) => {
      invokeTauri = coreMod.invoke;
      listenTauri = eventMod.listen;
      _tauriReadyResolve();
    }).catch(() => {
      _tauriReadyResolve();
    });
  } else {
    _tauriReadyResolve();
  }
} catch (e) {
  _tauriReadyResolve();
}

export async function fetchAudioApplications(): Promise<AudioApplicationInfo[]> {
  await tauriReady;
  if (!invokeTauri) return [];
  try {
    return await invokeTauri('get_audio_applications');
  } catch (e) {
    return [];
  }
}

export async function fetchAudioDevices(): Promise<AudioDeviceInfo[]> {
  await tauriReady;
  if (!invokeTauri) return [];
  try {
    return await invokeTauri('get_output_devices');
  } catch (e) {
    return [];
  }
}

export async function startDubbingCommand(params: {
  appId?: string;
  sourceLanguage: string;
  targetLanguage: string;
  apiKey: string;
  outputDeviceId?: string;
  model?: string;
}): Promise<boolean> {
  await tauriReady;
  if (!invokeTauri) return false;
  try {
    return await invokeTauri('start_dubbing', {
      appId: params.appId,
      sourceLanguage: params.sourceLanguage,
      targetLanguage: params.targetLanguage,
      apiKey: params.apiKey,
      outputDeviceId: params.outputDeviceId,
    });
  } catch (e) {
    return false;
  }
}

export async function stopDubbingCommand(): Promise<boolean> {
  await tauriReady;
  if (!invokeTauri) return true;
  try {
    return await invokeTauri('stop_dubbing');
  } catch (e) {
    return true;
  }
}

export async function updateVolumeCommand(params: {
  dubbedVolume: number;
  isDubbedMuted: boolean;
}): Promise<boolean> {
  await tauriReady;
  if (!invokeTauri) return true;
  try {
    return await invokeTauri('update_audio_volumes', params);
  } catch (e) {
    return true;
  }
}

export async function testGeminiConnection(apiKey: string, model: string): Promise<string> {
  await tauriReady;
  if (!invokeTauri) throw new Error('Tauri not available');
  return await invokeTauri('test_gemini_connection', { apiKey, model });
}

export async function listenDubbingEvents(
  onStatus: (status: string) => void,
  onLog: (log: string) => void,
  onError: (err: string) => void,
): Promise<(() => void) | null> {
  await tauriReady;
  if (!listenTauri) return null;

  const unlisteners: Array<() => void> = [];

  const u1 = await listenTauri('dubbing_status', (event: any) => {
    onStatus(event.payload as string);
  });
  unlisteners.push(u1);

  const u2 = await listenTauri('dubbing_log', (event: any) => {
    onLog(event.payload as string);
  });
  unlisteners.push(u2);

  const u3 = await listenTauri('dubbing_error', (event: any) => {
    onError(event.payload as string);
  });
  unlisteners.push(u3);

  return () => unlisteners.forEach((u) => u());
}
