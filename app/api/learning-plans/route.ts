import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { LearningPlan } from '@/lib/stores/learning-plan-store'

export async function GET() {
  try {
    // Get all learning plans with their modules, lessons, and resources
    const { data: plans, error: plansError } = await supabaseAdmin
      .from('learning_plans')
      .select(`
        *,
        learning_modules (
          *,
          learning_lessons (*)
        ),
        learning_resources (*)
      `)
      .order('updated_at', { ascending: false })

    if (plansError) {
      throw plansError
    }

    // Transform the data to match our LearningPlan interface
    const transformedPlans: LearningPlan[] = plans.map((plan: any) => ({
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

    return NextResponse.json(transformedPlans)
  } catch (error) {
    console.error('Error fetching learning plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const plan: LearningPlan = await request.json()

    // Insert or update the learning plan
    const { error: planError } = await supabaseAdmin
      .from('learning_plans')
      .upsert({
        id: plan.id,
        session_id: plan.sessionId,
        title: plan.title,
        description: plan.description,
        duration: plan.duration,
        skill_level: plan.skillLevel,
        total_progress: plan.totalProgress,
        created_at: new Date(plan.createdAt).toISOString(),
        updated_at: new Date(plan.updatedAt).toISOString()
      })

    if (planError) {
      throw planError
    }

    // Delete existing modules and their lessons
    const { error: deleteModulesError } = await supabaseAdmin
      .from('learning_modules')
      .delete()
      .eq('plan_id', plan.id)

    if (deleteModulesError) {
      throw deleteModulesError
    }

    // Delete existing resources
    const { error: deleteResourcesError } = await supabaseAdmin
      .from('learning_resources')
      .delete()
      .eq('plan_id', plan.id)

    if (deleteResourcesError) {
      throw deleteResourcesError
    }

    // Insert modules and lessons
    if (plan.modules.length > 0) {
      const { error: modulesError } = await supabaseAdmin
        .from('learning_modules')
        .insert(
          plan.modules.map((module, index) => ({
            id: module.id,
            plan_id: plan.id,
            title: module.title,
            description: module.description,
            duration: module.duration,
            completed: module.completed,
            progress: module.progress,
            sort_order: index
          }))
        )

      if (modulesError) {
        throw modulesError
      }

      // Insert lessons for all modules
      const allLessons = plan.modules.flatMap((module, moduleIndex) =>
        module.lessons.map((lesson, lessonIndex) => ({
          id: lesson.id,
          module_id: module.id,
          title: lesson.title,
          duration: lesson.duration,
          completed: lesson.completed,
          content: lesson.content || null,
          sort_order: lessonIndex
        }))
      )

      if (allLessons.length > 0) {
        const { error: lessonsError } = await supabaseAdmin
          .from('learning_lessons')
          .insert(allLessons)

        if (lessonsError) {
          throw lessonsError
        }
      }
    }

    // Insert resources
    if (plan.resources.length > 0) {
      const { error: resourcesError } = await supabaseAdmin
        .from('learning_resources')
        .insert(
          plan.resources.map((resource, index) => ({
            id: resource.id,
            plan_id: plan.id,
            title: resource.title,
            type: resource.type,
            url: resource.url,
            description: resource.description,
            duration: resource.duration,
            sort_order: index
          }))
        )

      if (resourcesError) {
        throw resourcesError
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving learning plan:', error)
    return NextResponse.json(
      { error: 'Failed to save learning plan' },
      { status: 500 }
    )
  }
}