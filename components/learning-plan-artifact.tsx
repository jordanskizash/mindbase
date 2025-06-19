"use client"

import { useState, useEffect } from "react"
import { Eye, Edit3, Clock, Target, CheckCircle2, Circle, Calendar, BookOpen, ExternalLink, Play, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LearningModule {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  progress: number
  lessons: Array<{
    id: string
    title: string
    completed: boolean
    duration: string
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

interface CurrentStep {
  moduleId: string
  lessonId: string
}

interface LearningPlanArtifactProps {
  plan?: LearningPlan
  onPlanUpdate?: (updatedPlan: any) => void
}

export default function LearningPlanArtifact({ plan, onPlanUpdate }: LearningPlanArtifactProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview')
  const [activeTab, setActiveTab] = useState('modules')
  const [currentStep, setCurrentStep] = useState<CurrentStep | null>(null)
  const [localPlan, setLocalPlan] = useState(plan)

  // Update local plan when prop changes
  useEffect(() => {
    setLocalPlan(plan)
  }, [plan])

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

  const startLesson = (moduleId: string, lessonId: string) => {
    setCurrentStep({ moduleId, lessonId })
  }

  const getNextLesson = () => {
    if (!localPlan || !currentStep) return null

    const currentModuleIndex = localPlan.modules.findIndex(m => m.id === currentStep.moduleId)
    const currentModule = localPlan.modules[currentModuleIndex]
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentStep.lessonId)

    // Check if there's a next lesson in current module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      return {
        moduleId: currentStep.moduleId,
        lessonId: currentModule.lessons[currentLessonIndex + 1].id
      }
    }

    // Check if there's a next module
    if (currentModuleIndex < localPlan.modules.length - 1) {
      const nextModule = localPlan.modules[currentModuleIndex + 1]
      return {
        moduleId: nextModule.id,
        lessonId: nextModule.lessons[0].id
      }
    }

    return null
  }

  const goToNextLesson = () => {
    const nextLesson = getNextLesson()
    if (nextLesson) {
      setCurrentStep(nextLesson)
    }
  }

  const getCurrentLesson = () => {
    if (!localPlan || !currentStep) return null

    const module = localPlan.modules.find(m => m.id === currentStep.moduleId)
    const lesson = module?.lessons.find(l => l.id === currentStep.lessonId)
    return lesson ? { module, lesson } : null
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />
      case 'article':
        return <BookOpen className="h-4 w-4" />
      case 'book':
        return <BookOpen className="h-4 w-4" />
      case 'course':
        return <Target className="h-4 w-4" />
      case 'tool':
        return <ExternalLink className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  if (!plan) {
    return (
      <div className="h-full flex flex-col">
        {/* Header with toggles */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <h1 className="font-semibold">Learning Plan</h1>
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('preview')}
                className="h-7 px-3 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button
                variant={viewMode === 'edit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('edit')}
                className="h-7 px-3 text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
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
      {/* Header with toggles */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h1 className="font-semibold">Learning Plan</h1>
          </div>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="h-7 px-3 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button
              variant={viewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
              className="h-7 px-3 text-xs"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'preview' ? (
          currentStep ? (
            // Lesson View
            <div className="p-6 space-y-6">
              {(() => {
                const current = getCurrentLesson()
                if (!current) return null
                
                return (
                  <>
                    {/* Lesson Header */}
                    <div className="space-y-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ← Back to Overview
                      </Button>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {current.module.title}
                        </div>
                        <h2 className="text-2xl font-bold">{current.lesson.title}</h2>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{current.lesson.duration}</span>
                          </div>
                          <Badge variant={current.lesson.completed ? "default" : "secondary"}>
                            {current.lesson.completed ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Lesson Content */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Lesson Content</h3>
                            <p className="text-muted-foreground">
                              This is where the actual lesson content would be displayed. 
                              In a real implementation, this could include:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                              <li>Video content</li>
                              <li>Interactive exercises</li>
                              <li>Reading materials</li>
                              <li>Code examples</li>
                              <li>Quizzes and assessments</li>
                            </ul>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <Button
                              variant="outline"
                              onClick={() => toggleLessonCompletion(current.module.id, current.lesson.id)}
                            >
                              {current.lesson.completed ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark Incomplete
                                </>
                              ) : (
                                <>
                                  <Circle className="h-4 w-4 mr-2" />
                                  Mark Complete
                                </>
                              )}
                            </Button>
                            
                            {getNextLesson() && (
                              <Button onClick={goToNextLesson}>
                                Next Lesson →
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )
              })()}
            </div>
          ) : (
            // Module Overview
            <div className="p-6 space-y-6">
              {/* Plan Header */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{localPlan.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{localPlan.description}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{localPlan.duration}</span>
                  </div>
                  <Badge variant="outline" className={getSkillLevelColor(localPlan.skillLevel)}>
                    {localPlan.skillLevel}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{localPlan.totalProgress}% Complete</span>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{localPlan.totalProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${localPlan.totalProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tabs for different views */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="modules">Modules</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="modules" className="space-y-4 mt-6">
                  {localPlan.modules.map((module, index) => (
                    <Card key={module.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Module {index + 1}
                              </span>
                              {module.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{module.progress}%</div>
                            <div className="text-xs text-muted-foreground">{module.duration}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Lessons ({module.lessons.filter(l => l.completed).length}/{module.lessons.length})
                            </div>
                            {module.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between py-1 group">
                                <div className="flex items-center gap-2 flex-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => toggleLessonCompletion(module.id, lesson.id)}
                                  >
                                    {lesson.completed ? (
                                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Circle className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`text-sm justify-start p-0 h-auto font-normal hover:underline ${lesson.completed ? 'line-through text-muted-foreground' : ''}`}
                                    onClick={() => startLesson(module.id, lesson.id)}
                                  >
                                    {lesson.title}
                                  </Button>
                                </div>
                                <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    {localPlan.modules.map((module, index) => (
                      <div key={module.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${module.completed ? 'bg-green-600' : 'bg-muted-foreground'} mt-2`} />
                          {index < localPlan.modules.length - 1 && (
                            <div className="w-px h-16 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">Week {index + 1}</span>
                            <Badge variant="outline" size="sm">
                              {module.duration}
                            </Badge>
                          </div>
                          <h4 className="font-semibold mb-1">{module.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                          <div className="text-xs text-muted-foreground">
                            {module.lessons.length} lessons • {module.progress}% complete
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4 mt-6">
                  <div className="grid gap-4">
                    {localPlan.resources.map((resource) => (
                      <Card key={resource.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              {getResourceIcon(resource.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium text-sm mb-1">{resource.title}</h4>
                                  <p className="text-xs text-muted-foreground mb-2">{resource.description}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" size="sm" className="text-xs">
                                      {resource.type}
                                    </Badge>
                                    {resource.duration && (
                                      <span className="text-xs text-muted-foreground">{resource.duration}</span>
                                    )}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )
        ) : (
          <div className="p-6">
            <div className="text-center py-12">
              <Edit3 className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Edit Mode</h3>
              <p className="text-muted-foreground">
                Edit functionality will be implemented here for customizing the learning plan.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}