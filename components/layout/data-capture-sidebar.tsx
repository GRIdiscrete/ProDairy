"use client";

import dynamic from "next/dynamic"
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ChevronLeft,
  ClipboardList,
  User,
  FlaskConical,
  Beaker,
  Droplets,
  Package,
  Factory,
  TestTube,
  Grid3X3,
  Wrench,
  Workflow,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { processApi } from "@/lib/api/process";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppSelector } from "@/lib/store";

// Dynamic import to avoid hydration mismatch
const DataCaptureSidebarContent = dynamic(() => Promise.resolve(DataCaptureSidebarComponent), {
  ssr: false,
  loading: () => (
    <div className="w-80 min-h-screen border-r border-zinc-200 bg-white/80 backdrop-blur-xl">
      <div className="h-16 border-b border-zinc-200 px-3 flex items-center">
        <div className="h-10 w-10 bg-zinc-100 rounded animate-pulse" />
      </div>
      <div className="p-3 border-t border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-zinc-100 rounded-full animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
            <div className="h-3 w-32 bg-zinc-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
})

const dataCaptureNavigation = [
  {
    name: "Dashboard",
    href: "/data-capture",
    icon: LayoutDashboard,
    current: false,
  },
  // {
  //   name: "Process Forms",
  //   href: "/data-capture/forms",
  //   icon: Workflow,
  //   current: false,
  // },

  {
    name: "Test Before Intake",
    href: "/data-capture/raw-milk-test-before-intake",
    icon: FlaskConical,
    current: false,
  },
  {
    name: "Raw Milk Intake",
    href: "/data-capture/raw-milk-intake",
    icon: ClipboardList,
    current: false,
  },
  {
    name: "Standardizing",
    href: "/data-capture/standardizing",
    icon: Beaker,
    current: false,
  },
  // Flow-driven stages are injected dynamically below based on selected process
  // Process Control Forms moved to Tools module
  // Production Forms
  // {
  //   name: "Filler Log 2",
  //   href: "/data-capture/filler-log-2",
  //   icon: Package,
  //   current: false,
  // },
  // {
  //   name: "Flex Sterilizer",
  //   href: "/data-capture/flex-one-steriliser-process",
  //   icon: Factory,
  //   current: false,
  // },
  // {
  //   name: "Sterilised Milk Process",
  //   href: "/data-capture/sterilised-milk-process",
  //   icon: Droplets,
  //   current: false,
  // },


];

interface DataCaptureSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

function DataCaptureSidebarComponent({
  collapsed = false,
  onToggle,
}: DataCaptureSidebarProps) {
  const pathname = usePathname();
  const { user, profile } = useAppSelector((state) => state.auth);
  const [processes, setProcesses] = useState<any[]>([])
  const [processOpen, setProcessOpen] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)

  const router = useRouter()


  useEffect(() => {
    const load = async () => {
      try {
        const res = await processApi.getProcesses()
        const list = res.data || []
        setProcesses(list)
        // Restore previously selected process if available; otherwise none selected by default
        const cached = typeof window !== 'undefined' ? localStorage.getItem('dc_selected_process') : null
        if (cached) setSelectedProcess(cached)
        else setSelectedProcess(null)
      } catch (e) {
        // silent
      }
    }
    load()
  }, [])

  const handleSelectProcess = (id: string) => {
    setSelectedProcess(id)
    try { if (typeof window !== 'undefined') localStorage.setItem('dc_selected_process', id) } catch { }
  }

  // Layout widths
  const openWidth = 272;
  const closedWidth = 80;
  const width = collapsed ? closedWidth : openWidth;

  // Motion variants
  const sidebarVariants: Variants = {
    open: {
      width: openWidth,
      transition: { type: "spring", stiffness: 260, damping: 30 },
    },
    closed: {
      width: closedWidth,
      transition: { type: "spring", stiffness: 260, damping: 30 },
    },
  };

  const isOpen = !collapsed;

  return (
    <motion.aside
      initial={isOpen ? "open" : "closed"}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-zinc-200 bg-white/80 backdrop-blur-xl"
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
          className="pointer-events-none absolute inset-x-0 -bottom-px h-[1px]  from-blue-300 via-zinc-200 to-lime-300"
        />
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "w-full justify-center"
          )}
        >
          {/* Logo */}
          <div className="relative flex-shrink-0">
            <div
              className={cn("relative", collapsed ? "h-9 w-9" : "h-10 w-10")}
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
                  ProDairy DMS
                </span>
                <span className="block text-[11px] font-light tracking-wider text-zinc-500">
                  Production Processes
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
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-1">
          {/* Production Flow selector */}
          {/* Place the switcher below Standardizing */}

          {dataCaptureNavigation.map((item) => {
            // For Dashboard (/data-capture), only match exact path
            // For other routes, match if path starts with the href
            const isActive = item.href === "/data-capture"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.name} className="relative">
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-xl px-2.5 py-2 text-sm transition-all",
                    isActive
                      ? " from-blue-50 to-lime-50 text-zinc-900 ring-1 ring-inset ring-blue-200/50"
                      : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-blue-600"
                        : "text-zinc-500 group-hover:text-zinc-700"
                    )}
                  />
                  {!collapsed && (
                    <span className="ml-3 font-light tracking-wide">
                      {item.name}
                    </span>
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
            );
          })}
          <li className="relative">
            {!collapsed && (
              <div className="mt-1">
                <div className="group flex items-center rounded-xl px-2.5 py-2 text-sm text-zinc-700">
                  <Workflow className="h-5 w-5 text-zinc-500" />
                  <span className="ml-3 font-light tracking-wide">Production Flow</span>
                </div>
                <Select value={selectedProcess || ""} onValueChange={(v) => handleSelectProcess(v)}>
                  <SelectTrigger className="w-full h-10 rounded-xl border-zinc-200 bg-white text-sm font-light">
                    <SelectValue placeholder="Production Flow" />
                  </SelectTrigger>
                  <SelectContent>
                    {(processes || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name || `Process #${String(p.id).slice(0, 8)}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </li>

          {/* Stages for selected process (Steri Milk example) */}
          {!collapsed && selectedProcess && (
            <li className="mt-2">
              <div className="px-2.5 py-1.5 text-[11px] uppercase tracking-wide text-zinc-500">Stages</div>
              <div className="relative ml-4">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-zinc-200" />
                <ul className="space-y-1">
                  {[
                    { key: 'pasteurizing', label: 'Pasteurizing', Icon: FlaskConical, enabled: true },
                    { key: 'filmatic-lines', label: 'Filmatic Lines Form 1', Icon: Factory, enabled: true },
                    { key: 'process-log', label: 'Process Log', Icon: Workflow, enabled: true },
                    { key: 'filmatic-lines-2', label: 'Filmatic Lines 2', Icon: Factory, enabled: true },
                    { key: 'palletiser-sheet', label: 'Palletizer', Icon: Grid3X3, enabled: true },
                    { key: 'incubation', label: 'Incubation', Icon: Beaker, enabled: true },
                    { key: 'test', label: 'Test', Icon: TestTube, enabled: true },
                    { key: 'qa-corrective-measures', label: 'QA Corrective Measures', Icon: AlertTriangle, enabled: true },
                    { key: 'dispatch', label: 'Dispatch', Icon: Package, enabled: true },
                  ].map((s, idx) => {
                    const href = s.enabled
                      ? (s.key === 'filmatic-lines-2'
                        ? (selectedProcess ? `/data-capture/${selectedProcess}/filmatic-lines-2` : '#')
                        : (selectedProcess ? `/data-capture/${selectedProcess}/${s.key}` : '#'))
                      : '#'
                    const isActive = s.enabled && (pathname === href || pathname.startsWith(href + '/'))
                    const content = (
                      <div className={cn("group flex items-center rounded-xl px-2.5 py-2 text-sm transition-all",
                        isActive ? " from-blue-50 to-lime-50 text-zinc-900 ring-1 ring-inset ring-blue-200/50" : s.enabled ? "text-zinc-700 hover:bg-zinc-50" : "text-zinc-400")}
                      >
                        <div className="relative mr-2">
                          <div className={cn("flex h-5 w-5 items-center justify-center rounded-full border", isActive ? "border-[#006BC4] text-blue-600" : "border-zinc-300 text-zinc-500")}>{idx + 1}</div>
                        </div>
                        <s.Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-blue-600" : s.enabled ? "text-zinc-500 group-hover:text-zinc-700" : "text-zinc-400")} />
                        <span className="ml-3 font-light tracking-wide">{s.label}</span>
                      </div>
                    )
                    return (
                      <li key={s.label} className="relative pl-2">
                        <div className="absolute left-1 top-0 bottom-0 w-px bg-transparent" />
                        {s.enabled ? (
                          <Link href={href}>{content}</Link>
                        ) : (
                          <div>{content}</div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </li>
          )}
        </ul>
      </nav>

      {/* Footer / Profile */}
      <div onClick={() => router.push('/profile')}
        className="border-t border-zinc-200 p-3 cursor-pointer">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-zinc-200">
            <Image
              src="/placeholder-user.jpg"
              alt="User avatar"
              fill
              className="object-cover"
            />
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
                <p className="truncate text-sm font-light text-zinc-900">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : 'User'
                  }
                </p>
                <p className="truncate text-xs font-extralight tracking-wide text-zinc-500">
                  {profile?.email || user?.email || 'user@prodairy.co.zw'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

export function DataCaptureSidebar(props: DataCaptureSidebarProps) {
  return <DataCaptureSidebarContent {...props} />
}
