import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Database,
  Table,
  ShieldCheck,
  Sliders,
  Sparkles,
  BarChart3,
  GitCommit,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Layers
} from 'lucide-react';

export type DashboardTab =
  | 'overview'
  | 'collection'
  | 'explorer'
  | 'quality'
  | 'preprocessing'
  | 'features'
  | 'visualizations'
  | 'history'
  | 'documentation'
  | 'settings';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  datasetName?: string;
  totalRows?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  datasetName = 'UCI Adult Census',
  totalRows = 32561
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'collection', label: 'Dataset Collection', icon: Database, badge: null },
    { id: 'explorer', label: 'Data Explorer', icon: Table, badge: null },
    { id: 'quality', label: 'Data Quality', icon: ShieldCheck, badge: 'Audit' },
    { id: 'preprocessing', label: 'Preprocessing', icon: Sliders, badge: 'Engine' },
    { id: 'features', label: 'Feature Engineering', icon: Sparkles, badge: 'ML' },
    { id: 'visualizations', label: 'Visualizations', icon: BarChart3, badge: null },
    { id: 'history', label: 'Pipeline History', icon: GitCommit, badge: null },
    { id: 'documentation', label: 'Documentation', icon: BookOpen, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ] as const;

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-screen bg-[#0E1522] border-r border-white/10 z-30 select-none"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                DataForge <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">Data Prep Platform</span>
            </motion.div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Pipeline Card (when expanded) */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Dataset
            </span>
            <span className="font-mono text-emerald-400 text-[10px]">Ready</span>
          </div>
          <div className="text-xs font-semibold text-slate-200 truncate" title={datasetName}>
            {datasetName}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {totalRows.toLocaleString()} samples staged
          </div>
        </div>
      )}

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-blue-400 scale-110' : 'group-hover:scale-110'}`} />
              
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between text-left truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 text-center">
        {!collapsed ? (
          <div className="text-[10px] text-slate-500 flex flex-col gap-0.5">
            <span className="font-mono">Engine v1.0 • Py3.13</span>
            <span>DataForge AI SaaS Platform</span>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" title="System Operational" />
        )}
      </div>
    </motion.aside>
  );
};
