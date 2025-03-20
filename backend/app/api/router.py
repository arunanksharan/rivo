"""
Main API router for the application.

This module sets up the main API router and includes all endpoint routers.
"""
from fastapi import APIRouter

from app.api.endpoints import auth, properties, users, voice

# Create main API router
api_router = APIRouter(prefix="/api")

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(properties.router, prefix="/properties", tags=["Properties"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice Assistant"])
