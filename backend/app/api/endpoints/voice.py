"""
Voice assistant endpoints for the application.

This module defines the API endpoints for voice assistant functionality.
"""
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.db.session import get_db
from app.models.user import User
from app.models.voice_setting import VoiceSetting
from app.schemas.voice_setting import (
    VoiceSettingCreate,
    VoiceSettingResponse,
    VoiceSettingUpdate,
)
from app.services.openai_service import OpenAIService
from app.services.storage import StorageService
from app.services.supabase import SupabaseUser, get_current_user

logger = get_logger(__name__)
router = APIRouter()


@router.post("/settings", response_model=VoiceSettingResponse)
async def create_voice_settings(
    settings_data: VoiceSettingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Create voice assistant settings.
    
    This endpoint creates voice assistant settings for the current user.
    
    Args:
        settings_data: Voice settings data
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        VoiceSettingResponse: Created voice settings data
    """
    logger.info(f"Creating voice settings for user: {current_user.id}")
    
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
    
    # Check if user already has voice settings
    settings_result = await db.execute(
        select(VoiceSetting).where(VoiceSetting.user_id == db_user.id)
    )
    existing_settings = settings_result.scalars().first()
    
    if existing_settings:
        logger.info(f"User already has voice settings: {existing_settings.id}")
        return existing_settings
    
    # Create new voice settings
    new_settings = VoiceSetting(
        **settings_data.model_dump(),
        user_id=db_user.id,
    )
    
    db.add(new_settings)
    await db.commit()
    await db.refresh(new_settings)
    
    logger.info(f"Voice settings created successfully: {new_settings.id}")
    
    return new_settings


@router.get("/settings", response_model=VoiceSettingResponse)
async def get_voice_settings(
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Get voice assistant settings.
    
    This endpoint returns voice assistant settings for the current user.
    
    Args:
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        VoiceSettingResponse: Voice settings data
        
    Raises:
        HTTPException: If settings not found
    """
    logger.info(f"Getting voice settings for user: {current_user.id}")
    
    # Get user from database
    user_result = await db.execute(
        select(User).where(User.supabase_id == current_user.id)
    )
    db_user = user_result.scalars().first()
    
    if not db_user:
        logger.warning(f"User not found in database for Supabase ID: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in database",
        )
    
    # Get voice settings
    result = await db.execute(
        select(VoiceSetting).where(VoiceSetting.user_id == db_user.id)
    )
    settings = result.scalars().first()
    
    if not settings:
        logger.warning(f"Voice settings not found for user: {db_user.id}")
        
        # Create default settings
        settings = VoiceSetting(user_id=db_user.id)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        
        logger.info(f"Default voice settings created: {settings.id}")
    
    return settings


@router.put("/settings", response_model=VoiceSettingResponse)
async def update_voice_settings(
    settings_data: VoiceSettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Update voice assistant settings.
    
    This endpoint updates voice assistant settings for the current user.
    
    Args:
        settings_data: Updated voice settings data
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        VoiceSettingResponse: Updated voice settings data
        
    Raises:
        HTTPException: If settings not found or update fails
    """
    logger.info(f"Updating voice settings for user: {current_user.id}")
    
    # Get user from database
    user_result = await db.execute(
        select(User).where(User.supabase_id == current_user.id)
    )
    db_user = user_result.scalars().first()
    
    if not db_user:
        logger.warning(f"User not found in database for Supabase ID: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in database",
        )
    
    # Get voice settings
    result = await db.execute(
        select(VoiceSetting).where(VoiceSetting.user_id == db_user.id)
    )
    settings = result.scalars().first()
    
    if not settings:
        logger.warning(f"Voice settings not found for user: {db_user.id}")
        
        # Create new settings with provided data
        new_settings = VoiceSetting(
            **settings_data.model_dump(exclude_unset=True),
            user_id=db_user.id,
        )
        
        db.add(new_settings)
        await db.commit()
        await db.refresh(new_settings)
        
        logger.info(f"Voice settings created during update: {new_settings.id}")
        
        return new_settings
    
    # Update settings data
    update_data = settings_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    await db.commit()
    await db.refresh(settings)
    
    logger.info(f"Voice settings updated successfully: {settings.id}")
    
    return settings


@router.post("/command", response_model=Dict[str, Any])
async def process_voice_command(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
    openai_service: OpenAIService = Depends(OpenAIService),
    storage_service: StorageService = Depends(StorageService),
) -> Any:
    """
    Process voice command.
    
    This endpoint processes a voice command from the user.
    
    Args:
        file: Audio file containing the voice command
        db: Database session
        current_user: Current authenticated Supabase user
        openai_service: OpenAI service for processing voice commands
        storage_service: Storage service for file uploads
        
    Returns:
        Dict[str, Any]: Response to the voice command
        
    Raises:
        HTTPException: If processing fails
    """
    logger.info(f"Processing voice command for user: {current_user.id}")
    
    # Get user from database
    user_result = await db.execute(
        select(User).where(User.supabase_id == current_user.id)
    )
    db_user = user_result.scalars().first()
    
    if not db_user:
        logger.warning(f"User not found in database for Supabase ID: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in database",
        )
    
    try:
        # Upload audio file to storage
        storage_path = f"voice_commands/{db_user.id}/{file.filename}"
        audio_url = await storage_service.upload_file(file, storage_path)
        
        # Process voice command
        command_text = await openai_service.transcribe_audio(audio_url)
        response = await openai_service.process_voice_command(command_text, db_user.id)
        
        logger.info(f"Voice command processed successfully: {command_text}")
        
        return {
            "command": command_text,
            "response": response,
            "success": True,
        }
        
    except Exception as e:
        logger.error(f"Error processing voice command: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing voice command: {str(e)}",
        )
