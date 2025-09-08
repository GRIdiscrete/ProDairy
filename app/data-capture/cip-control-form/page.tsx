"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Droplets, TrendingUp, FileText } from "lucide-react"
import { CIPControlFormDrawer } from "@/components/forms/cip-control-form-drawer"
import { CIPControlFormViewDrawer } from "@/components/forms/cip-control-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchCIPControlForms, 
  deleteCIPControlFormAction,
  clearError
} from "@/lib/store/slices/cipControlFormSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { CIPControlForm } from "@/lib/api/data-capture-forms"

export default function CIPControlFormPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.cipControlForms)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load CIP control forms on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchCIPControlForms())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchCIPControlForms())
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
  const [selectedForm, setSelectedForm] = useState<CIPControlForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for CIP control forms
  const filterFields = useMemo(() => [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      placeholder: "Select Status",
      options: [
        { label: "Draft", value: "Draft" },
        { label: "In Progress", value: "In Progress" },
        { label: "Completed", value: "Completed" },
        { label: "Approved", value: "Approved" }
      ]
    },
    {
      key: "machine_id",
      label: "Machine",
      type: "text" as const,
      placeholder: "Filter by machine"
    },
    {
      key: "operator_id", 
      label: "Operator",
      type: "text" as const,
      placeholder: "Filter by operator"
    },
    {
      key: "date",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    }
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: CIPControlForm) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: CIPControlForm) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: CIPControlForm) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return
    
    try {
      await dispatch(deleteCIPControlFormAction(selectedForm.id!)).unwrap()
      toast.success('CIP Control Form deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete CIP control form')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft": return "bg-gray-100 text-gray-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Completed": return "bg-green-100 text-green-800"
      case "Approved": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "form_info",
      header: "CIP Form",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{form.cip_control_form_machine_id_fkey?.name || `Machine: ${form.machine_id?.slice(0, 8)}...`}</span>
                <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {form.cip_control_form_operator_id_fkey 
                  ? `${form.cip_control_form_operator_id_fkey.first_name} ${form.cip_control_form_operator_id_fkey.last_name}`
                  : `Operator: ${form.operator_id?.slice(0, 8)}...`
                } • {form.date && new Date(form.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "solution_concentrations",
      header: "Solution Concentrations",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm font-medium text-orange-600">{form.caustic_solution_strength}%</p>
                <p className="text-xs text-gray-500">Caustic</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-red-600">{form.acid_solution_strength}%</p>
                <p className="text-xs text-gray-500">Acid</p>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "approval_info",
      header: "Approval & Verification",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {form.cip_control_form_approver_fkey?.role_name || form.approver}
            </p>
            <p className="text-xs text-gray-500">
              {form.cip_control_form_analyzer_fkey 
                ? `${form.cip_control_form_analyzer_fkey.first_name} ${form.cip_control_form_analyzer_fkey.last_name}`
                : form.analyzer
              } • {form.cip_control_form_checked_by_fkey 
                ? `${form.cip_control_form_checked_by_fkey.first_name} ${form.cip_control_form_checked_by_fkey.last_name}`
                : form.checked_by
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
    <DataCaptureDashboardLayout title="CIP Control Forms" subtitle="Cleaning in Place control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">CIP Control Forms</h1>
            <p className="text-muted-foreground">Manage cleaning in place control forms</p>
          </div>
          <LoadingButton onClick={handleAddForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add CIP Form
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
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{(forms || []).length}</div>
                  <p className="text-xs text-muted-foreground">Total entries</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Forms</CardTitle>
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
                    {(forms || []).filter((form) => 
                      form.created_at && new Date(form.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed today</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Droplets className="h-4 w-4 text-green-600" />
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
                    {(forms || []).filter((form) => form.status === "Completed").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed forms</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Droplets className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-orange-600">
                    {(forms || []).filter((form) => form.status === "In Progress").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Active cleaning</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CIP Control Forms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search CIP forms..."
              filterFields={filterFields}
            />
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading CIP forms...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={forms || []}
                showSearch={false}
              />
            )}
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <CIPControlFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          form={selectedForm}
          mode={formMode} 
        />

        {/* View Drawer */}
        <CIPControlFormViewDrawer
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
          title="Delete CIP Control Form"
          description={`Are you sure you want to delete this CIP control form? This action cannot be undone and may affect cleaning records.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}