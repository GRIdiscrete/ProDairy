"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchSiloManagerSilos, fetchSiloTransfers } from "@/lib/store/slices/siloSlice"
import { SiloGauge } from "@/components/ui/silo-gauge"
import { SiloDetailsDrawer } from "@/components/forms/silo-details-drawer"
import { SiloFormDrawer } from "@/components/forms/silo-form-drawer"
import { BMTControlFormDrawer } from "@/components/forms/bmt-control-form-drawer"
import { BMTControlFormViewDrawer } from "@/components/forms/bmt-control-form-view-drawer"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Droplets, ArrowRightLeft, Clock, History, Package, Plus, Eye, Edit, LayoutGrid, List, LayoutList, Table2, Download, FlaskConical } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { bmtControlFormApi, BMTTableRow } from "@/lib/api/bmt-control-form"
import { bmtTableColumns } from "@/components/forms/silo-bmt-sheet"
import { cipTableColumnsForSheet } from "@/components/forms/silo-cip-sheet"
import { getCIPControlForms, getCIPTable, CIPControlForm, CIPTableRow } from "@/lib/api/data-capture-forms"
import { rawMilkIntakeApi, RawMilkIntakeForm, RawMilkIntakeTableRow } from "@/lib/api/raw-milk-intake"
import { collectionVoucherApi } from "@/lib/api/collection-voucher"
import { CollectionVoucherViewDrawer } from "@/components/forms/collection-voucher-form-view-drawer"
import type { CollectionVoucher2 } from "@/lib/types"
import { exportToExcel } from "@/lib/utils/export-excel"

export default function SiloManagementPage() {
  const dispatch = useAppDispatch()
  const { silos, transfers, operationLoading } = useAppSelector((state) => state.silo)
  
  const [selectedSilo, setSelectedSilo] = useState<any | null>(null)
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)

  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null)
  const [transferDrawerOpen, setTransferDrawerOpen] = useState(false)
  const [viewTransferDrawerOpen, setViewTransferDrawerOpen] = useState(false)
  const [transferMode, setTransferMode] = useState<"create" | "edit">("create")
  const [sourceSilo, setSourceSilo] = useState<any | null>(null)
  const [transferViewMode, setTransferViewMode] = useState<"records" | "table">("records")
  const [transferTableData, setTransferTableData] = useState<BMTTableRow[]>([])
  const [transferTableLoading, setTransferTableLoading] = useState(false)

  const [cipViewMode, setCipViewMode] = useState<"records" | "table">("records")
  const [cipRecords, setCipRecords] = useState<CIPControlForm[]>([])
  const [cipTableData, setCipTableData] = useState<CIPTableRow[]>([])
  const [cipLoading, setCipLoading] = useState(false)
  const cipFetchedRef = useRef(false)

  const [compositionRows, setCompositionRows] = useState<any[]>([])
  const [intakeLogs, setIntakeLogs] = useState<{ siloName: string; form: RawMilkIntakeForm }[]>([])
  const [compositionLoading, setCompositionLoading] = useState(false)
  const compositionFetchedRef = useRef(false)

  const [selectedVoucher, setSelectedVoucher] = useState<CollectionVoucher2 | null>(null)
  const [voucherDrawerOpen, setVoucherDrawerOpen] = useState(false)
  const [loadingVoucherTag, setLoadingVoucherTag] = useState<string | null>(null)

  const [intakeTableData, setIntakeTableData] = useState<RawMilkIntakeTableRow[]>([])
  const [intakeTableLoading, setIntakeTableLoading] = useState(false)
  const intakeTableFetchedRef = useRef(false)

  const [cipByDate, setCipByDate] = useState<Record<string, string>>({})

  const hasFetchedRef = useRef(false)
  const cipFetchedForGaugesRef = useRef(false)

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchSiloManagerSilos())
      dispatch(fetchSiloTransfers())
    }
  }, [dispatch])

  const fetchCipForGauges = () => {
    getCIPControlForms()
      .then((records) => {
        const latest: Record<string, string> = {}
        for (const cip of records) {
          if (cip.status !== "Completed" && cip.status !== "Approved") continue
          const siloObj = typeof cip.silo_id === "object" ? cip.silo_id : null
          const siloName = siloObj?.name
          if (!siloName) continue
          const cipDate = cip.date ?? cip.created_at
          if (!cipDate) continue
          if (!latest[siloName] || new Date(cipDate) > new Date(latest[siloName])) {
            latest[siloName] = cipDate
          }
        }
        setCipByDate(latest)
      })
      .catch(() => {})
  }

  // Fetch all CIP records once so gauges can show per-silo CIP freshness
  useEffect(() => {
    if (cipFetchedForGaugesRef.current || silos.length === 0) return
    cipFetchedForGaugesRef.current = true
    fetchCipForGauges()
  }, [silos.length])

  const cipHoursMap = useMemo(() => {
    const now = Date.now()
    const map: Record<string, number> = {}
    for (const [name, dateStr] of Object.entries(cipByDate)) {
      map[name] = (now - new Date(dateStr).getTime()) / (1000 * 60 * 60)
    }
    return map
  }, [cipByDate])

  useEffect(() => {
    if (transferViewMode !== "table" || transferTableData.length > 0) return
    setTransferTableLoading(true)
    bmtControlFormApi.getTable()
      .then(setTransferTableData)
      .catch(() => {})
      .finally(() => setTransferTableLoading(false))
  }, [transferViewMode])

  // Re-fetch the transfers table data after a BMT form is created/updated so volumes stay current
  const refreshTransferTableData = () => {
    setTransferTableLoading(true)
    bmtControlFormApi.getTable()
      .then(setTransferTableData)
      .catch(() => {})
      .finally(() => setTransferTableLoading(false))
  }

  // Fetch CIP data once when the CIP tab is first visited
  const handleCipTabOpen = () => {
    if (cipFetchedRef.current) return
    cipFetchedRef.current = true
    setCipLoading(true)
    Promise.all([getCIPControlForms(), getCIPTable()])
      .then(([records, tableRows]) => {
        const sorted = [...records].sort(
          (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
        )
        setCipRecords(sorted)
        setCipTableData(tableRows)
      })
      .catch(() => {})
      .finally(() => setCipLoading(false))
  }

  // Flatten composition from loaded silos and fetch intake logs once per session
  const handleCompositionTabOpen = () => {
    // Always re-derive composition rows from current silos state (fast, no network)
    const rows: any[] = []
    const intakeIds: { siloName: string; id: string }[] = []

    for (const silo of silos) {
      if (silo.composition) {
        for (const entry of silo.composition) {
          rows.push({
            silo_name: silo.name,
            supplier: entry.supplier_first_name ?? (entry as any).first_name ?? "—",
            tank: entry.supplier_tank ?? (entry as any).tank ?? "—",
            volume: entry.volume ?? null,
            voucher: entry.voucher_tag ?? (entry as any).voucher ?? "—",
            date: entry.voucher_date ?? "—",
          })
        }
      }
      if ((silo as any).intake_log) {
        intakeIds.push({ siloName: silo.name, id: (silo as any).intake_log })
      }
    }
    rows.sort((a, b) => {
      if (!a.date || a.date === "—") return 1
      if (!b.date || b.date === "—") return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    setCompositionRows(rows)

    // Fetch intake forms only once
    if (compositionFetchedRef.current || intakeIds.length === 0) return
    compositionFetchedRef.current = true
    setCompositionLoading(true)
    Promise.all(
      intakeIds.map(({ siloName, id }) =>
        rawMilkIntakeApi.getById(id)
          .then((res) => ({ siloName, form: res.data }))
          .catch(() => null)
      )
    )
      .then((results) => {
        setIntakeLogs(results.filter(Boolean) as { siloName: string; form: RawMilkIntakeForm }[])
      })
      .finally(() => setCompositionLoading(false))
  }

  const handleIntakeTabOpen = () => {
    if (intakeTableFetchedRef.current) return
    intakeTableFetchedRef.current = true
    setIntakeTableLoading(true)
    rawMilkIntakeApi.getTable()
      .then((res) => setIntakeTableData(res.data ?? []))
      .catch(() => {})
      .finally(() => setIntakeTableLoading(false))
  }

  const handleVoucherClick = (tag: string) => {
    if (!tag || tag === "—") return
    setLoadingVoucherTag(tag)
    collectionVoucherApi.getByTag(tag)
      .then((res) => {
        setSelectedVoucher(res.data)
        setVoucherDrawerOpen(true)
      })
      .catch(() => {})
      .finally(() => setLoadingVoucherTag(null))
  }

  const handleSiloClick = (silo: any) => {
    setSelectedSilo(silo)
    setDetailsDrawerOpen(true)
  }

  const handleEditSilo = (silo: any) => {
    setSelectedSilo(silo)
    setDetailsDrawerOpen(false)
    setEditDrawerOpen(true)
  }

  const handleAddTransfer = (silo?: any) => {
    setSelectedTransfer(null)
    setSourceSilo(silo ?? null)
    setTransferMode("create")
    setTransferDrawerOpen(true)
  }

  const handleEditTransfer = (transfer: any) => {
    setSelectedTransfer(transfer)
    setTransferMode("edit")
    setTransferDrawerOpen(true)
  }

  const handleViewTransfer = (transfer: any) => {
    setSelectedTransfer(transfer)
    setViewTransferDrawerOpen(true)
  }

  // Table columns for Silo Transfers (BMT forms)
  const transferColumns = [
    {
      accessorKey: "tag",
      header: "Transfer Tag",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium text-sm text-gray-700">{row.original.tag || row.original.id.slice(0, 8)}</span>
        </div>
      )
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }: any) => (
        <Badge variant="outline" className="capitalize font-light text-[10px]">
          {row.original.product}
        </Badge>
      )
    },
    {
      accessorKey: "movement",
      header: "Movement",
      cell: ({ row }: any) => {
        const details = row.original.source_destination_details?.[0]
        if (!details) return "—"
        return (
          <div className="flex items-center space-x-3 text-sm font-light italic text-gray-500">
            <span className="text-gray-900 font-normal">{details.source_silo_details?.silo_name}</span>
            <ArrowRightLeft className="w-3 h-3" />
            <span className="text-gray-900 font-normal">{details.destination_silo_details?.silo_name}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "volume",
      header: "Volume",
      cell: ({ row }: any) => {
        const details = row.original.source_destination_details?.[0]
        const vol = details?.source_silo_details?.volume || details?.destination_silo_details?.volume
        return (
          <span className="text-blue-600 font-medium">
            {vol ? `${vol.toLocaleString()} L` : "—"}
          </span>
        )
      }
    },
    {
      accessorKey: "created_at",
      header: "Time",
      cell: ({ row }: any) => (
        <div className="flex items-center text-xs text-gray-400 font-light">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(row.original.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex space-x-2">
            <LoadingButton
              size="sm"
              onClick={() => handleViewTransfer(row.original)}
              className="bg-[#006BC4] text-white border-0 rounded-full h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              size="sm"
              onClick={() => handleEditTransfer(row.original)}
              className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      }
  ]

  const cipRecordColumns = [
    {
      accessorKey: "tag",
      header: "Form ID",
      cell: ({ row }: any) => (
        <span className="text-sm font-medium">
          {row.original.tag ?? row.original.id?.slice(0, 8) ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status ?? "Draft"
        const cls = status === "Completed" ? "bg-green-100 text-green-800"
          : status === "In Progress" ? "bg-blue-100 text-blue-800"
          : status === "Approved" ? "bg-purple-100 text-purple-800"
          : "bg-gray-100 text-gray-800"
        return <Badge className={`font-light text-xs ${cls}`}>{status}</Badge>
      },
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
        return <span className="text-sm font-light">{(machine || silo)?.name ?? "—"}</span>
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

  return (
    <DataCaptureDashboardLayout title="Silo Management" subtitle="Monitor and manage milk storage and transfers">
      <div className="space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-light text-foreground tracking-tight">Storage Facilities</h1>
            <p className="text-sm font-light text-muted-foreground flex items-center">
              <Package className="w-4 h-4 mr-2 text-blue-500" />
              Real-time monitoring and transfer control
            </p>
          </div>
          <LoadingButton
            onClick={handleAddTransfer}
            className="bg-[#006BC4] text-white px-6 py-2 rounded-full shadow-lg shadow-blue-100"
          >
            <Plus className="mr-2 h-4 w-4" />
            Initiate Transfer
          </LoadingButton>
        </div>

        <Tabs defaultValue="volumes" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-gray-100/50 p-1 rounded-xl border border-gray-100">
                <TabsTrigger value="volumes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Volume Levels
                </TabsTrigger>
                <TabsTrigger value="transfers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Recent Transfers
                </TabsTrigger>
                <TabsTrigger value="cips" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex items-center gap-2" onClick={handleCipTabOpen}>
                    <FlaskConical className="w-4 h-4" />
                    CIPs
                </TabsTrigger>
                <TabsTrigger value="composition" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex items-center gap-2" onClick={handleCompositionTabOpen}>
                    <Droplets className="w-4 h-4" />
                    Intake Composition
                </TabsTrigger>
                <TabsTrigger value="intake" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex items-center gap-2" onClick={handleIntakeTabOpen}>
                    <History className="w-4 h-4" />
                    Intake
                </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="volumes" className="mt-0">
            {/* Silo Gauges Grid */}
            <div className="space-y-4">
              {operationLoading.fetch ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {silos
                    .filter((silo) => !["Cream Tank 1", "Cream Tank 2", "Holding Tank 1", "Holding Tank 2", "Holding Tank 3"].includes(silo.name))
                    .map((silo) => (
                    <SiloGauge
                      key={silo.id}
                      name={silo.name}
                      volume={silo.milk_volume}
                      capacity={silo.capacity}
                      status={silo.status}
                      temperature={silo.temperature}
                      fatContent={silo.fat_content}
                      milkAgeHours={(silo as any).milk_age_hours != null ? Math.min((silo as any).milk_age_hours, 12) : null}
                      cipHoursAgo={cipHoursMap[silo.name] != null ? Math.min(cipHoursMap[silo.name], 12) : null}
                      onClick={() => handleSiloClick(silo)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transfers" className="mt-0">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-2">
                  {transferViewMode === "table" && (
                    <button
                      onClick={() => exportToExcel(
                        bmtTableColumns
                          .filter((c: any) => c.accessorKey)
                          .map((c: any) => ({ header: c.header as string, key: c.accessorKey as string, getValue: c.getValue })),
                        transferTableData,
                        "BMT-table"
                      )}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Excel
                    </button>
                  )}
                  <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-0.5">
                    <button
                      onClick={() => setTransferViewMode("records")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${transferViewMode === "records" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <LayoutList className="w-3.5 h-3.5" /> Records
                    </button>
                    <button
                      onClick={() => setTransferViewMode("table")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${transferViewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <Table2 className="w-3.5 h-3.5" /> Table View
                    </button>
                  </div>
                </div>
              </div>
              {transferViewMode === "records" ? (
                <DataTable
                  columns={transferColumns}
                  data={transfers}
                  showSearch={true}
                  searchPlaceholder="Filter transfers..."
                />
              ) : transferTableLoading ? (
                <div className="p-6 space-y-3">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <DataTable
                  columns={bmtTableColumns}
                  data={transferTableData}
                  searchKey="product"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="cips" className="mt-0">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-2">
                  {cipViewMode === "table" && (
                    <button
                      onClick={() => exportToExcel(
                        cipTableColumnsForSheet.map((c: any) => ({ header: c.header, key: c.accessorKey, getValue: c.getValue })),
                        cipTableData,
                        "CIP-table"
                      )}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Excel
                    </button>
                  )}
                  <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-0.5">
                    <button
                      onClick={() => setCipViewMode("records")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${cipViewMode === "records" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <LayoutList className="w-3.5 h-3.5" /> Records
                    </button>
                    <button
                      onClick={() => setCipViewMode("table")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${cipViewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <Table2 className="w-3.5 h-3.5" /> Table View
                    </button>
                  </div>
                </div>
              </div>
              {cipLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : cipViewMode === "records" ? (
                <DataTable
                  columns={cipRecordColumns}
                  data={cipRecords}
                  showSearch={true}
                  searchPlaceholder="Filter CIPs..."
                />
              ) : (
                <DataTable
                  columns={cipTableColumnsForSheet}
                  data={cipTableData}
                  searchKey="equipment"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="composition" className="mt-0">
            {compositionLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Composition table */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Intake Composition</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {compositionRows.length} entr{compositionRows.length === 1 ? "y" : "ies"} across all silos
                      </p>
                    </div>
                    {compositionRows.length > 0 && (
                      <button
                        onClick={() => exportToExcel(
                          [
                            { header: "Silo", key: "silo_name" },
                            { header: "Supplier", key: "supplier" },
                            { header: "Tank", key: "tank" },
                            { header: "Volume (L)", key: "volume", getValue: (r: any) => r.volume != null ? r.volume.toLocaleString() : "—" },
                            { header: "Voucher", key: "voucher" },
                            { header: "Collection Date", key: "date" },
                          ],
                          compositionRows,
                          "silo-intake-composition"
                        )}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Export Excel
                      </button>
                    )}
                  </div>
                  {compositionRows.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-gray-400">No composition data available</div>
                  ) : (
                    <DataTable
                      columns={[
                        {
                          accessorKey: "silo_name",
                          header: "Silo",
                          cell: ({ row }: any) => (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                              {row.original.silo_name}
                            </span>
                          ),
                        },
                        {
                          accessorKey: "supplier",
                          header: "Supplier",
                          cell: ({ row }: any) => <span className="text-sm font-medium text-gray-900">{row.original.supplier}</span>,
                        },
                        {
                          accessorKey: "tank",
                          header: "Tank",
                          cell: ({ row }: any) => <span className="text-sm font-light text-gray-600">{row.original.tank}</span>,
                        },
                        {
                          accessorKey: "volume",
                          header: "Volume (L)",
                          cell: ({ row }: any) => (
                            <span className="text-sm font-medium text-blue-600">
                              {row.original.volume != null ? row.original.volume.toLocaleString() : "—"}
                            </span>
                          ),
                        },
                        {
                          accessorKey: "voucher",
                          header: "Voucher",
                          cell: ({ row }: any) => {
                            const tag = row.original.voucher
                            if (!tag || tag === "—") return <span className="text-sm font-light text-gray-400">—</span>
                            const isLoading = loadingVoucherTag === tag
                            return (
                              <button
                                onClick={() => handleVoucherClick(tag)}
                                disabled={isLoading}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors disabled:opacity-50"
                              >
                                {isLoading ? "Loading…" : tag}
                              </button>
                            )
                          },
                        },
                        {
                          accessorKey: "date",
                          header: "Collection Date",
                          cell: ({ row }: any) => <span className="text-sm font-light text-gray-500">{row.original.date}</span>,
                        },
                      ]}
                      data={compositionRows}
                      showSearch={true}
                      searchPlaceholder="Filter by silo, supplier, voucher..."
                    />
                  )}
                </div>

                {/* Intake log */}
                {intakeLogs.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-900">Intake Log</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {intakeLogs.map(({ siloName, form }) => {
                        const operatorName = typeof form.operator === "object"
                          ? `${form.operator.first_name} ${form.operator.last_name}`
                          : form.operator ?? "—"
                        const totalVol = form.details.reduce((sum, d) => sum + (d.flow_meter_end_reading ?? d.flow_meter_start_reading ?? 0), 0)
                        return (
                          <div key={form.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs text-gray-400 font-light">Silo</p>
                                <p className="text-sm font-semibold text-gray-900">{siloName}</p>
                              </div>
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {form.tag ?? form.id.slice(0, 8)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-400 font-light">Truck</p>
                                <p className="font-medium text-gray-900">{form.truck ?? "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 font-light">Operator</p>
                                <p className="font-medium text-gray-900">{operatorName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 font-light">Date</p>
                                <p className="font-medium text-gray-900">
                                  {form.created_at ? new Date(form.created_at).toLocaleDateString() : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 font-light">Compartments</p>
                                <p className="font-medium text-gray-900">{form.details.length}</p>
                              </div>
                            </div>
                            {form.details.length > 0 && (
                              <div className="border-t border-gray-50 pt-3 space-y-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Compartment Details</p>
                                {form.details.map((d, i) => (
                                  <div key={d.id ?? i} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                                    <span className="text-gray-500">Compartment {d.truck_compartment_number}</span>
                                    <span className="text-gray-700 font-light">{d.silo_name}</span>
                                    <span className="text-blue-600 font-medium">
                                      {d.flow_meter_end_reading != null
                                        ? `${d.flow_meter_end_reading.toLocaleString()} L`
                                        : d.flow_meter_start_reading != null
                                        ? `${d.flow_meter_start_reading.toLocaleString()} L`
                                        : "—"}
                                    </span>
                                    <Badge className={`text-[10px] font-light ${
                                      d.status === "Completed" ? "bg-green-100 text-green-800"
                                      : d.status === "In Progress" ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-700"
                                    }`}>
                                      {d.status ?? "Pending"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="intake" className="mt-0">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Raw Milk Intake</p>
                  <p className="text-xs text-gray-400 font-light mt-0.5">{intakeTableData.length} records</p>
                </div>
                {intakeTableData.length > 0 && (
                  <button
                    onClick={() => exportToExcel(
                      [
                        { header: "Date", key: "intake_date", getValue: (r: any) => r.intake_date ?? "—" },
                        { header: "Operator", key: "operator", getValue: (r: any) => r.operator ?? "—" },
                        { header: "Truck", key: "truck", getValue: (r: any) => r.truck ?? "—" },
                        { header: "Driver", key: "driver", getValue: (r: any) => r.driver ?? "—" },
                        { header: "Silo", key: "silo_name", getValue: (r: any) => r.silo_name ?? "—" },
                        { header: "FM Start", key: "flow_meter_start_reading", getValue: (r: any) => r.flow_meter_start_reading?.toLocaleString() ?? "—" },
                        { header: "FM End", key: "flow_meter_end_reading", getValue: (r: any) => r.flow_meter_end_reading?.toLocaleString() ?? "—" },
                        { header: "Quantity (L)", key: "quantity", getValue: (r: any) => r.quantity != null ? Math.round(r.quantity).toLocaleString() : "—" },
                      ],
                      intakeTableData,
                      "raw-milk-intake-table"
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Excel
                  </button>
                )}
              </div>
              {intakeTableLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      accessorKey: "intake_date",
                      header: "Date",
                      cell: ({ row }: any) => (
                        <span className="text-sm font-light text-gray-700">{row.original.intake_date ?? "—"}</span>
                      ),
                    },
                    {
                      accessorKey: "operator",
                      header: "Operator",
                      cell: ({ row }: any) => (
                        <span className="text-sm font-light">{row.original.operator ?? "—"}</span>
                      ),
                    },
                    {
                      accessorKey: "truck",
                      header: "Truck",
                      cell: ({ row }: any) => (
                        <Badge variant="outline" className="font-light text-[10px]">
                          {row.original.truck ?? "—"}
                        </Badge>
                      ),
                    },
                    {
                      accessorKey: "driver",
                      header: "Driver",
                      cell: ({ row }: any) => (
                        <span className="text-sm font-light text-gray-600">{row.original.driver ?? "—"}</span>
                      ),
                    },
                    {
                      accessorKey: "silo_name",
                      header: "Silo",
                      cell: ({ row }: any) => (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                          {row.original.silo_name ?? "—"}
                        </span>
                      ),
                    },
                    {
                      accessorKey: "flow_meter_start_reading",
                      header: "FM Start",
                      cell: ({ row }: any) => (
                        <span className="text-sm font-light text-gray-500">
                          {row.original.flow_meter_start_reading?.toLocaleString() ?? "—"}
                        </span>
                      ),
                    },
                    {
                      accessorKey: "flow_meter_end_reading",
                      header: "FM End",
                      cell: ({ row }: any) => (
                        <span className="text-sm font-light text-gray-500">
                          {row.original.flow_meter_end_reading?.toLocaleString() ?? "—"}
                        </span>
                      ),
                    },
                    {
                      accessorKey: "quantity",
                      header: "Quantity (L)",
                      cell: ({ row }: any) => {
                        const q = row.original.quantity
                        return (
                          <span className="text-sm font-medium text-blue-600">
                            {q != null ? Math.round(q).toLocaleString() : "—"}
                          </span>
                        )
                      },
                    },
                  ]}
                  data={intakeTableData}
                  showSearch={true}
                  searchPlaceholder="Filter by operator, truck, silo..."
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <SiloDetailsDrawer
        open={detailsDrawerOpen}
        onOpenChange={setDetailsDrawerOpen}
        silo={selectedSilo}
        onEdit={handleEditSilo}
        onTransfer={(silo) => {
            setDetailsDrawerOpen(false)
            handleAddTransfer(silo)
        }}
        onCipCreated={fetchCipForGauges}
      />

      <SiloFormDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        silo={selectedSilo}
        mode="edit"
      />

      <BMTControlFormDrawer
        open={transferDrawerOpen}
        onOpenChange={setTransferDrawerOpen}
        form={selectedTransfer}
        mode={transferMode}
        sourceSilo={sourceSilo}
        onSuccess={refreshTransferTableData}
      />

      <BMTControlFormViewDrawer
        open={viewTransferDrawerOpen}
        onClose={() => setViewTransferDrawerOpen(false)}
        form={selectedTransfer}
        onEdit={() => {
            setViewTransferDrawerOpen(false)
            handleEditTransfer(selectedTransfer)
        }}
      />

      <CollectionVoucherViewDrawer
        open={voucherDrawerOpen}
        onOpenChange={setVoucherDrawerOpen}
        collectionVoucher={selectedVoucher}
      />
    </DataCaptureDashboardLayout>
  )
}
