"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, ArrowRight, Package, Clock, Hash } from "lucide-react"
import { FormIdCopy } from "@/components/ui/form-id-copy"
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

export default function ISTControlFormPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.istControlForms)
  const { items: users } = useAppSelector((state) => state.users)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)

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

  // Frontend Filtering Logic
  const filteredForms = useMemo(() => {
    if (!forms) return [];

    return forms.filter((form: ISTControlForm) => {
      // 1. Search filter (item code, description, warehouses)
      if (tableFilters.search) {
        const searchLower = tableFilters.search.toLowerCase();
        const itemCode = (form.item_code || "").toLowerCase();
        const itemDesc = (form.item_description || "").toLowerCase();
        const tag = ((form as any).tag || "").toLowerCase();

        if (!itemCode.includes(searchLower) &&
          !itemDesc.includes(searchLower) &&
          !tag.includes(searchLower)) return false;
      }

      // 2. Item Code filter
      if (tableFilters.item_code && !form.item_code?.toLowerCase().includes(tableFilters.item_code.toLowerCase())) return false;

      // 3. Warehouse filters
      if (tableFilters.from_warehouse && !form.from_warehouse?.toLowerCase().includes(tableFilters.from_warehouse.toLowerCase())) return false;
      if (tableFilters.to_warehouse && !form.to_warehouse?.toLowerCase().includes(tableFilters.to_warehouse.toLowerCase())) return false;

      // 4. Date Range filter
      if (tableFilters.dateRange) {
        const formDate = form.created_at ? new Date(form.created_at) : null;
        if (formDate) {
          if (tableFilters.dateRange.from) {
            const from = new Date(tableFilters.dateRange.from);
            from.setHours(0, 0, 0, 0);
            if (formDate < from) return false;
          }
          if (tableFilters.dateRange.to) {
            const to = new Date(tableFilters.dateRange.to);
            to.setHours(23, 59, 59, 999);
            if (formDate > to) return false;
          }
        } else if (tableFilters.dateRange.from || tableFilters.dateRange.to) {
          return false;
        }
      }

      return true;
    });
  }, [forms, tableFilters]);

  // Handle errors
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

  const filterFields = useMemo(() => [
    {
      key: "item_code",
      label: "Item Code",
      type: "text" as const,
      placeholder: "Filter by item code"
    },
    {
      key: "from_warehouse",
      label: "From Warehouse",
      type: "text" as const,
      placeholder: "Source Warehouse"
    },
    {
      key: "to_warehouse",
      label: "To Warehouse",
      type: "text" as const,
      placeholder: "Dest Warehouse"
    }
  ], [])

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

  const columns = [
    {
      accessorKey: "item_code",
      header: "Form ID",
      cell: ({ row }: any) => (
        <FormIdCopy displayId={row.original.tag || row.original.id} actualId={row.original.tag || row.original.id} size="sm" />
      ),
    },
    {
      accessorKey: "item_code",
      header: "Code",
      cell: ({ row }: any) => <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 border-blue-100">{row.original.item_code}</Badge>,
    },
    {
      accessorKey: "item_description",
      header: "Description",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">{row.original.item_description}</span>
        </div>
      ),
    },
    {
      accessorKey: "from_warehouse",
      header: "Transfer",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-50 rounded border text-gray-600 font-medium">{row.original.from_warehouse}</span>
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <span className="px-2 py-1 bg-green-50 rounded border border-green-100 text-green-700 font-medium">{row.original.to_warehouse}</span>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => (
        <div className="text-xs text-gray-500">
          {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : 'N/A'}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <LoadingButton size="sm" onClick={() => handleViewForm(row.original)} className="bg-[#006BC4] text-white border-0 rounded-full h-8 w-8 p-0"><Eye className="w-4 h-4" /></LoadingButton>
          <LoadingButton size="sm" onClick={() => handleEditForm(row.original)} className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full h-8 w-8 p-0"><Edit className="w-4 h-4" /></LoadingButton>
          <LoadingButton variant="destructive" size="sm" onClick={() => handleDeleteForm(row.original)} className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></LoadingButton>
        </div>
      ),
    },
  ]

  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null

  return (
    <ToolsDashboardLayout title="IST Control Forms" subtitle="Item Stock Transfer control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">IST Control Forms</h1>
            <p className="text-sm font-light text-muted-foreground">Manage item stock transfer control forms</p>
          </div>
          <LoadingButton onClick={handleAddForm} className="bg-[#006BC4] text-white border-0 rounded-full px-6 py-2 font-light">
            <Plus className="mr-2 h-4 w-4" /> Add IST Form
          </LoadingButton>
        </div>

        {/* Latest IST Spotlight */}
        {!loading && latestForm && (
          <div className="border border-gray-200 rounded-xl bg-white border-l-4 border-l-[#006BC4] shadow-none flex flex-col md:flex-row">
            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium text-gray-900">{latestForm.item_description}</h3>
                    <FormIdCopy displayId={(latestForm as any).tag || latestForm.id || ""} actualId={(latestForm as any).tag || latestForm.id || ""} size="sm" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">CODE: {latestForm.item_code}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">From</p>
                    <p className="text-sm font-medium">{latestForm.from_warehouse}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">To</p>
                    <p className="text-sm font-medium text-green-600">{latestForm.to_warehouse}</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Movement Type</p>
                  <p className="text-sm font-medium">{latestForm.item_trans}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-l border-gray-100 flex flex-col justify-center gap-2 min-w-[200px]">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-medium">{new Date(latestForm.created_at!).toLocaleString()}</p>
              </div>
              <LoadingButton onClick={() => handleViewForm(latestForm)} variant="outline" size="sm" className="rounded-full text-xs">View Details</LoadingButton>
            </div>
          </div>
        )}

        <div className="border border-gray-200 rounded-xl bg-white shadow-none overflow-hidden">
          <div className="p-6 space-y-4">
            <DataTableFilters filters={tableFilters} onFiltersChange={setTableFilters} searchPlaceholder="Search by code, description or warehouse..." filterFields={filterFields} />
            {loading ? <ContentSkeleton sections={1} cardsPerSection={4} /> : <DataTable columns={columns} data={filteredForms} showSearch={false} />}
          </div>
        </div>

        <ISTControlFormDrawer open={formDrawerOpen} onOpenChange={setFormDrawerOpen} form={selectedForm} mode={formMode} />
        <ISTControlFormViewDrawer open={viewDrawerOpen} onOpenChange={setViewDrawerOpen} form={selectedForm} users={users} />
        <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} title="Delete IST Control Form" description="Are you sure you want to delete this transfer record?" loading={operationLoading.delete} />
      </div>
    </ToolsDashboardLayout>
  )
}