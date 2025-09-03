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
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SheetTitle className="flex items-center gap-2 m-0">
                <Settings className="w-6 h-6" />
                Process Details
              </SheetTitle>
            </div>
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  disabled={isLoading}
                  className="ml-auto"
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
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </LoadingButton>
            </div>
          </div>
          <SheetDescription>
            View process information and raw materials
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Process Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Process Name</p>
                <p className="font-medium">{process.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Created</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(process.created_at).toLocaleDateString()}
                  </div>
                </div>
                {process.updated_at && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Updated</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(process.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Raw Materials ({process.raw_material_ids.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {process.raw_material_ids.length === 0 ? (
                <p className="text-muted-foreground text-sm">No raw materials selected</p>
              ) : (
                <div className="space-y-3">
                  {getSelectedRawMaterials().map((material) => (
                    <div key={material.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{material.name}</p>
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
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}