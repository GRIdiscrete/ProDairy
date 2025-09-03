"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  ChevronLeft,
  ClipboardList,
  User,
  FlaskConical,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const dataCaptureNavigation = [
  { name: "Dashboard", href: "/data-capture", icon: LayoutDashboard, current: false },
  {
    name: "Data Capturer UI",
    href: "/data-capture/ui",
    icon: ClipboardList,
    current: false,
  },
  {
    name: "Operator Forms",
    href: "/data-capture/operator-forms",
    icon: User,
    current: false,
  },
  {
    name: "Lab Forms",
    href: "/data-capture/lab-forms",
    icon: FlaskConical,
    current: false,
  },
]

interface DataCaptureSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function DataCaptureSidebar({ collapsed = false, onToggle }: DataCaptureSidebarProps) {
  const pathname = usePathname()

  // Layout widths
  const openWidth = 272
  const closedWidth = 80
  const width = collapsed ? closedWidth : openWidth

  // Motion variants
  const sidebarVariants = {
    open: { width: openWidth, transition: { type: "spring", stiffness: 260, damping: 30 } },
    closed: { width: closedWidth, transition: { type: "spring", stiffness: 260, damping: 30 } },
  }

  const isOpen = !collapsed

  return (
    <motion.aside
      initial={isOpen ? "open" : "closed"}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className={cn(
        "relative z-30 flex min-h-screen flex-col border-r border-zinc-200 bg-white/80 backdrop-blur-xl"
      )}
      style={{ width }}
    >
      {/* Luxe gradient halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80rem_30rem_at_0%_-10%,rgba(59,130,246,0.08),transparent_60%),radial-gradient(80rem_30rem_at_120%_110%,rgba(132,204,22,0.08),transparent_60%)]"
      />

      {/* Header */}
      <div className="relative flex h-16 items-center justify-between border-b border-zinc-200 px-3">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-px h-[1px] bg-gradient-to-r from-blue-300 via-zinc-200 to-lime-300"
        />
        <div className={cn("flex items-center gap-3", collapsed && "w-full justify-center")}>
          {/* Logo */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "relative",
                collapsed ? "h-9 w-9" : "h-10 w-10"
              )}
              style={{ overflow: "visible" }}
              aria-hidden
            />
            <Image
              src="/Prodairy-3D-Logo.png"
              alt="ProDairy Logo"
              width={collapsed ? 36 : 40}
              height={collapsed ? 36 : 40}
              className="object-contain"
              priority
            />
          </div>

          {/* Brand text */}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="truncate"
              >
                <span className="block text-sm font-extralight tracking-[0.18em] text-zinc-900 uppercase">
                  ProDairy OS
                </span>
                <span className="block text-[11px] font-light tracking-wider text-zinc-500">
                  Data Capture
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0 text-zinc-700 hover:bg-zinc-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-1">
          {dataCaptureNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <li key={item.name} className="relative">
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-xl px-2.5 py-2 text-sm transition-all",
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-lime-50 text-zinc-900 ring-1 ring-inset ring-blue-200/50"
                      : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-600" : "text-zinc-500 group-hover:text-zinc-700"
                    )}
                  />
                  {!collapsed && (
                    <span className="ml-3 font-light tracking-wide">{item.name}</span>
                  )}
                </Link>

                {/* Active left rail */}
                {isActive && (
                  <motion.span
                    layoutId="active-rail"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-500 to-lime-500"
                  />
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer / Profile */}
      <div className="border-t border-zinc-200 p-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-zinc-200">
            <Image src="/placeholder-user.jpg" alt="User avatar" fill className="object-cover" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="user-meta"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="min-w-0"
              >
                <p className="truncate text-sm font-light text-zinc-900">Data Capturer</p>
                <p className="truncate text-xs font-extralight tracking-wide text-zinc-500">
                  capturer@prodairy.co.zw
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}


