"use client"

import React, { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DataTable } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  CIPControlForm,
  CIPTableRow,
  getCIPsForSilo,
  getCIPTable,
  getCIPControlForms,
} from "@/lib/api/data-capture-forms"
import { LayoutList, Table2, Download } from "lucide-react"
import { exportToExcel } from "@/lib/utils/export-excel"

interface SiloCIPSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  siloName: string
}

const getStatusClass = (status: string) => {
  switch (status) {
    case "Completed": return "bg-green-100 text-green-800"
    case "In Progress": return "bg-blue-100 text-blue-800"
    case "Approved": return "bg-purple-100 text-purple-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const recordColumns = [
  {
    accessorKey: "tag",
    header: "Form ID",
    cell: ({ row }: any) => (
      <span className="text-sm font-medium">
        {(row.original as any).tag ?? row.original.id?.slice(0, 8) ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => (
      <Badge className={`font-light text-xs ${getStatusClass(row.original.status ?? "")}`}>
        {row.original.status ?? "Draft"}
      </Badge>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }: any) => (
      <span className="text-sm font-light">
        {row.original.date ? new Date(row.original.date).toLocaleDateString() : "—"}
      </span>
    ),
  },
  {
    accessorKey: "machine_or_silo",
    header: "Equipment",
    cell: ({ row }: any) => {
      const machine = typeof row.original.machine_id === "object" ? row.original.machine_id : null
      const silo = typeof row.original.silo_id === "object" ? row.original.silo_id : null
      const target = machine || silo
      return <span className="text-sm font-light">{target?.name ?? "—"}</span>
    },
  },
  {
    accessorKey: "rinse_water_test",
    header: "Rinse Test",
    cell: ({ row }: any) => (
      <span className="text-sm font-light">{row.original.rinse_water_test ?? "—"}</span>
    ),
  },
]

export const cipTableColumnsForSheet = [
  {
    accessorKey: "equipment",
    header: "Equipment",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.equipment ?? "—"}</span>,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.date ?? "—"}</span>,
  },
  {
    accessorKey: "operator",
    header: "Operator",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.operator ?? "—"}</span>,
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.stage?.trim() ?? "—"}</span>,
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.start_time ?? "—"}</span>,
  },
  {
    accessorKey: "stop_time",
    header: "Stop Time",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.stop_time ?? "—"}</span>,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.duration ?? "—"}</span>,
  },
  {
    accessorKey: "caustic_solution_strength",
    header: "Caustic (%)",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.caustic_solution_strength ?? "—"}</span>,
  },
  {
    accessorKey: "caustic_temperature",
    header: "Caustic Temp (°C)",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.caustic_temperature ?? "—"}</span>,
  },
  {
    accessorKey: "acid_solution_strength",
    header: "Acid (%)",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.acid_solution_strength ?? "—"}</span>,
  },
  {
    accessorKey: "acid_temperature",
    header: "Acid Temp (°C)",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.acid_temperature ?? "—"}</span>,
  },
  {
    accessorKey: "checked_by",
    header: "Checked By",
    cell: ({ row }: any) => <span className="text-sm font-light">{row.original.checked_by?.trim() ?? "—"}</span>,
  },
]

export function SiloCIPSheet({ open, onOpenChange, siloName }: SiloCIPSheetProps) {
  const [viewMode, setViewMode] = useState<"records" | "table">("records")
  const [scope, setScope] = useState<"silo" | "all">("silo")
  const [siloRecords, setSiloRecords] = useState<CIPControlForm[]>([])
  const [allRecords, setAllRecords] = useState<CIPControlForm[]>([])
  const [siloTableRows, setSiloTableRows] = useState<CIPTableRow[]>([])
  const [allTableRows, setAllTableRows] = useState<CIPTableRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([getCIPsForSilo(siloName), getCIPControlForms(), getCIPTable()])
      .then(([siloRecs, allRecs, allRows]) => {
        const sortByDate = (a: CIPControlForm, b: CIPControlForm) =>
          new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
        setSiloRecords([...siloRecs].sort(sortByDate))
        setAllRecords([...allRecs].sort(sortByDate))
        setSiloTableRows(allRows.filter((r) => r.equipment === siloName))
        setAllTableRows(allRows)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, siloName])

  const records = scope === "silo" ? siloRecords : allRecords
  const tableRows = scope === "silo" ? siloTableRows : allTableRows

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-5xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <SheetTitle className="text-xl font-light">
              {scope === "silo" ? `${siloName} — CIP Forms` : "All CIP Forms"}
            </SheetTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-0.5">
                <button
                  onClick={() => setScope("silo")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${scope === "silo" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                >
                  This Silo
                </button>
                <button
                  onClick={() => setScope("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${scope === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                >
                  All CIPs
                </button>
              </div>
              {viewMode === "table" && (
                <button
                  onClick={() =>
                    exportToExcel(
                      cipTableColumnsForSheet.map((c) => ({ header: c.header, key: c.accessorKey })),
                      tableRows,
                      `${scope === "silo" ? siloName : "All"}-CIP-table`
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
              )}
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
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : viewMode === "records" ? (
            <DataTable columns={recordColumns} data={records} searchKey="tag" />
          ) : (
            <DataTable columns={cipTableColumnsForSheet} data={tableRows} searchKey="equipment" />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
