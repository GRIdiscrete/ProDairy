"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Droplets, Clock } from "lucide-react"
import { FormIdCopy } from "@/components/ui/form-id-copy"
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
import { UserAvatar } from "@/components/ui/user-avatar"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { CIPControlForm } from "@/lib/api/data-capture-forms"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { ToolsDashboardLayout } from "@/components/layout/tools-dashboard-layout"
import { rolesApi } from "@/lib/api/roles"

export default function CIPControlFormPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.cipControlForms)
  const { items: users } = useAppSelector((state) => state.users)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const [roles, setRoles] = useState<any[]>([])
  const hasFetchedRef = useRef(false)

  const getUserById = (userId: string) => {
    if (!users || !Array.isArray(users)) return null
    return users.find((user: any) => user.id === userId)
  }

  const getRoleById = (roleId: string) => {
    return roles.find((role: any) => role.id === roleId)
  }

  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchCIPControlForms())
      dispatch(fetchUsers({}))
      rolesApi.getRoles().then((res) => setRoles(res.data || [])).catch(() => {})
    }
  }, [dispatch, isInitialized])

  const filteredForms = useMemo(() => {
    if (!forms) return []

    return forms.filter((form: CIPControlForm) => {
      if (tableFilters.search) {
        const searchLower = tableFilters.search.toLowerCase()
        const tag = ((form as any).tag || "").toLowerCase()
        const status = (form.status || "").toLowerCase()
        const machineName = (typeof form.machine_id === "object" ? form.machine_id?.name : "").toLowerCase()
        if (!tag.includes(searchLower) && !status.includes(searchLower) && !machineName.includes(searchLower)) return false
      }

      if (tableFilters.status && tableFilters.status !== "all") {
        if (form.status !== tableFilters.status) return false
      }

      if (tableFilters.dateRange) {
        const formDate = form.date ? new Date(form.date) : null
        if (formDate) {
          if (tableFilters.dateRange.from) {
            const from = new Date(tableFilters.dateRange.from)
            from.setHours(0, 0, 0, 0)
            if (formDate < from) return false
          }
          if (tableFilters.dateRange.to) {
            const to = new Date(tableFilters.dateRange.to)
            to.setHours(23, 59, 59, 999)
            if (formDate > to) return false
          }
        } else if (tableFilters.dateRange.from || tableFilters.dateRange.to) {
          return false
        }
      }

      return true
    })
  }, [forms, tableFilters])

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
      placeholder: "All statuses",
      options: [
        { label: "Draft", value: "Draft" },
        { label: "In Progress", value: "In Progress" },
        { label: "Completed", value: "Completed" },
        { label: "Approved", value: "Approved" },
      ]
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
      toast.success("CIP Control Form deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || "Failed to delete CIP control form")
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Approved": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const columns = [
    {
      accessorKey: "tag",
      header: "Form ID",
      cell: ({ row }: any) => (
        <FormIdCopy displayId={row.original.tag || row.original.id} actualId={row.original.tag || row.original.id} size="sm" />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={`font-light text-xs ${getStatusClass(row.original.status)}`}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "machine_id",
      header: "Machine",
      cell: ({ row }: any) => {
        const machine = typeof row.original.machine_id === "object" ? row.original.machine_id : null
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-light">{machine?.name || "N/A"}</p>
              <p className="text-[10px] text-gray-400">{machine?.serial_number || ""}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "operator_id",
      header: "Operator",
      cell: ({ row }: any) => {
        const operator = getUserById(row.original.operator_id)
        return operator
          ? <UserAvatar user={operator} size="sm" showName />
          : <span className="text-xs text-gray-400">{row.original.operator_id?.slice(0, 8)}…</span>
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => (
        <span className="text-sm text-gray-600">
          {row.original.date ? new Date(row.original.date).toLocaleDateString() : "N/A"}
        </span>
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
    <ToolsDashboardLayout title="CIP Control Forms" subtitle="Clean-In-Place control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">CIP Control Forms</h1>
            <p className="text-sm font-light text-muted-foreground">Manage clean-in-place control forms</p>
          </div>
          <LoadingButton onClick={handleAddForm} className="bg-[#006BC4] text-white border-0 rounded-full px-6 py-2 font-light">
            <Plus className="mr-2 h-4 w-4" /> Add CIP Form
          </LoadingButton>
        </div>

        {!loading && latestForm && (
          <div className="border border-gray-200 rounded-xl bg-white border-l-4 border-l-[#006BC4] shadow-none flex flex-col md:flex-row">
            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium text-gray-900">Latest CIP Form</h3>
                    <Badge className={`text-xs font-light ${getStatusClass(latestForm.status)}`}>{latestForm.status}</Badge>
                  </div>
                  <FormIdCopy displayId={(latestForm as any).tag || latestForm.id || ""} actualId={(latestForm as any).tag || latestForm.id || ""} size="sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Machine</p>
                  <p className="text-sm font-light">
                    {typeof latestForm.machine_id === "object" ? latestForm.machine_id?.name : "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Caustic</p>
                  <p className="text-sm font-light">{latestForm.caustic_solution_strength}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Acid</p>
                  <p className="text-sm font-light">{latestForm.acid_solution_strength}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Rinse Test</p>
                  <p className="text-sm font-light">{latestForm.rinse_water_test}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-l border-gray-100 flex flex-col justify-center gap-2 min-w-[180px]">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-medium">
                  {latestForm.date ? new Date(latestForm.date).toLocaleDateString() : "N/A"}
                </p>
              </div>
              {getUserById(latestForm.operator_id) && (
                <UserAvatar user={getUserById(latestForm.operator_id)!} size="sm" showName />
              )}
              <LoadingButton onClick={() => handleViewForm(latestForm)} variant="outline" size="sm" className="rounded-full text-xs">View Details</LoadingButton>
            </div>
          </div>
        )}

        <div className="border border-gray-200 rounded-xl bg-white shadow-none overflow-hidden">
          <div className="p-6 space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              searchPlaceholder="Search by tag, status or machine..."
              filterFields={filterFields}
            />
            {loading
              ? <ContentSkeleton sections={1} cardsPerSection={5} />
              : <DataTable columns={columns} data={filteredForms} showSearch={false} />
            }
          </div>
        </div>

        <CIPControlFormDrawer open={formDrawerOpen} onOpenChange={setFormDrawerOpen} form={selectedForm} mode={formMode} />
        <CIPControlFormViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          form={selectedForm}
          users={users as any[]}
          roles={roles}
          getUserById={getUserById}
          getRoleById={getRoleById}
          onEdit={() => { setViewDrawerOpen(false); handleEditForm(selectedForm!) }}
        />
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete CIP Control Form"
          description="Are you sure you want to delete this CIP form? This action cannot be undone."
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </ToolsDashboardLayout>
  )
}
