import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { MetricCard } from "@/components/ui/metric-card"
import { Package, AlertTriangle, TrendingDown, Truck } from "lucide-react"

export function RawMaterialMetrics() {
  const { rawMaterials } = useSelector((state: RootState) => state.supplier)

  const totalMaterials = rawMaterials.length
  const lowStockItems = rawMaterials.filter((m) => m.currentStock <= m.reorderLevel).length
  const outOfStockItems = rawMaterials.filter((m) => m.currentStock === 0).length
  const totalValue = rawMaterials.reduce((acc, m) => acc + m.currentStock * m.unitPrice, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Materials"
        value={totalMaterials.toString()}
        subtitle="active items"
        icon={<Package className="w-5 h-5" />}
        trend={{ value: 5.2, isPositive: true }}
        className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20"
      />

      <MetricCard
        title="Low Stock Items"
        value={lowStockItems.toString()}
        subtitle="need reorder"
        icon={<AlertTriangle className="w-5 h-5" />}
        trend={{ value: 3, isPositive: false }}
        className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20"
      />

      <MetricCard
        title="Out of Stock"
        value={outOfStockItems.toString()}
        subtitle="critical items"
        icon={<TrendingDown className="w-5 h-5" />}
        trend={{ value: 1, isPositive: false }}
        className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20"
      />

      <MetricCard
        title="Inventory Value"
        value={`$${(totalValue / 1000).toFixed(1)}K`}
        subtitle="total stock value"
        icon={<Truck className="w-5 h-5" />}
        trend={{ value: 12.3, isPositive: true }}
        className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20"
      />
    </div>
  )
}
