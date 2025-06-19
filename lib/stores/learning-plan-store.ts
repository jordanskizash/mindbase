import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface LearningModule {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  progress: number
  lessons: LearningLesson[]
}

export interface LearningLesson {
  id: string
  title: string
  completed: boolean
  duration: string
  content?: string
}

export interface LearningResource {
  id: string
  title: string
  type: 'video' | 'article' | 'book' | 'course' | 'tool'
  url: string
  description: string
  duration?: string
}

export interface LearningPlan {
  id: string
  sessionId: string
  title: string
  description: string
  duration: string
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  totalProgress: number
  modules: LearningModule[]
  resources: LearningResource[]
  createdAt: Date
  updatedAt: Date
}

export interface CurrentStep {
  moduleId: string
  lessonId: string
}

interface LearningPlanState {
  // Current plan
  currentPlan: LearningPlan | null
  
  // All plans
  plans: LearningPlan[]
  
  // Navigation state
  currentStep: CurrentStep | null
  
  // UI state
  viewMode: 'preview' | 'edit'
  activeTab: string
  
  // Actions
  createPlan: (sessionId: string, planData: Partial<LearningPlan>) => LearningPlan
  updatePlan: (planId: string, updates: Partial<LearningPlan>) => void
  setCurrentPlan: (planId: string) => void
  loadAndSetCurrentPlan: (planId: string) => Promise<void>
  toggleLessonCompletion: (moduleId: string, lessonId: string) => void
  setCurrentStep: (step: CurrentStep | null) => void
  setViewMode: (mode: 'preview' | 'edit') => void
  setActiveTab: (tab: string) => void
  savePlan: (plan: LearningPlan) => Promise<void>
  loadPlans: () => Promise<void>
  deletePlan: (planId: string) => Promise<void>
  
  // Helper methods
  getNextLesson: () => CurrentStep | null
  getCurrentLesson: () => { module: LearningModule; lesson: LearningLesson } | null
  calculateProgress: () => void
}

export const useLearningPlanStore = create<LearningPlanState>()(
  devtools(
    persist(
      (set, get) => ({
        currentPlan: null,
        plans: [],
        currentStep: null,
        viewMode: 'preview',
        activeTab: 'modules',

        createPlan: (sessionId, planData) => {
          const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const newPlan: LearningPlan = {
            id: planId,
            sessionId,
            title: planData.title || 'New Learning Plan',
            description: planData.description || '',
            duration: planData.duration || '8 weeks',
            skillLevel: planData.skillLevel || 'Intermediate',
            totalProgress: 0,
            modules: planData.modules || [],
            resources: planData.resources || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...planData
          }

          set((state) => ({
            currentPlan: newPlan,
            plans: [newPlan, ...state.plans]
          }))

          // Auto-save the new plan
          get().savePlan(newPlan)

          return newPlan
        },

        updatePlan: (planId, updates) => {
          set((state) => {
            const updatedPlans = state.plans.map(plan => 
              plan.id === planId 
                ? { ...plan, ...updates, updatedAt: new Date() }
                : plan
            )
            
            const currentPlan = state.currentPlan?.id === planId 
              ? { ...state.currentPlan, ...updates, updatedAt: new Date() }
              : state.currentPlan

            return {
              plans: updatedPlans,
              currentPlan
            }
          })

          // Auto-save after update
          const updatedPlan = get().plans.find(p => p.id === planId)
          if (updatedPlan) {
            get().savePlan(updatedPlan)
          }
        },

        setCurrentPlan: (planId) => {
          const plan = get().plans.find(p => p.id === planId)
          if (plan) {
            set({ currentPlan: plan })
          }
        },

        loadAndSetCurrentPlan: async (planId) => {
          try {
            const response = await fetch(`/api/learning-plans/${planId}`)
            if (!response.ok) {
              throw new Error('Learning plan not found')
            }
            
            const planData = await response.json()
            
            const learningPlan: LearningPlan = {
              ...planData,
              createdAt: new Date(planData.createdAt),
              updatedAt: new Date(planData.updatedAt)
            }

            // Add to plans array if not already there
            set((state) => {
              const exists = state.plans.find(p => p.id === planId)
              return {
                currentPlan: learningPlan,
                plans: exists ? state.plans : [learningPlan, ...state.plans]
              }
            })
          } catch (error) {
            console.error('Failed to load learning plan:', error)
            throw error
          }
        },

        toggleLessonCompletion: (moduleId, lessonId) => {
          const currentPlan = get().currentPlan
          if (!currentPlan) return

          const updatedModules = currentPlan.modules.map(module => {
            if (module.id === moduleId) {
              const updatedLessons = module.lessons.map(lesson => 
                lesson.id === lessonId 
                  ? { ...lesson, completed: !lesson.completed }
                  : lesson
              )

              const completedLessons = updatedLessons.filter(l => l.completed).length
              const progress = Math.round((completedLessons / updatedLessons.length) * 100)
              
              return {
                ...module,
                lessons: updatedLessons,
                progress,
                completed: progress === 100
              }
            }
            return module
          })

          // Calculate total progress
          const totalLessons = updatedModules.reduce((acc, m) => acc + m.lessons.length, 0)
          const totalCompletedLessons = updatedModules.reduce((acc, m) => 
            acc + m.lessons.filter(l => l.completed).length, 0
          )
          const totalProgress = Math.round((totalCompletedLessons / totalLessons) * 100)

          get().updatePlan(currentPlan.id, { 
            modules: updatedModules, 
            totalProgress 
          })
        },

        setCurrentStep: (step) => set({ currentStep: step }),
        
        setViewMode: (mode) => set({ viewMode: mode }),
        
        setActiveTab: (tab) => set({ activeTab: tab }),

        getNextLesson: () => {
          const { currentPlan, currentStep } = get()
          if (!currentPlan || !currentStep) return null

          const currentModuleIndex = currentPlan.modules.findIndex(m => m.id === currentStep.moduleId)
          const currentModule = currentPlan.modules[currentModuleIndex]
          const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentStep.lessonId)

          // Check if there's a next lesson in current module
          if (currentLessonIndex < currentModule.lessons.length - 1) {
            return {
              moduleId: currentStep.moduleId,
              lessonId: currentModule.lessons[currentLessonIndex + 1].id
            }
          }

          // Check if there's a next module
          if (currentModuleIndex < currentPlan.modules.length - 1) {
            const nextModule = currentPlan.modules[currentModuleIndex + 1]
            return {
              moduleId: nextModule.id,
              lessonId: nextModule.lessons[0].id
            }
          }

          return null
        },

        getCurrentLesson: () => {
          const { currentPlan, currentStep } = get()
          if (!currentPlan || !currentStep) return null

          const module = currentPlan.modules.find(m => m.id === currentStep.moduleId)
          const lesson = module?.lessons.find(l => l.id === currentStep.lessonId)
          
          return lesson && module ? { module, lesson } : null
        },

        calculateProgress: () => {
          const currentPlan = get().currentPlan
          if (!currentPlan) return

          const totalLessons = currentPlan.modules.reduce((acc, m) => acc + m.lessons.length, 0)
          const totalCompletedLessons = currentPlan.modules.reduce((acc, m) => 
            acc + m.lessons.filter(l => l.completed).length, 0
          )
          const totalProgress = Math.round((totalCompletedLessons / totalLessons) * 100)

          get().updatePlan(currentPlan.id, { totalProgress })
        },

        savePlan: async (plan) => {
          try {
            await fetch('/api/learning-plans', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(plan)
            })
          } catch (error) {
            console.error('Failed to save learning plan:', error)
          }
        },

        loadPlans: async () => {
          try {
            const response = await fetch('/api/learning-plans')
            if (response.ok) {
              const plans = await response.json()
              set({ plans })
            }
          } catch (error) {
            console.error('Failed to load learning plans:', error)
          }
        },

        deletePlan: async (planId) => {
          try {
            await fetch(`/api/learning-plans/${planId}`, {
              method: 'DELETE'
            })
            
            set((state) => ({
              plans: state.plans.filter(p => p.id !== planId),
              currentPlan: state.currentPlan?.id === planId ? null : state.currentPlan
            }))
          } catch (error) {
            console.error('Failed to delete learning plan:', error)
          }
        }
      }),
      {
        name: 'learning-plan-store',
        partialize: (state) => ({
          plans: state.plans,
          currentPlan: state.currentPlan,
          viewMode: state.viewMode,
          activeTab: state.activeTab
        }),
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name)
            if (!str) return null
            try {
              const parsed = JSON.parse(str)
              // Convert timestamp strings back to Date objects
              if (parsed.state?.plans) {
                parsed.state.plans.forEach((plan: any) => {
                  plan.createdAt = new Date(plan.createdAt)
                  plan.updatedAt = new Date(plan.updatedAt)
                })
              }
              if (parsed.state?.currentPlan) {
                const plan = parsed.state.currentPlan
                plan.createdAt = new Date(plan.createdAt)
                plan.updatedAt = new Date(plan.updatedAt)
              }
              return parsed
            } catch (e) {
              return null
            }
          },
          setItem: (name, value) => {
            localStorage.setItem(name, JSON.stringify(value))
          },
          removeItem: (name) => {
            localStorage.removeItem(name)
          }
        }
      }
    ),
    { name: 'learning-plan-store' }
  )
)