"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, Package, Calendar, User, Edit, Trash2, CheckCircle, XCircle, Eye, EyeOff, Beaker, FileText, Download } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { deleteDriverForm, fetchDriverForms } from "@/lib/store/slices/driverFormSlice"
import { fetchDriverFormLabTests, deleteDriverFormLabTest } from "@/lib/store/slices/driverFormLabTestSlice"
import { fetchUsers, selectUserById } from "@/lib/store/slices/usersSlice"
import { fetchRawMaterials } from "@/lib/store/slices/rawMaterialSlice"
import { fetchSuppliers } from "@/lib/store/slices/supplierSlice"
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
  // select raw materials and suppliers (use same store shape as other pages)
  const rawMaterials = useAppSelector((s) => (s as any).rawMaterial?.rawMaterials ?? (s as any).rawMaterial?.items ?? [])
  const suppliers = useAppSelector((s) => (s as any).supplier?.suppliers ?? (s as any).supplier?.items ?? [])
  useEffect(() => {
    if (open && !isInitialized) {
      dispatch(fetchDriverFormLabTests())
    }

    // Load users if not already loaded
    if (open && users.length === 0) {
      dispatch(fetchUsers({}))
    }
    // Load raw materials & suppliers when opening (same pattern)
    if (open && (!rawMaterials || rawMaterials.length === 0)) {
      dispatch(fetchRawMaterials({}))
    }
    if (open && (!suppliers || suppliers.length === 0)) {
      dispatch(fetchSuppliers({}))
    }
  }, [open, isInitialized, dispatch, users.length])

  // NEW: track selected product/test for the lab drawer
  const [selectedProductForLab, setSelectedProductForLab] = useState<any | null>(null)
  const [selectedTestForLab, setSelectedTestForLab] = useState<any | null>(null)

  // Replace the old single-currentLabTest lookup with one that prefers drivers_form_id
  const currentLabTest = useMemo(() => {
    if (!driverForm) return null
    // try to find a test attached to the whole form first
    const formTest = (tests || []).find((t: any) => t.drivers_form_id === driverForm.id)
    if (formTest) return formTest
    // otherwise find the first test that belongs to any collected product on this form
    const productIds = ((driverForm as any).drivers_form_collected_products || []).map((p: any) => String(p.id))
    return (tests || []).find((t: any) => productIds.includes(String(t.collected_product_id))) || null
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

  const handleExportCSV = () => {
    if (!driverForm) return
    try {
      const legacyProducts = (driverForm as any).collected_products || []
      const newProducts = (driverForm as any).drivers_form_collected_products || []
      const allProducts = [...legacyProducts, ...newProducts]

      // Get driver information
      const driverId = driverForm && (typeof driverForm.driver === 'string' ? driverForm.driver : (driverForm as any).driver_id)
      const driverUser = users.find(user => user.id === driverId)
      const driverName = driverUser ? `${driverUser.first_name} ${driverUser.last_name}` :
        (driverForm && (driverForm as any).drivers_driver_fkey ?
          `${(driverForm as any).drivers_driver_fkey.first_name} ${(driverForm as any).drivers_driver_fkey.last_name}` :
          'Unknown Driver')

      // Prepare CSV data
      const csvData = []

      // Add header row
      csvData.push([
        'Driver Form ID',
        'Driver Name',
        'Tanker',
        'Start Date',
        'End Date',
        'Delivered',
        'Rejected',
        'Created Date',
        'Product #',
        'Collected Amount',
        'Unit of Measure',
        'Tanker Compartment',
        'Raw Material',
        'Supplier Name',
        'Supplier Email',
        'Test Date',
        'Organoleptic',
        'Alcohol',
        'COB',
        'Accepted',
        'Remarks'
      ])

      // Process each product and its tests
      allProducts.forEach((product, productIndex) => {
        const productTests = (tests || []).filter((t: any) => String(t.collected_product_id) === String(product.id))

        // Get raw material and supplier info
        const rawMat = rawMaterials.find((r: any) => String(r.id) === String(product.raw_material_id || product.rawMaterialId || product.raw_material))
        const rawMatName = rawMat ? (rawMat.name || rawMat.raw_material_name || "") : (product.raw_material_name || "")

        const supplierObj = suppliers.find((s: any) => String(s.id) === String(product.supplier_id || product.supplier))
        const supplierName = supplierObj ? (supplierObj.name || supplierObj.company_name || "") : (product.supplier_name || "")
        const supplierEmail = supplierObj ? (supplierObj.email || supplierObj.contact_email || "") : (product.supplier_email || "")

        if (productTests.length > 0) {
          // Add a row for each test
          productTests.forEach((test: any) => {
            csvData.push([
              driverName,
              (driverForm.tanker as any)?.reg_number || (typeof driverForm.tanker === 'string' ? driverForm.tanker : 'N/A'),
              new Date(driverForm.start_date).toLocaleDateString(),
              new Date(driverForm.end_date).toLocaleDateString(),
              driverForm.delivered ? 'Yes' : 'No',
              driverForm.rejected ? 'Yes' : 'No',
              new Date(driverForm.created_at).toLocaleDateString(),
              `Product ${productIndex + 1}`,
              product.collected_amount || '',
              product.unit_of_measure || '',
              product.tanker_compartment ? `Compartment - ${product.tanker_compartment}` : 'N/A',
              rawMatName,
              supplierName,
              supplierEmail,
              test.date || test.created_at || 'N/A',
              test.organol_eptic || 'N/A',
              test.alcohol || 'N/A',
              test.cob !== null ? (test.cob ? 'Yes' : 'No') : 'N/A',
              test.accepted ? 'Accepted' : 'Rejected',
              test.remarks || ''
            ])
          })
        } else {
          // Add a row for product without tests
          csvData.push([
            driverForm.tag || driverForm.id || "",
            driverName,
            (driverForm.tanker as any)?.reg_number || (typeof driverForm.tanker === 'string' ? driverForm.tanker : 'N/A'),
            new Date(driverForm.start_date).toLocaleDateString(),
            new Date(driverForm.end_date).toLocaleDateString(),
            driverForm.delivered ? 'Yes' : 'No',
            driverForm.rejected ? 'Yes' : 'No',
            new Date(driverForm.created_at).toLocaleDateString(),
            `Product ${productIndex + 1}`,
            product.collected_amount || '',
            product.unit_of_measure || '',
            product.tanker_compartment ? `Compartment - ${product.tanker_compartment}` : 'N/A',
            rawMatName,
            supplierName,
            supplierEmail,
            'No Test',
            'N/A',
            'N/A',
            'N/A',
            'N/A',
            'No milk test performed'
          ])
        }
      })

      // Convert to CSV string
      const csvContent = csvData.map(row =>
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n')

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `milk-test-report-${driverForm.tag || driverForm.id || ""}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Milk test report exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export milk test report')
    }
  }

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
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-light m-0">Driver Form Details</SheetTitle>
                  <SheetDescription className="text-sm font-light">
                    View driver collection form information
                  </SheetDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button

                  size="sm"
                  onClick={handleExportCSV}
                  disabled={isLoading}
                  className="bg-[#006BC4] text-white rounded-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                {onEdit && (
                  <Button

                    size="sm"
                    onClick={handleEdit}
                    disabled={isLoading}
                    className="bg-[#A0CF06] text-[#211D1E] rounded-full"
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
                              displayId={driverForm.tag || driverForm.id || ""}
                              actualId={driverForm.tag || driverForm.id || ""}
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
                              {(driverForm.tanker as any)?.reg_number || (typeof driverForm.tanker === 'string' ? driverForm.tanker : 'N/A')}
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

                                // NEW: tests that belong to this collected product
                                const productTests = (tests || []).filter((t: any) => String(t.collected_product_id) === String(product.id))

                                return (
                                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3 relative">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                          <Package className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                          <p className="font-light">Product #{index + 1}</p>
                                          <p className="text-muted-foreground text-sm font-light">Raw Material Collection</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <p className="font-light">
                                            {product.collected_amount} {product.unit_of_measure}
                                          </p>
                                        </div>
                                        <LoadingButton

                                          size="sm"
                                          onClick={() => {
                                            setLabMode("create")
                                            setLabExistingId(undefined)
                                            setSelectedTestForLab(null)
                                            setSelectedProductForLab(product)
                                            setLabDrawerOpen(true)
                                          }}
                                          className="bg-[#006BC4] text-white rounded-full"
                                        >
                                          <Beaker className="w-4 h-4 mr-2" />
                                          Create Milk Test
                                        </LoadingButton>
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

                                    {/* Tanker Compartment Display */}
                                    {product.tanker_compartment && (
                                      <div className="space-y-1">
                                        <div className="text-xs text-gray-500">Tanker Compartment</div>
                                        <p className="font-light">Compartment - {product.tanker_compartment}</p>
                                      </div>
                                    )}

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

                                    {/* Raw material & supplier info */}
                                    {(() => {
                                      const rawMat = rawMaterials.find((r: any) => String(r.id) === String(product.raw_material_id || product.rawMaterialId || product.raw_material))
                                      const rawMatName = rawMat ? (rawMat.name || rawMat.raw_material_name || "") : (product.raw_material_name || "")

                                      const supplierObj = suppliers.find((s: any) => String(s.id) === String(product.supplier_id || product.supplier))
                                      const supplierName = supplierObj ? (supplierObj.name || supplierObj.company_name || "") : (product.supplier_name || "")
                                      const supplierEmail = supplierObj ? (supplierObj.email || supplierObj.contact_email || "") : (product.supplier_email || "")

                                      return (
                                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                          <div className="space-y-1">
                                            <div className="text-xs text-gray-500">Raw Material</div>
                                            <div className="font-light">{rawMatName || "N/A"}</div>
                                          </div>
                                          <div className="space-y-1">
                                            <div className="text-xs text-gray-500">Supplier</div>
                                            <div className="font-light">{supplierName || "N/A"}{supplierEmail ? ` — ${supplierEmail}` : ""}</div>
                                          </div>
                                        </div>
                                      )
                                    })()}

                                    {/* Product tests accordion */}
                                    <div className="mt-2">
                                      <details className="bg-gray-50 border border-gray-100 rounded p-2">
                                        <summary className="cursor-pointer text-sm font-medium">
                                          Product Tests ({productTests.length})
                                        </summary>
                                        <div className="mt-2 space-y-2">
                                          {productTests.length === 0 ? (
                                            <div className="text-sm text-gray-500">No tests for this product yet.</div>
                                          ) : (
                                            productTests.map((pt: any) => (
                                              <div key={pt.id} className="flex items-center justify-between bg-white p-2 rounded border">
                                                <div>
                                                  <div className="text-sm font-light mb-2">{pt.date || pt.created_at || 'N/A'}</div>
                                                  <div className="text-xs text-gray-500 mb-1">Organoleptic: {pt.organol_eptic || 'N/A'}</div>
                                                  <div className="text-xs text-gray-500 mb-1">Alcohol: {pt.alcohol || 'N/A'}</div>
                                                  <div className="text-xs text-gray-500 mb-1">Cob: {pt.cob == true ? 'Yes' : 'No'}</div>
                                                  <div className="text-xs text-gray-500 mb-1">Remarks: {pt.remarks}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Badge className={"text-xs " + (pt.accepted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                                    {pt.accepted ? 'Accepted' : 'Rejected'}
                                                  </Badge>
                                                  <LoadingButton size="sm" className="rounded-full"
                                                    onClick={() => {
                                                      setLabMode("edit")
                                                      setLabExistingId(pt.id)
                                                      setSelectedTestForLab(pt)
                                                      setSelectedProductForLab(product)
                                                      setLabDrawerOpen(true)
                                                    }}>
                                                    Edit
                                                  </LoadingButton>
                                                  <LoadingButton size="sm" variant="destructive" className="rounded-full"
                                                    loading={labOperationLoading.delete}
                                                    onClick={() => dispatch(deleteDriverFormLabTest(pt.id))}
                                                  >
                                                    Delete
                                                  </LoadingButton>
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </details>
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

                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="bg-gray-100 text-gray-600 rounded-full px-6 py-2 font-light"
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
                            <LoadingButton size="sm" className="rounded-full"
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
                        <p className="text-sm text-gray-600 mb-3">No Milk Test found for this driver form. Use the product cards to create tests for each collected product.</p>
                        {/* removed the global create button here */}
                      </div>
                    )}
                  </div>
                </TabsContent>

              </Tabs>
            </div>
          </div>
        </div>

        {/* SINGLE lab drawer instance; pass selected product/test and driversFormId */}
        <DriverFormLabTestDrawer
          open={labDrawerOpen}
          onOpenChange={(v: boolean) => {
            if (!v) {
              // clear selection on close
              setSelectedProductForLab(null)
              setSelectedTestForLab(null)
              setLabExistingId(undefined)
            }
            setLabDrawerOpen(v)
          }}
          // driversFormId={driverForm?.id || ""}
          collectedProductId={selectedProductForLab?.id || ""}
          collectedProduct={selectedProductForLab}
          mode={labMode}
          existingId={labExistingId}
          existingData={selectedTestForLab}
        />
      </SheetContent>
    </Sheet>
  )
}