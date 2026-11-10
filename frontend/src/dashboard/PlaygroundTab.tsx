import React, { useState } from 'react';
import {
  Target,
  Layers,
  Presentation,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Scan,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlaygroundTabProps {
  currentGesture?: string;
  isTracking?: boolean;
}

export default function PlaygroundTab({
  currentGesture = 'OPEN_PALM',
  isTracking = false
}: PlaygroundTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'targets' | 'dicom' | 'slides'>('targets');

  // Targets Game State
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; popped: boolean; color: string }>>([
    { id: 1, x: 20, y: 30, popped: false, color: '#FFD633' },
    { id: 2, x: 50, y: 20, popped: false, color: '#F5C21B' },
    { id: 3, x: 80, y: 35, popped: false, color: '#FFD633' },
    { id: 4, x: 25, y: 70, popped: false, color: '#F5C21B' },
    { id: 5, x: 55, y: 75, popped: false, color: '#FFD633' },
    { id: 6, x: 82, y: 65, popped: false, color: '#F5C21B' },
  ]);
  const [score, setScore] = useState<number>(0);

  // DICOM CT Slice State
  const [currentSlice, setCurrentSlice] = useState<number>(6);
  const totalSlices = 12;

  // Presentation Slide Deck State
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const slides = [
    {
      title: 'Aseptic Computer Vision in Operating Theatres',
      subtitle: 'Eliminating the Vector of Microbial Sepsis',
      body: 'Hospital-acquired surgical infections cost the global healthcare ecosystem over $28.4 Billion annually. By deploying contactless computer vision, surgeons navigate imaging modalities without de-sterilizing.',
      tag: 'Clinical Hygiene',
      accent: '#FFD633'
    },
    {
      title: 'Biomechanical Kinematic Feature Engineering',
      subtitle: 'Sub-Millimeter Angular & Proximity Accuracy',
      body: 'GESTURA AI extracts 83 geometric vectors across 21 3D spatial hand coordinates. By normalizing relative to the middle metacarpal distance, classification generalizes seamlessly across hand anthropometry.',
      tag: 'Machine Learning',
      accent: '#F5C21B'
    },
    {
      title: 'Assistive Computing for Motor Impairments',
      subtitle: 'Exponential Moving Average Tremor Suppression',
      body: 'Sub-pixel EMA filtering with dynamic deadband thresholds cancels physiological hand tremors associated with Parkinson’s, ALS, and repetitive strain injuries, restoring independent digital autonomy.',
      tag: 'Accessibility',
      accent: '#E5B800'
    }
  ];

  const popTarget = (id: number) => {
    setTargets((prev) =>
      prev.map((t) => {
        if (t.id === id && !t.popped) {
          setScore((s) => s + 100);
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { x: t.x / 100, y: t.y / 100 },
            colors: ['#FFD633', '#171717', '#FFFFFF']
          });
          return { ...t, popped: true };
        }
        return t;
      })
    );
  };

  const resetTargets = () => {
    setTargets((prev) => prev.map((t) => ({ ...t, popped: false })));
    setScore(0);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-gestura-goldLight text-gestura-text font-mono text-[11px] font-bold border border-gestura-yellow/40">
              TOUCHLESS PLAYGROUND
            </span>
            {isTracking && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                Camera Linked
              </span>
            )}
          </div>
          <h2 className="font-display font-extrabold text-gestura-text text-2xl tracking-tight">
            Interactive Gesture Testing Ground
          </h2>
          <p className="text-sm text-gestura-textMuted max-w-2xl mt-0.5">
            Test touchless desktop automation with target popping, surgical DICOM CT scan slice scrolling, and slide presentation controls.
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gestura-surface border border-gestura-border">
          <button
            onClick={() => setActiveSubTab('targets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'targets'
                ? 'bg-gestura-yellow text-gestura-text shadow-sm'
                : 'text-gestura-textMuted hover:text-gestura-text'
            }`}
          >
            <Target className="w-4 h-4" /> Target Practice
          </button>
          <button
            onClick={() => setActiveSubTab('dicom')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'dicom'
                ? 'bg-gestura-yellow text-gestura-text shadow-sm'
                : 'text-gestura-textMuted hover:text-gestura-text'
            }`}
          >
            <Scan className="w-4 h-4" /> DICOM CT Viewer
          </button>
          <button
            onClick={() => setActiveSubTab('slides')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'slides'
                ? 'bg-gestura-yellow text-gestura-text shadow-sm'
                : 'text-gestura-textMuted hover:text-gestura-text'
            }`}
          >
            <Presentation className="w-4 h-4" /> Slide Deck
          </button>
        </div>
      </div>

      {/* Mode 1: Target Practice */}
      {activeSubTab === 'targets' && (
        <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-gestura-text uppercase tracking-wider">
                Action: Hover + PINCH (Left Click) to Pop
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gestura-goldLight text-gestura-text border border-gestura-yellow/40">
                Score: {score} pts
              </span>
            </div>

            <button
              onClick={resetTargets}
              className="px-3 py-1.5 rounded-xl bg-gestura-surface hover:bg-gestura-goldLight text-gestura-text text-xs font-bold font-mono border border-gestura-border transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Targets
            </button>
          </div>

          <div className="h-[440px] rounded-2xl bg-[#FAF9F4] border border-gestura-border relative overflow-hidden select-none cursor-crosshair">
            <div className="absolute inset-0 bg-[radial-gradient(#FFD633_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

            {targets.map((t) => (
              <div
                key={t.id}
                onClick={() => popTarget(t.id)}
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                  t.popped ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 hover:scale-110 active:scale-90'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-white border-4 border-gestura-yellow shadow-yellow-subtle flex items-center justify-center font-display font-extrabold text-gestura-text text-sm">
                  {t.id}
                </div>
              </div>
            ))}

            {targets.every((t) => t.popped) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10">
                <CheckCircle2 className="w-12 h-12 text-gestura-yellow mb-2" />
                <h3 className="font-display font-extrabold text-gestura-text text-xl">All Targets Cleared!</h3>
                <p className="text-xs text-gestura-textMuted mb-4">Precision left-click pinch verified.</p>
                <button
                  onClick={resetTargets}
                  className="px-5 py-2.5 rounded-xl bg-gestura-yellow text-gestura-text font-bold text-xs shadow-yellow-subtle"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Surgical DICOM CT Scan Viewer */}
      {activeSubTab === 'dicom' && (
        <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
            <div>
              <h3 className="font-display font-bold text-gestura-text text-base">
                Sterile Cranial CT Imaging Modality
              </h3>
              <p className="text-xs text-gestura-textMuted font-mono">
                Gesture: VICTORY (Vertical Motion) or Slider to scrub slices
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-gestura-surface border border-gestura-border text-gestura-text">
              Slice {currentSlice} / {totalSlices}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 rounded-2xl bg-[#171717] border-2 border-gestura-border p-4 h-[380px] flex items-center justify-center relative overflow-hidden">
              <div className="relative w-64 h-64 rounded-full border-2 border-gestura-yellow/40 flex items-center justify-center">
                <div
                  className="w-56 h-56 rounded-full border border-gray-500 bg-gray-900/80 flex items-center justify-center transition-all duration-200"
                  style={{ transform: `scale(${0.9 + (currentSlice / totalSlices) * 0.2})` }}
                >
                  <div className="w-24 h-32 rounded-3xl border border-gestura-yellow/60 bg-black/60 flex items-center justify-center relative">
                    <div className="w-8 h-16 rounded-full bg-gestura-yellow/20" />
                    <span className="absolute text-[10px] font-mono text-gestura-yellow/70 bottom-1">
                      Z: {currentSlice * 5}mm
                    </span>
                  </div>
                </div>

                <div className="absolute top-2 left-2 text-[10px] font-mono text-white/50">
                  FOV: 240mm | W: 80 L: 40
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-gestura-yellow">
                  SLICE {currentSlice}
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-4">
              <span className="text-xs font-mono font-bold text-gestura-textSubtle uppercase tracking-wider">
                Axial Plane Scrubber
              </span>

              <input
                type="range"
                min="1"
                max={totalSlices}
                value={currentSlice}
                onChange={(e) => setCurrentSlice(parseInt(e.target.value))}
                className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs font-mono text-gestura-textMuted">
                <span>Superior (Slice 1)</span>
                <span>Inferior (Slice {totalSlices})</span>
              </div>

              <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border text-xs text-gestura-textMuted flex flex-col gap-2">
                <span className="font-bold text-gestura-text font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-gestura-yellow" />
                  Surgical Cleanroom Advantage
                </span>
                Surgeons can inspect cross-sectional slices without touching contaminated mouse hardware or needing unsterile assistants to scrub through images.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Slide Presentation Deck */}
      {activeSubTab === 'slides' && (
        <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
            <div>
              <h3 className="font-display font-bold text-gestura-text text-base">
                Touchless Presentation Slide Deck
              </h3>
              <p className="text-xs text-gestura-textMuted font-mono">
                Gesture: THUMBS_UP to advance, or manual buttons
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-xl bg-gestura-surface hover:bg-gestura-goldLight text-gestura-text disabled:opacity-30 border border-gestura-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold px-2 text-gestura-text">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <button
                onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-2 rounded-xl bg-gestura-surface hover:bg-gestura-goldLight text-gestura-text disabled:opacity-30 border border-gestura-border"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="min-h-[300px] rounded-2xl bg-gestura-goldLight/50 border border-gestura-yellow/40 p-8 flex flex-col justify-center">
            <span className="text-xs font-mono font-bold text-gestura-textSubtle uppercase tracking-wider mb-2">
              {slides[currentSlideIndex].tag}
            </span>
            <h2 className="font-display font-extrabold text-gestura-text text-3xl tracking-tight mb-2">
              {slides[currentSlideIndex].title}
            </h2>
            <h4 className="font-medium text-gestura-textMuted text-base mb-4 font-display">
              {slides[currentSlideIndex].subtitle}
            </h4>
            <p className="text-sm text-gestura-text leading-relaxed max-w-3xl">
              {slides[currentSlideIndex].body}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
