"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, Package, Calendar, User, Edit, Trash2, CheckCircle, XCircle, Eye, EyeOff, Beaker, FileText } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { deleteDriverForm, fetchDriverForms } from "@/lib/store/slices/driverFormSlice"
import { fetchDriverFormLabTests, deleteDriverFormLabTest } from "@/lib/store/slices/driverFormLabTestSlice"
import { fetchUsers, selectUserById } from "@/lib/store/slices/usersSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { generateDriverFormId } from "@/lib/utils/form-id-generator"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { DriverFormLabTestDrawer } from "@/components/forms/driver-form-lab-test-drawer"
import type { DriverForm } from "@/lib/types"
import type { OfflineDriverForm } from "@/lib/offline/database"

// Unified form type
type UnifiedForm = DriverForm | OfflineDriverForm

// Signature Viewer Component
interface SignatureViewerProps {
  signature: string
  title: string
  type: 'supplier' | 'driver'
}

function SignatureViewer({ signature, title, type }: SignatureViewerProps) {
  if (!signature || signature.trim() === '') {
    return (
      <div className="space-y-1">
        <div className="text-xs text-gray-500">{title}</div>
        <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
          No signature available
        </div>
      </div>
    )
  }

  // Use the same base64 conversion function as the raw-milk-intake form
  const signatureImage = base64ToPngDataUrl(signature)

  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
        <img
          src={signatureImage}
          alt={`${title} signature`}
          className="w-full h-24 object-contain bg-white rounded border"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  )
}

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
  const [activeTab, setActiveTab] = useState<string>("details")
  const [labDrawerOpen, setLabDrawerOpen] = useState(false)
  const [labMode, setLabMode] = useState<"create" | "edit">("create")
  const [labExistingId, setLabExistingId] = useState<string | undefined>(undefined)
  const dispatch = useAppDispatch()
  const isMobile = useIsMobile()
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024

  const { operationLoading } = useAppSelector((state) => state.driverForm)
  const { tests, isInitialized, operationLoading: labOperationLoading } = useAppSelector((s) => (s as any).driverFormLabTests)
  const { items: users, loading: usersLoading } = useAppSelector((state) => state.users)
  useEffect(() => {
    if (open && !isInitialized) {
      dispatch(fetchDriverFormLabTests())
    }

    // Load users if not already loaded
    if (open && users.length === 0) {
      dispatch(fetchUsers({}))
    }
  }, [open, isInitialized, dispatch, users.length])

  const currentLabTest = useMemo(() => {
    if (!driverForm) return null
    return (tests || []).find((t: any) => t.drivers_form_id === driverForm.id) || null
  }, [tests, driverForm])

  const handleDelete = async () => {
    if (!driverForm) return

    try {
      setLoading(true)
      await dispatch(deleteDriverForm(driverForm.id)).unwrap()
      toast.success("Driver form deleted successfully")
      dispatch(fetchDriverForms({}))
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
        className="tablet-sheet-full p-0 bg-white"
      >
        <div className="h-full flex flex-col">
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
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentLabTest) { setLabMode("edit"); setLabExistingId(currentLabTest.id) } else { setLabMode("create"); setLabExistingId(undefined) }
                    setLabDrawerOpen(true)
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
                >
                  <Beaker className="w-4 h-4 mr-2" />
                  {currentLabTest ? "Update Milk Test" : "Create Milk Test"}
                </LoadingButton>
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
          <div className="flex-1 overflow-y-auto">
            <div className={isMobile || isTablet ? "p-6" : "p-6"}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-auto p-0 bg-transparent border-0 border-b border-gray-200 mb-6">
                  <TabsTrigger
                    value="details"
                    className="rounded-none bg-transparent border-0 border-b-2 border-transparent text-lg font-light text-gray-700 px-0 mr-6 data-[state=active]:text-blue-700 data-[state=active]:border-blue-600"
                  >
                    <FileText className="w-4 h-4 mr-2" /> Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="lab"
                    className="rounded-none bg-transparent border-0 border-b-2 border-transparent text-lg font-light text-gray-700 px-0 mr-6 data-[state=active]:text-blue-700 data-[state=active]:border-blue-600"
                  >
                    <Beaker className="w-4 h-4 mr-2" /> Milk Test
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4">
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg bg-white">
                      <div className="p-6 pb-0">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <div className="text-lg font-light">Driver Information</div>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-4">
                            <FormIdCopy
                              displayId={driverForm.tag}
                              actualId={driverForm.id}
                              size="md"
                            />
                          </div>
                          {(() => {
                            // Get driver ID from form
                            const driverId = typeof driverForm.driver === 'string' ? driverForm.driver : (driverForm as any).driver_id

                            // Find user in users state
                            const driverUser = users.find(user => user.id === driverId)

                            if (driverUser) {
                              return (
                                <UserAvatar
                                  user={driverUser}
                                  size="lg"
                                  showName={true}
                                  showEmail={true}
                                  showDropdown={true}
                                />
                              )
                            }

                            // Fallback display for when user is not found
                            const fallbackName = (() => {
                              if ((driverForm as any).drivers_driver_fkey) {
                                return `${(driverForm as any).drivers_driver_fkey.first_name} ${(driverForm as any).drivers_driver_fkey.last_name}`
                              }
                              if (driverForm.driver && typeof driverForm.driver === 'object') {
                                return `${(driverForm.driver as any).first_name} ${(driverForm.driver as any).last_name}`
                              }
                              return 'Unknown Driver'
                            })()

                            const fallbackEmail = (() => {
                              if ((driverForm as any).drivers_driver_fkey?.email) {
                                return (driverForm as any).drivers_driver_fkey.email
                              }
                              if (driverForm.driver && typeof driverForm.driver === 'object' && (driverForm.driver as any).email) {
                                return (driverForm.driver as any).email
                              }
                              return null
                            })()

                            return (
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-500" />
                                </div>
                                <div>
                                  <div className="font-medium text-base">{fallbackName}</div>
                                  {fallbackEmail && (
                                    <div className="text-sm text-gray-500">{fallbackEmail}</div>
                                  )}
                                </div>
                              </div>
                            )
                          })()}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 flex items-center gap-1"><Truck className="h-3 w-3" />Tanker</div>
                            <div className="text-sm font-light">
                              {driverForm.tanker ?? 'N/A'}
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
                          <div className="text-lg font-light">Collected Products ({(() => {
                            const legacyProducts = (driverForm as any).collected_products?.length || 0
                            const newProducts = (driverForm as any).drivers_form_collected_products?.length || 0
                            return legacyProducts + newProducts
                          })()})</div>
                        </div>
                      </div>
                      <div className="p-6">
                        {(() => {
                          const legacyProducts = (driverForm as any).collected_products || []
                          const newProducts = (driverForm as any).drivers_form_collected_products || []
                          const allProducts = [...legacyProducts, ...newProducts]

                          if (allProducts.length === 0) {
                            return <p className="text-muted-foreground text-sm font-light">No products collected</p>
                          }

                          return (
                            <div className="space-y-4">
                              {allProducts.map((product, index) => {
                                // Handle both legacy and new product formats
                                const isNewFormat = !product.hasOwnProperty('e-sign-supplier')
                                const supplierSignature = isNewFormat ? product.e_sign_supplier : product["e-sign-supplier"]
                                const driverSignature = isNewFormat ? product.e_sign_driver : product["e-sign-driver"]

                                return (
                                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                          <Package className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <p className="font-light">Product #{index + 1}</p>
                                          <p className="text-muted-foreground text-sm font-light">Raw Material Collection</p>
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
                                        <div className="text-xs text-gray-500">Unit of Measure</div>
                                        <p className="font-light">{product.unit_of_measure}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="text-xs text-gray-500">Collected Amount</div>
                                        <p className="font-light">{product.collected_amount} {product.unit_of_measure}</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <SignatureViewer
                                        signature={supplierSignature || ""}
                                        title="Supplier Signature"
                                        type="supplier"
                                      />
                                      <SignatureViewer
                                        signature={driverSignature || ""}
                                        title="Driver Signature"
                                        type="driver"
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })()}
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
                </TabsContent>

                <TabsContent value="lab" className="mt-4">
                  <div className="space-y-4">
                    {currentLabTest ? (
                      <div className="p-6 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-light">Milk Test Result</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={"text-xs " + (currentLabTest.accepted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                              {currentLabTest.accepted ? 'Accepted' : 'Rejected'}
                            </Badge>
                            <LoadingButton size="sm" variant="outline" className="rounded-full"
                              onClick={() => { setLabMode("edit"); setLabExistingId(currentLabTest.id); setLabDrawerOpen(true) }}>
                              Edit
                            </LoadingButton>
                            <LoadingButton size="sm" variant="destructive" className="rounded-full"
                              loading={labOperationLoading.delete}
                              onClick={() => dispatch(deleteDriverFormLabTest(currentLabTest.id))}
                            >
                              Delete
                            </LoadingButton>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Date</span><span className="text-sm font-light">{currentLabTest.date}</span></div>
                          <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Organoleptic</span><span className="text-sm font-light">{currentLabTest.organol_eptic}</span></div>
                          <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Alcohol</span><span className="text-sm font-light">{currentLabTest.alcohol || 'N/A'}</span></div>
                          <div className="flex items-center justify-between"><span className="text-sm text-gray-600">COB</span><span className="text-sm font-light">{currentLabTest.cob !== null ? (currentLabTest.cob ? 'Yes' : 'No') : 'N/A'}</span></div>
                          {currentLabTest.remarks && (
                            <div className="flex items-center justify-between md:col-span-2"><span className="text-sm text-gray-600">Remarks</span><span className="text-sm font-light">{currentLabTest.remarks}</span></div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-light">Milk Test</h3>
                          <Badge className="text-xs bg-yellow-100 text-yellow-800">No Result</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">No Milk Test found for this driver form.</p>
                        <LoadingButton className="rounded-full" onClick={() => { setLabMode("create"); setLabExistingId(undefined); setLabDrawerOpen(true) }}>Create Milk Test</LoadingButton>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>


        <DriverFormLabTestDrawer
          open={labDrawerOpen}
          onOpenChange={setLabDrawerOpen}
          driversFormId={driverForm?.id || ""}
          mode={labMode}
          existingId={labExistingId}
          existingData={currentLabTest}
        />
      </SheetContent>
    </Sheet>
  )
}