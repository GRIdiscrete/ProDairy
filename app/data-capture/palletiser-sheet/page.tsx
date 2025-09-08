"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Package, TrendingUp, FileText, Clock } from "lucide-react"
import { PalletiserSheetDrawer } from "@/components/forms/palletiser-sheet-drawer"
import { PalletiserSheetViewDrawer } from "@/components/forms/palletiser-sheet-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchPalletiserSheets, 
  deletePalletiserSheetAction,
  clearError
} from "@/lib/store/slices/palletiserSheetSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { PalletiserSheet } from "@/lib/api/data-capture-forms"

export default function PalletiserSheetPage() {
  const dispatch = useAppDispatch()
  const { sheets, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.palletiserSheets)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load palletiser sheets on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchPalletiserSheets())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchPalletiserSheets())
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
  
  // Selected sheet and mode
  const [selectedSheet, setSelectedSheet] = useState<PalletiserSheet | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for Palletiser Sheet
  const filterFields = useMemo(() => [
    {
      key: "size",
      label: "Size",
      type: "select" as const,
      placeholder: "Select Size",
      options: [
        { label: "Large", value: "Large" },
        { label: "Medium", value: "Medium" },
        { label: "Small", value: "Small" }
      ]
    },
    {
      key: "grade",
      label: "Grade",
      type: "select" as const,
      placeholder: "Select Grade",
      options: [
        { label: "A", value: "A" },
        { label: "B", value: "B" },
        { label: "C", value: "C" }
      ]
    },
    {
      key: "shift",
      label: "Shift",
      type: "select" as const,
      placeholder: "Select Shift",
      options: [
        { label: "Morning", value: "Morning" },
        { label: "Afternoon", value: "Afternoon" },
        { label: "Night", value: "Night" }
      ]
    },
    {
      key: "date",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    }
  ], [])

  // Action handlers
  const handleAddSheet = () => {
    setSelectedSheet(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditSheet = (sheet: PalletiserSheet) => {
    setSelectedSheet(sheet)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewSheet = (sheet: PalletiserSheet) => {
    setSelectedSheet(sheet)
    setViewDrawerOpen(true)
  }

  const handleDeleteSheet = (sheet: PalletiserSheet) => {
    setSelectedSheet(sheet)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedSheet) return
    
    try {
      await dispatch(deletePalletiserSheetAction(selectedSheet.id!)).unwrap()
      toast.success('Palletiser Sheet deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedSheet(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete palletiser sheet')
    }
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "sheet_info",
      header: "Sheet",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Pallet #{sheet.pallet_number}</span>
                <Badge className="bg-orange-100 text-orange-800">{sheet.size}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Grade: {sheet.grade} | {sheet.machine}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "operator_info",
      header: "Operator",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{sheet.operator_name}</p>
            <p className="text-xs text-gray-500">Supervisor: {sheet.supervisor}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "timing",
      header: "Timing",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{sheet.shift}</p>
            <p className="text-xs text-gray-500">
              {sheet.time_in} - {sheet.time_out}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "variance",
      header: "Variance",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{sheet.variance}</p>
            <Badge variant={sheet.variance > 0 ? "destructive" : "default"} className="text-xs">
              {sheet.variance > 0 ? "Over" : "Normal"}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {sheet.created_at ? new Date(sheet.created_at).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {sheet.updated_at ? `Updated: ${new Date(sheet.updated_at).toLocaleDateString()}` : 'Never updated'}
            </p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton variant="outline" size="sm" onClick={() => handleViewSheet(sheet)}>
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton variant="outline" size="sm" onClick={() => handleEditSheet(sheet)}>
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteSheet(sheet)}
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
    <DataCaptureDashboardLayout title="Palletiser Sheet" subtitle="Palletiser sheet control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Palletiser Sheet</h1>
            <p className="text-muted-foreground">Manage palletiser sheet operations</p>
          </div>
          <LoadingButton onClick={handleAddSheet}>
            <Plus className="mr-2 h-4 w-4" />
            Add Sheet
          </LoadingButton>
        </div>

        {/* Counter Widgets with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sheets</CardTitle>
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
                  <div className="text-2xl font-bold">{(sheets || []).length}</div>
                  <p className="text-xs text-muted-foreground">Total entries</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sheets</CardTitle>
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
                    {(sheets || []).filter((sheet) => 
                      sheet.created_at && new Date(sheet.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed today</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grade A</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
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
                    {(sheets || []).filter((sheet) => sheet.grade === "A").length}
                  </div>
                  <p className="text-xs text-muted-foreground">High quality</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Variance</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
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
                    {(sheets || []).length ? ((sheets || []).reduce((sum, sheet) => sum + (sheet.variance || 0), 0) / sheets.length).toFixed(1) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Time variance</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Palletiser Sheets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search sheets..."
              filterFields={filterFields}
            />
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading sheets...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={sheets || []}
                showSearch={false}
              />
            )}
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <PalletiserSheetDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          sheet={selectedSheet}
          mode={formMode} 
        />

        {/* View Drawer */}
        <PalletiserSheetViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          sheet={selectedSheet}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditSheet(selectedSheet!)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Palletiser Sheet"
          description={`Are you sure you want to delete this palletiser sheet? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
