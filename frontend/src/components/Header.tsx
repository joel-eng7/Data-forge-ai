import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Database,
  ExternalLink,
  ShieldCheck,
  FileCode,
  FileSpreadsheet,
  BookOpen,
  LogOut,
  User,
  Home
} from 'lucide-react';
import { DatasetSummary, api } from '../services/api';

interface HeaderProps {
  currentDataset: DatasetSummary | null;
  datasets: DatasetSummary[];
  onSelectDataset: (id: string) => void;
  onResetDataset: () => void;
  onNavigateHome: () => void;
  user: { email: string; full_name: string; role: string } | null;
  onLogout: () => void;
  qualityScore?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentDataset,
  datasets,
  onSelectDataset,
  onResetDataset,
  onNavigateHome,
  user,
  onLogout,
  qualityScore = 96.6
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDsMenu, setShowDsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const downloadFile = (format: 'csv' | 'excel' | 'script' | 'notebook' | 'documentation') => {
    if (!currentDataset) return;
    const url = api.getExportUrl(currentDataset.id, format);
    window.open(url, '_blank');
    setShowExportMenu(false);
  };

  return (
    <header className="h-16 px-6 bg-[#0B0F17]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20 shrink-0">
      {/* Left: Dataset Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
          title="Return to Landing Page"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Landing Page</span>
        </button>

        <div className="h-4 w-[1px] bg-white/10" />

        <div className="relative">
          <button
            onClick={() => setShowDsMenu(!showDsMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs text-slate-200 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold max-w-[200px] truncate">
              {currentDataset ? currentDataset.name : 'Select Dataset'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDsMenu && (
            <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50">
              <div className="text-[10px] font-mono uppercase text-slate-400 px-3 py-1.5">
                Active Projects & Datasets
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {datasets.map((ds) => (
                  <button
                    key={ds.id}
                    onClick={() => {
                      onSelectDataset(ds.id);
                      setShowDsMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex flex-col gap-0.5 transition-colors ${
                      currentDataset?.id === ds.id
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="font-medium truncate">{ds.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {ds.current_rows.toLocaleString()} rows • {ds.current_cols} cols
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {currentDataset && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5 text-slate-400 font-mono">
              {currentDataset.current_rows.toLocaleString()} × {currentDataset.current_cols}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Score: {qualityScore}
            </span>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Reset Dataset Button */}
        <button
          onClick={onResetDataset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 transition-all"
          title="Reset dataset back to original raw uploaded state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Raw</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50">
              <div className="text-[10px] font-mono uppercase text-slate-400 px-3 py-1.5">
                Download Clean Artefacts
              </div>
              <button
                onClick={() => downloadFile('csv')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/5 transition-colors"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Clean Dataset (CSV)</span>
              </button>
              <button
                onClick={() => downloadFile('excel')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/5 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-400" />
                <span>Clean Dataset (Excel .xlsx)</span>
              </button>
              <button
                onClick={() => downloadFile('script')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/5 transition-colors"
              >
                <FileCode className="w-4 h-4 text-blue-400" />
                <span>Pipeline Script (preprocess.py)</span>
              </button>
              <button
                onClick={() => downloadFile('notebook')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Jupyter Notebook (.ipynb)</span>
              </button>
              <button
                onClick={() => downloadFile('documentation')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/5 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Full Documentation (.md)</span>
              </button>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow">
              {user ? user.full_name.charAt(0) : 'A'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <div className="font-semibold text-xs text-slate-100">{user?.full_name || 'Alex Morgan'}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email || 'alex@dataforge.ai'}</div>
                <div className="text-[10px] text-blue-400 font-mono mt-0.5">{user?.role || 'Lead Data Scientist'}</div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
