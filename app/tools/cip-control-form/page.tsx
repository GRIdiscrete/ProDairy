"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Droplets, TrendingUp, FileText, Clock, FlaskConical } from "lucide-react"
import { CIPControlFormDrawer } from "@/components/forms/cip-control-form-drawer"
import { CIPControlFormViewDrawer } from "@/components/forms/cip-control-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchCIPControlForms, 
  deleteCIPControlFormAction,
  clearError
} from "@/lib/store/slices/cipControlFormSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchRoles } from "@/lib/store/slices/rolesSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { CIPControlForm } from "@/lib/api/data-capture-forms"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { ToolsDashboardLayout } from "@/components/layout/tools-dashboard-layout"
import { useRouter, useSearchParams } from "next/navigation"

export default function CIPControlFormPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.cipControlForms)
  const { items: users, isInitialized: usersInitialized } = useAppSelector((state) => state.users)
  const { roles, isInitialized: rolesInitialized } = useAppSelector((state) => state.roles)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  const hasUsersFetchedRef = useRef(false)
  const hasRolesFetchedRef = useRef(false)
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // Helper function to get user by ID
  const getUserById = (userId: string) => {
    return users.find((user: any) => user.id === userId)
  }

  // Helper function to get role by ID
  const getRoleById = (roleId: string) => {
    return roles.find((role: any) => role.id === roleId)
  }

  // Load CIP control forms on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchCIPControlForms())
    }
  }, [dispatch, isInitialized])
  
  // Load users
  useEffect(() => {
    if (!usersInitialized && !hasUsersFetchedRef.current) {
      hasUsersFetchedRef.current = true
      dispatch(fetchUsers())
    }
  }, [dispatch, usersInitialized])
  
  // Load roles
  useEffect(() => {
    if (!rolesInitialized && !hasRolesFetchedRef.current) {
      hasRolesFetchedRef.current = true
      dispatch(fetchRoles())
    }
  }, [dispatch, rolesInitialized])
  
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
      case "Approved": return "bg-green-100 text-green-800"
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
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">{form.machine_or_silo || form.machine_id?.name || form.silo_id?.name || 'N/A'}</span>
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
                <p className="text-sm font-light text-orange-600">{form.caustic_solution_strength}%</p>
                <p className="text-xs text-gray-500">Caustic</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-light text-red-600">{form.acid_solution_strength}%</p>
                <p className="text-xs text-gray-500">Acid</p>
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
               
              size="sm" 
              onClick={() => handleViewForm(form)}
              className="bg-[#006BC4] text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
               
              size="sm" 
              onClick={() => handleEditForm(form)}
              className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteForm(form)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
              className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full"
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

  // --- Helper: open view drawer if form_id query param is present ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const formId = searchParams?.get("form_id");
    if (formId && forms && forms.length > 0) {
      const foundForm = forms.find((form: any) => String(form.id) === String(formId));
      if (foundForm) {
        setSelectedForm(foundForm);
        setViewDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forms]);

  return (
    <ToolsDashboardLayout title="CIP Control Forms" subtitle="Cleaning in Place control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">CIP Control Forms</h1>
            <p className="text-sm font-light text-muted-foreground">Manage cleaning in place control forms</p>
          </div>
          <LoadingButton 
            onClick={handleAddForm}
            className="bg-[#006BC4] text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add CIP Form
          </LoadingButton>
        </div>

        {/* Current Form Details */}
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestForm ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4]">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <span>Current CIP Control Form</span>
                  <Badge className="text-white font-light">Latest</Badge>
                </div>
                <LoadingButton 
                   
                  onClick={() => handleViewForm(latestForm)}
                  className="bg-[#006BC4] text-white border-0 rounded-full px-4 py-2 font-light text-sm"
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
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">{latestForm.machine_id ? 'Machine' : latestForm.silo_id ? 'Silo' : 'Machine/Silo'}</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">{latestForm.machine_or_silo || latestForm.machine_id?.name || latestForm.silo_id?.name || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Status</p>
                  </div>
                  <Badge className={getStatusColor(latestForm.status)}>{latestForm.status}</Badge>
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
              
              {/* Solution Concentrations */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <FlaskConical className="h-4 w-4 text-orange-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Caustic Solution</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Strength</span>
                      <span className="text-sm font-light text-orange-600">{latestForm.caustic_solution_strength}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <FlaskConical className="h-4 w-4 text-red-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Acid Solution</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Strength</span>
                      <span className="text-sm font-light text-red-600">{latestForm.acid_solution_strength}%</span>
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
              <div className="text-lg font-light">CIP Control Forms</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search CIP forms..."
                filterFields={filterFields}
              />
              
              {loading ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable 
                  columns={columns} 
                  data={forms} 
                  showSearch={false}
                  searchKey="status"
                />
              )}
            </div>
          </div>
        )}

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
          users={users}
          roles={roles}
          getUserById={getUserById}
          getRoleById={getRoleById}
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
    </ToolsDashboardLayout>
  )
}