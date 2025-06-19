import { useSession } from "@/lib/auth-client"
import { BarChart3, FileText, MessageSquare, Users, Calendar, TrendingUp, Eye, Mail, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button" 

export default function ComponentPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Button Components Test</h1>
        
        {/* Button Style Comparison Section */}
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Button Style Comparison</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Original shadcn/ui styles:</h4>
              <div className="flex gap-2 flex-wrap">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Supabase-style buttons (using appearance prop):</h4>
              <div className="flex gap-2 flex-wrap">
                <Button appearance="primary">Primary</Button>
                <Button appearance="default">Default</Button>
                <Button appearance="secondary">Secondary</Button>
                <Button appearance="outline">Outline</Button>
                <Button appearance="ghost">Ghost</Button>
                <Button appearance="warning">Warning</Button>
                <Button appearance="destructive">Destructive</Button>
                <Button appearance="link">Link</Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Supabase buttons with icons and loading states:</h4>
              <div className="flex gap-2 flex-wrap">
                <Button appearance="primary" icon={<Mail />}>Send Email</Button>
                <Button appearance="primary" iconRight={<Plus />}>Add Project</Button>
                <Button appearance="primary" loading>Loading...</Button>
                <Button appearance="outline" icon={<FileText />}>Export Data</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}