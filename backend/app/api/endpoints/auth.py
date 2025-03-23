"""
Authentication endpoints for the application.

This module defines the API endpoints for user authentication.
"""
import secrets
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.google_auth import (
    exchange_code_for_token,
    get_google_auth_url,
    get_google_user_info,
)

logger = get_logger(__name__)
router = APIRouter()

# OAuth2 password bearer for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# Token response model
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


# Google auth request model
class GoogleAuthRequest(BaseModel):
    code: str
    redirect_uri: str


# Refresh token request model
class RefreshTokenRequest(BaseModel):
    refresh_token: str


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """
    Get the current authenticated user from the JWT token.
    
    Args:
        db: Database session
        token: JWT token
        
    Returns:
        User: Current authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


@router.post("/register", response_model=Token)
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Register a new user with email and password.
    
    Args:
        user_data: User data for registration
        db: Database session
        
    Returns:
        Token: JWT tokens for the registered user
        
    Raises:
        HTTPException: If user already exists or registration fails
    """
    logger.info(f"Registering user with email: {user_data.email}")
    
    # Check if user already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalars().first()
    
    if existing_user:
        logger.warning(f"User already exists with email: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name or "",
        auth_provider="email",
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    logger.info(f"User registered successfully with ID: {new_user.id}")
    
    # Create tokens
    access_token = create_access_token({"sub": str(new_user.id)})
    refresh_token = create_refresh_token({"sub": str(new_user.id)})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Authenticate a user with email and password.
    
    Args:
        form_data: OAuth2 password request form
        db: Database session
        
    Returns:
        Token: JWT tokens for the authenticated user
        
    Raises:
        HTTPException: If authentication fails
    """
    logger.info(f"Login attempt for user: {form_data.username}")
    
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == form_data.username)
    )
    user = result.scalars().first()
    
    # Verify user and password
    if not user or not verify_password(form_data.password, user.hashed_password or ""):
        logger.warning(f"Invalid login credentials for: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    logger.info(f"User logged in successfully: {user.email}")
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.get("/google/auth-url")
async def google_auth_url(request: Request) -> Dict[str, str]:
    """
    Get Google OAuth authorization URL.
    
    Args:
        request: FastAPI request object
        
    Returns:
        Dict[str, str]: Authorization URL and state
    """
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Generate redirect URI based on the frontend URL
    redirect_uri = f"{settings.frontend_url}/auth/callback"
    
    # Get Google auth URL
    auth_url = await get_google_auth_url(redirect_uri, state)
    
    return {
        "auth_url": auth_url,
        "state": state,
    }


@router.post("/google/callback", response_model=Token)
async def google_callback(
    request: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Handle Google OAuth callback.
    
    Args:
        request: Google auth request with code and redirect URI
        db: Database session
        
    Returns:
        Token: JWT tokens for the authenticated user
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        # Exchange code for token
        token_data = await exchange_code_for_token(request.code, request.redirect_uri)
        
        # Get user info from Google
        user_info = await get_google_user_info(token_data["access_token"])
        
        # Check if user exists
        result = await db.execute(
            select(User).where(User.email == user_info["email"])
        )
        user = result.scalars().first()
        
        if not user:
            # Create new user
            user = User(
                email=user_info["email"],
                full_name=user_info.get("name", ""),
                auth_provider="google",
                google_id=user_info["sub"],
            )
            
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
            logger.info(f"New Google user created: {user.email}")
        else:
            # Update existing user's Google ID if not set
            if not user.google_id:
                user.google_id = user_info["sub"]
                user.auth_provider = "google"
                await db.commit()
                logger.info(f"Updated Google ID for user: {user.email}")
        
        # Create tokens
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )
    
    except Exception as e:
        logger.error(f"Google authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google authentication failed",
        )


@router.post("/refresh-token", response_model=Token)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Refresh access token using refresh token.
    
    Args:
        request: Refresh token request
        db: Database session
        
    Returns:
        Token: New JWT tokens
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    payload = verify_token(request.refresh_token)
    if not payload or payload.get("token_type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    # Verify user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Create new tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Current user data
    """
    return current_user
