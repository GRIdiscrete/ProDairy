"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Menu,
  X,
  Truck,
  MapPin,
  Clock,
  Package,
} from "lucide-react"

const driversNavigation = [
  { name: "Dashboard", href: "/drivers", icon: LayoutDashboard },
  { name: "Driver Forms", href: "/drivers/forms", icon: FileText },
  { name: "Driver Tools", href: "/drivers/tools", icon: Wrench },
]

interface MobileDriversLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function MobileDriversLayout({ children, title, subtitle }: MobileDriversLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-xl px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Image
              src="/Prodairy-3D-Logo.png"
              alt="ProDairy Logo"
              width={20}
              height={20}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-sm font-light text-gray-900">{title || "Drivers"}</h1>
            {subtitle && <p className="text-xs text-gray-500 font-light">{subtitle}</p>}
          </div>
        </div>
        
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-white">
            <MobileDriversSidebar onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-xl">
        <div className="grid grid-cols-3 h-16">
          {driversNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-2 py-2 transition-all duration-200",
                  isActive
                    ? "text-blue-600 bg-blue-50/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-blue-100" 
                    : "hover:bg-gray-100"
                )}>
                  <Icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
                </div>
                <span className="text-xs font-light truncate max-w-[80px]">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-indicator"
                    className="absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full  from-blue-500 to-blue-600"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function MobileDriversSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Image
              src="/Prodairy-3D-Logo.png"
              alt="ProDairy Logo"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <div>
            <span className="text-sm font-light text-gray-900">ProDairy DMS</span>
            <p className="text-xs text-gray-500 font-light">Drivers Module</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-2">
          {driversNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                    isActive 
                      ? "bg-blue-100" 
                      : "bg-gray-100"
                  )}>
                    <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-gray-600")} />
                  </div>
                  <span className="font-light">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-gray-200">
            <Image src="/placeholder-user.jpg" alt="User avatar" width={40} height={40} className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-light text-gray-900">Driver User</p>
            <p className="text-xs text-gray-500 font-light">driver@prodairy.co.zw</p>
          </div>
        </div>
      </div>
    </div>
  )
}
