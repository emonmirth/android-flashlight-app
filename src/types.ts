export interface ShakeSettings {
  serviceEnabled: boolean;
  sensitivity: number; // m/s^2 threshold, default ~14
  pocketModeEnabled: boolean;
  hapticFeedback: boolean;
  soundFeedback: boolean;
  autoOffMinutes: number; // 0 for Never, or 1, 3, 5, 10 mins
  torchBrightness: number; // 1 to 5 (max)
  themeColor: 'amber' | 'blue' | 'emerald' | 'purple';
  scheduleEnabled: boolean;
  scheduleStartHour: number; // e.g. 22
  scheduleEndHour: number; // e.g. 6
  totalToggles: number;
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
