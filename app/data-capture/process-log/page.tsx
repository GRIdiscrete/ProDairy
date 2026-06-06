"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { Eye, Edit, Trash2, Beaker, FileText, TrendingUp, User, Clock, Thermometer, Gauge, Workflow, LayoutList, Table2, Plus, Download } from "lucide-react"
import { exportToExcel } from "@/lib/utils/export-excel"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchSteriMilkProcessLogs, deleteSteriMilkProcessLog, clearError } from "@/lib/store/slices/steriMilkProcessLogSlice"
import { TableFilters } from "@/lib/types"
import { toast } from "sonner"
import type { SteriMilkProcessLog } from "@/lib/api/steri-milk-process-log"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { SteriMilkProcessLogDrawer } from "@/components/forms/steri-milk-process-log-drawer"
import { SteriMilkProcessLogViewDrawer } from "@/components/forms/steri-milk-process-log-view-drawer"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { rolesApi } from "@/lib/api/roles"
import { filmaticLinesForm1Api } from "@/lib/api/filmatic-lines-form-1"
import { useRouter, useSearchParams } from "next/navigation"

export default function ProcessLogPage() {
  const dispatch = useAppDispatch()
  const { logs, loading, error, isInitialized } = useAppSelector((state) => state.steriMilkProcessLog)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchSteriMilkProcessLogs({}))
    }
  }, [dispatch, isInitialized])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [selectedLog, setSelectedLog] = useState<SteriMilkProcessLog | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  const [rolesMap, setRolesMap] = useState<Record<string, string>>({})
  const [formMap, setFormMap] = useState<Record<string, { tag?: string }>>({})

  // load roles once
  useEffect(() => {
    let mounted = true
    const loadRoles = async () => {
      try {
        const res = await rolesApi.getRoles()
        if (!mounted) return
        const map: Record<string, string> = {}
          ; (res.data || []).forEach((r: any) => {
            map[r.id] = r.role_name
          })
        setRolesMap(map)
      } catch (err) {
        // ignore, fallbacks will display ids
      }
    }
    loadRoles()
    return () => { mounted = false }
  }, [])

  // Load all Filmatic Lines Form 1 once and cache tags (use filmatic list state)
  useEffect(() => {
    let mounted = true
    const loadAllForms = async () => {
      try {
        const list = await filmaticLinesForm1Api.getForms()
        if (!mounted) return
        const map: Record<string, { tag?: string }> = {}
          ; (list || []).forEach((f: any) => {
            map[f.id] = { tag: f.tag || f.name || "" }
          })
        // prefer newly-loaded form tags but keep any existing entries
        setFormMap(prev => ({ ...prev, ...map }))
      } catch (err) {
        // ignore - fallback will show ids
      }
    }
    loadAllForms()
    return () => { mounted = false }
  }, [])

  // Frontend Filtering Logic
  const filteredLogs = useMemo(() => {
    if (!logs) return []

    return logs.filter((log: SteriMilkProcessLog) => {
      // 1. Search filter (Global search)
      if (tableFilters.search) {
        const searchLower = tableFilters.search.toLowerCase()
        const tag = String(log.tag || "").toLowerCase()
        const approverName = (log.approver_id ? String(rolesMap[log.approver_id] || "") : "").toLowerCase()
        const filmaticTag = (log.filmatic_form_id ? String(formMap[log.filmatic_form_id]?.tag || "") : "").toLowerCase()

        if (!tag.includes(searchLower) &&
          !approverName.includes(searchLower) &&
          !filmaticTag.includes(searchLower)) return false
      }

      // 2. Specific filter fields
      if (tableFilters.created_at) {
        const filterDate = new Date(tableFilters.created_at)
        const logDate = new Date(log.created_at!)
        if (filterDate.toDateString() !== logDate.toDateString()) return false
      }

      if (tableFilters.approver_id) {
        const approverLower = tableFilters.approver_id.toLowerCase()
        const approverName = (log.approver_id ? (rolesMap[log.approver_id] || "") : "").toLowerCase()
        if (!approverName.includes(approverLower)) return false
      }

      if (tableFilters.filmatic_form_id) {
        const filmaticLower = tableFilters.filmatic_form_id.toLowerCase()
        const filmaticTag = (log.filmatic_form_id ? (formMap[log.filmatic_form_id]?.tag || "") : "").toLowerCase()
        if (!filmaticTag.includes(filmaticLower)) return false
      }

      // 3. Date Range filter
      if (tableFilters.dateRange) {
        const logDate = new Date(log.created_at!)
        if (tableFilters.dateRange.from) {
          const from = new Date(tableFilters.dateRange.from)
          from.setHours(0, 0, 0, 0)
          if (logDate < from) return false
        }
        if (tableFilters.dateRange.to) {
          const to = new Date(tableFilters.dateRange.to)
          to.setHours(23, 59, 59, 999)
          if (logDate > to) return false
        }
      }

      return true
    })
  }, [logs, tableFilters, rolesMap, formMap])

  const filterFields = useMemo(() => [
    { key: "created_at", label: "Date", type: "date" as const, placeholder: "Filter by date" },
    { key: "approver_id", label: "Approver", type: "text" as const, placeholder: "Filter by approver" },
    { key: "filmatic_form_id", label: "Filmatic Form", type: "text" as const, placeholder: "Filter by form" },
  ], [])

  const handleAdd = () => {
    setSelectedLog(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEdit = (log: SteriMilkProcessLog) => {
    setSelectedLog(log)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleView = (log: SteriMilkProcessLog) => {
    setSelectedLog(log)
    setViewDrawerOpen(true)
  }

  const handleDelete = (log: SteriMilkProcessLog) => {
    setSelectedLog(log)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedLog) return
    try {
      await dispatch(deleteSteriMilkProcessLog(selectedLog.id)).unwrap()
      toast.success("Process log deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedLog(null)
    } catch (e: any) {
      toast.error(e || "Failed to delete process log")
    }
  }

  const [viewMode, setViewMode] = useState<"management" | "sheet">("management")

  const sheetRows = useMemo(() => {
    const rows: any[] = []
    filteredLogs.forEach(log => {
      const b = log.batch
      const label = b?.batch_number ?? '—'
      const fmtTime = (v: string | null | undefined) => v ? v.replace(/\+.*$/, '').substring(0, 5) : '—'
      const fmtNum = (v: number | undefined | null) => v != null && v !== 0 ? String(v) : '—'

      rows.push({ rowType: "time",        batchLabel: label, tag: log.tag, date: log.created_at, autoclave: log.autoclave?.name, filling_start: fmtTime(b?.filling_start?.time), autoclave_start: fmtTime(b?.autoclave_start?.time), heating_start: fmtTime(b?.heating_start?.time), heating_finish: fmtTime(b?.heating_finish?.time), steri_start: fmtTime(b?.sterilization_start?.time), steri_after5: fmtTime(b?.sterilization_after_5?.time), steri_finish: fmtTime(b?.sterilization_finish?.time), pre_cool_start: fmtTime(b?.pre_cooling_start?.time), pre_cool_finish: fmtTime(b?.pre_cooling_finish?.time), cool1_start: fmtTime(b?.cooling_1_start?.time), cool1_finish: fmtTime(b?.cooling_1_finish?.time), cool2_start: fmtTime(b?.cooling_2_start?.time), cool2_finish: fmtTime(b?.cooling_2_finish?.time) })
      rows.push({ rowType: "temperature", batchLabel: label, tag: log.tag, filling_start: fmtNum(b?.filling_start?.temperature), autoclave_start: fmtNum(b?.autoclave_start?.temperature), heating_start: fmtNum(b?.heating_start?.temperature), heating_finish: fmtNum(b?.heating_finish?.temperature), steri_start: fmtNum(b?.sterilization_start?.temperature), steri_after5: fmtNum(b?.sterilization_after_5?.temperature), steri_finish: fmtNum(b?.sterilization_finish?.temperature), pre_cool_start: fmtNum(b?.pre_cooling_start?.temperature), pre_cool_finish: fmtNum(b?.pre_cooling_finish?.temperature), cool1_start: fmtNum(b?.cooling_1_start?.temperature), cool1_finish: fmtNum(b?.cooling_1_finish?.temperature), cool2_start: fmtNum(b?.cooling_2_start?.temperature), cool2_finish: fmtNum(b?.cooling_2_finish?.temperature) })
      rows.push({ rowType: "pressure",    batchLabel: label, tag: log.tag, filling_start: fmtNum(b?.filling_start?.pressure), autoclave_start: fmtNum(b?.autoclave_start?.pressure), heating_start: fmtNum(b?.heating_start?.pressure), heating_finish: fmtNum(b?.heating_finish?.pressure), steri_start: fmtNum(b?.sterilization_start?.pressure), steri_after5: fmtNum(b?.sterilization_after_5?.pressure), steri_finish: fmtNum(b?.sterilization_finish?.pressure), pre_cool_start: fmtNum(b?.pre_cooling_start?.pressure), pre_cool_finish: fmtNum(b?.pre_cooling_finish?.pressure), cool1_start: fmtNum(b?.cooling_1_start?.pressure), cool1_finish: fmtNum(b?.cooling_1_finish?.pressure), cool2_start: fmtNum(b?.cooling_2_start?.pressure), cool2_finish: fmtNum(b?.cooling_2_finish?.pressure) })
    })
    return rows
  }, [filteredLogs])

  const columns = useMemo(() => [
    {
      accessorKey: "log",
      header: "Log",
      cell: ({ row }: any) => {
        const log = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Workflow className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <FormIdCopy
                  displayId={log?.tag!}
                  actualId={log?.id}
                  size="sm"
                />
                <Badge className={`${log.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} font-light`}>
                  {log.approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "batch_info",
      header: "Batch",
      cell: ({ row }: any) => {
        const log = row.original
        // map single batch object to array for UI logic compatibility
        const batches = log.batch ? [log.batch] : []
        const totalBatches = batches.length
        const completedBatches = batches.filter((batch: any) =>
          batch.filling_start && batch.sterilization_finish
        ).length

        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {totalBatches > 0 ? `${totalBatches} batch${totalBatches > 1 ? 'es' : ''}` : "No batches"}
            </p>
            <p className="text-xs text-gray-500">
              {totalBatches > 0 ? `${completedBatches} completed` : "Not created"}
            </p>
          </div>
        )
      }
    },
    {
      accessorKey: "filmatic_form",
      header: "Filmatic Form",
      cell: ({ row }: any) => {
        const log = row.original
        const form = log.filmatic_form_id ? formMap[log.filmatic_form_id] : null
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              <FormIdCopy
                displayId={form?.tag! ?? undefined}
                actualId={log?.filmatic_form_id}
                size="sm"
              />
            </p>
          </div>
        )
      }
    },
    {
      accessorKey: "approver",
      header: "Approver",
      cell: ({ row }: any) => {
        const log = row.original
        const roleName = log.approver_id ? rolesMap[log.approver_id] : undefined
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{roleName ? roleName : (log.approver_id ? `Approver #${String(log.approver_id).slice(0, 8)}` : "Not assigned")}</p>
            <p className="text-xs text-gray-500">Supervisor</p>
          </div>
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const log = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton

              size="sm"
              onClick={() => handleView(log)}
              className="bg-[#006BC4] text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton

              size="sm"
              onClick={() => handleEdit(log)}
              className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              className=" text-white rounded-full"
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(log)}
              loading={loading.delete}
              disabled={loading.delete}
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      }
    }
  ], [loading.delete, rolesMap, formMap])

  const latest = Array.isArray(logs) && logs.length > 0 ? logs[0] : null

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // --- Helper: open view drawer if form_id query param is present ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isInitialized || !logs || logs.length === 0) return;
    const formId = searchParams?.get("form_id");
    if (formId) {
      const foundLog = logs.find((log: any) => String(log.id) === String(formId));
      if (foundLog) {
        setSelectedLog(foundLog);
        setViewDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, logs]);

  return (
    <DataCaptureDashboardLayout title="Autoclave" subtitle="Steri milk process control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Autoclave</h1>
            <p className="text-sm font-light text-muted-foreground">Manage steri milk process logs</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-0.5">
              <button
                onClick={() => setViewMode("management")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "management" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <LayoutList className="w-3.5 h-3.5" /> Records
              </button>
              <button
                onClick={() => setViewMode("sheet")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "sheet" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Table2 className="w-3.5 h-3.5" /> Sheet View
              </button>
            </div>
            {viewMode === "sheet" && (
              <LoadingButton
                onClick={() => exportToExcel(
                  ["batchLabel","rowType","autoclave","filling_start","autoclave_start","heating_start","heating_finish","steri_start","steri_after5","steri_finish","pre_cool_start","pre_cool_finish","cool1_start","cool1_finish","cool2_start","cool2_finish"]
                    .map(k => ({ header: k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()), key: k, getValue: (row: any) => row[k] ?? "—" })),
                  sheetRows,
                  "process-log"
                )}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-full px-4 py-2 font-light"
              >
                <Download className="mr-2 h-4 w-4" /> Export Excel
              </LoadingButton>
            )}
            <LoadingButton
              onClick={handleAdd}
              className="bg-[#006BC4] text-white rounded-full px-6 py-2 font-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Autoclave
            </LoadingButton>
          </div>
        </div>

        {loading.fetch ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latest ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4]">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Workflow className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>Current Steri Milk Autoclave</span>
                  <Badge className=" from-blue-100 to-cyan-100 text-white font-light">Latest</Badge>
                </div>
                <LoadingButton
                  onClick={() => handleView(latest)}
                  className="bg-[#006BC4] text-white rounded-full px-4 py-2 font-light text-sm"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </LoadingButton>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light">Log ID</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FormIdCopy
                      displayId={latest?.tag!}
                      actualId={latest?.id}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Beaker className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light">Created</p>
                  </div>
                  <p className="text-lg font-light">{latest.created_at ? new Date(latest.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light">Updated</p>
                  </div>
                  <p className="text-lg font-light">{latest.updated_at ? new Date(latest.updated_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Never'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light">Approver</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">
                    {latest?.approver_id ? (rolesMap[latest.approver_id] || `Approver #${String(latest.approver_id).slice(0, 8)}`) : '—'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light">Filmatic Form</p>
                  </div>
                  <p className="text-lg font-light text-green-600">
                    {latest?.filmatic_form_id ? (formMap[latest.filmatic_form_id]?.tag ? `Form ${formMap[latest.filmatic_form_id].tag}` : `Form #${String(latest.filmatic_form_id).slice(0, 8)}`) : 'Not linked'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Workflow className="h-4 w-4 text-purple-500" />
                    <p className="text-sm font-light">Autoclave</p>
                  </div>
                  <p className="text-lg font-light text-purple-600">
                    {latest?.autoclave?.name || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Batch cards from batch */}
              {latest.batch && (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Beaker className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Batch Information</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Total Batches</span>
                        <span className="text-xs font-light">1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Latest Batch</span>
                        <span className="text-xs font-light">#{latest.batch.batch_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Process Status</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Filling Start</span>
                        <span className="text-xs font-light">{latest.batch.filling_start ? 'Completed' : 'Pending'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Sterilization</span>
                        <span className="text-xs font-light">{latest.batch.sterilization_start ? 'Completed' : 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {!loading.fetch && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Steri Milk Autoclaves</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(s) => setTableFilters((p) => ({ ...p, search: s }))}
                searchPlaceholder="Search process logs..."
                filterFields={filterFields}
              />
              {loading.fetch ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : viewMode === "management" ? (
                <DataTable
                  columns={columns}
                  data={filteredLogs}
                  showSearch={false}
                  showExport={true}
                  exportFilename="process-log-data"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">Batch</th>
                        <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">Metric</th>
                        <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">Autoclave</th>
                        <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">Fill Start</th>
                        <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">AC Start</th>
                        <th colSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase text-center text-gray-500 border-b border-r border-gray-200">Heating</th>
                        <th colSpan={3} className="px-2 py-2 text-[10px] font-semibold uppercase text-center text-gray-500 border-b border-r border-gray-200">Sterilisation</th>
                        <th colSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase text-center text-gray-500 border-b border-r border-gray-200">Pre-Cooling</th>
                        <th colSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase text-center text-gray-500 border-b border-r border-gray-200">Cooling 1</th>
                        <th colSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase text-center text-gray-500 border-b border-r border-gray-200">Cooling 2</th>
                      </tr>
                      <tr className="bg-gray-50">
                        {["Start","Finish","Start","After 5","Finish","Start","Finish","Start","Finish","Start","Finish"].map((h, i) => (
                          <th key={i} className="px-2 py-1.5 border-b border-r border-gray-200 text-gray-400 text-[10px] whitespace-nowrap text-center">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetRows.length === 0 ? (
                        <tr><td colSpan={16} className="px-4 py-8 text-center text-gray-400 italic">No data</td></tr>
                      ) : sheetRows.map((row, i) => (
                        <tr key={i} className={
                          row.rowType === "temperature" ? "bg-orange-50/50" :
                          row.rowType === "pressure" ? "bg-blue-50/50" :
                          "bg-white hover:bg-gray-50/50"
                        }>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 font-medium whitespace-nowrap">
                            {row.rowType === "time" ? `#${row.batchLabel}` : ""}
                          </td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap">
                            {row.rowType === "time" ? <span className="text-gray-400 text-[10px]">Time</span> :
                             row.rowType === "temperature" ? <span className="text-orange-600 font-medium">Temp °C</span> :
                             <span className="text-blue-600 font-medium">Press Bar</span>}
                          </td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-gray-500 text-[10px]">
                            {row.rowType === "time" ? row.autoclave : ""}
                          </td>
                          {["filling_start","autoclave_start","heating_start","heating_finish","steri_start","steri_after5","steri_finish","pre_cool_start","pre_cool_finish","cool1_start","cool1_finish","cool2_start","cool2_finish"].map(key => (
                            <td key={key} className="px-2 py-1.5 border-b border-r border-gray-100 text-center tabular-nums whitespace-nowrap">{(row as any)[key]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <SteriMilkProcessLogDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          log={selectedLog}
          mode={formMode}
          processId="default-process-id"
        />
        <SteriMilkProcessLogViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          log={selectedLog}
          formMap={formMap}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEdit(selectedLog!)
          }}
        />
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Autoclave"
          description={`Are you sure you want to delete this process log? This action cannot be undone.`}
          onConfirm={confirmDelete}
          loading={loading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}