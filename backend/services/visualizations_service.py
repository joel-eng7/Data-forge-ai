import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from backend.services.dataset_service import get_cached_df, get_db

def get_visualization_data(dataset_id: str, column: Optional[str] = None) -> Dict[str, Any]:
    df = get_cached_df(dataset_id)
    total_rows = len(df)
    
    # 1. Missing Values Chart Data
    missing_mask = df.isna().copy()
    for c in df.select_dtypes(include=['object', 'string']):
        missing_mask[c] = missing_mask[c] | (df[c].astype(str).str.strip().isin(['?', '', 'None', 'null']))
        
    missing_chart = []
    for c in df.columns:
        cnt = int(missing_mask[c].sum())
        missing_chart.append({
            "column": c,
            "missing_count": cnt,
            "missing_pct": round((cnt / float(total_rows)) * 100, 2) if total_rows > 0 else 0.0,
            "valid_count": total_rows - cnt
        })
    missing_chart.sort(key=lambda x: x['missing_count'], reverse=True)
    
    # 2. Numerical Distributions
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    primary_num_col = column if (column and column in num_cols) else (num_cols[0] if num_cols else None)
    
    histogram_data = []
    num_col_stats = {}
    if primary_num_col:
        series = df[primary_num_col].dropna()
        if len(series) > 0:
            counts, bin_edges = np.histogram(series, bins=12)
            for i in range(len(counts)):
                bin_label = f"{round(bin_edges[i], 1)}-{round(bin_edges[i+1], 1)}"
                histogram_data.append({
                    "bin": bin_label,
                    "count": int(counts[i]),
                    "range_start": round(bin_edges[i], 2),
                    "range_end": round(bin_edges[i+1], 2)
                })
            num_col_stats = {
                "column": primary_num_col,
                "mean": round(float(series.mean()), 2),
                "median": round(float(series.median()), 2),
                "std": round(float(series.std()), 2),
                "min": round(float(series.min()), 2),
                "max": round(float(series.max()), 2),
                "q1": round(float(series.quantile(0.25)), 2),
                "q3": round(float(series.quantile(0.75)), 2)
            }

    # 3. Categorical Frequencies
    cat_cols = df.select_dtypes(include=['object', 'category', 'string']).columns.tolist()
    primary_cat_col = column if (column and column in cat_cols) else (cat_cols[0] if cat_cols else None)
    
    categorical_data = []
    if primary_cat_col:
        vc = df[primary_cat_col].astype(str).value_counts().head(10)
        for cat_name, cnt in vc.items():
            categorical_data.append({
                "category": str(cat_name),
                "count": int(cnt),
                "percentage": round((int(cnt) / float(total_rows)) * 100, 2) if total_rows > 0 else 0.0
            })

    # 4. Correlation Matrix
    correlation_data = {"columns": [], "matrix": []}
    if len(num_cols) >= 2:
        # Limit to top 8 numerical columns to keep chart clean and fast
        corr_cols = num_cols[:8]
        corr_matrix = df[corr_cols].corr().fillna(0).round(3)
        correlation_data["columns"] = corr_cols
        
        # Flattened grid for heatmaps
        matrix_cells = []
        for r_idx, r_name in enumerate(corr_cols):
            for c_idx, c_name in enumerate(corr_cols):
                matrix_cells.append({
                    "x": c_name,
                    "y": r_name,
                    "value": float(corr_matrix.loc[r_name, c_name])
                })
        correlation_data["matrix"] = matrix_cells

    # 5. Box Plot Summaries for all numerical columns
    box_plots = []
    for c in num_cols[:6]: # up to 6 numerical columns
        ser = df[c].dropna()
        if len(ser) > 0:
            q1 = float(ser.quantile(0.25))
            q3 = float(ser.quantile(0.75))
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            box_plots.append({
                "column": c,
                "min": round(float(ser.min()), 2),
                "lower_whisker": round(max(float(ser.min()), lower), 2),
                "q1": round(q1, 2),
                "median": round(float(ser.median()), 2),
                "q3": round(q3, 2),
                "upper_whisker": round(min(float(ser.max()), upper), 2),
                "max": round(float(ser.max()), 2),
                "outlier_count": int(((ser < lower) | (ser > upper)).sum())
            })

    # 6. Before-and-after tracking
    conn = get_db()
    first_step = conn.execute(
        "SELECT * FROM pipeline_steps WHERE dataset_id = ? ORDER BY step_number ASC LIMIT 1",
        (dataset_id,)
    ).fetchone()
    ds_row = conn.execute("SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
    conn.close()
    
    before_after = {
        "original_rows": ds_row['original_rows'] if ds_row else total_rows,
        "current_rows": total_rows,
        "original_cols": ds_row['original_cols'] if ds_row else len(df.columns),
        "current_cols": len(df.columns),
        "initial_missing": int(missing_mask.sum().sum()),
        "current_missing": int(df.isna().sum().sum())
    }

    return {
        "dataset_id": dataset_id,
        "numerical_columns": num_cols,
        "categorical_columns": cat_cols,
        "selected_column": column or primary_num_col or primary_cat_col,
        "missing_chart": missing_chart,
        "histogram": {
            "column": primary_num_col,
            "data": histogram_data,
            "stats": num_col_stats
        },
        "categorical_frequency": {
            "column": primary_cat_col,
            "data": categorical_data
        },
        "correlation": correlation_data,
        "box_plots": box_plots,
        "before_after": before_after
    }
