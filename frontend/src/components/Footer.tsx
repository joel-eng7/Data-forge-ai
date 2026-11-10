import React from 'react';
import { Link } from 'react-router-dom';
import { Hand, ShieldCheck, Heart, Sparkles, Terminal, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-rose-100 bg-gradient-to-b from-white/60 to-[#FFF3F6] pt-14 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-rose-100/80">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-soft">
                <Hand className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
                GESTURA <span className="text-rose-500">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Touchless computing powered by 21-landmark MediaPipe vision and low-latency desktop automation.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Local Processing — Zero Video Uploads</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800 mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/" className="hover:text-rose-600 transition-colors">Home Landing</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-rose-600 transition-colors">Gesture Control Dashboard</Link>
              </li>
              <li>
                <Link to="/gestures" className="hover:text-rose-600 transition-colors">Gesture Library (7 Poses)</Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-rose-600 transition-colors">System Preferences</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Gestures */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800 mb-3">
              Supported Gestures
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <span>👉</span> Index Pointing (Mouse Move)
              </li>
              <li className="flex items-center gap-1.5">
                <span>👌</span> Pinch (Left Click)
              </li>
              <li className="flex items-center gap-1.5">
                <span>🤏</span> Two-Finger Pinch (Right Click)
              </li>
              <li className="flex items-center gap-1.5">
                <span>✌️</span> Victory (Scroll Up/Down)
              </li>
              <li className="flex items-center gap-1.5">
                <span>✊</span> Closed Fist (Safe Stop)
              </li>
            </ul>
          </div>

          {/* Column 4: Architecture */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800 mb-3">
              Technology Stack
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                MediaPipe Hand Landmarker Vision Tasks
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                FastAPI & High-Frequency WebSocket
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                PyAutoGUI Desktop Automation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Three.js 3D Articulated Hand Engine
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} GESTURA AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for touchless computing
          </p>
        </div>
      </div>
    </footer>
  );
}
