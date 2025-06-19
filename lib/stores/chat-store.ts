import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  sessionId: string
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  initialPrompt?: string
}

interface ChatState {
  // Current session
  currentSession: ChatSession | null
  
  // All sessions
  sessions: ChatSession[]
  
  // UI state
  isLoading: boolean
  
  // Actions
  createSession: (initialPrompt?: string) => ChatSession
  setCurrentSession: (sessionId: string) => void
  clearCurrentSession: () => void
  loadAndSetCurrentSession: (sessionId: string) => Promise<void>
  addMessage: (message: Omit<Message, 'sessionId'>) => void
  updateMessage: (messageId: string, content: string) => void
  loadSessions: () => Promise<void>
  saveSession: (session: ChatSession) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        currentSession: null,
        sessions: [],
        isLoading: false,

        createSession: (initialPrompt) => {
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const newSession: ChatSession = {
            id: sessionId,
            title: initialPrompt ? 
              (initialPrompt.length > 50 ? initialPrompt.substring(0, 50) + '...' : initialPrompt) :
              'New Learning Session',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            initialPrompt
          }

          // Add initial message if prompt provided
          if (initialPrompt) {
            const initialMessage: Message = {
              id: `msg_${Date.now()}`,
              content: initialPrompt,
              isUser: true,
              timestamp: new Date(),
              sessionId
            }
            newSession.messages = [initialMessage]
          }

          set((state) => ({
            currentSession: newSession,
            sessions: [newSession, ...state.sessions]
          }))

          return newSession
        },

        setCurrentSession: (sessionId) => {
          const session = get().sessions.find(s => s.id === sessionId)
          if (session) {
            set({ currentSession: session })
          }
        },

        clearCurrentSession: () => {
          set({ currentSession: null })
        },

        loadAndSetCurrentSession: async (sessionId) => {
          try {
            const response = await fetch(`/api/sessions/${sessionId}`)
            if (!response.ok) {
              throw new Error('Session not found')
            }
            
            const sessionData = await response.json()
            
            const chatSession: ChatSession = {
              id: sessionData.id,
              title: sessionData.title,
              initialPrompt: sessionData.initialPrompt,
              messages: sessionData.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              })),
              createdAt: new Date(sessionData.createdAt),
              updatedAt: new Date(sessionData.updatedAt)
            }

            // Add to sessions array if not already there
            set((state) => {
              const exists = state.sessions.find(s => s.id === sessionId)
              return {
                currentSession: chatSession,
                sessions: exists ? state.sessions : [chatSession, ...state.sessions]
              }
            })
            
            return sessionData
          } catch (error) {
            console.error('Failed to load session:', error)
            throw error
          }
        },

        addMessage: (message) => {
          const currentSession = get().currentSession
          if (!currentSession) return

          const newMessage: Message = {
            ...message,
            sessionId: currentSession.id
          }

          const updatedSession = {
            ...currentSession,
            messages: [...currentSession.messages, newMessage],
            updatedAt: new Date()
          }

          set((state) => ({
            currentSession: updatedSession,
            sessions: state.sessions.map(s => 
              s.id === currentSession.id ? updatedSession : s
            )
          }))
        },

        updateMessage: (messageId, content) => {
          const currentSession = get().currentSession
          if (!currentSession) return

          const updatedSession = {
            ...currentSession,
            messages: currentSession.messages.map(msg =>
              msg.id === messageId ? { ...msg, content } : msg
            ),
            updatedAt: new Date()
          }

          set((state) => ({
            currentSession: updatedSession,
            sessions: state.sessions.map(s => 
              s.id === currentSession.id ? updatedSession : s
            )
          }))
        },

        loadSessions: async () => {
          set({ isLoading: true })
          try {
            // This will be implemented with database calls
            const response = await fetch('/api/sessions')
            if (response.ok) {
              const sessions = await response.json()
              set({ sessions })
            }
          } catch (error) {
            console.error('Failed to load sessions:', error)
          } finally {
            set({ isLoading: false })
          }
        },

        saveSession: async (session) => {
          try {
            await fetch('/api/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(session)
            })
          } catch (error) {
            console.error('Failed to save session:', error)
          }
        },

        deleteSession: async (sessionId) => {
          try {
            await fetch(`/api/sessions/${sessionId}`, {
              method: 'DELETE'
            })
            
            set((state) => ({
              sessions: state.sessions.filter(s => s.id !== sessionId),
              currentSession: state.currentSession?.id === sessionId ? null : state.currentSession
            }))
          } catch (error) {
            console.error('Failed to delete session:', error)
          }
        },

        setLoading: (loading) => set({ isLoading: loading })
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          sessions: state.sessions,
          currentSession: state.currentSession
        }),
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name)
            if (!str) return null
            try {
              const parsed = JSON.parse(str)
              // Convert timestamp strings back to Date objects
              if (parsed.state?.sessions) {
                parsed.state.sessions.forEach((session: any) => {
                  session.createdAt = new Date(session.createdAt)
                  session.updatedAt = new Date(session.updatedAt)
                  session.messages?.forEach((message: any) => {
                    message.timestamp = new Date(message.timestamp)
                  })
                })
              }
              if (parsed.state?.currentSession) {
                const session = parsed.state.currentSession
                session.createdAt = new Date(session.createdAt)
                session.updatedAt = new Date(session.updatedAt)
                session.messages?.forEach((message: any) => {
                  message.timestamp = new Date(message.timestamp)
                })
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
    { name: 'chat-store' }
  )
)