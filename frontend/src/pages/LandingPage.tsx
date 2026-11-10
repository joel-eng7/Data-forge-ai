import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  ArrowRight,
  Database,
  ShieldCheck,
  Sliders,
  Sparkles,
  BarChart3,
  GitCommit,
  Download,
  CheckCircle2,
  Terminal,
  Code,
  Layers,
  Zap,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenDocs: () => void;
  user: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  onOpenAuth,
  onOpenDocs,
  user,
}) => {
  const [pipelineHoveredStep, setPipelineHoveredStep] = useState<number>(2);

  const workflowSteps = [
    {
      num: '01',
      title: 'Collection & Ingestion',
      desc: 'Automated retrieval of public benchmark repositories (e.g. 32,561 UCI Adult Census records) or custom multipart CSV/XLSX file uploads with schema profiling.',
      icon: Database,
      tag: 'Stream / File'
    },
    {
      num: '02',
      title: 'Automated Quality Audit',
      desc: 'Instant diagnostic audit computing completeness, duplicate frequency, type anomalies, and continuous outlier bounds (IQR & Z-score) with an overall score.',
      icon: ShieldCheck,
      tag: 'Quality Gauge'
    },
    {
      num: '03',
      title: 'Cleaning & Imputation',
      desc: 'Targeted missingness remediation via statistical mean, median, mode, or constant imputation, with sentinel token replacement and row pruning.',
      icon: Sliders,
      tag: 'Pandas & NumPy'
    },
    {
      num: '04',
      title: 'Outlier & Anomaly Management',
      desc: 'Multi-method anomaly containment with statistical IQR boundaries and Z-score gating, supporting winsorization capping or selective row removal.',
      icon: Layers,
      tag: 'Scikit-Learn'
    },
    {
      num: '05',
      title: 'Feature Engineering',
      desc: 'Mathematical transforms (log1p, sqrt), quantile binning, and curated domain indicators (e.g. Adult career brackets, schedule tiers, capital gain flags).',
      icon: Sparkles,
      tag: 'Domain Features'
    },
    {
      num: '06',
      title: 'Export & Code Synthesis',
      desc: 'Instant generation of reproducible Python scripts (preprocess.py), runnable Jupyter Notebooks, sanitized CSV/Excel tables, and comprehensive documentation.',
      icon: Download,
      tag: '100% Reproducible'
    },
  ];

  const features = [
    {
      title: 'UCI Census Benchmark Ingestion',
      desc: 'Pre-bundled official UCI Adult Census Income Dataset with 32,561 records across 15 attributes, including full provenance links.',
      icon: Database,
      accent: 'blue',
    },
    {
      title: 'Holistic Data Quality Gauge',
      desc: 'Calculates dimensional health across Completeness, Uniqueness, Validity, and Consistency with letter grade designations (A+ to F).',
      icon: ShieldCheck,
      accent: 'emerald',
    },
    {
      title: 'Interactive Statistical Imputation',
      desc: 'Mean, median, mode, constant, or complete case pruning with instant before-and-after dimensional diffs.',
      icon: Sliders,
      accent: 'purple',
    },
    {
      title: 'Continuous Feature Scaling',
      desc: 'StandardScaler (z-score), MinMaxScaler [0, 1], and RobustScaler (median & IQR) to prevent feature dominance in ML optimization.',
      icon: Zap,
      accent: 'cyan',
    },
    {
      title: 'Categorical Encoding Engine',
      desc: 'One-hot encoding with dummy trap prevention and integer Label Encoding for high cardinality categorical features.',
      icon: Layers,
      accent: 'amber',
    },
    {
      title: 'Reproducible Script Generator',
      desc: 'Dynamically translates all UI pipeline operations into executable preprocess.py and Jupyter Notebook files for scientific verification.',
      icon: Code,
      accent: 'rose',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Navbar */}
      <nav className="h-16 px-6 lg:px-12 border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
            DataForge <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <a href="#hero" className="hover:text-white transition-colors">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
          <button onClick={onOpenDocs} className="hover:text-white transition-colors">Documentation</button>
          <a href="#tech" className="hover:text-white transition-colors">Architecture</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={onEnterDashboard}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
            >
              <span>Go to Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onEnterDashboard}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-20 pb-16 px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-purple-600/15 blur-3xl rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-mono text-slate-300 mb-6 shadow-xl"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Production-Ready Tabular Data Preparation Engine
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]"
        >
          Transform Raw Data Into{' '}
          <span className="text-gradient">Reliable Intelligence.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-slate-400 text-sm sm:text-lg max-w-2xl leading-relaxed"
        >
          Collect, clean, analyze, and prepare real-world datasets with a complete, transparent data preprocessing pipeline. Built on the 32,561-record UCI Adult Census benchmark.
        </motion.p>

        {/* Hero CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <button
            onClick={onEnterDashboard}
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-blue-500/25 flex items-center gap-2.5 transition-all hover:scale-105"
          >
            <span>Start Processing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#workflow"
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 flex items-center gap-2 transition-all"
          >
            Explore Workflow
          </a>
        </motion.div>

        {/* Hero Animated Data Pipeline Visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 w-full max-w-5xl rounded-2xl bg-[#111827] border border-white/10 shadow-2xl p-6 lg:p-8 overflow-hidden text-left"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">dataforge-pipeline-stream.py</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live Backend Synchronized
            </div>
          </div>

          {/* Interactive Pipeline Transformation Stage View */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              onMouseEnter={() => setPipelineHoveredStep(1)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                pipelineHoveredStep === 1
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/5 bg-slate-900/60 hover:bg-white/5'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-500 uppercase">Stage 01</div>
              <div className="text-xs font-bold text-white mt-1">Raw Stream Ingestion</div>
              <div className="mt-3 text-[11px] font-mono text-slate-400 space-y-1">
                <div>• UCI Adult Dataset</div>
                <div>• 32,561 samples</div>
                <div className="text-rose-400">• 4,262 dirty '?' tokens</div>
              </div>
            </div>

            <div
              onMouseEnter={() => setPipelineHoveredStep(2)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                pipelineHoveredStep === 2
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/5 bg-slate-900/60 hover:bg-white/5'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-500 uppercase">Stage 02</div>
              <div className="text-xs font-bold text-white mt-1">Quality Inspection</div>
              <div className="mt-3 text-[11px] font-mono text-slate-400 space-y-1">
                <div>• 24 Duplicate rows</div>
                <div>• Outlier bounds (IQR)</div>
                <div className="text-emerald-400">• Quality Score: 96.6 (A+)</div>
              </div>
            </div>

            <div
              onMouseEnter={() => setPipelineHoveredStep(3)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                pipelineHoveredStep === 3
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/5 bg-slate-900/60 hover:bg-white/5'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-500 uppercase">Stage 03</div>
              <div className="text-xs font-bold text-white mt-1">Cleaning & Impute</div>
              <div className="mt-3 text-[11px] font-mono text-slate-400 space-y-1">
                <div>• Mode & Median fill</div>
                <div>• Duplicate pruning</div>
                <div className="text-blue-400">• 0 Null cells remain</div>
              </div>
            </div>

            <div
              onMouseEnter={() => setPipelineHoveredStep(4)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                pipelineHoveredStep === 4
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/5 bg-slate-900/60 hover:bg-white/5'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-500 uppercase">Stage 04</div>
              <div className="text-xs font-bold text-white mt-1">Feature Engineering</div>
              <div className="mt-3 text-[11px] font-mono text-slate-400 space-y-1">
                <div>• age_group brackets</div>
                <div>• work_schedule_type</div>
                <div className="text-purple-400">• Model-ready export</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="text-slate-400 font-mono text-[11px]">
              Ready-to-run pipeline in <span className="text-white">Python 3.13</span> + <span className="text-white">FastAPI</span> + <span className="text-white">Pandas</span>
            </div>
            <button
              onClick={onEnterDashboard}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Explore Interactive Studio</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats Counter Strip */}
      <section className="py-10 border-y border-white/10 bg-[#0E1522]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono">
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-white">32,561+</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Benchmark Records</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-blue-400">100%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Audit Traceability</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-emerald-400">&lt; 150ms</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Transform Latency</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-purple-400">16 / 16</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Pipeline Specs Met</div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400">
            Engine Capabilities
          </h2>
          <h3 className="text-3xl font-extrabold tracking-tight text-white">
            A Complete Toolset for Data Science Preparation
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything required to audit dirty datasets, eliminate missingness, isolate anomalies, construct predictive features, and export verified pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-2xl bg-[#111827] border border-white/10 hover:border-white/20 transition-all shadow-xl flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6-Step Workflow */}
      <section id="workflow" className="py-20 px-6 lg:px-12 bg-[#0E1522] border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono uppercase tracking-widest text-purple-400">
              End-To-End Methodology
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-white">
              The 6-Step Machine Learning Data Preparation Pipeline
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Conforms strictly to standard CRISP-DM methodology for machine learning data quality and feature engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-6 rounded-2xl bg-[#111827] border border-white/10 flex flex-col justify-between gap-4 shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xl font-bold text-slate-500">{step.num}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {step.tag}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-blue-400" />
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Visual */}
      <section id="tech" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto w-full text-center space-y-8">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Built on Modern Commercial & Scientific Infrastructure
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            'Python 3.13',
            'FastAPI',
            'Pandas 2.2',
            'NumPy',
            'Scikit-learn',
            'SQLite (WAL)',
            'React 18',
            'TypeScript',
            'Tailwind CSS',
            'Framer Motion',
            'Recharts',
            'Uvicorn',
          ].map((tech) => (
            <div
              key={tech}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-300 shadow-sm"
            >
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#0E1522] py-10 px-6 lg:px-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-300">DataForge AI</span>
            <span>— AI-Powered Data Collection & Preprocessing Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenDocs} className="hover:text-slate-300 transition-colors">
              Documentation
            </button>
            <button onClick={onEnterDashboard} className="hover:text-slate-300 transition-colors">
              Studio Dashboard
            </button>
            <a
              href="https://archive.ics.uci.edu/dataset/2/adult"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              UCI Census Source <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
