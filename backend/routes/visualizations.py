from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.services.visualizations_service import get_visualization_data

router = APIRouter(prefix="/api/datasets/{id}/visualizations", tags=["visualizations"])

@router.get("")
def get_visualizations(id: str, column: Optional[str] = Query(None)):
    try:
        return get_visualization_data(id, column=column)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
