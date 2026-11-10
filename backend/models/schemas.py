from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "Data Scientist"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

# Dataset Schemas
class DatasetSummary(BaseModel):
    id: str
    name: str
    filename: str
    source: str
    format: str
    original_rows: int
    original_cols: int
    current_rows: int
    current_cols: int
    file_size_bytes: int
    status: str
    created_at: str
    updated_at: str

class ColumnMeta(BaseModel):
    name: str
    dtype: str
    inferred_type: str
    missing_count: int
    missing_percentage: float
    unique_count: int
    sample_values: List[Any]
    is_numerical: bool
    is_categorical: bool
    is_datetime: bool
    min_val: Optional[Any] = None
    max_val: Optional[Any] = None
    mean_val: Optional[float] = None
    median_val: Optional[float] = None
    std_val: Optional[float] = None

class DatasetDetail(BaseModel):
    id: str
    name: str
    filename: str
    source: str
    format: str
    total_rows: int
    total_cols: int
    numerical_cols_count: int
    categorical_cols_count: int
    total_missing_values: int
    missing_percentage: float
    duplicate_rows_count: int
    duplicate_percentage: float
    memory_usage_mb: float
    quality_score: float
    columns: List[ColumnMeta]
    created_at: str
    updated_at: str

class DatasetPreview(BaseModel):
    columns: List[str]
    column_types: Dict[str, str]
    rows: List[Dict[str, Any]]
    total_rows: int
    total_cols: int
    page: int
    page_size: int
    total_pages: int

# Data Quality Schemas
class QualityIssue(BaseModel):
    type: str # 'missing_values', 'duplicates', 'outliers', 'type_mismatch', 'constant_column', 'high_cardinality'
    severity: str # 'high', 'medium', 'low', 'info'
    column: Optional[str] = None
    count: int
    percentage: float
    description: str
    suggested_action: str

class QualityReport(BaseModel):
    dataset_id: str
    dataset_name: str
    overall_score: float
    letter_grade: str
    completeness_score: float
    uniqueness_score: float
    validity_score: float
    consistency_score: float
    total_rows: int
    total_cols: int
    duplicate_count: int
    missing_cells_count: int
    total_cells: int
    issues: List[QualityIssue]
    columns_with_missing: List[Dict[str, Any]]
    columns_with_outliers: List[Dict[str, Any]]
    generated_at: str

# Preprocessing Request Schemas
class ImputeRequest(BaseModel):
    strategy: str # 'mean', 'median', 'mode', 'constant', 'drop'
    columns: List[str] = Field(default_factory=list)
    fill_value: Optional[str] = None

class DuplicatesRequest(BaseModel):
    subset: Optional[List[str]] = None
    keep: str = "first" # 'first', 'last'

class TypeCastRequest(BaseModel):
    conversions: Dict[str, str] # {col_name: "int" | "float" | "str" | "category" | "datetime"}

class OutlierRequest(BaseModel):
    method: str = "iqr" # 'iqr' or 'zscore'
    columns: List[str] = Field(default_factory=list)
    threshold: float = 1.5
    action: str = "cap" # 'cap', 'remove', 'retain'

class ScaleRequest(BaseModel):
    method: str = "standard" # 'standard', 'minmax', 'robust'
    columns: List[str] = Field(default_factory=list)

class EncodeRequest(BaseModel):
    method: str = "onehot" # 'onehot', 'label'
    columns: List[str] = Field(default_factory=list)
    drop_first: bool = False

# Feature Engineering Schemas
class CreateColumnRequest(BaseModel):
    new_column_name: str
    operation: str # 'math_binary', 'math_unary', 'binning', 'condition', 'date_extract'
    col_a: str
    col_b: Optional[str] = None
    operator: Optional[str] = None # '+', '-', '*', '/', 'log', 'sqrt', 'bins'
    bins: Optional[int] = None
    bin_labels: Optional[List[str]] = None
    condition_val: Optional[Any] = None
    if_true_val: Optional[Any] = 1
    if_false_val: Optional[Any] = 0

class RenameColumnRequest(BaseModel):
    column_mapping: Dict[str, str]

class DropColumnsRequest(BaseModel):
    columns: List[str]

class AdultPresetFeatureRequest(BaseModel):
    features: List[str] = Field(default_factory=lambda: [
        "age_groups", "hours_category", "capital_gain_flag", "capital_loss_flag"
    ])

# Pipeline Step Schema
class PipelineStep(BaseModel):
    id: int
    step_number: int
    step_name: str
    operation_type: str
    parameters: Dict[str, Any]
    rows_before: int
    rows_after: int
    cols_before: int
    cols_after: int
    execution_time_ms: float
    details: Dict[str, Any]
    created_at: str
