"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Thermometer, TrendingUp, FileText, Droplets } from "lucide-react"
import { FlexOneSteriliserProcessDrawer } from "@/components/forms/flex-one-steriliser-process-drawer"
import { FlexOneSteriliserProcessViewDrawer } from "@/components/forms/flex-one-steriliser-process-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchFlexOneSteriliserProcesses, 
  deleteFlexOneSteriliserProcessAction,
  fetchFlexOneSteriliserProcessProducts,
  fetchFlexOneSteriliserProcessWaterStreams,
  clearError
} from "@/lib/store/slices/flexOneSteriliserProcessSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { FlexOneSteriliserProcess } from "@/lib/api/data-capture-forms"

export default function FlexOneSteriliserProcessPage() {
  const dispatch = useAppDispatch()
  const { processes, products, waterStreams, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.flexOneSteriliserProcesses)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load flex one steriliser processes on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchFlexOneSteriliserProcesses())
      dispatch(fetchFlexOneSteriliserProcessProducts())
      dispatch(fetchFlexOneSteriliserProcessWaterStreams())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchFlexOneSteriliserProcesses())
    }
  }, [dispatch, tableFilters, isInitialized])
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || error?.error || 'An error occurred'
      toast.error(errorMessage)
      dispatch(clearError())
    }
  }, [error, dispatch])
  
  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Selected process and mode
  const [selectedProcess, setSelectedProcess] = useState<FlexOneSteriliserProcess | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Get related data for selected process
  const selectedProcessProducts = useMemo(() => {
    if (!selectedProcess) return []
    return products.filter((product: any) => product.flex_one_steriliser_process_id === selectedProcess.id)
  }, [selectedProcess, products])

  const selectedProcessWaterStreams = useMemo(() => {
    if (!selectedProcess) return []
    return waterStreams.filter((stream: any) => stream.flex_1_steriliser_process_id === selectedProcess.id)
  }, [selectedProcess, waterStreams])

  // Filter fields configuration for Flex One Steriliser Process
  const filterFields = useMemo(() => [
    {
      key: "approved_by",
      label: "Approved By",
      type: "text" as const,
      placeholder: "Filter by approver name"
    },
    {
      key: "process_operator",
      label: "Process Operator",
      type: "text" as const,
      placeholder: "Filter by operator name"
    },
    {
      key: "product_being_processed",
      label: "Product",
      type: "text" as const,
      placeholder: "Filter by product"
    },
    {
      key: "production_date",
      label: "Production Date",
      type: "date" as const,
      placeholder: "Filter by production date"
    }
  ], [])

  // Action handlers
  const handleAddProcess = () => {
    setSelectedProcess(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditProcess = (process: FlexOneSteriliserProcess) => {
    setSelectedProcess(process)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewProcess = (process: FlexOneSteriliserProcess) => {
    setSelectedProcess(process)
    setViewDrawerOpen(true)
  }

  const handleDeleteProcess = (process: FlexOneSteriliserProcess) => {
    setSelectedProcess(process)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProcess) return
    
    try {
      await dispatch(deleteFlexOneSteriliserProcessAction(selectedProcess.id!)).unwrap()
      toast.success('Flex One Steriliser Process deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedProcess(null)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || 'Failed to delete flex one steriliser process'
      toast.error(errorMessage)
    }
  }

  const getPersonName = (person: any) => {
    if (!person) return "Unknown"
    return `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email || "Unknown"
  }

  const getMachineName = (machine: any) => {
    if (!machine) return "Unknown"
    return machine.name || "Unknown"
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "process_info",
      header: "Process",
      cell: ({ row }: any) => {
        const process = row.original
        const productsCount = products.filter((product: any) => product.flex_one_steriliser_process_id === process.id).length
        const waterStreamsCount = waterStreams.filter((stream: any) => stream.flex_1_steriliser_process_id === process.id).length
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Flex 1 Steriliser</span>
                <Badge className="bg-blue-100 text-blue-800">{productsCount} products</Badge>
                <Badge className="bg-blue-100 text-blue-800">{waterStreamsCount} streams</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {process.product_being_processed || "Unknown Product"}
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
        const operator = process.flex_one_steriliser_process_process_operator_fkey
        const approver = process.flex_one_steriliser_process_approved_by_fkey
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">Op: {getPersonName(operator)}</p>
            <p className="text-xs text-gray-500">App: {getPersonName(approver)}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "machine",
      header: "Machine",
      cell: ({ row }: any) => {
        const process = row.original
        const machine = process.flex_one_steriliser_process_machine_id_fkey
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{getMachineName(machine)}</p>
            <p className="text-xs text-gray-500">
              {process.production_date ? new Date(process.production_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "timing",
      header: "Production Timing",
      cell: ({ row }: any) => {
        const process = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {process.production_start ? new Date(process.production_start).toLocaleTimeString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {process.production_end ? new Date(process.production_end).toLocaleTimeString() : 'N/A'}
            </p>
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
    <DataCaptureDashboardLayout title="Flex One Steriliser Process" subtitle="Flex 1 steriliser process control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flex One Steriliser Process</h1>
            <p className="text-muted-foreground">Manage flex 1 steriliser processing operations</p>
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
                      process.production_date && new Date(process.production_date).toDateString() === new Date().toDateString()
                    ).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed today</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
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
                    {(products || []).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Product measurements</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Water Streams</CardTitle>
              <Droplets className="h-4 w-4 text-blue-600" />
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
                    {(waterStreams || []).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Water stream records</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Flex One Steriliser Processes</CardTitle>
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
        <FlexOneSteriliserProcessDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          process={selectedProcess}
          mode={formMode} 
        />

        {/* View Drawer */}
        <FlexOneSteriliserProcessViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          process={selectedProcess}
          products={selectedProcessProducts}
          waterStreams={selectedProcessWaterStreams}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditProcess(selectedProcess!)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Flex One Steriliser Process"
          description={`Are you sure you want to delete this flex one steriliser process? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
