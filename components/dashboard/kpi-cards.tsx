"use client"

import { motion } from "framer-motion"
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  color?: "blue" | "green" | "red" | "orange" | "purple"
  loading?: boolean
}

const colorMap = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
    icon: "text-white",
    border: "hover:border-blue-300 dark:hover:border-blue-800",
    shadow: "hover:shadow-blue-500/20",
    text: "text-gray-900 dark:text-gray-100",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    icon: "text-white",
    border: "hover:border-green-300 dark:hover:border-green-800",
    shadow: "hover:shadow-green-500/20",
    text: "text-green-600 dark:text-green-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    iconBg: "bg-gradient-to-br from-red-500 to-red-700",
    icon: "text-white",
    border: "hover:border-red-300 dark:hover:border-red-800",
    shadow: "hover:shadow-red-500/20",
    text: "text-red-600 dark:text-red-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    iconBg: "bg-gradient-to-br from-orange-500 to-orange-700",
    icon: "text-white",
    border: "hover:border-orange-300 dark:hover:border-orange-800",
    shadow: "hover:shadow-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    iconBg: "bg-gradient-to-br from-purple-500 to-purple-700",
    icon: "text-white",
    border: "hover:border-purple-300 dark:hover:border-purple-800",
    shadow: "hover:shadow-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
  },
}

export function KPICard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  trend,
  color = "blue",
  loading = false,
}: KPICardProps) {
  const colors = colorMap[color]

  if (loading) {
    return (
      <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-8 w-8 bg-muted rounded-full" />
        </div>
        <div className="h-8 bg-muted rounded w-20 mb-2" />
        <div className="h-3 bg-muted rounded w-32" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-6 transition-all duration-300 cursor-pointer",
        "hover:shadow-lg",
        colors.border,
        colors.shadow
      )}
    >
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-sm text-gray-600 dark:text-gray-400">{title}</h3>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm", colors.iconBg)}>
          <Icon className={cn("h-4 w-4", colors.icon)} />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <h2 className={cn("text-3xl font-normal leading-none tracking-tight", colors.text)}>
            {typeof value === "number" ? value.toLocaleString() : value}
            {unit && <span className="text-sm font-normal text-gray-400 ml-1 leading-none">{unit}</span>}
          </h2>
        </div>
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <div className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium",
              trend.isPositive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-400"
            )}>
              {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trend.value}%
            </div>
          )}
          {description && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  )
}
