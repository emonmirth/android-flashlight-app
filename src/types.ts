export interface ShakeSettings {
  serviceEnabled: boolean;
  sensitivity: number; // m/s^2 threshold, default ~14
  pocketModeEnabled: boolean;
  hapticFeedback: boolean;
  soundFeedback: boolean;
  strobeMode: boolean;
  strobeSpeed: number; // ms (50 - 500 ms)
  autoOffMinutes: number; // 0 for Never, or 1, 3, 5, 10 mins
}

export interface SensorReadout {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  peakMagnitude: number;
  isShaking: boolean;
  lastShakeTimestamp: number;
}

export interface ProximityState {
  isSupported: boolean;
  isNear: boolean; // pocket / covered
  distanceCm: number;
  simulatedNear: boolean;
}

export interface FlashlightState {
  isOn: boolean;
  isHardwareTorchActive: boolean;
  hardwareTorchSupported: boolean;
  hardwareError: string | null;
  toggleCount: number;
}

export interface AndroidFile {
  path: string;
  name: string;
  category: 'kotlin' | 'manifest' | 'gradle' | 'resource';
  code: string;
  description: string;
}
