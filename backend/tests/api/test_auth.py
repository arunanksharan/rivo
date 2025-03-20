"""
Tests for the authentication endpoints.

This module contains tests for the authentication API endpoints.
"""
import pytest
from fastapi import status
from unittest.mock import AsyncMock, patch

from app.models.user import User
from app.schemas.user import UserCreate


@pytest.mark.asyncio
async def test_register_user(client, test_db, mock_supabase_user):
    """Test registering a new user."""
    # Mock the get_current_user dependency
    with patch("app.api.endpoints.auth.get_current_user", return_value=AsyncMock(
        id=mock_supabase_user["id"],
        email=mock_supabase_user["email"],
        user_metadata=mock_supabase_user["user_metadata"],
    )):
        # Send registration request
        response = await client.post(
            "/api/auth/register",
            json={
                "email": mock_supabase_user["email"],
                "full_name": mock_supabase_user["user_metadata"]["full_name"],
                "supabase_id": mock_supabase_user["id"],
            },
        )
        
        # Check response
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == mock_supabase_user["email"]
        assert data["full_name"] == mock_supabase_user["user_metadata"]["full_name"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data


@pytest.mark.asyncio
async def test_get_current_user_info(client, test_db, mock_supabase_user):
    """Test getting current user information."""
    # Create a user in the database
    user = User(
        email=mock_supabase_user["email"],
        full_name=mock_supabase_user["user_metadata"]["full_name"],
        supabase_id=mock_supabase_user["id"],
    )
    test_db.add(user)
    await test_db.commit()
    
    # Mock the get_current_user dependency
    with patch("app.api.endpoints.auth.get_current_user", return_value=AsyncMock(
        id=mock_supabase_user["id"],
        email=mock_supabase_user["email"],
        user_metadata=mock_supabase_user["user_metadata"],
    )):
        # Send request to get current user info
        response = await client.get("/api/auth/me")
        
        # Check response
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == mock_supabase_user["email"]
        assert data["full_name"] == mock_supabase_user["user_metadata"]["full_name"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data


@pytest.mark.asyncio
async def test_get_current_user_info_not_found(client, test_db, mock_supabase_user):
    """Test getting current user information when user not found."""
    # Mock the get_current_user dependency
    with patch("app.api.endpoints.auth.get_current_user", return_value=AsyncMock(
        id=mock_supabase_user["id"],
        email=mock_supabase_user["email"],
        user_metadata=mock_supabase_user["user_metadata"],
    )):
        # Send request to get current user info
        response = await client.get("/api/auth/me")
        
        # Check response
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "User not found in database"
