"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface ProductionReportData {
  id: string
  date: string
  machine: string
  itemName: string
  uom: string
  targetQty: number
  actualQty: number
  efficiency: number
}

// Mock data for production report
const mockReportData: ProductionReportData[] = [
  {
    id: "1357",
    date: "2024-01-01",
    machine: "M/C 01",
    itemName: "Single Jersey",
    uom: "kg",
    targetQty: 1000,
    actualQty: 960,
    efficiency: 96.0,
  },
  {
    id: "1358",
    date: "2024-01-01",
    machine: "M/C 02",
    itemName: "Single Jersey",
    uom: "kg",
    targetQty: 800,
    actualQty: 780,
    efficiency: 97.5,
  },
  {
    id: "1359",
    date: "2024-01-01",
    machine: "M/C 03",
    itemName: "Single Jersey",
    uom: "kg",
    targetQty: 1200,
    actualQty: 1150,
    efficiency: 95.8,
  },
  {
    id: "1360",
    date: "2024-01-01",
    machine: "M/C 04",
    itemName: "Single Jersey",
    uom: "kg",
    targetQty: 900,
    actualQty: 870,
    efficiency: 96.7,
  },
]

export function ProductionReportTable() {
  const columns: ColumnDef<ProductionReportData>[] = [
    {
      accessorKey: "id",
      header: "Id",
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"))
        return <div>{format(date, "dd MMM, yyyy")}</div>
      },
    },
    {
      accessorKey: "machine",
      header: "Machine",
      cell: ({ row }) => <Badge >{row.getValue("machine")}</Badge>,
    },
    {
      accessorKey: "itemName",
      header: "Item Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("itemName")}</div>,
    },
    {
      accessorKey: "uom",
      header: "UOM",
      cell: ({ row }) => <div className="text-center">{row.getValue("uom")}</div>,
    },
    {
      accessorKey: "targetQty",
      header: "Target Qty",
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.getValue<number>("targetQty").toLocaleString()}</div>
      ),
    },
    {
      accessorKey: "actualQty",
      header: "Actual Qty",
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.getValue<number>("actualQty").toLocaleString()}</div>
      ),
    },
    {
      accessorKey: "efficiency",
      header: "Efficiency",
      cell: ({ row }) => {
        const efficiency = row.getValue<number>("efficiency")
        return (
          <div className="text-right">
            <Badge variant={efficiency >= 95 ? "default" : efficiency >= 90 ? "secondary" : "destructive"}>
              {efficiency.toFixed(1)}%
            </Badge>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={mockReportData}
        searchKey="itemName"
        searchPlaceholder="Search items..."
        filters={[
          {
            key: "machine",
            label: "Machine",
            options: [
              { label: "M/C 01", value: "M/C 01" },
              { label: "M/C 02", value: "M/C 02" },
              { label: "M/C 03", value: "M/C 03" },
              { label: "M/C 04", value: "M/C 04" },
            ],
          },
        ]}
      />
    </div>
  )
}
