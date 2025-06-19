import { GeistMono } from "geist/font/mono"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${GeistMono.variable} font-mono`}>
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  )
}