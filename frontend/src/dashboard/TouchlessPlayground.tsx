import React, { useState, useEffect } from 'react';
import { Target, Sparkles, Trophy, RotateCcw, X } from 'lucide-react';

interface TargetItem {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  radius: number;
  popped: boolean;
}

interface TouchlessPlaygroundProps {
  currentGesture: string;
  isConfirmed: boolean;
  fingertip: { x: number; y: number };
  onClose?: () => void;
}

export default function TouchlessPlayground({
  currentGesture,
  isConfirmed,
  fingertip,
  onClose
}: TouchlessPlaygroundProps) {
  const [score, setScore] = useState<number>(0);
  const [targets, setTargets] = useState<TargetItem[]>([
    { id: 1, x: 25, y: 35, radius: 28, popped: false },
    { id: 2, x: 70, y: 30, radius: 28, popped: false },
    { id: 3, x: 50, y: 65, radius: 28, popped: false },
  ]);

  // Check collision between index fingertip position and targets
  useEffect(() => {
    const tipXPercent = fingertip.x * 100;
    const tipYPercent = fingertip.y * 100;

    // A pop triggers if finger is on target and user does a PINCH or stays over it
    const isPinchingOrClicking = currentGesture === 'PINCH' || currentGesture === 'TWO_FINGER_PINCH';

    targets.forEach(t => {
      if (t.popped) return;
      const dist = Math.hypot(tipXPercent - t.x, tipYPercent - t.y);

      // Hit detected
      if (dist < 10) {
        if (isPinchingOrClicking || dist < 6) {
          popTarget(t.id);
        }
      }
    });
  }, [fingertip, currentGesture, targets]);

  const popTarget = (id: number) => {
    setTargets(prev =>
      prev.map(t => {
        if (t.id === id && !t.popped) {
          setScore(s => s + 100);
          return { ...t, popped: true };
        }
        return t;
      })
    );

    // Respawn target after 1.2s at random coordinate
    setTimeout(() => {
      setTargets(prev =>
        prev.map(t => {
          if (t.id === id) {
            return {
              ...t,
              x: Math.floor(15 + Math.random() * 70),
              y: Math.floor(20 + Math.random() * 60),
              popped: false
            };
          }
          return t;
        })
      );
    }, 1200);
  };

  const resetPlayground = () => {
    setScore(0);
    setTargets([
      { id: 1, x: 25, y: 35, radius: 28, popped: false },
      { id: 2, x: 70, y: 30, radius: 28, popped: false },
      { id: 3, x: 50, y: 65, radius: 28, popped: false },
    ]);
  };

  return (
    <div className="rounded-3xl p-6 bg-white border-2 border-gestura-border shadow-card-glass space-y-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gestura-yellow text-gestura-text flex items-center justify-center shadow-yellow-subtle font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gestura-text text-lg">
              Touchless Practice Playground
            </h3>
            <p className="text-xs text-gestura-textMuted">
              Point with Index Finger and Pinch to pop floating target bubbles!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-gestura-goldLight border border-gestura-yellow/40 text-gestura-text font-mono font-bold text-xs flex items-center gap-1.5 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-gestura-text" />
            <span>Score: {score}</span>
          </div>

          <button
            onClick={resetPlayground}
            className="p-1.5 rounded-xl text-gestura-textMuted hover:text-gestura-text hover:bg-gestura-surface transition-colors"
            title="Reset Targets"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gestura-textMuted hover:text-gestura-text hover:bg-gestura-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Arena */}
      <div className="relative w-full h-72 rounded-2xl bg-[#171717] overflow-hidden border border-gestura-border select-none shadow-inner">
        {/* Grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Floating Bubble Targets */}
        {targets.map(t => (
          <div
            key={t.id}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center ${
              t.popped
                ? 'scale-0 opacity-0'
                : 'animate-pulse scale-100 opacity-100 shadow-yellow-glow cursor-pointer'
            }`}
          >
            <div className="w-full h-full rounded-full bg-gestura-yellow border-2 border-white flex items-center justify-center text-gestura-text font-bold text-xs shadow-lg">
              <Sparkles className="w-5 h-5 text-gestura-text fill-gestura-text animate-spin-slow" />
            </div>
          </div>
        ))}

        {/* Real-time Hand Crosshair Reticle tracking user's index finger! */}
        <div
          style={{
            left: `${Math.max(5, Math.min(95, fingertip.x * 100))}%`,
            top: `${Math.max(5, Math.min(95, fingertip.y * 100))}%`
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 z-20"
        >
          {/* Outer Crosshair Ring */}
          <div className="w-10 h-10 rounded-full border-2 border-gestura-yellow flex items-center justify-center animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-glow-yellow" />
          </div>
          {/* Crosshair ticks */}
          <div className="absolute top-1/2 -left-2 w-2 h-0.5 bg-gestura-yellow -translate-y-1/2" />
          <div className="absolute top-1/2 -right-2 w-2 h-0.5 bg-gestura-yellow -translate-y-1/2" />
          <div className="absolute -top-2 left-1/2 w-0.5 h-2 bg-gestura-yellow -translate-x-1/2" />
          <div className="absolute -bottom-2 left-1/2 w-0.5 h-2 bg-gestura-yellow -translate-x-1/2" />
        </div>

        {/* Gesture State Pill in Arena */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-gestura-yellow/40 text-white text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gestura-yellow animate-ping" />
          <span>Fingertip: ({(fingertip.x * 100).toFixed(0)}%, {(fingertip.y * 100).toFixed(0)}%)</span>
          <span className="text-gestura-yellow font-bold">[{currentGesture}]</span>
        </div>
      </div>
    </div>
  );
}
