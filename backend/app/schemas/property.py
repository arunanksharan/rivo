"""
Property schemas for request and response validation.

This module defines Pydantic models for Property data validation and serialization.
"""
from datetime import datetime
from typing import List, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class PropertyBase(BaseModel):
    """Base schema for Property data."""
    
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., min_length=2, max_length=50)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price: Optional[float] = None
    bedrooms: Optional[float] = None
    bathrooms: Optional[float] = None
    square_feet: Optional[float] = None
    year_built: Optional[int] = None
    features: Optional[List[str]] = None
    is_published: bool = True


class PropertyCreate(PropertyBase):
    """Schema for creating a new Property."""
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v: str) -> str:
        """Validate that category is one of the allowed values."""
        allowed_categories = [
            "residential", "commercial", "land", "industrial", 
            "apartment", "house", "condo", "townhouse", "other"
        ]
        if v.lower() not in allowed_categories:
            raise ValueError(f"Category must be one of: {', '.join(allowed_categories)}")
        return v.lower()


class PropertyUpdate(BaseModel):
    """Schema for updating an existing Property."""
    
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price: Optional[float] = None
    bedrooms: Optional[float] = None
    bathrooms: Optional[float] = None
    square_feet: Optional[float] = None
    year_built: Optional[int] = None
    features: Optional[List[str]] = None
    is_published: Optional[bool] = None
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        """Validate that category is one of the allowed values."""
        if v is None:
            return v
            
        allowed_categories = [
            "residential", "commercial", "land", "industrial", 
            "apartment", "house", "condo", "townhouse", "other"
        ]
        if v.lower() not in allowed_categories:
            raise ValueError(f"Category must be one of: {', '.join(allowed_categories)}")
        return v.lower()


class PropertyInDB(PropertyBase):
    """Schema for Property data as stored in the database."""
    
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class PropertyResponse(PropertyInDB):
    """Schema for Property response data."""
    
    # Additional fields that might be calculated or joined
    image_count: Optional[int] = None
    primary_image_url: Optional[str] = None
    
    class Config:
        """Pydantic configuration."""
        
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "title": "Beautiful Apartment in Downtown",
                "description": "A spacious apartment with great views.",
                "category": "apartment",
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "zip_code": "10001",
                "country": "USA",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "price": 500000.0,
                "bedrooms": 2.0,
                "bathrooms": 2.0,
                "square_feet": 1200.0,
                "year_built": 2010,
                "features": ["hardwood floors", "stainless steel appliances"],
                "is_published": True,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z",
                "image_count": 3,
                "primary_image_url": "https://example.com/image.jpg",
            }
        }
