import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Menu,
  X,
  ArrowRight,
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
    { label: '3D Gestures', path: '/gestures' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Features', path: '/#features' },
    { label: 'Architecture', path: '/about' },
    { label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) {
      return location.pathname === '/' && location.hash === path.substring(1);
    }
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-2xl bg-white/95 border-b border-gestura-border transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-10 h-10 rounded-2xl bg-gestura-yellow text-gestura-text flex items-center justify-center shadow-yellow-subtle group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 text-gestura-text fill-gestura-text" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xl tracking-tight text-gestura-text">
                GESTURA
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gestura-yellow text-gestura-text font-mono font-bold tracking-wider border border-gestura-yellowHover">
                AI
              </span>
            </div>
            <p className="text-[10px] text-gestura-textMuted font-mono font-medium -mt-0.5">
              Touchless Spatial Computing
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-gestura-surface p-1.5 rounded-2xl border border-gestura-border backdrop-blur-md shadow-xs">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all select-none ${
                  active
                    ? 'bg-gestura-yellow text-gestura-text shadow-yellow-subtle border border-gestura-yellowHover'
                    : 'text-gestura-textMuted hover:text-gestura-text hover:bg-gestura-goldLight'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Live Status Indicator & Launch CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gestura-border text-xs font-mono shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isEngineReady ? 'bg-gestura-yellow animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-gestura-textMuted font-medium">Engine</span>
            <span className="font-bold text-gestura-text">{isEngineReady ? 'ACTIVE' : 'STANDBY'}</span>
          </div>

          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold text-xs shadow-yellow-subtle hover:shadow-yellow-glow transition-all active:scale-95 flex items-center gap-1.5"
          >
            Launch Live Console
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white border border-gestura-border text-gestura-text hover:bg-gestura-goldLight"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 rounded-2xl bg-white border border-gestura-border shadow-card-glass backdrop-blur-2xl space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive(link.path)
                  ? 'bg-gestura-yellow text-gestura-text'
                  : 'text-gestura-text hover:bg-gestura-surface'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gestura-border">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-gestura-yellow text-gestura-text font-bold text-xs flex items-center justify-center gap-2 shadow-yellow-subtle"
            >
              Launch Live Console
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
