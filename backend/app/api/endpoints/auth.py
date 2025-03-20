"""
Authentication endpoints for the application.

This module defines the API endpoints for user authentication.
"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.supabase import SupabaseUser, get_current_user

logger = get_logger(__name__)
router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Register a new user after Supabase authentication.
    
    This endpoint is called after the user has authenticated with Supabase on the frontend.
    It creates a new user record in our database linked to the Supabase user.
    
    Args:
        user_data: User data for registration
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        UserResponse: Created user data
        
    Raises:
        HTTPException: If user already exists or registration fails
    """
    logger.info(f"Registering user with Supabase ID: {current_user.id}")
    
    # Check if user already exists in our database
    result = await db.execute(
        select(User).where(User.supabase_id == current_user.id)
    )
    existing_user = result.scalars().first()
    
    if existing_user:
        logger.info(f"User already exists with Supabase ID: {current_user.id}")
        return existing_user
    
    # Create new user in our database
    new_user = User(
        supabase_id=current_user.id,
        email=current_user.email,
        full_name=user_data.full_name or current_user.user_metadata.get("full_name", ""),
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    logger.info(f"User registered successfully with ID: {new_user.id}")
    
    return new_user


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Get current user information.
    
    This endpoint returns information about the currently authenticated user.
    
    Args:
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        UserResponse: Current user data
        
    Raises:
        HTTPException: If user not found in database
    """
    logger.info(f"Getting user info for Supabase ID: {current_user.id}")
    
    # Get user from database
    result = await db.execute(
        select(User).where(User.supabase_id == current_user.id)
    )
    db_user = result.scalars().first()
    
    if not db_user:
        logger.warning(f"User not found in database for Supabase ID: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in database",
        )
    
    return db_user
