"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Beaker, TrendingUp, FileText, Clock, Package, Truck } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import { BMTControlFormDrawer } from "@/components/forms/bmt-control-form-drawer"
import { BMTControlFormViewDrawer } from "@/components/forms/bmt-control-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchBMTControlForms, 
  deleteBMTControlFormAction,
  clearError
} from "@/lib/store/slices/bmtControlFormSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { BMTControlForm } from "@/lib/api/bmt-control-form"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { ToolsDashboardLayout } from "@/components/layout/tools-dashboard-layout"

export default function BMTControlFormPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.bmtControlForms)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load BMT control forms on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchBMTControlForms())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchBMTControlForms())
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
  const [selectedForm, setSelectedForm] = useState<BMTControlForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for BMT control forms
  const filterFields = useMemo(() => [
    {
      key: "product",
      label: "Product",
      type: "select" as const,
      placeholder: "Select Product",
      options: [
        { label: "UHT Milk", value: "UHT milk" },
        { label: "Fresh Milk", value: "Fresh milk" },
        { label: "Cream", value: "Cream" },
        { label: "Buttermilk", value: "Buttermilk" }
      ]
    },
    {
      key: "source_silo_id",
      label: "Source Silo",
      type: "text" as const,
      placeholder: "Filter by source silo"
    },
    {
      key: "destination_silo_id", 
      label: "Destination Silo",
      type: "text" as const,
      placeholder: "Filter by destination silo"
    },
    {
      key: "llm_operator_id",
      label: "LLM Operator",
      type: "text" as const,
      placeholder: "Filter by LLM operator"
    }
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: BMTControlForm) => {
    // Debug: Log the form being passed to edit
    console.log('handleEditForm - Form object:', form)
    console.log('handleEditForm - Form ID:', form.id)
    console.log('handleEditForm - Form ID type:', typeof form.id)
    console.log('handleEditForm - Form ID === undefined:', form.id === undefined)
    console.log('handleEditForm - Form ID === null:', form.id === null)
    console.log('handleEditForm - Form keys:', Object.keys(form))
    console.log('handleEditForm - Form values:', Object.values(form))
    
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: BMTControlForm) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: BMTControlForm) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return
    
    try {
      await dispatch(deleteBMTControlFormAction(selectedForm.id!)).unwrap()
      toast.success('BMT Control Form deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete BMT control form')
    }
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "product",
      header: "BMT Form",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Beaker className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">{form.product}</span>
                <Badge className="bg-blue-100 text-blue-800 font-light">{form.volume}L</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {form.bmt_control_form_source_silo_id_fkey?.name || 'Source Silo'} → {form.bmt_control_form_destination_silo_id_fkey?.name || 'Destination Silo'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "movement_details",
      header: "Movement",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">Vol: {form.volume}L</p>
            <p className="text-xs text-gray-500">
              {form.movement_start ? new Date(form.movement_start).toLocaleTimeString() : 'N/A'} - 
              {form.movement_end ? new Date(form.movement_end).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "flow_readings",
      header: "Flow Readings",
      cell: ({ row }: any) => {
        const form = row.original
        const difference = (form.flow_meter_end_reading || 0) - (form.flow_meter_start_reading || 0)
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {form.flow_meter_start_reading} → {form.flow_meter_end_reading}
            </p>
            <Badge variant={difference > 0 ? "default" : "secondary"} className="text-xs">
              Δ {difference}
            </Badge>
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

  // Get latest form for display
  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null

  return (
    <ToolsDashboardLayout title="BMT Control Forms" subtitle="Bulk Milk Transfer control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">BMT Control Forms</h1>
            <p className="text-sm font-light text-muted-foreground">Manage bulk milk transfer control forms</p>
          </div>
          <LoadingButton 
            onClick={handleAddForm}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add BMT Form
          </LoadingButton>
        </div>

        {/* Current Form Details */}
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestForm ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Beaker className="h-4 w-4 text-white" />
                  </div>
                  <span>Current BMT Control Form</span>
                  <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-light">Latest</Badge>
                </div>
                <LoadingButton 
                  variant="outline" 
                  onClick={() => handleViewForm(latestForm)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </LoadingButton>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Beaker className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Product</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">{latestForm.product}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Volume</p>
                  </div>
                  <p className="text-lg font-light text-green-600">{latestForm.volume}L</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Created</p>
                  </div>
                  <p className="text-lg font-light">{latestForm.created_at ? new Date(latestForm.created_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'N/A'}</p>
                </div>
              </div>
              
              {/* Source and Destination Silo Details */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Source Silo Details */}
                {latestForm.bmt_control_form_source_silo_id_fkey && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Source Silo</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Name</span>
                        <span className="text-sm font-light text-blue-900">{latestForm.bmt_control_form_source_silo_id_fkey.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Capacity</span>
                        <span className="text-sm font-light">{latestForm.bmt_control_form_source_silo_id_fkey.capacity?.toLocaleString()}L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Location</span>
                        <span className="text-sm font-light">{latestForm.bmt_control_form_source_silo_id_fkey.location || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Destination Silo Details */}
                {latestForm.bmt_control_form_destination_silo_id_fkey && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Destination Silo</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Name</span>
                        <span className="text-sm font-light text-blue-900">{latestForm.bmt_control_form_destination_silo_id_fkey.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Capacity</span>
                        <span className="text-sm font-light">{latestForm.bmt_control_form_destination_silo_id_fkey.capacity?.toLocaleString()}L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Location</span>
                        <span className="text-sm font-light">{latestForm.bmt_control_form_destination_silo_id_fkey.location || 'N/A'}</span>
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
              <div className="text-lg font-light">BMT Control Forms</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search BMT forms..."
                filterFields={filterFields}
              />
              
              {loading ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable 
                  columns={columns} 
                  data={forms.map(form => ({
                    ...form,
                    id: undefined // Hide the ID from the data
                  }))} 
                  showSearch={false}
                  searchKey="product"
                />
              )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <BMTControlFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          form={selectedForm}
          mode={formMode} 
        />

        {/* View Drawer */}
        <BMTControlFormViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
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
          title="Delete BMT Control Form"
          description={`Are you sure you want to delete this BMT control form? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </ToolsDashboardLayout>
  )
}
