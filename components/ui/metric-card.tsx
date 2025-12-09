import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  change?: {
    value: number
    type: "increase" | "decrease"
  }
  icon?: LucideIcon
  iconColor?: string
  iconBgColor?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  unit,
  change,
  icon: Icon,
  iconColor = "text-gray-600",
  iconBgColor = "bg-gray-100",
  className,
}: MetricCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-sm font-medium text-gray-500">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconBgColor
          )}>
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
        )}
      </div>
      {change && (
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            change.type === "increase" 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          )}>
            <span className="text-xs">
              {change.type === "increase" ? "↗" : "↘"}
            </span>
            {Math.abs(change.value)}%
          </div>
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
      )}
    </div>
  )
}
