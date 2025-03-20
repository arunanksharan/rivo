"""
Property model for the application.

This module defines the Property model for storing property information.
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base


class Property(Base):
    """
    Property model for storing property information.
    
    Attributes:
        id: Primary key UUID
        user_id: Foreign key to the user who owns this property
        title: Property title
        description: Property description
        category: Property category (e.g., residential, commercial)
        address: Property address
        city: Property city
        state: Property state
        zip_code: Property ZIP code
        country: Property country
        latitude: Property latitude coordinate
        longitude: Property longitude coordinate
        price: Property price
        bedrooms: Number of bedrooms
        bathrooms: Number of bathrooms
        square_feet: Property square footage
        year_built: Year the property was built
        features: Array of property features
        is_published: Whether the property is published
        created_at: Timestamp when the property was created
        updated_at: Timestamp when the property was last updated
        images: Relationship to PropertyImage model
    """
    
    __tablename__ = "properties"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    price = Column(Float, nullable=True)
    bedrooms = Column(Float, nullable=True)
    bathrooms = Column(Float, nullable=True)
    square_feet = Column(Float, nullable=True)
    year_built = Column(Integer, nullable=True)
    features = Column(ARRAY(String), nullable=True)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
    
    # Relationships
    user = relationship("User", backref="properties")
    images: Mapped[List["PropertyImage"]] = relationship(
        "PropertyImage", 
        back_populates="property",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        """String representation of the Property model."""
        return f"<Property {self.title}>"
