"""
Google OAuth service for authentication.

This module provides functions to handle Google OAuth authentication flow.
"""
import json
from typing import Dict, Optional, Any

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Google OAuth endpoints
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


async def get_google_auth_url(redirect_uri: str, state: str) -> str:
    """
    Generate Google OAuth authorization URL.
    
    Args:
        redirect_uri: URL to redirect to after authentication
        state: State parameter for CSRF protection
        
    Returns:
        str: Google OAuth authorization URL
    """
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "email profile",
        "access_type": "offline",
        "prompt": "consent",
        "state": state
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return f"{GOOGLE_AUTH_URL}?{query_string}"


async def exchange_code_for_token(code: str, redirect_uri: str) -> Dict[str, Any]:
    """
    Exchange authorization code for access and refresh tokens.
    
    Args:
        code: Authorization code from Google
        redirect_uri: Redirect URI used in the authorization request
        
    Returns:
        Dict[str, Any]: Token response containing access_token, refresh_token, etc.
        
    Raises:
        HTTPException: If token exchange fails
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Google token exchange failed: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to exchange code for token"
                )
                
            return response.json()
    except Exception as e:
        logger.error(f"Error exchanging code for token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during token exchange"
        )


async def get_google_user_info(access_token: str) -> Dict[str, Any]:
    """
    Get user information from Google using access token.
    
    Args:
        access_token: Google OAuth access token
        
    Returns:
        Dict[str, Any]: User information from Google
        
    Raises:
        HTTPException: If user info retrieval fails
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if response.status_code != 200:
                logger.error(f"Google user info retrieval failed: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to retrieve user information"
                )
                
            return response.json()
    except Exception as e:
        logger.error(f"Error retrieving Google user info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during user info retrieval"
        )
