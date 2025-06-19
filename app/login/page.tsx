"use client"

import AuthForm from "@/components/auth/auth-form"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function LoginContent() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")

  useEffect(() => {
    const error = searchParams.get('error')
    const confirmed = searchParams.get('confirmed')
    
    if (error === 'confirmation-failed') {
      setMessage("Email confirmation failed. Please try again.")
      setMessageType("error")
    } else if (confirmed === 'true') {
      setMessage("Email confirmed successfully! You can now sign in.")
      setMessageType("success")
    }
  }, [searchParams])

  return (
    <div style={{ fontFamily: 'ui-monospace, "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace' }}>
      {message && (
        <div 
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-md shadow-lg backdrop-blur-sm ${
            messageType === "error" 
              ? "bg-red-50/95 border border-red-200 text-red-700" 
              : "bg-green-50/95 border border-green-200 text-green-700"
          }`}
        >
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
      <AuthForm />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthForm />}>
      <LoginContent />
    </Suspense>
  )
}