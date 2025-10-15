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

  // Local copy of group data used by the Kanban. Kanban should call onChange with updated data.
  const [localGroup, setLocalGroup] = useState<FilmaticLinesGroup | null>(null)
  // detect touch devices (simple heuristic)
  const [touchEnabled, setTouchEnabled] = useState(false)

  // Get the first (and only) group as per requirements
  const currentGroup = groups.length > 0 ? groups[0] : null

  // keep localGroup in sync with the store-provided group
  useEffect(() => {
    if (currentGroup) {
      // deep clone to avoid accidental mutation of store object
      setLocalGroup(JSON.parse(JSON.stringify(currentGroup)))
    } else {
      setLocalGroup(null)
    }
  }, [currentGroup])

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchFilmaticGroups())
    }
  }, [dispatch])

  // detect touch support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0
      setTouchEnabled(Boolean(isTouch))
    }
  }, [])

  const handleSaveGroups = async (payload: { 
    group_a: string[]
    group_b: string[]
    group_c: string[]
    manager_id: string 
  }) => {
    // prefer payload (from Kanban) else fallback to localGroup (keeps UI-driven changes)
    if (!currentGroup && !localGroup) {
      toast.error("No group data available")
      return
    }

    const id = currentGroup?.id ?? localGroup?.id
    const body = payload ?? {
      group_a: localGroup?.group_a ?? [],
      group_b: localGroup?.group_b ?? [],
      group_c: localGroup?.group_c ?? [],
      manager_id: localGroup?.manager_id ?? "",
    }

    try {
      await dispatch(updateFilmaticGroup({
        id,
        ...body
      })).unwrap()
      
      toast.success("Group assignments updated successfully!")
    } catch (error: any) {
      toast.error(error?.message || "Failed to update group assignments")
    }
  }

  const handleSaveSettings = async (managerId: string) => {
    if (!currentGroup && !localGroup) {
      toast.error("No group data available")
      return
    }

    try {
      await dispatch(updateFilmaticGroup({
        id: currentGroup?.id ?? localGroup?.id,
        group_a: localGroup?.group_a ?? currentGroup?.group_a ?? [],
        group_b: localGroup?.group_b ?? currentGroup?.group_b ?? [],
        group_c: localGroup?.group_c ?? currentGroup?.group_c ?? [],
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
            // wrapper helps give touch-action control for touch devices
            <div
              // when touchEnabled, set touchAction to 'none' so drag gesture can be captured by Kanban.
              // If this blocks vertical scrolling on your layout, change to 'pan-y' or remove.
              style={{ touchAction: touchEnabled ? "none" : undefined }}
              onTouchStart={() => {
                /* small hook to ensure touch focus/activation for some browsers/hardware */
                // no-op: presence of handler can help with certain touch chains; Kanban will handle actual drag start.
              }}
            >
              <FilmaticLinesGroupsKanban
                groupData={localGroup}               // pass local copy
                touchEnabled={touchEnabled}          // new flag the Kanban can use to enable touch-specific logic
                onChange={(updatedGroup: FilmaticLinesGroup) => {
                  // Kanban should call this after a drag operation finishes with the new group object
                  setLocalGroup(updatedGroup)
                }}
                onSave={handleSaveGroups}
                onOpenSettings={() => setSettingsDrawerOpen(true)}
                loading={operationLoading.update}
              />
            </div>
          )}

          <FilmaticLinesGroupSettingsDrawer
            open={settingsDrawerOpen}
            onOpenChange={setSettingsDrawerOpen}
            groupData={localGroup ?? currentGroup}
            onSave={handleSaveSettings}
            loading={operationLoading.update}
          />
        </div>
      </AdminDashboardLayout>
    </PermissionGuard>
  )
}


