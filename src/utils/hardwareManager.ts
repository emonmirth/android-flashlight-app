import { FlashlightState, SensorReadout } from '../types';

export class HardwareManager {
  private mediaStream: MediaStream | null = null;
  private videoTrack: MediaStreamTrack | null = null;
  private torchSupported: boolean = false;
  private lastShakeTime: number = 0;
  private motionListenerAttached: boolean = false;
  private onShakeCallback: (() => void) | null = null;
  private onSensorUpdate: ((data: SensorReadout) => void) | null = null;

  private currentX = 0;
  private currentY = 0;
  private currentZ = 0;
  private currentMag = 0;
  private peakMag = 0;
  private sensitivityThreshold = 15; // default m/s^2

  constructor() {
    this.checkTorchCapability();
  }

  async checkTorchCapability(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.torchSupported = false;
      return false;
    }
    return this.torchSupported;
  }

  async setTorch(enable: boolean): Promise<{ success: boolean; isHardware: boolean; error?: string }> {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        return { success: true, isHardware: false };
      }

      if (enable) {
        if (!this.videoTrack) {
          try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: 'environment' },
                // @ts-expect-error Torch is a non-standard constraint in some browsers
                advanced: [{ torch: true }],
              },
            });
            this.videoTrack = this.mediaStream.getVideoTracks()[0] || null;
          } catch (e: unknown) {
            console.warn('Camera/Torch access error:', e);
            return {
              success: true,
              isHardware: false,
              error: 'Camera torch not available on this device/browser (using screen flash simulation)',
            };
          }
        }

        if (this.videoTrack) {
          const capabilities = (this.videoTrack.getCapabilities?.() || {}) as { torch?: boolean };
          if (capabilities.torch) {
            // @ts-expect-error Torch constraint
            await this.videoTrack.applyConstraints({ advanced: [{ torch: true }] });
            this.torchSupported = true;
            return { success: true, isHardware: true };
          }
        }
        return { success: true, isHardware: false };
      } else {
        if (this.videoTrack) {
          try {
            // @ts-expect-error Torch constraint
            await this.videoTrack.applyConstraints({ advanced: [{ torch: false }] });
          } catch {
            // Ignore error
          }
          this.videoTrack.stop();
          this.videoTrack = null;
        }
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((track) => track.stop());
          this.mediaStream = null;
        }
        return { success: true, isHardware: false };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, isHardware: false, error: msg };
    }
  }

  startMotionListener(
    threshold: number,
    onShake: () => void,
    onUpdate: (data: SensorReadout) => void,
    canShakeCheck?: () => boolean
  ): boolean {
    this.sensitivityThreshold = threshold;
    this.onShakeCallback = onShake;
    this.onSensorUpdate = onUpdate;

    if (this.motionListenerAttached) return true;

    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      return false;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      let x = 0;
      let y = 0;
      let z = 0;
      let magnitude = 0;

      if (event.acceleration && (event.acceleration.x !== null || event.acceleration.y !== null)) {
        x = event.acceleration.x || 0;
        y = event.acceleration.y || 0;
        z = event.acceleration.z || 0;
        magnitude = Math.sqrt(x * x + y * y + z * z);
      } else if (event.accelerationIncludingGravity) {
        x = event.accelerationIncludingGravity.x || 0;
        y = event.accelerationIncludingGravity.y || 0;
        z = event.accelerationIncludingGravity.z || 0;
        const totalWithG = Math.sqrt(x * x + y * y + z * z);
        magnitude = Math.abs(totalWithG - 9.81);
      }

      this.currentX = x;
      this.currentY = y;
      this.currentZ = z;
      this.currentMag = magnitude;
      if (magnitude > this.peakMag) {
        this.peakMag = magnitude;
      } else {
        this.peakMag = Math.max(0, this.peakMag * 0.95);
      }

      const now = Date.now();
      let triggered = false;

      // Shake condition
      if (magnitude >= this.sensitivityThreshold) {
        if (now - this.lastShakeTime > 600) {
          const allowed = canShakeCheck ? canShakeCheck() : true;
          if (allowed) {
            this.lastShakeTime = now;
            triggered = true;
            this.onShakeCallback?.();
          }
        }
      }

      this.onSensorUpdate?.({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        z: Number(z.toFixed(2)),
        magnitude: Number(magnitude.toFixed(2)),
        peakMagnitude: Number(this.peakMag.toFixed(2)),
        isShaking: triggered,
        lastShakeTimestamp: this.lastShakeTime,
      });
    };

    window.addEventListener('devicemotion', handleMotion);
    this.motionListenerAttached = true;
    return true;
  }

  updateSensitivity(threshold: number) {
    this.sensitivityThreshold = threshold;
  }

  stopMotionListener() {
    // Keep listener passive or detach if needed
  }

  triggerSimulatedShake(force: number = 22, canShakeCheck?: () => boolean) {
    const now = Date.now();
    this.currentMag = force;
    this.peakMag = force;
    const allowed = canShakeCheck ? canShakeCheck() : true;

    if (force >= this.sensitivityThreshold && now - this.lastShakeTime > 400 && allowed) {
      this.lastShakeTime = now;
      this.onShakeCallback?.();
    }

    this.onSensorUpdate?.({
      x: Number((Math.random() * force - force / 2).toFixed(2)),
      y: Number((Math.random() * force - force / 2).toFixed(2)),
      z: Number((Math.random() * force).toFixed(2)),
      magnitude: force,
      peakMagnitude: force,
      isShaking: allowed && force >= this.sensitivityThreshold,
      lastShakeTimestamp: this.lastShakeTime,
    });
  }
}

export const hardwareManager = new HardwareManager();
