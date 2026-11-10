import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gestura-border bg-white pt-14 pb-10 text-gestura-text font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-gestura-border">
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gestura-yellow text-gestura-text flex items-center justify-center shadow-yellow-subtle">
                <Sparkles className="w-5 h-5 text-gestura-text fill-gestura-text" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xl tracking-tight text-gestura-text">
                    GESTURA
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gestura-yellow text-gestura-text border border-gestura-yellowHover font-mono font-bold tracking-wider">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-gestura-textMuted font-mono">
                  Touchless Spatial Computing Engine
                </p>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-gestura-textMuted max-w-sm leading-relaxed">
              Transforming standard optical webcams into touchless spatial controllers. Powered by 21-point biomechanical hand tracking and real-time desktop automation.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs font-mono text-gestura-textSubtle">
              <span className="w-2 h-2 rounded-full bg-gestura-yellow animate-pulse" />
              <span>FastAPI Local Daemon 127.0.0.1:8000</span>
            </div>
          </div>

          {/* Platform Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display font-bold text-gestura-text text-sm uppercase tracking-wider font-mono">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-mono text-gestura-textMuted">
              <li>
                <Link to="/" className="hover:text-gestura-text hover:underline transition-colors">Home Landing</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-gestura-text hover:underline transition-colors">Operational Dashboard</Link>
              </li>
              <li>
                <Link to="/gestures" className="hover:text-gestura-text hover:underline transition-colors">3D Gesture Inspector</Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-gestura-text hover:underline transition-colors">Sensitivity Calibration</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gestura-text hover:underline transition-colors">AI Architecture & Metrics</Link>
              </li>
            </ul>
          </div>

          {/* Biomechanical Specifications (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-display font-bold text-gestura-text text-sm uppercase tracking-wider font-mono">
              AI Specifications
            </h4>
            <div className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border space-y-2 text-xs font-mono text-gestura-textMuted">
              <div className="flex items-center justify-between">
                <span>Model Architecture:</span>
                <span className="font-bold text-gestura-text">MediaPipe Vision + Random Forest</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Landmark Points:</span>
                <span className="font-bold text-gestura-text">21 3D Spatial Coordinates</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Feature Vector:</span>
                <span className="font-bold text-gestura-text">83 Biomechanical Features</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Inference Latency:</span>
                <span className="font-bold text-gestura-text">1.45 ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gestura-textSubtle">
          <p>
            &copy; {new Date().getFullYear()} GESTURA AI. Built for sterile surgical suites & motor disability accessibility.
          </p>
          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 rounded-full bg-gestura-goldLight border border-gestura-yellow/40 text-gestura-text font-bold">
              Zero Cloud Telemetry &bull; 100% On-Device Processing
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
