"use client"

import { useEffect, useMemo, useState } from "react"
import { usersApi } from "@/lib/api/users"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"

interface OperatorCard {
  id: string
  name: string
  department: string
}

type GroupKey = "unassigned" | "A" | "B" | "C"

interface Props {
  onSave?: (payload: { A: string[]; B: string[]; C: string[] }) => void
}

export function FilmaticLinesGroupsKanban({ onSave }: Props) {
  const [operators, setOperators] = useState<OperatorCard[]>([])
  const [loading, setLoading] = useState(false)
  const [columns, setColumns] = useState<Record<GroupKey, OperatorCard[]>>({ unassigned: [], A: [], B: [], C: [] })
  const [draggingId, setDraggingId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await usersApi.getUsers()
        const list: OperatorCard[] = (res.data || []).map((u: any) => ({
          id: u.id,
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
          department: u.department || '-',
        }))
        setOperators(list)
        setColumns({ unassigned: list, A: [], B: [], C: [] })
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const handleDragStart = (id: string) => setDraggingId(id)
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const handleDrop = (target: GroupKey) => {
    if (!draggingId) return
    setColumns((prev) => {
      const sourceKey = (Object.keys(prev) as GroupKey[]).find((k) => prev[k].some((o) => o.id === draggingId)) as GroupKey
      if (!sourceKey) return prev
      if (sourceKey === target) return prev
      const moving = prev[sourceKey].find((o) => o.id === draggingId)!
      return {
        ...prev,
        [sourceKey]: prev[sourceKey].filter((o) => o.id !== draggingId),
        [target]: [moving, ...prev[target]],
      }
    })
    setDraggingId(null)
  }

  const savePayload = useMemo(() => ({
    A: columns.A.map((o) => o.id),
    B: columns.B.map((o) => o.id),
    C: columns.C.map((o) => o.id),
  }), [columns])

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between">
          <div className="text-lg font-light">Group Assignment (Kanban)</div>
          <div className="text-xs text-gray-500">Hint: First operator on a shift locks the group; cancel to change.</div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {(["unassigned", "A", "B", "C"] as GroupKey[]).map((col) => (
            <div key={col} className="border border-gray-200 rounded-lg" onDragOver={handleDragOver} onDrop={() => handleDrop(col)}>
              <div className="p-3 flex items-center justify-between">
                <div className="text-sm font-light">{col === "unassigned" ? "Unassigned" : `Group ${col}`}</div>
                {col !== "unassigned" && (
                  <Badge className="text-xs bg-blue-100 text-blue-800">{columns[col].length}</Badge>
                )}
              </div>
              <div className="p-3 space-y-2 min-h-[200px]">
                {columns[col].map((op) => (
                  <div
                    key={op.id}
                    draggable
                    onDragStart={() => handleDragStart(op.id)}
                    className="p-3 rounded-md border border-gray-200 bg-white cursor-move"
                  >
                    <div className="text-sm font-light">{op.name}</div>
                    <div className="text-xs text-gray-500">{op.department}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end">
          <LoadingButton
            onClick={() => onSave && onSave(savePayload)}
            disabled={loading}
            className="rounded-full"
          >
            Save Assignment
          </LoadingButton>
        </div>
      </div>
    </div>
  )
}


