"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Droplets, TrendingUp, FileText, Clock, Truck, Package } from "lucide-react"
import { RawMilkIntakeFormDrawer } from "@/components/forms/raw-milk-intake-form-drawer"
import { RawMilkIntakeFormViewDrawer } from "@/components/forms/raw-milk-intake-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchRawMilkIntakeForms, 
  deleteRawMilkIntakeForm,
  clearError
} from "@/lib/store/slices/rawMilkIntakeSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { RawMilkIntakeForm } from "@/lib/api/raw-milk-intake"
import ContentSkeleton from "@/components/ui/content-skeleton"

export default function RawMilkIntakePage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.rawMilkIntake)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load raw milk intake forms on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchRawMilkIntakeForms())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchRawMilkIntakeForms())
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
  const [selectedForm, setSelectedForm] = useState<RawMilkIntakeForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for Raw Milk Intake
  const filterFields = useMemo(() => [
    {
      key: "date",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "destination_silo_id",
      label: "Destination Silo",
      type: "text" as const,
      placeholder: "Filter by destination silo"
    },
    {
      key: "drivers_form_id",
      label: "Driver Form ID",
      type: "text" as const,
      placeholder: "Filter by driver form"
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

  const handleEditForm = (form: RawMilkIntakeForm) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: RawMilkIntakeForm) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: RawMilkIntakeForm) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return
    
    try {
      await dispatch(deleteRawMilkIntakeForm(selectedForm.id)).unwrap()
      toast.success('Raw Milk Intake Form deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete raw milk intake form')
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
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">#{form.id.slice(0, 8)}</span>
                <Badge className="bg-blue-100 text-blue-800 font-light">{form.quantity_received}L</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(form.date).toLocaleDateString()} • {form.samples_collected?.length || 0} samples
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "driver_info",
      header: "Driver Form",
      cell: ({ row }: any) => {
        const form = row.original
        const driverForm = form.raw_milk_intake_form_drivers_form_id_fkey
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-light">Driver Form</span>
            </div>
            {driverForm ? (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  {new Date(driverForm.start_date).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${driverForm.delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {driverForm.delivered ? 'Delivered' : 'Pending'}
                  </Badge>
                  {driverForm.rejected && (
                    <Badge className="text-xs bg-red-100 text-red-800">Rejected</Badge>
                  )}
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
      accessorKey: "destination",
      header: "Destination Silo",
      cell: ({ row }: any) => {
        const form = row.original
        const silo = form.raw_milk_intake_form_destination_silo_id_fkey
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-green-600" />
              </div>
              <p className="text-sm font-light">
                {silo ? silo.name : `Silo #${form.destination_silo_id.slice(0, 8)}`}
              </p>
            </div>
            {silo ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Capacity</span>
                  <span className="text-xs font-light">{silo.capacity.toLocaleString()}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Current</span>
                  <span className="text-xs font-light text-green-600">{silo.milk_volume.toLocaleString()}L</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full"
                    style={{ 
                      width: `${Math.min((silo.milk_volume / silo.capacity) * 100, 100)}%` 
                    }}
                  ></div>
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
      accessorKey: "samples",
      header: "Samples",
      cell: ({ row }: any) => {
        const form = row.original
        const totalAmount = form.samples_collected?.reduce((sum: number, sample: any) => sum + sample.amount_collected, 0) || 0
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-purple-600" />
              </div>
              <p className="text-sm font-light">{form.samples_collected?.length || 0} samples</p>
            </div>
            <p className="text-xs text-gray-500">
              Total: {totalAmount.toFixed(1)}L
            </p>
            {form.samples_collected && form.samples_collected.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {form.samples_collected.slice(0, 2).map((sample: any, index: number) => (
                  <Badge key={index} className="text-xs bg-green-100 text-green-800">
                    {sample.serial_no.slice(0, 6)}
                  </Badge>
                ))}
                {form.samples_collected.length > 2 && (
                  <Badge className="text-xs bg-gray-100 text-gray-600">
                    +{form.samples_collected.length - 2}
                  </Badge>
                )}
              </div>
            )}
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
    <DataCaptureDashboardLayout title="Raw Milk Intake" subtitle="Raw milk intake control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Raw Milk Intake</h1>
            <p className="text-sm font-light text-muted-foreground">Manage raw milk intake forms and samples</p>
          </div>
          <LoadingButton 
            onClick={handleAddForm}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Intake Form
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
                    <Droplets className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Raw Milk Intake</span>
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
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Quantity Received</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">{latestForm.quantity_received}L</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Date</p>
                  </div>
                  <p className="text-lg font-light">{new Date(latestForm.date).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Samples</p>
                  </div>
                  <p className="text-lg font-light text-green-600">{latestForm.samples_collected?.length || 0} samples</p>
                </div>
              </div>
              
              {/* Driver Form and Silo Details in Row */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Driver Form Details */}
                {latestForm.raw_milk_intake_form_drivers_form_id_fkey && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Driver Form</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Form ID</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-light">#{latestForm.drivers_form_id.slice(0, 8)}</span>
                          <CopyButton text={latestForm.drivers_form_id} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Start Date</span>
                        <span className="text-xs font-light">
                          {new Date(latestForm.raw_milk_intake_form_drivers_form_id_fkey.start_date).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Status</span>
                        <Badge className={`text-xs ${latestForm.raw_milk_intake_form_drivers_form_id_fkey.delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {latestForm.raw_milk_intake_form_drivers_form_id_fkey.delivered ? 'Delivered' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Silo Details */}
                {latestForm.raw_milk_intake_form_destination_silo_id_fkey && (
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
                        <span className="text-xs font-light text-blue-900">{latestForm.raw_milk_intake_form_destination_silo_id_fkey.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Capacity</span>
                        <span className="text-xs font-light">{latestForm.raw_milk_intake_form_destination_silo_id_fkey.capacity.toLocaleString()}L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Current Volume</span>
                        <span className="text-xs font-light text-green-600">{latestForm.raw_milk_intake_form_destination_silo_id_fkey.milk_volume.toLocaleString()}L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Expected New</span>
                        <span className="text-xs font-light text-orange-600">
                          {(latestForm.raw_milk_intake_form_destination_silo_id_fkey.milk_volume + latestForm.quantity_received).toLocaleString()}L
                        </span>
                      </div>
                      
                      {/* Capacity Bar */}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs font-light text-gray-600 mb-1">
                          <span>Usage</span>
                          <span>{Math.round((latestForm.raw_milk_intake_form_destination_silo_id_fkey.milk_volume / latestForm.raw_milk_intake_form_destination_silo_id_fkey.capacity) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((latestForm.raw_milk_intake_form_destination_silo_id_fkey.milk_volume / latestForm.raw_milk_intake_form_destination_silo_id_fkey.capacity) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
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
              <div className="text-lg font-light">Raw Milk Intake Forms</div>
            </div>
            <div className="p-6 space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search intake forms..."
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
        <RawMilkIntakeFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          form={selectedForm}
          mode={formMode} 
        />

        {/* View Drawer */}
        <RawMilkIntakeFormViewDrawer
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
          title="Delete Raw Milk Intake Form"
          description={`Are you sure you want to delete this raw milk intake form? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
