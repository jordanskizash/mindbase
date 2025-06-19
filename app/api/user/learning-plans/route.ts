import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

// For now, we'll use a mock user ID since we don't have auth implemented yet
const MOCK_USER_ID = 'user_123'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching user learning plans...')
    
    // In a real app, you would get the user ID from the authentication token
    // const { userId } = await getAuth(request)
    const userId = MOCK_USER_ID

    // First check if tables exist by trying a simple query
    try {
      const { data: testQuery, error: testError } = await supabaseAdmin
        .from('chat_sessions')
        .select('count')
        .limit(1)
      
      if (testError && testError.code === '42P01') {
        console.log('Database tables do not exist yet. Returning empty data.')
        return NextResponse.json([])
      }
    } catch (tableError) {
      console.log('Database tables do not exist yet. Returning empty data.')
      return NextResponse.json([])
    }

    // Fetch all chat sessions for this user (simplified query without joins)
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      // For now, return all sessions since we don't have user authentication
      // In production, add: .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (sessionsError) {
      throw sessionsError
    }

    // Fetch learning plans separately
    const { data: learningPlans, error: plansError } = await supabaseAdmin
      .from('learning_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (plansError) {
      throw plansError
    }

    // Create a map of learning plans by session ID
    const plansBySessionId = new Map()
    learningPlans?.forEach((plan: any) => {
      if (plan.session_id) {
        plansBySessionId.set(plan.session_id, plan)
      }
    })

    // Transform the data to match the course format expected by the UI
    const courses = sessions
      .filter(session => plansBySessionId.has(session.id))
      .map((session: any) => {
        const plan = plansBySessionId.get(session.id)
        
        // Calculate status based on session activity
        const updatedAt = new Date(session.updated_at)
        const daysSinceUpdate = Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))
        
        let status = 'Not Started'
        if (plan.total_progress === 100) {
          status = 'Completed'
        } else if (daysSinceUpdate <= 7 && plan.total_progress > 0) {
          status = 'In Progress'
        } else if (plan.total_progress > 0) {
          status = 'Paused'
        }

        // Generate tags based on the plan title and description
        const generateTags = (title: string, description: string) => {
          const commonTags: { [key: string]: string[] } = {
            'react': ['React', 'JavaScript', 'Frontend'],
            'javascript': ['JavaScript', 'Web Development'],
            'python': ['Python', 'Programming'],
            'machine learning': ['ML', 'AI', 'Data Science'],
            'data': ['Data Science', 'Analytics'],
            'design': ['Design', 'UX', 'UI'],
            'backend': ['Backend', 'API', 'Server'],
            'frontend': ['Frontend', 'Web', 'UI'],
            'mobile': ['Mobile', 'App Development'],
            'web': ['Web Development', 'HTML', 'CSS'],
            'ai': ['AI', 'Machine Learning'],
            'database': ['Database', 'SQL'],
            'cloud': ['Cloud', 'AWS', 'DevOps']
          }

          const text = (title + ' ' + description).toLowerCase()
          const tags: string[] = []
          
          for (const [keyword, tagList] of Object.entries(commonTags)) {
            if (text.includes(keyword)) {
              tags.push(...tagList.slice(0, 2)) // Take first 2 tags per match
              break
            }
          }
          
          // Default tags if no matches
          if (tags.length === 0) {
            tags.push('Learning', 'Course')
          }
          
          return [...new Set(tags)].slice(0, 3) // Remove duplicates and limit to 3
        }

        // Determine category from title/description
        const determineCategory = (title: string, description: string) => {
          const text = (title + ' ' + description).toLowerCase()
          
          if (text.includes('web') || text.includes('frontend') || text.includes('backend')) {
            return 'Web Development'
          } else if (text.includes('data') || text.includes('ml') || text.includes('ai')) {
            return 'Data Science'
          } else if (text.includes('design') || text.includes('ux') || text.includes('ui')) {
            return 'Design'
          } else if (text.includes('mobile') || text.includes('app')) {
            return 'Mobile Development'
          } else if (text.includes('cloud') || text.includes('devops')) {
            return 'DevOps'
          } else {
            return 'General'
          }
        }

        return {
          id: session.id,
          title: plan.title || session.title || 'Untitled Course',
          category: determineCategory(plan.title || '', plan.description || ''),
          tags: generateTags(plan.title || '', plan.description || ''),
          level: plan.skill_level || 'Intermediate',
          publishDate: new Date(plan.created_at).toISOString().split('T')[0],
          progress: plan.total_progress || 0,
          status,
          duration: plan.duration || '8 weeks',
          description: plan.description || '',
          sessionId: session.id,
          planId: plan.id,
          createdAt: plan.created_at,
          updatedAt: session.updated_at,
          lastActivity: daysSinceUpdate
        }
      })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching user learning plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning plans' },
      { status: 500 }
    )
  }
}