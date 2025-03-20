"""
Property management endpoints for the application.

This module defines the API endpoints for property management.
"""
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.logging import get_logger
from app.db.session import get_db
from app.models.property import Property
from app.models.property_image import PropertyImage
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyResponse, PropertyUpdate
from app.schemas.property_image import PropertyImageCreate, PropertyImageResponse
from app.services.openai_service import OpenAIService
from app.services.storage import StorageService
from app.services.supabase import SupabaseUser, get_current_user

logger = get_logger(__name__)
router = APIRouter()


@router.post("/", response_model=PropertyResponse)
async def create_property(
    property_data: PropertyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Create a new property.
    
    This endpoint creates a new property for the current user.
    
    Args:
        property_data: Property data
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        PropertyResponse: Created property data
    """
    logger.info(f"Creating property for user: {current_user.id}")
    
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
    
    # Create new property
    new_property = Property(
        **property_data.model_dump(),
        user_id=db_user.id,
    )
    
    db.add(new_property)
    await db.commit()
    await db.refresh(new_property)
    
    logger.info(f"Property created successfully: {new_property.id}")
    
    return new_property


@router.get("/", response_model=List[PropertyResponse])
async def get_properties(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[float] = None,
    bathrooms: Optional[float] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[SupabaseUser] = Depends(get_current_user),
) -> Any:
    """
    Get properties with filtering and pagination.
    
    This endpoint returns a list of properties with optional filtering.
    
    Args:
        skip: Number of properties to skip
        limit: Maximum number of properties to return
        category: Filter by property category
        min_price: Filter by minimum price
        max_price: Filter by maximum price
        bedrooms: Filter by number of bedrooms
        bathrooms: Filter by number of bathrooms
        city: Filter by city
        state: Filter by state
        search: Search term for title and description
        db: Database session
        current_user: Current authenticated Supabase user (optional)
        
    Returns:
        List[PropertyResponse]: List of properties
    """
    logger.info("Getting properties with filters")
    
    # Build query
    query = select(Property).options(
        joinedload(Property.images)
    ).where(Property.is_published == True)
    
    # Apply filters
    if category:
        query = query.where(Property.category == category)
    if min_price is not None:
        query = query.where(Property.price >= min_price)
    if max_price is not None:
        query = query.where(Property.price <= max_price)
    if bedrooms is not None:
        query = query.where(Property.bedrooms == bedrooms)
    if bathrooms is not None:
        query = query.where(Property.bathrooms == bathrooms)
    if city:
        query = query.where(Property.city.ilike(f"%{city}%"))
    if state:
        query = query.where(Property.state.ilike(f"%{state}%"))
    if search:
        query = query.where(
            (Property.title.ilike(f"%{search}%")) | 
            (Property.description.ilike(f"%{search}%"))
        )
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    properties = result.unique().scalars().all()
    
    # Add image count and primary image URL to each property
    for prop in properties:
        primary_image = next((img for img in prop.images if img.is_primary), None)
        prop.primary_image_url = primary_image.url if primary_image else None
        prop.image_count = len(prop.images)
    
    return properties


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[SupabaseUser] = Depends(get_current_user),
) -> Any:
    """
    Get property by ID.
    
    This endpoint returns a property by its ID.
    
    Args:
        property_id: Property ID
        db: Database session
        current_user: Current authenticated Supabase user (optional)
        
    Returns:
        PropertyResponse: Property data
        
    Raises:
        HTTPException: If property not found
    """
    logger.info(f"Getting property with ID: {property_id}")
    
    # Get property with images
    result = await db.execute(
        select(Property)
        .options(joinedload(Property.images))
        .where(Property.id == property_id)
    )
    property = result.unique().scalars().first()
    
    if not property:
        logger.warning(f"Property not found with ID: {property_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )
    
    # Check if property is published or belongs to current user
    if not property.is_published:
        if not current_user:
            logger.warning(f"Unauthorized access to unpublished property: {property_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Property is not published",
            )
        
        # Get user from database
        user_result = await db.execute(
            select(User).where(User.supabase_id == current_user.id)
        )
        db_user = user_result.scalars().first()
        
        if not db_user or property.user_id != db_user.id:
            logger.warning(f"Unauthorized access to unpublished property: {property_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Property is not published",
            )
    
    # Add image count and primary image URL
    primary_image = next((img for img in property.images if img.is_primary), None)
    property.primary_image_url = primary_image.url if primary_image else None
    property.image_count = len(property.images)
    
    return property


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: str,
    property_data: PropertyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Update property.
    
    This endpoint updates a property's information.
    
    Args:
        property_id: Property ID
        property_data: Updated property data
        db: Database session
        current_user: Current authenticated Supabase user
        
    Returns:
        PropertyResponse: Updated property data
        
    Raises:
        HTTPException: If property not found or update fails
    """
    logger.info(f"Updating property with ID: {property_id}")
    
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
    
    # Get property
    result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property = result.scalars().first()
    
    if not property:
        logger.warning(f"Property not found with ID: {property_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )
    
    # Check if property belongs to current user
    if property.user_id != db_user.id:
        logger.warning(f"Unauthorized update attempt for property: {property_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this property",
        )
    
    # Update property data
    update_data = property_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property, field, value)
    
    await db.commit()
    await db.refresh(property)
    
    logger.info(f"Property updated successfully: {property.id}")
    
    return property


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
) -> Any:
    """
    Delete property.
    
    This endpoint deletes a property.
    
    Args:
        property_id: Property ID
        db: Database session
        current_user: Current authenticated Supabase user
        
    Raises:
        HTTPException: If property not found or delete fails
    """
    logger.info(f"Deleting property with ID: {property_id}")
    
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
    
    # Get property
    result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property = result.scalars().first()
    
    if not property:
        logger.warning(f"Property not found with ID: {property_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )
    
    # Check if property belongs to current user
    if property.user_id != db_user.id:
        logger.warning(f"Unauthorized delete attempt for property: {property_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this property",
        )
    
    # Delete property
    await db.delete(property)
    await db.commit()
    
    logger.info(f"Property deleted successfully: {property_id}")


@router.post("/{property_id}/images", response_model=PropertyImageResponse)
async def upload_property_image(
    property_id: str,
    caption: Optional[str] = None,
    is_primary: bool = False,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: SupabaseUser = Depends(get_current_user),
    storage_service: StorageService = Depends(StorageService),
    openai_service: OpenAIService = Depends(OpenAIService),
) -> Any:
    """
    Upload property image.
    
    This endpoint uploads an image for a property.
    
    Args:
        property_id: Property ID
        caption: Optional image caption
        is_primary: Whether this is the primary image
        file: Image file
        db: Database session
        current_user: Current authenticated Supabase user
        storage_service: Storage service for file uploads
        openai_service: OpenAI service for generating image descriptions
        
    Returns:
        PropertyImageResponse: Uploaded image data
        
    Raises:
        HTTPException: If property not found or upload fails
    """
    logger.info(f"Uploading image for property: {property_id}")
    
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
    
    # Get property
    result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property = result.scalars().first()
    
    if not property:
        logger.warning(f"Property not found with ID: {property_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )
    
    # Check if property belongs to current user
    if property.user_id != db_user.id:
        logger.warning(f"Unauthorized image upload for property: {property_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload images for this property",
        )
    
    # Upload file to storage
    storage_path = f"properties/{property_id}/{file.filename}"
    url = await storage_service.upload_file(file, storage_path)
    
    # Generate AI description of the image
    try:
        ai_description = await openai_service.generate_image_description(url)
    except Exception as e:
        logger.error(f"Error generating AI description: {str(e)}")
        ai_description = None
    
    # If this is the primary image, update all other images
    if is_primary:
        # Get all property images
        images_result = await db.execute(
            select(PropertyImage).where(PropertyImage.property_id == property_id)
        )
        existing_images = images_result.scalars().all()
        
        # Set all to non-primary
        for img in existing_images:
            img.is_primary = False
    
    # Create new property image
    new_image = PropertyImage(
        property_id=property_id,
        storage_path=storage_path,
        url=url,
        caption=caption,
        is_primary=is_primary,
        ai_generated_description=ai_description,
    )
    
    db.add(new_image)
    await db.commit()
    await db.refresh(new_image)
    
    logger.info(f"Image uploaded successfully: {new_image.id}")
    
    return new_image


@router.get("/{property_id}/images", response_model=List[PropertyImageResponse])
async def get_property_images(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[SupabaseUser] = Depends(get_current_user),
) -> Any:
    """
    Get property images.
    
    This endpoint returns all images for a property.
    
    Args:
        property_id: Property ID
        db: Database session
        current_user: Current authenticated Supabase user (optional)
        
    Returns:
        List[PropertyImageResponse]: List of property images
        
    Raises:
        HTTPException: If property not found
    """
    logger.info(f"Getting images for property: {property_id}")
    
    # Get property
    property_result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property = property_result.scalars().first()
    
    if not property:
        logger.warning(f"Property not found with ID: {property_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )
    
    # Check if property is published or belongs to current user
    if not property.is_published and current_user:
        # Get user from database
        user_result = await db.execute(
            select(User).where(User.supabase_id == current_user.id)
        )
        db_user = user_result.scalars().first()
        
        if not db_user or property.user_id != db_user.id:
            logger.warning(f"Unauthorized access to unpublished property images: {property_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Property is not published",
            )
    
    # Get images
    result = await db.execute(
        select(PropertyImage)
        .where(PropertyImage.property_id == property_id)
        .order_by(PropertyImage.is_primary.desc(), PropertyImage.created_at)
    )
    images = result.scalars().all()
    
    return images
