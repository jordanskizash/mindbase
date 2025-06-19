import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { ChatSession } from '@/lib/stores/chat-store'

// Helper function to ensure database tables exist
async function ensureTablesExist() {
  try {
    // Check if chat_sessions table exists
    const { data, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('count')
      .limit(1)
    
    if (error && error.code === '42P01') {
      console.log('Tables do not exist. Creating basic chat_sessions table...')
      
      // Try to create basic table structure using the REST API
      // This is a workaround since we can't run raw SQL
      console.log('Database tables need to be created manually.')
      console.log('Please run the SQL schema from lib/supabase/schema.sql in your Supabase dashboard.')
      throw new Error('Database tables do not exist. Please set up the schema manually.')
    }
  } catch (err) {
    console.log('Tables do not exist. Please set up the database schema first.')
    throw new Error('Database tables do not exist. Please set up the schema manually.')
  }
}

export async function GET() {
  try {
    // First check if tables exist
    try {
      const { data: testQuery, error: testError } = await supabaseAdmin
        .from('chat_sessions')
        .select('count')
        .limit(1)
      
      if (testError && testError.code === '42P01') {
        console.log('Database tables do not exist yet. Returning empty sessions.')
        return NextResponse.json([])
      }
    } catch (tableError) {
      console.log('Database tables do not exist yet. Returning empty sessions.')
      return NextResponse.json([])
    }

    // Get all chat sessions with their messages
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('chat_sessions')
      .select(`
        *,
        messages (*)
      `)
      .order('updated_at', { ascending: false })

    if (sessionsError) {
      throw sessionsError
    }

    // Transform the data to match our ChatSession interface
    const transformedSessions: ChatSession[] = sessions.map((session: any) => ({
      id: session.id,
      title: session.title,
      initialPrompt: session.initial_prompt,
      createdAt: new Date(session.created_at),
      updatedAt: new Date(session.updated_at),
      messages: session.messages.map((message: any) => ({
        id: message.id,
        content: message.content,
        isUser: message.is_user,
        timestamp: new Date(message.timestamp),
        sessionId: message.session_id
      })).sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime())
    }))

    return NextResponse.json(transformedSessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session: ChatSession = await request.json()

    // Create tables if they don't exist before trying to insert
    await ensureTablesExist()

    // Insert or update the session
    const { error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .upsert({
        id: session.id,
        title: session.title,
        initial_prompt: session.initialPrompt,
        created_at: new Date(session.createdAt).toISOString(),
        updated_at: new Date(session.updatedAt).toISOString()
      })

    if (sessionError) {
      throw sessionError
    }

    // Delete existing messages for this session and insert new ones
    if (session.messages.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('messages')
        .delete()
        .eq('session_id', session.id)

      if (deleteError) {
        throw deleteError
      }

      const { error: messagesError } = await supabaseAdmin
        .from('messages')
        .insert(
          session.messages.map(message => ({
            id: message.id,
            session_id: message.sessionId,
            content: message.content,
            is_user: message.isUser,
            timestamp: new Date(message.timestamp).toISOString()
          }))
        )

      if (messagesError) {
        throw messagesError
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving session:', error)
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    )
  }
}