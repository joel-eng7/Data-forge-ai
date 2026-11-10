import React, { useState } from 'react';
import {
  MousePointer,
  MousePointerClick,
  ArrowUpDown,
  Volume2,
  Sliders,
  CheckCircle,
  SlidersHorizontal,
  Wand2,
} from 'lucide-react';
import { SystemSettings } from '../services/api';

interface ComputerControlPanelProps {
  settings: SystemSettings;
  onUpdateSetting: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => void;
  currentVolume: number;
  onVolumeChange: (val: number) => void;
  isBackendConnected: boolean;
}

export default function ComputerControlPanel({
  settings,
  onUpdateSetting,
  currentVolume,
  onVolumeChange,
  isBackendConnected
}: ComputerControlPanelProps) {
  const [activePreset, setActivePreset] = useState<'desktop' | 'presentation' | 'media' | 'precision'>('desktop');

  // Control Presets
  const applyPreset = (preset: 'desktop' | 'presentation' | 'media' | 'precision') => {
    setActivePreset(preset);
    if (preset === 'desktop') {
      onUpdateSetting('sensitivity', 1.35);
      onUpdateSetting('cursor_speed', 1.25);
      onUpdateSetting('click_delay', 0.35);
      onUpdateSetting('scroll_speed', 1.0);
      onUpdateSetting('smoothing_factor', 0.28);
    } else if (preset === 'presentation') {
      onUpdateSetting('sensitivity', 1.8);
      onUpdateSetting('cursor_speed', 1.5);
      onUpdateSetting('click_delay', 0.5);
      onUpdateSetting('scroll_speed', 1.5);
      onUpdateSetting('smoothing_factor', 0.35);
    } else if (preset === 'media') {
      onUpdateSetting('sensitivity', 1.1);
      onUpdateSetting('cursor_speed', 1.0);
      onUpdateSetting('click_delay', 0.45);
      onUpdateSetting('scroll_speed', 1.2);
      onUpdateSetting('volume_sensitivity', 1.5);
      onUpdateSetting('smoothing_factor', 0.25);
    } else if (preset === 'precision') {
      onUpdateSetting('sensitivity', 0.85);
      onUpdateSetting('cursor_speed', 0.85);
      onUpdateSetting('click_delay', 0.3);
      onUpdateSetting('scroll_speed', 0.8);
      onUpdateSetting('smoothing_factor', 0.16);
    }
  };

  const toggleItems: Array<{
    key: keyof SystemSettings;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'mouse_enabled',
      label: 'Mouse Movement',
      sublabel: 'Index finger guides desktop pointer',
      icon: <MousePointer className="w-4 h-4 text-gestura-text" />
    },
    {
      key: 'click_enabled',
      label: 'Left Click',
      sublabel: 'Pinch thumb + index to click',
      icon: <MousePointerClick className="w-4 h-4 text-gestura-text" />
    },
    {
      key: 'right_click_enabled',
      label: 'Right Click',
      sublabel: 'Two-finger pinch context menu',
      icon: <CheckCircle className="w-4 h-4 text-gestura-text" />
    },
    {
      key: 'scroll_enabled',
      label: 'Two-Finger Scroll',
      sublabel: 'Victory gesture vertical scrolling',
      icon: <ArrowUpDown className="w-4 h-4 text-gestura-text" />
    },
    {
      key: 'volume_enabled',
      label: 'Volume Control',
      sublabel: 'Dynamic audio adjustment',
      icon: <Volume2 className="w-4 h-4 text-gestura-text" />
    }
  ];

  return (
    <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gestura-yellow text-gestura-text flex items-center justify-center shadow-yellow-subtle font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gestura-text text-lg">Computer Control Engine</h3>
            <p className="text-xs text-gestura-textMuted">Live Operating System Automation Rules</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
            isBackendConnected
              ? 'bg-gestura-goldLight text-gestura-text border-gestura-yellow/60 shadow-xs'
              : 'bg-gestura-surface text-gestura-textMuted border-gestura-border'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-gestura-yellow animate-pulse' : 'bg-gray-400'}`} />
          {isBackendConnected ? 'Desktop Sync Active' : 'Frontend Sandbox'}
        </span>
      </div>

      {/* Preset Buttons Strip */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-gestura-textMuted uppercase tracking-wider flex items-center gap-1">
          <Wand2 className="w-3.5 h-3.5 text-gestura-yellowHover" />
          Control Mode Presets
        </span>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'desktop', label: 'Desktop' },
            { id: 'presentation', label: 'Slides' },
            { id: 'media', label: 'Media' },
            { id: 'precision', label: 'Fine' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id as any)}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all active:scale-95 border ${
                activePreset === p.id
                  ? 'bg-gestura-yellow text-gestura-text border-gestura-yellowHover shadow-yellow-subtle font-bold'
                  : 'bg-gestura-surface hover:bg-gestura-goldLight text-gestura-text border-gestura-border'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Toggles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {toggleItems.map(item => {
          const isChecked = !!settings[item.key];
          return (
            <label
              key={item.key}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isChecked
                  ? 'bg-gestura-goldLight/70 border-gestura-yellow/50 shadow-xs'
                  : 'bg-white border-gestura-border opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white shadow-xs border border-gestura-border text-gestura-text">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gestura-text leading-tight">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-gestura-textMuted mt-0.5 leading-tight">
                    {item.sublabel}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => onUpdateSetting(item.key, e.target.checked as any)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gestura-yellow shadow-inner" />
              </div>
            </label>
          );
        })}
      </div>

      {/* Sensitivity & Precision Sliders */}
      <div className="space-y-4 pt-2 border-t border-gestura-border">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gestura-textMuted flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gestura-yellowHover" />
          Kinematics & Sensitivity Calibration
        </h4>

        {/* 1. Gesture Sensitivity */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-gestura-text">Gesture Sensitivity</span>
            <span className="font-mono font-bold text-gestura-text bg-gestura-goldLight px-2 py-0.5 rounded border border-gestura-yellow/40">
              {settings.sensitivity.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={settings.sensitivity}
            onChange={(e) => onUpdateSetting('sensitivity', parseFloat(e.target.value))}
            className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gestura-textSubtle mt-1">
            <span>Precise (0.5x)</span>
            <span>Balanced (1.35x)</span>
            <span>High Speed (2.5x)</span>
          </div>
        </div>

        {/* 2. Cursor Speed */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-gestura-text">Cursor Acceleration</span>
            <span className="font-mono font-bold text-gestura-text bg-gestura-goldLight px-2 py-0.5 rounded border border-gestura-yellow/40">
              {settings.cursor_speed.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={settings.cursor_speed}
            onChange={(e) => onUpdateSetting('cursor_speed', parseFloat(e.target.value))}
            className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
          />
        </div>

        {/* 3. Anti-Tremor EMA Smoothing Alpha */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-gestura-text">Anti-Tremor Smoothing (EMA Alpha)</span>
            <span className="font-mono font-bold text-gestura-text bg-gestura-goldLight px-2 py-0.5 rounded border border-gestura-yellow/40">
              {(settings.smoothing_factor ?? 0.28).toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.50"
            step="0.02"
            value={settings.smoothing_factor ?? 0.28}
            onChange={(e) => onUpdateSetting('smoothing_factor', parseFloat(e.target.value))}
            className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gestura-textSubtle mt-1">
            <span>Max Smoothing (0.10)</span>
            <span>Instant Response (0.50)</span>
          </div>
        </div>

        {/* 4. Click Cooldown Delay */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-gestura-text">Click Debounce Delay</span>
            <span className="font-mono font-bold text-gestura-text bg-gestura-goldLight px-2 py-0.5 rounded border border-gestura-yellow/40">
              {settings.click_delay.toFixed(2)}s
            </span>
          </div>
          <input
            type="range"
            min="0.15"
            max="0.80"
            step="0.05"
            value={settings.click_delay}
            onChange={(e) => onUpdateSetting('click_delay', parseFloat(e.target.value))}
            className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
          />
        </div>

        {/* 5. Live System Volume Control */}
        <div className="p-3.5 rounded-2xl bg-gestura-goldLight/50 border border-gestura-yellow/40 shadow-xs">
          <div className="flex justify-between items-center text-xs mb-2">
            <div className="flex items-center gap-1.5 text-gestura-text font-semibold">
              <Volume2 className="w-4 h-4 text-gestura-text" />
              <span>System Output Volume</span>
            </div>
            <span className="font-mono font-bold text-gestura-text">{currentVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentVolume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value, 10))}
            className="w-full accent-gestura-yellow h-2 bg-white rounded-lg cursor-pointer border border-gestura-border"
          />
        </div>
      </div>
    </div>
  );
}
