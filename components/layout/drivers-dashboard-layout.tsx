"use client"

import type React from "react"
import { useState } from "react"
import { DriversSidebar } from "./drivers-sidebar"
import { MobileDriversLayout } from "./mobile-drivers-layout"
import { Header } from "./header"

interface DriversDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function DriversDashboardLayout({ children, title, subtitle }: DriversDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden">
        <MobileDriversLayout title={title} subtitle={subtitle}>
          {children}
        </MobileDriversLayout>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen from-[#f8f9ff] via-[#f0f2ff] to-[#e8ebff]">
        <DriversSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex flex-1 flex-col">
          <Header title={title} subtitle={subtitle} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </>
  )
}
