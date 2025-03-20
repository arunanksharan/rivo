"""
EmailTemplate model for the application.

This module defines the EmailTemplate model for storing email templates.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class EmailTemplate(Base):
    """
    EmailTemplate model for storing email templates.
    
    Attributes:
        id: Primary key UUID
        user_id: Foreign key to the user who owns this template
        name: Template name
        subject: Email subject template
        body: Email body template
        is_default: Whether this is a default template
        created_at: Timestamp when the template was created
        updated_at: Timestamp when the template was last updated
    """
    
    __tablename__ = "email_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(100), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
    
    # Relationships
    user = relationship("User", backref="email_templates")
    
    def __repr__(self) -> str:
        """String representation of the EmailTemplate model."""
        return f"<EmailTemplate {self.name}>"
