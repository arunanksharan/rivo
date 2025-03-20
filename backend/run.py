"""
Entry point script for running the application.

This script provides a convenient way to run the application
with uvicorn server.
"""
import uvicorn

from app.core.config import settings

if __name__ == "__main__":
    """Run the application with uvicorn server."""
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.api_port,
        reload=settings.environment != "production",
        log_level="info",
    )
