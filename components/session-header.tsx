"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SessionHeaderProps {
  showSidebarTrigger?: boolean
  className?: string
}

export function SessionHeader({ showSidebarTrigger = true, className = "" }: SessionHeaderProps) {
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    await signOut()
    router.push("/login")
  }, [router])

  return (
    <header className={`flex h-16 shrink-0 items-center gap-2 border-b bg-background px-6 ${className}`}>
      {showSidebarTrigger && <SidebarTrigger className="-ml-1" />}
      <div className="ml-auto">
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button 
            onClick={handleSignOut}
            variant="outline"
            size="sm"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}