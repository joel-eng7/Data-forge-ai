import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  MousePointer,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Video,
  Cpu,
  Eye,
  CheckCircle,
  Volume2,
  Lock,
  ArrowUpDown
} from 'lucide-react';
import Hand3DCanvas from '../components/Hand3DCanvas';
import { GESTURE_DEFINITIONS } from '../gestures/gestureDefinitions';

export default function Home() {
  const [selectedDemoGesture, setSelectedDemoGesture] = useState<string>('OPEN_PALM');

  const gestureList = Object.values(GESTURE_DEFINITIONS);

  const steps = [
    {
      num: '01',
      title: 'CAMERA INPUT',
      desc: 'The webcam captures continuous live 60 FPS video frames without storing or transmitting personal video feeds.',
      icon: <Video className="w-6 h-6 text-rose-500" />
    },
    {
      num: '02',
      title: 'LANDMARK DETECTION',
      desc: 'MediaPipe AI identifies 21 3D hand landmarks, isolating wrist, phalanx bones, joints, and fingertips in real time.',
      icon: <Eye className="w-6 h-6 text-pink-500" />
    },
    {
      num: '03',
      title: 'GESTURE RECOGNITION',
      desc: 'Geometric classifiers compute finger angles, pinch proximities, and temporal hysteresis to verify intended gestures.',
      icon: <Cpu className="w-6 h-6 text-purple-500" />
    },
    {
      num: '04',
      title: 'COMPUTER EXECUTION',
      desc: 'Confirmed gestures are translated into native desktop mouse coordinates, clicks, scrolling, and system volume.',
      icon: <Zap className="w-6 h-6 text-emerald-500" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Pink Background Glow Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-pink-200/40 via-rose-100/30 to-purple-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Live Status Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-rose-200/80 shadow-soft backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <span className="text-xs font-semibold text-rose-700 tracking-wide uppercase">
                AI Engine Ready • Touchless Computing 2.0
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.12]">
              Your Hands.{' '}
              <span className="text-gradient-rose">Your Computer.</span>
              <br />Your Control.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Experience the future of touchless computing with intelligent AI-powered hand gesture recognition. Guide your cursor, click, scroll, and adjust volume without touching a keyboard or mouse.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/dashboard"
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm sm:text-base shadow-glow-pink hover:shadow-soft-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2.5"
              >
                <Sparkles className="w-5 h-5 text-rose-100" />
                Launch Gesture Control
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                to="/gestures"
                className="px-6 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-700 font-semibold text-sm sm:text-base border border-rose-200/80 shadow-soft hover:shadow-soft-lg active:scale-95 transition-all flex items-center gap-2"
              >
                Explore 7 Gestures
              </Link>
            </div>

            {/* Micro Feature Proof Badges */}
            <div className="pt-6 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 border-t border-rose-100">
              <div className="text-center lg:text-left">
                <p className="font-display font-black text-xl text-slate-900">21</p>
                <p className="text-[11px] text-slate-500">Hand Landmarks</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-display font-black text-xl text-rose-600">60 FPS</p>
                <p className="text-[11px] text-slate-500">Zero-Lag In-Browser</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-display font-black text-xl text-slate-900">100%</p>
                <p className="text-[11px] text-slate-500">Local Privacy</p>
              </div>
            </div>
          </div>

          {/* Right Column: Large Interactive 3D Hand Model & Floating Gesture Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient Circular Glow Container */}
            <div className="w-full max-w-[480px] aspect-square rounded-3xl p-2 relative bg-gradient-to-tr from-white/90 via-pink-50/50 to-white/80 border border-rose-200/70 shadow-card-glass backdrop-blur-xl">
              {/* 3D WebGL Canvas */}
              <Hand3DCanvas
                currentGesture={selectedDemoGesture}
                interactive={true}
                autoRotate={true}
                showParticles={true}
                className="w-full h-full rounded-2xl"
              />

              {/* Floating Live Detected Gesture Badge */}
              <div className="absolute top-4 left-4 p-3 rounded-2xl glass-panel-elevated flex items-center gap-2.5 shadow-soft z-20">
                <span className="text-2xl">
                  {GESTURE_DEFINITIONS[selectedDemoGesture]?.emoji || '🖐️'}
                </span>
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                    3D Simulation Pose
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {GESTURE_DEFINITIONS[selectedDemoGesture]?.name || 'Open Palm'}
                  </p>
                </div>
              </div>

              {/* Floating Action Badge */}
              <div className="absolute bottom-4 right-4 p-3 rounded-2xl glass-panel-elevated shadow-soft z-20">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Desktop Action
                </span>
                <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {GESTURE_DEFINITIONS[selectedDemoGesture]?.action}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Gesture Selector Carousel Below Hero */}
        <div className="max-w-6xl mx-auto mt-14 pt-8 border-t border-rose-100">
          <div className="text-center mb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Interactive 3D Inspector
            </span>
            <h3 className="font-display font-bold text-slate-800 text-lg">
              Click Any Gesture to Morph the 3D Hand Model
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {gestureList.map((g) => {
              const isSelected = selectedDemoGesture === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedDemoGesture(g.id)}
                  className={`p-3 rounded-2xl text-center border transition-all active:scale-95 flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-600 shadow-glow-pink scale-105'
                      : 'bg-white/80 hover:bg-rose-50/50 border-rose-100 text-slate-700 shadow-xs'
                  }`}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <p className="text-xs font-bold truncate w-full">{g.name}</p>
                  <span className={`text-[10px] truncate w-full ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                    {g.action}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section (Section 6 Requirements) */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-[#FFF8FA] to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-rose-600 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200">
              Pipeline Architecture
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              How Gestura AI Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Four synchronized stages transform live webcam optical data into fluid, native desktop automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st) => (
              <div
                key={st.num}
                className="relative rounded-3xl p-6 glass-panel border border-rose-200/60 shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-display font-black text-3xl text-rose-300 group-hover:text-rose-500 transition-colors">
                      {st.num}
                    </span>
                    <div className="p-2.5 rounded-2xl bg-white shadow-xs border border-rose-100">
                      {st.icon}
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-lg mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-rose-100/70 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Real-Time Execution</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Architecture Highlights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto rounded-3xl p-8 sm:p-12 glass-panel-elevated border border-rose-200 shadow-soft-lg bg-gradient-to-r from-rose-50/40 via-white to-pink-50/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="space-y-3">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Security & Safety Failsafe
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
                Engineered with Zero-Risk Protocols.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We believe touchless computing must be completely safe, transparent, and controllable.
              </p>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">100% On-Device Inference</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Webcam frames never leave your local device. MediaPipe processes everything locally.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Instant Emergency Stop</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    One-click physical failsafe releases all mouse keys and disarms active automation.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-pink-50 text-pink-600 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Anti-Tremor EMA Filter</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Exponential moving averages and deadzone filters eliminate hand shakes and unintended clicks.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Sub-Millisecond Response</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct local WebSocket architecture communicates between web client and Python controller.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Launch CTA Strip */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto rounded-3xl p-10 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-glow-pink space-y-5">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Ready to Control Your Computer with Your Hands?
          </h2>
          <p className="text-rose-100 text-sm sm:text-base max-w-xl mx-auto">
            Open the real-time Gesture Control Dashboard, activate your webcam, and experience seamless touchless computing.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5 text-rose-500" />
              Open Gesture Dashboard Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
