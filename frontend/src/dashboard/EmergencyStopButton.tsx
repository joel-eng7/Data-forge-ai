import React from 'react';
import { AlertOctagon, Lock, Unlock } from 'lucide-react';

interface EmergencyStopButtonProps {
  isEmergencyStopped: boolean;
  onEmergencyStop: () => void;
  onResume: () => void;
}

export default function EmergencyStopButton({
  isEmergencyStopped,
  onEmergencyStop,
  onResume
}: EmergencyStopButtonProps) {
  return (
    <div className="w-full">
      {isEmergencyStopped ? (
        <div className="rounded-3xl p-5 bg-gestura-goldLight border-2 border-gestura-yellow shadow-card-glass flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse-subtle">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gestura-yellow text-gestura-text flex items-center justify-center shrink-0 shadow-yellow-subtle">
              <Lock className="w-6 h-6 text-gestura-text" />
            </div>
            <div>
              <h4 className="font-display font-bold text-gestura-text text-lg sm:text-xl">
                Emergency Safe Stop Active
              </h4>
              <p className="text-xs sm:text-sm text-gestura-textMuted">
                All computer controls disarmed. Mouse movement and clicks are locked safely.
              </p>
            </div>
          </div>

          <button
            onClick={onResume}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold shadow-yellow-subtle hover:shadow-yellow-glow active:scale-95 transition-all flex items-center justify-center gap-2 border border-gestura-yellowHover"
          >
            <Unlock className="w-5 h-5 text-gestura-text" />
            Resume Gesture Controls
          </button>
        </div>
      ) : (
        <button
          onClick={onEmergencyStop}
          className="w-full group relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-[#171717] hover:bg-[#262626] text-white shadow-card-glass hover:shadow-yellow-glow active:scale-[0.99] transition-all flex items-center justify-between gap-4 border-2 border-gestura-yellow/60"
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-gestura-yellow text-gestura-text flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gestura-yellow font-bold block font-mono">
                Instant Emergency Failsafe
              </span>
              <h4 className="font-display font-extrabold text-white text-lg sm:text-2xl tracking-wide flex items-center gap-2">
                STOP CONTROL
                <span className="text-xs px-2 py-0.5 rounded-full bg-gestura-yellow/20 text-gestura-yellow border border-gestura-yellow/30 font-mono font-normal">
                  CLOSED FIST OR TAP
                </span>
              </h4>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-right">
            <span className="text-xs text-gray-300 font-medium">Clench fist or tap to disarm immediately</span>
            <div className="px-3.5 py-1.5 rounded-xl bg-gestura-yellow text-xs font-mono font-bold text-gestura-text border border-gestura-yellowHover">
              DISARM ALL
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
