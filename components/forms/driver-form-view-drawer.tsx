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
import type { OfflineDriverForm } from "@/lib/offline/database"

// Unified form type
type UnifiedForm = DriverForm | OfflineDriverForm

interface DriverFormViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverForm: UnifiedForm | null
  onEdit?: (form: UnifiedForm) => void
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
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024

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
        side={isMobile || isTablet ? "bottom" : "right"}
        className={
          isMobile || isTablet
            ? "h-[85vh] w-full max-w-full overflow-y-auto p-0 bg-white rounded-t-2xl"
            : "w-[50vw] sm:max-w-[50vw] overflow-y-auto p-6 bg-white"
        }
      >
        <SheetHeader className={isMobile || isTablet ? "p-6 pb-0 bg-white" : "mb-6"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div>
                <SheetTitle className="text-lg font-light m-0">Driver Form Details</SheetTitle>
                <SheetDescription className="text-sm font-light">
                  View driver collection form information
                </SheetDescription>
              </div>
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
        </SheetHeader>

        <div className={isMobile || isTablet ? "space-y-6 p-6" : "space-y-6"}>
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <div className="text-lg font-light">Driver Information</div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><User className="h-3 w-3" />Driver</div>
                <div className="text-sm font-light">
                  {driverForm.drivers_driver_fkey ? 
                    `${driverForm.drivers_driver_fkey.first_name} ${driverForm.drivers_driver_fkey.last_name}` :
                    driverForm.driver
                  }
                </div>
                {driverForm.drivers_driver_fkey?.email && (
                  <div className="text-xs text-gray-500 font-light">{driverForm.drivers_driver_fkey.email}</div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />Start Date</div>
                  <div className="text-sm font-light">
                    {new Date(driverForm.start_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />End Date</div>
                  <div className="text-sm font-light">
                    {new Date(driverForm.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Delivered</div>
                  <div className="flex items-center gap-2">
                    {driverForm.delivered ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <Badge className="bg-green-100 text-green-800 border-green-200">Yes</Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">No</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Rejected</div>
                  <div className="flex items-center gap-2">
                    {driverForm.rejected ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <Badge className="bg-red-100 text-red-800 border-red-200">Yes</Badge>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <Badge className="bg-green-100 text-green-800 border-green-200">No</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />Created</div>
                  <div className="text-sm font-light">
                    {new Date(driverForm.created_at).toLocaleDateString()}
                  </div>
                </div>
                {driverForm.updated_at && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />Updated</div>
                    <div className="text-sm font-light">
                      {new Date(driverForm.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <div className="text-lg font-light">Collected Products ({driverForm.collected_products?.length || 0})</div>
              </div>
            </div>
            <div className="p-6">
              {!driverForm.collected_products || driverForm.collected_products.length === 0 ? (
                <p className="text-muted-foreground text-sm font-light">No products collected</p>
              ) : (
                <div className="space-y-4">
                  {driverForm.collected_products.map((product, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-light">Product #{index + 1}</p>
                            <p className="text-muted-foreground text-sm font-light">Material ID: {product.raw_material_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-light">
                            {product.collected_amount} {product.unit_of_measure}
                          </p>
                          <p className="text-muted-foreground text-sm font-light">Collected</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Supplier ID</div>
                          <p className="font-mono text-xs bg-gray-100 p-1 rounded font-light">
                            {product.supplier_id}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Unit of Measure</div>
                          <p className="font-light">{product.unit_of_measure}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Supplier Signature</div>
                          <p className="font-mono text-xs bg-blue-50 p-2 rounded border border-blue-200 font-light">
                            {product["e-sign-supplier"] || "Not signed"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Driver Signature</div>
                          <p className="font-mono text-xs bg-green-50 p-2 rounded border border-green-200 font-light">
                            {product["e-sign-driver"] || "Not signed"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white border-0 rounded-full px-6 py-2 font-light"
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}