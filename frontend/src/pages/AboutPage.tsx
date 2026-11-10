import React, { useState, useEffect } from 'react';
import {
  FileText,
  Cpu,
  Database,
  ShieldAlert,
  Info,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, ModelMetrics } from '../services/api';

export default function AboutPage() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);

  useEffect(() => {
    api.getModelInfo().then((data) => {
      setMetrics(data);
    });
  }, []);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 text-gestura-text">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gestura-goldLight text-gestura-text text-xs font-bold tracking-wider uppercase font-mono border border-gestura-yellow/40">
          <FileText className="w-3.5 h-3.5 text-gestura-text" />
          ETHICAL AI & TECHNICAL TRANSPARENCY
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-gestura-text tracking-tight">
          AI Architecture & System Audit
        </h1>
        <p className="text-sm sm:text-base text-gestura-textMuted leading-relaxed">
          Comprehensive documentation of the computer-vision pipeline, 21-point biomechanical landmark extraction, trained gesture classification, and operational safety boundaries.
        </p>
      </div>

      {/* 1. Real-World Practical Impact */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gestura-border shadow-card-glass space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gestura-border">
          <Info className="w-5 h-5 text-gestura-text" />
          <h2 className="font-display font-bold text-gestura-text text-xl">
            1. Why Touchless Computing Matters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm leading-relaxed">
          <div className="p-5 rounded-2xl bg-gestura-surface border border-gestura-border space-y-2">
            <span className="font-bold text-gestura-text font-mono text-base block">
              Aseptic Sterile Environments
            </span>
            <p className="text-gestura-textMuted text-xs leading-relaxed">
              In clinical operating rooms, cleanrooms, and chemical laboratories, touching physical mice and keyboards introduces biological contamination and breaks glove sterility. GESTURA AI enables complete touchless digital navigation using webcam optical vision.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gestura-surface border border-gestura-border space-y-2">
            <span className="font-bold text-gestura-text font-mono text-base block">
              Assistive Accessibility
            </span>
            <p className="text-gestura-textMuted text-xs leading-relaxed">
              Individuals with motor impairments, tremors, or repetitive strain injuries (RSI) can navigate without grasping heavy physical peripherals. GESTURA AI delivers digital freedom with sub-pixel tremor suppression.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Dataset & Biomechanical Engineering */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gestura-border shadow-card-glass space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gestura-border">
          <Database className="w-5 h-5 text-gestura-text" />
          <h2 className="font-display font-bold text-gestura-text text-xl">
            2. 21-Point Landmark & Kinematic Engineering
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-gestura-textMuted leading-relaxed">
          The pipeline extracts 21 3D spatial coordinates across wrist, phalanx bones, joints, and fingertips in real-time, computing geometric heuristics and scale-invariant distances.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border space-y-1">
            <span className="font-mono font-bold text-gestura-text block text-sm">
              63 Spatial Vectors
            </span>
            <p className="text-xs text-gestura-textMuted">
              21 3D landmarks centered at wrist and normalized relative to hand scale.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border space-y-1">
            <span className="font-mono font-bold text-gestura-text block text-sm">
              Pairwise Distances
            </span>
            <p className="text-xs text-gestura-textMuted">
              Euclidean gaps for pinch detection and finger curl determinations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border space-y-1">
            <span className="font-mono font-bold text-gestura-text block text-sm">
              Kinematic Angles
            </span>
            <p className="text-xs text-gestura-textMuted">
              Joint flexion angles and vectors for gesture differentiation.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Measured Machine Learning Performance */}
      {metrics && (
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gestura-border shadow-card-glass space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-gestura-text" />
              <h2 className="font-display font-bold text-gestura-text text-xl">
                3. Measured Empirical Model Metrics
              </h2>
            </div>
            <span className="text-xs font-mono text-gestura-textSubtle">
              Model: {metrics.model_name}
            </span>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gestura-goldLight border border-gestura-yellow/40">
              <span className="text-xs font-mono text-gestura-text uppercase block">Test Accuracy</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {(metrics.accuracy * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border shadow-xs">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">Macro F1 Score</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {(metrics.macro_f1 * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border shadow-xs">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">5-Fold CV Mean</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {(metrics.cv_accuracy_mean * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border shadow-xs">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">Inference Latency</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {metrics.inference_latency_ms} ms
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Safety & Privacy Manifesto */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gestura-border shadow-card-glass space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gestura-border">
          <ShieldAlert className="w-5 h-5 text-gestura-text" />
          <h2 className="font-display font-bold text-gestura-text text-xl">
            4. Safety Boundaries & Failsafes
          </h2>
        </div>

        <ul className="list-disc list-inside text-xs sm:text-sm text-gestura-textMuted leading-relaxed space-y-2">
          <li>
            <strong>100% Local Processing:</strong> Webcam frames are processed directly in browser memory and local Python daemon. No video recordings are stored or transmitted.
          </li>
          <li>
            <strong>Emergency Safe Stop:</strong> Clenching your hand into a <span className="font-mono font-bold text-gestura-text">CLOSED_FIST</span> or tapping the emergency stop button immediately disarms mouse movement and releases any held buttons.
          </li>
          <li>
            <strong>Auto-Stop on Camera Disconnect:</strong> If the webcam feed drops or is blocked, the computer control engine automatically halts.
          </li>
        </ul>
      </div>

      {/* Action CTA */}
      <div className="text-center pt-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold text-sm shadow-yellow-subtle hover:shadow-yellow-glow transition-all active:scale-95"
        >
          Launch Gesture Control
          <ArrowRight className="w-5 h-5 text-gestura-text" />
        </Link>
      </div>
    </div>
  );
}
