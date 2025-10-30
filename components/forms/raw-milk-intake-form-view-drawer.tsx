"use client"

import { useEffect, useMemo, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { CopyButton } from "@/components/ui/copy-button"
import { Droplets, Truck, User, Package, Clock, Calendar, FileText, Beaker, Edit, Trash2, ArrowRight, Play, RotateCcw, TrendingUp, Building2, Download } from "lucide-react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import type { RootState } from "@/lib/store"
import { fetchRawMilkResultSlips, deleteRawMilkResultSlip } from "@/lib/store/slices/rawMilkResultSlipSlice"
import { fetchSuppliers } from "@/lib/store/slices/supplierSlice"
import { generateRawMilkIntakeFormId, generateDriverFormId } from "@/lib/utils/form-id-generator"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { UserAvatar } from "@/components/ui/user-avatar"
import { SupplierAvatar } from "@/components/ui/supplier-avatar"
import { RawMilkResultSlipDrawer } from "@/components/forms/raw-milk-result-slip-drawer"
import type { RawMilkIntakeForm } from "@/lib/api/raw-milk-intake"
import { base64ToPngDataUrl } from "@/lib/utils/signature"

interface RawMilkIntakeFormViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: RawMilkIntakeForm | null
  onEdit?: () => void
  onDelete?: () => void
}

export function RawMilkIntakeFormViewDrawer({
  open,
  onOpenChange,
  form,
  onEdit,
  onDelete
}: RawMilkIntakeFormViewDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [activeTab, setActiveTab] = useState<string>("details")
  const dispatch = useAppDispatch()
  const { slips, isInitialized, operationLoading } = useAppSelector((s) => (s as any).rawMilkResultSlips)
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const { silos } = useAppSelector((state: RootState) => state.silo)
  const { driverForms } = useAppSelector((state: RootState) => state.driverForm)
  const { suppliers } = useAppSelector((state: RootState) => state.supplier)
  const [resultSlipDrawerOpen, setResultSlipDrawerOpen] = useState(false)
  const [resultSlipMode, setResultSlipMode] = useState<"create" | "edit">("create")
  const [resultSlipExistingId, setResultSlipExistingId] = useState<string | undefined>(undefined)

  // Helper function to get silo by ID
  const getSiloById = (siloId: string) => {
    return silos.find((silo: any) => silo.id === siloId)
  }

  // Helper function to get driver form by ID
  const getDriverFormById = (driverFormId: string) => {
    return driverForms.find((form: any) => form.id === driverFormId)
  }

  // Helper function to get driver info from driver form
  const getDriverInfoFromForm = (driverFormId: string) => {
    const driverForm = getDriverFormById(driverFormId)
    if (!driverForm) return null

    const driverId = typeof driverForm.driver === 'string' ? driverForm.driver : (driverForm as any).driver_id
    const driverUser = users.find((user: any) => user.id === driverId)

    if (driverUser) {
      return {
        name: `${driverUser.first_name} ${driverUser.last_name}`,
        email: driverUser.email,
        user: driverUser
      }
    }

    return null
  }

  useEffect(() => {
    if (open && !isInitialized) {
      dispatch(fetchRawMilkResultSlips())
      dispatch(fetchSuppliers({})) // Load suppliers for sample information
    }
  }, [open, isInitialized, dispatch])

  // Helper function to get supplier by ID
  const getSupplierById = (supplierId: string) => {
    return suppliers.find((supplier: any) => supplier.id === supplierId)
  }

  const currentResultSlip = useMemo(() => {
    if (!form) return null
    return (slips || []).find((s: any) => s.raw_milk_intake_id === form.id) || null
  }, [slips, form])

  if (!form) return null

  const startAnimation = () => {
    setIsAnimating(true)
    setAnimationProgress(0)

    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAnimating(false)
          return 100
        }
        return prev + 2
      })
    }, 50)
  }

  const resetAnimation = () => {
    setIsAnimating(false)
    setAnimationProgress(0)
  }

  const handleExportLabTestCSV = () => {
    if (!currentResultSlip) return

    const formatDate = (date: string) => {
      return new Date(date).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/[/,:]/g, '-')
    }

    const formatTestData = currentResultSlip.raw_milk_result_slip_details.map((detail: any, index: number) => ({
      "Test No.": index + 1,
      "Temperature (°C)": detail.temperature || '',
      "Time": detail.time || '',
      "OT": detail.ot || '',
      "COB": detail.cob ? 'Yes' : 'No',
      "Alcohol": detail.alcohol || '',
      "Acidity": detail.titrable_acidity || '',
      "pH": detail.ph || '',
      "Resazurin": detail.resazurin || '',
      "Fat (%)": detail.fat || '',
      "Protein (%)": detail.protein || '',
      "LR SNF": detail.lr_snf || '',
      "Total Solids (%)": detail.total_solids || '',
      "FPD": detail.fpd || '',
      "SCC": detail.scc || '',
      "Density (g/ml)": detail.density || '',
      "Antibiotics": detail.antibiotics ? 'Yes' : 'No',
      "Starch": detail.starch ? 'Yes' : 'No',
      "Silo": getSiloById(detail.silo)?.name || detail.silo || '',
      "Remark": detail.remark || ''
    }))

    const headers = Object.keys(formatTestData[0])
    const csvContent = [
      headers.join(','),
      ...formatTestData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const currentDateTime = formatDate(new Date().toISOString())
    
    link.setAttribute('href', url)
    link.setAttribute('download', `raw-milk-intake-test-${form?.tag || ''}-${currentDateTime}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            <Droplets className="w-5 h-5" />
            Raw Milk Intake Form Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Complete information about the raw milk intake form record
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-light">Drivers Form</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600">Raw Milk Intake</span>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Standardizing</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Pasteurizing</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FormIdCopy
                displayId={form?.tag}
                actualId={form.id}
                size="lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <LoadingButton
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </LoadingButton>
              <LoadingButton
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </LoadingButton>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-auto p-0 bg-transparent border-0 border-b border-gray-200">
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
                <Beaker className="w-4 h-4 mr-2" /> Lab Test
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              {/* Form Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-light">Basic Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Form ID</span>
                      <FormIdCopy
                        displayId={form?.tag}
                        actualId={form.id}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Date</span>
                      <span className="text-sm font-light">
                        {new Date(form.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Quantity Received</span>
                      <span className="text-sm font-light text-blue-600">{form.quantity_received}L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Samples</span>
                      <span className="text-sm font-light text-green-600">
                        {(form as any).raw_milk_intake_form_samples?.length || 0} samples
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operator Information */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-light">Operator Information</h3>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      const operatorUser = users.find((user: any) => user.id === form.operator_id)

                      if (operatorUser) {
                        return (
                          <div className="space-y-3">
                            <UserAvatar
                              user={operatorUser}
                              size="lg"
                              showName={true}
                              showEmail={true}
                              showDropdown={true}
                            />
                            {form.operator_signature && (
                              <div className="space-y-2">
                                <span className="text-sm font-light text-gray-600">Digital Signature</span>
                                <div className="border border-gray-200 rounded-md p-2 bg-white">
                                  <img
                                    src={base64ToPngDataUrl(form.operator_signature)}
                                    alt="Operator signature"
                                    className="h-16 max-w-full object-contain"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      }

                      return (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-500">
                            <p>No operator user data available</p>
                          </div>
                          {form.operator_signature && (
                            <div className="space-y-2">
                              <span className="text-sm font-light text-gray-600">Digital Signature</span>
                              <div className="border border-gray-200 rounded-md p-2 bg-white">
                                <img
                                  src={base64ToPngDataUrl(form.operator_signature)}
                                  alt="Operator signature"
                                  className="h-16 max-w-full object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Driver Form Details */}
                {form.drivers_form_id && (
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-light">Driver Form</h3>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const driverForm = getDriverFormById(form.drivers_form_id)
                        const driverInfo = getDriverInfoFromForm(form.drivers_form_id)

                        if (driverForm) {
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-light text-gray-600">Form ID</span>
                                <FormIdCopy
                                  displayId={form?.tag}
                                  actualId={form.drivers_form_id}
                                  size="sm"
                                />
                              </div>
                              {driverInfo && (
                                <div className="space-y-2">
                                  <span className="text-sm font-light text-gray-600">Driver</span>
                                  <UserAvatar
                                    user={driverInfo.user}
                                    size="md"
                                    showName={true}
                                    showEmail={true}
                                  />
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-light text-gray-600">Start Date</span>
                                <span className="text-sm font-light">
                                  {new Date(driverForm.start_date).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-light text-gray-600">Status</span>
                                <Badge className={`text-xs ${driverForm.delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {driverForm.delivered ? 'Delivered' : 'Pending'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-light text-gray-600">Products</span>
                                <span className="text-sm font-light">{driverForm.collected_products?.length || 0}</span>
                              </div>
                            </>
                          )
                        } else {
                          return (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-light text-gray-600">Form ID</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-light">#{form.drivers_form_id.slice(0, 8)}</span>
                                <CopyButton text={form.drivers_form_id} />
                              </div>
                            </div>
                          )
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* Destination Silo Details */}
                {form.destination_silo_id && (
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-lg font-light">Destination Silo</h3>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const silo = getSiloById(form.destination_silo_id) || form.raw_milk_intake_form_destination_silo_id_fkey

                        if (silo) {
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-light text-gray-600">Silo Name</span>
                                <span className="text-sm font-light text-green-600">{silo.name}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-light text-gray-600">Location</span>
                                <span className="text-sm font-light">{silo.location}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-light text-gray-600">Capacity</span>
                                <span className="text-sm font-light">{silo.capacity.toLocaleString()}L</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-light text-gray-600">Current Volume</span>
                                <span className="text-sm font-light text-blue-600">{silo?.milk_volume?.toLocaleString()}L</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-light text-gray-600">Expected New</span>
                                <span className="text-sm font-light text-orange-600">
                                  {(silo.milk_volume + form.quantity_received).toLocaleString()}L
                                </span>
                              </div>

                              {/* Capacity Bar */}
                              <div className="mt-4">
                                <div className="flex justify-between text-xs font-light text-gray-600 mb-2">
                                  <span>Capacity Usage</span>
                                  <span>{Math.round((silo.milk_volume / silo.capacity) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.min((silo.milk_volume / silo.capacity) * 100, 100)}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </>
                          )
                        } else {
                          return (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-light text-gray-600">Silo ID</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-light">#{form.destination_silo_id.slice(0, 8)}</span>
                                <CopyButton text={form.destination_silo_id} />
                              </div>
                            </div>
                          )
                        }
                      })()}
                    </div>
                  </div>
                )}


              </div>

              {/* Record Information */}
              <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
                <h3 className="text-lg font-light mb-4">Record Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Created</span>
                    <span className="text-sm font-light">
                      {form.created_at ? format(new Date(form.created_at), 'PPP') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Last Updated</span>
                    <span className="text-sm font-light">
                      {form.updated_at ? format(new Date(form.updated_at), 'PPP') : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lab" className="mt-4">
              <div className="space-y-4">
                {currentResultSlip ? (
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-light">Lab Test</h3>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                          Completed
                        </Badge>
                        <LoadingButton 
                          size="sm" 
                          variant="outline" 
                          className="rounded-full"
                          onClick={handleExportLabTestCSV}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </LoadingButton>
                        <LoadingButton 
                          size="sm" 
                          variant="outline" 
                          className="rounded-full"
                          onClick={() => { 
                            setResultSlipMode("edit"); 
                            setResultSlipExistingId(currentResultSlip.id); 
                            setResultSlipDrawerOpen(true) 
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </LoadingButton>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Date</span><span className="text-sm font-light">{currentResultSlip.date}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Time In</span><span className="text-sm font-light">{currentResultSlip.time_in}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Time Out</span><span className="text-sm font-light">{currentResultSlip.time_out}</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Details Count</span><span className="text-sm font-light">{currentResultSlip.raw_milk_result_slip_details?.length || 0}</span></div>
                    </div>

                    {currentResultSlip.raw_milk_result_slip_details && currentResultSlip.raw_milk_result_slip_details.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-md font-light">Test Details</h4>
                        {currentResultSlip.raw_milk_result_slip_details.map((detail: any, index: number) => (
                          <div key={detail.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div className="flex items-center justify-between"><span className="text-gray-600">Temperature</span><span className="font-light">{detail.temperature}°C</span></div>
                              <div className="flex items-center justify-between"><span className="text-gray-600">pH</span><span className="font-light">{detail.ph}</span></div>
                              <div className="flex items-center justify-between"><span className="text-gray-600">Fat</span><span className="font-light">{detail.fat}%</span></div>
                              <div className="flex items-center justify-between"><span className="text-gray-600">Protein</span><span className="font-light">{detail.protein}%</span></div>
                              <div className="flex items-center justify-between"><span className="text-gray-600">Alcohol</span><span className="font-light">{detail.alcohol}</span></div>
                              <div className="flex items-center justify-between"><span className="text-gray-600">Resazurin</span><span className="font-light">{detail.resazurin}</span></div>
                              <div className="flex items-center justify-between"><span className="text-gray-600">Total Solids</span><span className="font-light">{detail.total_solids}</span></div>
                              <div className="flex items-center justify-between"><span className="text-gray-600">Density</span><span className="font-light">{detail.density}</span></div>
                              <div className="flex items-center justify-between"><span className="text-gray-600">Starch</span><span className="font-light">{detail.starch ? "Yes" : "No"}</span></div>
                            </div>
                            {detail.remark && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="text-xs text-gray-600">Remark: </span>
                                <span className="text-xs font-light">{detail.remark}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-light">Lab Test</h3>
                      <Badge className="text-xs bg-yellow-100 text-yellow-800">No Result</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">No result slip found for this intake form.</p>
                    <LoadingButton className="rounded-full" onClick={() => { setResultSlipMode("create"); setResultSlipExistingId(undefined); setResultSlipDrawerOpen(true) }}>Create Lab Test</LoadingButton>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <RawMilkResultSlipDrawer
          open={resultSlipDrawerOpen}
          onOpenChange={setResultSlipDrawerOpen}
          rawMilkIntakeFormId={form.id}
          mode={resultSlipMode}
          existingId={resultSlipExistingId}
          existingData={currentResultSlip}
        />
      </SheetContent>
    </Sheet>
  )
}