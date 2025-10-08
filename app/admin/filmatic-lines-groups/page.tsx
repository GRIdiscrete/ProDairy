"use client"

import { useEffect, useRef, useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchFilmaticGroups, updateFilmaticGroup } from "@/lib/store/slices/filmaticLinesGroupsSlice"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { FilmaticLinesGroup } from "@/lib/api/filmatic-lines-groups"
import { FilmaticLinesGroupsKanban } from "@/components/forms/filmatic-lines-groups-kanban"
import { FilmaticLinesGroupSettingsDrawer } from "@/components/forms/filmatic-lines-group-settings-drawer"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { toast } from "sonner"

export default function FilmaticLinesGroupsPage() {
  const dispatch = useAppDispatch()
  const { groups, operationLoading } = useAppSelector((s) => (s as any).filmaticLinesGroups)
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false)
  const hasFetchedRef = useRef(false)

  // Get the first (and only) group as per requirements
  const currentGroup = groups.length > 0 ? groups[0] : null

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchFilmaticGroups())
    }
  }, [dispatch])

  const handleSaveGroups = async (payload: { 
    group_a: string[]
    group_b: string[]
    group_c: string[]
    manager_id: string 
  }) => {
    if (!currentGroup) {
      toast.error("No group data available")
      return
    }

    try {
      await dispatch(updateFilmaticGroup({
        id: currentGroup.id,
        ...payload
      })).unwrap()
      
      toast.success("Group assignments updated successfully!")
    } catch (error: any) {
      toast.error(error?.message || "Failed to update group assignments")
    }
  }

  const handleSaveSettings = async (managerId: string) => {
    if (!currentGroup) {
      toast.error("No group data available")
      return
    }

    try {
      await dispatch(updateFilmaticGroup({
        id: currentGroup.id,
        group_a: currentGroup.group_a,
        group_b: currentGroup.group_b,
        group_c: currentGroup.group_c,
        manager_id: managerId
      })).unwrap()
      
      toast.success("Manager updated successfully!")
      setSettingsDrawerOpen(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to update manager")
    }
  }

  return (
    <PermissionGuard requiredView="filmatic_group_tab">
      <AdminDashboardLayout title="Filmatic Lines Groups" subtitle="Manage operator group assignments">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-foreground">Filmatic Lines Groups</h1>
              <p className="text-sm font-light text-muted-foreground">
                Assign operators to groups using drag and drop
              </p>
            </div>
          </div>

          {operationLoading.fetch ? (
            <ContentSkeleton sections={1} cardsPerSection={1} />
          ) : (
            <FilmaticLinesGroupsKanban
              groupData={currentGroup}
              onSave={handleSaveGroups}
              onOpenSettings={() => setSettingsDrawerOpen(true)}
              loading={operationLoading.update}
            />
          )}

          <FilmaticLinesGroupSettingsDrawer
            open={settingsDrawerOpen}
            onOpenChange={setSettingsDrawerOpen}
            groupData={currentGroup}
            onSave={handleSaveSettings}
            loading={operationLoading.update}
          />
        </div>
      </AdminDashboardLayout>
    </PermissionGuard>
  )
}


