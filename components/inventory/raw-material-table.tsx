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
      accessorKey: "name",
      header: "Material",
      cell: ({ row }: { row: any }) => {
        const material = row.original as RawMaterial
        return (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-white">{material.name}</div>
            <div className="text-sm text-gray-400">{material.code}</div>
          </div>
        </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: { row: any }) => {
        const material = row.original as RawMaterial
        return (
          <div className="text-sm text-gray-300 capitalize">{material.category.replace("-", " ")}</div>
        )
      },
    },
    {
      accessorKey: "primarySupplier",
      header: "Primary Supplier",
      cell: ({ row }: { row: any }) => {
        const material = row.original as RawMaterial
        return (
        <div>
          <div className="text-sm font-medium text-white">{material.primarySupplier}</div>
          <div className="text-xs text-gray-400">Primary source</div>
        </div>
        )
      },
    },
    {
      accessorKey: "currentStock",
      header: "Current Stock",
      cell: ({ row }: { row: any }) => {
        const material = row.original as RawMaterial
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
      accessorKey: "unitPrice",
      header: "Unit Price",
      cell: ({ row }: { row: any }) => {
        const material = row.original as RawMaterial
        return (
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
        )
      },
    },
    {
      accessorKey: "qualityScore",
      header: "Quality Score",
      cell: ({ row }: { row: any }) => {
        const material = row.original as RawMaterial
        return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-white">{material.qualityScore}%</div>
          <StatusBadge
            status={
              material.qualityScore >= 95 ? "excellent" : material.qualityScore >= 85 ? "good" : "needs-improvement"
            }
            variant={material.qualityScore >= 95 ? "success" : material.qualityScore >= 85 ? "warning" : "error"}
          />
        </div>
        )
      },
    },
    {
      accessorKey: "lastReceived",
      header: "Last Received",
      cell: ({ row }: { row: any }) => {
        const material = row.original as RawMaterial
        return (
          <div className="text-sm text-gray-300">{new Date(material.lastReceived).toLocaleDateString()}</div>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: () => (
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading...</div>
  }

  return (
    <DataTable
      data={materials || []}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Search materials..."
    />
  )
}
