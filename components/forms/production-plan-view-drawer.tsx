"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Package, Calendar, User, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { deleteProductionPlan, fetchProductionPlans } from "@/lib/store/slices/productionPlanSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import type { ProductionPlan } from "@/lib/types"

interface ProductionPlanViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productionPlan: ProductionPlan | null
  onEdit?: (plan: ProductionPlan) => void
}

export function ProductionPlanViewDrawer({ 
  open, 
  onOpenChange, 
  productionPlan, 
  onEdit 
}: ProductionPlanViewDrawerProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const { operationLoading } = useAppSelector((state) => state.productionPlan)

  const handleDelete = async () => {
    if (!productionPlan) return
    
    try {
      setLoading(true)
      await dispatch(deleteProductionPlan(productionPlan.id)).unwrap()
      toast.success("Production plan deleted successfully")
      dispatch(fetchProductionPlans())
      onOpenChange(false)
    } catch (error: any) {
      const message = error?.message || "Failed to delete production plan"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (productionPlan && onEdit) {
      onEdit(productionPlan)
      onOpenChange(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isLoading = loading || operationLoading.delete

  if (!productionPlan) return <></>

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 bg-white">
        <SheetHeader>
          <SheetTitle className="text-lg font-light">Production Plan Details</SheetTitle>
          <SheetDescription className="text-sm font-light">View production plan information and materials</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-base font-light">{productionPlan.name}</div>
                  <Badge className={getStatusColor(productionPlan.status)}>
                    {productionPlan.status.charAt(0).toUpperCase() + productionPlan.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
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
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </LoadingButton>
                </div>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />Start Date</div>
                <div className="text-sm font-light">{new Date(productionPlan.start_date).toLocaleDateString()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />End Date</div>
                <div className="text-sm font-light">{new Date(productionPlan.end_date).toLocaleDateString()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><User className="h-3 w-3" />Supervisor</div>
                <div className="text-sm font-light">
                  {productionPlan.production_plan_supervisor_fkey ? 
                    `${productionPlan.production_plan_supervisor_fkey.first_name} ${productionPlan.production_plan_supervisor_fkey.last_name}` :
                    productionPlan.supervisor
                  }
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />Created</div>
                <div className="text-sm font-light">{new Date(productionPlan.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {productionPlan.description && (
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="p-4 pb-0">
                <div className="text-base font-light">Description</div>
              </div>
              <div className="p-4">
                <p className="text-sm font-light">{productionPlan.description}</p>
              </div>
            </div>
          )}

          {/* Raw Materials Section */}
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 pb-0">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-600" />
                <div className="text-base font-light">Raw Materials ({productionPlan.raw_products.length})</div>
              </div>
            </div>
            <div className="p-4">
              {productionPlan.raw_products.length === 0 ? (
                <p className="text-muted-foreground text-sm">No raw materials specified</p>
              ) : (
                <div className="space-y-3">
                  {productionPlan.raw_products.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-light">{material.raw_material_name}</p>
                          <p className="text-muted-foreground text-sm">ID: {material.raw_material_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-light">
                          {material.requested_amount} {material.unit_of_measure}
                        </p>
                        <p className="text-muted-foreground text-sm">Requested</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}