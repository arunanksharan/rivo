"""
User model for the application.

This module defines the User model for storing user information.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class User(Base):
    """
    User model for storing user information.
    
    Attributes:
        id: Primary key UUID
        email: User's email address
        hashed_password: Hashed password for email authentication
        full_name: User's full name
        auth_provider: Authentication provider (email, google, apple, etc.)
        google_id: User ID from Google authentication
        apple_id: User ID from Apple authentication
        is_active: Whether the user account is active
        created_at: Timestamp when the user was created
        updated_at: Timestamp when the user was last updated
    """
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    auth_provider = Column(String, nullable=False, default="email")
    google_id = Column(String, unique=True, nullable=True, index=True)
    apple_id = Column(String, unique=True, nullable=True, index=True)
    supabase_id = Column(String, unique=True, nullable=True, index=True)  # Kept for backward compatibility
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
    
    def __repr__(self) -> str:
        """String representation of the User model."""
        return f"<User {self.email}>"
