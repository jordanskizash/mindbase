import { useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '@/lib/stores/chat-store'
import { useLearningPlanStore } from '@/lib/stores/learning-plan-store'

interface UseAutoSaveOptions {
  delay?: number // Debounce delay in milliseconds
  enabled?: boolean
}

export function useAutoSave({ delay = 2000, enabled = true }: UseAutoSaveOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const { currentSession, saveSession } = useChatStore()
  const { currentPlan, savePlan } = useLearningPlanStore()
  
  const lastSavedSessionRef = useRef<string>()
  const lastSavedPlanRef = useRef<string>()

  const debouncedSave = useCallback(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        // Save session if it has changed
        if (currentSession) {
          const sessionKey = JSON.stringify({
            id: currentSession.id,
            messages: currentSession.messages.map(m => ({ id: m.id, content: m.content, timestamp: m.timestamp })),
            updatedAt: currentSession.updatedAt
          })

          if (sessionKey !== lastSavedSessionRef.current) {
            await saveSession(currentSession)
            lastSavedSessionRef.current = sessionKey
            console.log('Auto-saved session:', currentSession.id)
          }
        }

        // Save plan if it has changed
        if (currentPlan) {
          const planKey = JSON.stringify({
            id: currentPlan.id,
            totalProgress: currentPlan.totalProgress,
            modules: currentPlan.modules.map(m => ({
              id: m.id,
              progress: m.progress,
              completed: m.completed,
              lessons: m.lessons.map(l => ({ id: l.id, completed: l.completed }))
            })),
            updatedAt: currentPlan.updatedAt
          })

          if (planKey !== lastSavedPlanRef.current) {
            await savePlan(currentPlan)
            lastSavedPlanRef.current = planKey
            console.log('Auto-saved learning plan:', currentPlan.id)
          }
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, delay)
  }, [currentSession, currentPlan, saveSession, savePlan, delay, enabled])

  // Trigger auto-save when session or plan changes
  useEffect(() => {
    debouncedSave()
  }, [currentSession?.messages.length, currentSession?.updatedAt, debouncedSave])

  useEffect(() => {
    debouncedSave()
  }, [currentPlan?.totalProgress, currentPlan?.updatedAt, debouncedSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Manual save function
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      if (currentSession) {
        await saveSession(currentSession)
        console.log('Manual save - session:', currentSession.id)
      }
      if (currentPlan) {
        await savePlan(currentPlan)
        console.log('Manual save - learning plan:', currentPlan.id)
      }
    } catch (error) {
      console.error('Manual save failed:', error)
      throw error
    }
  }, [currentSession, currentPlan, saveSession, savePlan])

  return {
    saveNow,
    isAutoSaveEnabled: enabled
  }
}

// Hook for save status indication
export function useSaveStatus() {
  const { currentSession } = useChatStore()
  const { currentPlan } = useLearningPlanStore()
  
  // This could be enhanced to track actual save states
  // For now, we'll assume unsaved if recently updated
  const isUnsaved = (() => {
    const now = new Date().getTime()
    const sessionRecent = currentSession && (now - currentSession.updatedAt.getTime()) < 3000
    const planRecent = currentPlan && (now - currentPlan.updatedAt.getTime()) < 3000
    
    return sessionRecent || planRecent
  })()

  return {
    isUnsaved,
    hasUnsavedChanges: isUnsaved
  }
}