"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Send, MessageSquare, FileText, Plus, Settings2, Paperclip, Grid3X3, Globe, Edit3, Telescope, Lightbulb, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LearningPlanArtifact from "@/components/learning-plan-artifact"
import { useChatStore } from "@/lib/stores/chat-store"
import { useLearningPlanStore } from "@/lib/stores/learning-plan-store"
import { useAutoSave } from "@/lib/hooks/use-auto-save"

export default function CreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get('prompt') ? decodeURIComponent(searchParams.get('prompt')!) : ''
  
  // Debug logging
  useEffect(() => {
    console.log('Search params:', searchParams.toString())
    console.log('Raw prompt param:', searchParams.get('prompt'))
    console.log('Decoded initial prompt:', initialPrompt)
  }, [searchParams, initialPrompt])
  
  // Zustand stores
  const { 
    currentSession, 
    createSession, 
    clearCurrentSession,
    addMessage, 
    updateMessage, 
    isLoading: chatLoading,
    setLoading 
  } = useChatStore()
  
  const { 
    currentPlan, 
    createPlan, 
    currentStep,
    setCurrentStep,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    toggleLessonCompletion
  } = useLearningPlanStore()
  
  // Local state
  const [inputValue, setInputValue] = useState('')
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [showToolsOptions, setShowToolsOptions] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toolsDropdownRef = useRef<HTMLDivElement>(null)
  const isCreatingSession = useRef(false)

  // Enable auto-save
  useAutoSave({ enabled: true, delay: 2000 })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages.length])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAddOptions(false)
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setShowToolsOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '' && !isCreatingSession.current) {
      console.log('Processing initial prompt:', initialPrompt)
      
      // Prevent duplicate session creation
      isCreatingSession.current = true
      
      // Always create a new session when we have an initial prompt from dashboard
      // Clear any existing session first to ensure fresh start
      clearCurrentSession()
      
      // Add a small delay to ensure the store is cleared
      setTimeout(() => {
        const session = createSession(initialPrompt)
        console.log('Created new session with prompt:', initialPrompt, 'Session:', session)
        
        // Handle AI response for the initial message first
        if (session.messages.length > 0) {
          console.log('Starting AI response for message:', session.messages[0].content)
          handleAIResponse(session.messages).then(() => {
            // Navigate to session URL after handling the response
            router.replace(`/session/${session.id}`)
          }).catch((error) => {
            console.error('Failed to handle AI response:', error)
            // Still navigate even if AI response fails
            router.replace(`/session/${session.id}`)
          })
        } else {
          // Navigate immediately if no initial message
          router.replace(`/session/${session.id}`)
        }
      }, 100)
    }
  }, [initialPrompt, createSession, clearCurrentSession, router])


  const handleAIResponse = async (messageHistory: any[]) => {
    if (!currentSession) return
    
    setLoading(true)
    
    const isFirstMessage = messageHistory.length === 1 && messageHistory[0].isUser
    
    // Also check if the latest message is requesting a learning plan
    const latestUserMessage = messageHistory.filter(msg => msg.isUser).pop()
    const isLearningPlanRequest = latestUserMessage && (
      latestUserMessage.content.toLowerCase().includes('learning plan') ||
      latestUserMessage.content.toLowerCase().includes('course') ||
      latestUserMessage.content.toLowerCase().includes('curriculum') ||
      latestUserMessage.content.toLowerCase().includes('roadmap') ||
      latestUserMessage.content.toLowerCase().includes('guide') ||
      latestUserMessage.content.toLowerCase().includes('study plan') ||
      latestUserMessage.content.toLowerCase().includes('learn') ||
      latestUserMessage.content.toLowerCase().includes('teach')
    )
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageHistory.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          })),
          extractStructuredData: isFirstMessage || isLearningPlanRequest
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let streamedContent = ''
      
      // Create initial AI message
      const aiMessageId = `msg_${Date.now()}`
      const initialAiMessage = {
        id: aiMessageId,
        content: '',
        isUser: false,
        timestamp: new Date()
      }
      
      addMessage(initialAiMessage)

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim()
              
              // Skip empty or malformed data
              if (!jsonStr || jsonStr === '') continue
              
              try {
                const data = JSON.parse(jsonStr)
                
                if (data.type === 'content') {
                  streamedContent += data.content
                  
                  // Update the AI message in real-time
                  updateMessage(aiMessageId, streamedContent)
                }
                
                if (data.type === 'structured_data' && data.data?.learningPlan) {
                  console.log('Creating learning plan from structured data:', data.data.learningPlan)
                  // Create learning plan in store
                  createPlan(currentSession.id, data.data.learningPlan)
                }
                
                if (data.type === 'done') {
                  setLoading(false)
                }
              } catch (e) {
                console.error('Error parsing SSE JSON:', e)
                console.error('Problematic JSON string:', jsonStr)
                // Continue processing other lines even if one fails
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

    } catch (error) {
      console.error('Error getting AI response:', error)
      let errorContent = "Sorry, I'm having trouble responding right now. Please try again."
      
      if (error instanceof Error) {
        console.error('Detailed error:', error.message)
        errorContent += ` Error: ${error.message}`
      }
      
      const errorMessage = {
        id: `msg_${Date.now()}`,
        content: errorContent,
        isUser: false,
        timestamp: new Date()
      }
      addMessage(errorMessage)
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chatLoading || !currentSession) return
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    }
    
    addMessage(newMessage)
    setInputValue('')
    
    // Get updated message history including the new message
    const updatedMessages = [...currentSession.messages, newMessage]
    await handleAIResponse(updatedMessages)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Side - Chat Interface (40%) */}
        <div className="w-2/5 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h1 className="font-semibold">Chat</h1>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {!currentSession?.messages.length ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation to create your learning plan</p>
                </div>
              ) : (
                currentSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!message.isUser && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        message.isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 border border-border/50'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-60 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.isUser && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 border border-border/50 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl border border-border/30 p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Continue the conversation..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={chatLoading}
                    className="border-0 bg-transparent text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 h-auto"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 relative">
                <div className="flex items-center gap-3">
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddOptions(!showAddOptions)}
                      disabled={chatLoading}
                      className="rounded-full h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    {showAddOptions && (
                      <div className="absolute top-full left-0 mt-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 min-w-[240px] z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start rounded-lg h-12 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                          onClick={() => setShowAddOptions(false)}
                        >
                          <Paperclip className="h-4 w-4 mr-3" />
                          Add photos and files
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start rounded-lg h-12 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                          onClick={() => setShowAddOptions(false)}
                        >
                          <Grid3X3 className="h-4 w-4 mr-3" />
                          Add from apps
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={toolsDropdownRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowToolsOptions(!showToolsOptions)}
                      disabled={chatLoading}
                      className="rounded-full px-4 h-8 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-0"
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      Tools
                    </Button>
                    
                    {showToolsOptions && (
                      <div className="absolute top-full left-0 mt-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 min-w-[240px] z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start rounded-lg h-12 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                          onClick={() => setShowToolsOptions(false)}
                        >
                          <Globe className="h-4 w-4 mr-3" />
                          Search the web
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start rounded-lg h-12 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                          onClick={() => setShowToolsOptions(false)}
                        >
                          <Edit3 className="h-4 w-4 mr-3" />
                          Write or code
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start rounded-lg h-12 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                          onClick={() => setShowToolsOptions(false)}
                        >
                          <Telescope className="h-4 w-4 mr-3" />
                          Run deep research
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start rounded-lg h-12 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                          onClick={() => setShowToolsOptions(false)}
                        >
                          <Lightbulb className="h-4 w-4 mr-3" />
                          Think for longer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || chatLoading}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors border-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Learning Plan Artifact (60%) */}
        <div className="w-3/5 flex flex-col">
          <LearningPlanArtifact 
            plan={currentPlan} 
            onPlanUpdate={(updatedPlan) => {
              // This will be handled by the store automatically
            }}
          />
        </div>
      </div>
    </div>
  )
}