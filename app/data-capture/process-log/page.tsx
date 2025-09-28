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
import { Eye, Edit, Trash2, Beaker, FileText, TrendingUp, User, Clock, Thermometer, Gauge } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchSteriMilkProcessLogs, deleteSteriMilkProcessLog, clearError } from "@/lib/store/slices/steriMilkProcessLogSlice"
import { TableFilters } from "@/lib/types"
import { toast } from "sonner"
import type { SteriMilkProcessLog } from "@/lib/api/steri-milk-process-log"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { SteriMilkProcessLogDrawer } from "@/components/forms/steri-milk-process-log-drawer"
import { SteriMilkProcessLogViewDrawer } from "@/components/forms/steri-milk-process-log-view-drawer"
import ContentSkeleton from "@/components/ui/content-skeleton"

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

  const latest = Array.isArray(logs) && logs.length > 0 ? logs[0] : null

  const columns = useMemo(() => [
    {
      accessorKey: "log",
      header: "Log",
      cell: ({ row }: any) => {
        const log = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Beaker className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">#{log.id.slice(0, 8)}</span>
                <Badge className={`${log.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} font-light`}>
                  {log.approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(log.created_at).toLocaleDateString()}
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
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {log.batch_id_fkey ? `Batch #${log.batch_id_fkey.batch_number}` : "No batch"}
            </p>
            <p className="text-xs text-gray-500">
              {log.batch_id_fkey ? `Created: ${new Date(log.batch_id_fkey.created_at).toLocaleDateString()}` : "Not created"}
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
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{log.filmatic_form_id ? `Form #${log.filmatic_form_id.slice(0, 8)}` : "Not linked"}</p>
            <p className="text-xs text-gray-500">Required</p>
          </div>
        )
      }
    },
    {
      accessorKey: "approver",
      header: "Approver",
      cell: ({ row }: any) => {
        const log = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{log.approver_id ? `Approver #${log.approver_id.slice(0, 8)}` : "Not assigned"}</p>
            <p className="text-xs text-gray-500">Supervisor</p>
          </div>
        )
      }
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const log = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{new Date(log.created_at).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">{log.updated_at ? `Updated: ${new Date(log.updated_at).toLocaleDateString()}` : 'Never updated'}</p>
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
              variant="outline"
              size="sm"
              onClick={() => handleView(log)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => handleEdit(log)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(log)}
              loading={loading.delete}
              disabled={loading.delete}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      }
    }
  ], [loading.delete])

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
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            Add Process Log
          </LoadingButton>
        </div>

        {loading.fetch ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latest ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Steri Milk Process Log</span>
                  <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-light">Latest</Badge>
                </div>
                <LoadingButton 
                  variant="outline" 
                  onClick={() => handleView(latest)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
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
                    <p className="text-sm font-light text-gray-600">Log ID</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-light">#{latest.id.slice(0, 8)}</p>
                    <CopyButton text={latest.id} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Beaker className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Created</p>
                  </div>
                  <p className="text-lg font-light">{new Date(latest.created_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Updated</p>
                  </div>
                  <p className="text-lg font-light">{latest.updated_at ? new Date(latest.updated_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'Never'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-purple-500" />
                    <p className="text-sm font-light text-gray-600">Approver</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">{latest.approver_id ? `Approver #${latest.approver_id.slice(0, 8)}` : '—'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Filmatic Form</p>
                  </div>
                  <p className="text-lg font-light text-green-600">{latest.filmatic_form_id ? `Form #${latest.filmatic_form_id.slice(0, 8)}` : 'Not linked'}</p>
                </div>
              </div>

              {latest.batch_id_fkey && (
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
                        <span className="text-xs font-light text-gray-600">Batch Number</span>
                        <span className="text-xs font-light">{latest.batch_id_fkey.batch_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Created</span>
                        <span className="text-xs font-light">{new Date(latest.batch_id_fkey.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Process Status</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Filling Start</span>
                        <span className="text-xs font-light">{latest.batch_id_fkey.filling_start ? 'Completed' : 'Pending'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Sterilization</span>
                        <span className="text-xs font-light">{latest.batch_id_fkey.sterilization_start ? 'Completed' : 'Pending'}</span>
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