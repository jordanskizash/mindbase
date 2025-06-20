"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Clock, Target, CheckCircle2, Circle, BarChart3, BookOpen, FileText, Brain, PenTool, ClipboardCheck, Play, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface LearningModule {
  id: string
  title: string
  description: string
  duration: string
  contentType: 'quiz' | 'presentation' | 'reading' | 'exercise' | 'assessment'
  completed: boolean
  progress: number
  quiz: QuizQuestion[]
  quizCompleted: boolean
  lessons: Array<{
    id: string
    title: string
    completed: boolean
    duration: string
    contentType: 'quiz' | 'presentation' | 'reading' | 'exercise' | 'assessment'
    description?: string
  }>
}

interface LearningResource {
  id: string
  title: string
  type: 'video' | 'article' | 'book' | 'course' | 'tool'
  url: string
  description: string
  duration?: string
}

interface LearningPlan {
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

interface LearningPlanArtifactProps {
  plan?: LearningPlan
  onPlanUpdate?: (updatedPlan: any) => void
  isLoading?: boolean
}

export default function LearningPlanArtifact({ plan, onPlanUpdate, isLoading = false }: LearningPlanArtifactProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [localPlan, setLocalPlan] = useState(plan)
  const [viewMode, setViewMode] = useState<'learning' | 'practice'>('learning')
  const [currentQuizModule, setCurrentQuizModule] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([])

  // Update local plan when prop changes and add default quizzes
  useEffect(() => {
    if (plan) {
      const planWithQuizzes = {
        ...plan,
        modules: plan.modules.map((module, index) => ({
          ...module,
          quiz: module.quiz || generateDefaultQuiz(module.title, index),
          quizCompleted: module.quizCompleted || false
        }))
      }
      setLocalPlan(planWithQuizzes)
    }
  }, [plan])

  // Initialize answered questions array when switching modules
  useEffect(() => {
    if (localPlan && viewMode === 'practice') {
      const currentModule = localPlan.modules[currentQuizModule]
      if (currentModule) {
        setAnsweredQuestions(new Array(currentModule.quiz.length).fill(false))
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setShowFeedback(false)
        setQuizScore(0)
      }
    }
  }, [currentQuizModule, viewMode, localPlan])

  const generateDefaultQuiz = (moduleTitle: string, moduleIndex: number): QuizQuestion[] => {
    // Generate 3-5 sample questions based on module title
    const baseQuestions = [
      {
        id: `q1_${moduleIndex}`,
        question: `What is the main focus of "${moduleTitle}"?`,
        options: [
          "Understanding basic concepts",
          "Advanced implementation techniques", 
          "Theoretical background only",
          "Practical applications only"
        ],
        correctAnswer: 0,
        explanation: "This module focuses on building a strong foundation with basic concepts."
      },
      {
        id: `q2_${moduleIndex}`,
        question: `Which approach is most effective when learning ${moduleTitle.toLowerCase()}?`,
        options: [
          "Memorizing all details",
          "Hands-on practice with examples",
          "Reading theory only",
          "Skipping to advanced topics"
        ],
        correctAnswer: 1,
        explanation: "Hands-on practice with examples helps reinforce learning and build practical skills."
      },
      {
        id: `q3_${moduleIndex}`,
        question: `What should you do after completing the ${moduleTitle} module?`,
        options: [
          "Move to the next topic immediately",
          "Review and practice the concepts",
          "Skip the exercises",
          "Only read the summary"
        ],
        correctAnswer: 1,
        explanation: "Reviewing and practicing concepts ensures better retention and understanding."
      }
    ]
    return baseQuestions
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const toggleLessonCompletion = (moduleId: string, lessonId: string) => {
    if (!localPlan) return

    const updatedPlan = { ...localPlan }
    const module = updatedPlan.modules.find(m => m.id === moduleId)
    if (!module) return

    const lesson = module.lessons.find(l => l.id === lessonId)
    if (!lesson) return

    lesson.completed = !lesson.completed

    // Recalculate module progress
    const completedLessons = module.lessons.filter(l => l.completed).length
    module.progress = Math.round((completedLessons / module.lessons.length) * 100)
    module.completed = module.progress === 100

    // Recalculate total progress
    const totalLessons = updatedPlan.modules.reduce((acc, m) => acc + m.lessons.length, 0)
    const totalCompletedLessons = updatedPlan.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0)
    updatedPlan.totalProgress = Math.round((totalCompletedLessons / totalLessons) * 100)

    setLocalPlan(updatedPlan)
    onPlanUpdate?.(updatedPlan)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !localPlan) return

    const currentModule = localPlan.modules[currentQuizModule]
    const question = currentModule.quiz[currentQuestion]
    const isCorrect = selectedAnswer === question.correctAnswer

    if (isCorrect) {
      setQuizScore(prev => prev + 1)
    }

    // Mark question as answered
    const newAnswered = [...answeredQuestions]
    newAnswered[currentQuestion] = true
    setAnsweredQuestions(newAnswered)

    setShowFeedback(true)

    // Auto-advance to next question after delay
    setTimeout(() => {
      if (currentQuestion < currentModule.quiz.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        // Quiz completed
        completeQuiz()
      }
    }, 2000)
  }

  const completeQuiz = () => {
    if (!localPlan) return

    const updatedPlan = { ...localPlan }
    const module = updatedPlan.modules[currentQuizModule]
    module.quizCompleted = true

    setLocalPlan(updatedPlan)
    onPlanUpdate?.(updatedPlan)

    // Move to next module if available
    setTimeout(() => {
      if (currentQuizModule < localPlan.modules.length - 1) {
        setCurrentQuizModule(prev => prev + 1)
      }
    }, 1500)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setQuizScore(0)
    setAnsweredQuestions(new Array(localPlan?.modules[currentQuizModule]?.quiz.length || 0).fill(false))
  }

  const getContentTypeConfig = (contentType: string) => {
    switch (contentType) {
      case 'quiz':
        return {
          icon: <Brain className="h-4 w-4" />,
          bgColor: 'bg-blue-50 dark:bg-gray-700',
          borderColor: 'border-blue-200 dark:border-gray-600',
          textColor: 'text-blue-800 dark:text-gray-100',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'
        }
      case 'presentation':
        return {
          icon: <FileText className="h-4 w-4" />,
          bgColor: 'bg-green-50 dark:bg-gray-700',
          borderColor: 'border-green-200 dark:border-gray-600',
          textColor: 'text-green-800 dark:text-gray-100',
          badgeColor: 'bg-green-100 text-green-800 border-green-200 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'
        }
      case 'reading':
        return {
          icon: <BookOpen className="h-4 w-4" />,
          bgColor: 'bg-gray-50 dark:bg-gray-700',
          borderColor: 'border-gray-200 dark:border-gray-600',
          textColor: 'text-gray-800 dark:text-gray-100',
          badgeColor: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'
        }
      case 'exercise':
        return {
          icon: <PenTool className="h-4 w-4" />,
          bgColor: 'bg-purple-50 dark:bg-gray-700',
          borderColor: 'border-purple-200 dark:border-gray-600',
          textColor: 'text-purple-800 dark:text-gray-100',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'
        }
      case 'assessment':
        return {
          icon: <ClipboardCheck className="h-4 w-4" />,
          bgColor: 'bg-red-50 dark:bg-gray-700',
          borderColor: 'border-red-200 dark:border-gray-600',
          textColor: 'text-red-800 dark:text-gray-100',
          badgeColor: 'bg-red-100 text-red-800 border-red-200 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'
        }
      default:
        return {
          icon: <BookOpen className="h-4 w-4" />,
          bgColor: 'bg-gray-50 dark:bg-gray-700',
          borderColor: 'border-gray-200 dark:border-gray-600',
          textColor: 'text-gray-800 dark:text-gray-100',
          badgeColor: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'
        }
    }
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // Loading skeleton component
  const SkeletonLoader = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h1 className="font-semibold">Learning Plan</h1>
        </div>
      </div>

      {/* Loading content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Plan Header Skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
          
          <div className="flex gap-2 mt-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 animate-pulse"></div>
          </div>
        </div>

        {/* Toggle Skeleton */}
        <div className="flex justify-center">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-48"></div>
        </div>

        {/* Module Skeletons */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                    <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Show loading state when explicitly loading or when no plan exists but loading
  if (isLoading || (!plan && isLoading)) {
    return <SkeletonLoader />
  }

  // Empty state when no plan and not loading
  if (!plan) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h1 className="font-semibold">Learning Plan</h1>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <div>
              <h3 className="text-lg font-medium mb-2">Learning plan will appear here</h3>
              <p className="text-muted-foreground">
                Start chatting to generate a personalized learning plan with modules, timelines, and resources.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h1 className="font-semibold">Learning Plan</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-3">
          {/* Plan Header */}
          <div className="space-y-2">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">{localPlan.title}</h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{localPlan.description}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{localPlan.duration}</span>
              </div>
              <Badge variant="outline" className={`text-xs ${getSkillLevelColor(localPlan.skillLevel)}`}>
                {localPlan.skillLevel}
              </Badge>
              <div className="flex items-center gap-1 text-xs">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span>{localPlan.totalProgress}% Complete</span>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{localPlan.totalProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${localPlan.totalProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mode Toggle Above Sections */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === 'learning' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('learning')}
                className="h-6 px-2 text-xs"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Learning Plan
              </Button>
              <Button
                variant={viewMode === 'practice' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('practice')}
                className="h-6 px-2 text-xs"
              >
                <Brain className="h-3 w-3 mr-1" />
                Quiz Mode
              </Button>
            </div>
          </div>

          {viewMode === 'learning' ? (
            /* Learning Plan Sections */
            <div className="space-y-2">
              {localPlan.modules.map((module, index) => {
                const isExpanded = expandedSections.has(module.id)
                const config = getContentTypeConfig(module.contentType)
                
                return (
                  <Card key={module.id} className={`${config.bgColor} ${config.borderColor} border rounded-md overflow-hidden transition-all duration-300 dark:!bg-gray-700 dark:!border-gray-600`}>
                    {/* Section Header */}
                    <CardHeader 
                      className="p-2 cursor-pointer hover:bg-opacity-80 transition-colors"
                      onClick={() => toggleSection(module.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {isExpanded ? 
                              <ChevronDown className="h-3 w-3 transition-transform duration-200" /> : 
                              <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                            }
                            <span className="text-xs font-medium text-muted-foreground">
                              Module {index + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {module.completed ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <Circle className="h-3 w-3 text-muted-foreground" />
                            )}
                            {module.quizCompleted && (
                              <Brain className="h-3 w-3 text-blue-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className={`text-xs ${config.badgeColor}`}>
                            <span className="mr-1">{config.icon}</span>
                            {module.contentType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-2 w-2 mr-1" />
                            {module.duration}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-1">
                        <h3 className={`text-sm font-semibold ${config.textColor} dark:!text-gray-100`}>{module.title}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-xs font-medium">{module.progress}%</div>
                          <div className="w-16 bg-white/50 dark:bg-gray-600 rounded-full h-1">
                            <div
                              className="bg-primary h-1 rounded-full transition-all duration-300"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Expandable Content */}
                    <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <CardContent className="p-2 pt-0">
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600 dark:text-gray-300">{module.description}</p>
                          
                          {/* Lessons */}
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">
                              Lessons ({module.lessons.filter(l => l.completed).length}/{module.lessons.length})
                            </div>
                            {module.lessons.map((lesson) => {
                              const lessonConfig = getContentTypeConfig(lesson.contentType)
                              return (
                                <div key={lesson.id} className="flex items-center justify-between py-1 px-1.5 bg-white/50 dark:!bg-gray-600/50 rounded-md">
                                  <div className="flex items-center gap-1.5 flex-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() => toggleLessonCompletion(module.id, lesson.id)}
                                    >
                                      {lesson.completed ? (
                                        <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                                      ) : (
                                        <Circle className="h-2.5 w-2.5 text-muted-foreground" />
                                      )}
                                    </Button>
                                    <div className="flex-1 min-w-0">
                                      <div className={`text-xs font-medium truncate ${lesson.completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {lesson.title}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Badge variant="outline" className={`text-xs ${lessonConfig.badgeColor}`}>
                                      {lessonConfig.icon}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* Quiz Mode View */
            <div className="space-y-3">
              {localPlan.modules[currentQuizModule] && (
                <>
                  {/* Quiz Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold">Quiz: {localPlan.modules[currentQuizModule].title}</h2>
                        <p className="text-xs text-muted-foreground">
                          Module {currentQuizModule + 1} of {localPlan.modules.length}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetQuiz}
                        className="gap-1 h-7 px-2 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </Button>
                    </div>

                    {/* Quiz Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Question {currentQuestion + 1} of {localPlan.modules[currentQuizModule].quiz.length}</span>
                        <span>Score: {quizScore}/{answeredQuestions.filter(Boolean).length}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuestion + (showFeedback ? 1 : 0)) / localPlan.modules[currentQuizModule].quiz.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Current Question */}
                  {currentQuestion < localPlan.modules[currentQuizModule].quiz.length ? (
                    <Card className="border-2 border-primary/20">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold">
                            {localPlan.modules[currentQuizModule].quiz[currentQuestion].question}
                          </h3>
                          
                          <div className="space-y-2">
                            {localPlan.modules[currentQuizModule].quiz[currentQuestion].options.map((option, index) => {
                              const isSelected = selectedAnswer === index
                              const isCorrect = index === localPlan.modules[currentQuizModule].quiz[currentQuestion].correctAnswer
                              const showResult = showFeedback
                              
                              let buttonClass = "w-full justify-start text-left p-2 h-auto transition-all duration-200 "
                              
                              if (showResult) {
                                if (isCorrect) {
                                  buttonClass += "bg-green-100 border-green-300 text-green-800 hover:bg-green-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-600"
                                } else if (isSelected && !isCorrect) {
                                  buttonClass += "bg-red-100 border-red-300 text-red-800 hover:bg-red-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                                } else {
                                  buttonClass += "bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                }
                              } else {
                                buttonClass += isSelected 
                                  ? "bg-primary/10 border-primary text-primary" 
                                  : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                              }
                              
                              return (
                                <Button
                                  key={index}
                                  variant="outline"
                                  className={buttonClass}
                                  onClick={() => handleAnswerSelect(index)}
                                  disabled={showFeedback}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                      showResult && isCorrect 
                                        ? "bg-green-600 border-green-600 text-white" 
                                        : showResult && isSelected && !isCorrect
                                        ? "bg-red-600 border-red-600 text-white"
                                        : isSelected
                                        ? "bg-primary border-primary text-white"
                                        : "border-gray-300 dark:border-gray-600"
                                    }`}>
                                      {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="flex-1 text-xs">{option}</span>
                                    {showResult && isCorrect && (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                </Button>
                              )
                            })}
                          </div>

                          {/* Feedback */}
                          {showFeedback && (
                            <div className={`p-3 rounded-lg animate-in fade-in duration-300 ${
                              selectedAnswer === localPlan.modules[currentQuizModule].quiz[currentQuestion].correctAnswer
                                ? "bg-green-50 border border-green-200 dark:bg-gray-700 dark:border-gray-600"
                                : "bg-red-50 border border-red-200 dark:bg-gray-800 dark:border-gray-700"
                            }`}>
                              <p className={`font-medium mb-1 text-xs ${
                                selectedAnswer === localPlan.modules[currentQuizModule].quiz[currentQuestion].correctAnswer
                                  ? "text-green-800 dark:text-gray-100"
                                  : "text-red-800 dark:text-gray-100"
                              }`}>
                                {selectedAnswer === localPlan.modules[currentQuizModule].quiz[currentQuestion].correctAnswer
                                  ? "Correct!"
                                  : "Incorrect"}
                              </p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {localPlan.modules[currentQuizModule].quiz[currentQuestion].explanation}
                              </p>
                            </div>
                          )}

                          {/* Submit Button */}
                          {!showFeedback && (
                            <Button
                              onClick={handleSubmitAnswer}
                              disabled={selectedAnswer === null}
                              className="w-full gap-2 h-8 text-xs"
                            >
                              Submit Answer
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // Quiz Complete
                    <Card className="border-2 border-green-200 bg-green-50 dark:border-gray-600 dark:bg-gray-700">
                      <CardContent className="p-4 text-center">
                        <div className="space-y-3">
                          <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
                          <div>
                            <h3 className="text-lg font-bold text-green-800 dark:text-gray-100 mb-1">Quiz Complete!</h3>
                            <p className="text-green-700 dark:text-gray-200 mb-3 text-sm">
                              You scored {quizScore} out of {localPlan.modules[currentQuizModule].quiz.length}
                            </p>
                            {currentQuizModule < localPlan.modules.length - 1 && (
                              <p className="text-xs text-green-600 dark:text-gray-300">
                                Moving to next module...
                              </p>
                            )}
                          </div>
                          
                          {/* Module Navigation */}
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentQuizModule(Math.max(0, currentQuizModule - 1))}
                              disabled={currentQuizModule === 0}
                              className="gap-1 h-7 px-2 text-xs"
                            >
                              <ArrowLeft className="h-3 w-3" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentQuizModule(Math.min(localPlan.modules.length - 1, currentQuizModule + 1))}
                              disabled={currentQuizModule === localPlan.modules.length - 1}
                              className="gap-1 h-7 px-2 text-xs"
                            >
                              Next
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}