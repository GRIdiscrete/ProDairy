"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, FileText } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchFilmaticGroups, fetchFilmaticGroupDetails } from "@/lib/store/slices/filmaticLinesGroupsSlice"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { FilmaticLinesGroup } from "@/lib/api/filmatic-lines-groups"
import { FilmaticLinesGroupFormDrawer } from "@/components/forms/filmatic-lines-group-form-drawer"
import { FilmaticLinesGroupViewDrawer } from "@/components/forms/filmatic-lines-group-view-drawer"
import { FilmaticLinesGroupsKanban } from "@/components/forms/filmatic-lines-groups-kanban"

export default function FilmaticLinesGroupsPage() {
  const dispatch = useAppDispatch()
  const { groups, details, operationLoading } = useAppSelector((s) => (s as any).filmaticLinesGroups)
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<FilmaticLinesGroup | null>(null)
  const [filters, setFilters] = useState<any>({})
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchFilmaticGroups())
      dispatch(fetchFilmaticGroupDetails())
    }
  }, [dispatch])

  const handleAdd = () => { setSelected(null); setFormDrawerOpen(true) }
  const handleView = (g: FilmaticLinesGroup) => { setSelected(g); setViewDrawerOpen(true) }

  const columns = [
    {
      accessorKey: "group",
      header: "Group",
      cell: ({ row }: any) => {
        const g: any = row.original
        const safeName = g.filmatic_line_groups_group_id_fkey?.group_name || '—'
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-light">{safeName}</span>
            </div>
            <div className="text-xs text-gray-500">Manager: {(g.manager_id || '').slice(0,8)}</div>
          </div>
        )
      }
    },
    {
      accessorKey: "operators",
      header: "Operators",
      cell: ({ row }: any) => {
        const g: any = row.original
        const ops = g.filmatic_line_groups_group_id_fkey?.operator_ids || []
        return (
          <div className="flex flex-wrap gap-1">
            {ops.slice(0, 3).map((id: string) => (
              <Badge key={id} variant="secondary" className="text-xs">{id.slice(0,8)}</Badge>
            ))}
            {ops.length > 3 && (
              <Badge variant="outline" className="text-xs">+{ops.length - 3}</Badge>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const g: FilmaticLinesGroup = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{g.created_at ? new Date(g.created_at).toLocaleDateString() : 'N/A'}</p>
            <p className="text-xs text-gray-500">{g.updated_at ? `Updated: ${new Date(g.updated_at).toLocaleDateString()}` : 'Never updated'}</p>
          </div>
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const g: FilmaticLinesGroup = row.original
        return (
          <LoadingButton variant="outline" size="sm" onClick={() => handleView(g)} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full">
            <FileText className="w-4 h-4 mr-2" /> View
          </LoadingButton>
        )
      }
    }
  ]

  const filterFields = [
    { key: "group_name", label: "Group Name", type: "text" as const, placeholder: "Filter by group name" },
  ]

  return (
    <AdminDashboardLayout title="Filmatic Lines Groups" subtitle="Manage Filmatic lines operator groups">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Filmatic Lines Groups</h1>
            <p className="text-sm font-light text-muted-foreground">Create groups and assign operators</p>
          </div>
          <LoadingButton onClick={handleAdd} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light">
            <Plus className="mr-2 h-4 w-4" />
            New Group
          </LoadingButton>
        </div>

        {operationLoading.fetch ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : null}

        {!operationLoading.fetch && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Groups</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters filters={filters} onFiltersChange={setFilters} searchPlaceholder="Search groups..." filterFields={filterFields} />
              <DataTable columns={columns as any} data={groups} showSearch={false} />
            </div>
          </div>
        )}

        {/* Kanban placeholder for operator assignment */}
        <FilmaticLinesGroupsKanban onSave={() => {}} />

        <FilmaticLinesGroupFormDrawer open={formDrawerOpen} onOpenChange={setFormDrawerOpen} />
        <FilmaticLinesGroupViewDrawer open={viewDrawerOpen} onOpenChange={setViewDrawerOpen} group={selected} details={details} />
      </div>
    </AdminDashboardLayout>
  )
}


