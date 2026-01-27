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
      accessorKey: "name",
      header: "Supplier",
      cell: ({ row }: { row: any }) => {
        const supplier = row.original as Supplier
        return (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0068BD] rounded-lg flex items-center justify-center text-white font-semibold">
            {supplier.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-white">{supplier.name}</div>
            <div className="text-sm text-gray-400">{supplier.code}</div>
          </div>
        </div>
        )
      },
    },
    {
      accessorKey: "contactInfo",
      header: "Contact Information",
      cell: ({ row }: { row: any }) => {
        const supplier = row.original as Supplier
        return (
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
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: { row: any }) => {
        const supplier = row.original as Supplier
        return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-white capitalize">{supplier.category.replace("-", " ")}</div>
          <div className="text-xs text-gray-400">{supplier.materials.length} materials</div>
        </div>
        )
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }: { row: any }) => {
        const supplier = row.original as Supplier
        return (
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium text-white">{supplier.rating}</span>
          </div>
          <div className="text-xs text-gray-400">({supplier.totalOrders} orders)</div>
        </div>
        )
      },
    },
    {
      accessorKey: "performance",
      header: "Performance",
      cell: ({ row }: { row: any }) => {
        const supplier = row.original as Supplier
        return (
        <div className="space-y-1">
          <div className="text-sm text-white">
            On-time: <span className="text-green-400">{supplier.performance.onTimeDelivery}%</span>
          </div>
          <div className="text-sm text-white">
            Quality: <span className="text-blue-400">{supplier.performance.qualityScore}%</span>
          </div>
        </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const supplier = row.original as Supplier
        return (
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
      data={suppliers}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Search suppliers..."
    />
  )
}
