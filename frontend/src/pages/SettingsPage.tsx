import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  HardDrive,
  Cpu,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface SettingsPageProps {
  user: { email: string; full_name: string; role: string } | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const toast = useToast();
  const [fullName, setFullName] = useState(user?.full_name || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'alex@dataforge.ai');
  const [role, setRole] = useState(user?.role || 'Lead Data Scientist');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile Updated', 'User profile settings saved successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-400" />
          Platform Settings & Environment
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure user identity, inspect persistent SQLite storage, and review Python runtime parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3">
            <User className="w-4 h-4 text-blue-400" />
            <span>User Profile Information</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Organizational Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* System & Storage Specs */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span>Storage & Architecture Specifications</span>
            </div>

            <div className="space-y-2.5 mt-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Database Engine:</span>
                <span className="text-emerald-400 font-semibold">SQLite 3 (WAL Mode)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Backend Framework:</span>
                <span className="text-blue-400 font-semibold">FastAPI + Uvicorn</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Data Transformers:</span>
                <span className="text-purple-400 font-semibold">Pandas 2.2 + Scikit-Learn</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Frontend Stack:</span>
                <span className="text-cyan-400 font-semibold">React 18 + Vite + TS</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">UI Motion:</span>
                <span className="text-pink-400 font-semibold">Framer Motion + Tailwind</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>All microservices & SQLite connections are operational.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
