import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  className?: string
}

export function MetricCard({
  title,
  value,
  unit,
  change,
  icon: Icon,
  iconColor = "text-primary",
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className={cn("rounded-full p-2", iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {change && (
          <div className="mt-1 flex items-center space-x-1">
            <Badge variant={change.type === "increase" ? "default" : "destructive"} className="text-xs">
              {change.type === "increase" ? "+" : "-"}
              {Math.abs(change.value)}%
            </Badge>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
