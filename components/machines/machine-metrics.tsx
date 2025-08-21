"use client"

import { MetricCard } from "@/components/ui/metric-card"
import { Settings, Play, Pause, AlertTriangle } from "lucide-react"
import { useAppSelector } from "@/lib/store"

export function MachineMetrics() {
  const metrics = useAppSelector((state) => state.dashboard.metrics)

  if (!metrics) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Machines"
        value={metrics.machines.total}
        change={{ value: 2, type: "increase" }}
        icon={Settings}
        iconColor="text-blue-600"
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      />
      <MetricCard
        title="Running"
        value={metrics.machines.running}
        change={{ value: 5, type: "increase" }}
        icon={Play}
        iconColor="text-green-600"
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
      />
      <MetricCard
        title="Idle"
        value={metrics.machines.idle}
        change={{ value: 2, type: "decrease" }}
        icon={Pause}
        iconColor="text-yellow-600"
        className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
      />
      <MetricCard
        title="Maintenance"
        value={metrics.machines.maintenance + metrics.machines.fault}
        change={{ value: 1, type: "decrease" }}
        icon={AlertTriangle}
        iconColor="text-red-600"
        className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
      />
    </div>
  )
}
