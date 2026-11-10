import os
import io
import json
import pandas as pd
from typing import Dict, Any, List
from backend.services.dataset_service import get_cached_df, get_db
from backend.services.quality_service import analyze_data_quality

def export_as_csv_bytes(dataset_id: str) -> bytes:
    df = get_cached_df(dataset_id)
    return df.to_csv(index=False).encode('utf-8')

def export_as_excel_bytes(dataset_id: str) -> bytes:
    df = get_cached_df(dataset_id)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # Write first 50,000 rows to keep excel download fast
        df.iloc[:50000].to_excel(writer, sheet_name='CleanedData', index=False)
    return output.getvalue()

def generate_reproducible_python_script(dataset_id: str) -> str:
    conn = get_db()
    ds = conn.execute("SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
    steps = conn.execute(
        "SELECT * FROM pipeline_steps WHERE dataset_id = ? ORDER BY step_number ASC",
        (dataset_id,)
    ).fetchall()
    conn.close()

    dataset_name = ds['name'] if ds else dataset_id
    raw_filename = ds['filename'] if ds else "data.csv"

    script_lines = [
        '#!/usr/bin/env python3',
        '"""',
        f'DataForge AI — Automated Reproducible Preprocessing Pipeline',
        f'Dataset: {dataset_name}',
        f'Source: {ds["source"] if ds else "Uploaded file"}',
        'Generated automatically by DataForge AI SaaS Engine',
        '"""',
        '',
        'import pandas as pd',
        'import numpy as np',
        'from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder',
        '',
        'def run_pipeline():',
        f'    print("Starting DataForge AI Preprocessing Pipeline for: {dataset_name}")',
        f'    # Step 1: Ingestion',
        f'    df = pd.read_csv("{raw_filename}")',
        '    print(f"Loaded raw dataset with shape: {df.shape}")',
        ''
    ]

    for step in steps:
        op = step['operation_type']
        params = json.loads(step['parameters']) if step['parameters'] else {}
        s_name = step['step_name']

        script_lines.append(f'    # --- Step: {s_name} ---')

        if op == 'impute':
            strategy = params.get('strategy', 'mean')
            cols = params.get('columns', [])
            col_list_str = str(cols) if cols else 'list(df.columns)'
            script_lines.append(f'    # Handling missing values with {strategy}')
            script_lines.append('    for col in df.select_dtypes(include=["object", "string"]).columns:')
            script_lines.append('        df[col] = df[col].replace(["?", "None", "null", ""], np.nan)')
            if strategy == 'drop':
                script_lines.append(f'    df = df.dropna(subset={col_list_str})')
            elif strategy == 'mean':
                script_lines.append(f'    for c in {col_list_str}:')
                script_lines.append('        if c in df.columns and pd.api.types.is_numeric_dtype(df[c]):')
                script_lines.append('            df[c] = df[c].fillna(df[c].mean())')
            elif strategy == 'median':
                script_lines.append(f'    for c in {col_list_str}:')
                script_lines.append('        if c in df.columns and pd.api.types.is_numeric_dtype(df[c]):')
                script_lines.append('            df[c] = df[c].fillna(df[c].median())')
            elif strategy == 'mode':
                script_lines.append(f'    for c in {col_list_str}:')
                script_lines.append('        if c in df.columns:')
                script_lines.append('            mode_val = df[c].mode()[0] if len(df[c].mode()) > 0 else "Unknown"')
                script_lines.append('            df[c] = df[c].fillna(mode_val)')

        elif op == 'remove_duplicates':
            subset = params.get('subset')
            keep = params.get('keep', 'first')
            script_lines.append(f'    df = df.drop_duplicates(subset={subset}, keep="{keep}")')
            script_lines.append('    print(f"Duplicates removed. New shape: {df.shape}")')

        elif op == 'type_cast':
            conversions = params.get('conversions', {})
            script_lines.append('    # Type casting')
            for col, t in conversions.items():
                if t in ['int', 'int64']:
                    script_lines.append(f'    if "{col}" in df.columns: df["{col}"] = pd.to_numeric(df["{col}"], errors="coerce").fillna(0).astype("int64")')
                elif t in ['float', 'float64']:
                    script_lines.append(f'    if "{col}" in df.columns: df["{col}"] = pd.to_numeric(df["{col}"], errors="coerce").astype("float64")')
                elif t in ['category']:
                    script_lines.append(f'    if "{col}" in df.columns: df["{col}"] = df["{col}"].astype("category")')

        elif op == 'outliers':
            method = params.get('method', 'iqr')
            action = params.get('action', 'cap')
            thresh = params.get('threshold', 1.5)
            cols = params.get('columns', [])
            script_lines.append(f'    # Outlier treatment ({method}, action={action})')
            script_lines.append(f'    num_cols = {cols} if {cols} else df.select_dtypes(include=[np.number]).columns.tolist()')
            script_lines.append('    for col in num_cols:')
            script_lines.append('        if col in df.columns:')
            if method == 'iqr':
                script_lines.append('            q1 = df[col].quantile(0.25)')
                script_lines.append('            q3 = df[col].quantile(0.75)')
                script_lines.append('            iqr = q3 - q1')
                script_lines.append(f'            lower = q1 - {thresh} * iqr')
                script_lines.append(f'            upper = q3 + {thresh} * iqr')
            else:
                script_lines.append('            mean = df[col].mean()')
                script_lines.append('            std = df[col].std()')
                script_lines.append(f'            lower = mean - {thresh} * std')
                script_lines.append(f'            upper = mean + {thresh} * std')
            if action == 'cap':
                script_lines.append('            df[col] = df[col].clip(lower=lower, upper=upper)')
            elif action == 'remove':
                script_lines.append('            df = df[(df[col] >= lower) & (df[col] <= upper)]')

        elif op == 'scale':
            method = params.get('method', 'standard')
            cols = params.get('columns', [])
            script_lines.append(f'    # Feature scaling with {method} scaler')
            if method == 'minmax':
                script_lines.append('    scaler = MinMaxScaler()')
            elif method == 'robust':
                script_lines.append('    scaler = RobustScaler()')
            else:
                script_lines.append('    scaler = StandardScaler()')
            script_lines.append(f'    scale_cols = {cols} if {cols} else df.select_dtypes(include=[np.number]).columns.tolist()')
            script_lines.append('    df[scale_cols] = np.round(scaler.fit_transform(df[scale_cols].fillna(df[scale_cols].median())), 4)')

        elif op == 'encode':
            method = params.get('method', 'onehot')
            cols = params.get('columns', [])
            if method == 'onehot':
                script_lines.append(f'    df = pd.get_dummies(df, columns={cols}, drop_first={params.get("drop_first", False)}, dtype=int)')
            else:
                script_lines.append(f'    for col in {cols}:')
                script_lines.append('        if col in df.columns:')
                script_lines.append('            le = LabelEncoder()')
                script_lines.append('            df[col] = le.fit_transform(df[col].astype(str).fillna("Missing"))')

        elif op == 'feature_engineering':
            if params.get('preset') == 'adult_census':
                script_lines.append('    # Adult Census Domain Features')
                script_lines.append('    if "age" in df.columns:')
                script_lines.append('        df["age_group"] = pd.cut(pd.to_numeric(df["age"], errors="coerce"), bins=[0, 25, 45, 65, 120], labels=["Youth", "Early-Career", "Mid-Career", "Retirement"]).astype(str)')
                script_lines.append('    if "hours_per_week" in df.columns:')
                script_lines.append('        df["work_schedule_type"] = pd.cut(pd.to_numeric(df["hours_per_week"], errors="coerce"), bins=[0, 35, 40, 50, 168], labels=["Part-Time", "Standard", "Extended", "Overtime"]).astype(str)')
                script_lines.append('    if "capital_gain" in df.columns:')
                script_lines.append('        df["has_capital_gain"] = (pd.to_numeric(df["capital_gain"], errors="coerce").fillna(0) > 0).astype(int)')
                script_lines.append('    if "capital_loss" in df.columns:')
                script_lines.append('        df["has_capital_loss"] = (pd.to_numeric(df["capital_loss"], errors="coerce").fillna(0) > 0).astype(int)')

        script_lines.append('')

    script_lines.extend([
        '    # Final Output Export',
        '    output_path = "cleaned_dataforge_dataset.csv"',
        '    df.to_csv(output_path, index=False)',
        '    print(f"Pipeline successfully completed! Final dataset written to {output_path} with shape {df.shape}")',
        '    return df',
        '',
        'if __name__ == "__main__":',
        '    run_pipeline()'
    ])

    return "\n".join(script_lines)

def generate_jupyter_notebook(dataset_id: str) -> Dict[str, Any]:
    py_script = generate_reproducible_python_script(dataset_id)
    
    cells = [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# DataForge AI — Automated Data Preparation Notebook\n",
                "This notebook reproduces the exact machine learning data cleaning and feature engineering sequence applied in DataForge AI.\n"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "import pandas as pd\n",
                "import numpy as np\n",
                "import matplotlib.pyplot as plt\n",
                "import seaborn as sns\n",
                "from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder\n",
                "print('Libraries imported successfully.')"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": py_script.split("\n")
        }
    ]

    notebook = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.10"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }

    return notebook

def generate_documentation_markdown(dataset_id: str) -> str:
    quality = analyze_data_quality(dataset_id)
    df = get_cached_df(dataset_id)
    
    conn = get_db()
    ds = conn.execute("SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
    steps = conn.execute("SELECT * FROM pipeline_steps WHERE dataset_id = ? ORDER BY step_number ASC", (dataset_id,)).fetchall()
    conn.close()

    doc = f"""# DataForge AI — Comprehensive Data Preprocessing Documentation Report
**Dataset:** {ds['name'] if ds else dataset_id}  
**Source:** {ds['source'] if ds else 'Public / Upload'}  
**Generated On:** {quality['generated_at']}  
**Overall Data Quality Score:** {quality['overall_score']}/100 (Grade: {quality['letter_grade']})  

---

## 1. Project Overview & Problem Statement
High quality machine learning and analytical inference strictly depend on trustworthy, clean, and normalized data. Real-world datasets routinely suffer from missing values, hidden sentinel tokens (such as `?` or whitespace), duplicate rows, skewed continuous features, and high cardinality. DataForge AI systematically ingests, audits, and transforms raw tabular data into robust, production-grade intelligence.

## 2. Dataset Description & Provenance
- **Dataset Title:** {ds['name'] if ds else 'Census Dataset'}
- **Original Dimensions:** {ds['original_rows'] if ds else len(df)} rows × {ds['original_cols'] if ds else len(df.columns)} columns
- **Current Dimensions:** {len(df)} rows × {len(df.columns)} columns
- **File Format:** {ds['format'] if ds else 'CSV'}
- **Original Source:** {ds['source'] if ds else 'UCI ML Repository'}

## 3. Data Dictionary
| Column Name | Inferred Type | Missing Count | Missing % | Unique Count |
| :--- | :--- | :--- | :--- | :--- |
"""
    for col in df.columns:
        miss = int(df[col].isna().sum())
        miss_p = round((miss / float(len(df))) * 100, 2)
        n_u = df[col].nunique()
        doc += f"| `{col}` | {df[col].dtype} | {miss:,} | {miss_p}% | {n_u:,} |\n"

    doc += f"""
## 4. Pipeline Execution History
Total completed operations in sequence:

"""
    for s in steps:
        doc += f"- **Step {s['step_number']} — {s['step_name']}** ({s['operation_type']})\n"
        doc += f"  - Rows: {s['rows_before']} → {s['rows_after']} | Columns: {s['cols_before']} → {s['cols_after']} | Duration: {s['execution_time_ms']}ms\n"

    doc += f"""
## 5. Quality Audit Summary
- **Completeness Index:** {quality['completeness_score']}%
- **Uniqueness Index:** {quality['uniqueness_score']}%
- **Validity Score:** {quality['validity_score']}%
- **Consistency Score:** {quality['consistency_score']}%
- **Duplicate Rows Detected:** {quality['duplicate_count']:,}
- **Missing Value Cells Detected:** {quality['missing_cells_count']:,}

## 6. Identified Issues & Remediations
"""
    for issue in quality['issues']:
        doc += f"- **[{issue['severity'].upper()}] {issue['type'].replace('_', ' ').title()}** (Column: `{issue['column'] or 'All'}`)\n"
        doc += f"  - *Finding:* {issue['description']}\n"
        doc += f"  - *Remediation Action:* {issue['suggested_action']}\n\n"

    doc += """
## 7. Technologies & Tools
- **Engine Core:** Python 3, Pandas, NumPy, Scikit-learn
- **API Framework:** FastAPI, Uvicorn, SQLite
- **Frontend Architecture:** React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Reproducibility Guarantee:** Executable Python script and Jupyter Notebook exportable on-demand.
"""
    return doc
