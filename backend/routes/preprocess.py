from fastapi import APIRouter, HTTPException
from backend.models.schemas import (
    ImputeRequest, DuplicatesRequest, TypeCastRequest,
    OutlierRequest, ScaleRequest, EncodeRequest
)
from backend.services.preprocessing_service import (
    handle_missing_values, handle_duplicates, handle_type_casting,
    handle_outliers, handle_scaling, handle_encoding
)

router = APIRouter(prefix="/api/datasets/{id}/preprocess", tags=["preprocessing"])

@router.post("/missing")
def preprocess_missing(id: str, req: ImputeRequest):
    try:
        return handle_missing_values(id, strategy=req.strategy, columns=req.columns, fill_value=req.fill_value)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/duplicates")
def preprocess_duplicates(id: str, req: DuplicatesRequest):
    try:
        return handle_duplicates(id, subset=req.subset, keep=req.keep)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/type-cast")
def preprocess_type_cast(id: str, req: TypeCastRequest):
    try:
        return handle_type_casting(id, conversions=req.conversions)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/outliers")
def preprocess_outliers(id: str, req: OutlierRequest):
    try:
        return handle_outliers(id, method=req.method, columns=req.columns, threshold=req.threshold, action=req.action)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/scale")
def preprocess_scale(id: str, req: ScaleRequest):
    try:
        return handle_scaling(id, method=req.method, columns=req.columns)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/encode")
def preprocess_encode(id: str, req: EncodeRequest):
    try:
        return handle_encoding(id, method=req.method, columns=req.columns, drop_first=req.drop_first)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
