"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, Package, Calendar, User, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { deleteDriverForm, fetchDriverForms } from "@/lib/store/slices/driverFormSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import type { DriverForm } from "@/lib/types"

interface DriverFormViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverForm: DriverForm | null
  onEdit?: (form: DriverForm) => void
}

export function DriverFormViewDrawer({ 
  open, 
  onOpenChange, 
  driverForm, 
  onEdit 
}: DriverFormViewDrawerProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()
  const isMobile = useIsMobile()

  const { operationLoading } = useAppSelector((state) => state.driverForm)

  const handleDelete = async () => {
    if (!driverForm) return
    
    try {
      setLoading(true)
      await dispatch(deleteDriverForm(driverForm.id)).unwrap()
      toast.success("Driver form deleted successfully")
      dispatch(fetchDriverForms())
      onOpenChange(false)
    } catch (error: any) {
      const message = error?.message || "Failed to delete driver form"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (driverForm && onEdit) {
      onEdit(driverForm)
      onOpenChange(false)
    }
  }

  const isLoading = loading || operationLoading.delete

  if (!driverForm) return <></>

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "h-[85vh] w-full max-w-full overflow-y-auto p-6 rounded-t-2xl"
            : "w-[50vw] sm:max-w-[50vw] overflow-y-auto p-6"
        }
      >
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SheetTitle className="flex items-center gap-2 m-0">
                <Truck className="w-6 h-6" />
                Driver Form Details
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
            View driver collection form information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Driver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Driver</p>
                <p className="font-medium">
                  {driverForm.drivers_driver_fkey ? 
                    `${driverForm.drivers_driver_fkey.first_name} ${driverForm.drivers_driver_fkey.last_name}` :
                    driverForm.driver
                  }
                </p>
                {driverForm.drivers_driver_fkey?.email && (
                  <p className="text-muted-foreground text-sm">{driverForm.drivers_driver_fkey.email}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Start Date</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(driverForm.start_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">End Date</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(driverForm.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Delivered</p>
                  <div className="flex items-center gap-2">
                    {driverForm.delivered ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <Badge className="bg-green-100 text-green-800">Yes</Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <Badge className="bg-gray-100 text-gray-800">No</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Rejected</p>
                  <div className="flex items-center gap-2">
                    {driverForm.rejected ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <Badge className="bg-red-100 text-red-800">Yes</Badge>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <Badge className="bg-green-100 text-green-800">No</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Created</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(driverForm.created_at).toLocaleDateString()}
                  </div>
                </div>
                {driverForm.updated_at && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Updated</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(driverForm.updated_at).toLocaleDateString()}
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
                Collected Products ({driverForm.collected_products?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!driverForm.collected_products || driverForm.collected_products.length === 0 ? (
                <p className="text-muted-foreground text-sm">No products collected</p>
              ) : (
                <div className="space-y-4">
                  {driverForm.collected_products.map((product, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Product #{index + 1}</p>
                            <p className="text-muted-foreground text-sm">Material ID: {product.raw_material_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {product.collected_amount} {product.unit_of_measure}
                          </p>
                          <p className="text-muted-foreground text-sm">Collected</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Supplier ID</p>
                          <p className="font-mono text-xs bg-gray-100 p-1 rounded">
                            {product.supplier_id}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Unit of Measure</p>
                          <p>{product.unit_of_measure}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Supplier Signature</p>
                          <p className="font-mono text-xs bg-blue-50 p-2 rounded border">
                            {product["e-sign-supplier"] || "Not signed"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Driver Signature</p>
                          <p className="font-mono text-xs bg-green-50 p-2 rounded border">
                            {product["e-sign-driver"] || "Not signed"}
                          </p>
                        </div>
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