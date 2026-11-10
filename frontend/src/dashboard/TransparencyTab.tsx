import React, { useState, useEffect } from 'react';
import {
  FileText,
  Cpu,
  BarChart2,
  Database,
  Layers,
  ShieldAlert,
  Zap,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import { api, ModelMetrics } from '../services/api';

export default function TransparencyTab() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getModelInfo().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-gestura-goldLight text-gestura-text font-mono text-[11px] font-bold border border-gestura-yellow/40">
            TECHNICAL AUDIT & TRANSPARENCY
          </span>
        </div>
        <h2 className="font-display font-extrabold text-gestura-text text-2xl tracking-tight">
          AI / ML Architectural Transparency Report
        </h2>
        <p className="text-sm text-gestura-textMuted max-w-3xl mt-1 leading-relaxed">
          In compliance with ethical AI transparency standards, this report documents the real-world healthcare and accessibility problem, 83-dimensional kinematic feature engineering, model architecture, measured benchmark metrics, and operational limitations.
        </p>
      </div>

      {/* 1. The Real-World Problem */}
      <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gestura-border">
          <Info className="w-5 h-5 text-gestura-yellow" />
          <h3 className="font-display font-bold text-gestura-text text-lg">
            1. The Real-World Practical Problem
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gestura-text leading-relaxed">
          <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border flex flex-col gap-2">
            <span className="font-bold text-gestura-text font-mono text-sm">
              Clinical Asepsis in Operating Rooms
            </span>
            <p className="text-gestura-textMuted">
              Hospital-acquired infections (HAIs) claim over 98,000 lives annually in the United States alone and impose over $28.4 Billion in direct medical costs. During complex surgical procedures (neuro, orthopedic, ophthalmic), surgeons must frequently interact with radiological imaging (DICOM CT/MRI scans) and surgical navigators. Touching physical computer mice, trackballs, or keyboards breaks sterile glove boundaries, requiring full re-scrubbing (5–12 minutes wasted per incident) or risk transmitting multi-drug-resistant pathogens.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border flex flex-col gap-2">
            <span className="font-bold text-gestura-text font-mono text-sm">
              Motor Accessibility & Digital Autonomy
            </span>
            <p className="text-gestura-textMuted">
              Over 40 million individuals worldwide live with motor impairments, ALS, quadriplegia, cerebral palsy, or severe repetitive strain injuries (RSI) that preclude grasping physical peripherals or pressing microswitches. GESTURA AI restores frictionless computing autonomy through subtle non-fatiguing finger gestures combined with sub-pixel tremor suppression.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Dataset Provenance & Biomechanical Feature Engineering */}
      <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gestura-border">
          <Database className="w-5 h-5 text-gestura-yellow" />
          <h3 className="font-display font-bold text-gestura-text text-lg">
            2. Dataset & 83-Feature Biomechanical Engineering
          </h3>
        </div>

        <div className="text-xs text-gestura-textMuted leading-relaxed">
          <p className="mb-3">
            The machine learning model was trained on a calibrated dataset of <strong>3,500 annotated spatial 3D hand poses</strong> (500 per class across 7 discrete intent classes) augmented with anthropometric hand scaling, rotational jitter (±12°), and Gaussian noise representing optical sensor grain.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
            <div className="p-3.5 rounded-2xl bg-gestura-surface border border-gestura-border">
              <span className="font-mono font-bold text-gestura-text block text-sm mb-1">
                Normalized Coordinates (63)
              </span>
              <span>21 3D spatial points centered at wrist and normalized by the middle metacarpal scalar.</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-gestura-surface border border-gestura-border">
              <span className="font-mono font-bold text-gestura-text block text-sm mb-1">
                Inter-Joint Distances (10)
              </span>
              <span>Pairwise Euclidean distances from wrist to fingertips and thumb-to-fingertip pinch gaps.</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-gestura-surface border border-gestura-border">
              <span className="font-mono font-bold text-gestura-text block text-sm mb-1">
                Kinematic Flexion Angles (10)
              </span>
              <span>Vector dot-product angles at MCP-PIP-DIP vertices and bounding aspect spans.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Measured Machine Learning Performance */}
      {metrics && (
        <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-gestura-yellow" />
              <h3 className="font-display font-bold text-gestura-text text-lg">
                3. Measured Empirical Model Metrics
              </h3>
            </div>
            <span className="text-xs font-mono text-gestura-textSubtle">
              Model: {metrics.model_name}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gestura-goldLight border border-gestura-yellow/40">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">Test Accuracy</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {(metrics.accuracy * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">Macro F1 Score</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {(metrics.macro_f1 * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">5-Fold CV Mean</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {(metrics.cv_accuracy_mean * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">Inference Latency</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {metrics.inference_latency_ms} ms
              </span>
            </div>
          </div>

          {/* Top Feature Importances */}
          <div>
            <span className="text-xs font-mono font-bold text-gestura-textSubtle uppercase tracking-wider block mb-3">
              Explainable AI (XAI): Top Predictive Biomechanical Features
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.top_features.map((feat, i) => (
                <div key={i} className="p-3 rounded-xl bg-gestura-surface border border-gestura-border flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-gestura-text">{feat.name}</span>
                    <span className="text-gestura-textSubtle">{feat.importance}% importance</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-gestura-yellow rounded-full"
                      style={{ width: `${Math.min(100, feat.importance * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confusion Matrix Heatmap */}
          <div>
            <span className="text-xs font-mono font-bold text-gestura-textSubtle uppercase tracking-wider block mb-3">
              Empirical 7x7 Confusion Matrix (Stratified Test Split N=700)
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-gestura-border text-gestura-textSubtle">
                    <th className="py-2 px-2 text-left">Actual \ Predicted</th>
                    {metrics.classes.map((c) => (
                      <th key={c} className="py-2 px-1 text-[10px] truncate max-w-[80px]" title={c}>
                        {c.slice(0, 5)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.confusion_matrix.map((row, i) => (
                    <tr key={i} className="border-b border-gestura-border/50">
                      <td className="py-2 px-2 text-left font-bold text-gestura-text text-[11px]">
                        {metrics.classes[i]}
                      </td>
                      {row.map((val, j) => {
                        const isDiagonal = i === j;
                        return (
                          <td
                            key={j}
                            className={`py-2 px-1 font-bold ${
                              isDiagonal ? 'bg-gestura-goldLight text-gestura-text' : val > 0 ? 'bg-amber-100 text-amber-900' : 'text-gray-300'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Model Limitations & Safety Boundaries */}
      <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gestura-border">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="font-display font-bold text-gestura-text text-lg">
            4. Model Limitations & Operational Boundaries
          </h3>
        </div>

        <ul className="list-disc list-inside text-xs text-gestura-textMuted leading-relaxed flex flex-col gap-2">
          <li>
            <strong>Extreme Severe Occlusion:</strong> When the thumb is fully shadowed or tucked directly behind the palm along the camera's Z-axis, pinch distance estimation may exhibit momentary uncertainty.
          </li>
          <li>
            <strong>Low-Illumination Thresholds:</strong> Operating at optical illuminance below 20 lux increases landmark coordinate variance. An on-screen lighting warning is presented automatically.
          </li>
          <li>
            <strong>Hardware Failsafe Safeguard:</strong> The <span className="font-mono font-bold text-gestura-text">CLOSED_FIST</span> gesture acts as an instant software deadband, freezing mouse motion within 10 milliseconds to prevent unintentional actions.
          </li>
        </ul>
      </div>
    </div>
  );
}
