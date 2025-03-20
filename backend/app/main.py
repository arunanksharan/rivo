"""
Main application module.

This module initializes and configures the FastAPI application.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.db.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for the FastAPI application.
    
    This function handles startup and shutdown events.
    
    Args:
        app: FastAPI application
    """
    # Startup
    configure_logging()
    logging.info("Starting Rivo API server")
    
    # Initialize database
    await init_db()
    
    yield
    
    # Shutdown
    logging.info("Shutting down Rivo API server")


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured FastAPI application
    """
    app = FastAPI(
        title=settings.project_name,
        description=settings.project_description,
        version=settings.project_version,
        docs_url=None,
        redoc_url=None,
        openapi_url=f"{settings.api_prefix}/openapi.json" if settings.environment != "production" else None,
        lifespan=lifespan,
    )
    
    # Set up CORS
    if settings.backend_cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.backend_cors_origins],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Include API router
    app.include_router(api_router, prefix=settings.api_prefix)
    
    # Custom documentation endpoints
    @app.get("/docs", include_in_schema=False)
    async def custom_swagger_ui_html():
        """
        Custom Swagger UI endpoint.
        
        Returns:
            HTML: Swagger UI HTML
        """
        return get_swagger_ui_html(
            openapi_url=f"{settings.api_prefix}/openapi.json",
            title=f"{settings.project_name} - API Documentation",
            swagger_favicon_url="",
        )
    
    @app.get("/api-schema", include_in_schema=False)
    async def get_openapi_schema():
        """
        Get OpenAPI schema.
        
        Returns:
            dict: OpenAPI schema
        """
        return get_openapi(
            title=settings.project_name,
            version=settings.project_version,
            description=settings.project_description,
            routes=app.routes,
        )
    
    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment != "production",
    )
