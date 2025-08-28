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
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SheetTitle className="flex items-center gap-2 m-0">
                <ClipboardList className="w-6 h-6" />
                Production Plan Details
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
            View production plan information and materials
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Plan Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Plan Name</p>
                <p className="font-medium">{productionPlan.name}</p>
              </div>

              {productionPlan.description && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Description</p>
                  <p>{productionPlan.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Start Date</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(productionPlan.start_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">End Date</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(productionPlan.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Supervisor</p>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    {productionPlan.production_plan_supervisor_fkey ? 
                      `${productionPlan.production_plan_supervisor_fkey.first_name} ${productionPlan.production_plan_supervisor_fkey.last_name}` :
                      productionPlan.supervisor
                    }
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Status</p>
                  <Badge className={getStatusColor(productionPlan.status)}>
                    {productionPlan.status.charAt(0).toUpperCase() + productionPlan.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Created</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(productionPlan.created_at).toLocaleDateString()}
                  </div>
                </div>
                {productionPlan.updated_at && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Updated</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(productionPlan.updated_at).toLocaleDateString()}
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
                Raw Materials ({productionPlan.raw_products.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productionPlan.raw_products.length === 0 ? (
                <p className="text-muted-foreground text-sm">No raw materials specified</p>
              ) : (
                <div className="space-y-4">
                  {productionPlan.raw_products.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{material.raw_material_name}</p>
                          <p className="text-muted-foreground text-sm">ID: {material.raw_material_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {material.requested_amount} {material.unit_of_measure}
                        </p>
                        <p className="text-muted-foreground text-sm">Requested</p>
                      </div>
                    </div>
                  ))}
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