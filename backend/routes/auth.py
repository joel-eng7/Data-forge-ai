import uuid
from fastapi import APIRouter, HTTPException, Depends
from backend.models.schemas import UserLogin, UserRegister, UserResponse, TokenResponse
from backend.models.database import get_db, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Active session tokens: token -> user_dict
_ACTIVE_SESSIONS = {}

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister):
    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    pw_hash = hash_password(req.password)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (email, full_name, password_hash, role) VALUES (?, ?, ?, ?)",
        (req.email, req.full_name, pw_hash, req.role or "Data Scientist")
    )
    user_id = cursor.lastrowid
    conn.commit()
    
    user_row = conn.execute("SELECT id, email, full_name, role, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    
    user_data = dict(user_row)
    token = f"dataforge_token_{uuid.uuid4().hex}"
    _ACTIVE_SESSIONS[token] = user_data
    
    return {
        "token": token,
        "user": user_data
    }

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    conn.close()
    
    if not user or not verify_password(req.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    user_data = {
        "id": user['id'],
        "email": user['email'],
        "full_name": user['full_name'],
        "role": user['role'],
        "created_at": str(user['created_at'])
    }
    
    token = f"dataforge_token_{uuid.uuid4().hex}"
    _ACTIVE_SESSIONS[token] = user_data
    
    return {
        "token": token,
        "user": user_data
    }

@router.get("/me")
def get_me(token: str = ""):
    if token and token in _ACTIVE_SESSIONS:
        return _ACTIVE_SESSIONS[token]
    # Return default user for easy demo access if no token passed
    conn = get_db()
    user = conn.execute("SELECT id, email, full_name, role, created_at FROM users WHERE email = 'alex@dataforge.ai'").fetchone()
    conn.close()
    if user:
        return dict(user)
    return {"id": 1, "email": "alex@dataforge.ai", "full_name": "Alex Morgan", "role": "Lead Data Scientist"}
