import time
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder
from backend.services.dataset_service import get_cached_df, save_updated_df, get_db

def _record_pipeline_step(
    dataset_id: str,
    step_name: str,
    operation_type: str,
    parameters: Dict[str, Any],
    rows_before: int,
    rows_after: int,
    cols_before: int,
    cols_after: int,
    execution_time_ms: float,
    details: Dict[str, Any]
):
    conn = get_db()
    # Get highest step_number
    max_step = conn.execute(
        "SELECT MAX(step_number) as max_s FROM pipeline_steps WHERE dataset_id = ?",
        (dataset_id,)
    ).fetchone()['max_s'] or 0
    
    conn.execute("""
        INSERT INTO pipeline_steps (
            dataset_id, step_number, step_name, operation_type, parameters,
            rows_before, rows_after, cols_before, cols_after, execution_time_ms, details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        dataset_id,
        max_step + 1,
        step_name,
        operation_type,
        json.dumps(parameters),
        rows_before,
        rows_after,
        cols_before,
        cols_after,
        round(execution_time_ms, 2),
        json.dumps(details)
    ))
    conn.commit()
    conn.close()

def handle_missing_values(
    dataset_id: str,
    strategy: str, # 'mean', 'median', 'mode', 'constant', 'drop'
    columns: Optional[List[str]] = None,
    fill_value: Optional[str] = None
) -> Dict[str, Any]:
    start_t = time.time()
    df = get_cached_df(dataset_id).copy()
    
    rows_before = len(df)
    cols_before = len(df.columns)
    
    # Normalize missing markers (replace '?' or spaces with NaN)
    for col in df.select_dtypes(include=['object', 'string']):
        df[col] = df[col].replace({'?': np.nan, '': np.nan, 'None': np.nan, 'null': np.nan})
        
    target_cols = columns if columns and len(columns) > 0 else list(df.columns)
    modified_stats: Dict[str, Any] = {}
    
    if strategy == "drop":
        df = df.dropna(subset=target_cols)
        dropped_count = rows_before - len(df)
        modified_stats["rows_dropped"] = dropped_count
    else:
        for col in target_cols:
            if col not in df.columns:
                continue
            miss_count = int(df[col].isna().sum())
            if miss_count == 0:
                continue
                
            is_num = pd.api.types.is_numeric_dtype(df[col])
            
            if strategy == "mean" and is_num:
                val = df[col].mean()
                df[col] = df[col].fillna(val)
                modified_stats[col] = {"imputed_count": miss_count, "impute_value": round(float(val), 2)}
            elif strategy == "median" and is_num:
                val = df[col].median()
                df[col] = df[col].fillna(val)
                modified_stats[col] = {"imputed_count": miss_count, "impute_value": round(float(val), 2)}
            elif strategy == "mode":
                modes = df[col].mode()
                val = modes[0] if len(modes) > 0 else "Unknown"
                df[col] = df[col].fillna(val)
                modified_stats[col] = {"imputed_count": miss_count, "impute_value": str(val)}
            elif strategy == "constant":
                val = fill_value if fill_value is not None else ("Unknown" if not is_num else 0)
                if is_num:
                    try:
                        val = float(val)
                    except:
                        val = 0
                df[col] = df[col].fillna(val)
                modified_stats[col] = {"imputed_count": miss_count, "impute_value": str(val)}
                
    save_updated_df(dataset_id, df)
    exec_ms = (time.time() - start_t) * 1000
    
    details = {
        "strategy": strategy,
        "columns_targeted": target_cols,
        "modified_stats": modified_stats
    }
    
    _record_pipeline_step(
        dataset_id=dataset_id,
        step_name=f"Missing Values Imputation ({strategy.capitalize()})",
        operation_type="impute",
        parameters={"strategy": strategy, "columns": target_cols, "fill_value": fill_value},
        rows_before=rows_before,
        rows_after=len(df),
        cols_before=cols_before,
        cols_after=len(df.columns),
        execution_time_ms=exec_ms,
        details=details
    )
    
    return {
        "success": True,
        "message": f"Successfully handled missing values using '{strategy}' strategy.",
        "rows_before": rows_before,
        "rows_after": len(df),
        "cols_before": cols_before,
        "cols_after": len(df.columns),
        "execution_time_ms": round(exec_ms, 2),
        "details": details
    }

def handle_duplicates(
    dataset_id: str,
    subset: Optional[List[str]] = None,
    keep: str = "first"
) -> Dict[str, Any]:
    start_t = time.time()
    df = get_cached_df(dataset_id).copy()
    
    rows_before = len(df)
    cols_before = len(df.columns)
    
    target_subset = subset if subset and len(subset) > 0 else None
    dup_mask = df.duplicated(subset=target_subset, keep=keep)
    dup_count = int(dup_mask.sum())
    
    df = df[~dup_mask]
    
    save_updated_df(dataset_id, df)
    exec_ms = (time.time() - start_t) * 1000
    
    details = {
        "duplicates_removed": dup_count,
        "subset_used": target_subset or "all_columns",
        "keep_rule": keep
    }
    
    _record_pipeline_step(
        dataset_id=dataset_id,
        step_name=f"Duplicate Rows Removal ({dup_count:,} pruned)",
        operation_type="remove_duplicates",
        parameters={"subset": target_subset, "keep": keep},
        rows_before=rows_before,
        rows_after=len(df),
        cols_before=cols_before,
        cols_after=len(df.columns),
        execution_time_ms=exec_ms,
        details=details
    )
    
    return {
        "success": True,
        "message": f"Successfully removed {dup_count:,} duplicate records.",
        "rows_before": rows_before,
        "rows_after": len(df),
        "cols_before": cols_before,
        "cols_after": len(df.columns),
        "execution_time_ms": round(exec_ms, 2),
        "details": details
    }

def handle_type_casting(
    dataset_id: str,
    conversions: Dict[str, str] # {col: "int" | "float" | "str" | "category" | "datetime"}
) -> Dict[str, Any]:
    start_t = time.time()
    df = get_cached_df(dataset_id).copy()
    
    rows_before = len(df)
    cols_before = len(df.columns)
    
    applied = {}
    errors = {}
    
    for col, target_type in conversions.items():
        if col not in df.columns:
            continue
        try:
            if target_type in ["int", "int64"]:
                # Safe coerce to numeric then fillna if needed
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype('int64')
                applied[col] = "int64"
            elif target_type in ["float", "float64"]:
                df[col] = pd.to_numeric(df[col], errors='coerce').astype('float64')
                applied[col] = "float64"
            elif target_type in ["str", "string"]:
                df[col] = df[col].astype(str)
                applied[col] = "string"
            elif target_type in ["category"]:
                df[col] = df[col].astype('category')
                applied[col] = "category"
            elif target_type in ["datetime", "datetime64"]:
                df[col] = pd.to_datetime(df[col], errors='coerce')
                applied[col] = "datetime64[ns]"
        except Exception as e:
            errors[col] = str(e)
            
    save_updated_df(dataset_id, df)
    exec_ms = (time.time() - start_t) * 1000
    
    details = {
        "conversions_applied": applied,
        "conversion_errors": errors
    }
    
    _record_pipeline_step(
        dataset_id=dataset_id,
        step_name=f"Data Type Conversion ({len(applied)} columns)",
        operation_type="type_cast",
        parameters={"conversions": conversions},
        rows_before=rows_before,
        rows_after=len(df),
        cols_before=cols_before,
        cols_after=len(df.columns),
        execution_time_ms=exec_ms,
        details=details
    )
    
    return {
        "success": True,
        "message": f"Successfully updated data types for {len(applied)} columns.",
        "rows_before": rows_before,
        "rows_after": len(df),
        "cols_before": cols_before,
        "cols_after": len(df.columns),
        "execution_time_ms": round(exec_ms, 2),
        "details": details
    }

def handle_outliers(
    dataset_id: str,
    method: str = "iqr", # 'iqr' or 'zscore'
    columns: Optional[List[str]] = None,
    threshold: float = 1.5,
    action: str = "cap" # 'cap', 'remove', 'retain'
) -> Dict[str, Any]:
    start_t = time.time()
    df = get_cached_df(dataset_id).copy()
    
    rows_before = len(df)
    cols_before = len(df.columns)
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    target_cols = [c for c in (columns or numeric_cols) if c in numeric_cols]
    
    stats: Dict[str, Any] = {}
    rows_to_drop = set()
    
    for col in target_cols:
        series = df[col].dropna()
        if len(series) < 5:
            continue
            
        if method == "iqr":
            q1 = float(series.quantile(0.25))
            q3 = float(series.quantile(0.75))
            iqr = q3 - q1
            lower = q1 - threshold * iqr
            upper = q3 + threshold * iqr
        else: # zscore
            mean = float(series.mean())
            std = float(series.std())
            lower = mean - threshold * std
            upper = mean + threshold * std
            
        outlier_mask = (df[col] < lower) | (df[col] > upper)
        cnt = int(outlier_mask.sum())
        
        if cnt > 0:
            stats[col] = {
                "outliers_detected": cnt,
                "lower_bound": round(lower, 2),
                "upper_bound": round(upper, 2),
                "action_applied": action
            }
            if action == "cap":
                df[col] = df[col].clip(lower=lower, upper=upper)
            elif action == "remove":
                outlier_indices = df[outlier_mask].index.tolist()
                rows_to_drop.update(outlier_indices)
                
    if action == "remove" and rows_to_drop:
        df = df.drop(index=list(rows_to_drop))
        
    save_updated_df(dataset_id, df)
    exec_ms = (time.time() - start_t) * 1000
    
    details = {
        "method": method,
        "threshold": threshold,
        "action": action,
        "columns_processed": stats,
        "total_rows_removed": len(rows_to_drop) if action == "remove" else 0
    }
    
    _record_pipeline_step(
        dataset_id=dataset_id,
        step_name=f"Outlier Treatment ({method.upper()} - {action.capitalize()})",
        operation_type="outliers",
        parameters={"method": method, "threshold": threshold, "action": action, "columns": target_cols},
        rows_before=rows_before,
        rows_after=len(df),
        cols_before=cols_before,
        cols_after=len(df.columns),
        execution_time_ms=exec_ms,
        details=details
    )
    
    return {
        "success": True,
        "message": f"Treated outliers across {len(stats)} columns using {method.upper()} with action '{action}'.",
        "rows_before": rows_before,
        "rows_after": len(df),
        "cols_before": cols_before,
        "cols_after": len(df.columns),
        "execution_time_ms": round(exec_ms, 2),
        "details": details
    }

def handle_scaling(
    dataset_id: str,
    method: str = "standard", # 'standard', 'minmax', 'robust'
    columns: Optional[List[str]] = None
) -> Dict[str, Any]:
    start_t = time.time()
    df = get_cached_df(dataset_id).copy()
    
    rows_before = len(df)
    cols_before = len(df.columns)
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    target_cols = [c for c in (columns or numeric_cols) if c in numeric_cols]
    
    if not target_cols:
        raise ValueError("No numerical columns available to scale.")
        
    if method == "minmax":
        scaler = MinMaxScaler()
    elif method == "robust":
        scaler = RobustScaler()
    else:
        scaler = StandardScaler()
        
    # Scale in-place or as scaled versions
    scaled_values = scaler.fit_transform(df[target_cols].fillna(df[target_cols].median()))
    df[target_cols] = np.round(scaled_values, 4)
    
    save_updated_df(dataset_id, df)
    exec_ms = (time.time() - start_t) * 1000
    
    details = {
        "method": method,
        "columns_scaled": target_cols
    }
    
    _record_pipeline_step(
        dataset_id=dataset_id,
        step_name=f"Numerical Feature Scaling ({method.capitalize()}Scaler)",
        operation_type="scale",
        parameters={"method": method, "columns": target_cols},
        rows_before=rows_before,
        rows_after=len(df),
        cols_before=cols_before,
        cols_after=len(df.columns),
        execution_time_ms=exec_ms,
        details=details
    )
    
    return {
        "success": True,
        "message": f"Successfully scaled {len(target_cols)} numeric columns with {method} scaler.",
        "rows_before": rows_before,
        "rows_after": len(df),
        "cols_before": cols_before,
        "cols_after": len(df.columns),
        "execution_time_ms": round(exec_ms, 2),
        "details": details
    }

def handle_encoding(
    dataset_id: str,
    method: str = "onehot", # 'onehot', 'label'
    columns: Optional[List[str]] = None,
    drop_first: bool = False
) -> Dict[str, Any]:
    start_t = time.time()
    df = get_cached_df(dataset_id).copy()
    
    rows_before = len(df)
    cols_before = len(df.columns)
    
    cat_cols = df.select_dtypes(include=['object', 'category', 'string']).columns.tolist()
    target_cols = [c for c in (columns or cat_cols) if c in df.columns]
    
    if not target_cols:
        raise ValueError("No categorical columns available for encoding.")
        
    encoded_summary = {}
    
    if method == "label":
        for col in target_cols:
            le = LabelEncoder()
            # Clean nulls
            series_clean = df[col].astype(str).fillna("Missing")
            df[col] = le.fit_transform(series_clean)
            encoded_summary[col] = {"classes_count": len(le.classes_)}
    else: # onehot
        # Avoid exploding columns if cardinality > 20 per column for reasonable web performance
        safe_cols = [c for c in target_cols if df[c].nunique() <= 25]
        if not safe_cols:
            safe_cols = target_cols[:3] # fallback to top 3
        df = pd.get_dummies(df, columns=safe_cols, drop_first=drop_first, dtype=int)
        encoded_summary["onehot_columns"] = safe_cols
        encoded_summary["new_dimension"] = len(df.columns)
        
    save_updated_df(dataset_id, df)
    exec_ms = (time.time() - start_t) * 1000
    
    details = {
        "method": method,
        "columns_targeted": target_cols,
        "summary": encoded_summary
    }
    
    _record_pipeline_step(
        dataset_id=dataset_id,
        step_name=f"Categorical Data Encoding ({method.upper()})",
        operation_type="encode",
        parameters={"method": method, "columns": target_cols, "drop_first": drop_first},
        rows_before=rows_before,
        rows_after=len(df),
        cols_before=cols_before,
        cols_after=len(df.columns),
        execution_time_ms=exec_ms,
        details=details
    )
    
    return {
        "success": True,
        "message": f"Successfully encoded columns using {method} encoding.",
        "rows_before": rows_before,
        "rows_after": len(df),
        "cols_before": cols_before,
        "cols_after": len(df.columns),
        "execution_time_ms": round(exec_ms, 2),
        "details": details
    }
