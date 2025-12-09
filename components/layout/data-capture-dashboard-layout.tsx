"use client"

import type React from "react"
import { useState } from "react"
import { DataCaptureSidebar } from "./data-capture-sidebar"
import { Header } from "./header"
import { useTablet } from "@/hooks/use-tablet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

interface DataCaptureDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function DataCaptureDashboardLayout({ children, title, subtitle }: DataCaptureDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isTablet, isLandscape } = useTablet()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const renderTabletDrawerToggle = () => (
    <div className="px-3 pt-2 md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-white from-[#f8f9ff] via-[#f0f2ff] to-[#e8ebff] overflow-hidden">
      {!isTablet ? (
        <DataCaptureSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      ) : null}
      <div 
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: !isTablet ? (sidebarCollapsed ? '80px' : '272px') : 0 }}
      >
        <Header title={title} subtitle={subtitle} onOpenSidebar={() => setDrawerOpen(true)} />
        <main className="flex-1 p-6 overflow-hidden">{children}</main>
      </div>

      {isTablet && (
        <Drawer direction="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="p-0">
            <DrawerHeader className="px-3 py-2">
              <DrawerTitle className="text-sm font-light">Navigation</DrawerTitle>
            </DrawerHeader>
            {/* Render sidebar inside drawer; collapsed ignored in drawer mode */}
            <div className="h-[calc(100vh-56px)] overflow-y-auto">
              <DataCaptureSidebar collapsed={false} onToggle={() => setDrawerOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
