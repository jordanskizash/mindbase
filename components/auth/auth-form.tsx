"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, signUp, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import * as THREE from 'three'

// Interference Wave Background Component
const InterferenceWaveBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    let animationFrameId: number | null = null
    let scene: any = null
    let camera: any = null
    let renderer: any = null
    let lineGroups: any[] = []

    interface WaveSourceProps {
      position: [number, number, number]
      frequency: number
      amplitude: number
      phase: number
    }

    const createWaveSources = (time: number, scale: number): WaveSourceProps[] => {
      const result: WaveSourceProps[] = []
      const count = 5

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        const radius = scale * (1 + Math.sin(angle * 3) * 0.2)
        result.push({
          position: [
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
          ],
          frequency: 2 + Math.sin(angle * 2),
          amplitude: 0.3 + Math.cos(angle) * 0.1,
          phase: time * 3 + angle
        })
      }

      result.push({
        position: [0, 0, 0],
        frequency: 3,
        amplitude: 0.4,
        phase: time * 4
      })

      return result
    }

    const createInterferenceField = (sources: WaveSourceProps[], size: number, resolution: number, time: number) => {
      const step = size / resolution
      const heightMap: number[][] = []

      for (let i = 0; i <= resolution; i++) {
        heightMap[i] = []
        const x = (i * step) - (size / 2)
        for (let j = 0; j <= resolution; j++) {
          const z = (j * step) - (size / 2)
          let height = 0

          sources.forEach(({ position: [sx, sy, sz], frequency, amplitude, phase }) => {
            const dx = x - sx
            const dz = z - sz
            const distance = Math.sqrt(dx * dx + dz * dz)
            height += Math.sin(distance * frequency - time * 5 + phase) * amplitude * Math.exp(-distance * 0.3)
          })

          heightMap[i][j] = height
        }
      }

      const linesMaterial = new THREE.LineBasicMaterial({
        color: 0xFF4B18,
        transparent: true,
        opacity: 0.15
      })

      const linesGroup = new THREE.Group()
      lineGroups.push(linesGroup)

      for (let i = 0; i <= resolution; i++) {
        const geometry = new THREE.BufferGeometry()
        const points = []
        const x = (i * step) - (size / 2)
        for (let j = 0; j <= resolution; j++) {
          const z = (j * step) - (size / 2)
          points.push(x, heightMap[i][j], z)
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
        const line = new THREE.Line(geometry, linesMaterial)
        linesGroup.add(line)
      }

      for (let j = 0; j <= resolution; j++) {
        const geometry = new THREE.BufferGeometry()
        const points = []
        const z = (j * step) - (size / 2)
        for (let i = 0; i <= resolution; i++) {
          const x = (i * step) - (size / 2)
          points.push(x, heightMap[i][j], z)
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
        const line = new THREE.Line(geometry, linesMaterial)
        linesGroup.add(line)
      }

      return linesGroup
    }

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    const dpr = window.devicePixelRatio || 1

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    
    renderer.setPixelRatio(Math.min(dpr, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0xF0EEE6)
    container.appendChild(renderer.domElement)

    camera.position.set(0, 0, 6)
    camera.lookAt(0, 0, 0)

    const mainGroup = new THREE.Group()
    scene.add(mainGroup)

    let time = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      time += 0.0013

      mainGroup.children.forEach((child: any) => {
        if (child instanceof THREE.Group) {
          child.children.forEach((line: any) => {
            if (line.geometry) line.geometry.dispose()
            if (line.material) line.material.dispose()
          })
          mainGroup.remove(child)
        }
      })

      lineGroups = []

      const sources1 = createWaveSources(time, 1.5)
      const field1 = createInterferenceField(sources1, 1.5 * 4, 32, time)
      mainGroup.add(field1)

      const sources2 = createWaveSources(time + 0.33, 0.8)
      const field2 = createInterferenceField(sources2, 0.8 * 4, 32, time + 0.33)
      field2.position.set(0, 1.5, 0)
      field2.rotation.set(Math.PI/6, 0, Math.PI/4)
      mainGroup.add(field2)

      const sources3 = createWaveSources(time + 0.66, 0.8)
      const field3 = createInterferenceField(sources3, 0.8 * 4, 32, time + 0.66)
      field3.position.set(0, -1.5, 0)
      field3.rotation.set(-Math.PI/6, 0, -Math.PI/4)
      mainGroup.add(field3)

      mainGroup.rotation.y = Math.sin(time * 0.3) * 0.2
      mainGroup.rotation.x = Math.cos(time * 0.2) * 0.1

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      const dpr = window.devicePixelRatio || 1

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(dpr, 2))
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (renderer) {
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
      if (scene) {
        scene.traverse((object: any) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose()
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material: any) => material.dispose())
              } else {
                object.material.dispose()
              }
            }
          } else if (object instanceof THREE.Line) {
            if (object.geometry) object.geometry.dispose()
            if (object.material) object.material.dispose()
          }
        })
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ 
        background: '#F0EEE6',
        overflow: 'hidden'
      }}
    />
  )
}

export default function ImprovedAuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const { data: session, isPending } = useSession()

  // Redirect to dashboard when user is authenticated
  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard")
    }
  }, [session, isPending, router])

  // Show loading while checking existing session
  if (isPending) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{ fontFamily: 'ui-monospace, "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace' }}>
        <InterferenceWaveBackground />
        <div className="text-center relative z-10">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is already logged in, don't show the form
  if (session) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{ fontFamily: 'ui-monospace, "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace' }}>
        <InterferenceWaveBackground />
        <div className="text-center relative z-10">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || "Failed to sign in")
        return
      }

      setSuccess("Signed in successfully! Redirecting...")
      // Redirect will happen automatically via useEffect when session is detected
    } catch (error) {
      console.error('Sign in error:', error)
      setError("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        setError(result.error.message || "Failed to create account")
        return
      }

      // Check if email confirmation is required
      if (result.data?.user && !result.data?.session) {
        setSuccess("Account created! Please check your email and click the confirmation link to complete registration.")
        setIsLoading(false)
        return
      }

      setSuccess("Account created successfully! Redirecting...")
      // Redirect will happen automatically via useEffect when session is detected
    } catch (error) {
      console.error('Sign up error:', error)
      setError("An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4" 
      style={{ 
        fontFamily: 'ui-monospace, "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace'
      }}
    >
      <style jsx global>{`
        /* Enable text selection highlighting */
        * {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
        
        /* Force all text to be black */
        *, *::before, *::after {
          color: black !important;
        }
        
        /* Custom text selection color */
        ::selection {
          background-color: rgba(255, 75, 24, 0.2);
          color: black !important;
        }
        
        ::-moz-selection {
          background-color: rgba(255, 75, 24, 0.2);
          color: black !important;
        }
        
        /* Larger password dots */
        input[type="password"] {
          font-size: 18px !important;
          line-height: 1.5 !important;
        }
        
        /* Adjust input placeholder and regular text size back to normal */
        input[type="password"]::placeholder {
          font-size: 14px !important;
          letter-spacing: normal !important;
        }
        
        input[type="password"]:not(:placeholder-shown) {
          font-size: 14px !important;
          letter-spacing: 4px !important;
        }
      `}</style>
              <InterferenceWaveBackground />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6 shadow-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#FF4B18' }}>
              <svg className="w-8 h-8 text-white p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h1>
          <p className="text-gray-600">Connect companies with research participants</p>
        </div>

        {        /* Auth Card */}
        <Card className="shadow-2xl border-0 bg-white/20 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}
            
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-colors"
                    style={{ fontFamily: 'inherit' }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Type your email"
                  required
                  className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-colors"
                  style={{ fontFamily: 'inherit' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Type your password"
                  required
                  className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-colors"
                  style={{ fontFamily: 'inherit' }}
                />
              </div>
              
              {!isSignUp && (
                <div className="text-right">
                  <a href="#" className="text-sm font-medium" style={{ color: '#FF4B18' }}>
                    Forgot Password?
                  </a>
                </div>
              )}
              
              <Button 
                type="submit"
                className="w-full h-12 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={isLoading}
                style={{ 
                  backgroundColor: '#FF4B18',
                  fontFamily: 'inherit'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign in'
                )}
              </Button>
            </form>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                <button 
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError("")
                    setSuccess("")
                  }}
                  className="font-medium transition-colors"
                  style={{ color: '#FF4B18' }}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{" "}
            <a href="#" className="font-medium transition-colors" style={{ color: '#FF4B18' }}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium transition-colors" style={{ color: '#FF4B18' }}>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}