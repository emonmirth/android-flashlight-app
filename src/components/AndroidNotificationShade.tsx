import React from 'react';
import { Zap, X, ShieldCheck, Play, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serviceActive: boolean;
  isTorchOn: boolean;
  onToggleTorch: () => void;
  onStopService: () => void;
  onStartService: () => void;
}

export const AndroidNotificationShade: React.FC<Props> = ({
  isOpen,
  onClose,
  serviceActive,
  isTorchOn,
  onToggleTorch,
  onStopService,
  onStartService,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="android-notification-shade"
          initial={{ y: -300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -300, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="absolute inset-x-0 top-0 z-50 rounded-t-[36px] bg-neutral-900/95 p-4 text-neutral-100 shadow-2xl backdrop-blur-md border-b border-neutral-800"
        >
          {/* Quick status bar drag handle */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Android System • Ongoing Notifications</span>
            </div>
            <button
              id="close-notification-shade-btn"
              onClick={onClose}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              aria-label="Close notification shade"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Notification Card */}
          {serviceActive ? (
            <div
              id="persistent-foreground-notification"
              className="mt-3 rounded-2xl bg-neutral-800/90 p-3.5 border border-neutral-700/60 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isTorchOn ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20' : 'bg-neutral-700 text-amber-400'}`}>
                    <Zap className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-neutral-200">Shake Flashlight</span>
                      <span className="rounded bg-neutral-700/80 px-1.5 py-0.5 text-[10px] font-medium text-neutral-300">
                        Foreground Service
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      {isTorchOn
                        ? 'Flashlight is ON • Shake phone to turn OFF'
                        : 'Shake detection active • Shake phone to turn ON'}
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-neutral-400">now</div>
              </div>

              {/* Notification Action Buttons */}
              <div className="mt-3 flex items-center gap-2 border-t border-neutral-700/60 pt-2.5">
                <button
                  id="notif-toggle-torch-btn"
                  onClick={onToggleTorch}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    isTorchOn
                      ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                      : 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  {isTorchOn ? 'Turn Off Light' : 'Turn On Light'}
                </button>

                <button
                  id="notif-stop-service-btn"
                  onClick={onStopService}
                  className="flex items-center gap-1.5 rounded-full bg-neutral-700/60 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-neutral-700 hover:text-red-300"
                >
                  <Square className="h-3 w-3" />
                  Stop Service
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl bg-neutral-800/60 p-4 text-center border border-neutral-800">
              <ShieldCheck className="mx-auto h-6 w-6 text-neutral-500 mb-1" />
              <p className="text-xs text-neutral-400">No active foreground services.</p>
              <button
                id="notif-start-service-btn"
                onClick={onStartService}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-amber-400"
              >
                <Play className="h-3 w-3 fill-current" />
                Start Shake Service
              </button>
            </div>
          )}

          <div className="mt-3 text-center">
            <button
              onClick={onClose}
              className="text-[11px] text-neutral-400 hover:text-neutral-200"
            >
              Swipe up or click to dismiss shade
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
