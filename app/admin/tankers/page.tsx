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
import { PermissionButton } from "@/components/ui/permission-table-actions"
import { PermissionTableActions } from "@/components/ui/permission-table-actions"

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
        const driver = t.tanker_driver_id_fkey
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">{t.reg_number}</span>
                <Badge className="bg-blue-100 text-blue-800 font-light">{Math.round(t.capacity)}L</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Driver: {driver ? `${driver.first_name} ${driver.last_name}` : 'Unassigned'}
              </p>
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
          <PermissionTableActions
            feature="tanker"
            onView={() => handleView(t)}
            onEdit={() => handleEdit(t)}
            onDelete={() => handleDelete(t)}
            showDropdown={true}
          />
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
          <PermissionButton
            feature="tanker"
            permission="create"
            onClick={handleAdd}
            className="bg-[#0068BD] hover:bg-[#005299] text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tanker
          </PermissionButton>
        </div>

        {operationLoading.fetch ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : null}

        {!operationLoading.fetch && (
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
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable columns={columns as any} data={items} showSearch={false} />
              )}
            </div>
          </div>
        )}

        <TankerFormDrawer open={formDrawerOpen} onOpenChange={setFormDrawerOpen} tanker={selected} mode={formMode} />
        <TankerViewDrawer open={viewDrawerOpen} onOpenChange={setViewDrawerOpen} tanker={selected} onEdit={() => { setViewDrawerOpen(false); handleEdit(selected!) }} />
        <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Tanker" description={`Are you sure you want to delete this tanker? This action cannot be undone.`} onConfirm={confirmDelete} loading={operationLoading.delete} />
      </div>
    </AdminDashboardLayout>
    </PermissionGuard>
  )
}


