"""
User management endpoints for the application.

This module defines the API endpoints for user management.
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.supabase import SupabaseUser, get_current_user

logger = get_logger(__name__)
router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Get list of users.
    
    This endpoint returns a list of users with pagination.
    
    Args:
        skip: Number of users to skip
        limit: Maximum number of users to return
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        List[UserResponse]: List of users
    """
    logger.info(f"Getting users list (skip={skip}, limit={limit})")
    
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Get user by ID.
    
    This endpoint returns a user by their ID.
    
    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        UserResponse: User data
        
    Raises:
        HTTPException: If user not found
    """
    logger.info(f"Getting user with ID: {user_id}")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        logger.warning(f"User not found with ID: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Update user.
    
    This endpoint updates a user's information.
    
    Args:
        user_id: User ID
        user_data: Updated user data
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        UserResponse: Updated user data
        
    Raises:
        HTTPException: If user not found or update fails
    """
    logger.info(f"Updating user with ID: {user_id}")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        logger.warning(f"User not found with ID: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Update user data
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    logger.info(f"User updated successfully: {user.id}")
    
    return user
