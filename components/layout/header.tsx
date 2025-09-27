"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, Bell, MapPin, ChevronDown, LogOut, User, Settings, HelpCircle, Users, Truck, ClipboardList, Wrench } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { logoutUser } from "@/lib/store/slices/authSlice"
import { motion, AnimatePresence } from "framer-motion"

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = "Dashboard", subtitle = "Welcome back!" }: HeaderProps) {
  const dispatch = useAppDispatch()
  const authState = useAppSelector((state) => state.auth)
  const { user, profile, isAuthenticated } = authState || { user: null, profile: null, isAuthenticated: false }
  const router = useRouter()
  const pathname = usePathname()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/login")
  }

  // Dashboard configuration
  const dashboards = [
    {
      id: "admin",
      name: "Admin Dashboard",
      icon: Users,
      path: "/admin",
      emoji: "🧑‍💻",
      description: "System administration and management"
    },
    {
      id: "drivers",
      name: "Drivers UI",
      icon: Truck,
      path: "/drivers",
      emoji: "🚚",
      description: "Driver tools and delivery management"
    },
    {
      id: "data-capture",
      name: "Data Capture",
      icon: ClipboardList,
      path: "/data-capture",
      emoji: "📋",
      description: "Data entry and laboratory management"
    },
    {
      id: "tools",
      name: "Tools",
      icon: Wrench,
      path: "/tools",
      emoji: "🛠️",
      description: "Utilities for transfers and cleaning"
    }
  ]

  // Get current dashboard based on pathname
  const getCurrentDashboard = () => {
    if (pathname.startsWith("/admin")) return dashboards[0]
    if (pathname.startsWith("/drivers")) return dashboards[1]
    if (pathname.startsWith("/data-capture")) return dashboards[2]
    if (pathname.startsWith("/tools")) return dashboards[3]
    return dashboards[0] // Default to admin
  }

  const currentDashboard = getCurrentDashboard()

  const handleDashboardSwitch = (dashboardPath: string) => {
    router.push(dashboardPath)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
      {/* subtle sheen */}
      <div
        aria-hidden
        className="pointer-events-none h-[2px] w-full bg-[linear-gradient(90deg,rgba(59,130,246,0.15),rgba(132,204,22,0.15))]"
      />
      <div className="flex h-16 items-center justify-between px-3 md:px-6">
        {/* Left: Dashboard Switcher */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentDashboard.emoji}</span>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-zinc-900">
                      {currentDashboard.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {currentDashboard.description}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80" sideOffset={6}>
              <DropdownMenuLabel className="font-medium">Switch Dashboard</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dashboards.map((dashboard) => (
                <DropdownMenuItem
                  key={dashboard.id}
                  onClick={() => handleDashboardSwitch(dashboard.path)}
                  className={`cursor-pointer p-3 ${
                    currentDashboard.id === dashboard.id 
                      ? "bg-blue-50 text-blue-900" 
                      : "hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{dashboard.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium">{dashboard.name}</p>
                      <p className="text-xs text-zinc-500">{dashboard.description}</p>
                    </div>
                    {currentDashboard.id === dashboard.id && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: Search (desktop) */}
        <div className="hidden md:block flex-1 px-6">
          <div className="relative mx-auto w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search telemetry, batches, users…"
              className="w-full rounded-xl border-zinc-200 bg-white pl-9 pr-3 text-sm font-light placeholder:text-zinc-400 focus:border-lime-400 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5 text-zinc-700" />
          </Button>

          {/* Location chip */}
          <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-light text-zinc-600 md:flex">
            <MapPin className="h-3.5 w-3.5 text-blue-600" />
            <span className="tabular-nums">42°C</span>
            <span className="text-zinc-400">•</span>
            <span>Harare</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-zinc-100">
            <Bell className="h-5 w-5 text-zinc-700" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] leading-5">
              3
            </Badge>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-zinc-100">
                {isClient && (
                  <>
                    <Avatar className="h-8 w-8 ring-1 ring-zinc-200">
                      <AvatarImage 
                        src={user?.avatar || undefined} 
                        alt={profile ? `${profile.first_name} ${profile.last_name}` : "User"} 
                      />
                      <AvatarFallback className="text-[10px] font-light bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {profile && profile.first_name && profile.last_name 
                          ? `${profile.first_name[0]}${profile.last_name[0]}` 
                          : "U"
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left md:block">
                      <p className="text-sm font-light leading-4 text-zinc-900">
                        {profile ? `${profile.first_name} ${profile.last_name}` : "ProDairy User"}
                      </p>
                      <p className="text-xs font-extralight text-zinc-500">
                        {profile?.email || user?.email || "user@prodairy.co.zw"}
                      </p>
                    </div>
                  </>
                )}
                <ChevronDown className="hidden h-4 w-4 text-zinc-500 md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={6}>
              <DropdownMenuLabel className="font-light">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => router.push('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search and dashboard switcher */}
      <AnimatePresence initial={false}>
        {mobileSearchOpen && (
          <motion.div
            key="mobile-search"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-200 px-3 pb-3 pt-2 md:hidden"
          >
            <div className="space-y-3">
              {/* Mobile Dashboard Switcher */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Switch Dashboard</p>
                <div className="grid grid-cols-1 gap-2">
                  {dashboards.map((dashboard) => (
                    <Button
                      key={dashboard.id}
                      variant={currentDashboard.id === dashboard.id ? "default" : "outline"}
                      onClick={() => {
                        handleDashboardSwitch(dashboard.path)
                        setMobileSearchOpen(false)
                      }}
                      className="justify-start h-auto p-3"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-lg">{dashboard.emoji}</span>
                        <div className="text-left flex-1">
                          <p className="font-medium text-sm">{dashboard.name}</p>
                          <p className="text-xs opacity-70">{dashboard.description}</p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Mobile Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  autoFocus
                  placeholder="Search telemetry, batches, users…"
                  className="w-full rounded-xl border-zinc-200 bg-white pl-9 pr-3 text-sm font-light placeholder:text-zinc-400 focus:border-lime-400 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
