"""
EmailTemplate schemas for request and response validation.

This module defines Pydantic models for EmailTemplate data validation and serialization.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class EmailTemplateBase(BaseModel):
    """Base schema for EmailTemplate data."""
    
    name: str = Field(..., min_length=3, max_length=100)
    subject: str = Field(..., min_length=3, max_length=255)
    body: str = Field(..., min_length=10)
    is_default: bool = False


class EmailTemplateCreate(EmailTemplateBase):
    """Schema for creating a new EmailTemplate."""
    
    pass


class EmailTemplateUpdate(BaseModel):
    """Schema for updating an existing EmailTemplate."""
    
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    subject: Optional[str] = Field(None, min_length=3, max_length=255)
    body: Optional[str] = Field(None, min_length=10)
    is_default: Optional[bool] = None


class EmailTemplateInDB(EmailTemplateBase):
    """Schema for EmailTemplate data as stored in the database."""
    
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class EmailTemplateResponse(EmailTemplateInDB):
    """Schema for EmailTemplate response data."""
    
    class Config:
        """Pydantic configuration."""
        
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "name": "Property Inquiry",
                "subject": "Information about {{property_address}}",
                "body": "Hello {{recipient_name}},\n\nThank you for your interest in the property at {{property_address}}. Here are the details you requested:\n\n{{property_details}}\n\nPlease let me know if you have any questions.\n\nBest regards,\n{{sender_name}}",
                "is_default": True,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z",
            }
        }
