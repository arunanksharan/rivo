"""
Supabase service for authentication and storage.

This module provides functions to interact with Supabase for authentication
and token validation.
"""
from typing import Any, Dict, Optional

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Set up security scheme for JWT authentication
security = HTTPBearer()


class SupabaseUser:
    """Class representing a Supabase authenticated user."""
    
    def __init__(self, user_data: Dict[str, Any]):
        """Initialize user with data from Supabase JWT."""
        self.id: str = user_data.get("sub", "")
        self.email: str = user_data.get("email", "")
        self.role: str = user_data.get("role", "")
        self.app_metadata: Dict[str, Any] = user_data.get("app_metadata", {})
        self.user_metadata: Dict[str, Any] = user_data.get("user_metadata", {})
        self.raw_data: Dict[str, Any] = user_data


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> SupabaseUser:
    """
    Validate JWT token and return the current user.
    
    Args:
        credentials: HTTP Authorization credentials containing the JWT token
        
    Returns:
        SupabaseUser: Current authenticated user
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False},
        )
        
        logger.debug(f"JWT payload: {payload}")
        
        # Verify token has not expired
        if payload.get("exp") is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has no expiration",
            )
        
        # Create and return user object
        return SupabaseUser(payload)
        
    except JWTError as e:
        logger.error(f"JWT validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


async def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Supabase token by calling the Supabase Auth API.
    
    Args:
        token: JWT token to verify
        
    Returns:
        Dict[str, Any]: User data if token is valid
        
    Raises:
        HTTPException: If token is invalid or verification fails
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.SUPABASE_KEY,
                },
            )
            
            if response.status_code != 200:
                logger.error(f"Supabase token verification failed: {response.text}")
                return None
            
            return response.json()
            
    except Exception as e:
        logger.error(f"Error verifying Supabase token: {str(e)}")
        return None
