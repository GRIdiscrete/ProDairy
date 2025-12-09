"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { MetricCard } from "@/components/ui/metric-card"
import { Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

export function SupplierMetrics() {
  const { suppliers } = useSelector((state: RootState) => state.supplier)

  const activeSuppliers = suppliers.filter((s) => s.status === "active").length
  const totalSuppliers = suppliers.length
  const avgRating = suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length || 0
  const pendingApprovals = suppliers.filter((s) => s.status === "pending").length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Active Suppliers"
        value={activeSuppliers.toString()}
        unit={`of ${totalSuppliers} total`}
        icon={Users}
        change={{ value: 8.2, type: "increase" }}
        className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-[#006BC4]/20"
      />

      <MetricCard
        title="Average Rating"
        value={avgRating.toFixed(1)}
        unit="out of 5.0"
        icon={TrendingUp}
        change={{ value: 0.3, type: "increase" }}
        className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20"
      />

      <MetricCard
        title="Pending Approvals"
        value={pendingApprovals.toString()}
        unit="require review"
        icon={AlertTriangle}
        change={{ value: 2, type: "decrease" }}
        className="bg-gradient-to-br /10 to-orange-600/10 border-orange-500/20"
      />

      <MetricCard
        title="Quality Score"
        value="94.2%"
        unit="avg quality rating"
        icon={CheckCircle}
        change={{ value: 1.8, type: "increase" }}
        className="bg-blue-50 border-blue-200"
      />
    </div>
  )
}
