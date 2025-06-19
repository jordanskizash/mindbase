"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, FileText, MessageSquare, Settings, Users, Wrench } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { memo } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Prompt Lab",
    icon: BarChart3,
    url: "/dashboard",
  },
  {
    title: "Courses",
    icon: FileText,
    url: "/dashboard/courses",
  },
  {
    title: "Participants",
    icon: Users,
    url: "/dashboard/participants",
  },
  {
    title: "Feedback",
    icon: MessageSquare,
    url: "/dashboard/feedback",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/dashboard/settings",
  },
  {
    title: "Components",
    icon: Wrench,
    url: "/dashboard/components",
  }
]

export const AppSidebar = memo(function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (session?.user.name) {
      const names = session.user.name.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return names[0].substring(0, 2).toUpperCase()
    }
    return session?.user.email?.substring(0, 2).toUpperCase() || 'U'
  }
  
  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="px-4 h-16 flex items-left">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {getUserInitials()}
            </span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-sidebar-foreground">
              {session?.user.name || session?.user.email || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/70">Admin</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url} 
                    tooltip={item.title}
                    className="hover:bg-gray-200 dark:hover:bg-gray-500 hover:text-foreground rounded-md transition-colors data-[active=true]:bg-gray-200 dark:data-[active=true]:bg-gray-500 data-[active=true]:text-foreground data-[active=true]:font-semibold"
                  >
                    <Link 
                      href={item.url} 
                      className="flex items-center gap-3"
                      prefetch={true}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
})