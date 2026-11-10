import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Hand,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface NavbarProps {
  isEngineReady?: boolean;
}

export default function Navbar({ isEngineReady = true }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Gesture Library', path: '/gestures' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Settings', path: '/settings' },
    { label: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) {
      return location.pathname === '/' && location.hash === path.substring(1);
    }
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-xl bg-white/85 border-b border-rose-100/80 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 text-white flex items-center justify-center shadow-soft group-hover:shadow-glow-pink group-hover:scale-105 transition-all">
            <Hand className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xl tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                GESTURA
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Control Beyond Touch
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-rose-50/50 p-1.5 rounded-2xl border border-rose-100/60">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? 'bg-white text-rose-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Action & Status */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Engine Status Badge */}
          <div className="px-3 py-1.5 rounded-full bg-white/80 border border-rose-200/80 shadow-xs flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-slate-700">
              AI Engine Ready
            </span>
          </div>

          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs sm:text-sm shadow-soft hover:shadow-glow-pink hover:brightness-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-rose-100" />
            Launch Control
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-rose-50"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-rose-100 mt-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm text-center shadow-soft block"
            >
              Launch Gesture Control
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
