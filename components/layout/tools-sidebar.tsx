"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronLeft, Beaker, Droplets, TestTube, Wrench } from "lucide-react";
import { useAppSelector } from "@/lib/store";

// Map sidebar links to permission keys in views[]
const toolsPermissionMap: Record<string, string> = {
  "/tools": "settings",
  "/tools/bmt-control-form": "bmt",
  "/tools/cip-control-form": "cip",
  "/tools/ist-control-form": "ist",
  "/tools/general-lab-test": "general_lab_test",
};

const toolsNavigation = [
  { name: "Tools Dashboard", href: "/tools", icon: Wrench },
  { name: "Bulk Milk Transfer", href: "/tools/bmt-control-form", icon: Beaker },
  { name: "CIP Control Form", href: "/tools/cip-control-form", icon: Droplets },
  { name: "IST Control Form", href: "/tools/ist-control-form", icon: TestTube },
  { name: "General Lab Test", href: "/tools/general-lab-test", icon: TestTube },
];

interface ToolsSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function ToolsSidebar({ collapsed = false, onToggle }: ToolsSidebarProps) {
  const pathname = usePathname();
  const { profile, user } = useAppSelector((state) => state.auth);

  // Get allowed views from user profile
  const allowedViews: string[] =
    profile?.users_role_id_fkey?.views && Array.isArray(profile.users_role_id_fkey.views)
      ? profile.users_role_id_fkey.views
      : [];

  // Filter navigation based on permissions
  const filteredNavigation = toolsNavigation.filter((item) => {
    const permKey = toolsPermissionMap[item.href];
    if (!permKey) return true;
    return allowedViews.includes(permKey);
  });

  const openWidth = 272;
  const closedWidth = 80;
  const width = collapsed ? closedWidth : openWidth;

  const sidebarVariants: Variants = {
    open: { width: openWidth, transition: { type: "spring", stiffness: 260, damping: 30 } },
    closed: { width: closedWidth, transition: { type: "spring", stiffness: 260, damping: 30 } },
  };

  const isOpen = !collapsed;

  return (
    <motion.aside
      initial={isOpen ? "open" : "closed"}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className={cn("fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-zinc-200 bg-white/80 backdrop-blur-xl")}
      style={{ width }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80rem_30rem_at_0%_-10%,rgba(59,130,246,0.08),transparent_60%),radial-gradient(80rem_30rem_at_120%_110%,rgba(132,204,22,0.08),transparent_60%)]" />

      <div className="relative flex h-16 items-center justify-between border-b border-zinc-200 px-3">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-[1px] bg-gradient-to-r from-blue-300 via-zinc-200 to-lime-300" />
        <div className={cn("flex items-center gap-3", collapsed && "w-full justify-center")}> 
          <div className="relative flex-shrink-0">
            <Image src="/Prodairy-3D-Logo.png" alt="ProDairy Logo" width={collapsed ? 36 : 40} height={collapsed ? 36 : 40} className="object-contain" priority />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div key="brand" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} className="truncate">
                <span className="block text-sm font-extralight tracking-[0.18em] text-zinc-900 uppercase">ProDairy DMS</span>
                <span className="block text-[11px] font-light tracking-wider text-zinc-500">Tools</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0 text-zinc-700 hover:bg-zinc-100" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>Add New Driver Form

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon as any;
            return (
              <li key={item.name} className="relative">
                <Link href={item.href} className={cn("group flex items-center rounded-xl px-2.5 py-2 text-sm transition-all", isActive ? "bg-gradient-to-r from-blue-50 to-lime-50 text-zinc-900 ring-1 ring-inset ring-blue-200/50" : "text-zinc-700 hover:bg-zinc-50")}>
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-blue-600" : "text-zinc-500 group-hover:text-zinc-700")} />
                  {!collapsed && <span className="ml-3 font-light tracking-wide">{item.name}</span>}
                </Link>
                {isActive && <motion.span layoutId="active-rail" className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-500 to-lime-500" />}
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  )
}


