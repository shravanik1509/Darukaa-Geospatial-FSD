import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120, description="Full name of user")
    email: EmailStr = Field(..., description="Valid work/personal email address")


class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=128, description="Plain text password")
    role: str = Field(default="USER", pattern="^(ADMIN|USER)$", description="User role")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: uuid.UUID
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
