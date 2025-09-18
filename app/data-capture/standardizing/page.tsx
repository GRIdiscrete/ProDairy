"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Beaker, TrendingUp, FileText, Clock, Package, ArrowRight } from "lucide-react"
import { StandardizingFormDrawer } from "@/components/forms/standardizing-form-drawer"
import { StandardizingFormViewDrawer } from "@/components/forms/standardizing-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchStandardizingForms, 
  deleteStandardizingForm,
  clearError
} from "@/lib/store/slices/standardizingSlice"
import { fetchBMTControlForms } from "@/lib/store/slices/bmtControlFormSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { StandardizingForm } from "@/lib/api/standardizing"
import ContentSkeleton from "@/components/ui/content-skeleton"

export default function StandardizingPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.standardizing)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load standardizing forms and BMT forms on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchStandardizingForms())
      dispatch(fetchBMTControlForms()) // Load BMT forms for the form drawer
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchStandardizingForms())
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
  
  // Selected form and mode
  const [selectedForm, setSelectedForm] = useState<StandardizingForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for Standardizing
  const filterFields = useMemo(() => [
    {
      key: "created_at",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "bmt_id",
      label: "BMT ID",
      type: "text" as const,
      placeholder: "Filter by BMT ID"
    },
    {
      key: "operator_signature",
      label: "Operator",
      type: "text" as const,
      placeholder: "Filter by operator"
    }
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: StandardizingForm) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: StandardizingForm) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: StandardizingForm) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return
    
    try {
      await dispatch(deleteStandardizingForm(selectedForm.id)).unwrap()
      toast.success('Standardizing Form deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete standardizing form')
    }
  }

  // Get latest form for display
  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null

  // Table columns with actions
  const columns = [
    {
      accessorKey: "form_info",
      header: "Form",
      cell: ({ row }: any) => {
        const form = row.original
        const totalRawMilk = form.raw_milk?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Beaker className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">#{form.id.slice(0, 8)}</span>
                <Badge className="bg-orange-100 text-orange-800 font-light">{totalRawMilk}L</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(form.created_at).toLocaleDateString()} • {form.raw_milk?.length || 0} raw milk entries
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "bmt_info",
      header: "BMT Form",
      cell: ({ row }: any) => {
        const form = row.original
        const bmtForm = form.standardizing_form_bmt_id_fkey
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-light">BMT Form</span>
            </div>
            {bmtForm ? (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  {new Date(bmtForm.created_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    {bmtForm.volume}L
                  </Badge>
                  <Badge className="text-xs bg-green-100 text-green-800">
                    {bmtForm.product}
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
      accessorKey: "raw_milk",
      header: "Raw Milk",
      cell: ({ row }: any) => {
        const form = row.original
        const totalQuantity = form.raw_milk?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
        const avgFat = form.raw_milk?.length > 0 
          ? (form.raw_milk.reduce((sum: number, item: any) => sum + item.fat, 0) / form.raw_milk.length).toFixed(1)
          : 0
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <Beaker className="w-3 h-3 text-orange-600" />
              </div>
              <p className="text-sm font-light">
                {form.raw_milk?.length || 0} entries
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Qty</span>
                <span className="text-xs font-light">{totalQuantity.toFixed(1)}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Avg Fat</span>
                <span className="text-xs font-light">{avgFat}%</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "skim_milk",
      header: "Skim Milk",
      cell: ({ row }: any) => {
        const form = row.original
        const totalQuantity = form.skim_milk?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
        const avgFat = form.skim_milk?.length > 0 
          ? (form.skim_milk.reduce((sum: number, item: any) => sum + item.fat, 0) / form.skim_milk.length).toFixed(1)
          : 0
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-blue-600" />
              </div>
              <p className="text-sm font-light">
                {form.skim_milk?.length || 0} entries
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Qty</span>
                <span className="text-xs font-light">{totalQuantity.toFixed(1)}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Avg Fat</span>
                <span className="text-xs font-light">{avgFat}%</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "cream",
      header: "Cream",
      cell: ({ row }: any) => {
        const form = row.original
        const totalQuantity = form.cream?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
        const avgFat = form.cream?.length > 0 
          ? (form.cream.reduce((sum: number, item: any) => sum + item.fat, 0) / form.cream.length).toFixed(1)
          : 0
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-yellow-600" />
              </div>
              <p className="text-sm font-light">
                {form.cream?.length || 0} entries
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Qty</span>
                <span className="text-xs font-light">{totalQuantity.toFixed(1)}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Avg Fat</span>
                <span className="text-xs font-light">{avgFat}%</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {form.updated_at ? `Updated: ${new Date(form.updated_at).toLocaleDateString()}` : 'Never updated'}
            </p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewForm(form)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditForm(form)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteForm(form)}
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
  ]

  return (
    <DataCaptureDashboardLayout title="Standardizing" subtitle="Milk standardizing process control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Standardizing</h1>
            <p className="text-sm font-light text-muted-foreground">Manage milk standardizing forms and process control</p>
          </div>
          <LoadingButton 
            onClick={handleAddForm}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Standardizing Form
          </LoadingButton>
        </div>

        {/* Current Form Details */}
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestForm ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-orange-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Beaker className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Standardizing Process</span>
                  <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 font-light">Latest</Badge>
                </div>
                <LoadingButton 
                  variant="outline" 
                  onClick={() => handleViewForm(latestForm)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
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
                    <p className="text-sm font-light text-gray-600">Form ID</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-light">#{latestForm.id.slice(0, 8)}</p>
                    <CopyButton text={latestForm.id} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Beaker className="h-4 w-4 text-orange-500" />
                    <p className="text-sm font-light text-gray-600">Raw Milk</p>
                  </div>
                  <p className="text-lg font-light text-orange-600">
                    {latestForm.raw_milk?.reduce((sum, item) => sum + item.quantity, 0).toFixed(1)}L
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Created</p>
                  </div>
                  <p className="text-lg font-light">{new Date(latestForm.created_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Products</p>
                  </div>
                  <p className="text-lg font-light text-green-600">
                    {(latestForm.skim_milk?.length || 0) + (latestForm.cream?.length || 0)} products
                  </p>
                </div>
              </div>
              
              {/* BMT Form and Process Details in Row */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* BMT Form Details */}
                {latestForm.standardizing_form_bmt_id_fkey && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">BMT Form</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Form ID</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-light">#{latestForm.bmt_id.slice(0, 8)}</span>
                          <CopyButton text={latestForm.bmt_id} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Volume</span>
                        <span className="text-xs font-light">{latestForm.standardizing_form_bmt_id_fkey.volume}L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Product</span>
                        <span className="text-xs font-light text-blue-600">{latestForm.standardizing_form_bmt_id_fkey.product}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Process Summary */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <Beaker className="h-4 w-4 text-orange-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Process Summary</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Raw Milk Entries</span>
                      <span className="text-xs font-light text-orange-600">{latestForm.raw_milk?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Skim Milk Entries</span>
                      <span className="text-xs font-light text-blue-600">{latestForm.skim_milk?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Cream Entries</span>
                      <span className="text-xs font-light text-yellow-600">{latestForm.cream?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Data Table */}
        {!loading && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Standardizing Forms</div>
            </div>
            <div className="p-6 space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search standardizing forms..."
              filterFields={filterFields}
            />
            
            {loading ? (
              <ContentSkeleton sections={1} cardsPerSection={4} />
            ) : (
              <DataTable columns={columns} data={forms} showSearch={false} />
            )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <StandardizingFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          form={selectedForm}
          mode={formMode} 
        />

        {/* View Drawer */}
        <StandardizingFormViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          form={selectedForm}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditForm(selectedForm!)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Standardizing Form"
          description={`Are you sure you want to delete this standardizing form? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
