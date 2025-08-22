"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { Target, Award, Settings, AlertTriangle } from "lucide-react"
import { useAppSelector } from "@/lib/store"

export function ProductionOverview() {
  const metrics = useAppSelector((state) => state.dashboard.metrics)

  if (!metrics) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Production Target"
        value={metrics.production.targetProduction}
        unit="kg"
        icon={Target}
        iconBgColor="bg-gradient-to-br from-[#4f46e5] to-[#6366f1]"
        change={{ value: 2.5, type: "increase" }}
      />
      <MetricCard
        title="Production Achieved"
        value={metrics.production.actualProduction}
        unit="kg"
        icon={Award}
        iconBgColor="bg-gradient-to-br from-[#f59e0b] to-[#f97316]"
        change={{ value: 1.8, type: "increase" }}
      />
      <MetricCard
        title="Machine Status"
        value={`${metrics.machines.running} /out of ${metrics.machines.total}`}
        icon={Settings}
        iconBgColor="bg-gradient-to-br from-[#10b981] to-[#059669]"
        change={{ value: 0.5, type: "increase" }}
      />
      <MetricCard
        title="Wastage"
        value={metrics.production.wastage}
        unit="kg"
        icon={AlertTriangle}
        iconBgColor="bg-gradient-to-br from-[#ef4444] to-[#dc2626]"
        change={{ value: 0.3, type: "decrease" }}
      />
    </div>
  )
}
