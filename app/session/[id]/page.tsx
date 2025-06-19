"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useChatStore } from "@/lib/stores/chat-store"
import { useLearningPlanStore } from "@/lib/stores/learning-plan-store"
import { useAutoSave } from "@/lib/hooks/use-auto-save"
import CreatePage from "@/app/create/page"
import { Loader2 } from "lucide-react"

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  
  const { loadAndSetCurrentSession, currentSession } = useChatStore()
  const { loadAndSetCurrentPlan } = useLearningPlanStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Enable auto-save for this session
  useAutoSave({ enabled: true, delay: 2000 })

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) {
        setError("Invalid session ID")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // First check if session exists in store (for newly created sessions)
        const { sessions, setCurrentSession } = useChatStore.getState()
        const existingSession = sessions.find(s => s.id === sessionId)
        
        if (existingSession) {
          console.log('Found session in store:', existingSession)
          setCurrentSession(sessionId)
          setIsLoading(false)
          return
        }
        
        // If not in store, try to load from database
        try {
          const sessionData = await loadAndSetCurrentSession(sessionId)
          
          // If there are learning plans, set the first one as current
          if (sessionData.learningPlans && sessionData.learningPlans.length > 0) {
            await loadAndSetCurrentPlan(sessionData.learningPlans[0].id)
          }
        } catch (dbError) {
          console.error("Session not found in database:", dbError)
          setError("Session not found")
        }

      } catch (error) {
        console.error("Error loading session:", error)
        setError("Failed to load session")
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [sessionId, loadAndSetCurrentSession, loadAndSetCurrentPlan])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Loading session...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Session Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!currentSession || currentSession.id !== sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Session Not Found</h1>
          <p className="text-muted-foreground">The requested session could not be found.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Render the create page with loaded session data
  return <CreatePage />
}