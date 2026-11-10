import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Hand,
  Volume2,
  Shield,
  Zap
} from 'lucide-react';
import { api, SystemSettings } from '../services/api';

export default function SettingsTab() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [savedMessage, setSavedMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data) setSettings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    if (!settings) return;
    try {
      const res = await api.updateSettings(settings);
      if (res) {
        setSavedMessage('Settings successfully saved to FastAPI backend!');
        setTimeout(() => setSavedMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetDefaults = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      sensitivity: 1.35,
      cursor_speed: 1.25,
      click_delay: 0.35,
      scroll_speed: 1.0,
      volume_sensitivity: 1.0,
      smoothing_factor: 0.28,
      left_handed_mode: false,
      mouse_enabled: true,
      click_enabled: true,
      right_click_enabled: true,
      scroll_enabled: true,
      volume_enabled: true,
      enabled_gestures: {
        OPEN_PALM: true,
        INDEX_POINTING: true,
        PINCH: true,
        TWO_FINGER_PINCH: true,
        VICTORY: true,
        CLOSED_FIST: true,
        THUMBS_UP: true
      }
    });
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs font-mono text-gestura-textMuted">Loading settings...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-gestura-goldLight text-gestura-text font-mono text-[11px] font-bold border border-gestura-yellow/40">
              CALIBRATION & CONTROLS
            </span>
          </div>
          <h2 className="font-display font-extrabold text-gestura-text text-2xl tracking-tight">
            System Preferences & Kinematic Tuning
          </h2>
          <p className="text-sm text-gestura-textMuted max-w-xl mt-0.5">
            Configure sub-pixel filtering, click debounce cooldowns, gesture action channels, and anthropometric hand alignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetDefaults}
            className="px-4 py-2.5 rounded-2xl bg-gestura-surface hover:bg-gestura-goldLight text-gestura-text font-mono text-xs font-bold border border-gestura-border transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Defaults
          </button>
          <button
            onClick={saveSettings}
            className="px-5 py-2.5 rounded-2xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold text-xs shadow-yellow-subtle hover:shadow-yellow-glow transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {savedMessage}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gestura-border">
            <SlidersHorizontal className="w-5 h-5 text-gestura-yellow" />
            <h3 className="font-display font-bold text-gestura-text text-base">Kinematic Velocity & Smoothing</h3>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gestura-text">Displacement Multiplier</span>
              <span className="font-mono font-bold text-gestura-text bg-gestura-goldLight px-2 py-0.5 rounded border border-gestura-yellow/40">
                {settings.sensitivity.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              value={settings.sensitivity}
              onChange={(e) => setSettings({ ...settings, sensitivity: parseFloat(e.target.value) })}
              className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gestura-text">Cursor Speed Factor</span>
              <span className="font-mono font-bold text-gestura-text bg-gestura-goldLight px-2 py-0.5 rounded border border-gestura-yellow/40">
                {settings.cursor_speed.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              value={settings.cursor_speed}
              onChange={(e) => setSettings({ ...settings, cursor_speed: parseFloat(e.target.value) })}
              className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gestura-text">Pinch Cooldown Timer (Debounce)</span>
              <span className="font-mono font-bold text-gestura-text bg-gestura-goldLight px-2 py-0.5 rounded border border-gestura-yellow/40">
                {(settings.click_delay * 1000).toFixed(0)} ms
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.click_delay}
              onChange={(e) => setSettings({ ...settings, click_delay: parseFloat(e.target.value) })}
              className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gestura-text">Tremor Suppression (EMA Alpha)</span>
              <span className="font-mono font-bold text-gestura-text bg-gestura-goldLight px-2 py-0.5 rounded border border-gestura-yellow/40">
                {(settings.smoothing_factor ?? 0.28).toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.02"
              value={settings.smoothing_factor ?? 0.28}
              onChange={(e) => setSettings({ ...settings, smoothing_factor: parseFloat(e.target.value) })}
              className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gestura-border">
            <Hand className="w-5 h-5 text-gestura-yellow" />
            <h3 className="font-display font-bold text-gestura-text text-base">Hand Configuration & Toggles</h3>
          </div>

          <div
            onClick={() => setSettings({ ...settings, left_handed_mode: !settings.left_handed_mode })}
            className="p-4 rounded-2xl bg-gestura-surface border border-gestura-border flex items-center justify-between cursor-pointer select-none"
          >
            <div>
              <h5 className="font-bold text-sm text-gestura-text">Left-Handed Biomechanics</h5>
              <p className="text-xs text-gestura-textMuted">Inverts thumb-to-pinky lateral coordinate vectors</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
              settings.left_handed_mode ? 'bg-gestura-yellow' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                settings.left_handed_mode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-gestura-textSubtle uppercase tracking-wider block mb-2">
              Permitted Gesture Intents
            </span>
            <div className="flex flex-col gap-2">
              {Object.entries(settings.enabled_gestures || {}).map(([gId, enabled]) => (
                <label
                  key={gId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gestura-surface/60 border border-gestura-border text-xs cursor-pointer select-none hover:bg-gestura-goldLight/40"
                >
                  <span className="font-mono text-gestura-text font-medium">{gId.replace(/_/g, ' ')}</span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        enabled_gestures: {
                          ...settings.enabled_gestures,
                          [gId]: e.target.checked
                        }
                      })
                    }
                    className="w-4 h-4 accent-gestura-yellow rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
