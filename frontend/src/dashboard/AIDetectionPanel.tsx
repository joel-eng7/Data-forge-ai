import React from 'react';
import {
  Activity,
  Cpu,
  Fingerprint,
  Zap,
  CheckCircle2,
  Circle,
  HelpCircle,
  Clock,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { DetectedGestureState } from './useHandDetection';

interface AIDetectionPanelProps {
  currentGesture: DetectedGestureState;
  handCount: number;
  fps: number;
  latency: number;
  modelStatus: string;
  isBackendConnected: boolean;
}

export default function AIDetectionPanel({
  currentGesture,
  handCount,
  fps,
  latency,
  modelStatus,
  isBackendConnected
}: AIDetectionPanelProps) {
  const isTracking = handCount > 0;
  const fingers = [
    { label: 'Thumb', active: currentGesture.fingerStates.thumb },
    { label: 'Index', active: currentGesture.fingerStates.index },
    { label: 'Middle', active: currentGesture.fingerStates.middle },
    { label: 'Ring', active: currentGesture.fingerStates.ring },
    { label: 'Pinky', active: currentGesture.fingerStates.pinky },
  ];

  return (
    <div className="rounded-3xl p-6 glass-panel border border-gestura-border shadow-card-soft flex flex-col gap-5 bg-white">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gestura-yellow text-gestura-text flex items-center justify-center shadow-yellow-subtle">
            <Zap className="w-5 h-5 fill-gestura-text" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gestura-text text-lg">AI Detection Engine</h3>
            <p className="text-xs text-gestura-textMuted font-mono">
              Biomechanical 83-Feature Random Forest
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isTracking ? 'bg-gestura-yellow' : 'bg-gray-300'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isTracking ? 'bg-gestura-yellow' : 'bg-gray-400'
              }`}
            />
          </span>
          <span className="text-xs font-mono font-medium text-gestura-textMuted">
            {isTracking ? 'TRACKING' : 'SEARCHING'}
          </span>
        </div>
      </div>

      {/* Main Detected Gesture Card */}
      <div className="rounded-2xl p-5 bg-gestura-goldLight border border-gestura-yellow/40 shadow-yellow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-white border border-gestura-yellow/60 flex items-center justify-center text-3xl shadow-sm shrink-0">
            {currentGesture.emoji}
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-gestura-textSubtle">
              Classified Intent
            </span>
            <h4 className="font-display font-extrabold text-gestura-text text-2xl tracking-tight">
              {currentGesture.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-gestura-yellow text-gestura-text font-bold text-xs font-mono">
                {currentGesture.action}
              </span>
              {currentGesture.isConfirmed && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Confirmed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Confidence Gauge Radial Display */}
        <div className="flex flex-col items-center sm:items-end w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gestura-yellow/30">
          <span className="text-[11px] font-mono text-gestura-textSubtle">Model Confidence</span>
          <div className="text-3xl font-display font-extrabold text-gestura-text mt-0.5">
            {(currentGesture.confidence * 100).toFixed(0)}%
          </div>
          <div className="w-32 h-2 rounded-full bg-white border border-gestura-yellow/40 overflow-hidden mt-1.5">
            <div
              className="h-full bg-gestura-yellow transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, currentGesture.confidence * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5-Finger Biomechanical Extension States */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-gestura-textSubtle uppercase tracking-wider">
            Phalangeal Extension Telemetry
          </span>
          <span className="text-[11px] text-gestura-textSubtle font-mono">
            {fingers.filter((f) => f.active).length} / 5 Extended
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {fingers.map((f, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                f.active
                  ? 'bg-gestura-goldLight border-gestura-yellow shadow-yellow-subtle'
                  : 'bg-gestura-surface border-gestura-border opacity-60'
              }`}
            >
              <span className="text-[11px] font-medium text-gestura-text mb-1 font-mono">{f.label}</span>
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                  f.active ? 'bg-gestura-yellow text-gestura-text shadow-sm' : 'bg-gray-300'
                }`}
              >
                {f.active && <Circle className="w-1.5 h-1.5 fill-gestura-text" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Mathematical Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-gestura-border text-center">
        <div className="p-2.5 rounded-xl bg-gestura-surface border border-gestura-border">
          <span className="text-[10px] font-mono text-gestura-textSubtle uppercase block">Pinch Distance</span>
          <span className="font-mono font-bold text-gestura-text text-sm">
            {currentGesture.metrics.pinchDistance.toFixed(3)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-gestura-surface border border-gestura-border">
          <span className="text-[10px] font-mono text-gestura-textSubtle uppercase block">2-Finger Pinch</span>
          <span className="font-mono font-bold text-gestura-text text-sm">
            {currentGesture.metrics.twoFingerPinchDistance.toFixed(3)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-gestura-surface border border-gestura-border">
          <span className="text-[10px] font-mono text-gestura-textSubtle uppercase block">Inference Latency</span>
          <span className="font-mono font-bold text-gestura-text text-sm">{latency} ms</span>
        </div>

        <div className="p-2.5 rounded-xl bg-gestura-surface border border-gestura-border">
          <span className="text-[10px] font-mono text-gestura-textSubtle uppercase block">Optical FPS</span>
          <span className="font-mono font-bold text-gestura-text text-sm">{fps} fps</span>
        </div>
      </div>
    </div>
  );
}
