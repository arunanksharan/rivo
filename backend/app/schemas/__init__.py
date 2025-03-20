"""
Schemas package initialization.

This module imports all schema classes to make them available
when importing from the schemas package.
"""

from app.schemas.email_template import (
    EmailTemplateCreate,
    EmailTemplateInDB,
    EmailTemplateResponse,
    EmailTemplateUpdate,
)
from app.schemas.property import (
    PropertyCreate,
    PropertyInDB,
    PropertyResponse,
    PropertyUpdate,
)
from app.schemas.property_image import (
    PropertyImageCreate,
    PropertyImageInDB,
    PropertyImageResponse,
    PropertyImageUpdate,
)
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.voice_setting import (
    VoiceSettingCreate,
    VoiceSettingInDB,
    VoiceSettingResponse,
    VoiceSettingUpdate,
)

__all__ = [
    "EmailTemplateCreate",
    "EmailTemplateInDB",
    "EmailTemplateResponse",
    "EmailTemplateUpdate",
    "PropertyCreate",
    "PropertyInDB",
    "PropertyResponse",
    "PropertyUpdate",
    "PropertyImageCreate",
    "PropertyImageInDB",
    "PropertyImageResponse",
    "PropertyImageUpdate",
    "UserCreate",
    "UserResponse",
    "UserUpdate",
    "VoiceSettingCreate",
    "VoiceSettingInDB",
    "VoiceSettingResponse",
    "VoiceSettingUpdate",
]
