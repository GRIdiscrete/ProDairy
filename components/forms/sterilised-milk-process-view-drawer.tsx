"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SterilisedMilkProcess, SterilisedMilkProcessDetails } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { Button } from "@/components/ui/button"
import { Beaker, FileText, CheckCircle, User, Package, ArrowRight, Hash, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { filmaticLinesForm1Api } from "@/lib/api/filmatic-lines-form-1"
import { FormIdCopy } from "@/components/ui/form-id-copy"

interface SterilisedMilkProcessViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process: SterilisedMilkProcess | null
  processDetails?: SterilisedMilkProcessDetails[]
  onEdit?: () => void
  formMap?: Record<string, { tag?: string }>
}

export function SterilisedMilkProcessViewDrawer({ 
  open, 
  onOpenChange, 
  process,
  processDetails,
  onEdit,
  formMap
}: SterilisedMilkProcessViewDrawerProps) {
  if (!process) return null

  // --- Normalize processDetails: accept array, single object or prop fallback ---
  const processDetailsData: SterilisedMilkProcessDetails[] = (() => {
    const pd = (process as any).sterilised_milk_process_details_fkey
    if (Array.isArray(pd)) return pd
    if (pd && typeof pd === "object") return [pd]
    if (Array.isArray(processDetails)) return processDetails
    return processDetails ? processDetails : []
  })()

  // --- batch (API may provide single batch object under batch_id) ---
  const batch: any = (process as any).batch_id || null

  const getPersonName = (person: any) => {
    if (!person) return "Unknown"
    return `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email || "Unknown"
  }

  const getPersonDetails = (person: any) => {
    if (!person) return { name: "Unknown", email: "", department: "" }
    return {
      name: getPersonName(person),
      email: person.email || "",
      department: person.department || "",
      role: person.users_role_id_fkey?.role_name || ""
    }
  }

  const approvedBy = getPersonDetails(process.sterilised_milk_process_approved_by_fkey)
  const operator = getPersonDetails(process.sterilised_milk_process_operator_id_fkey)
  const supervisor = getPersonDetails(process.sterilised_milk_process_supervisor_id_fkey)

  // --- derive filmatic form tag from passed formMap first, then fallback to fetch if needed ---
  const [formTag, setFormTag] = useState<string | undefined>(() => {
    if (formMap && process.filmatic_form_id) return formMap[process.filmatic_form_id]?.tag
    return undefined
  })
  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (formTag || !process.filmatic_form_id) return
      try {
        const list = await filmaticLinesForm1Api.getForms()
        if (!mounted) return
        const found = (list || []).find((f: any) => f.id === process.filmatic_form_id)
        if (found) {
          setFormTag(found.tag || found.name || undefined)
        }
      } catch (err) {
        // ignore
      }
    }
    load()
    return () => { mounted = false }
  }, [process.filmatic_form_id, formTag, formMap])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <SheetTitle className="text-lg font-light">Current Sterilised Milk Process</SheetTitle>
                <SheetDescription className="text-sm font-light">
                  Complete information about the sterilised milk process and its parameters
                </SheetDescription>
              </div>
              <Badge className="bg-green-100 text-green-800 font-medium px-3 py-1 rounded-full">
                Latest
              </Badge>
            </div>
            {onEdit && (
              <Button
                onClick={onEdit}
                
                size="sm"
                className=" bg-[#006BC4] text-white rounded-full"
              >
                Edit
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Process Overview */}
          <div className="mb-2 p-6  from-blue-50 to-cyan-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-light">Filmatic Lines 1</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">Process Log</span>
                  <div className=" bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-light">Filmatic Lines 2</span>
              </div>
            </div>
          </div>

          {/* Process Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Process Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Process ID</span>
                  <p className="text-sm font-light">{process.id}</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Created At</span>
                  <p className="text-sm font-light">
                    {process.created_at ? format(new Date(process.created_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Updated At</span>
                  <p className="text-sm font-light">
                    {process.updated_at ? format(new Date(process.updated_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Filmatic Form</span>
                  <p className="text-sm font-light">
                    {process.filmatic_form_id ? (
                      <span className="inline-flex items-center space-x-2">
                        <FormIdCopy displayId={formTag} actualId={process.filmatic_form_id} size="sm" />
                      </span>
                    ) : "Not linked"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Data (grouped label / value) */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Hash className="h-4 w-4 text-gray-600" />
                </div>
                <CardTitle className="text-base font-light">Batch Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {process ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Batch ID</span>
                    <p className="text-sm">{batch.id || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Batch Number</span>
                    <p className="text-sm">#{batch.batch_number ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Date</span>
                    <p className="text-sm">{batch.date || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Filling Start (time)</span>
                    <p className="text-sm">{batch.filling_start_details?.time ?? batch.filling_start ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Filling Temp (°C)</span>
                    <p className="text-sm">{batch.filling_start_details?.temperature ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Sterilization Start (time)</span>
                    <p className="text-sm">{batch.sterilization_start_details?.time ?? batch.sterilization_start ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Sterilization Finish (time)</span>
                    <p className="text-sm">{batch.sterilization_finish_details?.time ?? batch.sterilization_finish ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Sterilization Finish Temp (°C)</span>
                    <p className="text-sm">{batch.sterilization_finish_details?.temperature ?? "—"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No batch data available for this process.</p>
              )}
            </CardContent>
          </Card>

          {/* Personnel Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Personnel Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Approved By */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Approved By</h4>
                <div className="pl-4 space-y-1">
                  <p className="text-sm font-light"><span className="font-medium">Name:</span> {approvedBy.name}</p>
                  <p className="text-sm font-light"><span className="font-medium">Email:</span> {approvedBy.email}</p>
                  <p className="text-sm font-light"><span className="font-medium">Department:</span> {approvedBy.department}</p>
                  {approvedBy.role && (
                    <p className="text-sm font-light"><span className="font-medium">Role:</span> {approvedBy.role}</p>
                  )}
                </div>
              </div>

              {/* Operator and Supervisor in a row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Operator */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Operator</h4>
                  <div className="space-y-1">
                    <p className="text-sm font-light">Name: {operator.name}</p>
                    <p className="text-sm font-light">Email: {operator.email}</p>
                    <p className="text-sm font-light">Department: {operator.department}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Operator Signature</p>
                    {process.operator_signature ? (
                      <img src={base64ToPngDataUrl(process.operator_signature)} alt="Operator signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                    ) : (
                      <p className="text-sm text-muted-foreground">No signature</p>
                    )}
                  </div>
                </div>

                {/* Supervisor */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Supervisor</h4>
                  <div className="space-y-1">
                    <p className="text-sm font-light">Name: {supervisor.name}</p>
                    <p className="text-sm font-light">Email: {supervisor.email}</p>
                    <p className="text-sm font-light">Department: {supervisor.department}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Supervisor Signature</p>
                    {process.supervisor_signature ? (
                      <img src={base64ToPngDataUrl(process.supervisor_signature)} alt="Supervisor signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                    ) : (
                      <p className="text-sm text-muted-foreground">No signature</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Information (single batch) */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Beaker className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Batch Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {batch ? (
                <div className="space-y-2">
                  <p className="text-sm font-light"><span className="font-medium">Batch number:</span> #{batch.batch_number}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Filling Start:</span> {batch.filling_start?.time || 'N/A'}</p>
                      <p className="text-sm font-light"><span className="font-medium">Temperature:</span> {batch.filling_start?.temperature ?? 'N/A'}°C</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Sterilization Start:</span> {batch.sterilization_start?.time || 'N/A'}</p>
                      <p className="text-sm font-light"><span className="font-medium">Sterilization Finish:</span> {batch.sterilization_finish?.time || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No batch information available for this process.</p>
              )}
            </CardContent>
          </Card>

          {/* Process Details (use normalized processDetailsData) */}
          {processDetailsData && processDetailsData.length > 0 ? (
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Beaker className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-light">Process Parameters</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {processDetailsData.map((detail, index) => {
                  // support multiple possible field namings: prefer detail.*_details.* -> legacy names -> fallback
                  const getValue = (primaryKey: string, altKey?: string) => {
                    // primaryKey examples: 'filling_start' -> check detail.filling_start_reading, detail.filling_start_details?.temperature etc
                    // explicit checks for common shapes:
                    const pkReading = (detail as any)[`${primaryKey}_reading`]
                    const pkDetails = (detail as any)[`${primaryKey}_details`]
                    if (pkReading !== undefined && pkReading !== null) return pkReading
                    if (pkDetails && typeof pkDetails === "object" && (pkDetails.temperature !== undefined || pkDetails.time !== undefined)) {
                      // expose temperature where appropriate (if available)
                      return pkDetails.temperature ?? pkDetails.time ?? pkDetails.value ?? "N/A"
                    }
                    if (altKey) {
                      const alt = (detail as any)[altKey]
                      if (alt !== undefined) return alt
                    }
                    return "N/A"
                  }

                  return (
                    <div key={detail.id || index} className="space-y-4">
                      {index > 0 && <Separator />}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{(detail as any).parameter_name || `Parameter ${index + 1}`}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-100 text-blue-800 font-light">Process Details</Badge>
                            <Badge className="bg-green-100 text-green-800 font-medium">Latest</Badge>
                          </div>
                        </div>

                        {/* Filling Readings */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">Filling Readings</h5>
                          <div className="grid grid-cols-2 gap-4 pl-4">
                            <div>
                              <p className="text-sm font-light"><span className="font-medium">Start:</span> {String(getValue('filling_start'))}</p>
                            </div>
                          </div>
                        </div>

                        {/* Autoclave Readings */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">Autoclave Readings</h5>
                          <div className="grid grid-cols-2 gap-4 pl-4">
                            <div>
                              <p className="text-sm font-light"><span className="font-medium">Start:</span> {String(getValue('autoclave_start'))}</p>
                            </div>
                          </div>
                        </div>

                        {/* Heating Readings */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">Heating Readings</h5>
                          <div className="grid grid-cols-2 gap-4 pl-4">
                            <div>
                              <p className="text-sm font-light"><span className="font-medium">Start:</span> {String(getValue('heating_start'))}</p>
                            </div>
                            <div>
                              <p className="text-sm font-light"><span className="font-medium">Finish:</span> {String(getValue('heating_finish'))}</p>
                            </div>
                          </div>
                        </div>

                        {/* Sterilization Readings */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground">Sterilization Readings</h5>
                          <div className="grid grid-cols-2 gap-4 pl-4">
                            <div>
                              <p className="text-sm font-light"><span className="font-medium">Start:</span> {String(getValue('sterilization_start'))}</p>
                            </div>
                            <div>
                              <p className="text-sm font-light"><span className="font-medium">After 5-6 min:</span> {String(getValue('sterilization_after_five_six_minutes') || getValue('sterilization_after_5'))}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm font-light"><span className="font-medium">Finish:</span> {String(getValue('sterilization_finish'))}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No process details available for this process.</p>
              </CardContent>
            </Card>
          )}

        </div>
      </SheetContent>
    </Sheet>
  )
}
