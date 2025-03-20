"""
Tests for the User model.

This module contains tests for the User model.
"""
import uuid
from datetime import datetime

import pytest
from sqlalchemy import select

from app.models.user import User


@pytest.mark.asyncio
async def test_create_user(test_db):
    """Test creating a user."""
    # Create a new user
    user = User(
        email="test@example.com",
        full_name="Test User",
        supabase_id="test-supabase-id",
    )
    
    # Add to database
    test_db.add(user)
    await test_db.commit()
    
    # Query the user
    result = await test_db.execute(select(User).where(User.email == "test@example.com"))
    db_user = result.scalars().first()
    
    # Check that the user was created correctly
    assert db_user is not None
    assert db_user.email == "test@example.com"
    assert db_user.full_name == "Test User"
    assert db_user.supabase_id == "test-supabase-id"
    assert db_user.is_active is True
    assert isinstance(db_user.id, uuid.UUID)
    assert isinstance(db_user.created_at, datetime)
    assert isinstance(db_user.updated_at, datetime)


@pytest.mark.asyncio
async def test_user_relationships(test_db):
    """Test user relationships."""
    # Create a new user
    user = User(
        email="test@example.com",
        full_name="Test User",
        supabase_id="test-supabase-id",
    )
    
    # Add to database
    test_db.add(user)
    await test_db.commit()
    
    # Check that the user has the expected relationships
    assert hasattr(user, "properties")
    assert hasattr(user, "voice_settings")
    assert hasattr(user, "email_templates")
    
    # Check that the relationships are empty lists
    assert user.properties == []
    assert user.voice_settings == []
    assert user.email_templates == []
