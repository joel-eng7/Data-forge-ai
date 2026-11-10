import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Download,
  Link2,
  FileSpreadsheet,
  CheckCircle2,
  Database,
  ExternalLink,
  AlertCircle,
  FileText,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api, DatasetDetail } from '../services/api';
import { useToast } from '../components/Toast';

interface DatasetCollectionTabProps {
  onDatasetLoaded: (dataset: DatasetDetail) => void;
  activeDatasetId?: string;
}

export const DatasetCollectionTab: React.FC<DatasetCollectionTabProps> = ({
  onDatasetLoaded,
  activeDatasetId,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeMode, setActiveMode] = useState<'presets' | 'upload' | 'url'>('presets');
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [customName, setCustomName] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Available Presets
  const presets = [
    {
      key: 'adult',
      name: 'UCI Adult Census Income Dataset',
      source: 'https://archive.ics.uci.edu/dataset/2/adult',
      sourceLabel: 'UCI Machine Learning Repository',
      samples: '32,561 records',
      features: '15 columns',
      format: 'CSV (3.4 MB)',
      badge: 'Assignment Benchmark',
      description: 'Extracted from the 1994 US Census Bureau database by Ronny Kohavi and Barry Becker. Classic benchmark for tabular machine learning with mixed numerical and categorical features, missing value flags (?), and socioeconomic target (income <=50K vs >50K).',
      primaryTarget: 'income (>50K / <=50K)',
      provenance: 'Official UCI Archive Static Datastore'
    },
    {
      key: 'california_housing',
      name: 'California Housing Dataset',
      source: 'https://www.dcc.fc.up.pt/~ltorgo/Regression/cal_housing.html',
      sourceLabel: 'StatLib & Hands-on ML',
      samples: '20,640 records',
      features: '10 columns',
      format: 'CSV (1.4 MB)',
      badge: 'Regression Benchmark',
      description: 'Based on 1990 California census data with geographical metrics (latitude, longitude), block group median house values, median income, and spatial clustering opportunities.',
      primaryTarget: 'median_house_value',
      provenance: 'Pace & Barry (1997) Sparse Spatial Auto-regressions'
    },
    {
      key: 'titanic',
      name: 'Titanic Passenger Survival Dataset',
      source: 'https://www.kaggle.com/c/titanic',
      sourceLabel: 'OpenML & Kaggle Public Repository',
      samples: '891 records',
      features: '12 columns',
      format: 'CSV (60 KB)',
      badge: 'Classification',
      description: 'Historical passenger demographics, cabin designations, and survival records with notable missingness in age and cabin features.',
      primaryTarget: 'Survived (0 / 1)',
      provenance: 'British Board of Trade Inquiry'
    }
  ];

  const handleSelectPreset = async (presetKey: string) => {
    setIsUploading(true);
    try {
      const ds = await api.loadPreset(presetKey);
      toast.success('Dataset Loaded', `Successfully staged ${ds.name}`);
      onDatasetLoaded(ds);
    } catch (err: any) {
      toast.error('Import Failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const ds = await api.uploadFile(file, customName || undefined);
      toast.success('Upload Complete', `Imported ${file.name} with ${ds.total_rows.toLocaleString()} rows.`);
      setCustomName('');
      onDatasetLoaded(ds);
    } catch (err: any) {
      toast.error('Upload Error', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsUploading(true);
    try {
      const ds = await api.importUrl(urlInput.trim(), customName || undefined);
      toast.success('Import Succeeded', `Fetched ${ds.total_rows.toLocaleString()} records from URL.`);
      setUrlInput('');
      setCustomName('');
      onDatasetLoaded(ds);
    } catch (err: any) {
      toast.error('Import Failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Dataset Collection & Ingestion
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest verified public benchmark datasets or upload custom CSV / Excel tables for preprocessing.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveMode('presets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeMode === 'presets'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Public Presets
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeMode === 'upload'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setActiveMode('url')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeMode === 'url'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Import via URL
          </button>
        </div>
      </div>

      {/* Mode 1: Public Presets */}
      {activeMode === 'presets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {presets.map((preset) => (
            <motion.div
              key={preset.key}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col justify-between p-5 rounded-2xl bg-[#111827] border transition-all shadow-xl ${
                activeDatasetId === `ds_${preset.key}` || (preset.key === 'adult' && activeDatasetId === 'ds_adult_census')
                  ? 'border-blue-500/50 shadow-blue-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {preset.badge}
                  </span>
                  <a
                    href={preset.source}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors p-1"
                    title="View official public dataset source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <h3 className="font-bold text-sm text-white mb-1.5">{preset.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {preset.description}
                </p>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/80 border border-white/5 text-[11px] font-mono text-slate-300 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Samples:</span>
                    <span className="text-slate-200 font-semibold">{preset.samples}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Features:</span>
                    <span className="text-slate-200 font-semibold">{preset.features}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Format:</span>
                    <span className="text-slate-200">{preset.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target:</span>
                    <span className="text-emerald-400 truncate max-w-[150px]">{preset.primaryTarget}</span>
                  </div>
                </div>
              </div>

              <button
                disabled={isUploading}
                onClick={() => handleSelectPreset(preset.key)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading into Pipeline...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Load & Activate Dataset</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Mode 2: Direct File Upload */}
      {activeMode === 'upload' && (
        <div className="p-8 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-6 max-w-2xl mx-auto">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Dataset Display Name (Optional)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Q4 Financial Customer Churn"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-white/10 hover:border-blue-500/40 bg-slate-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7" />
            </div>

            <h3 className="font-semibold text-sm text-white mb-1">
              Click to select or drag & drop dataset
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Accepts CSV or Excel (.xlsx) files. All records will be verified and staged into SQLite.
            </p>
            <span className="text-[10px] font-mono text-slate-500">
              Supports UTF-8, Latin-1, comma, tab, and semicolon delimitations
            </span>
          </div>
        </div>
      )}

      {/* Mode 3: Public URL Import */}
      {activeMode === 'url' && (
        <form
          onSubmit={handleUrlImport}
          className="p-8 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-4 max-w-2xl mx-auto"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Public Dataset URL (Raw CSV)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/.../dataset.csv"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Dataset Name (Optional)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Remote Benchmark Data"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Downloading from Remote Endpoint...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Fetch and Ingest Dataset</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
