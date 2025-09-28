"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams } from "next/navigation"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Factory, TrendingUp, FileText, Clock, Package, ArrowRight, Beaker, Sun, Moon } from "lucide-react"
import { FilmaticLinesForm1Drawer } from "@/components/forms/filmatic-lines-form-1-drawer"
import { FilmaticLinesForm1ViewDrawer } from "@/components/forms/filmatic-lines-form-1-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchFilmaticLinesForm1s, 
  deleteFilmaticLinesForm1,
  clearError
} from "@/lib/store/slices/filmaticLinesForm1Slice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { FilmaticLinesForm1 } from "@/lib/api/filmatic-lines-form-1"
import ContentSkeleton from "@/components/ui/content-skeleton"

export default function FilmaticLines1Page() {
  const params = useParams()
  const processId = params.process_id as string
  
  const dispatch = useAppDispatch()
  const { forms, loading, error, isInitialized } = useAppSelector((state) => state.filmaticLinesForm1)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load Filmatic lines form 1 data on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchFilmaticLinesForm1s())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchFilmaticLinesForm1s())
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
  const [selectedForm, setSelectedForm] = useState<FilmaticLinesForm1 | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for Filmatic Lines Form 1
  const filterFields = useMemo(() => [
    {
      key: "created_at",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "holding_tank_bmt",
      label: "Holding Tank",
      type: "text" as const,
      placeholder: "Filter by holding tank"
    },
    {
      key: "approved",
      label: "Status",
      type: "select" as const,
      placeholder: "Filter by approval status",
      options: [
        { value: "true", label: "Approved" },
        { value: "false", label: "Pending" }
      ]
    }
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: FilmaticLinesForm1) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: FilmaticLinesForm1) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: FilmaticLinesForm1) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return
    
    try {
      await dispatch(deleteFilmaticLinesForm1(selectedForm.id)).unwrap()
      toast.success('Filmatic Lines Form 1 deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete Filmatic Lines Form 1')
    }
  }

  // Get latest form for display
  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null

  if (loading.fetch) {
    return (
      <DataCaptureDashboardLayout title="Filmatic Lines Form 1" subtitle="Filmatic lines form 1 production control and monitoring">
        <ContentSkeleton sections={1} cardsPerSection={4} />
      </DataCaptureDashboardLayout>
    )
  }

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
              <Factory className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">#{form.id.slice(0, 8)}</span>
                <Badge className={`${form.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} font-light`}>
                  {form.approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(form.created_at).toLocaleDateString()} • {form.holding_tank_bmt}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "bottle_counts",
      header: "Bottle Counts",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-light">Bottles</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Day Shift</span>
                <span className="text-xs font-light">{form.day_shift_opening_bottles} → {form.day_shift_closing_bottles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Night Shift</span>
                <span className="text-xs font-light">{form.night_shift_opening_bottles} → {form.night_shift_closing_bottles}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "waste_info",
      header: "Waste",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-red-600" />
              </div>
              <span className="text-sm font-light">Waste</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Day Shift</span>
                <span className="text-xs font-light text-red-600">{form.day_shift_waste_bottles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Night Shift</span>
                <span className="text-xs font-light text-red-600">{form.night_shift_waste_bottles}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "shifts_info",
      header: "Shifts",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                <Sun className="h-3 w-3 text-yellow-600" />
              </div>
              <span className="text-sm font-light">Shifts</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Day</span>
                <span className="text-xs font-light text-green-600">{form.day_shift_id ? 'Completed' : 'Pending'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Night</span>
                <span className="text-xs font-light text-blue-600">{form.night_shift_id ? 'Completed' : 'Pending'}</span>
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
              loading={loading.delete}
              disabled={loading.delete}
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
    <DataCaptureDashboardLayout title="Filmatic Lines Form 1" subtitle="Filmatic lines form 1 production control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Filmatic Lines Form 1</h1>
            <p className="text-sm font-light text-muted-foreground">Manage Filmatic lines form 1 production data and process control</p>
          </div>
          <LoadingButton 
            onClick={handleAddForm}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Filmatic Lines Form 1
          </LoadingButton>
        </div>

        {/* Current Form Details */}
        {loading.fetch ? (
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
        ) : latestForm ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Factory className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Filmatic Lines Form 1</span>
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
                    <Factory className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Holding Tank</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">{latestForm.holding_tank_bmt}</p>
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
                    <p className="text-sm font-light text-gray-600">Status</p>
                  </div>
                  <Badge className={`${latestForm.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} font-light`}>
                    {latestForm.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
              </div>
              
              {/* Process Flow Information */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Bottle Summary */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Bottle Summary</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Day Shift</span>
                      <span className="text-xs font-light text-blue-600">{latestForm.day_shift_opening_bottles} → {latestForm.day_shift_closing_bottles}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Night Shift</span>
                      <span className="text-xs font-light text-blue-600">{latestForm.night_shift_opening_bottles} → {latestForm.night_shift_closing_bottles}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Total Waste</span>
                      <span className="text-xs font-light text-red-600">{latestForm.day_shift_waste_bottles + latestForm.night_shift_waste_bottles}</span>
                    </div>
                  </div>
                </div>

                {/* Shift Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Shift Status</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Day Shift</span>
                      <span className="text-xs font-light text-green-600">{latestForm.day_shift_id ? 'Completed' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Night Shift</span>
                      <span className="text-xs font-light text-blue-600">{latestForm.night_shift_id ? 'Completed' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Approval</span>
                      <span className="text-xs font-light text-purple-600">{latestForm.approved ? 'Approved' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Data Table */}
        {!loading.fetch && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Filmatic Lines Form 1 Records</div>
            </div>
            <div className="p-6 space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search Filmatic lines form 1 records..."
              filterFields={filterFields}
            />
            
            {loading.fetch ? (
              <ContentSkeleton sections={1} cardsPerSection={4} />
            ) : (
              <DataTable columns={columns} data={forms} showSearch={false} />
            )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <FilmaticLinesForm1Drawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          form={selectedForm}
          mode={formMode}
          processId={processId}
        />

        {/* View Drawer */}
        <FilmaticLinesForm1ViewDrawer
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
          title="Delete Filmatic Lines Form 1"
          description={`Are you sure you want to delete this Filmatic lines form 1 record? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={loading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
