import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Phone, Mail, MapPin, Star } from "lucide-react"
import type { Supplier } from "@/lib/types"

interface SupplierDirectoryTableProps {
  suppliers: Supplier[]
  loading: boolean
}

export function SupplierDirectoryTable({ suppliers, loading }: SupplierDirectoryTableProps) {
  const columns = [
    {
      key: "supplier",
      header: "Supplier",
      render: (supplier: Supplier) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
            {supplier.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-white">{supplier.name}</div>
            <div className="text-sm text-gray-400">{supplier.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Information",
      render: (supplier: Supplier) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-300">
            <Phone className="w-3 h-3 mr-2" />
            {supplier.contactInfo.phone}
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Mail className="w-3 h-3 mr-2" />
            {supplier.contactInfo.email}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <MapPin className="w-3 h-3 mr-2" />
            {supplier.contactInfo.address.city}, {supplier.contactInfo.address.country}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (supplier: Supplier) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-white capitalize">{supplier.category.replace("-", " ")}</div>
          <div className="text-xs text-gray-400">{supplier.materials.length} materials</div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (supplier: Supplier) => (
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium text-white">{supplier.rating}</span>
          </div>
          <div className="text-xs text-gray-400">({supplier.totalOrders} orders)</div>
        </div>
      ),
    },
    {
      key: "performance",
      header: "Performance",
      render: (supplier: Supplier) => (
        <div className="space-y-1">
          <div className="text-sm text-white">
            On-time: <span className="text-green-400">{supplier.performance.onTimeDelivery}%</span>
          </div>
          <div className="text-sm text-white">
            Quality: <span className="text-blue-400">{supplier.performance.qualityScore}%</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (supplier: Supplier) => (
        <StatusBadge
          status={supplier.status}
          variant={
            supplier.status === "active"
              ? "success"
              : supplier.status === "pending"
                ? "warning"
                : supplier.status === "suspended"
                  ? "error"
                  : "secondary"
          }
        />
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
      data={suppliers}
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
