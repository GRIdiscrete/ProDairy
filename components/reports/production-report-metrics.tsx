"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { TrendingUp, Target, Clock, DollarSign } from "lucide-react"

export function ProductionReportMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Production"
        value="62,000"
        unit="kg"
        change={{ value: 8.2, type: "increase" }}
        icon={TrendingUp}
        iconColor="text-green-600"
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
      />
      <MetricCard
        title="Target Achievement"
        value="86.1"
        unit="%"
        change={{ value: 2.5, type: "increase" }}
        icon={Target}
        iconColor="text-blue-600"
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      />
      <MetricCard
        title="Production Time"
        value="168"
        unit="hrs"
        change={{ value: 5.1, type: "decrease" }}
        icon={Clock}
        iconColor="text-orange-600"
        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
      />
      <MetricCard
        title="Production Cost"
        value="13.5"
        unit="K USD"
        change={{ value: 3.2, type: "increase" }}
        icon={DollarSign}
        iconColor="text-blue-600"
        className="bg-blue-50 border-blue-200"
      />
    </div>
  )
}
