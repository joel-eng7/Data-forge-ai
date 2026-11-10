import json
from fastapi import APIRouter, HTTPException
from backend.models.database import get_db

router = APIRouter(prefix="/api/datasets/{id}/history", tags=["pipeline"])

@router.get("")
def get_pipeline_history(id: str):
    conn = get_db()
    ds = conn.execute("SELECT id, name, created_at, updated_at FROM datasets WHERE id = ?", (id,)).fetchone()
    if not ds:
        conn.close()
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    rows = conn.execute(
        "SELECT * FROM pipeline_steps WHERE dataset_id = ? ORDER BY step_number ASC",
        (id,)
    ).fetchall()
    conn.close()

    steps = []
    for r in rows:
        steps.append({
            "id": r['id'],
            "dataset_id": r['dataset_id'],
            "step_number": r['step_number'],
            "step_name": r['step_name'],
            "operation_type": r['operation_type'],
            "parameters": json.loads(r['parameters']) if r['parameters'] else {},
            "rows_before": r['rows_before'],
            "rows_after": r['rows_after'],
            "cols_before": r['cols_before'],
            "cols_after": r['cols_after'],
            "execution_time_ms": r['execution_time_ms'],
            "details": json.loads(r['details']) if r['details'] else {},
            "created_at": str(r['created_at'])
        })

    return {
        "dataset_id": id,
        "dataset_name": ds['name'],
        "total_steps": len(steps),
        "steps": steps
    }
