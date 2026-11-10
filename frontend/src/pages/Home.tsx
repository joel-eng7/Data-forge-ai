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
  ArrowUpDown,
  CheckCircle2,
  Scan,
  Target,
  Sliders,
  Play
} from 'lucide-react';
import Hand3DCanvas from '../components/Hand3DCanvas';
import { GESTURE_DEFINITIONS } from '../gestures/gestureDefinitions';

export default function Home() {
  const [selectedDemoGesture, setSelectedDemoGesture] = useState<string>('INDEX_POINTING');

  const gestureList = Object.values(GESTURE_DEFINITIONS);

  const steps = [
    {
      step: 'STEP 1',
      title: 'CAMERA INPUT',
      desc: 'The webcam captures continuous live hand movements in real-time at 60 FPS, completely on-device without cloud video streaming.',
      icon: <Video className="w-6 h-6 text-gestura-text" />
    },
    {
      step: 'STEP 2',
      title: 'LANDMARK DETECTION',
      desc: 'MediaPipe Vision AI identifies 21 3D hand landmarks, isolating wrist, phalanx bones, joints, and fingertips in under 8ms.',
      icon: <Eye className="w-6 h-6 text-gestura-text" />
    },
    {
      step: 'STEP 3',
      title: 'GESTURE RECOGNITION',
      desc: 'The system analyzes landmark geometry, angles, and inter-joint distances to classify natural hand gestures with high confidence.',
      icon: <Cpu className="w-6 h-6 text-gestura-text" />
    },
    {
      step: 'STEP 4',
      title: 'COMPUTER EXECUTION',
      desc: 'Recognized gestures are instantly translated into smooth mouse movements, clicks, scrolling, and volume actions via PyAutoGUI.',
      icon: <Zap className="w-6 h-6 text-gestura-text" />
    }
  ];

  const features = [
    {
      title: 'Anti-Tremor Cursor Tracking',
      desc: 'Map your index fingertip to screen coordinates with Exponential Moving Average (EMA) smoothing for silky, tremor-free cursor control.',
      icon: <MousePointer className="w-5 h-5 text-gestura-text" />
    },
    {
      title: 'Crisp Pinch Left & Right Click',
      desc: 'Detect thumb-index and thumb-middle contact distances with calibrated debouncing to trigger left clicks, drag-and-drop, and context menus.',
      icon: <CheckCircle className="w-5 h-5 text-gestura-text" />
    },
    {
      title: 'Natural Victory Scrolling',
      desc: 'Raise two fingers in a Peace/Victory sign and move your hand vertically to scroll documents, codebases, and web pages effortlessly.',
      icon: <ArrowUpDown className="w-5 h-5 text-gestura-text" />
    },
    {
      title: 'Spatial Distance Volume Control',
      desc: 'Dynamically modulate system master volume using the Euclidean distance between thumb and index finger with immediate feedback.',
      icon: <Volume2 className="w-5 h-5 text-gestura-text" />
    },
    {
      title: 'Instant Biometric Safe Stop',
      desc: 'Clench into a closed fist or trigger the emergency stop button to instantly disarm mouse actions and release held buttons.',
      icon: <ShieldCheck className="w-5 h-5 text-gestura-text" />
    },
    {
      title: '100% Private On-Device AI',
      desc: 'All computer-vision inference runs strictly in your local browser and local Python FastAPI daemon. No video ever leaves your machine.',
      icon: <Lock className="w-5 h-5 text-gestura-text" />
    }
  ];

  return (
    <div className="space-y-24 pb-20 bg-[#FAF9F4] text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16">
        {/* Soft Pink Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[520px] bg-gradient-to-tr from-yellow-200/30 via-amber-100/20 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Status Pill: AI Engine Ready */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-gestura-border shadow-xs text-xs font-mono font-bold text-slate-800 backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="text-emerald-700 uppercase tracking-wide">AI Engine Ready</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-gestura-text">60 FPS Real-Time</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display font-black text-4xl sm:text-6xl text-gestura-text tracking-tight leading-[1.08]">
                Your Hands.{' '}
                <span className="bg-gestura-yellow px-2 py-0.5 rounded-xl text-gestura-text inline-block shadow-sm">
                  Your Computer.
                </span>{' '}
                Touchless Control.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Experience the future of touchless computing with intelligent AI-powered hand gesture recognition. Move your cursor, click, scroll, and adjust volume using natural hand movements in front of your webcam.
              </p>

              {/* Primary & Secondary Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/dashboard"
                  className="px-7 py-3.5 rounded-2xl bg-gestura-yellow hover:bg-gestura-yellowHover hover:bg-gestura-yellowHover text-white font-bold text-sm shadow-yellow-subtle hover:shadow-yellow-glow transition-all active:scale-95 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  Launch Gesture Control
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <a
                  href="#features"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-gestura-goldLight/70 text-slate-700 hover:text-gestura-text font-bold text-sm border border-gestura-border shadow-card-soft transition-all active:scale-95"
                >
                  Explore Features
                </a>

                <Link
                  to="/gestures"
                  className="px-5 py-3.5 rounded-2xl text-slate-500 hover:text-gestura-text font-bold text-xs font-mono transition-colors"
                >
                  3D Gesture Library &rarr;
                </Link>
              </div>

              {/* Benchmark KPIs */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gestura-border text-xs font-mono text-slate-500">
                <div>
                  <span className="font-extrabold text-slate-900 text-2xl block font-display bg-gestura-yellow bg-clip-text text-transparent">
                    21 Points
                  </span>
                  <span>3D Hand Skeleton</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-2xl block font-display text-slate-900">
                    &lt; 8 ms
                  </span>
                  <span>Inference Latency</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-2xl block font-display text-emerald-600">
                    100%
                  </span>
                  <span>Touchless Precision</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive 3D Hand Canvas with Floating Detected Gestures (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="w-full h-[490px] rounded-3xl bg-white border border-gestura-border shadow-card-elevated overflow-hidden relative flex flex-col justify-between p-4 backdrop-blur-xl">
                {/* 3D Hand Viewport */}
                <Hand3DCanvas
                  currentGesture={selectedDemoGesture}
                  interactive={true}
                  autoRotate={true}
                  className="w-full h-full"
                  zoom={1.05}
                  showParticles={true}
                />

                {/* Floating Detected Gesture Badge 1: Top-Right */}
                <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-gestura-border shadow-card-glass text-xs font-mono text-slate-800 flex items-center gap-2 animate-float-slow">
                  <span className="w-2 h-2 rounded-full bg-gestura-goldLight0 animate-ping" />
                  <span className="font-bold text-gestura-text">Index Point</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-600">Move Pointer</span>
                </div>

                {/* Floating Detected Gesture Badge 2: Top-Left */}
                <div className="absolute top-16 left-4 z-20 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-gestura-border shadow-card-glass text-xs font-mono text-slate-800 flex items-center gap-2">
                  <span className="text-base">👌</span>
                  <span className="font-bold text-gestura-text">Pinch</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-600">Left Click</span>
                </div>

                {/* Floating Detected Gesture Badge 3: Mid-Right */}
                <div className="absolute bottom-20 right-4 z-20 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-gestura-border shadow-card-glass text-xs font-mono text-slate-800 flex items-center gap-2">
                  <span className="text-base">✌️</span>
                  <span className="font-bold text-gestura-text">Victory</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-600">Scroll</span>
                </div>

                {/* Interactive Pose Switcher Bar */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-center gap-1.5 p-2 rounded-2xl bg-white/95 backdrop-blur-md border border-gestura-border shadow-xs">
                  {gestureList.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedDemoGesture(g.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all ${
                        selectedDemoGesture === g.id
                          ? 'bg-gestura-yellow text-white shadow-xs scale-105'
                          : 'bg-gestura-surface text-slate-600 hover:text-gestura-text hover:bg-gestura-goldLight'
                      }`}
                    >
                      {g.emoji} {g.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS / 4-STEP PIPELINE SECTION */}
      <section id="how-it-works" className="py-20 border-y border-gestura-border bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1 rounded-full bg-gestura-goldLight text-gestura-text font-mono text-xs font-bold border border-gestura-border shadow-xs">
              FOUR-STEP COMPUTER VISION PIPELINE
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-3">
              How GESTURA AI Works
            </h2>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              From raw camera photons to sub-pixel desktop cursor movement in under 8 milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st) => (
              <div
                key={st.step}
                className="p-6 rounded-3xl bg-gestura-surface border border-gestura-border shadow-card-soft flex flex-col gap-3 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gestura-text px-2.5 py-0.5 rounded-full bg-gestura-goldLight">
                    {st.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gestura-goldLight border border-gestura-border flex items-center justify-center">
                    {st.icon}
                  </div>
                </div>
                <h4 className="font-display font-bold text-slate-900 text-base">{st.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 7 CORE GESTURES SHOWCASE */}
      <section id="gestures" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="px-3.5 py-1 rounded-full bg-gestura-goldLight text-gestura-text font-mono text-xs font-bold border border-gestura-border shadow-xs">
            NATURAL GESTURE VOCABULARY
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-3">
            7 Purpose-Built Gesture Commands
          </h2>
          <p className="text-sm text-slate-500 mt-3">
            Engineered for low fatigue, ergonomic hand posture, and zero accidental false activations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gestureList.map((g) => (
            <Link
              key={g.id}
              to="/gestures"
              className="p-6 rounded-3xl bg-white hover:bg-gestura-surface border border-gestura-border shadow-card-soft transition-all flex flex-col justify-between gap-4 select-none group hover:border-gestura-yellow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{g.emoji}</span>
                  <span className="px-2 py-0.5 rounded-full bg-gestura-goldLight border border-gestura-border text-[10px] font-mono font-bold text-gestura-text">
                    {g.badge}
                  </span>
                </div>
                <h4 className="font-display font-bold text-slate-900 text-base mb-1">{g.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{g.description}</p>
              </div>

              <div className="pt-3 border-t border-gestura-border flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gestura-text bg-gestura-goldLight px-2 py-0.5 rounded">
                  {g.action}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-gestura-textMuted group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-20 border-y border-gestura-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1 rounded-full bg-gestura-goldLight text-gestura-text font-mono text-xs font-bold border border-gestura-border shadow-xs">
              SYSTEM CAPABILITIES
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-3">
              Comprehensive Computer Control Features
            </h2>
            <p className="text-sm text-slate-500 mt-3">
              Full desktop mouse replacement engineered for accuracy, ergonomics, and seamless safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-3xl bg-gestura-surface border border-gestura-border shadow-card-soft flex flex-col gap-3 hover:border-gestura-yellow transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-gestura-goldLight border border-gestura-border flex items-center justify-center shadow-xs">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-slate-900 text-base">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 sm:p-14 bg-gestura-yellow hover:bg-gestura-yellowHover text-white shadow-yellow-glow text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight">
            Ready for Touchless Computing?
          </h2>

          <p className="text-base text-gray-300 max-w-xl font-medium">
            Launch the live optical control dashboard, calibrate sensitivity, and test touchless mouse control in real-time.
          </p>

          <Link
            to="/dashboard"
            className="px-8 py-4 rounded-2xl bg-white hover:bg-gestura-goldLight text-gestura-text font-bold text-base shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            Launch Gesture Control
            <ArrowRight className="w-5 h-5 text-gestura-text" />
          </Link>
        </div>
      </section>
    </div>
  );
}
