/**
 * Tablet Dashboard Layout
 * 
 * Optimized layout for tablets in landscape mode (1200x1920).
 * Features bottom navigation, larger touch targets, and tablet-specific patterns.
 */

"use client"

import { ReactNode, useState } from 'react'
import { useTablet } from '@/hooks/use-tablet'
import { useTabletNavigation } from '@/hooks/use-tablet'
import { Header } from '@/components/layout/header'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  ClipboardList, 
  Truck, 
  Wrench, 
  Menu,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TabletDashboardLayoutProps {
  children: ReactNode
  currentModule?: string
  onModuleChange?: (module: string) => void
}

const tabletModules = [
  {
    id: 'admin',
    name: 'Admin',
    icon: Home,
    path: '/admin',
    color: 'bg-blue-500',
  },
  {
    id: 'data-capture',
    name: 'Data Entry',
    icon: ClipboardList,
    path: '/data-capture',
    color: 'bg-green-500',
  },
  {
    id: 'drivers',
    name: 'Drivers',
    icon: Truck,
    path: '/drivers',
    color: 'bg-orange-500',
  },
  {
    id: 'tools',
    name: 'Tools',
    icon: Wrench,
    path: '/tools',
    color: 'bg-blue-500',
  },
]

export function TabletDashboardLayout({ 
  children, 
  currentModule = 'admin',
  onModuleChange 
}: TabletDashboardLayoutProps) {
  const { isTablet, isLandscape } = useTablet()
  const { useBottomSheets } = useTabletNavigation()
  const [isModuleSelectorOpen, setIsModuleSelectorOpen] = useState(false)

  // Don't render tablet layout on non-tablet devices
  if (!isTablet || !isLandscape) {
    return <>{children}</>
  }

  const handleModuleSelect = (moduleId: string) => {
    onModuleChange?.(moduleId)
    setIsModuleSelectorOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <Header />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2">
            {/* Module Selector Button */}
            <Button
              onClick={() => setIsModuleSelectorOpen(true)}
              className="w-full h-14 text-lg font-medium rounded-xl mb-2"
              
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const module = tabletModules.find(m => m.id === currentModule)
                    const Icon = module?.icon || Home
                    return (
                      <>
                        <div className={`p-2 rounded-lg ${module?.color || 'bg-blue-500'}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <span>{module?.name || 'Select Module'}</span>
                      </>
                    )
                  })()}
                </div>
                <ChevronUp className="h-5 w-5" />
              </div>
            </Button>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2">
              {tabletModules.map((module) => (
                <Button
                  key={module.id}
                  onClick={() => handleModuleSelect(module.id)}
                  variant={currentModule === module.id ? "default" : "ghost"}
                  className={`h-12 flex flex-col items-center space-y-1 ${
                    currentModule === module.id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <module.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{module.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module Selector Bottom Sheet */}
      <BottomSheet
        isOpen={isModuleSelectorOpen}
        onClose={() => setIsModuleSelectorOpen(false)}
        title="Select Module"
        size="md"
      >
        <div className="p-6 space-y-4">
          {tabletModules.map((module) => (
            <Button
              key={module.id}
              onClick={() => handleModuleSelect(module.id)}
              variant={currentModule === module.id ? "default" : "outline"}
              className={`w-full h-16 text-left justify-start ${
                currentModule === module.id 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  currentModule === module.id ? 'bg-white/20' : module.color
                }`}>
                  <module.icon className={`h-6 w-6 ${
                    currentModule === module.id ? 'text-white' : 'text-white'
                  }`} />
                </div>
                <div>
                  <div className="font-medium">{module.name}</div>
                  <div className="text-sm opacity-75">
                    {module.id === 'admin' && 'System administration and management'}
                    {module.id === 'data-capture' && 'Data entry and laboratory management'}
                    {module.id === 'drivers' && 'Driver tools and delivery management'}
                    {module.id === 'tools' && 'Utilities for transfers and cleaning'}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
