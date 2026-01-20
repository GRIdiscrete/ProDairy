"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Droplets, TrendingUp, Clock, FlaskConical } from "lucide-react"
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
import { FormIdCopy } from "@/components/ui/form-id-copy"

export default function CIPControlFormPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.cipControlForms)
  const { items: users, isInitialized: usersInitialized } = useAppSelector((state) => state.users)
  const { roles, isInitialized: rolesInitialized } = useAppSelector((state) => state.roles)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)

  // Load initial data
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchCIPControlForms())
    }
  }, [dispatch, isInitialized])

  useEffect(() => {
    if (!usersInitialized) dispatch(fetchUsers({}))
    if (!rolesInitialized) dispatch(fetchRoles({}))
  }, [dispatch, usersInitialized, rolesInitialized])

  // Frontend Filtering Logic
  const filteredForms = useMemo(() => {
    if (!forms) return [];

    return forms.filter((form: CIPControlForm) => {
      // 1. Search filter (by tag or machine name)
      if (tableFilters.search) {
        const searchLower = tableFilters.search.toLowerCase();
        const tag = (form.tag || "").toLowerCase();
        const machine = (form.machine_id?.name || "").toLowerCase();
        if (!tag.includes(searchLower) && !machine.includes(searchLower)) return false;
      }

      // 2. Status filter
      if (tableFilters.status && tableFilters.status !== "all") {
        if (form.status !== tableFilters.status) return false;
      }

      // 3. Machine filter
      if (tableFilters.machine_id) {
        const machine = (form.machine_id?.name || "").toLowerCase();
        if (!machine.includes(tableFilters.machine_id.toLowerCase())) return false;
      }

      // 4. Operator filter
      if (tableFilters.operator_id) {
        const operatorName = form.cip_control_form_operator_id_fkey
          ? `${form.cip_control_form_operator_id_fkey.first_name} ${form.cip_control_form_operator_id_fkey.last_name}`.toLowerCase()
          : (form.operator_id || "").toLowerCase();
        if (!operatorName.includes(tableFilters.operator_id.toLowerCase())) return false;
      }

      // 5. Date Range filter
      if (tableFilters.dateRange) {
        const formDate = form.date ? new Date(form.date) : (form.created_at ? new Date(form.created_at) : null);
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

  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedForm, setSelectedForm] = useState<CIPControlForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

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
    }
  ], [])

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
      case "Draft": return "bg-gray-100 text-gray-800 border-gray-200"
      case "In Progress": return "bg-blue-50 text-blue-700 border-blue-100"
      case "Completed": return "bg-green-50 text-green-700 border-green-100"
      case "Approved": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-50 text-gray-600"
    }
  }

  const columns = [
    {
      accessorKey: "tag",
      header: "Form ID",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <FormIdCopy
            displayId={form.tag || "N/A"}
            actualId={form.tag || ""}
            size="sm"
          />
        )
      },
    },
    {
      accessorKey: "machine_or_silo",
      header: "Machine / Silo",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-sm">{form.machine_or_silo || form.machine_id?.name || form.silo_id?.name || 'N/A'}</span>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {form.date ? new Date(form.date).toLocaleDateString() : 'No date'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant="outline" className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "caustic_solution_strength",
      header: "Caustic (%)",
      cell: ({ row }: any) => <span className="text-sm font-light text-orange-600 font-medium">{row.original.caustic_solution_strength}%</span>,
    },
    {
      accessorKey: "acid_solution_strength",
      header: "Acid (%)",
      cell: ({ row }: any) => <span className="text-sm font-light text-red-600 font-medium">{row.original.acid_solution_strength}%</span>,
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
          <LoadingButton size="sm" onClick={() => handleViewForm(row.original)} className="bg-[#006BC4] text-white border-0 rounded-full h-8 w-8 p-0">
            <Eye className="w-4 h-4" />
          </LoadingButton>
          <LoadingButton size="sm" onClick={() => handleEditForm(row.original)} className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full h-8 w-8 p-0">
            <Edit className="w-4 h-4" />
          </LoadingButton>
          <LoadingButton variant="destructive" size="sm" onClick={() => handleDeleteForm(row.original)} className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full h-8 w-8 p-0">
            <Trash2 className="w-4 h-4" />
          </LoadingButton>
        </div>
      ),
    },
  ]

  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null

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

        {/* Latest Form Spotlight */}
        {!loading && latestForm && (
          <div className="border border-gray-200 rounded-xl bg-white border-l-4 border-l-[#006BC4] shadow-none">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Latest CIP Session</h3>
                    <FormIdCopy displayId={latestForm.tag || "N/A"} actualId={latestForm.tag || ""} size="sm" />
                  </div>
                </div>
                <Badge className={getStatusColor(latestForm.status)}>{latestForm.status}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Machine/Silo</p>
                  <p className="text-sm font-medium">{latestForm.machine_id?.name || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Caustic</p>
                  <p className="text-sm font-medium text-orange-600">{latestForm.caustic_solution_strength}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Acid</p>
                  <p className="text-sm font-medium text-red-600">{latestForm.acid_solution_strength}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Date</p>
                  <p className="text-sm font-medium">{latestForm.date ? new Date(latestForm.date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-none overflow-hidden">
          <div className="p-6 space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              searchPlaceholder="Search by tag or machine..."
              filterFields={filterFields}
            />

            {loading ? (
              <ContentSkeleton sections={1} cardsPerSection={4} />
            ) : (
              <DataTable
                columns={columns}
                data={filteredForms}
                showSearch={false}
              />
            )}
          </div>
        </div>

        <CIPControlFormDrawer open={formDrawerOpen} onOpenChange={setFormDrawerOpen} form={selectedForm} mode={formMode} />
        <CIPControlFormViewDrawer open={viewDrawerOpen} onClose={() => setViewDrawerOpen(false)} form={selectedForm} onEdit={() => { setViewDrawerOpen(false); handleEditForm(selectedForm!); }} />
        <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete CIP Control Form" description="Are you sure you want to delete this cleaning record?" onConfirm={confirmDelete} loading={operationLoading.delete} />
      </div>
    </ToolsDashboardLayout>
  )
}