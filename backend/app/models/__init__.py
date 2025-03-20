"""
Models package initialization.

This module imports all model classes to make them available
when importing from the models package.
"""

from app.models.email_template import EmailTemplate
from app.models.property import Property
from app.models.property_image import PropertyImage
from app.models.user import User
from app.models.voice_setting import VoiceSetting

__all__ = [
    "EmailTemplate",
    "Property",
    "PropertyImage",
    "User",
    "VoiceSetting",
]
