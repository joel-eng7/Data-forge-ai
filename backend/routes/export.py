import json
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import PlainTextResponse
from backend.services.export_service import (
    export_as_csv_bytes, export_as_excel_bytes,
    generate_reproducible_python_script, generate_jupyter_notebook,
    generate_documentation_markdown
)
from backend.services.dataset_service import get_db

router = APIRouter(prefix="/api/datasets/{id}", tags=["export"])

@router.get("/export/csv")
def download_csv(id: str):
    try:
        csv_bytes = export_as_csv_bytes(id)
        conn = get_db()
        row = conn.execute("SELECT filename FROM datasets WHERE id = ?", (id,)).fetchone()
        conn.close()
        fn = f"clean_{row['filename']}" if row else "clean_dataset.csv"
        return Response(
            content=csv_bytes,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{fn}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/export/excel")
def download_excel(id: str):
    try:
        xlsx_bytes = export_as_excel_bytes(id)
        conn = get_db()
        row = conn.execute("SELECT filename FROM datasets WHERE id = ?", (id,)).fetchone()
        conn.close()
        base = row['filename'].rsplit('.', 1)[0] if row else "clean_dataset"
        fn = f"clean_{base}.xlsx"
        return Response(
            content=xlsx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{fn}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/export/script")
def download_script(id: str):
    try:
        script_code = generate_reproducible_python_script(id)
        return Response(
            content=script_code,
            media_type="text/x-python",
            headers={"Content-Disposition": 'attachment; filename="dataforge_preprocess.py"'}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/export/notebook")
def download_notebook(id: str):
    try:
        nb_json = generate_jupyter_notebook(id)
        nb_str = json.dumps(nb_json, indent=2)
        return Response(
            content=nb_str,
            media_type="application/x-ipynb+json",
            headers={"Content-Disposition": 'attachment; filename="dataforge_pipeline.ipynb"'}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/export/documentation")
def download_documentation_report(id: str):
    try:
        doc_md = generate_documentation_markdown(id)
        return Response(
            content=doc_md,
            media_type="text/markdown",
            headers={"Content-Disposition": 'attachment; filename="DATAFORGE_DOCUMENTATION.md"'}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/documentation")
def get_documentation_content(id: str):
    try:
        doc_md = generate_documentation_markdown(id)
        return {"markdown": doc_md}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
