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
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchRawMilkResultSlips, deleteRawMilkResultSlip } from "@/lib/store/slices/rawMilkResultSlipSlice"
import { fetchTankers } from "@/lib/store/slices/tankerSlice"
import { fetchSilos } from "@/lib/store/slices/siloSlice"
import { FormIdCopy } from "@/components/ui/form-id-copy"
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
  const { items: tankers, isInitialized: tankersInitialized } = useAppSelector((s) => (s as any).tankers)
  const { silos, operationLoading: siloLoading } = useAppSelector((s) => (s as any).silo)
  const [resultSlipDrawerOpen, setResultSlipDrawerOpen] = useState(false)
  const [resultSlipMode, setResultSlipMode] = useState<"create" | "edit">("create")
  const [resultSlipExistingId, setResultSlipExistingId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (open) {
      if (!isInitialized) dispatch(fetchRawMilkResultSlips())
      if (!tankersInitialized) dispatch(fetchTankers())
      if (!siloLoading.fetch && silos.length === 0) dispatch(fetchSilos())
    }
  }, [open, isInitialized, tankersInitialized, siloLoading.fetch, silos.length, dispatch])

  const currentResultSlip = useMemo(() => {
    if (!form) return null
    return (slips || []).find((s: any) => s.raw_milk_intake_id === form.id) || null
  }, [slips, form])

  // Helper: resolve tanker registration number
  const tanker = useMemo(() => {
    if (!form) return null
    return tankers.find((t: any) => t.id === form.truck || t.reg_number === form.truck)
  }, [tankers, form?.truck])

  // Calculate total quantity from all details (nulls are skipped)
  // Quantity is derived from flow meter readings when not explicitly provided
  const totalQuantity = useMemo(() => {
    if (!form) return 0
    return (form.details ?? []).reduce((sum, detail) => {
      let q = detail.quantity
      if (q == null && detail.flow_meter_end_reading != null && detail.flow_meter_start_reading != null) {
        q = detail.flow_meter_end_reading - detail.flow_meter_start_reading
      }
      return sum + (q ?? 0)
    }, 0)
  }, [form?.details])

  if (!form) return null

  // Helper: resolve operator display name
  const operatorName = typeof form.operator === "string"
    ? form.operator
    : `${(form.operator as any)?.first_name ?? ""} ${(form.operator as any)?.last_name ?? ""}`.trim()

  const truckDisplay = tanker?.reg_number || form.truck

  // Helper function for individual detail quantity
  const getDetailQuantity = (detail: any): number | null => {
    if (detail.quantity != null) return detail.quantity
    if (detail.flow_meter_end_reading != null && detail.flow_meter_start_reading != null) {
      return detail.flow_meter_end_reading - detail.flow_meter_start_reading
    }
    return null
  }

  const getSiloByName = (name: string) => silos.find(s => s.name === name || s.id === name)

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

  const formatSafeDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "N/A"
    const parsedDate = new Date(dateStr)
    if (isNaN(parsedDate.getTime())) {
      const cleanDate = dateStr.replace(' ', 'T')
      const d2 = new Date(cleanDate)
      if (!isNaN(d2.getTime())) {
        return d2.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }
      return "Invalid Date"
    }
    return parsedDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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
                      <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Date</span>
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatSafeDate(form.created_at)}</span>
                        </div>
                      </div>
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
                        <span className="text-sm font-light text-blue-600">{truckDisplay}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">Total Quantity</span>
                        <span className="text-sm font-light text-blue-600 font-medium">{totalQuantity.toLocaleString()} L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-light text-gray-600">Compartments</span>
                        <Badge variant="outline" className="font-normal border-blue-100 text-blue-700 bg-blue-50/30">{form.details.length}</Badge>
                      </div>
                    </div>
                    {form.updated_at && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Last Sync</span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(form.updated_at || "").toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
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
                      {operatorName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                            {operatorName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{operatorName}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Unknown operator</p>
                      )}
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
                      return (
                        <div key={detail.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                Compartment #{detail.truck_compartment_number}
                              </Badge>
                              {detail.status && (
                                <Badge
                                  className={
                                    detail.status === "final" ? "bg-green-100 text-green-800" :
                                      detail.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                        "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {detail.status}
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm font-light text-blue-600">
                              {(() => { const q = getDetailQuantity(detail); return q != null ? `${q.toFixed(0)}L` : '—' })()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <span className="text-xs text-gray-500">Destination Silo</span>
                              <p className="text-sm font-light text-green-600">{detail.silo_name}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Derived Quantity</span>
                              <p className="text-sm font-light">
                                {(() => { const q = getDetailQuantity(detail); return q != null ? `${q.toFixed(0)}L` : 'N/A' })()}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Flow Meter Readings</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-xs text-gray-500">Start Time</span>
                                <p className="text-sm font-light">{detail.flow_meter_start ?? "—"}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Reading: {detail.flow_meter_start_reading ?? "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">End Time</span>
                                <p className="text-sm font-light">{detail.flow_meter_end ?? "—"}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Reading: {detail.flow_meter_end_reading ?? "—"}
                                </p>
                              </div>
                            </div>
                          </div>
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
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600 font-light">Date</span><span className="text-sm font-light">{currentResultSlip.date}</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600 font-light">Time In</span><span className="text-sm font-light">{currentResultSlip.time_in}</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600 font-light">Time Out</span><span className="text-sm font-light">{currentResultSlip.time_out}</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600 font-light">Compartments Count</span><span className="text-sm font-light">{currentResultSlip.lab_test?.length || 0}</span></div>
                      </div>

                      {currentResultSlip.lab_test && currentResultSlip.lab_test.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-md font-light text-blue-800">Compartment Analysis Results</h4>
                          {currentResultSlip.lab_test.map((detail: any, index: number) => (
                            <div key={detail.id || index} className="p-5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                                <span className="text-sm font-medium text-gray-700">Compartment #{detail.truck_compartment_number || index + 1}</span>
                                <Badge variant="outline" className={cn("font-light", detail.pass ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200")}>
                                  {detail.pass ? "Pass" : "Fail"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Temp</span>
                                  <p className="text-sm font-light text-gray-900">{detail.temperature != null ? `${detail.temperature}°C` : "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">pH</span>
                                  <p className="text-sm font-light text-gray-900">{detail.ph ?? "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Fat</span>
                                  <p className="text-sm font-light text-gray-900">{detail.fat != null ? `${detail.fat}%` : "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Protein</span>
                                  <p className="text-sm font-light text-gray-900">{detail.protein != null ? `${detail.protein}%` : "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Density</span>
                                  <p className="text-sm font-light text-gray-900">{detail.density ?? "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Alcohol</span>
                                  <p className="text-sm font-light text-gray-900">{detail.alcohol ?? "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Total Solids</span>
                                  <p className="text-sm font-light text-gray-900">{detail.total_solids ?? "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">LR/SNF</span>
                                  <p className="text-sm font-light text-gray-900">{detail.lr_snf ?? "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">T. Acidity</span>
                                  <p className="text-sm font-light text-gray-900">{detail.titratable_acidity ?? "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">FPD</span>
                                  <p className="text-sm font-light text-gray-900">{detail.fpd ?? "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">SCC</span>
                                  <p className="text-sm font-light text-gray-900">{detail.scc ?? "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Starch</span>
                                  <p className="text-sm font-light text-gray-900">{detail.starch != null ? (detail.starch ? "Yes" : "No") : "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Antibiotics</span>
                                  <p className="text-sm font-light text-gray-900">{detail.antibiotics != null ? (detail.antibiotics ? "Positive" : "Negative") : "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">COB</span>
                                  <p className="text-sm font-light text-gray-900">{detail.cob != null ? (detail.cob ? "Positive" : "Negative") : "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Resazurin</span>
                                  <p className="text-sm font-light text-gray-900">{detail.resazurin || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">OT</span>
                                  <p className="text-sm font-light text-gray-900">{detail.ot || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Test Time</span>
                                  <p className="text-sm font-light text-gray-900">{detail.time || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light">Accepted</span>
                                  <Badge variant="outline" className={cn("font-light h-5 px-1.5 text-[10px]", detail.accepted ? "text-green-600 border-green-200 bg-green-50" : "text-gray-500 border-gray-200")}>
                                    {detail.accepted ? "Yes" : "No"}
                                  </Badge>
                                </div>
                              </div>
                              {detail.remark && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-light block mb-1">Remark</span>
                                  <p className="text-xs font-light text-gray-600 bg-white p-2 rounded border border-gray-100">{detail.remark}</p>
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