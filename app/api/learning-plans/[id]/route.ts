import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = params.id

    // Delete the learning plan (cascade will handle related records)
    const { error } = await supabaseAdmin
      .from('learning_plans')
      .delete()
      .eq('id', planId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting learning plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete learning plan' },
      { status: 500 }
    )
  }
}