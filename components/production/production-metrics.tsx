"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { Package, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useAppSelector } from "@/lib/store"

export function ProductionMetrics() {
  const metrics = useAppSelector((state) => state.dashboard.metrics)

  if (!metrics) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Batches"
        value="156"
        change={{ value: 12, type: "increase" }}
        icon={Package}
        iconColor="text-blue-600"
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      />
      <MetricCard
        title="In Progress"
        value="23"
        change={{ value: 5, type: "increase" }}
        icon={Clock}
        iconColor="text-orange-600"
        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
      />
      <MetricCard
        title="Completed"
        value="128"
        change={{ value: 8, type: "increase" }}
        icon={CheckCircle}
        iconColor="text-green-600"
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
      />
      <MetricCard
        title="Quality Issues"
        value="5"
        change={{ value: 2, type: "decrease" }}
        icon={AlertCircle}
        iconColor="text-red-600"
        className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
      />
    </div>
  )
}
