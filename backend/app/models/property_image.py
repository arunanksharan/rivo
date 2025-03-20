"""
PropertyImage model for the application.

This module defines the PropertyImage model for storing property images.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base


class PropertyImage(Base):
    """
    PropertyImage model for storing property images.
    
    Attributes:
        id: Primary key UUID
        property_id: Foreign key to the property this image belongs to
        storage_path: Path to the image in storage
        url: Public URL of the image
        caption: Optional caption for the image
        ai_generated_description: AI-generated description of the image
        voice_note_text: Transcribed text from voice note
        voice_note_path: Path to the voice note audio file in storage
        is_primary: Whether this is the primary image for the property
        created_at: Timestamp when the image was created
        updated_at: Timestamp when the image was last updated
    """
    
    __tablename__ = "property_images"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(
        UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False
    )
    storage_path = Column(String, nullable=False)
    url = Column(String, nullable=False)
    caption = Column(Text, nullable=True)
    ai_generated_description = Column(Text, nullable=True)
    voice_note_text = Column(Text, nullable=True)
    voice_note_path = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
    
    # Relationships
    property: Mapped["Property"] = relationship("Property", back_populates="images")
    
    def __repr__(self) -> str:
        """String representation of the PropertyImage model."""
        return f"<PropertyImage {self.id}>"
