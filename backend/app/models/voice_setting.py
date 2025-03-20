"""
VoiceSetting model for the application.

This module defines the VoiceSetting model for storing user voice assistant settings.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class VoiceSetting(Base):
    """
    VoiceSetting model for storing user voice assistant settings.
    
    Attributes:
        id: Primary key UUID
        user_id: Foreign key to the user these settings belong to
        wake_word: Custom wake word for activating voice assistant
        voice_type: Type of voice for the assistant (e.g., male, female)
        voice_language: Language for the voice assistant
        is_enabled: Whether voice assistant is enabled
        volume: Voice assistant volume level
        created_at: Timestamp when the settings were created
        updated_at: Timestamp when the settings were last updated
    """
    
    __tablename__ = "voice_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    wake_word = Column(String(50), default="Rivo Start")
    voice_type = Column(String(20), default="female")
    voice_language = Column(String(20), default="en-US")
    is_enabled = Column(Boolean, default=True)
    volume = Column(Float, default=0.7)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
    
    # Relationships
    user = relationship("User", backref="voice_settings")
    
    def __repr__(self) -> str:
        """String representation of the VoiceSetting model."""
        return f"<VoiceSetting {self.id}>"
