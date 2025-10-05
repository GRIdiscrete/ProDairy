"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, Bell, MapPin, ChevronDown, LogOut, User, Settings, HelpCircle, Users, Truck, ClipboardList, Wrench, ArrowRight, Menu, ExternalLink, Plus, Pencil, Trash2 } from "lucide-react"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { logoutUser } from "@/lib/store/slices/authSlice"
import { motion, AnimatePresence } from "framer-motion"
import { useTablet } from "@/hooks/use-tablet"
import { getRecentNotifications, humanizeModule, moduleToRoute, type NotificationItem } from "@/lib/api/notifications"
import { formatDistanceToNow, parseISO, isValid } from "date-fns"
// import { useAccessibleModules } from "@/hooks/use-permissions" // Removed - no longer using permissions

interface HeaderProps {
  title?: string
  subtitle?: string
  onOpenSidebar?: () => void
}

export function Header({ title = "Dashboard", subtitle = "Welcome back!", onOpenSidebar }: HeaderProps) {
  const dispatch = useAppDispatch()
  const authState = useAppSelector((state) => state.auth)
  const { user, profile, isAuthenticated } = authState || { user: null, profile: null, isAuthenticated: false }
  const router = useRouter()
  const pathname = usePathname()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { isTablet, isLandscape } = useTablet()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    // prefetch notifications on mount
    getRecentNotifications(8).then(setNotifications).catch(() => setNotifications([]))
  }, [])
  // const accessibleModules = useAccessibleModules() // Removed - no longer using permissions

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/login")
  }

  // Dashboard configuration
  const allDashboards = [
    {
      id: "admin",
      name: "Admin Dashboard",
      icon: Users,
      path: "/admin",
      emoji: "🧑‍💻",
      description: "System administration and management",
      module: "admin"
    },
    {
      id: "drivers",
      name: "Drivers UI",
      icon: Truck,
      path: "/drivers",
      emoji: "🚚",
      description: "Driver tools and delivery management",
      module: "drivers"
    },
    {
      id: "data-capture",
      name: "Production Processes",
      icon: ClipboardList,
      path: "/data-capture",
      emoji: "📋",
      description: "Data entry and laboratory management",
      module: "data-capture"
    },
    {
      id: "tools",
      name: "Tools",
      icon: Wrench,
      path: "/tools",
      emoji: "🛠️",
      description: "Utilities for transfers and cleaning",
      module: "tools"
    }
  ]

  // Show all dashboards (permissions removed)
  const dashboards = allDashboards

  // Comprehensive route list for search
  const allRoutes = [
    // Admin Routes
    { path: "/admin", title: "Admin Dashboard", category: "Admin", icon: Users, description: "System administration and management" },
    { path: "/admin/users", title: "Users Management", category: "Admin", icon: Users, description: "Manage system users and permissions" },
    { path: "/admin/roles", title: "Roles Management", category: "Admin", icon: Users, description: "Manage user roles and access levels" },
    { path: "/admin/machines", title: "Machines", category: "Admin", icon: Wrench, description: "Machine configuration and management" },
    { path: "/admin/silos", title: "Silos", category: "Admin", icon: Wrench, description: "Silo configuration and management" },
    { path: "/admin/tankers", title: "Tankers", category: "Admin", icon: Truck, description: "Tanker fleet management" },
    { path: "/admin/devices", title: "Devices", category: "Admin", icon: Wrench, description: "Device configuration and monitoring" },
    { path: "/admin/suppliers", title: "Suppliers", category: "Admin", icon: Users, description: "Supplier management and contacts" },
    { path: "/admin/materials", title: "Materials", category: "Admin", icon: ClipboardList, description: "Raw materials inventory" },
    { path: "/admin/production-plan", title: "Production Plan", category: "Admin", icon: ClipboardList, description: "Production planning and scheduling" },
    { path: "/admin/processes", title: "Processes", category: "Admin", icon: ClipboardList, description: "Process configuration and management" },
    { path: "/admin/filmatic-lines-groups", title: "Filmatic Lines Groups", category: "Admin", icon: ClipboardList, description: "Filmatic lines configuration" },

    // Drivers Routes
    { path: "/drivers", title: "Drivers Dashboard", category: "Drivers", icon: Truck, description: "Driver tools and delivery management" },
    { path: "/drivers/forms", title: "Driver Forms", category: "Drivers", icon: ClipboardList, description: "Driver form submissions and management" },
    { path: "/drivers/tools", title: "Driver Tools", category: "Drivers", icon: Wrench, description: "Driver utility tools" },

    // Data Capture Routes
    { path: "/data-capture", title: "Data Capture Dashboard", category: "Data Capture", icon: ClipboardList, description: "Data entry and laboratory management" },
    { path: "/data-capture/kanban", title: "Process Kanban", category: "Data Capture", icon: ClipboardList, description: "Process workflow management" },
    { path: "/data-capture/process-log", title: "Process Log", category: "Data Capture", icon: ClipboardList, description: "Process logging and tracking" },
    { path: "/data-capture/pasteurizing", title: "Pasteurizing", category: "Data Capture", icon: ClipboardList, description: "Pasteurization process management" },
    { path: "/data-capture/sterilised-milk-process", title: "Sterilised Milk Process", category: "Data Capture", icon: ClipboardList, description: "Sterilized milk processing" },
    { path: "/data-capture/standardizing", title: "Standardizing", category: "Data Capture", icon: ClipboardList, description: "Milk standardization process" },
    { path: "/data-capture/raw-milk-intake", title: "Raw Milk Intake", category: "Data Capture", icon: ClipboardList, description: "Raw milk intake management" },
    { path: "/data-capture/filmatic-lines", title: "Filmatic Lines", category: "Data Capture", icon: ClipboardList, description: "Filmatic lines processing" },
    { path: "/data-capture/flex-one-steriliser-process", title: "Flex One Steriliser Process", category: "Data Capture", icon: ClipboardList, description: "Flex sterilizer process management" },
    { path: "/data-capture/palletiser-sheet", title: "Palletiser Sheet", category: "Data Capture", icon: ClipboardList, description: "Palletizing process management" },
    { path: "/data-capture/filler-log-2", title: "Filler Log 2", category: "Data Capture", icon: ClipboardList, description: "Filler log management" },
    { path: "/data-capture/lab-forms", title: "Lab Forms", category: "Data Capture", icon: ClipboardList, description: "Laboratory form management" },
    { path: "/data-capture/operator-forms", title: "Operator Forms", category: "Data Capture", icon: ClipboardList, description: "Operator form submissions" },
    { path: "/data-capture/ui", title: "Data Capture UI", category: "Data Capture", icon: ClipboardList, description: "Data capture user interface" },
    { path: "/data-capture/forms", title: "Forms", category: "Data Capture", icon: ClipboardList, description: "Form management and submissions" },
    { path: "/data-capture/forms/example", title: "Example Form", category: "Data Capture", icon: ClipboardList, description: "Example form template" },

    // Tools Routes
    { path: "/tools", title: "Tools Dashboard", category: "Tools", icon: Wrench, description: "Utilities for transfers and cleaning" },
    { path: "/tools/bmt-control-form", title: "BMT Control Form", category: "Tools", icon: Wrench, description: "Bulk Milk Transfer control" },
    { path: "/tools/cip-control-form", title: "CIP Control Form", category: "Tools", icon: Wrench, description: "Clean In Place control" },
    { path: "/tools/ist-control-form", title: "IST Control Form", category: "Tools", icon: Wrench, description: "IST control management" },

    // Other Routes
    { path: "/profile", title: "Profile", category: "Account", icon: User, description: "User profile management" },
    { path: "/login", title: "Login", category: "Account", icon: User, description: "User authentication" },
  ]

  // Filter routes based on search query only (permissions removed)
  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return allRoutes.slice(0, 10) // Show first 10 by default
    
    const query = searchQuery.toLowerCase()
    return allRoutes.filter(route => 
      route.title.toLowerCase().includes(query) ||
      route.description.toLowerCase().includes(query) ||
      route.category.toLowerCase().includes(query) ||
      route.path.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Get current dashboard based on pathname
  const getCurrentDashboard = () => {
    if (pathname.startsWith("/admin")) {
      return dashboards.find(d => d.id === "admin") || dashboards[0]
    }
    if (pathname.startsWith("/drivers")) {
      return dashboards.find(d => d.id === "drivers") || dashboards[0]
    }
    if (pathname.startsWith("/data-capture")) {
      return dashboards.find(d => d.id === "data-capture") || dashboards[0]
    }
    if (pathname.startsWith("/tools")) {
      return dashboards.find(d => d.id === "tools") || dashboards[0]
    }
    return dashboards[0] // Default to first dashboard
  }

  const currentDashboard = getCurrentDashboard()

  const handleDashboardSwitch = (dashboardPath: string) => {
    router.push(dashboardPath)
  }

  const handleRouteSelect = (routePath: string) => {
    router.push(routePath)
    setSearchOpen(false)
    setSearchQuery("")
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
        <div className="flex items-center gap-2">
          {/* Tablet drawer toggle */}
          {onOpenSidebar && isTablet && isLandscape && (
            <Button
              variant="ghost"
              size="icon"
              className=""
              aria-label="Open navigation"
              onClick={onOpenSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
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
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={searchOpen}
                  className="w-full justify-start text-left font-normal h-10 border-zinc-200 bg-white hover:bg-zinc-50 focus:border-lime-400 focus:ring-2 focus:ring-blue-500/30"
                >
                  <Search className="mr-2 h-4 w-4 text-zinc-400" />
                  <span className="text-zinc-400">
                    {searchQuery ? `Searching for "${searchQuery}"` : "Search all pages..."}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search pages, modules, features..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No pages found.</CommandEmpty>
                    {filteredRoutes.length > 0 && (
                      <CommandGroup>
                        {filteredRoutes.map((route) => (
                          <CommandItem
                            key={route.path}
                            value={route.path}
                            onSelect={() => handleRouteSelect(route.path)}
                            className="flex items-center gap-3 p-3 cursor-pointer"
                          >
                            <route.icon className="h-4 w-4 text-zinc-500" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{route.title}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {route.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-zinc-500 mt-1">{route.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-zinc-400" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-zinc-100 overflow-visible">
                <Bell className="h-5 w-5 text-zinc-700" />
                {notifications.length > 0 && (
                  <Badge className="absolute -right-2 -top-2 z-50 h-5 min-w-5 rounded-full p-0 text-[10px] leading-5 flex items-center justify-center shadow-sm">
                    {Math.min(notifications.length, 9)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96" sideOffset={6}>
              <DropdownMenuLabel className="font-light flex items-center justify-between">
                Notifications
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => {
                    setNotifOpen(false)
                    router.push('/notifications')
                  }}
                >
                  View all
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-zinc-500">No recent notifications</div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0,8).map((n, idx) => {
                    const d = typeof n.created_at === 'string' ? parseISO(n.created_at) : new Date(n.created_at)
                    const when = isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : ''
                    const label = `${humanizeModule(n.module)} · ${n.action}`
                    const ActionIcon = (n.action === 'created' ? Plus : n.action === 'updated' ? Pencil : Trash2)
                    const color = n.action === 'created' ? 'text-green-600 bg-green-50' : n.action === 'updated' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
                    return (
                      <DropdownMenuItem key={n.id} className={`p-0 border-b border-zinc-200 ${idx === Math.min(notifications.length,8)-1 ? 'last:border-0' : ''}`}>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-zinc-50"
                          onClick={() => {
                            const href = moduleToRoute(n.module, n.form_id)
                            setNotifOpen(false)
                            if (href) router.push(href)
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full ${color}`}>
                              <ActionIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-zinc-900">{label}</div>
                              <div className="text-xs text-zinc-500">{when}</div>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                          </div>
                        </button>
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Search Pages</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredRoutes.slice(0, 8).map((route) => (
                    <Button
                      key={route.path}
                      variant="outline"
                      onClick={() => {
                        handleRouteSelect(route.path)
                        setMobileSearchOpen(false)
                      }}
                      className="w-full justify-start h-auto p-3"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <route.icon className="h-4 w-4 text-zinc-500" />
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{route.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {route.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">{route.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-400" />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
