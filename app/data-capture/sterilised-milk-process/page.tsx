"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Milk, TrendingUp, FileText, Thermometer } from "lucide-react"
import { SterilisedMilkProcessDrawer } from "@/components/forms/sterilised-milk-process-drawer"
import { SterilisedMilkProcessViewDrawer } from "@/components/forms/sterilised-milk-process-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchSterilisedMilkProcesses, 
  deleteSterilisedMilkProcessAction,
  fetchSterilisedMilkProcessDetails,
  clearError
} from "@/lib/store/slices/sterilisedMilkProcessSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { SterilisedMilkProcess } from "@/lib/api/data-capture-forms"

export default function SterilisedMilkProcessPage() {
  const dispatch = useAppDispatch()
  const { processes, processDetails, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.sterilisedMilkProcesses)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load sterilised milk processes on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchSterilisedMilkProcesses())
      dispatch(fetchSterilisedMilkProcessDetails())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchSterilisedMilkProcesses())
    }
  }, [dispatch, tableFilters, isInitialized])
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])
  
  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Selected process and mode
  const [selectedProcess, setSelectedProcess] = useState<SterilisedMilkProcess | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Get process details for selected process
  const selectedProcessDetails = useMemo(() => {
    if (!selectedProcess) return []
    return processDetails.filter((detail: any) => detail.sterilised_milk_process_id === selectedProcess.id)
  }, [selectedProcess, processDetails])

  // Filter fields configuration for Sterilised Milk Process
  const filterFields = useMemo(() => [
    {
      key: "approved_by",
      label: "Approved By",
      type: "text" as const,
      placeholder: "Filter by approver name"
    },
    {
      key: "operator_id",
      label: "Operator",
      type: "text" as const,
      placeholder: "Filter by operator name"
    },
    {
      key: "supervisor_id",
      label: "Supervisor",
      type: "text" as const,
      placeholder: "Filter by supervisor name"
    },
    {
      key: "created_at",
      label: "Created Date",
      type: "date" as const,
      placeholder: "Filter by creation date"
    }
  ], [])

  // Action handlers
  const handleAddProcess = () => {
    setSelectedProcess(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditProcess = (process: SterilisedMilkProcess) => {
    setSelectedProcess(process)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewProcess = (process: SterilisedMilkProcess) => {
    setSelectedProcess(process)
    setViewDrawerOpen(true)
  }

  const handleDeleteProcess = (process: SterilisedMilkProcess) => {
    setSelectedProcess(process)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProcess) return
    
    try {
      await dispatch(deleteSterilisedMilkProcessAction(selectedProcess.id!)).unwrap()
      toast.success('Sterilised Milk Process deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedProcess(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete sterilised milk process')
    }
  }

  const getPersonName = (person: any) => {
    if (!person) return "Unknown"
    return `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email || "Unknown"
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "process_info",
      header: "Process",
      cell: ({ row }: any) => {
        const process = row.original
        const processDetailsCount = processDetails.filter((detail: any) => detail.sterilised_milk_process_id === process.id).length
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Milk className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Sterilisation Process</span>
                <Badge className="bg-green-100 text-green-800">{processDetailsCount} params</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                ID: {process.id ? `${process.id.slice(0, 8)}...` : "N/A"}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "personnel",
      header: "Personnel",
      cell: ({ row }: any) => {
        const process = row.original
        const operator = process.sterilised_milk_process_operator_id_fkey
        const supervisor = process.sterilised_milk_process_supervisor_id_fkey
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">Op: {getPersonName(operator)}</p>
            <p className="text-xs text-gray-500">Sup: {getPersonName(supervisor)}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "approval",
      header: "Approval",
      cell: ({ row }: any) => {
        const process = row.original
        const approvedBy = process.sterilised_milk_process_approved_by_fkey
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{getPersonName(approvedBy)}</p>
            <Badge variant="outline" className="text-xs">
              Approved
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const process = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {process.created_at ? new Date(process.created_at).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {process.updated_at ? `Updated: ${new Date(process.updated_at).toLocaleDateString()}` : 'Never updated'}
            </p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const process = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton variant="outline" size="sm" onClick={() => handleViewProcess(process)}>
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton variant="outline" size="sm" onClick={() => handleEditProcess(process)}>
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteProcess(process)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  return (
    <DataCaptureDashboardLayout title="Sterilised Milk Process" subtitle="Sterilised milk processing control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sterilised Milk Process</h1>
            <p className="text-muted-foreground">Manage sterilised milk processing operations</p>
          </div>
          <LoadingButton onClick={handleAddProcess}>
            <Plus className="mr-2 h-4 w-4" />
            Add Process
          </LoadingButton>
        </div>

        {/* Counter Widgets with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Processes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{(processes || []).length}</div>
                  <p className="text-xs text-muted-foreground">Total entries</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Processes</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    {(processes || []).filter((process: any) => 
                      process.created_at && new Date(process.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed today</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parameters</CardTitle>
              <Thermometer className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {(processDetails || []).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Process parameters</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Parameters</CardTitle>
              <Milk className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-purple-600">
                    {(processes || []).length ? Math.round((processDetails || []).length / processes.length) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Per process</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sterilised Milk Processes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search processes..."
              filterFields={filterFields}
            />
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading processes...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={processes || []}
                showSearch={false}
              />
            )}
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <SterilisedMilkProcessDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          process={selectedProcess}
          mode={formMode} 
        />

        {/* View Drawer */}
        <SterilisedMilkProcessViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          process={selectedProcess}
          processDetails={selectedProcessDetails}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditProcess(selectedProcess!)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Sterilised Milk Process"
          description={`Are you sure you want to delete this sterilised milk process? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
