"""Pydantic schemas for authentication."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    name: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: int
    email: str


class UserResponse(BaseModel):
    """Schema for user response."""
    id: int
    email: str
    is_active: bool
    created_at: str
    last_login: Optional[str] = None


class UserDetailsResponse(BaseModel):
    """Schema for user details response."""
    name: Optional[str] = None
    has_cv: bool = False


class UserDetailsUpdate(BaseModel):
    """Schema for updating user details."""
    name: Optional[str] = None


class GoogleLoginRequest(BaseModel):
    """Schema for Google OAuth login."""
    id_token: str = Field(..., description="Google ID token from client")
