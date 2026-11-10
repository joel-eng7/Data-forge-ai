import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Camera,
  CheckCircle,
  RotateCcw,
  Save,
  HelpCircle,
  Volume2,
  MousePointer,
  Sparkles,
  ShieldCheck,
  Zap,
  Power
} from 'lucide-react';
import { api, SystemSettings } from '../services/api';
import { GESTURE_DEFINITIONS } from '../gestures/gestureDefinitions';

const DEFAULT_SETTINGS: SystemSettings = {
  mouse_enabled: true,
  click_enabled: true,
  right_click_enabled: true,
  scroll_enabled: true,
  volume_enabled: true,
  sensitivity: 1.35,
  cursor_speed: 1.25,
  click_delay: 0.35,
  scroll_speed: 1.0,
  volume_sensitivity: 1.0,
  left_handed_mode: false,
  enabled_gestures: {
    OPEN_PALM: true,
    INDEX_POINTING: true,
    PINCH: true,
    TWO_FINGER_PINCH: true,
    VICTORY: true,
    CLOSED_FIST: true,
    THUMBS_UP: true
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('gestura_settings');
    if (saved) {
      try { return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }; } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [autoStartDashboard, setAutoStartDashboard] = useState<boolean>(() => {
    return localStorage.getItem('gestura_autostart') === 'true';
  });

  const handleUpdate = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('gestura_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleGesture = (id: string, active: boolean) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        enabled_gestures: {
          ...prev.enabled_gestures,
          [id]: active
        }
      };
      localStorage.setItem('gestura_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveAll = async () => {
    localStorage.setItem('gestura_settings', JSON.stringify(settings));
    localStorage.setItem('gestura_autostart', String(autoStartDashboard));
    await api.updateSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('gestura_settings', JSON.stringify(DEFAULT_SETTINGS));
    await api.updateSettings(DEFAULT_SETTINGS);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            Configuration & Preferences
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
            System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tune computer control speeds, sensitivity, hand orientation, and toggle specific gestures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-2xl bg-white border border-rose-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-soft flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          Settings successfully saved to local storage and synchronized with the Python control engine.
        </div>
      )}

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Cursor & Movement */}
        <div className="rounded-3xl p-6 glass-panel border border-rose-200/60 shadow-soft space-y-5">
          <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-rose-500" />
            Cursor & Tracking Dynamics
          </h3>

          {/* Gesture Sensitivity */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Gesture Sensitivity</span>
              <span className="font-mono font-bold text-rose-600">{settings.sensitivity.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={settings.sensitivity}
              onChange={(e) => handleUpdate('sensitivity', parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-rose-100 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Scales hand movement to screen displacement. Higher values require less physical hand movement.
            </p>
          </div>

          {/* Cursor Speed */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Cursor Acceleration</span>
              <span className="font-mono font-bold text-rose-600">{settings.cursor_speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={settings.cursor_speed}
              onChange={(e) => handleUpdate('cursor_speed', parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-rose-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Click Debounce Delay */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Click Debounce Delay</span>
              <span className="font-mono font-bold text-rose-600">{settings.click_delay.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.80"
              step="0.05"
              value={settings.click_delay}
              onChange={(e) => handleUpdate('click_delay', parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-rose-100 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Minimum cooldown between clicks to prevent accidental repeated clicks.
            </p>
          </div>
        </div>

        {/* Section 2: Scrolling & System */}
        <div className="rounded-3xl p-6 glass-panel border border-rose-200/60 shadow-soft space-y-5">
          <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-pink-500" />
            Scrolling & Audio Calibration
          </h3>

          {/* Scroll Speed */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Two-Finger Scroll Velocity</span>
              <span className="font-mono font-bold text-rose-600">{settings.scroll_speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={settings.scroll_speed}
              onChange={(e) => handleUpdate('scroll_speed', parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-rose-100 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Controls lines scrolled per unit of vertical hand movement during Victory gesture.
            </p>
          </div>

          {/* Volume Sensitivity */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Volume Sensitivity</span>
              <span className="font-mono font-bold text-rose-600">{settings.volume_sensitivity.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={settings.volume_sensitivity}
              onChange={(e) => handleUpdate('volume_sensitivity', parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-rose-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Handedness Switch */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-rose-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Left-Handed Mode</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Optimizes thumb geometry calculations for left-handed operators.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.left_handed_mode}
              onChange={(e) => handleUpdate('left_handed_mode', e.target.checked)}
              className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
            />
          </div>

          {/* Auto Start Switch */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-rose-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Auto-Start on Open</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically request and start camera whenever the Dashboard is launched.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoStartDashboard}
              onChange={(e) => {
                setAutoStartDashboard(e.target.checked);
                localStorage.setItem('gestura_autostart', String(e.target.checked));
              }}
              className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Enable / Disable Individual Gestures */}
      <div className="rounded-3xl p-6 glass-panel border border-rose-200/60 shadow-soft space-y-4">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-lg">
            Gesture Enablement & Filtering
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Turn individual gestures on or off. Disabled gestures will be ignored by the automation engine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {Object.values(GESTURE_DEFINITIONS).map((g) => {
            const isEnabled = settings.enabled_gestures?.[g.id] ?? true;
            return (
              <label
                key={g.id}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isEnabled
                    ? 'bg-white/80 border-rose-200/80 shadow-xs'
                    : 'bg-slate-50/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl shrink-0">{g.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{g.name}</p>
                    <p className="text-[11px] text-rose-600 truncate">{g.action}</p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => handleToggleGesture(g.id, e.target.checked)}
                  className="w-5 h-5 accent-rose-500 rounded cursor-pointer shrink-0"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
