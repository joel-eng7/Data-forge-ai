import React from 'react';
import {
  History,
  Trash2,
  Terminal,
  MousePointer,
  MousePointerClick,
  ArrowUpDown,
  Volume2,
  Lock,
} from 'lucide-react';
import { ActivityLogItem } from '../services/api';

interface ActivityMonitorProps {
  activityLog: ActivityLogItem[];
  onClearLog: () => void;
  recentDetections: Array<{ id: string; gesture: string; name: string; timestamp: string; confidence: number }>;
}

export default function ActivityMonitor({
  activityLog,
  onClearLog,
  recentDetections
}: ActivityMonitorProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LEFT_CLICK':
        return <MousePointerClick className="w-3.5 h-3.5 text-gestura-text" />;
      case 'RIGHT_CLICK':
        return <MousePointerClick className="w-3.5 h-3.5 text-gestura-yellowHover" />;
      case 'MOUSE_MOVE':
        return <MousePointer className="w-3.5 h-3.5 text-gestura-text" />;
      case 'SCROLL':
        return <ArrowUpDown className="w-3.5 h-3.5 text-gestura-text" />;
      case 'VOLUME_CHANGE':
        return <Volume2 className="w-3.5 h-3.5 text-gestura-yellowHover" />;
      case 'EMERGENCY_STOP':
        return <Lock className="w-3.5 h-3.5 text-gestura-text" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-gestura-textSubtle" />;
    }
  };

  return (
    <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gestura-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gestura-yellow text-gestura-text flex items-center justify-center shadow-yellow-subtle font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gestura-text text-lg">Activity Audit Monitor</h3>
            <p className="text-xs text-gestura-textMuted font-mono">Real-Time Stream of Actions & Detections</p>
          </div>
        </div>

        {activityLog.length > 0 && (
          <button
            onClick={onClearLog}
            className="p-1.5 rounded-lg bg-gestura-surface hover:bg-gestura-goldLight text-gestura-textMuted hover:text-gestura-text transition-colors border border-gestura-border"
            title="Clear Activity Log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Split Log Lists: Executed Actions vs Detected Gestures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: Executed Actions Log */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gestura-textMuted block">
            Executed Actions ({activityLog.length})
          </span>

          <div className="h-44 overflow-y-auto space-y-1.5 pr-1">
            {activityLog.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gestura-textSubtle font-mono">
                No actions executed yet.
              </div>
            ) : (
              activityLog.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-xl bg-gestura-surface border border-gestura-border text-xs flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-2">
                    {getActionIcon(item.action)}
                    <div>
                      <span className="font-bold text-gestura-text block">{item.action}</span>
                      <span className="text-[10px] text-gestura-textMuted">{item.details}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gestura-textSubtle shrink-0">{item.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent AI Detections */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gestura-textMuted block">
            Recent Detections ({recentDetections.length})
          </span>

          <div className="h-44 overflow-y-auto space-y-1.5 pr-1">
            {recentDetections.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gestura-textSubtle font-mono">
                Searching for hands...
              </div>
            ) : (
              recentDetections.map((det) => (
                <div
                  key={det.id}
                  className="p-2 rounded-xl bg-gestura-surface border border-gestura-border text-xs flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gestura-yellow" />
                    <div>
                      <span className="font-bold text-gestura-text block">{det.name}</span>
                      <span className="text-[10px] text-gestura-textMuted">Confidence: {det.confidence}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gestura-textSubtle shrink-0">{det.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
