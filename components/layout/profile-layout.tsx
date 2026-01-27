"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Header } from "./header"
import { useAppSelector } from "@/lib/store"

interface ProfileLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function ProfileLayout({ children, title, subtitle }: ProfileLayoutProps) {
  const router = useRouter()
  const { profile } = useAppSelector((state) => state.auth)

  // Map dashboard to permission key
  const dashboardSwitchPermissions = [
    { key: "admin", label: "Admin Dashboard", perm: "admin_panel" },
    { key: "drivers", label: "Driver Dashboard", perm: "driver_ui" },
    { key: "data-capture", label: "Production Processes", perm: "data_capture_module" },
    { key: "tools", label: "Tools", perm: "settings" },
  ]

  // Get allowed switches based on user permissions
  const allowedViews: string[] =
    profile?.users_role_id_fkey?.views && Array.isArray(profile.users_role_id_fkey.views)
      ? profile.users_role_id_fkey.views
      : []

  const allowedSwitches = dashboardSwitchPermissions.filter(sw =>
    allowedViews.includes(sw.perm)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header title={title} subtitle={subtitle} allowedSwitches={allowedSwitches} />

      {/* Main Content */}
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Page Content */}
          <div>{children}</div>
        </div>
      </main>
    </div>
  )
}
