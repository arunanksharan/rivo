"""
Test configuration for pytest.

This module provides fixtures for testing the application.
"""
import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.main import create_application


# Use an in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """
    Create an instance of the default event loop for each test case.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """
    Create a test database engine.
    """
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True,
        poolclass=NullPool,
    )
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """
    Create a test database session.
    """
    # Create a new session for each test
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        # Roll back any changes made during the test
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def app(test_db) -> FastAPI:
    """
    Create a test FastAPI application.
    """
    app = create_application()
    
    # Override the get_db dependency to use the test database
    async def override_get_db():
        yield test_db
    
    app.dependency_overrides[get_db] = override_get_db
    
    return app


@pytest_asyncio.fixture(scope="function")
async def client(app) -> AsyncGenerator[AsyncClient, None]:
    """
    Create a test client for the FastAPI application.
    """
    async with AsyncClient(app=app, base_url=f"http://test{settings.api_prefix}") as client:
        yield client


@pytest_asyncio.fixture(scope="function")
async def mock_supabase_user():
    """
    Create a mock Supabase user for testing.
    """
    return {
        "id": "test-supabase-id",
        "email": "test@example.com",
        "user_metadata": {
            "full_name": "Test User",
        },
    }
