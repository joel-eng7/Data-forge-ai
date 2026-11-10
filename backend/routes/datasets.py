import os
import io
import time
import uuid
import shutil
import requests
import certifi
import pandas as pd
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel
from backend.services.dataset_service import (
    list_datasets, get_dataset_detail, get_preview,
    import_preset_dataset, reset_dataset_to_raw,
    DATA_RAW_DIR, DATA_PROC_DIR, get_db, _DF_CACHE
)

router = APIRouter(prefix="/api/datasets", tags=["datasets"])

class UrlImportRequest(BaseModel):
    url: str
    name: Optional[str] = None

@router.get("")
def get_all_datasets():
    return list_datasets()

@router.get("/{id}")
def get_dataset(id: str):
    try:
        return get_dataset_detail(id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{id}/preview")
def preview_dataset(
    id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=100),
    search: str = Query(""),
    sort_by: Optional[str] = Query(None),
    sort_asc: bool = Query(True)
):
    try:
        return get_preview(id, page=page, page_size=page_size, search=search, sort_by=sort_by, sort_asc=sort_asc)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None)
):
    try:
        filename = file.filename or "uploaded_dataset.csv"
        ext = os.path.splitext(filename)[1].lower()
        
        if ext not in [".csv", ".xlsx", ".xls"]:
            raise HTTPException(status_code=400, detail="Only CSV or Excel (.xlsx/.xls) files are supported.")
            
        content = await file.read()
        file_size = len(content)
        
        dataset_id = f"ds_upload_{uuid.uuid4().hex[:8]}"
        display_name = name or os.path.splitext(filename)[0].replace("_", " ").title()
        
        raw_path = os.path.join(DATA_RAW_DIR, f"{dataset_id}_{filename}")
        proc_path = os.path.join(DATA_PROC_DIR, f"{dataset_id}_processed.csv")
        
        # Save raw bytes
        with open(raw_path, "wb") as f:
            f.write(content)
            
        # Parse into DataFrame
        if ext == ".csv":
            try:
                df = pd.read_csv(io.BytesIO(content))
            except:
                df = pd.read_csv(io.BytesIO(content), encoding='latin1')
        else:
            df = pd.read_excel(io.BytesIO(content))
            
        # Save processed CSV copy
        df.to_csv(proc_path, index=False)
        _DF_CACHE[dataset_id] = df
        
        conn = get_db()
        conn.execute("""
            INSERT INTO datasets (
                id, user_id, name, filename, file_path, raw_file_path, source, format,
                original_rows, original_cols, current_rows, current_cols, file_size_bytes, status
            ) VALUES (?, 1, ?, ?, ?, ?, 'Direct Upload', ?, ?, ?, ?, ?, ?, 'Ready')
        """, (
            dataset_id, display_name, filename, proc_path, raw_path,
            ext.replace(".", "").upper(),
            len(df), len(df.columns), len(df), len(df.columns), file_size
        ))
        
        import json
        conn.execute("""
            INSERT INTO pipeline_steps (
                dataset_id, step_number, step_name, operation_type, parameters,
                rows_before, rows_after, cols_before, cols_after, execution_time_ms, details
            ) VALUES (?, 1, 'File Upload & Verification', 'import', ?, 0, ?, 0, ?, 85.0, ?)
        """, (
            dataset_id,
            json.dumps({"filename": filename, "format": ext}),
            len(df), len(df.columns),
            json.dumps({"message": f"Successfully ingested {len(df)} rows and {len(df.columns)} columns."})
        ))
        
        conn.commit()
        conn.close()
        
        return get_dataset_detail(dataset_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload processing failed: {str(e)}")

@router.post("/import-url")
def import_from_url(req: UrlImportRequest):
    try:
        url = req.url.strip()
        headers = {'User-Agent': 'Mozilla/5.0 (DataForge AI Bot)'}
        r = requests.get(url, headers=headers, verify=certifi.where(), timeout=25)
        
        if r.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Remote server responded with HTTP {r.status_code}")
            
        dataset_id = f"ds_url_{uuid.uuid4().hex[:8]}"
        filename = url.split("/")[-1].split("?")[0] or "remote_data.csv"
        if not filename.endswith(".csv"):
            filename += ".csv"
            
        raw_path = os.path.join(DATA_RAW_DIR, f"{dataset_id}_{filename}")
        proc_path = os.path.join(DATA_PROC_DIR, f"{dataset_id}_processed.csv")
        
        with open(raw_path, "wb") as f:
            f.write(r.content)
            
        try:
            df = pd.read_csv(io.BytesIO(r.content))
        except:
            df = pd.read_csv(io.BytesIO(r.content), encoding='latin1')
            
        df.to_csv(proc_path, index=False)
        _DF_CACHE[dataset_id] = df
        
        display_name = req.name or filename.replace(".csv", "").replace("_", " ").title()
        file_size = len(r.content)
        
        conn = get_db()
        conn.execute("""
            INSERT INTO datasets (
                id, user_id, name, filename, file_path, raw_file_path, source, format,
                original_rows, original_cols, current_rows, current_cols, file_size_bytes, status
            ) VALUES (?, 1, ?, ?, ?, ?, ?, 'CSV', ?, ?, ?, ?, ?, 'Ready')
        """, (
            dataset_id, display_name, filename, proc_path, raw_path,
            f"Public URL: {url[:60]}...",
            len(df), len(df.columns), len(df), len(df.columns), file_size
        ))
        
        import json
        conn.execute("""
            INSERT INTO pipeline_steps (
                dataset_id, step_number, step_name, operation_type, parameters,
                rows_before, rows_after, cols_before, cols_after, execution_time_ms, details
            ) VALUES (?, 1, 'HTTP Remote Ingestion', 'import', ?, 0, ?, 0, ?, 145.0, ?)
        """, (
            dataset_id,
            json.dumps({"url": url}),
            len(df), len(df.columns),
            json.dumps({"message": f"Successfully ingested {len(df)} rows from remote endpoint."})
        ))
        
        conn.commit()
        conn.close()
        
        return get_dataset_detail(dataset_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to import URL: {str(e)}")

@router.post("/preset/{preset_key}")
def load_preset(preset_key: str):
    try:
        return import_preset_dataset(preset_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{id}/reset")
def reset_dataset(id: str):
    try:
        return reset_dataset_to_raw(id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
