import React from 'react';
import {
  History,
  CheckCircle,
  XCircle,
  Trash2,
  Terminal,
  MousePointer,
  MousePointerClick,
  ArrowUpDown,
  Volume2,
  AlertTriangle,
  Lock
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
        return <MousePointerClick className="w-3.5 h-3.5 text-pink-500" />;
      case 'RIGHT_CLICK':
        return <MousePointerClick className="w-3.5 h-3.5 text-purple-500" />;
      case 'MOUSE_MOVE':
        return <MousePointer className="w-3.5 h-3.5 text-rose-500" />;
      case 'SCROLL':
        return <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />;
      case 'VOLUME_CHANGE':
        return <Volume2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'EMERGENCY_STOP':
        return <Lock className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="rounded-3xl p-6 glass-panel border border-rose-200/60 shadow-soft flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center shadow-soft">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-800 text-lg">Activity Monitor</h3>
            <p className="text-xs text-slate-500">Live Stream of Detected Gestures & Desktop Executions</p>
          </div>
        </div>

        <button
          onClick={onClearLog}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Clear Activity Log"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Two columns: Left = Executed Computer Actions, Right = Recent Detected Gestures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Computer Control Executions */}
        <div className="rounded-2xl bg-white/70 border border-rose-100 p-3.5 flex flex-col">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Desktop Automation Actions
            </span>
            <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {activityLog.length} events
            </span>
          </div>

          <div className="h-60 overflow-y-auto pr-1 space-y-2">
            {activityLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <Terminal className="w-6 h-6 mb-1 text-slate-300" />
                <p className="text-xs">No desktop events executed yet.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Point with index finger or pinch to trigger actions.
                </p>
              </div>
            ) : (
              activityLog.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-rose-50/50 border border-slate-150 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-100 shrink-0">
                      {getActionIcon(item.action)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {item.action}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-slate-400">
                      {item.timestamp}
                    </span>
                    {item.success ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> OK
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold flex items-center gap-0.5">
                        <XCircle className="w-2.5 h-2.5" /> ERR
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Detected Gestures Stream */}
        <div className="rounded-2xl bg-white/70 border border-rose-100 p-3.5 flex flex-col">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Recent Confirmed Gestures
            </span>
            <span className="text-[10px] font-mono font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
              Live Feed
            </span>
          </div>

          <div className="h-60 overflow-y-auto pr-1 space-y-2">
            {recentDetections.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <History className="w-6 h-6 mb-1 text-slate-300" />
                <p className="text-xs">No gestures logged yet.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Face your hand towards the webcam.
                </p>
              </div>
            ) : (
              recentDetections.map((det) => (
                <div
                  key={det.id}
                  className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-pink-50/50 border border-slate-150 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">
                      {det.gesture === 'OPEN_PALM' ? '🖐️' :
                       det.gesture === 'INDEX_POINTING' ? '👉' :
                       det.gesture === 'PINCH' ? '👌' :
                       det.gesture === 'TWO_FINGER_PINCH' ? '🤏' :
                       det.gesture === 'VICTORY' ? '✌️' :
                       det.gesture === 'CLOSED_FIST' ? '✊' :
                       det.gesture === 'THUMBS_UP' ? '👍' : '✋🏻'}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{det.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{det.gesture}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-[10px] text-slate-400 block">
                      {det.timestamp}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-rose-600">
                      {det.confidence}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
