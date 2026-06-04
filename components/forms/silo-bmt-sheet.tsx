"use client"

import React, { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DataTable } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { bmtControlFormApi, BMTControlForm, BMTTableRow } from "@/lib/api/bmt-control-form"
import { LayoutList, Table2 } from "lucide-react"

interface SiloBMTSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  siloName: string
}

const recordColumns = [
  {
    accessorKey: "tag",
    header: "Tag",
    cell: ({ row }: any) => <span className="text-sm font-medium">{row.original.tag ?? "—"}</span>,
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.product}</span>,
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }: any) => (
      <span className="text-sm font-light">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "route",
    header: "Source → Destination",
    cell: ({ row }: any) => {
      const pair = row.original.source_destination_details?.[0]
      if (!pair) return <span className="text-sm text-gray-400">—</span>
      return (
        <div className="flex items-center gap-1 text-sm font-light">
          <span>{pair.source_silo_details?.silo_name ?? "—"}</span>
          <span className="text-gray-400">→</span>
          <span>{pair.destination_silo_details?.silo_name ?? "—"}</span>
        </div>
      )
    },
  },
  {
    id: "volume",
    header: "Volume",
    cell: ({ row }: any) => {
      const vol = row.original.source_destination_details?.[0]?.source_silo_details?.volume
      return (
        <span className="text-sm font-light">{vol != null ? `${vol.toLocaleString()} L` : "—"}</span>
      )
    },
  },
  {
    id: "dispatch",
    header: "Dispatch Operator",
    cell: ({ row }: any) => {
      const op = (row.original as any).dispatch_operator
      return (
        <span className="text-sm font-light">
          {op ? `${op.first_name} ${op.last_name}` : "—"}
        </span>
      )
    },
  },
]

export const bmtTableColumns = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.date}</span>,
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.product}</span>,
  },
  {
    accessorKey: "flow_meter_start",
    header: "FM Start",
    cell: ({ row }: any) => (
      <span className="text-sm font-light">{row.original.flow_meter_start?.toLocaleString() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "flow_meter_end",
    header: "FM End",
    cell: ({ row }: any) => (
      <span className="text-sm font-light">{row.original.flow_meter_end?.toLocaleString() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.source ?? "—"}</span>,
  },
  {
    accessorKey: "movement_start",
    header: "Mov. Start",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.movement_start ?? "—"}</span>,
  },
  {
    accessorKey: "movement_end",
    header: "Mov. End",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.movement_end ?? "—"}</span>,
  },
  {
    accessorKey: "destination",
    header: "Destination",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.destination ?? "—"}</span>,
  },
  {
    accessorKey: "volume_moved",
    header: "Volume (L)",
    cell: ({ row }: any) => (
      <span className="text-sm font-light">
        {row.original.volume_moved != null ? row.original.volume_moved.toLocaleString() : "—"}
      </span>
    ),
  },
  {
    accessorKey: "llm_operator",
    header: "LLM",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.llm_operator ?? "—"}</span>,
  },
  {
    accessorKey: "dispatch_operator",
    header: "DPP",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.dispatch_operator ?? "—"}</span>,
  },
]

export function SiloBMTSheet({ open, onOpenChange, siloName }: SiloBMTSheetProps) {
  const [viewMode, setViewMode] = useState<"records" | "table">("records")
  const [records, setRecords] = useState<BMTControlForm[]>([])
  const [tableRows, setTableRows] = useState<BMTTableRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([bmtControlFormApi.getBySilo(siloName), bmtControlFormApi.getTableBySilo(siloName)])
      .then(([recs, rows]) => {
        setRecords([...recs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
        setTableRows(rows)
      })
      .finally(() => setLoading(false))
  }, [open, siloName])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-5xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-light">{siloName} — BMT Forms</SheetTitle>
            <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-0.5">
              <button
                onClick={() => setViewMode("records")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "records" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <LayoutList className="w-3.5 h-3.5" /> Records
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Table2 className="w-3.5 h-3.5" /> Table View
              </button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : viewMode === "records" ? (
            <DataTable
              columns={recordColumns}
              data={records}
              searchKey="tag"
            />
          ) : (
            <DataTable
              columns={bmtTableColumns}
              data={tableRows}
              searchKey="product"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
