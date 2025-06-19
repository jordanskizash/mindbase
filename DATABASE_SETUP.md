# Database Setup Instructions

The application is currently working with in-memory storage, but to enable data persistence, you need to set up the database tables in Supabase.

## Quick Setup

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/projects
   - Select your project: `cpuspjxxsfpkxugoplhx`

2. **Open SQL Editor**
   - Navigate to "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Schema**
   - Copy the entire contents of `lib/supabase/schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute all the table creation commands

4. **Verify Setup**
   - Refresh your application
   - Create a new chat - it should now persist between sessions
   - Check the dashboard - saved chats should appear there

## What the Setup Creates

- `chat_sessions` - Stores chat conversation metadata
- `messages` - Stores individual chat messages  
- `learning_plans` - Stores generated learning plans
- `learning_modules` - Stores learning plan modules
- `learning_lessons` - Stores individual lessons
- `learning_resources` - Stores learning resources

## Current Status

✅ **Working Now:**
- Creating new chats with AI responses
- Learning plan artifact generation
- Real-time chat functionality
- In-memory session storage

⏳ **Available After Database Setup:**
- Chat persistence between sessions
- Dashboard showing all past chats
- Learning plan progress tracking
- Auto-save functionality

The application is fully functional for testing even without the database setup!