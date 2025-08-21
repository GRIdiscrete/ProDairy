"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { TestTube, CheckCircle, XCircle, Clock } from "lucide-react"
import { useAppSelector } from "@/lib/store"

export function QualityMetrics() {
  const metrics = useAppSelector((state) => state.dashboard.metrics)

  if (!metrics) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Tests Completed"
        value="248"
        change={{ value: 12, type: "increase" }}
        icon={TestTube}
        iconColor="text-blue-600"
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      />
      <MetricCard
        title="Pass Rate"
        value={metrics.quality.passRate}
        unit="%"
        change={{ value: 2.1, type: "increase" }}
        icon={CheckCircle}
        iconColor="text-green-600"
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
      />
      <MetricCard
        title="Failed Tests"
        value="12"
        change={{ value: 8, type: "decrease" }}
        icon={XCircle}
        iconColor="text-red-600"
        className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
      />
      <MetricCard
        title="Pending Tests"
        value={metrics.quality.testsPending}
        change={{ value: 5, type: "increase" }}
        icon={Clock}
        iconColor="text-orange-600"
        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
      />
    </div>
  )
}
