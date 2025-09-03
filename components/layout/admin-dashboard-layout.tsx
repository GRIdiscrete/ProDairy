"use client"

import type React from "react"
import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { Header } from "./header"

interface AdminDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AdminDashboardLayout({ children, title, subtitle }: AdminDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen from-[#f8f9ff] via-[#f0f2ff] to-[#e8ebff]">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex flex-1 flex-col">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}


