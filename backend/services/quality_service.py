import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime
from backend.services.dataset_service import get_cached_df, get_db

def analyze_data_quality(dataset_id: str) -> Dict[str, Any]:
    conn = get_db()
    ds_row = conn.execute("SELECT name FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
    conn.close()
    ds_name = ds_row['name'] if ds_row else dataset_id
    
    df = get_cached_df(dataset_id)
    total_rows = len(df)
    total_cols = len(df.columns)
    total_cells = total_rows * total_cols
    
    issues: List[Dict[str, Any]] = []
    
    # 1. Missing Values Analysis
    missing_mask = df.isna().copy()
    for col in df.select_dtypes(include=['object', 'string']):
        # Common string missing markers in benchmark datasets
        missing_mask[col] = missing_mask[col] | (df[col].astype(str).str.strip().isin(['?', '', 'None', 'null', 'nan', 'NA', 'N/A']))
        
    total_missing_cells = int(missing_mask.sum().sum())
    missing_percentage = round((total_missing_cells / float(total_cells)) * 100, 2) if total_cells > 0 else 0.0
    
    columns_with_missing = []
    for col in df.columns:
        col_miss = int(missing_mask[col].sum())
        if col_miss > 0:
            col_pct = round((col_miss / float(total_rows)) * 100, 2) if total_rows > 0 else 0.0
            columns_with_missing.append({
                "column": col,
                "missing_count": col_miss,
                "missing_percentage": col_pct,
                "dtype": str(df[col].dtype)
            })
            severity = "high" if col_pct > 20 else ("medium" if col_pct > 5 else "low")
            issues.append({
                "type": "missing_values",
                "severity": severity,
                "column": col,
                "count": col_miss,
                "percentage": col_pct,
                "description": f"Column '{col}' has {col_miss:,} missing or null values ({col_pct}%).",
                "suggested_action": f"Apply imputation (mean/median for numeric, mode for categorical) or drop rows."
            })

    # 2. Duplicate Rows Analysis
    duplicate_count = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_count / float(total_rows)) * 100, 2) if total_rows > 0 else 0.0
    if duplicate_count > 0:
        severity = "high" if duplicate_pct > 5 else "medium"
        issues.append({
            "type": "duplicates",
            "severity": severity,
            "column": None,
            "count": duplicate_count,
            "percentage": duplicate_pct,
            "description": f"Found {duplicate_count:,} duplicate rows ({duplicate_pct}% of dataset). Duplicate records skew statistical distributions and machine learning weights.",
            "suggested_action": "Execute duplicate row removal retaining the first instance."
        })

    # 3. Outlier Analysis (IQR & Z-score)
    columns_with_outliers = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) < 10:
            continue
            
        q1 = float(series.quantile(0.25))
        q3 = float(series.quantile(0.75))
        iqr = q3 - q1
        
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outliers_iqr = series[(series < lower_bound) | (series > upper_bound)]
        outlier_count_iqr = len(outliers_iqr)
        
        # Z-score check
        mean = float(series.mean())
        std = float(series.std())
        outlier_count_z = 0
        if std > 0:
            z_scores = ((series - mean) / std).abs()
            outlier_count_z = int((z_scores > 3.0).sum())
            
        if outlier_count_iqr > 0:
            outlier_pct = round((outlier_count_iqr / float(total_rows)) * 100, 2)
            columns_with_outliers.append({
                "column": col,
                "outlier_count_iqr": outlier_count_iqr,
                "outlier_percentage_iqr": outlier_pct,
                "outlier_count_zscore": outlier_count_z,
                "lower_bound": round(lower_bound, 2),
                "upper_bound": round(upper_bound, 2),
                "q1": round(q1, 2),
                "q3": round(q3, 2),
                "median": round(float(series.median()), 2),
                "min": round(float(series.min()), 2),
                "max": round(float(series.max()), 2)
            })
            if outlier_pct > 1.0:
                issues.append({
                    "type": "outliers",
                    "severity": "medium" if outlier_pct > 5 else "low",
                    "column": col,
                    "count": outlier_count_iqr,
                    "percentage": outlier_pct,
                    "description": f"Column '{col}' exhibits {outlier_count_iqr:,} statistical outliers ({outlier_pct}%) outside IQR bounds [{round(lower_bound, 1)}, {round(upper_bound, 1)}].",
                    "suggested_action": "Review outlier distribution in box plot; consider winsorization (capping) or IQR trimming."
                })

    # 4. Constant / Single Value Columns
    for col in df.columns:
        n_unique = df[col].nunique(dropna=False)
        if n_unique <= 1:
            issues.append({
                "type": "constant_column",
                "severity": "high",
                "column": col,
                "count": total_rows,
                "percentage": 100.0,
                "description": f"Column '{col}' contains only {n_unique} unique value. It provides zero statistical variance.",
                "suggested_action": "Drop column to reduce dimensionality."
            })

    # 5. Potential Type Mismatch (e.g., Object column containing mostly numeric strings)
    for col in df.select_dtypes(include=['object', 'string']).columns:
        series = df[col].dropna()
        if len(series) > 0:
            sample = series.head(100)
            numeric_like = pd.to_numeric(sample.replace('?', np.nan), errors='coerce').notna().sum()
            if numeric_like / float(len(sample)) > 0.85:
                issues.append({
                    "type": "type_mismatch",
                    "severity": "medium",
                    "column": col,
                    "count": len(series),
                    "percentage": round(100.0 * numeric_like / len(sample), 1),
                    "description": f"Column '{col}' is stored as string/object but over 85% of values appear numeric.",
                    "suggested_action": "Cast column type to Integer or Float."
                })

    # 6. High Cardinality Categorical Check
    for col in df.select_dtypes(include=['object', 'string']).columns:
        n_unique = df[col].nunique()
        if n_unique > 500 and n_unique / float(total_rows) > 0.7:
            issues.append({
                "type": "high_cardinality",
                "severity": "low",
                "column": col,
                "count": n_unique,
                "percentage": round(100.0 * n_unique / float(total_rows), 1),
                "description": f"Categorical column '{col}' has very high cardinality ({n_unique:,} distinct categories, like an ID or hash).",
                "suggested_action": "Evaluate whether column is an identifier that should be dropped from model features."
            })

    # Calculate Holistic Score
    completeness_score = max(0.0, round(100.0 - (missing_percentage * 3.5), 1))
    uniqueness_score = max(0.0, round(100.0 - (duplicate_pct * 4.0), 1))
    
    # Validity score based on type mismatches and constant columns
    val_penalty = sum(10.0 for i in issues if i['type'] in ['type_mismatch', 'constant_column'])
    validity_score = max(0.0, round(100.0 - val_penalty, 1))
    
    # Consistency score based on outlier proportion
    avg_outlier_pct = np.mean([c['outlier_percentage_iqr'] for c in columns_with_outliers]) if columns_with_outliers else 0.0
    consistency_score = max(0.0, round(100.0 - (avg_outlier_pct * 2.0), 1))
    
    overall_score = round(
        (completeness_score * 0.35) +
        (uniqueness_score * 0.25) +
        (validity_score * 0.20) +
        (consistency_score * 0.20),
        1
    )
    overall_score = min(100.0, max(10.0, overall_score))
    
    if overall_score >= 95:
        grade = "A+"
    elif overall_score >= 88:
        grade = "A"
    elif overall_score >= 78:
        grade = "B"
    elif overall_score >= 68:
        grade = "C"
    elif overall_score >= 50:
        grade = "D"
    else:
        grade = "F"

    return {
        "dataset_id": dataset_id,
        "dataset_name": ds_name,
        "overall_score": overall_score,
        "letter_grade": grade,
        "completeness_score": completeness_score,
        "uniqueness_score": uniqueness_score,
        "validity_score": validity_score,
        "consistency_score": consistency_score,
        "total_rows": total_rows,
        "total_cols": total_cols,
        "duplicate_count": duplicate_count,
        "missing_cells_count": total_missing_cells,
        "total_cells": total_cells,
        "issues": issues,
        "columns_with_missing": columns_with_missing,
        "columns_with_outliers": columns_with_outliers,
        "generated_at": datetime.utcnow().isoformat()
    }
