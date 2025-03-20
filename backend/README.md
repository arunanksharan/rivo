# Rivo Backend API

The backend API for the Rivo Real Estate Application, built with FastAPI, SQLAlchemy, and Pydantic.

## Features

- User authentication via Supabase
- Property inventory management
- Voice assistant features
- Image processing with AI-generated descriptions
- Email and calendar integration

## Project Structure

```
backend/
├── app/                    # Application package
│   ├── api/                # API endpoints and dependencies
│   │   ├── endpoints/      # API route handlers
│   │   └── dependencies/   # Dependency injection functions
│   ├── core/               # Core application components
│   ├── db/                 # Database models and session management
│   ├── models/             # SQLAlchemy ORM models
│   ├── schemas/            # Pydantic models for request/response validation
│   ├── services/           # Business logic and external service integrations
│   └── utils/              # Utility functions
├── tests/                  # Test suite
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── pyproject.toml          # Poetry dependency management
├── .env                    # Environment variables (not in version control)
└── README.md               # Project documentation
```

## Setup

### Prerequisites

- Python 3.9+
- Poetry (dependency management)
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies with Poetry:

```bash
cd rivo/backend
poetry install
```

3. Create a `.env` file based on the `.env.example` template

### Running the Application

```bash
# Development mode
poetry run uvicorn app.main:app --reload

# Production mode
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
# Run all tests
poetry run pytest

# Run with coverage report
poetry run pytest --cov=app tests/
```

## Code Quality

This project uses:

- Black for code formatting
- Ruff for linting
- MyPy for static type checking
- Pre-commit hooks for enforcing code quality

To set up pre-commit hooks:

```bash
poetry run pre-commit install
```
