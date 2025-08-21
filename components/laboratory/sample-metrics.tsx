"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { Beaker, Clock, CheckCircle, AlertTriangle } from "lucide-react"

export function SampleMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Samples"
        value="342"
        change={{ value: 18, type: "increase" }}
        icon={Beaker}
        iconColor="text-blue-600"
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      />
      <MetricCard
        title="In Testing"
        value="28"
        change={{ value: 3, type: "increase" }}
        icon={Clock}
        iconColor="text-orange-600"
        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
      />
      <MetricCard
        title="Completed"
        value="298"
        change={{ value: 15, type: "increase" }}
        icon={CheckCircle}
        iconColor="text-green-600"
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
      />
      <MetricCard
        title="Rejected"
        value="16"
        change={{ value: 2, type: "decrease" }}
        icon={AlertTriangle}
        iconColor="text-red-600"
        className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
      />
    </div>
  )
}
