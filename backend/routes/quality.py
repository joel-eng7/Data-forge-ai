from fastapi import APIRouter, HTTPException
from backend.services.quality_service import analyze_data_quality

router = APIRouter(prefix="/api/datasets", tags=["quality"])

@router.get("/{id}/quality")
def get_quality_report(id: str):
    try:
        return analyze_data_quality(id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Quality audit failed: {str(e)}")
