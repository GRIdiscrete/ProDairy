"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { FilmaticLinesGroup, FilmaticLinesGroupDetail } from "@/lib/api/filmatic-lines-groups"
import { Users } from "lucide-react"

interface Props { open: boolean; onOpenChange: (open: boolean) => void; group: FilmaticLinesGroup | null; details: FilmaticLinesGroupDetail[] }

export function FilmaticLinesGroupViewDrawer({ open, onOpenChange, group, details }: Props) {
  if (!group) return null
  const detail = details.find(d => d.filmatic_line_groups_id === group.id) || (group as any).filmatic_line_groups_group_id_fkey
  const ops: string[] = (detail?.operator_ids as any) || []
  const name = detail?.group_name || (group as any).filmatic_line_groups_group_id_fkey?.group_name || '—'
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 bg-white">
        <SheetHeader>
          <SheetTitle className="text-lg font-light">Group Details</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="border border-gray-200 rounded-lg bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-base font-light">{name}</span>
            </div>
            <div className="text-xs text-gray-500 mb-3">Manager: {(group.manager_id || '').slice(0,8)}</div>
            <div className="flex flex-wrap gap-1">
              {ops.length === 0 ? (
                <span className="text-sm text-gray-500">No operators assigned</span>
              ) : ops.map((id) => (
                <Badge key={id} variant="secondary" className="text-xs">{id.slice(0,8)}</Badge>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}


