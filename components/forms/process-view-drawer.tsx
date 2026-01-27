"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Package, Calendar, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { deleteProcess, fetchProcesses } from "@/lib/store/slices/processSlice"
import { fetchRawMaterials } from "@/lib/store/slices/rawMaterialSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import type { Process } from "@/lib/types"

interface ProcessViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process: Process | null
  onEdit?: (process: Process) => void
}

export function ProcessViewDrawer({ open, onOpenChange, process, onEdit }: ProcessViewDrawerProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const { operationLoading } = useAppSelector((state) => state.process)
  const { rawMaterials } = useAppSelector((state) => state.rawMaterial)

  // Load raw materials to get names
  useEffect(() => {
    if (open) {
      dispatch(fetchRawMaterials())
    }
  }, [dispatch, open])

  const handleDelete = async () => {
    if (!process) return
    
    try {
      setLoading(true)
      await dispatch(deleteProcess(process.id)).unwrap()
      toast.success("Process deleted successfully")
      dispatch(fetchProcesses())
      onOpenChange(false)
    } catch (error: any) {
      const message = error?.message || "Failed to delete process"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (process && onEdit) {
      onEdit(process)
      onOpenChange(false)
    }
  }

  const getSelectedRawMaterials = () => {
    if (!process || !rawMaterials.length) return []
    
    return rawMaterials.filter(material => 
      process.raw_material_ids.includes(material.id)
    )
  }

  const isLoading = loading || operationLoading.delete

  if (!process) return <></>

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-6 bg-white">
        <SheetHeader>
          <SheetTitle className="text-lg font-light">Process Details</SheetTitle>
          <SheetDescription className="text-sm font-light">View process information and raw materials</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-base font-light">{process.name}</div>
                </div>
                <div className="flex space-x-2">
                  {onEdit && (
                    <Button
                      
                      size="sm"
                      onClick={handleEdit}
                      disabled={isLoading}
                      className=" bg-[#006BC4] text-white rounded-full"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <LoadingButton
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    loading={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </LoadingButton>
                </div>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />Created</div>
                <div className="text-sm font-light">{new Date(process.created_at).toLocaleDateString()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />Updated</div>
                <div className="text-sm font-light">
                  {process.updated_at ? new Date(process.updated_at).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>
          </div>

          {/* Raw Materials Section */}
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 pb-0">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-600" />
                <div className="text-base font-light">Raw Materials ({process.raw_material_ids.length})</div>
              </div>
            </div>
            <div className="p-4">
              {process.raw_material_ids.length === 0 ? (
                <p className="text-muted-foreground text-sm">No raw materials selected</p>
              ) : (
                <div className="space-y-3">
                  {getSelectedRawMaterials().map((material) => (
                    <div key={material.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-light">{material.name}</p>
                        {material.description && (
                          <p className="text-muted-foreground text-sm">{material.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Show raw material IDs that don't have corresponding material data */}
                  {process.raw_material_ids.length > getSelectedRawMaterials().length && (
                    <div className="text-muted-foreground text-sm">
                      {process.raw_material_ids.length - getSelectedRawMaterials().length} additional raw materials
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}