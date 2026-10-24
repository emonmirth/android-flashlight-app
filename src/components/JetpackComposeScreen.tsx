import React, { useState } from 'react';
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
  MoreVertical,
  RefreshCw,
  Volume2,
  Vibrate,
  BatteryCharging,
  Grid,
  Lock,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<
    'none' | 'update' | 'battery' | 'tile' | 'about' | 'privacy' | 'terms'
  >('none');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const isPocketBlocked = settings.pocketModeEnabled && proximity.isNear;

  const maxScale = 35;
  const currentForcePercent = Math.min(100, (sensor.magnitude / maxScale) * 100);
  const thresholdPercent = Math.min(100, (settings.sensitivity / maxScale) * 100);
  const isForceOverThreshold = sensor.magnitude >= settings.sensitivity;

  const handleCheckUpdate = () => {
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setActiveDialog('update');
    }, 800);
  };

  return (
    <div className="flex h-full flex-col bg-neutral-950 text-neutral-100 overflow-y-auto pb-12 select-none relative">
      {/* TopAppBar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-900 bg-neutral-950/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-neutral-100 flex items-center gap-1.5">
              Glim
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                v1.0.10
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400">EonMirth Shake Utility</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
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
            onClick={onViewSourceCode}
            className="flex items-center gap-1 rounded-full bg-neutral-800/80 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
            title="View Kotlin & Compose source code"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>Code</span>
          </button>

          {/* Three-Dot Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-full p-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
              title="Menu Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 z-50 w-56 rounded-2xl bg-neutral-900 border border-neutral-800 p-1.5 shadow-2xl space-y-0.5"
                  >
                    <button
                      onClick={() => { setMenuOpen(false); handleCheckUpdate(); }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <RefreshCw className="h-4 w-4 text-amber-400" />
                      Check for Updates
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); setActiveDialog('battery'); }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <BatteryCharging className="h-4 w-4 text-emerald-400" />
                      Battery Saver & MIUI Fix
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); setActiveDialog('tile'); }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <Grid className="h-4 w-4 text-blue-400" />
                      Quick Settings Tile Guide
                    </button>

                    <div className="my-1 border-t border-neutral-800" />

                    <button
                      onClick={() => { setMenuOpen(false); setActiveDialog('privacy'); }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <Lock className="h-4 w-4 text-emerald-400" />
                      Privacy Policy
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); setActiveDialog('terms'); }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <FileText className="h-4 w-4 text-blue-400" />
                      Terms & EonMirth License
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); setActiveDialog('about'); }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <Info className="h-4 w-4 text-purple-400" />
                      About EonMirth Glim
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Flashlight Hero Interactive Bulb Graphic */}
        <div className="relative flex flex-col items-center justify-center py-5">
          {flashlight.isOn && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.95, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
              className="absolute -top-6 h-52 w-52 rounded-full bg-amber-400/30 blur-3xl pointer-events-none"
            />
          )}

          <div className="relative flex flex-col items-center">
            <button
              onClick={onToggleTorch}
              className={`group relative flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300 ${
                flashlight.isOn
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-neutral-950 shadow-[0_0_60px_rgba(251,191,36,0.6)] ring-4 ring-amber-400/60 active:scale-95'
                  : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700 hover:text-neutral-300 active:scale-95'
              }`}
            >
              {flashlight.isOn ? (
                <Zap className="h-12 w-12 fill-current transition-transform group-hover:scale-105 animate-pulse" />
              ) : (
                <ZapOff className="h-12 w-12 transition-transform group-hover:scale-105" />
              )}
            </button>

            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${flashlight.isOn ? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40' : 'bg-neutral-800 text-neutral-400'}`}>
                <span className={`h-2 w-2 rounded-full ${flashlight.isOn ? 'bg-amber-400 animate-pulse' : 'bg-neutral-500'}`} />
                Torch {flashlight.isOn ? 'ON' : 'OFF'}
              </span>
            </div>

            <p className="mt-1 text-[11px] text-neutral-500">
              Shake phone to toggle flashlight
            </p>
          </div>
        </div>

        {/* Master Foreground Service Switch Card */}
        <div className={`rounded-2xl p-4 transition-all duration-200 border ${settings.serviceEnabled ? 'bg-neutral-900/90 border-amber-500/30 shadow-lg shadow-amber-950/20' : 'bg-neutral-900/50 border-neutral-800'}`}>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-100">Shake Detection Service</h3>
                {settings.serviceEnabled && (
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">Running</span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {settings.serviceEnabled ? 'Foreground Service active with persistent notification' : 'Service paused. Shake gestures disabled.'}
              </p>
            </div>

            <button
              role="switch"
              aria-checked={settings.serviceEnabled}
              onClick={() => onUpdateSettings((prev) => ({ ...prev, serviceEnabled: !prev.serviceEnabled }))}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${settings.serviceEnabled ? 'bg-amber-400' : 'bg-neutral-700'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow-md ring-0 transition duration-200 ease-in-out mt-1 ${settings.serviceEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Sensitivity & Auto-Off Timer Card */}
        <div id="sensitivity-card" className="rounded-2xl bg-neutral-900/80 p-4 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-neutral-200">Shake Sensitivity</h3>
            </div>
            <span className="font-mono text-xs font-bold text-amber-400">{settings.sensitivity.toFixed(1)} m/s²</span>
          </div>

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
                  onClick={() => onUpdateSettings((prev) => ({ ...prev, sensitivity: preset.value }))}
                  className={`flex flex-col items-center justify-center rounded-xl p-2 text-center transition ${isActive ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-medium' : 'bg-neutral-800/60 text-neutral-400 border border-neutral-700/40 hover:bg-neutral-800'}`}
                >
                  <span className="text-xs font-semibold">{preset.label}</span>
                  <span className="text-[10px] text-neutral-400">{preset.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-1">
            <input
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
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
            <span className="text-xs text-neutral-300 font-medium">Auto-off Timer:</span>
            <div className="flex gap-1.5">
              {[1, 3, 5, 10, 0].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onUpdateSettings((prev) => ({ ...prev, autoOffMinutes: mins }))}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${settings.autoOffMinutes === mins ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'}`}
                >
                  {mins > 0 ? `${mins}m` : 'Off'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Options Card */}
        <div className="rounded-2xl bg-neutral-900/80 p-4 border border-neutral-800/80 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-amber-400" />
            Feedback Options
          </h3>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onUpdateSettings((prev) => ({ ...prev, soundFeedback: !prev.soundFeedback }))}
              className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium border transition ${settings.soundFeedback ? 'bg-amber-400/10 border-amber-400/30 text-amber-300' : 'bg-neutral-800/50 border-neutral-800 text-neutral-400'}`}
            >
              <Volume2 className="h-4 w-4" />
              <span>Sound Effect</span>
            </button>

            <button
              onClick={() => onUpdateSettings((prev) => ({ ...prev, hapticFeedback: !prev.hapticFeedback }))}
              className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium border transition ${settings.hapticFeedback ? 'bg-amber-400/10 border-amber-400/30 text-amber-300' : 'bg-neutral-800/50 border-neutral-800 text-neutral-400'}`}
            >
              <Vibrate className="h-4 w-4" />
              <span>Haptic Vibration</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2 space-y-1">
          <a
            href="https://eonmirth-web.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400/90 font-medium hover:text-amber-300 transition"
          >
            <span>An official EonMirth Product</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="text-[10px] text-neutral-500">Open Source • Privacy First • No Tracking</p>
        </div>
      </div>

      {/* Dialog Modals */}
      <AnimatePresence>
        {activeDialog === 'update' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-400">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-100">App Update Status</h3>
                  <p className="text-xs text-neutral-400">Glim In-App Update Manager</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-300 font-medium">
                  <span>Current Installed:</span>
                  <span className="font-mono text-neutral-400">v1.0.10 (Build 11)</span>
                </div>
                <div className="flex justify-between text-amber-300 font-semibold">
                  <span>Remote Version:</span>
                  <span className="font-mono text-amber-400">v1.0.10 (Up to Date)</span>
                </div>
                <p className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">✅ You are running the latest version of Glim.</p>
              </div>

              <button onClick={() => setActiveDialog('none')} className="w-full py-2.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition">Close</button>
            </motion.div>
          </div>
        )}

        {activeDialog === 'privacy' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400"><Lock className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-base font-bold text-neutral-100">Privacy Policy</h3>
                  <p className="text-xs text-neutral-400">EonMirth Product Privacy Assurance</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs text-neutral-300">
                <p>🔒 <strong>Zero Data Collection:</strong> Glim collects zero personal data, analytics, or device identifiers.</p>
                <p>📸 <strong>Camera Permission:</strong> Used exclusively to control the physical LED torch hardware.</p>
              </div>
              <button onClick={() => setActiveDialog('none')} className="w-full py-2.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs hover:bg-emerald-400 transition">Accept & Close</button>
            </motion.div>
          </div>
        )}

        {activeDialog === 'terms' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400"><FileText className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-base font-bold text-neutral-100">Terms & License</h3>
                  <p className="text-xs text-neutral-400">Apache 2.0 & EonMirth Brand Policy</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs text-neutral-300">
                <p>📄 <strong>License:</strong> Licensed under the Apache License 2.0.</p>
              </div>
              <button onClick={() => setActiveDialog('none')} className="w-full py-2.5 rounded-xl bg-blue-500 text-neutral-950 font-bold text-xs hover:bg-blue-400 transition">I Understand</button>
            </motion.div>
          </div>
        )}

        {activeDialog === 'battery' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400"><BatteryCharging className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-base font-bold text-neutral-100">Battery Saver & MIUI Fix</h3>
                  <p className="text-xs text-neutral-400">Prevent app from being killed in background</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs text-neutral-300">
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 text-[11px]">
                  <li>Long press Glim icon on home screen</li>
                  <li>Tap 'App Info'</li>
                  <li>Select 'Battery Saver' -> 'No Restrictions'</li>
                </ol>
              </div>
              <button onClick={() => setActiveDialog('none')} className="w-full py-2.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs hover:bg-emerald-400 transition">Got It</button>
            </motion.div>
          </div>
        )}

        {activeDialog === 'tile' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400"><Grid className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-base font-bold text-neutral-100">Quick Settings Tile</h3>
                  <p className="text-xs text-neutral-400">Add Glim shortcut tile to notification shade</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs text-neutral-300">
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 text-[11px]">
                  <li>Swipe down twice to expand Quick Settings</li>
                  <li>Tap Edit (✏️) and drag 'Glim Shake' tile to toggles</li>
                </ol>
              </div>
              <button onClick={() => setActiveDialog('none')} className="w-full py-2.5 rounded-xl bg-blue-500 text-neutral-950 font-bold text-xs hover:bg-blue-400 transition">Close Guide</button>
            </motion.div>
          </div>
        )}

        {activeDialog === 'about' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400"><Zap className="h-6 w-6 fill-current" /></div>
                <div>
                  <h3 className="text-base font-bold text-neutral-100">Glim • Shake Utility</h3>
                  <p className="text-xs text-neutral-400">Version 1.0.10 (Build 11) • EonMirth</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs text-neutral-300">
                <p>🔒 <strong>Privacy First:</strong> Zero tracking, zero ads.</p>
                <p>⚡ <strong>Camera2 API:</strong> Direct LED torch control.</p>
              </div>
              <button onClick={() => setActiveDialog('none')} className="w-full py-2.5 rounded-xl bg-purple-500 text-neutral-950 font-bold text-xs hover:bg-purple-400 transition">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
