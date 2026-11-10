import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Download,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Code,
  Terminal,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { api, DatasetDetail } from '../services/api';

interface DocumentationPageProps {
  datasetDetail: DatasetDetail | null;
}

export const DocumentationPage: React.FC<DocumentationPageProps> = ({ datasetDetail }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const downloadMarkdown = () => {
    if (!datasetDetail) return;
    window.open(api.getExportUrl(datasetDetail.id, 'documentation'), '_blank');
  };

  const sections = [
    { id: 'overview', title: '1. Project Overview' },
    { id: 'problem', title: '2. Problem Statement' },
    { id: 'dataset-desc', title: '3. Dataset Description' },
    { id: 'provenance', title: '4. Source & License' },
    { id: 'collection', title: '5. Collection Methodology' },
    { id: 'inspection', title: '6. Initial Inspection' },
    { id: 'cleaning', title: '7. Cleaning Methodology' },
    { id: 'missing', title: '8. Missing Value Treatment' },
    { id: 'duplicates', title: '9. Duplicate Handling' },
    { id: 'type-cast', title: '10. Type Correction' },
    { id: 'outliers', title: '11. Outlier Detection (IQR/Z)' },
    { id: 'features', title: '12. Feature Engineering' },
    { id: 'final-dataset', title: '13. Final Dataset Description' },
    { id: 'tech-stack', title: '14. Tools & Technologies' },
    { id: 'limitations', title: '15. Limitations & Bias' },
    { id: 'conclusion', title: '16. Conclusion & Reproducibility' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Project & Technical Data Documentation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete formal specification conforming to all 16 data collection & preprocessing requirements.
          </p>
        </div>

        <button
          onClick={downloadMarkdown}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download Documentation (.md)</span>
        </button>
      </div>

      {/* Main Container: Table of contents sidebar on left, content on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of contents */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-[#111827] border border-white/10 shadow-xl h-fit space-y-1">
          <div className="text-xs font-mono uppercase text-slate-400 px-3 py-2 font-bold border-b border-white/10 mb-2">
            Table of Contents
          </div>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeSection === sec.id
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {sec.title}
            </button>
          ))}
        </div>

        {/* Documentation Content Body */}
        <div className="lg:col-span-8 p-8 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed max-h-[750px] overflow-y-auto">
          {/* 1. Project Overview */}
          <section id="overview" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Project Overview
            </h2>
            <p>
              <strong>DataForge AI</strong> is a full-stack, enterprise-grade Data Collection, Cleaning, and Preprocessing platform architected for modern data science workflows. Machine learning models fundamentally depend on the fidelity, completeness, and consistency of their underlying features. DataForge AI eliminates the error-prone "dirty data" cycle by offering automated quality auditing, interactive imputation, multi-algorithm outlier handling, categorical encoding, and reproducible script synthesis.
            </p>
          </section>

          {/* 2. Problem Statement */}
          <section id="problem" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Problem Statement
            </h2>
            <p>
              In real-world data science, over 70% of engineering time is dedicated to data cleaning and preparation. Tabular repositories are inundated with missing values (often concealed under sentinel characters like <code className="text-slate-200">?</code> or blank strings), redundant duplicate entries, skewed continuous distributions, high cardinality categorical labels, and scale disparities that destabilize numerical convergence in gradient-based algorithms.
            </p>
          </section>

          {/* 3. Dataset Description */}
          <section id="dataset-desc" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. Dataset Description
            </h2>
            <p>
              The primary benchmark configured in DataForge AI is the renowned <strong>UCI Adult Census Income Dataset</strong> (also known as the "Census Income" dataset). It comprises <strong>32,561 records</strong> across <strong>15 attributes</strong> representing adult individuals extracted from the 1994 United States Census Bureau database by Ronny Kohavi and Barry Becker.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs text-slate-300">
              Columns: age, workclass, fnlwgt, education, education_num, marital_status, occupation, relationship, race, sex, capital_gain, capital_loss, hours_per_week, native_country, income.
            </div>
          </section>

          {/* 4. Source and License */}
          <section id="provenance" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              4. Dataset Source & License
            </h2>
            <p>
              <strong>Official URL:</strong>{' '}
              <a
                href="https://archive.ics.uci.edu/dataset/2/adult"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline"
              >
                https://archive.ics.uci.edu/dataset/2/adult
              </a>
              <br />
              <strong>Licensing:</strong> Public Domain (Creative Commons Attribution 4.0 International — CC BY 4.0). Suitable for academic research, validation, and commercial development.
            </p>
          </section>

          {/* 5. Data Collection Methodology */}
          <section id="collection" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              5. Data Collection Methodology
            </h2>
            <p>
              Data is ingested through three robust channels:
              <br />
              1. <em>Direct Stream Ingestion:</em> Automated HTTP/REST fetching with SSL verification from the official UCI static archives.
              <br />
              2. <em>Multipart File Upload:</em> Ingesting local CSV or Excel (.xlsx) files with encoding auto-detection (UTF-8, Latin-1) and delimiter parsing.
              <br />
              3. <em>Public Endpoint Import:</em> On-demand fetching from public raw URLs (e.g. GitHub raw mirrors, OpenML, Kaggle).
            </p>
          </section>

          {/* 6. Initial Inspection */}
          <section id="inspection" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              6. Initial Dataset Inspection
            </h2>
            <p>
              Upon staging, the backend executes an automatic profiling pass:
              <br />- 32,561 rows and 15 columns verified.
              <br />- 6 continuous numerical features (age, fnlwgt, education_num, capital_gain, capital_loss, hours_per_week).
              <br />- 9 categorical features (workclass, education, marital_status, occupation, relationship, race, sex, native_country, income).
              <br />- 24 exact duplicate records identified.
              <br />- 4,262 missing value instances identified across <code className="text-slate-200">workclass</code>, <code className="text-slate-200">occupation</code>, and <code className="text-slate-200">native_country</code> encoded as sentinel <code className="text-slate-200">'?'</code> tokens.
            </p>
          </section>

          {/* 7. Cleaning Methodology */}
          <section id="cleaning" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              7. Data Cleaning Methodology
            </h2>
            <p>
              Every cleaning operation follows strict audit-logging standards. Sentinel strings are converted into standardized IEEE floating-point NaNs (<code className="text-slate-200">np.nan</code>). Transformations are executed in memory and written back to atomic processed CSV storage, updating SQLite metadata and registering before/after dimensional diffs.
            </p>
          </section>

          {/* 8. Missing Value Treatment */}
          <section id="missing" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              8. Missing Value Treatment
            </h2>
            <p>
              Multiple imputation heuristics are provided:
              <br />- <strong>Mode Imputation:</strong> Replaces missing categorical values with the highest-frequency label in the feature.
              <br />- <strong>Median Imputation:</strong> Recommended for skewed numerical features like capital gains and losses.
              <br />- <strong>Mean Imputation:</strong> For approximately Gaussian continuous features.
              <br />- <strong>Constant Placeholder:</strong> Assigns explicit category labels such as <code className="text-slate-200">"Unknown"</code>.
              <br />- <strong>Complete Case Removal (Drop):</strong> Prunes observations exhibiting missing attributes when the loss of statistical power is acceptable.
            </p>
          </section>

          {/* 9. Duplicate Handling */}
          <section id="duplicates" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              9. Duplicate Handling
            </h2>
            <p>
              Exact duplicate rows (24 instances in Adult Census) are pruned using <code className="text-slate-200">drop_duplicates(keep='first')</code>. Retaining the first chronological occurrence guarantees uniqueness without biasing likelihood functions.
            </p>
          </section>

          {/* 10. Data Type Correction */}
          <section id="type-cast" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              10. Data Type Correction
            </h2>
            <p>
              Features stored as generic Python objects are cast to strict memory-optimized types:
              <br />- Numerical fields to <code className="text-slate-200">int64</code> or <code className="text-slate-200">float64</code>.
              <br />- Finite categories to <code className="text-slate-200">category</code> for memory savings.
              <br />- Error handling is enforced with safe coercion (<code className="text-slate-200">errors='coerce'</code>) preventing runtime aborts.
            </p>
          </section>

          {/* 11. Outlier Detection */}
          <section id="outliers" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              11. Outlier Detection (IQR & Z-Score)
            </h2>
            <p>
              - <strong>IQR Method:</strong> Identifies values outside the bounds <code className="text-slate-200">[Q1 - 1.5×IQR, Q3 + 1.5×IQR]</code>.
              <br />- <strong>Z-Score Method:</strong> Flags records where <code className="text-slate-200">|z| &gt; 3.0</code> standard deviations from the feature mean.
              <br />- <strong>Remediation:</strong> Users can choose between Winsorization (capping to boundary limits), complete case pruning, or retention for anomaly detection research.
            </p>
          </section>

          {/* 12. Feature Engineering */}
          <section id="features" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              12. Feature Engineering
            </h2>
            <p>
              Domain-specific transformations constructed for the Adult Census dataset:
              <br />1. <code className="text-blue-300">age_group</code>: Bins continuous age into Youth, Early-Career, Mid-Late Career, and Retirement.
              <br />2. <code className="text-purple-300">work_schedule_type</code>: Classifies weekly commitment into Part-Time, Standard, Extended, and Overtime.
              <br />3. <code className="text-emerald-300">has_capital_gain</code>: Binary indicator flag isolating investment earners.
              <br />4. <code className="text-amber-300">has_capital_loss</code>: Binary indicator flag isolating tax-deductible portfolio losses.
            </p>
          </section>

          {/* 13. Final Dataset Description */}
          <section id="final-dataset" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              13. Final Dataset Description
            </h2>
            <p>
              The sanitized dataset achieves a <strong>100% completeness score</strong> (zero missing cells) and a <strong>100% uniqueness score</strong>. All categorical features are appropriately encoded (one-hot or label encoded) and continuous numerical features are scaled (StandardScaler or MinMaxScaler), ready for training Logistic Regression, Random Forest, XGBoost, or Neural Networks.
            </p>
          </section>

          {/* 14. Tools and Technologies */}
          <section id="tech-stack" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              14. Tools and Technologies
            </h2>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span className="text-slate-500 block">Backend</span>
                <span className="text-white">Python 3.13, FastAPI, Uvicorn</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span className="text-slate-500 block">Data Processing</span>
                <span className="text-white">Pandas 2.2, NumPy, Scikit-learn</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span className="text-slate-500 block">Database</span>
                <span className="text-white">SQLite (WAL Mode, ACID)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <span className="text-slate-500 block">Frontend</span>
                <span className="text-white">React 18, Vite, TypeScript, Tailwind</span>
              </div>
            </div>
          </section>

          {/* 15. Limitations */}
          <section id="limitations" className="space-y-2 border-b border-white/10 pb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              15. Limitations & Societal Bias
            </h2>
            <p>
              The 1994 Census reflects historical workforce demographics, exhibiting gender and racial wage disparities from that era. Models trained on this raw data must be audited for algorithmic fairness to prevent perpetuating systemic historical inequities.
            </p>
          </section>

          {/* 16. Conclusion */}
          <section id="conclusion" className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              16. Conclusion & Reproducibility Guarantee
            </h2>
            <p>
              DataForge AI provides complete end-to-end transparency. Every sequence of user interactions is automatically compiled into an executable <code className="text-blue-300">preprocess.py</code> script and a runnable Jupyter Notebook (<code className="text-purple-300">.ipynb</code>). This ensures strict reproducibility for academic and production machine learning workflows.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
