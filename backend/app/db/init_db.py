"""
Database initialization script.

This module contains functions to initialize the database with required tables
and seed data if needed.
"""
import asyncio
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.db.session import AsyncSessionLocal

# Import all models to ensure they are registered with SQLAlchemy
from app.models import *  # noqa

logger = get_logger(__name__)


async def init_db() -> None:
    """Initialize database with required tables and seed data."""
    logger.info("Initializing database")
    
    async with AsyncSessionLocal() as session:
        await create_initial_data(session)
    
    logger.info("Database initialization completed")


async def create_initial_data(session: AsyncSession) -> None:
    """
    Create initial data in the database.
    
    This function is used to seed the database with any required initial data.
    """
    # Add seed data here if needed
    pass


if __name__ == "__main__":
    """
    Run database initialization when script is executed directly.
    """
    logger.info("Running database initialization script")
    asyncio.run(init_db())
