"use client"

import { useState } from "react"
import { Users, Search, MoreHorizontal, Mail, Phone, MapPin, Star, UserPlus, Download, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const allParticipants = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    age: 28,
    occupation: "UX Designer",
    experience: "5+ years",
    expertise: ["UI/UX", "Mobile Apps", "Web Design"],
    rating: 4.9,
    completedStudies: 12,
    status: "Available",
    joinDate: "Jan 2024",
    avatar: "SC"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    email: "m.rodriguez@email.com",
    phone: "+1 (555) 234-5678",
    location: "Austin, TX",
    age: 34,
    occupation: "Product Manager",
    experience: "8+ years",
    expertise: ["Product Strategy", "User Research", "Analytics"],
    rating: 4.8,
    completedStudies: 18,
    status: "Busy",
    joinDate: "Nov 2023",
    avatar: "MR"
  },
  {
    id: 3,
    name: "Emily Johnson",
    email: "emily.j@email.com",
    phone: "+1 (555) 345-6789",
    location: "New York, NY",
    age: 25,
    occupation: "Software Engineer",
    experience: "3+ years",
    expertise: ["Frontend Development", "React", "JavaScript"],
    rating: 4.7,
    completedStudies: 8,
    status: "Available",
    joinDate: "Mar 2024",
    avatar: "EJ"
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@email.com",
    phone: "+1 (555) 456-7890",
    location: "Seattle, WA",
    age: 42,
    occupation: "Marketing Director",
    experience: "15+ years",
    expertise: ["Digital Marketing", "Brand Strategy", "Consumer Insights"],
    rating: 4.9,
    completedStudies: 25,
    status: "Available",
    joinDate: "Aug 2023",
    avatar: "DK"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    email: "lisa.thompson@email.com",
    phone: "+1 (555) 567-8901",
    location: "Denver, CO",
    age: 31,
    occupation: "Data Analyst",
    experience: "6+ years",
    expertise: ["Data Analysis", "Business Intelligence", "SQL"],
    rating: 4.6,
    completedStudies: 14,
    status: "Available",
    joinDate: "Feb 2024",
    avatar: "LT"
  },
  {
    id: 6,
    name: "James Wilson",
    email: "james.wilson@email.com",
    phone: "+1 (555) 678-9012",
    location: "Chicago, IL",
    age: 29,
    occupation: "Graphic Designer",
    experience: "4+ years",
    expertise: ["Visual Design", "Branding", "Illustration"],
    rating: 4.8,
    completedStudies: 10,
    status: "Busy",
    joinDate: "Dec 2023",
    avatar: "JW"
  },
  {
    id: 7,
    name: "Amanda Foster",
    email: "amanda.foster@email.com",
    phone: "+1 (555) 789-0123",
    location: "Boston, MA",
    age: 36,
    occupation: "Project Manager",
    experience: "10+ years",
    expertise: ["Project Management", "Agile", "Team Leadership"],
    rating: 4.9,
    completedStudies: 22,
    status: "Available",
    joinDate: "Oct 2023",
    avatar: "AF"
  },
  {
    id: 8,
    name: "Robert Lee",
    email: "robert.lee@email.com",
    phone: "+1 (555) 890-1234",
    location: "Los Angeles, CA",
    age: 27,
    occupation: "Content Creator",
    experience: "3+ years",
    expertise: ["Content Strategy", "Social Media", "Video Production"],
    rating: 4.5,
    completedStudies: 6,
    status: "Available",
    joinDate: "May 2024",
    avatar: "RL"
  }
]

export default function ParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")

  // Filter participants based on search and filters
  const filteredParticipants = allParticipants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || participant.status.toLowerCase() === statusFilter.toLowerCase()
    
    const matchesExperience = experienceFilter === "all" || 
      (experienceFilter === "entry" && participant.experience.includes("1-3")) ||
      (experienceFilter === "mid" && (participant.experience.includes("3-5") || participant.experience.includes("4+") || participant.experience.includes("5+") || participant.experience.includes("6+"))) ||
      (experienceFilter === "senior" && (participant.experience.includes("8+") || participant.experience.includes("10+") || participant.experience.includes("15+")))
    
    return matchesSearch && matchesStatus && matchesExperience
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-700'
      case 'busy':
        return 'bg-red-100 text-red-700'
      case 'inactive':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Research Participants</h1>
          <p className="text-muted-foreground">Connect with qualified research participants</p>
        </div>
        <div className="flex gap-2">
          <Button appearance="primary" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button appearance="primary">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Participant
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold text-foreground">{allParticipants.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {allParticipants.filter(p => p.status === 'Available').length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(allParticipants.reduce((acc, p) => acc + p.rating, 0) / allParticipants.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Studies</p>
                <p className="text-2xl font-bold text-foreground">
                  {allParticipants.reduce((acc, p) => acc + p.completedStudies, 0)}
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
                placeholder="Search participants by name, email, or skills..."
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience</SelectItem>
                  <SelectItem value="entry">Entry (1-3 years)</SelectItem>
                  <SelectItem value="mid">Mid (3-8 years)</SelectItem>
                  <SelectItem value="senior">Senior (8+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredParticipants.map((participant) => (
          <Card key={participant.id} className="hover:shadow-lg transition-shadow group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {participant.avatar}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {participant.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{participant.occupation}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      View Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(participant.status)}>
                  {participant.status}
                </Badge>
                <div className="flex items-center gap-1">
                  {renderStars(participant.rating)}
                  <span className="text-sm text-muted-foreground ml-1">({participant.rating})</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{participant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{participant.location}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Experience</p>
                <p className="text-sm text-muted-foreground">{participant.experience}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Expertise</p>
                <div className="flex flex-wrap gap-1">
                  {participant.expertise.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {participant.expertise.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{participant.expertise.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">{participant.completedStudies}</span> studies completed
                </div>
                <div className="text-xs text-muted-foreground">
                  Joined {participant.joinDate}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredParticipants.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No participants found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || experienceFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Start building your participant network"}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Participants
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}