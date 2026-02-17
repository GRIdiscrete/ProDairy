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
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { UserAvatar } from "@/components/ui/user-avatar"
import { RawMilkResultSlipDrawer } from "@/components/forms/raw-milk-result-slip-drawer"
import type { RawMilkIntakeForm } from "@/lib/api/raw-milk-intake"

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
  const [activeTab, setActiveTab] = useState<string>("details")
  const dispatch = useAppDispatch()
  const { slips, isInitialized, operationLoading } = useAppSelector((s) => (s as any).rawMilkResultSlips)
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const { silos } = useAppSelector((state: RootState) => state.silo)
  const [resultSlipDrawerOpen, setResultSlipDrawerOpen] = useState(false)
  const [resultSlipMode, setResultSlipMode] = useState<"create" | "edit">("create")
  const [resultSlipExistingId, setResultSlipExistingId] = useState<string | undefined>(undefined)

  // Helper function to get silo by name
  const getSiloByName = (siloName: string) => {
    return silos.find((silo: any) => silo.name === siloName)
  }

  useEffect(() => {
    if (open && !isInitialized) {
      dispatch(fetchRawMilkResultSlips())
    }
  }, [open, isInitialized, dispatch])

  const currentResultSlip = useMemo(() => {
    if (!form) return null
    return (slips || []).find((s: any) => s.raw_milk_intake_id === form.id) || null
  }, [slips, form])

  if (!form) return null

  // Calculate total quantity from all details
  const totalQuantity = form.details.reduce((sum, detail) => sum + (detail.quantity || 0), 0)

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
      "Silo": getSiloByName(detail.silo)?.name || detail.silo || '',
      "Remark": detail.remark || ''
    }))

    const headers = Object.keys(formatTestData[0])
    const csvContent = [
      headers.join(','),
      ...formatTestData.map((row: any) => headers.map(header => `"${row[header]}"`).join(','))
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <SheetTitle className="text-lg font-light m-0">Raw Milk Intake Form Details</SheetTitle>
                <SheetDescription className="text-sm font-light">
                  Complete information about the raw milk intake form record
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!currentResultSlip && (
                <LoadingButton

                  size="sm"
                  onClick={() => {
                    setResultSlipMode("create");
                    setResultSlipExistingId(undefined);
                    setResultSlipDrawerOpen(true);
                    setActiveTab("lab");
                  }}
                  className="bg-[#006BC4] text-white border-0 rounded-full"
                >
                  <Beaker className="w-4 h-4 mr-2" />
                  Create Lab Test
                </LoadingButton>
              )}
              <LoadingButton

                size="sm"
                onClick={onEdit}
                className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </LoadingButton>
              <LoadingButton
                variant="destructive"
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </LoadingButton>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Process Overview */}
          <div className="mb-8 p-6  from-blue-50 to-cyan-50 rounded-lg">
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
                        <span className="text-sm font-light text-gray-600">Form Tag</span>
                        <FormIdCopy
                          displayId={form.tag || "N/A"}
                          actualId={form.id || ""}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">Truck</span>
                        <span className="text-sm font-light text-blue-600">{form.truck}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">Total Quantity</span>
                        <span className="text-sm font-light text-blue-600">{totalQuantity.toFixed(2)}L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">Compartments</span>
                        <Badge variant="outline" className="font-light">{form.details.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">Created</span>
                        <span className="text-sm font-light">
                          {new Date(form.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {form.updated_at && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-light text-gray-600">Last Updated</span>
                          <span className="text-sm font-light">
                            {new Date(form.updated_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operator Information */}
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-light">Operator Information</h3>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const operatorUser = users.find((user: any) => user.id === form.operator)

                        if (operatorUser) {
                          return (
                            <UserAvatar
                              user={operatorUser}
                              size="lg"
                              showName={true}
                              showEmail={true}
                              showDropdown={true}
                            />
                          )
                        }

                        return (
                          <div className="text-sm text-gray-500">
                            <p>Operator ID: {form.operator}</p>
                            <p className="text-xs text-gray-400 mt-1">User details not available</p>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* Compartment Details */}
                <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-light">Compartment Details</h3>
                  </div>
                  <div className="space-y-4">
                    {form.details.map((detail, idx) => {
                      const silo = getSiloByName(detail.silo_name)

                      return (
                        <div key={detail.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                Compartment #{detail.truck_compartment_number}
                              </Badge>
                              <Badge
                                className={
                                  detail.status === "final" ? "bg-green-100 text-green-800" :
                                    detail.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                      "bg-gray-100 text-gray-800"
                                }
                              >
                                {detail.status}
                              </Badge>
                            </div>
                            <span className="text-sm font-light text-blue-600">{detail.quantity}L</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <span className="text-xs text-gray-500">Destination Silo</span>
                              <p className="text-sm font-light text-green-600">{detail.silo_name}</p>
                              {silo && (
                                <p className="text-xs text-gray-500">
                                  Capacity: {silo.capacity?.toLocaleString()}L
                                </p>
                              )}
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Quantity</span>
                              <p className="text-sm font-light">{detail.quantity}L</p>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Flow Meter Readings</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-xs text-gray-500">Start Time</span>
                                <p className="text-sm font-light">
                                  {new Date(detail.flow_meter_start).toLocaleString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Reading: {detail.flow_meter_start_reading}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">End Time</span>
                                <p className="text-sm font-light">
                                  {new Date(detail.flow_meter_end).toLocaleString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Reading: {detail.flow_meter_end_reading}
                                </p>
                              </div>
                            </div>
                          </div>

                          {detail.created_at && (
                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Created: {new Date(detail.created_at).toLocaleDateString()}</span>
                                {detail.updated_at && (
                                  <span>Updated: {new Date(detail.updated_at).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Record Information */}
                <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-light mb-4">Record Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Record ID</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-gray-500">{form.id.slice(0, 8)}...</span>
                        <CopyButton text={form.id} />
                      </div>
                    </div>
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
                    {form.updated_by && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">Updated By</span>
                        <span className="text-xs font-mono text-gray-500">{form.updated_by.slice(0, 8)}...</span>
                      </div>
                    )}
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

                            className="rounded-full"
                            onClick={handleExportLabTestCSV}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                          </LoadingButton>
                          <LoadingButton
                            size="sm"

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
        </div>

        <RawMilkResultSlipDrawer
          open={resultSlipDrawerOpen}
          onOpenChange={setResultSlipDrawerOpen}
          rawMilkIntakeFormId={form.id}
          mode={resultSlipMode}
          existingId={resultSlipExistingId}
          existingData={currentResultSlip}
          driverFormId={(form as any).drivers_form_id}
          onSuccess={(result) => {
            // Refetch the test data
            dispatch(fetchRawMilkResultSlips())
            // Reselect the updated item ID
            if (result && result.id) {
              setResultSlipExistingId(result.id)
            }
            // Switch to lab tab to show updated data
            setActiveTab("lab")
          }}
        />
      </SheetContent>
    </Sheet>
  )
}