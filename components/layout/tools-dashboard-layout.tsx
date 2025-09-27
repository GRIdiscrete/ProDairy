"use client"

import type React from "react"
import { useState } from "react"
// import { ToolsSidebar } from "./tools-sidebar"
import { Header } from "./header"
import { ToolsSidebar } from "./tools-sidebar"

interface ToolsDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function ToolsDashboardLayout({ children, title, subtitle }: ToolsDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-white from-[#f8f9ff] via-[#f0f2ff] to-[#e8ebff] overflow-hidden">
      <ToolsSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div 
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '80px' : '272px' }}
      >
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}


