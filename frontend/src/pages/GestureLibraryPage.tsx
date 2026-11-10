import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  MousePointer,
  MousePointerClick,
  ArrowUpDown,
  Lock,
  ThumbsUp,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import Hand3DCanvas from '../components/Hand3DCanvas';
import { GESTURE_DEFINITIONS, GestureDefinition } from '../gestures/gestureDefinitions';

export default function GestureLibraryPage() {
  const [activeGestureId, setActiveGestureId] = useState<string>('INDEX_POINTING');

  const gestures = Object.values(GESTURE_DEFINITIONS);
  const selectedGesture = GESTURE_DEFINITIONS[activeGestureId] || gestures[0];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold tracking-wider uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          Comprehensive Gesture Library
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 tracking-tight">
          7 Universal Touchless Gestures
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Detailed documentation and interactive 3D kinematic models for each computer control gesture.
        </p>
      </div>

      {/* Featured Interactive 3D Gesture Inspector */}
      <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-rose-200/80 shadow-soft-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-r from-white via-rose-50/30 to-pink-50/20">
        {/* Left Side: 3D Model Canvas */}
        <div className="lg:col-span-5 relative w-full aspect-square max-w-[420px] mx-auto rounded-2xl bg-gradient-to-b from-white to-pink-50/50 border border-rose-200/60 p-2 shadow-inner">
          <Hand3DCanvas
            currentGesture={selectedGesture.id}
            interactive={true}
            autoRotate={true}
            showParticles={true}
            className="w-full h-full rounded-xl"
          />

          <div className="absolute top-4 left-4 p-2.5 rounded-xl glass-panel text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-2">
            <span className="text-xl">{selectedGesture.emoji}</span>
            <span>3D Pose Preview</span>
          </div>

          <div className="absolute bottom-4 inset-x-4 text-center">
            <span className="text-[11px] text-slate-400 bg-white/80 px-3 py-1 rounded-full border border-slate-200 backdrop-blur-sm">
              Click and drag to rotate hand in 3D
            </span>
          </div>
        </div>

        {/* Right Side: Selected Gesture Details */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xl">{selectedGesture.emoji}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedGesture.accentBg}`}>
              {selectedGesture.badge}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-400">
              ID: {selectedGesture.id}
            </span>
          </div>

          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              {selectedGesture.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Desktop Action:
              </span>
              <span className="text-sm font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                {selectedGesture.action}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {selectedGesture.description}
          </p>

          <div className="p-4 rounded-2xl bg-white/80 border border-rose-100 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              How to Perform
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              {selectedGesture.howToPerform}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/70 text-xs text-rose-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-semibold text-rose-700">Kinematic Calibration: </strong>
              {selectedGesture.thresholdTips}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of all 7 Gestures */}
      <div>
        <div className="text-center mb-6">
          <h3 className="font-display font-bold text-xl text-slate-900">
            Select a Gesture to Inspect
          </h3>
          <p className="text-xs text-slate-500">
            Click on any card to update the 3D model simulation above.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {gestures.map((g) => {
            const isSelected = activeGestureId === g.id;
            return (
              <div
                key={g.id}
                onClick={() => setActiveGestureId(g.id)}
                className={`cursor-pointer rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between group ${
                  isSelected
                    ? 'glass-panel-elevated border-rose-400 shadow-glow-pink scale-[1.02]'
                    : 'glass-panel border-rose-100 hover:border-rose-300 hover:shadow-soft'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-2 rounded-2xl bg-white shadow-xs border border-rose-100">
                      {g.emoji}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${g.accentBg}`}>
                      {g.badge}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                    {g.name}
                  </h4>
                  <p className="text-xs font-semibold text-rose-600 mt-1 mb-2">
                    {g.action}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {g.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-rose-100 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-rose-600' : 'text-slate-400 group-hover:text-rose-500'}>
                    {isSelected ? 'Active 3D Pose' : 'Preview 3D Model'}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-rose-600' : 'text-slate-400'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
