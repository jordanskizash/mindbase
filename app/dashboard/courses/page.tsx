"use client"

import { useState } from "react"
import { FileText, Search, Plus, MoreHorizontal, Edit, Copy, Trash2, Calendar, TrendingUp, Eye, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const allProjects = [
  {
    id: 1,
    title: "Mobile App Usability Study",
    description: "Testing user experience for our new mobile application with focus on navigation and core features",
    participants: 24,
    responses: 18,
    status: "Active",
    priority: "High",
    dueDate: "Dec 15, 2024",
    completionRate: 75,
    createdDate: "Nov 1, 2024",
    budget: "$5,000",
    category: "Usability Testing"
  },
  {
    id: 2,
    title: "Website Navigation Research",
    description: "Understanding how users navigate through our website and identifying pain points in the user journey",
    participants: 32,
    responses: 32,
    status: "Completed",
    priority: "Medium",
    dueDate: "Nov 30, 2024",
    completionRate: 100,
    createdDate: "Oct 15, 2024",
    budget: "$3,500",
    category: "User Research"
  },
  {
    id: 3,
    title: "Product Feature Feedback",
    description: "Gathering insights on new product features and understanding user preferences for upcoming releases",
    participants: 15,
    responses: 8,
    status: "Active",
    priority: "High",
    dueDate: "Dec 20, 2024",
    completionRate: 53,
    createdDate: "Nov 10, 2024",
    budget: "$2,800",
    category: "Feature Testing"
  },
  {
    id: 4,
    title: "Brand Perception Survey",
    description: "Measuring brand awareness and perception among target demographics to inform marketing strategy",
    participants: 50,
    responses: 12,
    status: "Active",
    priority: "Low",
    dueDate: "Jan 10, 2025",
    completionRate: 24,
    createdDate: "Nov 20, 2024",
    budget: "$4,200",
    category: "Market Research"
  },
  {
    id: 5,
    title: "E-commerce Checkout Flow",
    description: "Analyzing the checkout process to reduce cart abandonment and improve conversion rates",
    participants: 28,
    responses: 22,
    status: "Active",
    priority: "High",
    dueDate: "Dec 30, 2024",
    completionRate: 79,
    createdDate: "Nov 5, 2024",
    budget: "$3,800",
    category: "Conversion Optimization"
  },
  {
    id: 6,
    title: "Customer Support Experience",
    description: "Evaluating customer support touchpoints and identifying areas for service improvement",
    participants: 40,
    responses: 40,
    status: "Completed",
    priority: "Medium",
    dueDate: "Nov 25, 2024",
    completionRate: 100,
    createdDate: "Oct 20, 2024",
    budget: "$2,500",
    category: "Service Design"
  }
]

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  // Filter projects based on search and filters
  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesPriority = priorityFilter === "all" || project.priority.toLowerCase() === priorityFilter.toLowerCase()
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 hover:bg-green-100'
      case 'completed':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100'
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-orange-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Research Projects</h1>
          <p className="text-muted-foreground">Manage and track your research studies</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-foreground">{allProjects.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {allProjects.filter(p => p.status === 'Active').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allProjects.filter(p => p.status === 'Completed').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(allProjects.reduce((acc, p) => acc + p.completionRate, 0) / allProjects.length)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow group">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority} Priority
                    </span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground mb-1">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Participants</p>
                  <p className="font-medium text-foreground">{project.participants}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Responses</p>
                  <p className="font-medium text-foreground">{project.responses}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{project.completionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.completionRate}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Due {project.dueDate}
                </div>
                <div className="text-xs font-medium text-foreground">
                  {project.budget}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by creating your first research project"}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}