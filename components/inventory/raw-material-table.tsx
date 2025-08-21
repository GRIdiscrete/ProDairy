import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import type { RawMaterial } from "@/lib/types"

interface RawMaterialTableProps {
  materials: RawMaterial[]
  loading: boolean
}

export function RawMaterialTable({ materials, loading }: RawMaterialTableProps) {
  const columns = [
    {
      key: "material",
      header: "Material",
      render: (material: RawMaterial) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-white">{material.name}</div>
            <div className="text-sm text-gray-400">{material.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (material: RawMaterial) => (
        <div className="text-sm text-gray-300 capitalize">{material.category.replace("-", " ")}</div>
      ),
    },
    {
      key: "supplier",
      header: "Primary Supplier",
      render: (material: RawMaterial) => (
        <div>
          <div className="text-sm font-medium text-white">{material.primarySupplier}</div>
          <div className="text-xs text-gray-400">Primary source</div>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Current Stock",
      render: (material: RawMaterial) => {
        const stockPercentage = (material.currentStock / material.maxStock) * 100
        const isLowStock = material.currentStock <= material.reorderLevel

        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {material.currentStock.toLocaleString()} {material.unit}
              </span>
              {isLowStock && <AlertTriangle className="w-4 h-4 text-orange-400" />}
            </div>
            <Progress
              value={stockPercentage}
              className="h-2"
              indicatorClassName={
                stockPercentage > 50 ? "bg-green-500" : stockPercentage > 20 ? "bg-yellow-500" : "bg-red-500"
              }
            />
            <div className="text-xs text-gray-400">
              Reorder at: {material.reorderLevel} {material.unit}
            </div>
          </div>
        )
      },
    },
    {
      key: "price",
      header: "Unit Price",
      render: (material: RawMaterial) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-white">${material.unitPrice.toFixed(2)}</div>
          <div className="flex items-center text-xs">
            {material.priceChange > 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-red-400 mr-1" />
                <span className="text-red-400">+{material.priceChange}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-green-400 mr-1" />
                <span className="text-green-400">{material.priceChange}%</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "quality",
      header: "Quality Score",
      render: (material: RawMaterial) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-white">{material.qualityScore}%</div>
          <StatusBadge
            status={
              material.qualityScore >= 95 ? "excellent" : material.qualityScore >= 85 ? "good" : "needs-improvement"
            }
            variant={material.qualityScore >= 95 ? "success" : material.qualityScore >= 85 ? "warning" : "error"}
          />
        </div>
      ),
    },
    {
      key: "lastReceived",
      header: "Last Received",
      render: (material: RawMaterial) => (
        <div className="text-sm text-gray-300">{new Date(material.lastReceived).toLocaleDateString()}</div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  return (
    <DataTable
      data={materials}
      columns={columns}
      loading={loading}
      searchable={false}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
      }}
    />
  )
}
