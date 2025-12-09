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
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { UserAvatar } from "@/components/ui/user-avatar"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { ISTControlForm } from "@/lib/api/data-capture-forms"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { ToolsDashboardLayout } from "@/components/layout/tools-dashboard-layout"
import { useRouter, useSearchParams } from "next/navigation"

export default function ISTControlFormPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.istControlForms)
  const { items: users } = useAppSelector((state) => state.users)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // Helper function to get user by ID
  const getUserById = (userId: string) => {
    if (!users || !Array.isArray(users)) return null
    return users.find((user: any) => user.id === userId)
  }

  // Load IST control forms and users on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchISTControlForms())
      dispatch(fetchUsers({}))
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

  // Get latest form for display
  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null

  // Table columns with actions
  const columns = [
    {
      accessorKey: "form_info",
      header: "IST Form",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">{form.item_description}</span>
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
              <span className="text-sm font-light">{form.item_trans}</span>
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
        const issuedByUser = form.ist_control_form_issued_by_fkey || getUserById(form.issued_by)
        const receivedByUser = form.ist_control_form_received_by_fkey || getUserById(form.received_by)
        
        return (
          <div className="space-y-2">
            {issuedByUser ? (
              <div>
                <p className="text-xs text-gray-500 mb-1">Issued:</p>
                <UserAvatar user={issuedByUser} size="sm" showName={true} showEmail={true} showDropdown={true} />
              </div>
            ) : (
              <p className="text-sm font-light text-gray-500">Issued: Unknown</p>
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

  // --- Helper: open view drawer if form_id query param is present ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isInitialized || !forms || forms.length === 0) return;
    const formId = searchParams?.get("form_id");
    if (formId) {
      const foundForm = forms.find((form: any) => String(form.id) === String(formId));
      if (foundForm) {
        setSelectedForm(foundForm);
        setViewDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, forms]);

  return (
    <ToolsDashboardLayout title="IST Control Forms" subtitle="Item Stock Transfer control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">IST Control Forms</h1>
            <p className="text-sm font-light text-muted-foreground">Manage item stock transfer control forms</p>
          </div>
          <LoadingButton 
            onClick={handleAddForm}
            className="bg-[#006BC4] text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add IST Form
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
                    <Package className="h-4 w-4" />
                  </div>
                  <span>Current IST Control Form</span>
                  <Badge className="text-white font-light">Latest</Badge>
                </div>
                <LoadingButton 
                   
                  onClick={() => handleViewForm(latestForm)}
                  className=" text-white border-0 rounded-full px-4 py-2 font-light text-sm"
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
                    <Package className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Item</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">{latestForm.item_description}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Transfer</p>
                  </div>
                  <p className="text-lg font-light text-green-600">{latestForm.from_warehouse} → {latestForm.to_warehouse}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Created</p>
                  </div>
                  <p className="text-lg font-light">{latestForm.created_at ? new Date(latestForm.created_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'N/A'}</p>
                </div>
              </div>
              
              {/* Item Details */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Item Code</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Code</span>
                      <span className="text-sm font-light text-blue-600">{latestForm.item_code}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Transaction</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Type</span>
                      <span className="text-sm font-light text-green-600">{latestForm.item_trans}</span>
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
              <div className="text-lg font-light">IST Control Forms</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search IST forms..."
                filterFields={filterFields}
              />
              
              {loading ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable 
                  columns={columns} 
                  data={forms} 
                  showSearch={false}
                  searchKey="item_description"
                />
              )}
            </div>
          </div>
        )}
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
        users={users}
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
    </ToolsDashboardLayout>
  )
}