# Rivo Real Estate Mobile App

## Environment Variables Setup

This project uses environment variables for configuration. Follow these steps to set up your environment:

1. Copy the example environment file to create your own:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your actual configuration values:
   ```
   # API Configuration
   API_BASE_URL=https://your-api-url.com
   
   # Authentication
   SUPABASE_URL=https://your-supabase-instance.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # Maps and Location
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   
   # Other settings...
   ```

3. The app will automatically use these environment variables at runtime.

## Important Notes

- **Never commit the `.env` file to version control**. It contains sensitive information.
- The `.env.example` file serves as a template and should not contain real credentials.
- If you add new environment variables, make sure to:
  1. Add them to `.env.example` (with placeholder values)
  2. Add their type definitions in `src/types/env.d.ts`
  3. Update the config imports in `src/config/index.ts`

## Development

After setting up your environment variables, you can start the development server:

```bash
npm start
# or
npx expo start
```

## Features

- User Authentication
- Property Browsing
- Voice Assistant
- Property Camera with Voice Annotations
- Location-based Services
