"""
PropertyImage schemas for request and response validation.

This module defines Pydantic models for PropertyImage data validation and serialization.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PropertyImageBase(BaseModel):
    """Base schema for PropertyImage data."""
    
    caption: Optional[str] = None
    is_primary: bool = False


class PropertyImageCreate(PropertyImageBase):
    """Schema for creating a new PropertyImage."""
    
    property_id: UUID = Field(..., description="ID of the property this image belongs to")
    # Note: storage_path, url, and ai_generated_description will be set by the server
    # after processing the uploaded image


class PropertyImageUpdate(BaseModel):
    """Schema for updating an existing PropertyImage."""
    
    caption: Optional[str] = None
    is_primary: Optional[bool] = None
    ai_generated_description: Optional[str] = None
    voice_note_text: Optional[str] = None


class PropertyImageInDB(PropertyImageBase):
    """Schema for PropertyImage data as stored in the database."""
    
    id: UUID
    property_id: UUID
    storage_path: str
    url: str
    ai_generated_description: Optional[str] = None
    voice_note_text: Optional[str] = None
    voice_note_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PropertyImageResponse(PropertyImageInDB):
    """Schema for PropertyImage response data."""
    
    class Config:
        """Pydantic configuration."""
        
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "property_id": "123e4567-e89b-12d3-a456-426614174001",
                "storage_path": "properties/123e4567-e89b-12d3-a456-426614174001/image.jpg",
                "url": "https://example.com/image.jpg",
                "caption": "Living room with great natural light",
                "ai_generated_description": "A spacious living room with hardwood floors and large windows allowing natural light to flood the space.",
                "voice_note_text": "This living room has been recently renovated with new hardwood floors.",
                "voice_note_path": "properties/123e4567-e89b-12d3-a456-426614174001/voice_note.mp3",
                "is_primary": True,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z",
            }
        }
