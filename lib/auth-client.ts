import { supabase } from './supabase'
import { useEffect, useState } from 'react'
import type { Session } from './auth'

export const signIn = {
  email: async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return { error: { message: error.message } }
    }
    
    return { data }
  }
}

export const signUp = {
  email: async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          name,
          full_name: name,
        }
      }
    })
    
    if (error) {
      return { error: { message: error.message } }
    }
    
    // Return data regardless of whether email confirmation is needed
    // The calling component will handle the confirmation message
    
    return { data }
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      if (session?.user) {
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || 
                  session.user.user_metadata?.full_name || 
                  session.user.email!.split('@')[0]
          }
        })
      } else {
        setSession(null)
      }
      setIsPending(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        
        if (session?.user) {
          setSession({
            user: {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || 
                    session.user.user_metadata?.full_name || 
                    session.user.email!.split('@')[0]
            }
          })
        } else {
          setSession(null)
        }
        setIsPending(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { data: session, isPending }
}