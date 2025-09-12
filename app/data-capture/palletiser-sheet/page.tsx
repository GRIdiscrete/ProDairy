"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Package, TrendingUp, FileText, Clock, ArrowRight } from "lucide-react"
import { PalletiserSheetDrawer } from "@/components/forms/palletiser-sheet-drawer"
import { PalletiserSheetViewDrawer } from "@/components/forms/palletiser-sheet-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
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
      key: "created_at",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "batch_number",
      label: "Batch Number",
      type: "text" as const,
      placeholder: "Filter by batch number"
    },
    {
      key: "product_type",
      label: "Product Type",
      type: "text" as const,
      placeholder: "Filter by product type"
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

  // Get latest sheet for display
  const latestSheet = Array.isArray(sheets) && sheets.length > 0 ? sheets[0] : null

  // Table columns with actions
  const columns = useMemo(() => [
    {
      accessorKey: "sheet_info",
      header: "Sheet",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">#{sheet.id ? sheet.id.slice(0, 8) : 'N/A'}</span>
                <Badge className="bg-blue-100 text-blue-800 font-light">{sheet.batch_number || 'N/A'}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {sheet.created_at ? new Date(sheet.created_at).toLocaleDateString() : 'N/A'} • {sheet.product_type || 'N/A'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "machine_info",
      header: "Machine",
      cell: ({ row }: any) => {
        const sheet = row.original
        const machine = sheet.palletiser_sheet_machine_id_fkey
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm font-light">Machine</span>
            </div>
            {machine ? (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  {machine.name}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className="text-xs bg-green-100 text-green-800">
                    {machine.category}
                  </Badge>
                  <Badge className="text-xs bg-gray-100 text-gray-800">
                    {machine.location}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No details</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "product_info",
      header: "Product",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-blue-600" />
              </div>
              <p className="text-sm font-light">
                Product Details
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Type</span>
                <span className="text-xs font-light">{sheet.product_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Batch</span>
                <span className="text-xs font-light">{sheet.batch_number}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "dates",
      header: "Dates",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-orange-600" />
              </div>
              <p className="text-sm font-light">
                Manufacturing
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Start</span>
                <span className="text-xs font-light">{new Date(sheet.manufacturing_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Expiry</span>
                <span className="text-xs font-light">{new Date(sheet.expiry_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "approval",
      header: "Approval",
      cell: ({ row }: any) => {
        const sheet = row.original
        const approver = sheet.palletiser_sheet_approved_by_fkey
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-purple-600" />
              </div>
              <p className="text-sm font-light">
                Approved By
              </p>
            </div>
            {approver ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Role</span>
                  <span className="text-xs font-light">{approver.role_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Operations</span>
                  <span className="text-xs font-light">{approver.user_operations?.length || 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No details</p>
            )}
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
            <p className="text-sm font-light">
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
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewSheet(sheet)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditSheet(sheet)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteSheet(sheet)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ], [operationLoading.delete])

  return (
    <DataCaptureDashboardLayout title="Palletiser Sheet" subtitle="Palletising process control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Palletiser Sheet</h1>
            <p className="text-sm font-light text-muted-foreground">Manage palletising forms and process control</p>
          </div>
          <LoadingButton 
            onClick={handleAddSheet}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Palletiser Sheet
          </LoadingButton>
        </div>

        {/* Current Sheet Details */}
        {loading ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="mt-4 flex justify-end">
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          </div>
        ) : latestSheet ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Palletising Process</span>
                  <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-light">Latest</Badge>
                </div>
                <LoadingButton 
                  variant="outline" 
                  onClick={() => handleViewSheet(latestSheet)}
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
                    <p className="text-sm font-light text-gray-600">Sheet ID</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-light">#{latestSheet.id?.slice(0, 8) || 'N/A'}</p>
                    <CopyButton text={latestSheet.id || ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Product</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">
                    {latestSheet.product_type}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Manufacturing</p>
                  </div>
                  <p className="text-lg font-light">{new Date(latestSheet.manufacturing_date).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Batch</p>
                  </div>
                  <p className="text-lg font-light text-green-600">
                    #{latestSheet.batch_number}
                  </p>
                </div>
              </div>
              
              {/* Machine and Approval Details in Row */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Machine Details */}
                {latestSheet.palletiser_sheet_machine_id_fkey && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Machine</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Name</span>
                        <span className="text-xs font-light">{latestSheet.palletiser_sheet_machine_id_fkey.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Category</span>
                        <span className="text-xs font-light text-green-600">{latestSheet.palletiser_sheet_machine_id_fkey.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Location</span>
                        <span className="text-xs font-light">{latestSheet.palletiser_sheet_machine_id_fkey.location}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Approval Summary */}
                {latestSheet.palletiser_sheet_approved_by_fkey && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Approval</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Approved By</span>
                        <span className="text-xs font-light text-blue-600">{latestSheet.palletiser_sheet_approved_by_fkey.role_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">User Operations</span>
                        <span className="text-xs font-light text-blue-600">{latestSheet.palletiser_sheet_approved_by_fkey.user_operations?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Process Operations</span>
                        <span className="text-xs font-light text-blue-600">{latestSheet.palletiser_sheet_approved_by_fkey.process_operations?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Data Table */}
        {!loading && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Palletiser Sheets</div>
            </div>
            <div className="p-6 space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search palletiser sheets..."
              filterFields={filterFields}
            />
            
            {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-5 w-12 rounded-full" />
                          </div>
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={sheets}
                showSearch={false}
              />
            )}
            </div>
          </div>
        )}

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