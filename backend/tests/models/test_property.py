"""
Tests for the Property model.

This module contains tests for the Property model.
"""
import uuid
from datetime import datetime

import pytest
from sqlalchemy import select

from app.models.property import Property
from app.models.user import User


@pytest.mark.asyncio
async def test_create_property(test_db):
    """Test creating a property."""
    # Create a user first
    user = User(
        email="test@example.com",
        full_name="Test User",
        supabase_id="test-supabase-id",
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    
    # Create a new property
    property = Property(
        user_id=user.id,
        title="Test Property",
        description="A test property",
        category="apartment",
        address="123 Test St",
        city="Test City",
        state="Test State",
        zip_code="12345",
        country="Test Country",
        latitude=40.7128,
        longitude=-74.0060,
        price=500000.0,
        bedrooms=2.0,
        bathrooms=2.0,
        square_feet=1200.0,
        year_built=2020,
        features=["feature1", "feature2"],
    )
    
    # Add to database
    test_db.add(property)
    await test_db.commit()
    
    # Query the property
    result = await test_db.execute(select(Property).where(Property.title == "Test Property"))
    db_property = result.scalars().first()
    
    # Check that the property was created correctly
    assert db_property is not None
    assert db_property.title == "Test Property"
    assert db_property.description == "A test property"
    assert db_property.category == "apartment"
    assert db_property.address == "123 Test St"
    assert db_property.city == "Test City"
    assert db_property.state == "Test State"
    assert db_property.zip_code == "12345"
    assert db_property.country == "Test Country"
    assert db_property.latitude == 40.7128
    assert db_property.longitude == -74.0060
    assert db_property.price == 500000.0
    assert db_property.bedrooms == 2.0
    assert db_property.bathrooms == 2.0
    assert db_property.square_feet == 1200.0
    assert db_property.year_built == 2020
    assert db_property.features == ["feature1", "feature2"]
    assert db_property.is_published is True
    assert isinstance(db_property.id, uuid.UUID)
    assert isinstance(db_property.created_at, datetime)
    assert isinstance(db_property.updated_at, datetime)


@pytest.mark.asyncio
async def test_property_relationships(test_db):
    """Test property relationships."""
    # Create a user first
    user = User(
        email="test@example.com",
        full_name="Test User",
        supabase_id="test-supabase-id",
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    
    # Create a new property
    property = Property(
        user_id=user.id,
        title="Test Property",
        category="apartment",
    )
    
    # Add to database
    test_db.add(property)
    await test_db.commit()
    
    # Check that the property has the expected relationships
    assert hasattr(property, "user")
    assert hasattr(property, "images")
    
    # Check that the user relationship is set correctly
    assert property.user.id == user.id
    
    # Check that the images relationship is an empty list
    assert property.images == []
