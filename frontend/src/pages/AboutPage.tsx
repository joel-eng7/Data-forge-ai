import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Zap,
  Terminal,
  Eye,
  CheckCircle2,
  HardDrive,
  FileCode,
  AlertTriangle
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          Safety & System Architecture
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 tracking-tight">
          About GESTURA AI
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Pioneering reliable, zero-touch human-computer interaction through on-device machine vision and low-latency desktop kinematics.
        </p>
      </div>

      {/* Safety & Security Guarantees */}
      <div className="rounded-3xl p-8 glass-panel-elevated border border-rose-200 shadow-soft-lg space-y-6 bg-gradient-to-br from-white via-rose-50/20 to-pink-50/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            Security & Privacy Manifesto
          </span>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 mt-1">
            Zero-Trust, Privacy-First Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Built from day one to operate safely inside personal and enterprise environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/80 border border-rose-100 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              100% Local Frame Processing
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Webcam video frames never leave your local browser memory or computer. No images, streams, or recordings are ever stored or uploaded to external servers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-rose-100 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <Lock className="w-4 h-4" />
              Instant Hardware Failsafe
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Moving your physical mouse to any display corner immediately trips PyAutoGUI’s native failsafe. The dedicated STOP CONTROL button releases all inputs in &lt;1ms.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-rose-100 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <Eye className="w-4 h-4" />
              Continuous Disconnect Protection
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              If the webcam is covered, unplugged, or switched off, the system automatically detects frame loss and halts all computer operations immediately.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-rose-100 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <Terminal className="w-4 h-4" />
              Non-Destructive Actions Only
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The engine only sends basic cursor displacements, left/right mouse clicks, scrolls, and volume requests. It cannot execute destructive commands or filesystem edits.
            </p>
          </div>
        </div>
      </div>

      {/* Engineering Specs & Stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl p-6 glass-panel border border-rose-100 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-slate-800 text-lg">AI & Vision Pipeline</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Google MediaPipe Hand Landmarker with 21 3D joint tracking points running on WebAssembly & GPU acceleration.
          </p>
        </div>

        <div className="rounded-3xl p-6 glass-panel border border-rose-100 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-slate-800 text-lg">Real-Time WebSocket Hub</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            FastAPI WebSocket server on Python 3.13 providing sub-millisecond bidirectional event and telemetry streaming.
          </p>
        </div>

        <div className="rounded-3xl p-6 glass-panel border border-rose-100 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-slate-800 text-lg">Desktop Automation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            PyAutoGUI and native operating system APIs with anti-tremor EMA filtering and customizable deadzones.
          </p>
        </div>
      </div>
    </div>
  );
}
