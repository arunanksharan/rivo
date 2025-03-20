"""
VoiceSetting schemas for request and response validation.

This module defines Pydantic models for VoiceSetting data validation and serialization.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class VoiceSettingBase(BaseModel):
    """Base schema for VoiceSetting data."""
    
    wake_word: str = Field(default="Rivo Start", min_length=2, max_length=50)
    voice_type: str = Field(default="female", min_length=2, max_length=20)
    voice_language: str = Field(default="en-US", min_length=2, max_length=20)
    is_enabled: bool = True
    volume: float = Field(default=0.7, ge=0.0, le=1.0)
    
    @field_validator('voice_type')
    @classmethod
    def validate_voice_type(cls, v: str) -> str:
        """Validate that voice_type is one of the allowed values."""
        allowed_types = ["male", "female", "neutral"]
        if v.lower() not in allowed_types:
            raise ValueError(f"Voice type must be one of: {', '.join(allowed_types)}")
        return v.lower()
    
    @field_validator('voice_language')
    @classmethod
    def validate_voice_language(cls, v: str) -> str:
        """Validate that voice_language is in a valid format."""
        if not (2 <= len(v) <= 20) or ("-" not in v and "_" not in v):
            raise ValueError("Voice language must be in format 'en-US' or 'en_US'")
        return v


class VoiceSettingCreate(VoiceSettingBase):
    """Schema for creating a new VoiceSetting."""
    
    pass


class VoiceSettingUpdate(BaseModel):
    """Schema for updating an existing VoiceSetting."""
    
    wake_word: Optional[str] = Field(None, min_length=2, max_length=50)
    voice_type: Optional[str] = None
    voice_language: Optional[str] = None
    is_enabled: Optional[bool] = None
    volume: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    @field_validator('voice_type')
    @classmethod
    def validate_voice_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate that voice_type is one of the allowed values."""
        if v is None:
            return v
            
        allowed_types = ["male", "female", "neutral"]
        if v.lower() not in allowed_types:
            raise ValueError(f"Voice type must be one of: {', '.join(allowed_types)}")
        return v.lower()
    
    @field_validator('voice_language')
    @classmethod
    def validate_voice_language(cls, v: Optional[str]) -> Optional[str]:
        """Validate that voice_language is in a valid format."""
        if v is None:
            return v
            
        if not (2 <= len(v) <= 20) or ("-" not in v and "_" not in v):
            raise ValueError("Voice language must be in format 'en-US' or 'en_US'")
        return v


class VoiceSettingInDB(VoiceSettingBase):
    """Schema for VoiceSetting data as stored in the database."""
    
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class VoiceSettingResponse(VoiceSettingInDB):
    """Schema for VoiceSetting response data."""
    
    class Config:
        """Pydantic configuration."""
        
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "wake_word": "Rivo Start",
                "voice_type": "female",
                "voice_language": "en-US",
                "is_enabled": True,
                "volume": 0.7,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z",
            }
        }
