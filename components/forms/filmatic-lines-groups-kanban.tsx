"use client"

import { useEffect, useMemo, useState } from "react"
import { usersApi } from "@/lib/api/users"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Plus, Search } from "lucide-react"
import { FilmaticLinesGroup } from "@/lib/api/filmatic-lines-groups"

interface OperatorCard {
  id: string
  name: string
  department: string
}

type GroupKey = "unassigned" | "group_a" | "group_b" | "group_c"

interface Props {
  groupData?: FilmaticLinesGroup | null
  onSave?: (payload: { group_a: string[]; group_b: string[]; group_c: string[]; manager_id: string }) => void
  onOpenSettings?: () => void
  loading?: boolean
}

export function FilmaticLinesGroupsKanban({ groupData, onSave, onOpenSettings, loading = false }: Props) {
  const [operators, setOperators] = useState<OperatorCard[]>([])
  const [operatorsLoading, setOperatorsLoading] = useState(false)
  const [columns, setColumns] = useState<Record<GroupKey, OperatorCard[]>>({
    unassigned: [],
    group_a: [],
    group_b: [],
    group_c: []
  })
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [unassignedSearch, setUnassignedSearch] = useState("")

  // Load all users/operators
  useEffect(() => {
    const load = async () => {
      setOperatorsLoading(true)
      try {
        const res = await usersApi.getUsers()
        const list: OperatorCard[] = (res.data || []).map((u: any) => ({
          id: u.id,
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
          department: u.department || '-',
        }))
        setOperators(list)
      } finally {
        setOperatorsLoading(false)
      }
    }
    load()
  }, [])

  // Update columns when groupData or operators change
  useEffect(() => {
    if (!operators.length) return

    const operatorMap = new Map(operators.map(op => [op.id, op]))

    if (groupData) {
      const assignedIds = new Set([
        ...groupData.group_a,
        ...groupData.group_b,
        ...groupData.group_c
      ])

      setColumns({
        unassigned: operators.filter(op => !assignedIds.has(op.id)),
        group_a: groupData.group_a.map(id => operatorMap.get(id)).filter(Boolean) as OperatorCard[],
        group_b: groupData.group_b.map(id => operatorMap.get(id)).filter(Boolean) as OperatorCard[],
        group_c: groupData.group_c.map(id => operatorMap.get(id)).filter(Boolean) as OperatorCard[],
      })
    } else {
      setColumns({
        unassigned: operators,
        group_a: [],
        group_b: [],
        group_c: []
      })
    }
  }, [operators, groupData])

  const handleDragStart = (id: string) => setDraggingId(id)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (target: GroupKey) => {
    if (!draggingId) return

    setColumns((prev) => {
      const sourceKey = (Object.keys(prev) as GroupKey[]).find((k) =>
        prev[k].some((o) => o.id === draggingId)
      ) as GroupKey

      if (!sourceKey || sourceKey === target) return prev

      const moving = prev[sourceKey].find((o) => o.id === draggingId)!

      return {
        ...prev,
        [sourceKey]: prev[sourceKey].filter((o) => o.id !== draggingId),
        [target]: [...prev[target], moving],
      }
    })
    setDraggingId(null)
  }

  const filteredUnassigned = useMemo(() => {
    if (!unassignedSearch) return columns.unassigned
    const s = unassignedSearch.toLowerCase()
    return columns.unassigned.filter(op =>
      op.name.toLowerCase().includes(s) ||
      op.department.toLowerCase().includes(s)
    )
  }, [columns.unassigned, unassignedSearch])

  const savePayload = useMemo(() => ({
    group_a: columns.group_a.map((o) => o.id),
    group_b: columns.group_b.map((o) => o.id),
    group_c: columns.group_c.map((o) => o.id),
    manager_id: groupData?.manager_id || '',
  }), [columns, groupData])

  const hasChanges = useMemo(() => {
    if (!groupData) return false
    return (
      JSON.stringify([...savePayload.group_a].sort()) !== JSON.stringify([...groupData.group_a].sort()) ||
      JSON.stringify([...savePayload.group_b].sort()) !== JSON.stringify([...groupData.group_b].sort()) ||
      JSON.stringify([...savePayload.group_c].sort()) !== JSON.stringify([...groupData.group_c].sort())
    )
  }, [savePayload, groupData])

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-medium text-gray-900 leading-tight">Group Assignment</div>
            <div className="text-sm font-light text-gray-500 mt-1">Drag and drop operators to manage shift groups</div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="rounded-lg h-10 px-4 border-gray-200 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-2 text-gray-500" />
              Settings
            </Button>
            <LoadingButton
              onClick={() => onSave && onSave(savePayload)}
              disabled={loading || !hasChanges || !groupData}
              loading={loading}
              className="rounded-lg h-10 px-6 bg-[#006BC4] hover:bg-[#00569E] shadow-sm transition-all"
            >
              Save Changes
            </LoadingButton>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {operatorsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading operators...</div>
        ) : (
          <div className="grid grid-cols-4 gap-6 items-start">
            {(["unassigned", "group_a", "group_b", "group_c"] as GroupKey[]).map((col) => {
              const displayList = col === "unassigned" ? filteredUnassigned : columns[col]

              return (
                <div
                  key={col}
                  className="flex flex-col border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(col)}
                >
                  <div className="p-4 flex items-center justify-between bg-white border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        {col === "unassigned" ? "Unassigned" :
                          col === "group_a" ? "Group A" :
                            col === "group_b" ? "Group B" : "Group C"}
                      </div>
                      <Badge
                        variant={col === "unassigned" ? "secondary" : "default"}
                        className={cn(
                          "text-[10px] h-5 px-1.5 min-w-[20px] justify-center font-bold",
                          col === "unassigned" ? "bg-gray-100 text-gray-600" : "bg-[#006BC4]"
                        )}
                      >
                        {columns[col].length}
                      </Badge>
                    </div>
                  </div>

                  {col === "unassigned" && (
                    <div className="p-3 bg-white border-b border-gray-50">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                          placeholder="Search operators..."
                          value={unassignedSearch}
                          onChange={(e) => setUnassignedSearch(e.target.value)}
                          className="h-8 pl-8 text-xs bg-gray-50 border-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-3 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">
                    {displayList.map((op) => (
                      <div
                        key={op.id}
                        draggable
                        onDragStart={() => handleDragStart(op.id)}
                        className={`p-3 rounded-lg border border-gray-200 bg-white cursor-move transition-all hover:border-blue-300 hover:shadow-sm group relative ${draggingId === op.id ? 'opacity-40 scale-95 border-blue-400 ring-2 ring-blue-50' : ''
                          }`}
                      >
                        <div className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{op.name}</div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{op.department}</div>
                        </div>
                      </div>
                    ))}

                    {displayList.length === 0 && (
                      <div className="flex flex-col items-center justify-center p-8 text-center bg-white/50 border-2 border-dashed border-gray-100 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                          <Plus className="h-4 w-4 text-gray-300" />
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          {col === "unassigned" ? "No operators found" : "Drop operators here"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50 border-t border-gray-100 rounded-b-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {groupData ? `Last updated: ${groupData.updated_at ? new Date(groupData.updated_at).toLocaleString() : 'Never'}` : 'No group data loaded'}
            </div>
          </div>
          <div className="text-[10px] text-gray-400 font-light italic">
            * Changes must be saved to take effect
          </div>
        </div>
      </div>
    </div>
  )
}


