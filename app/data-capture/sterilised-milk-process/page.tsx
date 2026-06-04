"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Milk, TrendingUp, FileText, Thermometer, LayoutList, Table2, Download } from "lucide-react"
import { SterilisedMilkProcessDrawer } from "@/components/forms/sterilised-milk-process-drawer"
import { SterilisedMilkProcessViewDrawer } from "@/components/forms/sterilised-milk-process-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchSterilisedMilkProcesses, 
  deleteSterilisedMilkProcessAction,
  clearError
} from "@/lib/store/slices/sterilisedMilkProcessSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { SterilisedMilkProcess, SteriPastoTableRow, getSteriPastoTable } from "@/lib/api/data-capture-forms"
import { exportToExcel } from "@/lib/utils/export-excel"

export default function SterilisedMilkProcessPage() {
  const dispatch = useAppDispatch()
  const { processes, processDetails, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.sterilisedMilkProcesses)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const [viewMode, setViewMode] = useState<"records" | "table">("records")
  const [pastoTableData, setPastoTableData] = useState<SteriPastoTableRow[]>([])
  const [pastoTableLoading, setPastoTableLoading] = useState(false)
  const hasFetchedRef = useRef(false)

  const pastoTableColumns = [
    { header: "Date",                   key: "date",                            accessorKey: "date",                            cell: ({ row }: any) => <span className="text-sm font-light">{row.original.date ?? "—"}</span> },
    { header: "Metric",                 key: "metric",                          accessorKey: "metric",                          cell: ({ row }: any) => <span className="text-sm font-light capitalize">{row.original.metric ?? "—"}</span> },
    { header: "Production Start",       key: "production_start",                accessorKey: "production_start",                cell: ({ row }: any) => <span className="text-sm font-light">{row.original.production_start ?? "—"}</span> },
    { header: "Production End",         key: "production_end",                  accessorKey: "production_end",                  cell: ({ row }: any) => <span className="text-sm font-light">{row.original.production_end ? new Date(row.original.production_end).toLocaleString() : "—"}</span> },
    { header: "Preheating Start",       key: "preheating_start",                accessorKey: "preheating_start",                cell: ({ row }: any) => <span className="text-sm font-light">{row.original.preheating_start ?? "—"}</span> },
    { header: "Water Circulation",      key: "water_circulation",               accessorKey: "water_circulation",               cell: ({ row }: any) => <span className="text-sm font-light">{row.original.water_circulation ?? "—"}</span> },
    { header: "Temp Hot Water",         key: "temp_hot_water",                  accessorKey: "temp_hot_water",                  cell: ({ row }: any) => <span className="text-sm font-light">{row.original.temp_hot_water ?? "—"}</span> },
    { header: "Temp Product Past.",     key: "temp_product_pasteurisation",     accessorKey: "temp_product_pasteurisation",     cell: ({ row }: any) => <span className="text-sm font-light">{row.original.temp_product_pasteurisation ?? "—"}</span> },
    { header: "Homo. P Stage 1",        key: "homogenisation_pressure_stage_1", accessorKey: "homogenisation_pressure_stage_1", cell: ({ row }: any) => <span className="text-sm font-light">{row.original.homogenisation_pressure_stage_1 ?? "—"}</span> },
    { header: "Homo. P Stage 2",        key: "homogenisation_pressure_stage_2", accessorKey: "homogenisation_pressure_stage_2", cell: ({ row }: any) => <span className="text-sm font-light">{row.original.homogenisation_pressure_stage_2 ?? "—"}</span> },
    { header: "Total Homo. P",          key: "total_homogenisation_pressure",   accessorKey: "total_homogenisation_pressure",   cell: ({ row }: any) => <span className="text-sm font-light">{row.original.total_homogenisation_pressure ?? "—"}</span> },
    { header: "Temp Product Out",       key: "temp_product_out",                accessorKey: "temp_product_out",                cell: ({ row }: any) => <span className="text-sm font-light">{row.original.temp_product_out ?? "—"}</span> },
  ]
  
  // Load sterilised milk processes on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchSterilisedMilkProcesses())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchSterilisedMilkProcesses())
    }
  }, [dispatch, tableFilters, isInitialized])
  
  useEffect(() => {
    if (viewMode !== "table" || pastoTableData.length > 0) return
    setPastoTableLoading(true)
    getSteriPastoTable()
      .then(setPastoTableData)
      .catch(() => toast.error("Failed to load table"))
      .finally(() => setPastoTableLoading(false))
  }, [viewMode])

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
    
    // Check if the process has details relationship
    if (selectedProcess.sterilised_milk_process_details_fkey) {
      return [selectedProcess.sterilised_milk_process_details_fkey]
    }
    
    return []
  }, [selectedProcess])

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
        const hasDetails = process.sterilised_milk_process_details_fkey
        const details = hasDetails ? process.sterilised_milk_process_details_fkey : null
        
        return (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Milk className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">Current Sterilised Milk Process</span>
                <Badge className="bg-green-100 text-green-800">Latest</Badge>
                {hasDetails && (
                  <Badge className="bg-blue-100 text-blue-800">Process Parameters</Badge>
                )}
              </div>
              
              {/* Process Parameters Preview */}
              {hasDetails && details ? (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Process Parameters Preview</span>
                    <Badge  className="text-xs">Latest</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Parameter:</span>
                      <p className="font-medium">{details.parameter_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Batch:</span>
                      <p className="font-medium">#{details.batch_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Heating Start:</span>
                      <p className="font-medium">{details.heating_start_reading}°C</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Sterilization:</span>
                      <p className="font-medium">{details.sterilization_start_reading}°C</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-dashed">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Process Parameters</span>
                    <Badge  className="text-xs text-gray-500">No Details</Badge>
                  </div>
                  <p className="text-xs text-gray-500">No process details available for this process.</p>
                </div>
              )}
              
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
            <Badge  className="text-xs">
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
            <LoadingButton  size="sm" onClick={() => handleViewProcess(process)}>
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton  size="sm" onClick={() => handleEditProcess(process)}>
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
          <div className="flex items-center gap-3">
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
            {viewMode === "table" && (
              <LoadingButton
                onClick={() => exportToExcel(pastoTableColumns.map(c => ({ header: c.header, key: c.key })), pastoTableData, "steri-pasto-table")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-full px-4 py-2 font-light"
              >
                <Download className="mr-2 h-4 w-4" /> Export Excel
              </LoadingButton>
            )}
            <LoadingButton onClick={handleAddProcess} className="bg-[#006BC4] text-white border-0 rounded-full px-6 py-2 font-light">
              <Plus className="mr-2 h-4 w-4" /> Add Process
            </LoadingButton>
          </div>
        </div>

        {/* Current Sterilised Milk Process Card */}
        {processes && processes.length > 0 && (() => {
          const latestProcess = processes.sort((a: any, b: any) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          )[0]
          const hasDetails = latestProcess.sterilised_milk_process_details_fkey
          const details = hasDetails ? latestProcess.sterilised_milk_process_details_fkey : null
          
          return (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Milk className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-medium">Current Sterilised Milk Process</CardTitle>
                      <p className="text-sm text-muted-foreground">Latest process information and parameters</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Latest</Badge>
                    {hasDetails && (
                      <Badge className="bg-blue-100 text-blue-800">Process Parameters</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Process ID</span>
                    <p className="text-sm font-medium">#{latestProcess.id ? latestProcess.id.slice(0, 8) : "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Created</span>
                    <p className="text-sm font-medium">
                      {latestProcess.created_at ? new Date(latestProcess.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Updated</span>
                    <p className="text-sm font-medium">
                      {latestProcess.updated_at ? new Date(latestProcess.updated_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Approved By</span>
                    <p className="text-sm font-medium">
                      {getPersonName(latestProcess.sterilised_milk_process_approved_by_fkey)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Filmatic Form</span>
                    <p className="text-sm font-medium">
                      {latestProcess.filmatic_form_id ? `Form #${latestProcess.filmatic_form_id.slice(0, 8)}` : "Not linked"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Status</span>
                    <p className="text-sm font-medium text-green-600">Active Process</p>
                  </div>
                </div>

                {/* Process Parameters Preview */}
                {hasDetails && details && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Process Parameters</h4>
                      <Badge  className="text-xs">Latest</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Parameter:</span>
                        <p className="font-medium">{details.parameter_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Batch:</span>
                        <p className="font-medium">#{details.batch_number}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Heating Start:</span>
                        <p className="font-medium">{details.heating_start_reading}°C</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Sterilization:</span>
                        <p className="font-medium">{details.sterilization_start_reading}°C</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      
                      size="sm"
                      onClick={() => handleViewProcess(latestProcess)}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      
                      size="sm"
                      onClick={() => handleEditProcess(latestProcess)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Process
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {latestProcess.updated_at ? new Date(latestProcess.updated_at).toLocaleString() : "Never"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })()}

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
                    {(processes || []).filter((process: any) => process.sterilised_milk_process_details_fkey).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Process parameters</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Parameters</CardTitle>
              <Milk className="h-4 w-4 text-blue-600" />
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
                    {(processes || []).length ? Math.round((processes || []).filter((process: any) => process.sterilised_milk_process_details_fkey).length / processes.length) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Per process</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {(() => {
          if (viewMode === "table") {
            return (
              <div className="border border-gray-200 rounded-xl bg-white shadow-none overflow-hidden">
                <div className="p-6">
                  {pastoTableLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <DataTable columns={pastoTableColumns} data={pastoTableData} searchKey="date" />
                  )}
                </div>
              </div>
            )
          }

          return (
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
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-muted-foreground">Loading processes...</p>
                    </div>
                  </div>
                ) : (
                  <DataTable columns={columns} data={processes || []} showSearch={false} />
                )}
              </CardContent>
            </Card>
          )
        })()}

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
