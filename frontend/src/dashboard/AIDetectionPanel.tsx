import React, { useState } from 'react';
import {
  Zap,
  Activity,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Layers,
  Box
} from 'lucide-react';
import { DetectedGestureState } from './useHandDetection';
import Hand3DCanvas from '../components/Hand3DCanvas';

interface AIDetectionPanelProps {
  currentGesture: DetectedGestureState;
  handCount?: number;
  isTracking?: boolean;
  fps: number;
  latency: number;
  modelStatus: string;
  isBackendConnected: boolean;
}

export default function AIDetectionPanel({
  currentGesture,
  handCount,
  isTracking: isTrackingProp,
  fps,
  latency,
  modelStatus,
  isBackendConnected
}: AIDetectionPanelProps) {
  const [show3DTwin, setShow3DTwin] = useState<boolean>(true);
  const isTracking = isTrackingProp ?? ((handCount ?? 0) > 0);

  const fingers = [
    { label: 'Thumb', active: currentGesture.fingerStates.thumb },
    { label: 'Index', active: currentGesture.fingerStates.index },
    { label: 'Middle', active: currentGesture.fingerStates.middle },
    { label: 'Ring', active: currentGesture.fingerStates.ring },
    { label: 'Pinky', active: currentGesture.fingerStates.pinky },
  ];

  return (
    <div className="rounded-3xl p-6 bg-white/90 backdrop-blur-xl border border-gestura-border shadow-card-glass flex flex-col gap-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gestura-yellow text-white flex items-center justify-center shadow-yellow-subtle font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">AI Detection Engine</h3>
            <p className="text-xs text-slate-500">21-Landmark Kinematic Classifier</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShow3DTwin(prev => !prev)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
              show3DTwin
                ? 'bg-gestura-goldLight text-gestura-text border-gestura-yellow shadow-xs font-bold'
                : 'bg-white text-slate-500 border-gestura-border'
            }`}
            title="Toggle Live 3D Digital Twin"
          >
            <Box className="w-3.5 h-3.5" />
            3D Twin
          </button>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
              isTracking
                ? 'bg-gestura-goldLight text-gestura-text border-gestura-border'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-gestura-goldLight0 animate-pulse' : 'bg-slate-400'}`} />
            {isTracking ? 'Hand Locked' : 'Searching'}
          </span>
        </div>
      </div>

      {/* Primary Current Gesture Card */}
      <div className="p-4 rounded-2xl bg-gestura-goldLight/70 border border-gestura-border shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center text-3xl border border-gestura-border shrink-0">
          {currentGesture.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gestura-text">Active Gesture</span>
            <span className="text-xs font-mono font-bold text-slate-800">{currentGesture.confidence}% Confidence</span>
          </div>
          <h4 className="font-display font-bold text-slate-900 text-lg truncate mt-0.5">
            {currentGesture.name}
          </h4>
          <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
            <span className="font-semibold text-gestura-text">Action:</span> {currentGesture.action}
          </p>
        </div>
      </div>

      {/* Interactive 3D Digital Twin Hand (Real-time gesture mirroring!) */}
      {show3DTwin && (
        <div className="relative rounded-2xl p-2 bg-gestura-surface border border-gestura-border overflow-hidden shadow-inner">
          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gestura-text flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gestura-text" />
              Live 3D Hand Digital Twin
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Pose: {currentGesture.gesture}
            </span>
          </div>
          <div className="w-full h-44 rounded-xl overflow-hidden relative">
            <Hand3DCanvas
              currentGesture={currentGesture.gesture !== 'NO_HAND' ? currentGesture.gesture : 'OPEN_PALM'}
              interactive={true}
              autoRotate={false}
              showParticles={false}
              className="w-full h-full"
              zoom={1.15}
            />
          </div>
        </div>
      )}

      {/* Confidence & Kinematics Gauges */}
      <div>
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-600 font-medium">Inference Confidence Score</span>
          <span className="font-mono font-bold text-gestura-text">{currentGesture.confidence}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-gestura-goldLight p-0.5 overflow-hidden border border-gestura-border">
          <div
            className="h-full rounded-full bg-gestura-yellow transition-all duration-300 shadow-sm"
            style={{ width: `${currentGesture.confidence}%` }}
          />
        </div>
      </div>

      {/* Five Finger Kinematics Breakdown */}
      <div className="p-3.5 rounded-2xl bg-white border border-gestura-border shadow-xs">
        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Finger Joint Kinematics</span>
          <span className="text-[10px] font-mono text-slate-400 font-normal">
            Pinch Dist: {currentGesture.metrics.pinchDistance.toFixed(2)}
          </span>
        </p>
        <div className="grid grid-cols-5 gap-2">
          {fingers.map((f) => (
            <div
              key={f.label}
              className={`p-2 rounded-xl text-center border transition-all ${
                f.active
                  ? 'bg-gestura-goldLight border-gestura-yellow text-gestura-text font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex justify-center mb-1">
                {f.active ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-gestura-text" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300" />
                )}
              </div>
              <p className="text-[11px] leading-tight">{f.label}</p>
              <span className="text-[9px] uppercase tracking-wider font-mono">
                {f.active ? 'EXT' : 'CURL'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-2xl bg-white border border-gestura-border shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Processing Rate</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold text-lg text-slate-900">{fps}</span>
            <span className="text-xs text-slate-500 font-medium">FPS</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-gestura-border shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Inference Latency</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold text-lg text-gestura-text">{latency}</span>
            <span className="text-xs text-slate-500 font-medium">ms</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-gestura-border shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Vision Model</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                modelStatus === 'ready' ? 'bg-emerald-500' : 'bg-slate-400 animate-pulse'
              }`}
            />
            <span className="text-xs font-semibold text-slate-700 capitalize">
              {modelStatus === 'ready' ? 'GPU Accelerated' : modelStatus}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-gestura-border shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Python Engine</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-semibold text-slate-700">
              {isBackendConnected ? 'PyAutoGUI Active' : 'Standby / Web'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
