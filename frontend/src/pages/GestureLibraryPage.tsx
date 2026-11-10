import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Hand3DCanvas from '../components/Hand3DCanvas';
import { GESTURE_DEFINITIONS } from '../gestures/gestureDefinitions';

export default function GestureLibraryPage() {
  const [activeGestureId, setActiveGestureId] = useState<string>('INDEX_POINTING');

  const gestures = Object.values(GESTURE_DEFINITIONS);
  const selectedGesture = GESTURE_DEFINITIONS[activeGestureId] || gestures[0];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-gestura-text">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gestura-goldLight text-gestura-text text-xs font-bold tracking-wider uppercase font-mono border border-gestura-yellow/40">
          <BookOpen className="w-3.5 h-3.5 text-gestura-text" />
          KINEMATIC GESTURE CATALOGUE
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-gestura-text tracking-tight">
          7 Universal Touchless Gestures
        </h1>
        <p className="text-sm sm:text-base text-gestura-textMuted leading-relaxed">
          Interactive 3D anatomical models and kinematic joint specifications for each touchless computer control gesture.
        </p>
      </div>

      {/* Featured Interactive 3D Gesture Inspector */}
      <div className="rounded-3xl p-6 sm:p-8 border border-gestura-border shadow-card-glass grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white">
        {/* Left: 3D Model Canvas (5 cols) */}
        <div className="lg:col-span-5 relative w-full aspect-square max-w-[420px] mx-auto rounded-3xl bg-gestura-surface border border-gestura-border p-2 overflow-hidden shadow-inner">
          <Hand3DCanvas
            currentGesture={selectedGesture.id}
            interactive={true}
            autoRotate={true}
            showParticles={true}
            zoom={1.1}
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-white border border-gestura-border text-xs font-mono font-bold text-gestura-text shadow-sm flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-gestura-yellow animate-pulse" />
              {selectedGesture.name}
            </span>
          </div>
        </div>

        {/* Right: Detailed Kinematic Specifications (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedGesture.emoji}</span>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gestura-textMuted">
                  {selectedGesture.category.toUpperCase()} CHANNEL
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gestura-text">
                  {selectedGesture.name}
                </h2>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gestura-goldLight text-gestura-text text-xs font-mono font-bold border border-gestura-yellow/40">
              <Zap className="w-3.5 h-3.5 text-gestura-text" />
              Desktop Action: {selectedGesture.action}
            </div>
          </div>

          <p className="text-sm text-gestura-textMuted leading-relaxed">
            {selectedGesture.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gestura-text font-mono flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-gestura-text" />
                How to Perform
              </h4>
              <p className="text-xs text-gestura-textMuted leading-relaxed">
                {selectedGesture.howToPerform}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gestura-text font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gestura-text" />
                Debounce & Threshold
              </h4>
              <p className="text-xs text-gestura-textMuted leading-relaxed">
                {selectedGesture.thresholdTips}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-2xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold text-xs shadow-yellow-subtle hover:shadow-yellow-glow transition-all active:scale-95 flex items-center gap-2"
            >
              Test Live in Dashboard
              <ArrowRight className="w-4 h-4 text-gestura-text" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of All 7 Gestures */}
      <div className="space-y-4">
        <h3 className="font-display font-extrabold text-xl text-gestura-text">
          Browse All 7 Supported Gestures
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gestures.map((g) => {
            const isSelected = g.id === activeGestureId;
            return (
              <div
                key={g.id}
                onClick={() => setActiveGestureId(g.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-4 select-none ${
                  isSelected
                    ? 'bg-gestura-goldLight border-gestura-yellow shadow-yellow-subtle ring-2 ring-gestura-yellow/60'
                    : 'bg-white hover:bg-gestura-surface border-gestura-border shadow-card-soft'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{g.emoji}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-gestura-border text-gestura-text font-bold">
                      {g.badge}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-gestura-text text-base mb-1">{g.name}</h4>
                  <p className="text-xs text-gestura-textMuted line-clamp-2">{g.description}</p>
                </div>

                <div className="pt-3 border-t border-gestura-border flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-gestura-text bg-gestura-yellow/30 px-2 py-0.5 rounded border border-gestura-yellow/40">
                    {g.action}
                  </span>
                  <span className="text-xs font-mono font-bold text-gestura-text">
                    {isSelected ? 'ACTIVE' : 'INSPECT'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
