import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children: React.ReactNode;
  isFlashlightOn: boolean;
  onShakeGesture: () => void;
  isSimulatingShake: boolean;
}

export const AndroidPhoneFrame: React.FC<Props> = ({
  children,
  isFlashlightOn,
  onShakeGesture,
  isSimulatingShake,
}) => {
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center justify-center p-2 sm:p-4">
      {/* Background Torch Illumination Effect when active */}
      {isFlashlightOn && (
        <div
          id="torch-ambient-illumination"
          className="pointer-events-none absolute -top-12 -left-12 -right-12 h-[600px] rounded-full bg-amber-400/15 blur-[100px] transition-opacity duration-300"
        />
      )}

      {/* Phone chassis with shake animation */}
      <motion.div
        animate={
          isSimulatingShake
            ? {
                x: [0, -18, 18, -14, 14, -8, 8, -3, 3, 0],
                rotate: [0, -3, 3, -2, 2, -1, 1, 0],
              }
            : { x: 0, rotate: 0 }
        }
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className="relative mx-auto w-full max-w-[390px] h-[780px] rounded-[48px] bg-neutral-950 p-3 shadow-2xl ring-1 ring-neutral-800/80 ring-offset-4 ring-offset-neutral-900 border-4 border-neutral-800"
      >
        {/* Hardware buttons on chassis */}
        {/* Volume rockers */}
        <div className="absolute -left-[7px] top-28 h-12 w-[3px] rounded-l-sm bg-neutral-700" />
        <div className="absolute -left-[7px] top-44 h-12 w-[3px] rounded-l-sm bg-neutral-700" />
        {/* Power button */}
        <div className="absolute -right-[7px] top-32 h-16 w-[3px] rounded-r-sm bg-neutral-700" />

        {/* Inner Phone Screen */}
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[40px] bg-neutral-950 border border-neutral-800/60 shadow-inner">
          {/* Android Status Bar */}
          <div className="flex h-8 items-center justify-between px-6 pt-1 text-[11px] font-semibold text-neutral-300 z-40 select-none">
            <span>{timeStr}</span>

            {/* Front Camera Hole Punch */}
            <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black ring-2 ring-neutral-900">
              <div className="h-1.5 w-1.5 rounded-full bg-neutral-800" />
            </div>

            <div className="flex items-center gap-1.5 text-neutral-300">
              <Wifi className="h-3 w-3" />
              <div className="text-[10px] font-mono">5G</div>
              <BatteryMedium className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Screen Content */}
          <div className="relative flex-1 overflow-hidden">{children}</div>

          {/* Android Gesture Navigation Pill */}
          <div className="flex h-5 items-center justify-center bg-neutral-950 z-40">
            <div className="h-1 w-28 rounded-full bg-neutral-600/70" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
