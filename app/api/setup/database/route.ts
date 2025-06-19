import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up database tables...')
    
    // Create tables using individual SQL commands
    const createCommands = [
      // Chat Sessions Table
      `CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        initial_prompt TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Messages Table
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_user BOOLEAN NOT NULL DEFAULT FALSE,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Learning Plans Table
      `CREATE TABLE IF NOT EXISTS learning_plans (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        duration TEXT,
        skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
        total_progress INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Learning Modules Table
      `CREATE TABLE IF NOT EXISTS learning_modules (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        duration TEXT,
        completed BOOLEAN DEFAULT FALSE,
        progress INTEGER DEFAULT 0,
        sort_order INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Learning Lessons Table
      `CREATE TABLE IF NOT EXISTS learning_lessons (
        id TEXT PRIMARY KEY,
        module_id TEXT NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        duration TEXT,
        completed BOOLEAN DEFAULT FALSE,
        content TEXT,
        sort_order INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Learning Resources Table
      `CREATE TABLE IF NOT EXISTS learning_resources (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        type TEXT CHECK (type IN ('video', 'article', 'book', 'course', 'tool')),
        url TEXT,
        description TEXT,
        duration TEXT,
        sort_order INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    ]
    
    // Execute each command
    for (const sql of createCommands) {
      console.log('Executing SQL:', sql.substring(0, 50) + '...')
      const { error } = await supabaseAdmin.rpc('exec', { sql })
      
      if (error) {
        console.error('SQL execution error:', error)
        // Continue with other commands even if one fails
      }
    }
    
    console.log('Database setup completed')
    return NextResponse.json({ 
      success: true, 
      message: 'Database tables setup completed' 
    })
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}