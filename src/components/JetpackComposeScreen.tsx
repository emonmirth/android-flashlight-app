import React from 'react';
import {
  Zap,
  ZapOff,
  Shield,
  ShieldAlert,
  Activity,
  Sliders,
  Bell,
  Sparkles,
  Layers,
  Smartphone,
  Info,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ShakeSettings, SensorReadout, ProximityState, FlashlightState } from '../types';

interface Props {
  settings: ShakeSettings;
  sensor: SensorReadout;
  proximity: ProximityState;
  flashlight: FlashlightState;
  onUpdateSettings: (updater: (prev: ShakeSettings) => ShakeSettings) => void;
  onToggleTorch: () => void;
  onTogglePocketSimulation: () => void;
  onSimulateShake: () => void;
  onOpenNotificationShade: () => void;
  onViewSourceCode: () => void;
}

export const JetpackComposeScreen: React.FC<Props> = ({
  settings,
  sensor,
  proximity,
  flashlight,
  onUpdateSettings,
  onToggleTorch,
  onTogglePocketSimulation,
  onSimulateShake,
  onOpenNotificationShade,
  onViewSourceCode,
}) => {
  const isPocketBlocked = settings.pocketModeEnabled && proximity.isNear;

  // Percentage of current sensor force relative to maximum displayable scale (35 m/s^2)
  const maxScale = 35;
  const currentForcePercent = Math.min(100, (sensor.magnitude / maxScale) * 100);
  const thresholdPercent = Math.min(100, (settings.sensitivity / maxScale) * 100);
  const isForceOverThreshold = sensor.magnitude >= settings.sensitivity;

  return (
    <div className="flex h-full flex-col bg-neutral-950 text-neutral-100 overflow-y-auto pb-12 select-none">
      {/* Jetpack Compose Material 3 TopAppBar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-900 bg-neutral-950/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-neutral-100">Shake Flashlight</h1>
            <p className="text-[10px] text-neutral-400">Android Service & Camera2 API</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="open-notif-shade-btn"
            onClick={onOpenNotificationShade}
            className="relative rounded-full p-2 text-neutral-400 hover:bg-neutral-900 hover:text-amber-400 transition"
            title="View Foreground Notification"
          >
            <Bell className="h-4 w-4" />
            {settings.serviceEnabled && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-neutral-950" />
            )}
          </button>

          <button
            id="view-source-code-top-btn"
            onClick={onViewSourceCode}
            className="flex items-center gap-1 rounded-full bg-neutral-800/80 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
            title="View Kotlin & Compose source code"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>Code</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Flashlight Hero Interactive Bulb Graphic */}
        <div className="relative flex flex-col items-center justify-center py-5">
          {/* Ambient Torch Glow */}
          {flashlight.isOn && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.65, 0.9, 0.65],
              }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute -top-6 h-48 w-48 rounded-full bg-amber-400/25 blur-3xl pointer-events-none"
            />
          )}

          {/* Flashlight Beam Simulation */}
          <div className="relative flex flex-col items-center">
            <button
              id="hero-torch-toggle-btn"
              onClick={onToggleTorch}
              className={`group relative flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300 ${
                flashlight.isOn
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-neutral-950 shadow-[0_0_50px_rgba(251,191,36,0.5)] ring-4 ring-amber-400/50 active:scale-95'
                  : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700 hover:text-neutral-300 active:scale-95'
              }`}
            >
              {flashlight.isOn ? (
                <Zap className="h-12 w-12 fill-current transition-transform group-hover:scale-105" />
              ) : (
                <ZapOff className="h-12 w-12 transition-transform group-hover:scale-105" />
              )}
            </button>

            {/* Status chip */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  flashlight.isOn
                    ? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${flashlight.isOn ? 'bg-amber-400 animate-pulse' : 'bg-neutral-500'}`}
                />
                Torch {flashlight.isOn ? 'ON' : 'OFF'}
              </span>

              {flashlight.isHardwareTorchActive && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  Hardware LED
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] text-neutral-500">
              Tap icon to toggle manually or shake phone
            </p>
          </div>
        </div>

        {/* Master Foreground Service Switch Card */}
        <div
          id="master-service-card"
          className={`rounded-2xl p-4 transition-all duration-200 border ${
            settings.serviceEnabled
              ? 'bg-neutral-900/90 border-amber-500/30 shadow-lg shadow-amber-950/20'
              : 'bg-neutral-900/50 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-100">
                  Shake Detection Service
                </h3>
                {settings.serviceEnabled && (
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                    Running
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {settings.serviceEnabled
                  ? 'Foreground Service active with persistent notification'
                  : 'Service paused. Shake gestures disabled.'}
              </p>
            </div>

            {/* Material 3 Switch */}
            <button
              id="master-service-toggle-btn"
              role="switch"
              aria-checked={settings.serviceEnabled}
              onClick={() =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  serviceEnabled: !prev.serviceEnabled,
                }))
              }
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.serviceEnabled ? 'bg-amber-400' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow-md ring-0 transition duration-200 ease-in-out mt-1 ${
                  settings.serviceEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sensitivity Adjustment Slider Card */}
        <div
          id="sensitivity-card"
          className="rounded-2xl bg-neutral-900/80 p-4 border border-neutral-800/80 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-neutral-200">Shake Sensitivity</h3>
            </div>
            <span className="font-mono text-xs font-bold text-amber-400">
              {settings.sensitivity.toFixed(1)} m/s²
            </span>
          </div>

          {/* Preset Buttons (Material 3 Filter Chips) */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: 'Gentle', value: 13, desc: 'Light shake' },
              { label: 'Balanced', value: 18, desc: 'Default' },
              { label: 'Firm', value: 25, desc: 'Avoids false trips' },
            ].map((preset) => {
              const isActive = Math.abs(settings.sensitivity - preset.value) < 1.5;
              return (
                <button
                  key={preset.label}
                  id={`sensitivity-preset-${preset.label.toLowerCase()}`}
                  onClick={() =>
                    onUpdateSettings((prev) => ({ ...prev, sensitivity: preset.value }))
                  }
                  className={`flex flex-col items-center justify-center rounded-xl p-2 text-center transition ${
                    isActive
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-medium'
                      : 'bg-neutral-800/60 text-neutral-400 border border-neutral-700/40 hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-xs font-semibold">{preset.label}</span>
                  <span className="text-[10px] text-neutral-400">{preset.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Continuous Slider */}
          <div className="space-y-1 pt-1">
            <input
              id="sensitivity-slider"
              type="range"
              min={10}
              max={30}
              step={0.5}
              value={settings.sensitivity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings((prev) => ({ ...prev, sensitivity: val }));
              }}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-neutral-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>10 m/s² (Very Sensitive)</span>
              <span>30 m/s² (Firm Shake)</span>
            </div>
          </div>

          {/* Real-time Force Gauge / Meter */}
          <div className="rounded-xl bg-neutral-950 p-3 border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Activity className="h-3.5 w-3.5 text-amber-400" />
                Live Accelerometer G-Force
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  isForceOverThreshold ? 'text-amber-400' : 'text-neutral-300'
                }`}
              >
                {sensor.magnitude.toFixed(1)} m/s²
              </span>
            </div>

            {/* Gauge bar with threshold marker */}
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-neutral-800">
              {/* Dynamic current force bar */}
              <div
                className={`h-full transition-all duration-75 ${
                  isForceOverThreshold
                    ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                    : 'bg-neutral-500'
                }`}
                style={{ width: `${currentForcePercent}%` }}
              />

              {/* Threshold Target Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10 shadow-[0_0_4px_red]"
                style={{ left: `${thresholdPercent}%` }}
                title={`Activation Threshold: ${settings.sensitivity} m/s²`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-neutral-400">
              <span>0 m/s²</span>
              <span className="text-red-400 font-medium">▲ Trigger Threshold</span>
              <span>35 m/s²</span>
            </div>
          </div>
        </div>

        {/* Pocket & Bag Proximity Protection Card */}
        <div
          id="proximity-card"
          className="rounded-2xl bg-neutral-900/80 p-4 border border-neutral-800/80 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  isPocketBlocked
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {isPocketBlocked ? (
                  <ShieldAlert className="h-4 w-4" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">Pocket Protection</h3>
                <p className="text-[11px] text-neutral-400">
                  Ignores shakes when phone is inside pocket or bag
                </p>
              </div>
            </div>

            <button
              id="pocket-mode-toggle-btn"
              role="switch"
              aria-checked={settings.pocketModeEnabled}
              onClick={() =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  pocketModeEnabled: !prev.pocketModeEnabled,
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                settings.pocketModeEnabled ? 'bg-emerald-500' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-1 ${
                  settings.pocketModeEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Proximity Status Banner & Simulation Button */}
          {settings.pocketModeEnabled && (
            <div className="rounded-xl bg-neutral-950 p-3 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Proximity Sensor Status:</span>
                <span
                  className={`font-semibold flex items-center gap-1.5 ${
                    proximity.isNear ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      proximity.isNear ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
                    }`}
                  />
                  {proximity.isNear ? 'Inside Pocket / Covered (0 cm)' : 'Clear / Unobstructed'}
                </span>
              </div>

              {isPocketBlocked && (
                <div className="rounded-lg bg-red-950/40 p-2 text-[11px] text-red-300 border border-red-900/40">
                  ⚠️ Shake gestures are currently suppressed because proximity sensor is covered.
                </div>
              )}

              {/* Simulation button so users on desktop can test this pocket protection logic */}
              <button
                id="simulate-pocket-btn"
                onClick={onTogglePocketSimulation}
                className={`w-full rounded-xl py-2 px-3 text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  proximity.isNear
                    ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                    : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5 text-amber-400" />
                {proximity.isNear
                  ? 'Remove from Pocket (Uncover Sensor)'
                  : 'Put Phone in Pocket (Cover Proximity Sensor)'}
              </button>
            </div>
          )}
        </div>

        {/* Shake Motion Trigger & Hardware Actions */}
        <div className="rounded-2xl bg-neutral-900/80 p-4 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200">Test Gesture Motion</h3>
            <span className="text-[11px] text-neutral-400">
              {typeof window !== 'undefined' && 'DeviceMotionEvent' in window
                ? 'Device motion active'
                : 'Simulator active'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="simulate-shake-btn"
              onClick={onSimulateShake}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 px-3 text-xs font-bold text-neutral-950 shadow-md hover:bg-amber-300 active:scale-95 transition"
            >
              <Sparkles className="h-4 w-4" />
              Simulate Shake Gesture
            </button>

            <button
              id="toggle-notification-btn"
              onClick={onOpenNotificationShade}
              className="flex items-center justify-center gap-2 rounded-xl bg-neutral-800 py-2.5 px-3 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 active:scale-95 transition"
            >
              <Bell className="h-4 w-4 text-amber-400" />
              Pull Down Notif Shade
            </button>
          </div>

          <p className="text-[10px] text-neutral-400 text-center">
            💡 If opening on an Android phone, shake your physical phone directly!
          </p>
        </div>

        {/* Architecture & Hardware Features Info */}
        <div className="rounded-xl bg-neutral-900/40 p-3 border border-neutral-800/50 text-[11px] text-neutral-400 space-y-1">
          <div className="flex items-center gap-1 text-neutral-300 font-medium">
            <Info className="h-3.5 w-3.5 text-amber-400" />
            <span>Android Production Architecture</span>
          </div>
          <p>
            • <strong>SensorManager</strong>: Listens to SENSOR_DELAY_GAME accelerometer events.
          </p>
          <p>
            • <strong>CameraManager</strong>: Uses Camera2 API setTorchMode(id, true/false).
          </p>
          <p>
            • <strong>Foreground Service</strong>: Keeps partial WakeLock so shakes work when screen is off.
          </p>
          <p>
            • <strong>Proximity Guard</strong>: Prevents unintentional activation while inside pockets.
          </p>
        </div>
      </div>
    </div>
  );
};
