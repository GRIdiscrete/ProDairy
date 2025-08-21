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
        subtitle={`of ${totalSuppliers} total`}
        icon={<Users className="w-5 h-5" />}
        trend={{ value: 8.2, isPositive: true }}
        className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20"
      />

      <MetricCard
        title="Average Rating"
        value={avgRating.toFixed(1)}
        subtitle="out of 5.0"
        icon={<TrendingUp className="w-5 h-5" />}
        trend={{ value: 0.3, isPositive: true }}
        className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20"
      />

      <MetricCard
        title="Pending Approvals"
        value={pendingApprovals.toString()}
        subtitle="require review"
        icon={<AlertTriangle className="w-5 h-5" />}
        trend={{ value: 2, isPositive: false }}
        className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20"
      />

      <MetricCard
        title="Quality Score"
        value="94.2%"
        subtitle="avg quality rating"
        icon={<CheckCircle className="w-5 h-5" />}
        trend={{ value: 1.8, isPositive: true }}
        className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20"
      />
    </div>
  )
}
