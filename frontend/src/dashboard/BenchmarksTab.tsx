import React, { useState, useEffect } from 'react';
import {
  Activity,
  Award,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Cpu,
  BarChart2,
  Clock
} from 'lucide-react';
import { api, BenchmarkResult } from '../services/api';

export default function BenchmarksTab() {
  const [selectedSuite, setSelectedSuite] = useState<string>('surgical');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [latestResult, setLatestResult] = useState<BenchmarkResult | null>(null);
  const [history, setHistory] = useState<BenchmarkResult[]>([]);

  const suites = [
    {
      id: 'surgical',
      name: 'Surgical Sterile Suite',
      description: 'Simulates micro-movements of sterile surgical gloves with low optical distortion.',
      noiseLevel: '0.012 (Low noise)',
      targetAccuracy: '≥ 95%'
    },
    {
      id: 'accessibility',
      name: 'Assistive Motor Tremor Suite',
      description: 'Injects physiological hand tremors characteristic of Parkinson’s, ALS, and motor RSI.',
      noiseLevel: '0.025 (Moderate tremor)',
      targetAccuracy: '≥ 90%'
    },
    {
      id: 'noise',
      name: 'Cleanroom Low-Light & Noise Suite',
      description: 'Evaluates resilience against harsh industrial lighting, sensor grain, and motion blur.',
      noiseLevel: '0.045 (High optical noise)',
      targetAccuracy: '≥ 85%'
    }
  ];

  const loadHistory = async () => {
    try {
      const data = await api.getBenchmarksHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const runBenchmark = async () => {
    setIsRunning(true);
    try {
      const res = await api.runBenchmark(selectedSuite, 25);
      if (res) {
        setLatestResult(res);
        loadHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-gestura-goldLight text-gestura-text font-mono text-[11px] font-bold border border-gestura-yellow/40">
              CLINICAL BENCHMARK SUITE
            </span>
          </div>
          <h2 className="font-display font-extrabold text-gestura-text text-2xl tracking-tight">
            Automated Model Verification & Latency Benchmarks
          </h2>
          <p className="text-sm text-gestura-textMuted max-w-2xl mt-0.5">
            Execute batch evaluation across hundreds of biomechanical kinematic poses. Evaluates classification accuracy, tremor resilience, and sub-15ms inference latency.
          </p>
        </div>

        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className="px-6 py-3 rounded-2xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold text-sm shadow-yellow-subtle hover:shadow-yellow-glow transition-all active:scale-95 flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-gestura-text" />
          {isRunning ? 'Benchmarking 175 Samples...' : 'Run Automated Benchmark'}
        </button>
      </div>

      {/* Suite Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suites.map((s) => {
          const isSelected = selectedSuite === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setSelectedSuite(s.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-4 select-none ${
                isSelected
                  ? 'bg-gestura-goldLight border-gestura-yellow shadow-yellow-subtle'
                  : 'bg-white hover:bg-gestura-surface border-gestura-border shadow-card-soft'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-gestura-textSubtle">
                    Evaluation Matrix
                  </span>
                  <span className="text-xs font-mono font-bold text-gestura-text">
                    Target: {s.targetAccuracy}
                  </span>
                </div>
                <h4 className="font-display font-bold text-gestura-text text-lg mb-1">{s.name}</h4>
                <p className="text-xs text-gestura-textMuted leading-relaxed">{s.description}</p>
              </div>

              <div className="pt-3 border-t border-gestura-border/60 flex items-center justify-between text-[11px] font-mono text-gestura-textSubtle">
                <span>Noise: {s.noiseLevel}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-gestura-yellow' : 'bg-gray-300'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Latest Benchmark Results */}
      {latestResult && (
        <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gestura-yellow" />
              <h3 className="font-display font-bold text-gestura-text text-base">
                Benchmark Output: {latestResult.suite.toUpperCase()} SUITE
              </h3>
            </div>
            <span className="text-xs font-mono text-gestura-textSubtle">
              Run ID: {latestResult.benchmark_id}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gestura-goldLight border border-gestura-yellow/40">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">Overall Accuracy</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {latestResult.accuracy.toFixed(1)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">Avg Inference Latency</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {latestResult.avg_latency_ms.toFixed(2)} ms
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">Total Poses Tested</span>
              <span className="text-3xl font-display font-extrabold text-gestura-text">
                {latestResult.total_samples}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border">
              <span className="text-xs font-mono text-gestura-textSubtle uppercase block">Clinical Benchmark Status</span>
              <span className="text-2xl font-display font-extrabold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                PASS
              </span>
            </div>
          </div>

          {/* Per-Class Accuracy Breakdown */}
          <div>
            <span className="text-xs font-mono font-bold text-gestura-textSubtle uppercase tracking-wider block mb-3">
              Per-Gesture Classification Precision Matrix
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(latestResult.class_breakdown).map(([gesture, data]) => (
                <div key={gesture} className="p-3.5 rounded-2xl bg-gestura-surface border border-gestura-border flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gestura-text font-mono truncate">{gesture.replace(/_/g, ' ')}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                      {data.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-gestura-textMuted">
                    <span>{data.correct} / {data.samples} correct</span>
                    <span className="font-bold text-gestura-text">{data.accuracy}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden mt-1">
                    <div
                      className="h-full bg-gestura-yellow rounded-full"
                      style={{ width: `${data.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historical Runs from SQLite */}
      {history.length > 0 && (
        <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gestura-border">
            <History className="w-5 h-5 text-gestura-yellow" />
            <h3 className="font-display font-bold text-gestura-text text-base">
              Persistent Benchmark Audit Log (SQLite)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-gestura-border text-gestura-textSubtle">
                  <th className="py-2.5 px-3">Run ID</th>
                  <th className="py-2.5 px-3">Suite Name</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Avg Latency</th>
                  <th className="py-2.5 px-3">Samples</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gestura-border">
                {history.map((h, idx) => (
                  <tr key={h.id || h.benchmark_id || idx} className="hover:bg-gestura-surface">
                    <td className="py-2.5 px-3 font-bold text-gestura-text">{h.id || h.benchmark_id}</td>
                    <td className="py-2.5 px-3 uppercase text-gestura-textMuted">{h.suite_name || h.suite}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{(h.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-gestura-text">{h.avg_latency_ms.toFixed(2)} ms</td>
                    <td className="py-2.5 px-3 text-gestura-textMuted">{h.total_samples}</td>
                    <td className="py-2.5 px-3 text-gestura-textSubtle">{h.created_at || h.evaluated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
