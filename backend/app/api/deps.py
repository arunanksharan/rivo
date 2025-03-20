"""
API dependencies for the application.

This module defines dependencies that can be used in API endpoints.
"""
from typing import AsyncGenerator, Optional

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.services.openai_service import OpenAIService
from app.services.storage import StorageService
from app.services.supabase import SupabaseUser, get_current_user


async def get_current_active_user(
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> User:
    """
    Get current active user from database.
    
    This dependency gets the current authenticated user from the database
    and checks if the user is active.
    
    Args:
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        User: Current active user
        
    Raises:
        HTTPException: If user not found or inactive
    """
    result = await db.execute(
        select(User).where(User.supabase_id == current_user.id)
    )
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in database",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    
    return user


def get_openai_service() -> OpenAIService:
    """
    Get OpenAI service instance.
    
    This dependency provides an instance of the OpenAI service.
    
    Returns:
        OpenAIService: OpenAI service instance
    """
    return OpenAIService(api_key=settings.openai_api_key)


def get_storage_service() -> StorageService:
    """
    Get storage service instance.
    
    This dependency provides an instance of the storage service.
    
    Returns:
        StorageService: Storage service instance
    """
    return StorageService(
        storage_type=settings.storage_type,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        aws_region=settings.aws_region,
        aws_bucket_name=settings.aws_bucket_name,
        supabase_url=settings.supabase_url,
        supabase_key=settings.supabase_anon_key,
        supabase_bucket=settings.supabase_storage_bucket,
    )
