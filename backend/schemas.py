from pydantic import BaseModel, EmailStr
from typing import Optional
from models import RoleEnum


# --- Auth Schemas ---

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None


# --- User Schemas ---

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None

class UserPaginatedOut(BaseModel):
    items: list[UserOut]
    total: int
    page: int
    pages: int

