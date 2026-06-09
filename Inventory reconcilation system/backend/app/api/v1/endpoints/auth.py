from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr
from typing import Optional

from backend.app.core.config import settings
from backend.app.core.security import verify_password, create_access_token, get_password_hash, ALGORITHM
from backend.app.db.session import get_db
from backend.app.db.models import User, Organization

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "Viewer"  # Super Admin, Operations Manager, Warehouse Manager, Auditor, Analyst, Viewer
    organization_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    organization_id: Optional[int]

    class Config:
        from_attributes = True

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, "enterprise_super_secret_key_9876543210_change_in_prod", algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    stmt = select(User).filter(User.email == email)
    user = db.execute(stmt).scalars().first()
    if user is None:
        raise credentials_exception
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {self.allowed_roles}",
            )
        return user

@router.post("/signup", response_model=UserOut)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    stmt = select(User).filter(User.email == payload.email)
    existing_user = db.execute(stmt).scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    org_id = None
    if payload.organization_name:
        stmt_org = select(Organization).filter(Organization.name == payload.organization_name)
        org = db.execute(stmt_org).scalars().first()
        if not org:
            org = Organization(name=payload.organization_name)
            db.add(org)
            db.commit()
            db.refresh(org)
        org_id = org.id
        
    hashed_pwd = get_password_hash(payload.password)
    new_user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hashed_pwd,
        role=payload.role,
        organization_id=org_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    stmt = select(User).filter(User.email == form_data.username)
    user = db.execute(stmt).scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

@router.get("/me", response_model=UserOut)
def read_current_user(user: User = Depends(get_current_user)):
    return user
