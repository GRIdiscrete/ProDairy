"use client"

import { useEffect, useMemo, useState } from "react"
import { usersApi } from "@/lib/api/users"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import { Button } from "@/components/ui/button"
import { Settings, Plus } from "lucide-react"
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
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between">
          <div className="text-lg font-light">Group Assignment (Kanban)</div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">Drag operators between groups</div>
            <Button
              
              size="sm"
              onClick={onOpenSettings}
              className="rounded-full"
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {operatorsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading operators...</div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {(["unassigned", "group_a", "group_b", "group_c"] as GroupKey[]).map((col) => (
              <div 
                key={col} 
                className="border border-gray-200 rounded-lg bg-gray-50" 
                onDragOver={handleDragOver} 
                onDrop={() => handleDrop(col)}
              >
                <div className="p-3 flex items-center justify-between bg-white rounded-t-lg border-b">
                  <div className="text-sm font-medium">
                    {col === "unassigned" ? "Unassigned" : 
                     col === "group_a" ? "Group A" :
                     col === "group_b" ? "Group B" : "Group C"}
                  </div>
                  <Badge 
                    variant={col === "unassigned" ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {columns[col].length}
                  </Badge>
                </div>
                
                <div className="p-3 space-y-2 min-h-[300px]">
                  {columns[col].map((op) => (
                    <div
                      key={op.id}
                      draggable
                      onDragStart={() => handleDragStart(op.id)}
                      className={`p-3 rounded-md border bg-white cursor-move transition-all hover:shadow-md ${
                        draggingId === op.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <div className="text-sm font-medium">{op.name}</div>
                      <div className="text-xs text-gray-500">{op.department}</div>
                    </div>
                  ))}
                  
                  {columns[col].length === 0 && (
                    <div className="flex items-center justify-center h-20 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-md">
                      Drop operators here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {groupData ? `Last updated: ${groupData.updated_at ? new Date(groupData.updated_at).toLocaleString() : 'Never'}` : 'No group data loaded'}
          </div>
          <div className="flex gap-2">
            <LoadingButton
              onClick={() => onSave && onSave(savePayload)}
              disabled={loading || !hasChanges || !groupData}
              loading={loading}
              className="rounded-full bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  )
}


