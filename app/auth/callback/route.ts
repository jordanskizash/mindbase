import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to dashboard on successful confirmation
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect to login with error
  return NextResponse.redirect(new URL('/login?error=confirmation-failed', request.url))
}