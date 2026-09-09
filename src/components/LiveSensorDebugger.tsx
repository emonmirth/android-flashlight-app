import React from 'react';
import { Activity, Radio, AlertTriangle } from 'lucide-react';
import { SensorReadout, ProximityState, FlashlightState, ShakeSettings } from '../types';

interface Props {
  sensor: SensorReadout;
  proximity: ProximityState;
  flashlight: FlashlightState;
  settings: ShakeSettings;
}

export const LiveSensorDebugger: React.FC<Props> = ({
  sensor,
  proximity,
  flashlight,
  settings,
}) => {
  return (
    <div
      id="sensor-debugger-panel"
      className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4 text-xs space-y-3"
    >
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-2 text-neutral-200 font-semibold">
          <Radio className="h-4 w-4 text-amber-400 animate-pulse" />
          <span>Real-time Android Sensors Telemetry</span>
        </div>
        <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
          SENSOR_DELAY_GAME
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-neutral-950 p-2.5 border border-neutral-800/80">
          <div className="text-[10px] text-neutral-400 uppercase">Accel X</div>
          <div className="font-mono text-sm font-bold text-neutral-200">{sensor.x}</div>
          <div className="text-[9px] text-neutral-400">m/s²</div>
        </div>

        <div className="rounded-xl bg-neutral-950 p-2.5 border border-neutral-800/80">
          <div className="text-[10px] text-neutral-400 uppercase">Accel Y</div>
          <div className="font-mono text-sm font-bold text-neutral-200">{sensor.y}</div>
          <div className="text-[9px] text-neutral-400">m/s²</div>
        </div>

        <div className="rounded-xl bg-neutral-950 p-2.5 border border-neutral-800/80">
          <div className="text-[10px] text-neutral-400 uppercase">Accel Z</div>
          <div className="font-mono text-sm font-bold text-neutral-200">{sensor.z}</div>
          <div className="text-[9px] text-neutral-400">m/s²</div>
        </div>
      </div>

      <div className="rounded-xl bg-neutral-950 p-2.5 border border-neutral-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-amber-400" />
            Vector Force (|a|):
          </span>
          <span className="font-mono font-bold text-amber-400 text-sm">
            {sensor.magnitude} m/s²
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Threshold: {settings.sensitivity} m/s²</span>
          <span
            className={`font-semibold ${
              sensor.magnitude >= settings.sensitivity ? 'text-emerald-400' : 'text-neutral-400'
            }`}
          >
            {sensor.magnitude >= settings.sensitivity ? 'THRESHOLD EXCEEDED' : 'NORMAL'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-xl bg-neutral-950 p-2.5 border border-neutral-800/80">
          <span className="text-neutral-400 block">Proximity Sensor:</span>
          <span
            className={`font-semibold mt-0.5 inline-block ${
              proximity.isNear ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {proximity.isNear ? '🔴 Obstructed (Pocket)' : '🟢 Clear (< 5cm = near)'}
          </span>
        </div>

        <div className="rounded-xl bg-neutral-950 p-2.5 border border-neutral-800/80">
          <span className="text-neutral-400 block">Camera Torch:</span>
          <span
            className={`font-semibold mt-0.5 inline-block ${
              flashlight.isOn ? 'text-amber-400' : 'text-neutral-400'
            }`}
          >
            {flashlight.isOn ? '⚡ Active (Torch On)' : '⚪ Standby (Off)'}
          </span>
        </div>
      </div>

      {flashlight.hardwareError && (
        <div className="flex items-start gap-1.5 rounded-lg bg-amber-950/40 p-2 text-[10px] text-amber-300 border border-amber-900/40">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
          <span>{flashlight.hardwareError}</span>
        </div>
      )}
    </div>
  );
};
