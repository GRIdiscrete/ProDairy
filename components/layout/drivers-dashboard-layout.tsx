"use client"

import type React from "react"
import { useState } from "react"
import { DriversSidebar } from "./drivers-sidebar"
import { Header } from "./header"

interface DriversDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function DriversDashboardLayout({ children, title, subtitle }: DriversDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen from-[#f8f9ff] via-[#f0f2ff] to-[#e8ebff]">
      {/* Hide sidebar on small screens */}
      <div className="hidden md:block">
        <DriversSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>
      <div className="flex flex-1 flex-col">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
