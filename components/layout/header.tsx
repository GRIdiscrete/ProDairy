"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, MapPin, ChevronDown, LogOut, User, Settings, HelpCircle } from "lucide-react"
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
import { useAppSelector } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = "Dashboard", subtitle = "Welcome back!" }: HeaderProps) {
  const currentUser = useAppSelector((state) => state.user.currentUser)
  const router = useRouter()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const handleLogout = () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
      {/* subtle sheen */}
      <div
        aria-hidden
        className="pointer-events-none h-[2px] w-full bg-[linear-gradient(90deg,rgba(59,130,246,0.15),rgba(132,204,22,0.15))]"
      />
      <div className="flex h-16 items-center justify-between px-3 md:px-6">
        {/* Left: Title */}
       

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
                <Avatar className="h-8 w-8 ring-1 ring-zinc-200">
                  <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.name} />
                  <AvatarFallback className="text-[10px] font-light">
                    {currentUser?.name?.split(" ").map((n) => n[0]).join("") || "PD"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-light leading-4 text-zinc-900">
                    {currentUser?.name || "ProDairy User"}
                  </p>
                  <p className="text-xs font-extralight text-zinc-500">
                    {currentUser?.email || "user@prodairy.co.zw"}
                  </p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-zinc-500 md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={6}>
              <DropdownMenuLabel className="font-light">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
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

      {/* Mobile search sheet */}
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
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                autoFocus
                placeholder="Search telemetry, batches, users…"
                className="w-full rounded-xl border-zinc-200 bg-white pl-9 pr-3 text-sm font-light placeholder:text-zinc-400 focus:border-lime-400 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
