"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { Target, Award, Settings, AlertTriangle } from "lucide-react"
import { useAppSelector } from "@/lib/store"

export function ProductionOverview() {
  const metrics = useAppSelector((state) => state.dashboard.metrics)

  if (!metrics) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Production Target"
        value={metrics.production.targetProduction}
        unit="kg"
        icon={Target}
        iconColor="text-blue-600"
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      />
      <MetricCard
        title="Production Achieved"
        value={metrics.production.actualProduction}
        unit="kg"
        icon={Award}
        iconColor="text-orange-600"
        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
      />
      <MetricCard
        title="Machine Status"
        value={`${metrics.machines.running}/out of ${metrics.machines.total}`}
        icon={Settings}
        iconColor="text-green-600"
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
      />
      <MetricCard
        title="Wastage"
        value={metrics.production.wastage}
        unit="kg"
        icon={AlertTriangle}
        iconColor="text-red-600"
        className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
      />
    </div>
  )
}
