import time
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from backend.services.dataset_service import get_cached_df, save_updated_df, get_db
from backend.services.preprocessing_service import _record_pipeline_step

def apply_adult_census_preset_features(dataset_id: str) -> Dict[str, Any]:
    """Generates the four domain-specific features for the UCI Adult Census Income dataset."""
    start_t = time.time()
    df = get_cached_df(dataset_id).copy()
    
    rows_before = len(df)
    cols_before = len(df.columns)
    created_features = []

    # 1. Age Groups
    if 'age' in df.columns:
        age_bins = [0, 25, 45, 65, 120]
        age_labels = ['Youth (<25)', 'Early-Career (25-44)', 'Mid-Late Career (45-64)', 'Retirement (65+)']
        df['age_group'] = pd.cut(pd.to_numeric(df['age'], errors='coerce'), bins=age_bins, labels=age_labels)
        df['age_group'] = df['age_group'].astype(str)
        created_features.append({
            "name": "age_group",
            "type": "Categorical Binning",
            "source": "age",
            "purpose": "Groups continuous age into non-linear sociological career brackets, enhancing tree and linear model performance."
        })

    # 2. Working-hours categories
    if 'hours_per_week' in df.columns:
        hours_bins = [0, 35, 40, 50, 168]
        hours_labels = ['Part-Time (<35h)', 'Standard Full-Time (35-40h)', 'Extended (41-50h)', 'Overtime (>50h)']
        df['work_schedule_type'] = pd.cut(pd.to_numeric(df['hours_per_week'], errors='coerce'), bins=hours_bins, labels=hours_labels)
        df['work_schedule_type'] = df['work_schedule_type'].astype(str)
        created_features.append({
            "name": "work_schedule_type",
            "type": "Categorical Binning",
            "source": "hours_per_week",
            "purpose": "Segments weekly labor commitment into labor-standard tiers, differentiating standard salaried roles from hourly/part-time and excessive overtime."
        })

    # 3. Capital Gain Indicator
    if 'capital_gain' in df.columns:
        num_gain = pd.to_numeric(df['capital_gain'], errors='coerce').fillna(0)
        df['has_capital_gain'] = (num_gain > 0).astype(int)
        created_features.append({
            "name": "has_capital_gain",
            "type": "Binary Indicator",
            "source": "capital_gain",
            "purpose": "Separates population with active investment yields from zero-gain earners, which heavily correlates with high-income brackets (>50K)."
        })

    # 4. Capital Loss Indicator
    if 'capital_loss' in df.columns:
        num_loss = pd.to_numeric(df['capital_loss'], errors='coerce').fillna(0)
        df['has_capital_loss'] = (num_loss > 0).astype(int)
        created_features.append({
            "name": "has_capital_loss",
            "type": "Binary Indicator",
            "source": "capital_loss",
            "purpose": "Captures taxable portfolio loss realization, an explicit signal of active investment activity."
        })

    save_updated_df(dataset_id, df)
    exec_ms = (time.time() - start_t) * 1000
    
    details = {
        "features_created": created_features,
        "count": len(created_features)
    }

    _record_pipeline_step(
        dataset_id=dataset_id,
        step_name="Domain Feature Engineering (Adult Census)",
        operation_type="feature_engineering",
        parameters={"preset": "adult_census", "features": [f['name'] for f in created_features]},
        rows_before=rows_before,
        rows_after=len(df),
        cols_before=cols_before,
        cols_after=len(df.columns),
        execution_time_ms=exec_ms,
        details=details
    )

    return {
        "success": True,
        "message": f"Successfully engineered {len(created_features)} domain features.",
        "rows_before": rows_before,
        "rows_after": len(df),
        "cols_before": cols_before,
        "cols_after": len(df.columns),
        "execution_time_ms": round(exec_ms, 2),
        "features": created_features
    }

def create_custom_column(
    dataset_id: str,
    new_column_name: str,
    operation: str,
    col_a: str,
    col_b: Optional[str] = None,
    operator: Optional[str] = None,
    bins: Optional[int] = None,
    bin_labels: Optional[List[str]] = None,
    condition_val: Optional[Any] = None,
    if_true_val: Optional[Any] = 1,
    if_false_val: Optional[Any] = 0
) -> Dict[str, Any]:
    start_t = time.time()
    df = get_cached_df(dataset_id).copy()
    
    rows_before = len(df)
    cols_before = len(df.columns)
    
    if col_a not in df.columns:
        raise ValueError(f"Source column '{col_a}' not found.")
        
    explanation = ""
    
    if operation == "math_binary":
        if not col_b or col_b not in df.columns:
            raise ValueError(f"Second column '{col_b}' required for binary math operation.")
        ser_a = pd.to_numeric(df[col_a], errors='coerce')
        ser_b = pd.to_numeric(df[col_b], errors='coerce')
        if operator == "+":
            df[new_column_name] = ser_a + ser_b
        elif operator == "-":
            df[new_column_name] = ser_a - ser_b
        elif operator == "*":
            df[new_column_name] = ser_a * ser_b
        elif operator == "/":
            df[new_column_name] = ser_a / ser_b.replace(0, np.nan)
        explanation = f"Binary arithmetic operation: {col_a} {operator} {col_b}"
        
    elif operation == "math_unary":
        ser_a = pd.to_numeric(df[col_a], errors='coerce')
        if operator == "log":
            df[new_column_name] = np.log1p(np.maximum(0, ser_a))
        elif operator == "sqrt":
            df[new_column_name] = np.sqrt(np.maximum(0, ser_a))
        elif operator == "abs":
            df[new_column_name] = np.abs(ser_a)
        explanation = f"Unary mathematical transformation {operator}({col_a})"
        
    elif operation == "binning":
        ser_a = pd.to_numeric(df[col_a], errors='coerce')
        n_bins = bins or 4
        labels = bin_labels if bin_labels and len(bin_labels) == n_bins else False
        df[new_column_name] = pd.qcut(ser_a, q=n_bins, labels=labels, duplicates='drop').astype(str)
        explanation = f"Quantile binning of {col_a} into {n_bins} equal-frequency tiers"
        
    elif operation == "condition":
        ser_a = df[col_a]
        cond = (ser_a == condition_val)
        df[new_column_name] = np.where(cond, if_true_val, if_false_val)
        explanation = f"Conditional indicator: {col_a} == {condition_val}"
        
    elif operation == "date_extract":
        ser_dt = pd.to_datetime(df[col_a], errors='coerce')
        if operator == "year":
            df[new_column_name] = ser_dt.dt.year
        elif operator == "month":
            df[new_column_name] = ser_dt.dt.month
        elif operator == "day":
            df[new_column_name] = ser_dt.dt.day
        elif operator == "dayofweek":
            df[new_column_name] = ser_dt.dt.dayofweek
        explanation = f"Extracted {operator} component from datetime column {col_a}"
        
    save_updated_df(dataset_id, df)
    exec_ms = (time.time() - start_t) * 1000
    
    details = {
        "new_column": new_column_name,
        "operation": operation,
        "source_columns": [col_a] + ([col_b] if col_b else []),
        "explanation": explanation
    }

    _record_pipeline_step(
        dataset_id=dataset_id,
        step_name=f"Feature Created: {new_column_name}",
        operation_type="feature_engineering",
        parameters={"name": new_column_name, "operation": operation, "operator": operator},
        rows_before=rows_before,
        rows_after=len(df),
        cols_before=cols_before,
        cols_after=len(df.columns),
        execution_time_ms=exec_ms,
        details=details
    )

    return {
        "success": True,
        "message": f"Successfully created new column '{new_column_name}'.",
        "rows_before": rows_before,
        "rows_after": len(df),
        "cols_before": cols_before,
        "cols_after": len(df.columns),
        "execution_time_ms": round(exec_ms, 2),
        "column_name": new_column_name,
        "details": details
    }

def rename_columns(dataset_id: str, column_mapping: Dict[str, str]) -> Dict[str, Any]:
    start_t = time.time()
    df = get_cached_df(dataset_id).copy()
    
    valid_mapping = {old: new for old, new in column_mapping.items() if old in df.columns and new.strip()}
    df = df.rename(columns=valid_mapping)
    
    save_updated_df(dataset_id, df)
    exec_ms = (time.time() - start_t) * 1000
    
    details = {"renamed": valid_mapping}
    
    _record_pipeline_step(
        dataset_id=dataset_id,
        step_name=f"Renamed {len(valid_mapping)} Columns",
        operation_type="feature_engineering",
        parameters={"mapping": valid_mapping},
        rows_before=len(df),
        rows_after=len(df),
        cols_before=len(df.columns),
        cols_after=len(df.columns),
        execution_time_ms=exec_ms,
        details=details
    )
    
    return {
        "success": True,
        "message": f"Successfully renamed {len(valid_mapping)} columns.",
        "renamed": valid_mapping,
        "execution_time_ms": round(exec_ms, 2)
    }

def drop_columns(dataset_id: str, columns: List[str]) -> Dict[str, Any]:
    start_t = time.time()
    df = get_cached_df(dataset_id).copy()
    
    cols_before = len(df.columns)
    existing_to_drop = [c for c in columns if c in df.columns]
    
    if not existing_to_drop:
        raise ValueError("None of the specified columns exist in dataset.")
        
    df = df.drop(columns=existing_to_drop)
    
    save_updated_df(dataset_id, df)
    exec_ms = (time.time() - start_t) * 1000
    
    details = {"columns_dropped": existing_to_drop}
    
    _record_pipeline_step(
        dataset_id=dataset_id,
        step_name=f"Dropped {len(existing_to_drop)} Columns",
        operation_type="feature_engineering",
        parameters={"dropped": existing_to_drop},
        rows_before=len(df),
        rows_after=len(df),
        cols_before=cols_before,
        cols_after=len(df.columns),
        execution_time_ms=exec_ms,
        details=details
    )
    
    return {
        "success": True,
        "message": f"Successfully dropped {len(existing_to_drop)} columns: {', '.join(existing_to_drop)}.",
        "cols_before": cols_before,
        "cols_after": len(df.columns),
        "execution_time_ms": round(exec_ms, 2)
    }
