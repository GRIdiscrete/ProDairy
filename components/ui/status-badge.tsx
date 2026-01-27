import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
}

const statusVariants = {
  // Production statuses
  running: "bg-green-100 text-green-800 hover:bg-green-100",
  idle: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  maintenance: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  fault: "bg-red-100 text-red-800 hover:bg-red-100",
  offline: "bg-gray-100 text-gray-800 hover:bg-gray-100",

  // Quality statuses
  pass: "bg-green-100 text-green-800 hover:bg-green-100",
  fail: "bg-red-100 text-red-800 hover:bg-red-100",
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  retest: "bg-orange-100 text-orange-800 hover:bg-orange-100",

  // Batch statuses
  planned: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  in_progress: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  completed: "bg-green-100 text-green-800 hover:bg-green-100",
  on_hold: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
  quality_check: "bg-orange-100 text-orange-800 hover:bg-orange-100",

  // General statuses
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  accepted: "bg-green-100 text-green-800 hover:bg-green-100",
  rejected: "bg-red-100 text-red-800 hover:bg-red-100",
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const statusKey = status.toLowerCase().replace(/\s+/g, "_") as keyof typeof statusVariants
  const statusClass = statusVariants[statusKey] || statusVariants.pending

  return (
    <Badge variant={variant || "secondary"} className={cn(statusClass, className)}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
    </Badge>
  )
}
