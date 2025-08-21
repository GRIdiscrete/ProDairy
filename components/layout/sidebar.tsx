"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings, Factory, FileText, ChevronLeft, ChevronDown, Zap, Truck } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    current: true,
  },
  {
    name: "Configuration",
    href: "/configuration",
    icon: Settings,
    current: false,
    children: [
      { name: "Users", href: "/configuration/users" },
      { name: "Roles", href: "/configuration/roles" },
      { name: "Machines", href: "/configuration/machines" },
      { name: "Silos", href: "/configuration/silos" },
      { name: "Devices", href: "/configuration/devices" },
    ],
  },
  {
    name: "Manufacturing",
    href: "/manufacturing",
    icon: Factory,
    current: false,
    children: [
      { name: "Production", href: "/manufacturing/production" },
      { name: "Quality Control", href: "/manufacturing/quality" },
      { name: "Machine Status", href: "/manufacturing/machines" },
      { name: "Process Management", href: "/manufacturing/process" },
    ],
  },
  {
    name: "Procurement",
    href: "/procurement",
    icon: Truck,
    current: false,
    children: [
      { name: "Suppliers", href: "/procurement/suppliers" },
      { name: "Raw Materials", href: "/procurement/materials" },
      { name: "Purchase Orders", href: "/procurement/orders" },
    ],
  },
  {
    name: "Report",
    href: "/reports",
    icon: FileText,
    current: false,
    children: [
      { name: "Production Report", href: "/reports/production" },
      { name: "Stock Report", href: "/reports/stock" },
      { name: "Item Overall Cost", href: "/reports/cost" },
      { name: "Yield Report", href: "/reports/yield" },
      { name: "Supplier Report", href: "/reports/suppliers" },
    ],
  },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])

  const toggleDropdown = (itemName: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
    )
  }

  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo and Toggle */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <span className="text-sm font-bold text-primary-foreground">PD</span>
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">ProDairy Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const isDropdownOpen =
            openDropdowns.includes(item.name) ||
            (item.children && item.children.some((child) => pathname === child.href))

          return (
            <div key={item.name}>
              {item.children ? (
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="ml-3">{item.name}</span>
                      <ChevronDown
                        className={cn("ml-auto h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")}
                      />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              )}

              {/* Submenu */}
              {!collapsed && item.children && isDropdownOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "block rounded-md px-3 py-1 text-sm transition-colors",
                        pathname === child.href
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Premium Section */}
      {!collapsed && (
        <div className="p-4">
          <div className="rounded-lg bg-primary p-4 text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-primary-foreground">Premium</h3>
            <p className="mb-3 text-xs text-primary-foreground/80">Get access to all features on ProDairy Admin</p>
            <Button size="sm" variant="secondary" className="w-full">
              Get Pro Now!
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
