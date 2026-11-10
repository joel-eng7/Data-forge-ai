import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const toast = useToast();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasDigit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'register' && !isPasswordValid) {
      setErrorMsg('Password does not meet the security criteria.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.login(email.trim(), password);
        localStorage.setItem('dataforge_token', res.token);
        localStorage.setItem('dataforge_user', JSON.stringify(res.user));
        toast.success('Welcome back!', `Signed in as ${res.user.full_name}`);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(email.trim(), password, fullName.trim());
        localStorage.setItem('dataforge_token', res.token);
        localStorage.setItem('dataforge_user', JSON.stringify(res.user));
        toast.success('Registration Complete', `Account created for ${res.user.full_name}`);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setMode('login');
    setEmail('alex@dataforge.ai');
    setPassword('DataForge2025!');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl shadow-2xl p-6 z-10 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {mode === 'login' ? 'Sign In to DataForge AI' : 'Create an Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'login' ? 'Access your datasets and pipelines' : 'Start your data preprocessing project'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Fast-fill banner */}
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
          <div className="text-blue-300">
            <span className="font-semibold block">Academic / Demo Account</span>
            <span className="text-[10px] text-slate-400 font-mono">alex@dataforge.ai • DataForge2025!</span>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-all shrink-0 shadow"
          >
            Auto-fill
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@dataforge.ai"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1.5 text-[10px] font-mono">
              <div className="text-slate-400 font-semibold mb-1">Security Standards:</div>
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle2 className="w-3 h-3" /> Minimum 8 characters
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle2 className="w-3 h-3" /> Uppercase letter (A-Z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle2 className="w-3 h-3" /> Lowercase letter (a-z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle2 className="w-3 h-3" /> Numeric digit (0-9)
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className="text-blue-400 hover:underline font-semibold"
              >
                Create one now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="text-blue-400 hover:underline font-semibold"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
