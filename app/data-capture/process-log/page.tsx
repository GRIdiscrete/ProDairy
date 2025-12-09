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
import { Eye, Edit, Trash2, Beaker, FileText, TrendingUp, User, Clock, Thermometer, Gauge, Workflow } from "lucide-react"
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
      dispatch(fetchSteriMilkProcessLogs())
    }
  }, [dispatch, isInitialized])

  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchSteriMilkProcessLogs())
    }
  }, [dispatch, tableFilters, isInitialized])

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
                  displayId={log?.tag}
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
        // map single batch object (batch_id) to array for UI logic compatibility
        const batches = log.batch_id ? [log.batch_id] : []
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
                displayId={form?.tag ?? undefined}
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
    <DataCaptureDashboardLayout title="Process Log" subtitle="Steri milk process control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Process Log</h1>
            <p className="text-sm font-light text-muted-foreground">Manage steri milk process logs</p>
          </div>
          <LoadingButton
            onClick={handleAdd}
            className="px-6 py-2 font-light"
          >
            Add Process Log
          </LoadingButton>
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
                  <span>Current Steri Milk Process Log</span>
                  <Badge className=" from-blue-100 to-cyan-100 text-white font-light">Latest</Badge>
                </div>
                <LoadingButton
                  
                  onClick={() => handleView(latest)}
                  className=" from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
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
                      displayId={latest?.tag}
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
              </div>

              {/* Batch cards from batch_id */}
              {latest.batch_id && (
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
                        <span className="text-xs font-light">#{latest.batch_id.batch_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4  from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Process Status</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Filling Start</span>
                        <span className="text-xs font-light">{latest.batch_id.filling_start ? 'Completed' : 'Pending'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Sterilization</span>
                        <span className="text-xs font-light">{latest.batch_id.sterilization_start ? 'Completed' : 'Pending'}</span>
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
              <div className="text-lg font-light">Steri Milk Process Logs</div>
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
              ) : (
                <DataTable columns={columns} data={logs} showSearch={false} />
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
          title="Delete Process Log"
          description={`Are you sure you want to delete this process log? This action cannot be undone.`}
          onConfirm={confirmDelete}
          loading={loading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}