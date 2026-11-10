import React, { useState, useEffect } from 'react';
import Hand3DCanvas from '../components/Hand3DCanvas';
import { GESTURE_DEFINITIONS } from '../gestures/gestureDefinitions';
import { api, GesturePrediction } from '../services/api';
import {
  Sliders,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Layers,
  Activity,
  BarChart2,
  Cpu
} from 'lucide-react';

export default function SimulatorTab() {
  const [selectedGesture, setSelectedGesture] = useState<string>('INDEX_POINTING');
  const [prediction, setPrediction] = useState<GesturePrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [fingerRotations, setFingerRotations] = useState<{
    thumb: number[];
    index: number[];
    middle: number[];
    ring: number[];
    pinky: number[];
  }>({
    thumb: [60, 20, 10],
    index: [0, 0, 0],
    middle: [85, 0, 0],
    ring: [85, 0, 0],
    pinky: [85, 0, 0]
  });

  const gestureList = Object.values(GESTURE_DEFINITIONS);

  const selectPreset = (gId: string) => {
    setSelectedGesture(gId);
    const def = GESTURE_DEFINITIONS[gId];
    if (def) {
      setFingerRotations({ ...def.poseRotations });
    }
  };

  const evaluatePose = async () => {
    setLoading(true);
    try {
      const presets = await api.getPresets();
      const presetData = presets[selectedGesture];
      if (presetData && presetData.landmarks) {
        const pred = await api.predictGesture(presetData.landmarks, false, 'simulator_session');
        if (pred) setPrediction(pred);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluatePose();
  }, [selectedGesture]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-gestura-goldLight text-gestura-text font-mono text-[11px] font-bold border border-gestura-yellow/40">
              3D KINEMATICS DIGITAL TWIN
            </span>
          </div>
          <h2 className="font-display font-extrabold text-gestura-text text-2xl tracking-tight">
            Interactive Hand Simulator & Pose Laboratory
          </h2>
          <p className="text-sm text-gestura-textMuted max-w-2xl mt-0.5">
            Test and calibrate the 83-feature Random Forest model without a physical webcam. Articulate individual phalangeal joints or choose clinical presets.
          </p>
        </div>

        <button
          onClick={evaluatePose}
          disabled={loading}
          className="px-5 py-2.5 rounded-2xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold text-sm shadow-yellow-subtle hover:shadow-yellow-glow transition-all active:scale-95 flex items-center gap-2"
        >
          <Zap className="w-4 h-4 fill-gestura-text" />
          {loading ? 'Evaluating Model...' : 'Run ML Inference'}
        </button>
      </div>

      {/* Preset Gesture Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {gestureList.map((g) => {
          const isSelected = selectedGesture === g.id;
          return (
            <button
              key={g.id}
              onClick={() => selectPreset(g.id)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 select-none ${
                isSelected
                  ? 'bg-gestura-yellow text-gestura-text border-gestura-yellow shadow-yellow-subtle'
                  : 'bg-white hover:bg-gestura-surface text-gestura-textMuted border-gestura-border shadow-sm'
              }`}
            >
              <span className="text-base">{g.emoji}</span>
              <span>{g.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Hand Canvas (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-gestura-border p-6 shadow-card-soft flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gestura-yellow shadow-sm" />
              <h3 className="font-display font-bold text-gestura-text text-base">
                Anatomical 3D Mesh Representation
              </h3>
            </div>
            <span className="text-xs font-mono text-gestura-textSubtle">
              Three.js ACES Filmic Tone Mapping
            </span>
          </div>

          <div className="h-[420px] rounded-2xl bg-[#FAF9F4] border border-gestura-border overflow-hidden relative">
            <Hand3DCanvas
              currentGesture={selectedGesture}
              customRotations={fingerRotations}
              interactive={true}
              autoRotate={false}
              zoom={1.1}
            />
          </div>

          {/* Joint Flexion Sliders */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gestura-textSubtle">
                Individual Joint Flexion (Degrees)
              </span>
              <button
                onClick={() => selectPreset(selectedGesture)}
                className="text-xs text-gestura-textMuted hover:text-gestura-text flex items-center gap-1 font-mono"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Pose
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {(['thumb', 'index', 'middle', 'ring', 'pinky'] as const).map((finger) => (
                <div key={finger} className="p-3 rounded-2xl bg-gestura-surface border border-gestura-border flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-gestura-text capitalize">{finger}</span>
                    <span className="text-gestura-textSubtle">{fingerRotations[finger][0]}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={fingerRotations[finger][0]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFingerRotations((prev) => ({
                        ...prev,
                        [finger]: [val, prev[finger][1], prev[finger][2]]
                      }));
                    }}
                    className="w-full accent-gestura-yellow h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live ML Inference Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-gestura-yellow fill-gestura-yellow" />
                <h3 className="font-display font-bold text-gestura-text text-base">
                  Real-Time ML Prediction
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-gestura-goldLight text-gestura-text border border-gestura-yellow/40">
                RandomForest
              </span>
            </div>

            {prediction ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl p-4 bg-gestura-goldLight border border-gestura-yellow/50 shadow-yellow-subtle flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{prediction.emoji}</span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gestura-textSubtle font-bold">
                        Target Intent
                      </span>
                      <h4 className="font-display font-extrabold text-gestura-text text-xl">
                        {prediction.name}
                      </h4>
                      <span className="text-xs font-mono font-bold text-gestura-text">
                        Action: {prediction.action}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-gestura-textSubtle block">Confidence</span>
                    <span className="text-2xl font-display font-extrabold text-gestura-text">
                      {(prediction.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Probability Distribution Spectrum */}
                <div>
                  <span className="text-xs font-mono font-bold text-gestura-textSubtle uppercase tracking-wider block mb-2">
                    Multi-Class Probability Distribution
                  </span>
                  <div className="flex flex-col gap-2">
                    {prediction.probabilities && Object.entries(prediction.probabilities).map(([cls, prob]) => {
                      const isTop = cls === prediction.gesture;
                      return (
                        <div key={cls} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className={isTop ? 'font-bold text-gestura-text' : 'text-gestura-textMuted'}>
                              {cls.replace(/_/g, ' ')}
                            </span>
                            <span className={isTop ? 'font-bold text-gestura-text' : 'text-gestura-textSubtle'}>
                              {(prob * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gestura-surface overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isTop ? 'bg-gestura-yellow' : 'bg-gray-300'
                              }`}
                              style={{ width: `${Math.max(2, prob * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-gestura-border text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-gestura-surface border border-gestura-border">
                    <span className="text-[10px] text-gestura-textSubtle block">Latency</span>
                    <span className="font-bold text-gestura-text">{prediction.latency_ms} ms</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gestura-surface border border-gestura-border">
                    <span className="text-[10px] text-gestura-textSubtle block">Confirmed State</span>
                    <span className="font-bold text-emerald-700">STABLE</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gestura-textMuted text-xs font-mono">
                Click "Run ML Inference" to compute biomechanical prediction.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
