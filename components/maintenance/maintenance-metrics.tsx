"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react"

export function MaintenanceMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Scheduled Tasks"
        value="24"
        change={{ value: 3, type: "increase" }}
        icon={Calendar}
        iconColor="text-blue-600"
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      />
      <MetricCard
        title="Overdue Tasks"
        value="3"
        change={{ value: 2, type: "decrease" }}
        icon={Clock}
        iconColor="text-red-600"
        className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
      />
      <MetricCard
        title="Completed"
        value="156"
        change={{ value: 12, type: "increase" }}
        icon={CheckCircle}
        iconColor="text-green-600"
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
      />
      <MetricCard
        title="Critical Issues"
        value="2"
        change={{ value: 1, type: "decrease" }}
        icon={AlertTriangle}
        iconColor="text-orange-600"
        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
      />
    </div>
  )
}
