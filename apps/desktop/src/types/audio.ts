export type AudioSourceType = 'system' | 'application';

export interface AudioApplicationInfo {
  id: string;
  name: string;
  processId: number;
  icon?: string;
  isAudioActive: boolean;
}

export interface AudioDeviceInfo {
  id: string;
  name: string;
  isDefault: boolean;
}

export type DubbingStatus =
  | 'ready'
  | 'connecting'
  | 'listening'
  | 'translating'
  | 'playing'
  | 'reconnecting'
  | 'error';

export interface DubbingSessionMetrics {
  latencyMs: number;
  packetsProcessed: number;
  sampleRate: number;
  bitrateKbps: number;
}
