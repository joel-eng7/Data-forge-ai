# DataForge AI — AI-Powered Data Collection & Preprocessing Platform

[![Python Version](https://img.shields.io/badge/Python-3.13-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Transform Raw Data Into Reliable Intelligence.**  
> A production-quality, commercial-grade SaaS web platform designed for end-to-end Machine Learning data collection, quality auditing, preprocessing, feature engineering, and reproducible pipeline synthesis.

---

## 📌 1. Project Overview

Data quality is the single most critical determinant of machine learning model accuracy and generalization. Real-world datasets routinely arrive fragmented by missing entries, dirty sentinel placeholders (e.g. `?`), duplicate records, extreme statistical outliers, categorical label disparities, and severe scale variance.

**DataForge AI** bridges this gap with an intuitive, commercial SaaS platform built on the **UCI Adult Census Income Benchmark Dataset** (32,561 records × 15 features). Every button, form, statistical chart, and transformation in DataForge AI interacts directly with a real **Python / FastAPI / Pandas / Scikit-Learn** backend engine and persistent **SQLite** audit database.

---

## 🎯 2. Problem Statement & Assignment Objectives

This platform is engineered to fulfill the comprehensive requirements of the **Data Collection & Preprocessing Assignment**:
- **Dataset Ingestion Requirement:** Demonstrates real-world machine learning data preparation utilizing a public dataset containing at least 1,000 samples (UCI Adult Census contains 32,561 real records).
- **Zero Mock Data:** Does not use static charts, hardcoded metrics, or fake loading states. All KPI statistics, distributions, and correlation grids are computed live.
- **Audit Traceability:** Maintains a sequential, immutable pipeline history tracker recording every operation, row delta, column delta, parameter payload, and execution time in milliseconds.
- **Reproducibility Guarantee:** Generates downloadable, reproducible Python scripts (`preprocess.py`) and runnable Jupyter Notebooks (`.ipynb`) reflecting the exact sequence of transformations performed in the UI.

---

## 📊 3. Dataset Provenance

- **Dataset Name:** UCI Adult Census Income Dataset (also known as "Census Income" or "Adult")
- **Official Source:** [UCI Machine Learning Repository (archive.ics.uci.edu)](https://archive.ics.uci.edu/dataset/2/adult)
- **Direct Raw Source:** `https://archive.ics.uci.edu/ml/machine-learning-databases/adult/adult.data`
- **Total Records:** 32,561 rows
- **Raw Features:** 15 columns (6 continuous numerical, 9 categorical)
- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Target Variable:** `income` (`<=50K`, `>50K`)

---

## 🚀 4. Core Features & Modules

### 1. Landing Page
- Modern SaaS visual theme (deep midnight charcoal, soft typography, subtle electric blue & violet accents).
- Animated real-time data stream pipeline graphic.
- Overview of the 6-step preprocessing workflow, technology stack pills, and live statistics.

### 2. Authentication & Session Persistence
- User registration, login, logout, and token-based persistent sessions in SQLite.
- Client-side and server-side password validation (min 8 chars, uppercase, lowercase, numbers).
- One-click academic demo credentials auto-fill (`alex@dataforge.ai` / `DataForge2025!`).

### 3. Main Dashboard & Navigation
- Collapsible 10-item sidebar navigation with smooth Framer Motion transitions.
- 6 Real-time KPI Cards: Total Datasets, Total Samples, Features Breakdown, Missing Cells, Duplicate Rows, and Holistic Quality Score.
- Multi-dataset switcher and quick-action toolbars.

### 4. Dataset Collection Interface
- **Public Presets:** One-click loading of verified benchmark datasets (UCI Adult Census 32,561 rows, California Housing 20,640 rows, Titanic 891 rows).
- **Direct File Upload:** Multipart drag-and-drop CSV and Excel (`.xlsx`) parser with encoding detection.
- **URL Importer:** Streamed ingestion from arbitrary public HTTP raw data endpoints.

### 5. Interactive Data Explorer
- Paginated, searchable data table supporting 10, 25, 50, and 100 records per page.
- Instant column sorting (ascending/descending) on any feature.
- Global text search across all columns.
- Dynamic column visibility toggles and column inspection drawer.

### 6. Automated Data Quality Audit
- Circular/arc Data Quality Score Gauge (0 to 100) with letter grade designations (A+ to F).
- 4 Sub-dimension indices: Completeness, Uniqueness, Validity, and Consistency.
- Diagnostic anomaly cards with severity ratings and suggested remediations.
- Outlier detection summaries using Interquartile Range (IQR 1.5×) and Z-Scores (|z| > 3.0).

### 7. Preprocessing Engine
- **Missing Value Imputation:** Statistical Mean, Median, Mode, Constant (`"Unknown"`), or Complete Case Row Dropping.
- **Duplicate Removal:** Identifies redundant records and prunes duplicates retaining the first or last instance.
- **Data Type Coercion:** Safe conversion to `int64`, `float64`, `category`, `string`, or `datetime64`.
- **Outlier Engine:** Interquartile Range (IQR) and Z-Score methods with options to Cap (Winsorize), Remove, or Retain.
- **Feature Scaling:** StandardScaler (zero mean, unit variance), MinMaxScaler [0, 1], and RobustScaler (median & IQR).
- **Categorical Encoding:** One-Hot Encoding (with dummy variable trap prevention) and integer Label Encoding.
- **One-Click Pipeline Reset:** Safely reverts active datasets back to their pristine raw state.

### 8. Feature Engineering Studio
- **Domain Features (Adult Census):**
  - `age_group`: Categorical binning into Youth (<25), Early-Career (25-44), Mid-Career (45-64), and Retirement (65+).
  - `work_schedule_type`: Part-Time (<35h), Standard (35-40h), Extended (41-50h), and Overtime (>50h).
  - `has_capital_gain`: Binary indicator flag isolating investment earners (`capital_gain > 0`).
  - `has_capital_loss`: Binary indicator flag isolating tax-deductible portfolio losses (`capital_loss > 0`).
- **Custom Feature Creator:** Binary math (+, -, *, /), unary transforms (`log1p`, `sqrt`, `abs`), quantile binning, and conditional indicators.
- **Schema Management:** Rename columns and permanently prune unneeded features.

### 9. Exploratory Data Visualizations
- Missing values bar chart (Recharts).
- Continuous numerical distribution histogram with bin counts, mean, and median markers.
- Categorical frequency bar chart for top class levels.
- Pearson correlation matrix heatmap (-1.0 to +1.0 color-coded grid).
- Statistical box plots displaying Min, Q1, Median, Q3, Max, and Outliers.
- Before & after delta comparison metrics (row delta, feature delta, null reduction).

### 10. Pipeline History & Provenance Tracking
- Visual sequential timeline displaying every executed operation.
- Records exact timestamps, parameter payloads, row transitions, column transitions, and processing latencies.
- Parameter inspector dialog for auditing transformation payloads.

### 11. Multi-Format Export & Code Synthesis
- Clean dataset download as standard CSV.
- Clean dataset download as Microsoft Excel (`.xlsx`).
- Auto-generated reproducible Python script (`preprocess.py`).
- Auto-generated runnable Jupyter Notebook (`.ipynb`).
- Complete technical documentation report download (`DATAFORGE_DOCUMENTATION.md`).

---

## 🛠️ 5. Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React 18, Vite, TypeScript | Type-safe, component-driven reactive user interface |
| **Styling & Theme** | Tailwind CSS, PostCSS | Linear/Supabase-inspired modern charcoal dark mode |
| **Motion UI** | Framer Motion | Smooth page transitions, collapsible sidebars, and micro-interactions |
| **Visualizations** | Recharts, Custom SVG Gauges | Interactive distribution histograms, heatmaps, and box plots |
| **Backend Core** | Python 3.13, FastAPI, Uvicorn | High-throughput asynchronous REST API endpoints |
| **Data Science Engine**| Pandas 2.2, NumPy, Scikit-learn | Imputation, winsorization, feature scaling, encoding, and binning |
| **Persistent Storage**| SQLite 3 (WAL Mode) | Persistent datasets catalog, user sessions, and pipeline step logs |

---

## 🏗️ 6. System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │         DataForge AI SaaS Client        │
                               │  (React 18 + TypeScript + Vite + Recharts)
                               └────────────────────┬────────────────────┘
                                                    │  JSON / Multipart REST
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │           FastAPI REST Engine           │
                               │     (CORS, Auth, Schema Validation)     │
                               └──────┬──────────────────────┬───────────┘
                                      │                      │
                 ┌────────────────────┴────────┐   ┌─────────┴────────────────────┐
                 │    Pandas / Scikit-Learn    │   │      SQLite 3 (WAL Mode)     │
                 │   - Missing Imputer         │   │  - Users & Sessions          │
                 │   - IQR Winsorizer          │   │  - Datasets Metadata         │
                 │   - Standard/MinMax Scalers │   │  - Pipeline Steps Ledger     │
                 │   - Feature Generators      │   └──────────────────────────────┘
                 └──────────────┬──────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │       Storage Volumes       │
                 │  - data/raw/*.csv           │
                 │  - data/processed/*.csv     │
                 └─────────────────────────────┘
```

---

## 📁 7. Repository Directory Structure

```
dataforge-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/         # MetricCard, Header, Sidebar, Toast, Modal, Skeleton
│   │   ├── pages/              # LandingPage, AuthModal, DocumentationPage, SettingsPage
│   │   ├── dashboard/          # Overview, Collection, Explorer, Quality, Preprocess, Features, Viz, History
│   │   ├── charts/             # QualityGauge, MissingChart, HistogramChart, CategoricalChart, Heatmap, BoxPlots
│   │   ├── services/           # api.ts (full typed API client)
│   │   ├── animations/         # motionVariants.ts
│   │   ├── App.tsx             # Root application orchestrator
│   │   ├── main.tsx            # React DOM entrypoint
│   │   └── index.css           # Custom scrollbar, glassmorphic utility classes
│   ├── package.json
│   ├── vite.config.ts          # Configured with proxy to backend port 8000
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/
│   ├── main.py                 # FastAPI application root & lifecycle setup
│   ├── routes/
│   │   ├── auth.py             # Login, register, me
│   │   ├── datasets.py         # Ingestion, upload, URL import, preview, reset
│   │   ├── quality.py          # Quality audit & issue diagnostics
│   │   ├── preprocess.py       # Impute, duplicates, type-cast, outliers, scale, encode
│   │   ├── feature_engineering.py # Adult presets, custom math, binning, rename, drop
│   │   ├── visualizations.py   # Histograms, categorical counts, correlation, boxplots
│   │   ├── pipeline.py         # Pipeline history steps
│   │   └── export.py           # CSV, Excel, preprocess.py, .ipynb, .md downloads
│   ├── services/
│   │   ├── dataset_service.py
│   │   ├── quality_service.py
│   │   ├── preprocessing_service.py
│   │   ├── feature_service.py
│   │   ├── visualizations_service.py
│   │   └── export_service.py
│   ├── models/
│   │   ├── database.py         # SQLite schema initialization & connection pool
│   │   └── schemas.py          # Pydantic request & response models
│   └── requirements.txt
│
├── data/
│   ├── raw/
│   │   ├── adult.csv           # Verified 32,561 records from UCI repository
│   │   ├── titanic.csv         # 891 records
│   │   └── california_housing.csv # 20,640 records
│   └── processed/
│       └── adult_cleaned.csv   # Post-pipeline sanitized dataset
│
├── notebooks/
│   └── data_preprocessing.ipynb # Runnable Jupyter Notebook reproducing pipeline
│
├── scripts/
│   └── preprocess.py           # Standalone CLI preprocessing pipeline
│
├── documentation/
│   └── DATA_DICTIONARY.md      # Feature descriptions, types, and value domains
│
├── package.json                # Unified package scripts
├── README.md                   # This specification file
└── .gitignore
```

---

## ⚡ 8. Installation & Quick Start

### Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js v18+** (Tested on v20 and v26)
- **npm** or **yarn**

### Step 1: Clone or Navigate to Project
```bash
cd /Users/indetijoel/intrenship2
```

### Step 2: Set Up Python Virtual Environment & Backend
```bash
# 1. Activate the virtual environment
source venv/bin/activate

# 2. Verify backend dependencies
pip install -r backend/requirements.txt

# 3. Start the FastAPI backend server (Runs on http://127.0.0.1:8000)
npm run start:backend
# Or directly:
./venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 3: Start the React Frontend Development Server
Open a new terminal window:
```bash
# 1. Navigate to frontend
cd frontend

# 2. Start Vite dev server (Runs on http://localhost:5173)
npm run dev
```

### Step 4: Open in Your Browser
Open **[http://localhost:5173](http://localhost:5173)** to access the **DataForge AI** platform!

---

## 🔬 9. Running Standalone CLI Preprocessing Script

To run the reproducible automated pipeline directly from the command line:
```bash
./venv/bin/python3 scripts/preprocess.py --input data/raw/adult.csv --output data/processed/adult_cleaned.csv
```

**Expected Console Output:**
```
======================================================================
  DATAFORGE AI — REPRODUCIBLE DATA PREPROCESSING PIPELINE
======================================================================

[Step 1/7] Ingesting dataset from: data/raw/adult.csv
 -> Raw shape: 32,561 rows × 15 columns

[Step 2/7] Auditing & Imputing Missing Values...
 -> Identified 4,262 missing value cells across attributes.
    - Imputed categorical 'workclass' with mode: 'Private'
    - Imputed categorical 'occupation' with mode: 'Prof-specialty'
    - Imputed categorical 'native_country' with mode: 'United-States'

[Step 3/7] Detecting & Pruning Duplicate Records...
 -> Pruned 24 duplicate rows. New row count: 32,537

[Step 4/7] Treating Continuous Outliers via IQR Winsorization (1.5×)...
    - Capped 142 outliers in 'age' to range [-2.0, 78.0]
    - Capped 993 outliers in 'fnlwgt' to range [-60922.0, 415742.0]
    - Capped 1,193 outliers in 'education_num' to range [4.5, 16.5]
    - Capped 9,002 outliers in 'hours_per_week' to range [32.5, 52.5]

[Step 5/7] Engineering Domain Features...
    + Added 'age_group' (4 career brackets)
    + Added 'work_schedule_type' (4 schedule tiers)
    + Added 'has_capital_gain' binary indicator
    + Added 'has_capital_loss' binary indicator

[Step 6/7] Applying Robust Feature Normalization...
 -> Standardized continuous features: ['age', 'fnlwgt', 'education_num', 'hours_per_week']

[Step 7/7] Validating Clean Dataset & Exporting...

======================================================================
  PIPELINE EXECUTION SUMMARY
======================================================================
 • Input File:       data/raw/adult.csv
 • Output File:      data/processed/adult_cleaned.csv (4.59 MB)
 • Initial Shape:    32,561 rows × 15 cols
 • Final Shape:      32,537 rows × 19 cols
 • Net Row Delta:    -24 rows pruned
 • Net Feature Delta: +4 features engineered
 • Missing Cells:    0 (100% complete)
======================================================================
```

---

## 🧪 10. Running Automated Tests

Run the full end-to-end test suite:
```bash
npm test
```
This runs the Python backend dependency and model checks followed by the production TypeScript build check (`tsc && vite build`).

---

## 👥 11. Project Contributors

- **Lead Full-Stack Data Engineer & Architect:** DataForge AI Core Team
- **Course Assignment:** Machine Learning Data Collection & Preprocessing
- **Academic Benchmark:** UCI Machine Learning Repository (Census Income Dataset)

---

## 📄 12. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
