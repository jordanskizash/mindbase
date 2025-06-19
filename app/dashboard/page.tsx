"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, MoreHorizontal, Plus, Search, X, ArrowRight, Paperclip, Grid3X3, Settings2, Globe, Edit3, Telescope, Lightbulb, Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useChatStore } from "@/lib/stores/chat-store"

interface Course {
  id: string
  title: string
  category: string
  tags: string[]
  level: string
  publishDate: string
  progress: number
  status: string
  duration: string
  description?: string
  sessionId: string
  planId?: string
  lastActivity?: number
}

export default function Dashboard() {
  const router = useRouter()
  const { loadSessions } = useChatStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [sortBy, setSortBy] = useState("publishDate")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [showToolsOptions, setShowToolsOptions] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toolsDropdownRef = useRef<HTMLDivElement>(null)

  // Fetch courses from database and load sessions
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Load sessions into chat store
        await loadSessions()
        
        // Fetch courses for display
        const response = await fetch('/api/user/learning-plans')
        if (!response.ok) {
          throw new Error('Failed to fetch courses')
        }
        
        const coursesData = await response.json()
        setCourses(coursesData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load your courses. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [loadSessions])

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

  const handleCreateWithAI = () => {
    if (aiPrompt.trim()) {
      const encodedPrompt = encodeURIComponent(aiPrompt)
      router.push(`/create?prompt=${encodedPrompt}`)
      setAiPrompt("") // Clear the input after navigation
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourses(filteredCourses.map((course) => course.id))
    } else {
      setSelectedCourses([])
    }
  }

  const handleSelectCourse = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses([...selectedCourses, courseId])
    } else {
      setSelectedCourses(selectedCourses.filter((id) => id !== courseId))
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.status.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
  switch (sortBy) {
    case "title":
      return a.title.localeCompare(b.title)
    case "category":
      return a.category.localeCompare(b.category)
    case "level":
      const levelOrder: { [key: string]: number } = { 
        Beginner: 1, 
        Intermediate: 2, 
        Advanced: 3 
      }
      return (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0)
    case "publishDate":
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    default:
      return 0
  }
})

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Not Started":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            {/* <h1 className="text-3xl font-bold tracking-tight">Learning Dashboard</h1>
            <p className="text-muted-foreground">Create and manage your AI-powered learning courses</p> */}
          </div>
          <div className="flex items-center gap-2">
            {/* <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Content Repository
            </Button> */}
          </div>
        </div>

        {/* Main Course Creation Interface */}
        <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 py-8">
          <div className="w-full max-w-4xl text-center">
            <h1 className="text-5xl font-normal text-foreground mb-8">Where should we begin?</h1>

            <div className="w-full max-w-3xl mx-auto">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-3xl border border-border/30 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Ask anything"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateWithAI()}
                      className="border-0 bg-transparent text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 h-auto"
                    />
                  </div>
                </div>

                {/* Tools and Add Options */}
                <div className="flex items-center justify-between mt-3 relative">
                  <div className="flex items-center gap-3">
                    <div className="relative" ref={dropdownRef}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddOptions(!showAddOptions)}
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
                            onClick={() => {
                              // Handle file upload
                              setShowAddOptions(false)
                            }}
                          >
                            <Paperclip className="h-4 w-4 mr-3" />
                            Add photos and files
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between rounded-lg h-12 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                            onClick={() => {
                              // Handle app integration
                              setShowAddOptions(false)
                            }}
                          >
                            <div className="flex items-center">
                              <Grid3X3 className="h-4 w-4 mr-3" />
                              Add from apps
                            </div>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={toolsDropdownRef}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowToolsOptions(!showToolsOptions)}
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
                            onClick={() => {
                              // Handle search the web
                              setShowToolsOptions(false)
                            }}
                          >
                            <Globe className="h-4 w-4 mr-3" />
                            Search the web
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start rounded-lg h-12 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                            onClick={() => {
                              // Handle write or code
                              setShowToolsOptions(false)
                            }}
                          >
                            <Edit3 className="h-4 w-4 mr-3" />
                            Write or code
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between rounded-lg h-12 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                            onClick={() => {
                              // Handle deep research
                              setShowToolsOptions(false)
                            }}
                          >
                            <div className="flex items-center">
                              <Telescope className="h-4 w-4 mr-3" />
                              Run deep research
                            </div>
                            <span className="text-xs text-muted-foreground">5 left</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start rounded-lg h-12 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 border-0"
                            onClick={() => {
                              // Handle think for longer
                              setShowToolsOptions(false)
                            }}
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
                      onClick={handleCreateWithAI}
                      disabled={!aiPrompt.trim()}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors border-0"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Courses ({filteredCourses.length})</CardTitle>
                <CardDescription>Manage and track your learning progress</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {selectedCourses.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedCourses([])}>
                    Clear Selection ({selectedCourses.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-muted-foreground">Loading your courses...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Failed to load courses</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && courses.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your learning journey by creating your first AI-powered course
                    </p>
                    <Button 
                      onClick={() => (document.querySelector('input[placeholder="Ask anything"]') as HTMLInputElement)?.focus()} 
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Course
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* No Search Results */}
            {!isLoading && !error && courses.length > 0 && filteredCourses.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or create a new course
                    </p>
                    <Button 
                      onClick={() => setSearchTerm("")} 
                      variant="outline"
                    >
                      Clear Search
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Table with Data */}
            {!isLoading && !error && filteredCourses.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-medium">Course Title</TableHead>
                      <TableHead className="font-medium">Category</TableHead>
                      <TableHead className="font-medium">Level</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Progress</TableHead>
                      <TableHead className="font-medium">Duration</TableHead>
                      <TableHead className="font-medium">Published</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCourses.map((course) => (
                    <TableRow 
                      key={course.id} 
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/session/${course.sessionId}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={(checked) => handleSelectCourse(course.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{course.title}</div>
                          <div className="flex flex-wrap gap-1">
                            {course.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{course.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[35px]">{course.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{course.duration}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(course.publishDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/session/${course.sessionId}`)}>
                              View Course
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Course</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
