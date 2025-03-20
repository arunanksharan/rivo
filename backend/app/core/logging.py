import logging
import sys
from typing import Any, Dict, Optional

import structlog
from loguru import logger

from app.core.config import settings


class InterceptHandler(logging.Handler):
    """
    Intercepts standard logging and redirects to loguru.
    
    This allows us to capture logs from libraries that use standard logging
    and process them through loguru.
    """
    
    def emit(self, record: logging.LogRecord) -> None:
        """Intercept log records and pass to loguru."""
        # Get corresponding loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        
        # Find caller from where the logged message originated
        frame, depth = sys._getframe(6), 6
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1
        
        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logging() -> None:
    """Configure logging for the application."""
    # Set loguru log level
    log_level = settings.LOG_LEVEL.upper()
    
    # Configure loguru
    logger.configure(
        handlers=[
            {
                "sink": sys.stdout,
                "format": "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
                "level": log_level,
                "colorize": True,
            }
        ],
    )
    
    # Intercept standard logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Set log level for other libraries
    for logger_name in [
        "uvicorn",
        "uvicorn.error",
        "uvicorn.access",
        "fastapi",
        "sqlalchemy.engine",
    ]:
        logging.getLogger(logger_name).setLevel(log_level)


def get_logger(name: str) -> Any:
    """Get a structured logger with the given name."""
    return structlog.get_logger(name)
