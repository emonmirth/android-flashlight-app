import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Zap,
  Smartphone,
  Layers,
  Download,
  Sliders,
  Shield,
  Activity,
  Code2,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';
import { JetpackComposeScreen } from './components/JetpackComposeScreen';
import { AndroidNotificationShade } from './components/AndroidNotificationShade';
import { LiveSensorDebugger } from './components/LiveSensorDebugger';
import { NativeCodeViewer } from './components/NativeCodeViewer';
import { InstallGuideModal } from './components/InstallGuideModal';
import { ShakeSettings, SensorReadout, ProximityState, FlashlightState } from './types';
import { hardwareManager } from './utils/hardwareManager';
import { soundManager, triggerHaptic } from './utils/audioHaptics';
import { generateAndroidStudioZip, downloadBlob } from './utils/zipExport';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'source_code'>('simulator');
  const [notificationShadeOpen, setNotificationShadeOpen] = useState(false);
  const [isSimulatingShake, setIsSimulatingShake] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [settings, setSettings] = useState<ShakeSettings>({
    serviceEnabled: true,
    sensitivity: 18, // m/s^2 (corresponds to ~1.8 - 2.4 Gs)
    pocketModeEnabled: true,
    hapticFeedback: true,
    soundFeedback: true,
    strobeMode: false,
    strobeSpeed: 100,
  });

  const [sensor, setSensor] = useState<SensorReadout>({
    x: 0.1,
    y: 9.8,
    z: 0.2,
    magnitude: 0.2,
    peakMagnitude: 0.2,
    isShaking: false,
    lastShakeTimestamp: 0,
  });

  const [proximity, setProximity] = useState<ProximityState>({
    isSupported: true,
    isNear: false,
    distanceCm: 12,
    simulatedNear: false,
  });

  const [flashlight, setFlashlight] = useState<FlashlightState>({
    isOn: false,
    isHardwareTorchActive: false,
    hardwareTorchSupported: false,
    hardwareError: null,
    toggleCount: 0,
  });

  // Keep references for callbacks
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const proximityRef = useRef(proximity);
  proximityRef.current = proximity;
  const flashlightRef = useRef(flashlight);
  flashlightRef.current = flashlight;

  // Toggle Torch function
  const handleToggleTorch = useCallback(async (explicitState?: boolean) => {
    const nextState = explicitState !== undefined ? explicitState : !flashlightRef.current.isOn;

    if (settingsRef.current.soundFeedback) {
      soundManager.playToggle(nextState);
    }
    if (settingsRef.current.hapticFeedback) {
      triggerHaptic(nextState ? [20, 30, 20] : 35);
    }

    // Call hardware manager
    const result = await hardwareManager.setTorch(nextState);

    setFlashlight((prev) => ({
      ...prev,
      isOn: nextState,
      isHardwareTorchActive: result.isHardware,
      hardwareError: result.error || null,
      toggleCount: prev.toggleCount + 1,
    }));
  }, []);

  // Shake trigger logic
  const handleShakeDetected = useCallback(() => {
    // 1. Service check
    if (!settingsRef.current.serviceEnabled) {
      return;
    }

    // 2. Pocket suppression check
    if (settingsRef.current.pocketModeEnabled && proximityRef.current.isNear) {
      console.log('Shake detected but suppressed: Phone is inside pocket or bag.');
      return;
    }

    // Trigger visual shake physics animation
    setIsSimulatingShake(true);
    setTimeout(() => setIsSimulatingShake(false), 500);

    if (settingsRef.current.soundFeedback) {
      soundManager.playShakeDetected();
    }

    handleToggleTorch();
  }, [handleToggleTorch]);

  // Can shake check
  const canShakeCheck = useCallback(() => {
    if (!settingsRef.current.serviceEnabled) return false;
    if (settingsRef.current.pocketModeEnabled && proximityRef.current.isNear) return false;
    return true;
  }, []);

  // Update sensitivity in hardware manager
  useEffect(() => {
    hardwareManager.updateSensitivity(settings.sensitivity);
  }, [settings.sensitivity]);

  // Motion sensor listener
  useEffect(() => {
    hardwareManager.startMotionListener(
      settings.sensitivity,
      () => {
        handleShakeDetected();
      },
      (data) => {
        setSensor(data);
      },
      canShakeCheck
    );

    return () => {
      hardwareManager.stopMotionListener();
    };
  }, [settings.sensitivity, handleShakeDetected, canShakeCheck]);

  // Pocket simulation toggle
  const handleTogglePocketSimulation = useCallback(() => {
    setProximity((prev) => {
      const nextNear = !prev.isNear;
      return {
        ...prev,
        isNear: nextNear,
        distanceCm: nextNear ? 0 : 12,
        simulatedNear: nextNear,
      };
    });
  }, []);

  // Manual shake simulation (for testing on desktop)
  const handleSimulateShake = useCallback(() => {
    setIsSimulatingShake(true);
    setTimeout(() => setIsSimulatingShake(false), 500);
    hardwareManager.triggerSimulatedShake(24, canShakeCheck);
  }, [canShakeCheck]);

  // Quick download Android project
  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      const zipBlob = await generateAndroidStudioZip();
      downloadBlob(zipBlob, 'ShakeFlashlight-AndroidStudio-Project.zip');
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-neutral-100 flex flex-col antialiased">
      {/* Top Application Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/90 px-4 py-3 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20 font-bold">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-neutral-100 tracking-tight">
                  Shake Flashlight
                </h1>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  Android Native App
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Accelerometer • CameraManager • Foreground Service • Proximity Sensor
              </p>
            </div>
          </div>

          {/* Navigation & Export */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800">
              <button
                id="nav-simulator-tab"
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'simulator'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Live Phone & Sensors</span>
              </button>

              <button
                id="nav-source-code-tab"
                onClick={() => setActiveTab('source_code')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'source_code'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Android Studio Code (Kotlin)</span>
              </button>
            </div>

            <button
              id="header-install-guide-btn"
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 px-3 py-2 text-xs font-semibold text-amber-400 border border-amber-400/30 transition"
              title="ফোনে ইনস্টল করার নিয়মাবলী"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>ফোনে ইনস্টল গাইড</span>
            </button>

            <button
              id="header-download-zip-btn"
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-200 border border-neutral-700 transition"
              title="Download runnable Android Studio project"
            >
              <Download className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Download ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-6">
        {activeTab === 'simulator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Center / Left: Realistic Android Phone running Jetpack Compose UI */}
            <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
              <AndroidPhoneFrame
                isFlashlightOn={flashlight.isOn}
                onShakeGesture={handleShakeDetected}
                isSimulatingShake={isSimulatingShake}
              >
                {/* Expandable Persistent Foreground Notification Shade */}
                <AndroidNotificationShade
                  isOpen={notificationShadeOpen}
                  onClose={() => setNotificationShadeOpen(false)}
                  serviceActive={settings.serviceEnabled}
                  isTorchOn={flashlight.isOn}
                  onToggleTorch={() => handleToggleTorch()}
                  onStopService={() => {
                    setSettings((prev) => ({ ...prev, serviceEnabled: false }));
                    setNotificationShadeOpen(false);
                  }}
                  onStartService={() => {
                    setSettings((prev) => ({ ...prev, serviceEnabled: true }));
                  }}
                />

                {/* Jetpack Compose UI Screen */}
                <JetpackComposeScreen
                  settings={settings}
                  sensor={sensor}
                  proximity={proximity}
                  flashlight={flashlight}
                  onUpdateSettings={setSettings}
                  onToggleTorch={() => handleToggleTorch()}
                  onTogglePocketSimulation={handleTogglePocketSimulation}
                  onSimulateShake={handleSimulateShake}
                  onOpenNotificationShade={() => setNotificationShadeOpen(true)}
                  onViewSourceCode={() => setActiveTab('source_code')}
                />
              </AndroidPhoneFrame>
            </div>

            {/* Right Side: Sensor Telemetry & Android Architecture Controls */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-4">
              {/* Telemetry & Real-Time Accelerometer Inspector */}
              <LiveSensorDebugger
                sensor={sensor}
                proximity={proximity}
                flashlight={flashlight}
                settings={settings}
              />

              {/* Interactive Hardware Feature Verification Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Real-time Accelerometer Sensor */}
                <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-neutral-200">
                      1. Accelerometer Sensor
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Measures continuous vector acceleration:
                    <br />
                    <code className="text-amber-300 font-mono text-[11px]">
                      gForce = sqrt(gx² + gy² + gz²)
                    </code>
                    . Features debounce cooldown of 600ms to eliminate erratic double toggles.
                  </p>
                  <button
                    onClick={handleSimulateShake}
                    className="w-full mt-2 rounded-xl bg-neutral-800 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition"
                  >
                    Test Shake Motion (24 m/s²)
                  </button>
                </div>

                {/* 2. CameraManager Torch Mode */}
                <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-neutral-200">
                      2. CameraManager Torch
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Controls hardware LED flash via Android Camera2{' '}
                    <code className="text-amber-300 font-mono text-[11px]">
                      setTorchMode(cameraId, true/false)
                    </code>
                    . Automatically detects rear camera flash unit with fallback.
                  </p>
                  <button
                    onClick={() => handleToggleTorch()}
                    className={`w-full mt-2 rounded-xl py-2 text-xs font-semibold transition ${
                      flashlight.isOn
                        ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300'
                        : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                    }`}
                  >
                    {flashlight.isOn ? 'Turn Torch Off' : 'Turn Torch On'}
                  </button>
                </div>

                {/* 3. Foreground Service */}
                <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-neutral-200">
                      3. Foreground Service
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Runs{' '}
                    <code className="text-amber-300 font-mono text-[11px]">
                      ShakeFlashlightService
                    </code>{' '}
                    with partial WakeLock and persistent notification so shake gestures work in
                    background & screen-off states.
                  </p>
                  <button
                    onClick={() => setNotificationShadeOpen((prev) => !prev)}
                    className="w-full mt-2 rounded-xl bg-neutral-800 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition"
                  >
                    {notificationShadeOpen ? 'Hide Notif Shade' : 'Pull Down Notif Shade'}
                  </button>
                </div>

                {/* 4. Proximity Sensor Pocket Protection */}
                <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-neutral-200">
                      4. Proximity Pocket Guard
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400">
                    When phone is inside a pocket or bag (distance &lt; 4cm), shake gestures are
                    completely ignored to prevent accidental activation.
                  </p>
                  <button
                    onClick={handleTogglePocketSimulation}
                    className={`w-full mt-2 rounded-xl py-2 text-xs font-semibold transition ${
                      proximity.isNear
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                    }`}
                  >
                    {proximity.isNear ? 'Sensor Covered (In Pocket)' : 'Sensor Clear (Out of Pocket)'}
                  </button>
                </div>
              </div>

              {/* Quick Jump to Kotlin Code Card */}
              <div className="rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-900/80 border border-neutral-800 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-200">
                    Full Native Android Studio Project Ready
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Includes Kotlin files, Manifest, Jetpack Compose Material 3 UI, and Gradle build scripts.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsGuideOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition"
                  >
                    <Smartphone className="h-4 w-4 text-amber-400" />
                    <span>ফোনে ইনস্টল গাইড</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('source_code')}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-300 transition shrink-0"
                  >
                    <Code2 className="h-4 w-4" />
                    View Kotlin Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Native Android Studio Code Explorer */
          <div className="h-[760px]">
            <NativeCodeViewer />
          </div>
        )}
      </main>

      {/* Installation Guide Modal */}
      <InstallGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onDownloadZip={handleDownloadZip}
        isDownloading={isExportingZip}
      />
    </div>
  );
}
