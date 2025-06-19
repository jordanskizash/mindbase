import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    // Get session with messages
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select(`
        *,
        messages (*),
        learning_plans (
          *,
          learning_modules (
            *,
            learning_lessons (*)
          ),
          learning_resources (*)
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      throw sessionError
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Transform the data
    const transformedSession = {
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
      })).sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime()),
      learningPlans: session.learning_plans.map((plan: any) => ({
        id: plan.id,
        sessionId: plan.session_id,
        title: plan.title,
        description: plan.description,
        duration: plan.duration,
        skillLevel: plan.skill_level,
        totalProgress: plan.total_progress,
        createdAt: new Date(plan.created_at),
        updatedAt: new Date(plan.updated_at),
        modules: plan.learning_modules
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((module: any) => ({
            id: module.id,
            title: module.title,
            description: module.description,
            duration: module.duration,
            completed: module.completed,
            progress: module.progress,
            lessons: module.learning_lessons
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((lesson: any) => ({
                id: lesson.id,
                title: lesson.title,
                duration: lesson.duration,
                completed: lesson.completed,
                content: lesson.content
              }))
          })),
        resources: plan.learning_resources
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((resource: any) => ({
            id: resource.id,
            title: resource.title,
            type: resource.type,
            url: resource.url,
            description: resource.description,
            duration: resource.duration
          }))
      }))
    }

    return NextResponse.json(transformedSession)
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    // Delete the session (cascade will handle related records)
    const { error } = await supabaseAdmin
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}