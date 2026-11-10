import React from 'react';
import {
  MousePointer,
  MousePointerClick,
  ArrowUpDown,
  Volume2,
  Sliders,
  Gauge,
  CheckCircle,
  HelpCircle,
  SlidersHorizontal,
  Layers,
  Zap
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
      sublabel: 'Two-finger pinch opens context menu',
      icon: <Layers className="w-4 h-4 text-gestura-text" />
    },
    {
      key: 'scroll_enabled',
      label: 'Vertical Scrolling',
      sublabel: 'Victory sign moves pages up & down',
      icon: <ArrowUpDown className="w-4 h-4 text-gestura-text" />
    },
    {
      key: 'volume_enabled',
      label: 'Volume Adjust',
      sublabel: 'Dynamic audio level calibration',
      icon: <Volume2 className="w-4 h-4 text-gestura-text" />
    }
  ];

  return (
    <div className="rounded-3xl p-6 glass-panel border border-gestura-border shadow-card-soft flex flex-col gap-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gestura-yellow text-gestura-text flex items-center justify-center shadow-yellow-subtle">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gestura-text text-lg">Control Calibration</h3>
            <p className="text-xs text-gestura-textMuted font-mono">
              Desktop Automation & Kinematic Sensitivity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-gestura-surface border border-gestura-border text-gestura-textMuted">
            {settings.platform || 'macOS'}
          </span>
        </div>
      </div>

      {/* Toggles List */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-mono font-bold text-gestura-textSubtle uppercase tracking-wider">
          Active Action Channels
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {toggleItems.map((item) => {
            const isEnabled = Boolean(settings[item.key]);
            return (
              <div
                key={item.key}
                onClick={() => onUpdateSetting(item.key, !isEnabled as any)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                  isEnabled
                    ? 'bg-gestura-goldLight/70 border-gestura-yellow/60 shadow-yellow-subtle'
                    : 'bg-gestura-surface/60 border-gestura-border opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isEnabled ? 'bg-gestura-yellow' : 'bg-gray-200'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-gestura-text leading-tight">{item.label}</h5>
                    <p className="text-[11px] text-gestura-textMuted">{item.sublabel}</p>
                  </div>
                </div>

                {/* Switch indicator */}
                <div className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  isEnabled ? 'bg-gestura-yellow' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="flex flex-col gap-4 pt-2 border-t border-gestura-border">
        <span className="text-xs font-mono font-bold text-gestura-textSubtle uppercase tracking-wider">
          Kinematic Sensitivity & Smoothing
        </span>

        {/* Cursor Sensitivity Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gestura-text">Tracking Sensitivity</span>
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
            onChange={(e) => onUpdateSetting('sensitivity', parseFloat(e.target.value))}
            className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
          />
        </div>

        {/* Click Delay / Cooldown Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gestura-text">Pinch Click Debounce Cooldown</span>
            <span className="font-mono font-bold text-gestura-text bg-gestura-goldLight px-2 py-0.5 rounded border border-gestura-yellow/40">
              {(settings.click_delay * 1000).toFixed(0)} ms
            </span>
          </div>
          <input
            type="range"
            min="0.15"
            max="0.8"
            step="0.05"
            value={settings.click_delay}
            onChange={(e) => onUpdateSetting('click_delay', parseFloat(e.target.value))}
            className="w-full accent-gestura-yellow h-2 bg-gestura-surface rounded-lg cursor-pointer"
          />
        </div>

        {/* EMA Smoothing Factor Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">Tremor Suppression (EMA Smoothing Alpha)</span>
            <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {(settings.smoothing_factor ?? 0.28).toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.60"
            step="0.02"
            value={settings.smoothing_factor ?? 0.28}
            onChange={(e) => onUpdateSetting('smoothing_factor', parseFloat(e.target.value))}
            className="w-full accent-rose-500 h-2 bg-rose-100 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
