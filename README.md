# Rivo - Voice-Based Real Estate Assistant

Rivo is a cutting-edge real estate mobile application that integrates voice assistant technology to provide a seamless property browsing and documentation experience.

## 🌟 Project Overview

Rivo transforms the real estate experience by combining traditional property browsing features with advanced voice-controlled functionality. The application allows users to search for properties, document visits, manage appointments, and interact with listings using natural voice commands.

## 🏗️ Architecture

This project follows a modern, clean architecture approach with the following components:

### Frontend (Mobile)
- **Framework**: React Native with Expo SDK 50
- **Language**: TypeScript 5.3.x
- **Navigation**: Expo Router
- **State Management**: React Query for server state, Context API for app state
- **Styling**: React Native's StyleSheet API
- **HTTP Client**: Axios
- **Authentication**: Expo Auth Session + backend integration

### Backend (API)
- **Framework**: FastAPI
- **Language**: Python
- **Database ORM**: SQLAlchemy
- **API Documentation**: OpenAPI/Swagger
- **Dependency Management**: Poetry
- **Type Safety**: Pydantic v2

## 📱 Features

### Phase 1 Core Features
1. **User Authentication**
   - Email/password signup and login
   - Google OAuth integration
   - Password reset functionality
   - User profile management

2. **Property Browsing**
   - Property listing feed with filtering options
   - Search functionality with location-based results
   - Property detail pages with images, descriptions, and specifications
   - Map view of properties

3. **Favorites and Saved Searches**
   - Save favorite properties
   - Create and manage saved searches
   - Notifications for new properties matching saved criteria

4. **Basic User Profile**
   - View and edit profile information
   - Manage account settings
   - View saved properties and searches

5. **Property Inquiry**
   - Contact property agents/owners
   - Schedule property viewings
   - Submit inquiries about properties

### Voice Assistant Features
1. **Voice-Controlled Property Search**
   - Search for properties using voice commands
   - Natural language processing to understand complex queries
   - Voice-based filtering of search results

2. **Property Documentation via Camera**
   - Take photos of properties with automatic location tagging
   - Voice annotation of photos for personal notes
   - Automatic organization of property photos by location

3. **Voice-Controlled Calendar Management**
   - Schedule property viewings using voice commands
   - Set reminders for appointments with voice
   - Voice notifications for upcoming appointments

4. **Voice Notes and Dictation**
   - Record voice notes during property visits
   - Automatic transcription of voice notes to text
   - Voice-to-text for filling out property inquiry forms

## 🗂️ Project Structure

```
rivo/
├── mobile/                 # React Native mobile application
│   ├── app/                # Expo Router app directory
│   │   ├── (app)/          # Main app screens (authenticated)
│   │   ├── (auth)/         # Authentication screens
│   │   └── _layout.tsx     # Root layout configuration
│   ├── assets/             # Images, fonts, and other static files
│   ├── components/         # Reusable UI components
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services and integrations
│   │   ├── store/          # State management
│   │   ├── theme/          # Styling constants and theme
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── package.json        # Dependencies and scripts
│
├── backend/                # FastAPI backend application
│   ├── app/                # Main application package
│   │   ├── api/            # API routes and endpoints
│   │   ├── core/           # Core functionality and config
│   │   ├── db/             # Database models and migrations
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic services
│   ├── tests/              # Test suite
│   └── pyproject.toml      # Poetry dependencies
│
└── docs/                   # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Expo CLI
- Poetry (for backend)
- iOS Simulator or Android Emulator (for mobile development)

### Mobile Setup
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration values.

4. Start the development server:
   ```bash
   npx expo start
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies using Poetry:
   ```bash
   poetry install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration values.

4. Run the development server:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

## 🧪 Testing

### Mobile
```bash
cd mobile
npm test
```

### Backend
```bash
cd backend
poetry run pytest
```

## 📊 Code Quality Standards

### Frontend (React Native + TypeScript)
- Use TypeScript and TSX by default
- Use NativeWind for Tailwind-like styling
- Follow atomic design principles
- Use ESLint and Prettier for code formatting
- Implement proper state management with React Query and Zustand
- Write tests using Jest and React Native Testing Library
- Implement type-safe navigation
- Use theme provider for consistent design
- Optimize performance with memoization
- Ensure accessibility
- Implement error boundaries
- Add component documentation

### Backend (FastAPI + Python)
- Use Poetry for dependency management
- Use Pydantic v2 with proper typing
- Implement domain-driven design and clean architecture
- Set up comprehensive testing with pytest
- Use code quality tools (Black, Ruff, Mypy)
- Implement pre-commit hooks
- Add detailed documentation and docstrings
- Create centralized error handling
- Use structured logging
- Implement type-safe environment variables

## 🔒 Security

- Authentication uses JWT tokens with proper expiration
- Environment variables for sensitive information
- Input validation on all API endpoints
- HTTPS for all communications
- Permission-based access control

## 📝 License

This project is proprietary and confidential. All rights reserved.

## 👥 Contributors

- Rivo Development Team
