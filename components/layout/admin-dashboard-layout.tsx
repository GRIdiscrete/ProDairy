"use client"

import type React from "react"
import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { Header } from "./header"
import { useAppSelector } from "@/lib/store"

interface AdminDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AdminDashboardLayout({ children, title, subtitle }: AdminDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
    <div className="flex min-h-screen bg-white">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex flex-1 flex-col">
        {/* Pass allowedSwitches to Header, or use directly in your switch UI */}
        <Header title={title} subtitle={subtitle} allowedSwitches={allowedSwitches} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}


