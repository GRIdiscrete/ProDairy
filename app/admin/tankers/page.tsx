"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Truck, FileText, TrendingUp, Gauge, User as UserIcon, Wrench, Trash2, Eye, Edit } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchTankers, deleteTankerAction, clearError } from "@/lib/store/slices/tankerSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { Tanker } from "@/lib/api/tanker"
import { TableFilters } from "@/lib/types"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { TankerFormDrawer } from "@/components/forms/tanker-form-drawer"
import { TankerViewDrawer } from "@/components/forms/tanker-view-drawer"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { UserAvatar } from "@/components/ui/user-avatar"

export default function AdminTankersPage() {
  const dispatch = useAppDispatch()
  const { items, operationLoading, error, isInitialized } = useAppSelector((s) => (s as any).tankers)
  const { items: userItems } = useAppSelector((s) => (s as any).users)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchTankers())
      dispatch(fetchUsers({}))
    }
  }, [dispatch, isInitialized])

  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchTankers())
    }
  }, [dispatch, tableFilters, isInitialized])

  useEffect(() => {
    if (error) {
      // optionally show toast
      dispatch(clearError())
    }
  }, [error, dispatch])

  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Tanker | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  const latest = Array.isArray(items) && items.length > 0 ? items[0] : null

  // Client-side filtering
  const filteredTankers = useMemo(() => {
    return (items || []).filter((tanker: Tanker) => {
      // Search filter
      if (tableFilters.search) {
        const search = tableFilters.search.toLowerCase()
        const regNumber = (tanker.reg_number || "").toLowerCase()
        if (!regNumber.includes(search)) return false
      }
      // Reg number filter
      if (tableFilters.reg_number && !tanker.reg_number?.toLowerCase().includes(tableFilters.reg_number.toLowerCase())) return false
      // Condition filter
      if (tableFilters.condition && !tanker.condition?.toLowerCase().includes(tableFilters.condition.toLowerCase())) return false
      return true
    })
  }, [items, tableFilters])

  const handleAdd = () => { setSelected(null); setFormMode("create"); setFormDrawerOpen(true) }
  const handleEdit = (t: Tanker) => { setSelected(t); setFormMode("edit"); setFormDrawerOpen(true) }
  const handleView = (t: Tanker) => { setSelected(t); setViewDrawerOpen(true) }
  const handleDelete = (t: Tanker) => { setSelected(t); setDeleteDialogOpen(true) }

  const confirmDelete = async () => {
    if (!selected) return
    await dispatch(deleteTankerAction(selected.id))
    setDeleteDialogOpen(false)
    setSelected(null)
  }

  const columns = [
    {
      accessorKey: "reg_number",
      header: "Tanker",
      cell: ({ row }: any) => {
        const t: Tanker = row.original
        const driver = Array.isArray(userItems) ? userItems.find((u: any) => u.id === t.driver_id) : null
        return (
          <div className="flex items-center space-x-3">

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-light">{t.reg_number}</span>
                <Badge className="bg-blue-100 text-blue-800 font-light">{Math.round(t.capacity)}L</Badge>
              </div>
              {driver ? (
                <div className="mt-1">
                  <UserAvatar user={driver} size="sm" showName={true} showEmail={false} />
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-1">Driver: Unassigned</p>
              )}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "stats",
      header: "Stats",
      cell: ({ row }: any) => {
        const t: Tanker = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Gauge className="h-3 w-3 text-green-600" />
              <span className="text-sm font-light">{t.mileage.toLocaleString()} km</span>
            </div>
            <p className="text-xs text-gray-500">Age: {t.age} yrs • Condition: {t.condition}</p>
            <p className="text-xs text-gray-500">Compartments: {t.compartments || 'N/A'}</p>
          </div>
        )
      }
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const t: Tanker = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}</p>
            <p className="text-xs text-gray-500">{t.updated_at ? `Updated: ${new Date(t.updated_at).toLocaleDateString()}` : 'Never updated'}</p>
          </div>
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const t: Tanker = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton

              size="sm"
              onClick={() => handleView(t)}
              className="bg-[#006BC4] text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton

              size="sm"
              onClick={() => handleEdit(t)}
              className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(t)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
              className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      }
    }
  ]

  const filterFields = [
    { key: "reg_number", label: "Reg Number", type: "text" as const, placeholder: "Filter by reg number" },
    { key: "condition", label: "Condition", type: "text" as const, placeholder: "Filter by condition" },
  ]

  return (
    <PermissionGuard requiredView="tanker_tab">
      <AdminDashboardLayout title="Tankers" subtitle="Manage vehicle tankers and assignments">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-foreground">Tankers</h1>
              <p className="text-sm font-light text-muted-foreground">Manage vehicle tankers and assignments</p>
            </div>
            <LoadingButton
              onClick={handleAdd}
              className="bg-[#006BC4] text-white border-0 rounded-full px-6 py-2 font-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Tanker
            </LoadingButton>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Tankers</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(s) => setTableFilters((p) => ({ ...p, search: s }))}
                searchPlaceholder="Search tankers..."
                filterFields={filterFields}
              />
              {operationLoading.fetch ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">Loading tankers...</p>
                  </div>
                </div>
              ) : (
                <DataTable columns={columns as any} data={filteredTankers} showSearch={false} />
              )}
            </div>
          </div>

          <TankerFormDrawer open={formDrawerOpen} onOpenChange={setFormDrawerOpen} tanker={selected} mode={formMode} />
          <TankerViewDrawer open={viewDrawerOpen} onOpenChange={setViewDrawerOpen} tanker={selected} users={userItems} onEdit={() => { setViewDrawerOpen(false); handleEdit(selected!) }} />
          <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Tanker" description={`Are you sure you want to delete this tanker? This action cannot be undone.`} onConfirm={confirmDelete} loading={operationLoading.delete} />
        </div>
      </AdminDashboardLayout>
    </PermissionGuard>
  )
}


