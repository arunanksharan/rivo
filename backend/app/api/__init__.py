"""
API package initialization.

This module imports all API modules to make them available
when importing from the API package.
"""

from app.api.deps import (
    get_current_active_user,
    get_openai_service,
    get_storage_service,
)
from app.api.router import api_router

__all__ = [
    "api_router",
    "get_current_active_user",
    "get_openai_service",
    "get_storage_service",
]
