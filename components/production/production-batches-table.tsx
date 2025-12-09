"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppSelector } from "@/lib/store"
import type { ProductionBatch } from "@/lib/types"
import { format } from "date-fns"

// Mock data for production batches
const mockBatches: ProductionBatch[] = [
  {
    id: "1357",
    batchNumber: "B-2024-1357",
    productType: "Single Jersey",
    rawMaterialIds: ["rm1"],
    machineIds: ["m01"],
    targetQuantity: 1000,
    actualQuantity: 960,
    startTime: "2024-01-01T08:00:00Z",
    endTime: "2024-01-01T16:00:00Z",
    status: "completed",
    qualityTests: [],
    operatorId: "op1",
    supervisorId: "sup1",
  },
  {
    id: "1358",
    batchNumber: "B-2024-1358",
    productType: "Rib",
    rawMaterialIds: ["rm2"],
    machineIds: ["m02"],
    targetQuantity: 800,
    actualQuantity: 0,
    startTime: "2024-01-02T08:00:00Z",
    status: "in_progress",
    qualityTests: [],
    operatorId: "op2",
    supervisorId: "sup1",
  },
  {
    id: "1359",
    batchNumber: "B-2024-1359",
    productType: "Interlock",
    rawMaterialIds: ["rm3"],
    machineIds: ["m03"],
    targetQuantity: 1200,
    actualQuantity: 0,
    startTime: "2024-01-03T08:00:00Z",
    status: "planned",
    qualityTests: [],
    operatorId: "op3",
    supervisorId: "sup2",
  },
  {
    id: "1360",
    batchNumber: "B-2024-1360",
    productType: "Pique",
    rawMaterialIds: ["rm4"],
    machineIds: ["m04"],
    targetQuantity: 900,
    actualQuantity: 450,
    startTime: "2024-01-04T08:00:00Z",
    status: "on_hold",
    qualityTests: [],
    operatorId: "op4",
    supervisorId: "sup2",
  },
]

export function ProductionBatchesTable() {
  const loading = useAppSelector((state) => state.production.loading)
  const batches = mockBatches // Using mock data for now

  const columns: ColumnDef<ProductionBatch>[] = [
    {
      accessorKey: "batchNumber",
      header: "Batch Number",
      cell: ({ row }) => (
        <div className="font-medium text-primary">
          <Button variant="link" className="p-0 h-auto font-medium">
            {row.getValue("batchNumber")}
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "productType",
      header: "Product Type",
      cell: ({ row }) => <Badge >{row.getValue("productType")}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "targetQuantity",
      header: "Target Qty",
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.getValue<number>("targetQuantity").toLocaleString()} kg</div>
      ),
    },
    {
      accessorKey: "actualQuantity",
      header: "Actual Qty",
      cell: ({ row }) => {
        const actual = row.getValue<number>("actualQuantity")
        const target = row.original.targetQuantity
        const percentage = target > 0 ? (actual / target) * 100 : 0

        return (
          <div className="text-right">
            <div className="font-medium">{actual.toLocaleString()} kg</div>
            <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
          </div>
        )
      },
    },
    {
      accessorKey: "startTime",
      header: "Start Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("startTime"))
        return (
          <div>
            <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
            <div className="text-xs text-muted-foreground">{format(date, "HH:mm")}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "endTime",
      header: "End Date",
      cell: ({ row }) => {
        const endTime = row.getValue("endTime")
        if (!endTime) return <span className="text-muted-foreground">-</span>

        const date = new Date(endTime as string)
        return (
          <div>
            <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
            <div className="text-xs text-muted-foreground">{format(date, "HH:mm")}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "machineIds",
      header: "Machine",
      cell: ({ row }) => {
        const machines = row.getValue<string[]>("machineIds")
        return <Badge variant="secondary">{machines[0]?.toUpperCase()}</Badge>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const batch = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(batch.id)}>Copy batch ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit batch
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete batch
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Planned", value: "planned" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "On Hold", value: "on_hold" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    {
      key: "productType",
      label: "Product Type",
      options: [
        { label: "Single Jersey", value: "Single Jersey" },
        { label: "Rib", value: "Rib" },
        { label: "Interlock", value: "Interlock" },
        { label: "Pique", value: "Pique" },
      ],
    },
  ]

  if (loading) {
    return <div>Loading production batches...</div>
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={batches}
        searchKey="batchNumber"
        searchPlaceholder="Search batches..."
        filters={filters}
      />
    </div>
  )
}
