"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Package, TrendingUp, FileText, ArrowRight } from "lucide-react"
import { ISTControlFormDrawer } from "@/components/forms/ist-control-form-drawer"
import { ISTControlFormViewDrawer } from "@/components/forms/ist-control-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchISTControlForms, 
  deleteISTControlFormAction,
  clearError
} from "@/lib/store/slices/istControlFormSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { ISTControlForm } from "@/lib/api/data-capture-forms"
import ContentSkeleton from "@/components/ui/content-skeleton"

export default function ISTControlFormPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.istControlForms)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load IST control forms on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchISTControlForms())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchISTControlForms())
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
  const [selectedForm, setSelectedForm] = useState<ISTControlForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for IST control forms
  const filterFields = useMemo(() => [
    {
      key: "item_code",
      label: "Item Code",
      type: "text" as const,
      placeholder: "Filter by item code"
    },
    {
      key: "item_description",
      label: "Item Description",
      type: "text" as const,
      placeholder: "Filter by item description"
    },
    {
      key: "from_warehouse",
      label: "From Warehouse",
      type: "text" as const,
      placeholder: "Filter by source warehouse"
    },
    {
      key: "to_warehouse",
      label: "To Warehouse",
      type: "text" as const,
      placeholder: "Filter by destination warehouse"
    },
    {
      key: "issued_by",
      label: "Issued By",
      type: "text" as const,
      placeholder: "Filter by issuer"
    }
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: ISTControlForm) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: ISTControlForm) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: ISTControlForm) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return
    
    try {
      await dispatch(deleteISTControlFormAction(selectedForm.id!)).unwrap()
      toast.success('IST Control Form deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete IST control form')
    }
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "form_info",
      header: "IST Form",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{form.item_description}</span>
                <Badge className="bg-blue-100 text-blue-800">{form.item_code}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {form.from_warehouse} → {form.to_warehouse}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "transfer_details",
      header: "Transfer Details",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{form.item_trans}</span>
            </div>
            <p className="text-xs text-gray-500">
              {form.from_warehouse} → {form.to_warehouse}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "personnel",
      header: "Personnel",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Issued: {form.ist_control_form_issued_by_fkey
                ? `${form.ist_control_form_issued_by_fkey.first_name} ${form.ist_control_form_issued_by_fkey.last_name}`
                : `User: ${form.issued_by?.slice(0, 8)}...`
              }
            </p>
            <p className="text-xs text-gray-500">
              Received: {form.ist_control_form_received_by_fkey
                ? `${form.ist_control_form_received_by_fkey.first_name} ${form.ist_control_form_received_by_fkey.last_name}`
                : `User: ${form.received_by?.slice(0, 8)}...`
              }
            </p>
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
            <p className="text-sm font-medium">
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
            <LoadingButton variant="outline" size="sm" onClick={() => handleViewForm(form)}>
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton variant="outline" size="sm" onClick={() => handleEditForm(form)}>
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteForm(form)}
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
    <DataCaptureDashboardLayout title="IST Control Forms" subtitle="Item Stock Transfer control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">IST Control Forms</h1>
            <p className="text-muted-foreground">Manage item stock transfer control forms</p>
          </div>
          <LoadingButton onClick={handleAddForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add IST Form
          </LoadingButton>
        </div>

        {/* Counter Widgets with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(forms) ? forms.length : 0}</div>
              <p className="text-xs text-muted-foreground">
                All IST control forms
              </p>
            </CardContent>
          </Card>
          
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Transfers</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(forms) ? forms.length : 0}</div>
              <p className="text-xs text-muted-foreground">
                Recent transfers
              </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">
                {Array.isArray(forms) ? forms.filter(form => {
                  if (!form.created_at) return false
                  const formDate = new Date(form.created_at)
                  const now = new Date()
                  return formDate.getMonth() === now.getMonth() && formDate.getFullYear() === now.getFullYear()
                }).length : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Forms created this month
              </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">
                {Array.isArray(forms) ? new Set([...forms.map(f => f.from_warehouse), ...forms.map(f => f.to_warehouse)]).size : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique warehouses
              </p>
              </CardContent>
            </Card>
          </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>IST Control Forms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search IST forms..."
              filterOptions={filterFields}
            />
            
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : (
              <DataTable
                columns={columns}
                data={Array.isArray(forms) ? forms : []}
                showSearch={false}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Drawer */}
      <ISTControlFormDrawer
        open={formDrawerOpen}
        onOpenChange={setFormDrawerOpen}
        form={selectedForm}
        mode={formMode}
      />

      {/* View Drawer */}
      <ISTControlFormViewDrawer
        open={viewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
        form={selectedForm}
      />
        
        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
        title="Delete IST Control Form"
        description="Are you sure you want to delete this IST control form? This action cannot be undone."
          loading={operationLoading.delete}
        />
    </DataCaptureDashboardLayout>
  )
}