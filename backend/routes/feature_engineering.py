from fastapi import APIRouter, HTTPException
from backend.models.schemas import (
    CreateColumnRequest, RenameColumnRequest, DropColumnsRequest, AdultPresetFeatureRequest
)
from backend.services.feature_service import (
    apply_adult_census_preset_features, create_custom_column, rename_columns, drop_columns
)

router = APIRouter(prefix="/api/datasets/{id}/features", tags=["features"])

@router.post("/preset-adult")
def create_adult_preset(id: str):
    try:
        return apply_adult_census_preset_features(id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-column")
def create_column(id: str, req: CreateColumnRequest):
    try:
        return create_custom_column(
            id,
            new_column_name=req.new_column_name,
            operation=req.operation,
            col_a=req.col_a,
            col_b=req.col_b,
            operator=req.operator,
            bins=req.bins,
            bin_labels=req.bin_labels,
            condition_val=req.condition_val,
            if_true_val=req.if_true_val,
            if_false_val=req.if_false_val
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/rename")
def rename_dataset_columns(id: str, req: RenameColumnRequest):
    try:
        return rename_columns(id, column_mapping=req.column_mapping)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/drop")
def drop_dataset_columns(id: str, req: DropColumnsRequest):
    try:
        return drop_columns(id, columns=req.columns)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
