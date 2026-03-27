"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { humanizeModule } from "@/lib/api/notifications"

interface NotificationsSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function NotificationsSidebar({ collapsed, onToggle }: NotificationsSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentModule = searchParams.get('module') || 'all'

  // Available modules for filtering
  const modules = [
    { id: 'all', name: 'All Modules', icon: Bell, color: 'text-blue-600', count: 0 },
    { id: 'admin', name: 'Admin', icon: Info, color: 'text-purple-600', count: 0 },
    { id: 'data-capture', name: 'Data Capture', icon: CheckCircle, color: 'text-green-600', count: 0 },
    { id: 'drivers', name: 'Drivers', icon: AlertCircle, color: 'text-orange-600', count: 0 },
    { id: 'tools', name: 'Tools', icon: Clock, color: 'text-cyan-600', count: 0 },
  ]

  const handleModuleSelect = (moduleId: string) => {
    const qs = new URLSearchParams()
    if (moduleId !== 'all') {
      qs.set('module', moduleId)
    }
    router.push(`/notifications${qs.toString() ? `?${qs.toString()}` : ''}`)
  }

  const clearFilter = () => {
    router.push('/notifications')
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-full bg-white border-r border-zinc-200 transition-all duration-300",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-zinc-900">Notifications</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 hover:bg-zinc-100"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar Content */}
      <div className="flex flex-col h-full">
        {/* Filter Section */}
        {!collapsed && (
          <div className="p-4 border-b border-zinc-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-700">Filter by Module</span>
              </div>
              {currentModule !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilter}
                  className="h-6 px-2 text-xs text-zinc-500 hover:text-zinc-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Module List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {modules.map((module) => {
              const isActive = currentModule === module.id
              const IconComponent = module.icon
              
              return (
                <Button
                  key={module.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => handleModuleSelect(module.id)}
                  className={cn(
                    "w-full justify-start h-auto p-3 transition-all duration-200",
                    collapsed ? "px-2" : "px-3",
                    isActive 
                      ? "bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100" 
                      : "hover:bg-zinc-50 text-zinc-700"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <IconComponent className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive ? "text-blue-600" : module.color
                    )} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left font-medium">
                          {module.name}
                        </span>
                        {module.count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {module.count}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-zinc-200">
            <div className="text-xs text-zinc-500 text-center">
              <p>Notifications Center</p>
              <p className="mt-1">Stay updated with latest activities</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
