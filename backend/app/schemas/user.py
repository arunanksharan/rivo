"""
User schemas for request and response validation.

This module defines Pydantic models for User data validation and serialization.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base schema for User data."""
    
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    """Schema for creating a new User."""
    
    supabase_id: str = Field(..., description="User ID from Supabase authentication")


class UserUpdate(BaseModel):
    """Schema for updating an existing User."""
    
    full_name: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for User response data."""
    
    id: UUID
    supabase_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic configuration."""
        
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "supabase_id": "abcdef123456",
                "email": "user@example.com",
                "full_name": "John Doe",
                "is_active": True,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z",
            }
        }
