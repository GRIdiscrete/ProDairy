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
import { Eye, Edit, Trash2, Beaker, FileText, TrendingUp, User } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchSterilisedMilkProcesses, deleteSterilisedMilkProcessAction, clearError } from "@/lib/store/slices/sterilisedMilkProcessSlice"
import { TableFilters } from "@/lib/types"
import { toast } from "sonner"
import type { SterilisedMilkProcess } from "@/lib/api/data-capture-forms"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { SterilisedMilkProcessDrawer } from "@/components/forms/sterilised-milk-process-drawer"
import { SterilisedMilkProcessViewDrawer } from "@/components/forms/sterilised-milk-process-view-drawer"
import ContentSkeleton from "@/components/ui/content-skeleton"

export default function ProcessLogPage() {
  const dispatch = useAppDispatch()
  const { processes, loading, error, operationLoading, isInitialized } = useAppSelector((s) => (s as any).sterilisedMilkProcesses)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchSterilisedMilkProcesses())
    }
  }, [dispatch, isInitialized])

  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchSterilisedMilkProcesses())
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

  const [selectedProcess, setSelectedProcess] = useState<SterilisedMilkProcess | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  const filterFields = useMemo(() => [
    { key: "created_at", label: "Date", type: "date" as const, placeholder: "Filter by date" },
    { key: "approved_by", label: "Approved By", type: "text" as const, placeholder: "Filter by approver" },
  ], [])

  const handleAdd = () => { setSelectedProcess(null); setFormMode("create"); setFormDrawerOpen(true) }
  const handleEdit = (p: SterilisedMilkProcess) => { setSelectedProcess(p); setFormMode("edit"); setFormDrawerOpen(true) }
  const handleView = (p: SterilisedMilkProcess) => { setSelectedProcess(p); setViewDrawerOpen(true) }
  const handleDelete = (p: SterilisedMilkProcess) => { setSelectedProcess(p); setDeleteDialogOpen(true) }

  const confirmDelete = async () => {
    if (!selectedProcess) return
    try {
      await dispatch(deleteSterilisedMilkProcessAction(selectedProcess.id)).unwrap()
      toast.success("Process deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedProcess(null)
    } catch (e: any) {
      toast.error(e || "Failed to delete process")
    }
  }

  const latest = Array.isArray(processes) && processes.length > 0 ? processes[0] : null

  const columns = useMemo(() => [
    {
      accessorKey: "process",
      header: "Process",
      cell: ({ row }: any) => {
        const p = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Beaker className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">#{typeof p.id === 'string' ? p.id.slice(0, 8) : 'N/A'}</span>
                <Badge className="bg-blue-100 text-blue-800 font-light">Process</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "operator",
      header: "Operator",
      cell: ({ row }: any) => {
        const p = row.original
        const op = p.sterilised_milk_process_operator_id_fkey
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{op ? `${op.first_name} ${op.last_name}` : "N/A"}</p>
            <p className="text-xs text-gray-500">{op?.department || "-"}</p>
          </div>
        )
      }
    },
    {
      accessorKey: "supervisor",
      header: "Supervisor",
      cell: ({ row }: any) => {
        const p = row.original
        const sv = p.sterilised_milk_process_supervisor_id_fkey
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{sv ? `${sv.first_name} ${sv.last_name}` : "N/A"}</p>
            <p className="text-xs text-gray-500">{sv?.department || "-"}</p>
          </div>
        )
      }
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const p = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{new Date(p.created_at).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">{p.updated_at ? `Updated: ${new Date(p.updated_at).toLocaleDateString()}` : 'Never updated'}</p>
          </div>
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const p = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => handleView(p)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => handleEdit(p)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(p)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      }
    }
  ], [operationLoading.delete])

  return (
    <DataCaptureDashboardLayout title="Process Log" subtitle="Sterilised milk process control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Process Log</h1>
            <p className="text-sm font-light text-muted-foreground">Manage sterilised milk process logs</p>
          </div>
          <LoadingButton onClick={handleAdd} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light">
            Add Process
          </LoadingButton>
        </div>

        {operationLoading.fetch ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latest ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Sterilised Milk Process</span>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Process ID</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-light">#{typeof latest.id === 'string' ? latest.id.slice(0, 8) : 'N/A'}</p>
                    <CopyButton text={typeof latest.id === 'string' ? latest.id : ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Beaker className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Created</p>
                  </div>
                  <p className="text-lg font-light">{latest.created_at ? new Date(latest.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Updated</p>
                  </div>
                  <p className="text-lg font-light">{latest.updated_at ? new Date(latest.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Never'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <p className="text-sm font-light text-gray-600">Approved By</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">{latest?.sterilised_milk_process_approved_by_fkey?.role_name || '—'}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {latest.sterilised_milk_process_operator_id_fkey && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Operator</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Name</span>
                        <span className="text-xs font-light">{`${latest.sterilised_milk_process_operator_id_fkey.first_name || ''} ${latest.sterilised_milk_process_operator_id_fkey.last_name || ''}`.trim() || latest.sterilised_milk_process_operator_id_fkey.email || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Department</span>
                        <span className="text-xs font-light">{latest.sterilised_milk_process_operator_id_fkey.department || '—'}</span>
                      </div>
                    </div>
                  </div>
                )}
                {latest.sterilised_milk_process_supervisor_id_fkey && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Supervisor</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Name</span>
                        <span className="text-xs font-light">{`${latest.sterilised_milk_process_supervisor_id_fkey.first_name || ''} ${latest.sterilised_milk_process_supervisor_id_fkey.last_name || ''}`.trim() || latest.sterilised_milk_process_supervisor_id_fkey.email || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Department</span>
                        <span className="text-xs font-light">{latest.sterilised_milk_process_supervisor_id_fkey.department || '—'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {!loading.fetch && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Sterilised Milk Processes</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(s) => setTableFilters((p) => ({ ...p, search: s }))}
                searchPlaceholder="Search processes..."
                filterFields={filterFields}
              />
              {operationLoading.fetch ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable columns={columns} data={processes} showSearch={false} />
              )}
            </div>
          </div>
        )}

        <SterilisedMilkProcessDrawer open={formDrawerOpen} onOpenChange={setFormDrawerOpen} process={selectedProcess} mode={formMode} />
        <SterilisedMilkProcessViewDrawer open={viewDrawerOpen} onOpenChange={setViewDrawerOpen} process={selectedProcess} onEdit={() => { setViewDrawerOpen(false); handleEdit(selectedProcess!) }} />
        <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Process" description={`Are you sure you want to delete this process? This action cannot be undone.`} onConfirm={confirmDelete} loading={operationLoading.delete} />
      </div>
    </DataCaptureDashboardLayout>
  )
}


