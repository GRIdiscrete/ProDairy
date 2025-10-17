"use client"

import { useState, useEffect, useCallback } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SteriMilkProcessLog } from "@/lib/api/steri-milk-process-log"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Beaker, FileText, CheckCircle, User, Package, ArrowRight, Hash, Clock, Thermometer, Gauge, Factory, Plus, Eye, Edit } from "lucide-react"
import { SteriMilkTestReportFormDrawer } from "./steri-milk-test-report-form-drawer"
import { SteriMilkPostTestFormDrawer } from "./steri-milk-post-test-form-drawer"
import { labTestPostProcessApi, type LabTestPostProcessEntity } from "@/lib/api/lab-test-post-process"
import { steriMilkTestReportApi, type SteriMilkTestReport } from "@/lib/api/steri-milk-test-report"
import { rolesApi } from "@/lib/api/roles"
import { filmaticLinesForm1Api } from "@/lib/api/filmatic-lines-form-1"
import { FormIdCopy } from "@/components/ui/form-id-copy"

interface SteriMilkProcessLogViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: SteriMilkProcessLog | null
  onEdit?: () => void
  formMap?: Record<string, { tag?: string }>
}

export function SteriMilkProcessLogViewDrawer({ 
  open, 
  onOpenChange, 
  log,
  onEdit,
  formMap
}: SteriMilkProcessLogViewDrawerProps) {
  const [testReports, setTestReports] = useState<SteriMilkTestReport[]>([])
  const [showTestReportForm, setShowTestReportForm] = useState(false)
  const [showPostTestForm, setShowPostTestForm] = useState(false)
  const [loadingTestReports, setLoadingTestReports] = useState(false)
  const [postTests, setPostTests] = useState<LabTestPostProcessEntity[]>([])
  const [loadingPostTests, setLoadingPostTests] = useState(false)
  const [approverRoleName, setApproverRoleName] = useState<string | null>(null)

  // prefer tag from formMap if provided
  const [filmaticFormTag, setFilmaticFormTag] = useState<string | null>(() => {
    if (formMap && log?.filmatic_form_id) return formMap[log.filmatic_form_id]?.tag ?? null
    return null
  })

  const loadTestReports = useCallback(async () => {
    try {
      setLoadingTestReports(true)
      const response = await steriMilkTestReportApi.getTestReports()
      setTestReports(response.data || [])
    } catch (error) {
      console.error("Failed to load test reports:", error)
      setTestReports([])
    } finally {
      setLoadingTestReports(false)
    }
  }, [])

  useEffect(() => {
    if (!open || !log) return
    loadTestReports()
    const loadPost = async () => {
      try {
        setLoadingPostTests(true)
        const resp = await labTestPostProcessApi.getAll()
        setPostTests(resp.data || [])
      } catch (e) {
        setPostTests([])
      } finally {
        setLoadingPostTests(false)
      }
    }
    loadPost()
  }, [open, log, loadTestReports])

  // load approver role and filmatic tag (if not provided by formMap)
  useEffect(() => {
    let mounted = true
    const loadMeta = async () => {
      if (!log) return

      // approver role
      try {
        if (log.approver_id) {
          const rolesResp = await rolesApi.getRoles({ filters: { id: log.approver_id } } as any)
          const role = (rolesResp.data || []).find((r: any) => r.id === log.approver_id) || rolesResp.data?.[0]
          if (mounted) setApproverRoleName(role?.role_name ?? null)
        } else {
          if (mounted) setApproverRoleName(null)
        }
      } catch {
        if (mounted) setApproverRoleName(null)
      }

      // filmatic tag: only fetch if we don't already have it from formMap
      if (!filmaticFormTag && log.filmatic_form_id) {
        try {
          if (filmaticLinesForm1Api.getForm) {
            const resp = await filmaticLinesForm1Api.getForm(log.filmatic_form_id)
            const form = resp?.data ?? resp
            if (mounted) setFilmaticFormTag(form?.tag ?? form?.name ?? null)
          } else {
            const all = await filmaticLinesForm1Api.getForms()
            const form = (all || []).find((f: any) => f.id === log.filmatic_form_id)
            if (mounted) setFilmaticFormTag(form?.tag ?? form?.name ?? null)
          }
        } catch {
          if (mounted) setFilmaticFormTag(null)
        }
      }
    }

    loadMeta()
    return () => { mounted = false }
  }, [log, filmaticFormTag])

  if (!log) return null

  // single batch from new API
  const batch: any = (log as any).batch_id || null

  // helper array for process times/readings display (safe primitives)
  const detailItems = [
    { key: "Filling Start", detail: batch?.filling_start_details, fallback: batch?.filling_start },
    { key: "Autoclave Start", detail: batch?.autoclave_start_details, fallback: batch?.autoclave_start },
    { key: "Heating Start", detail: batch?.heating_start_details, fallback: batch?.heating_start },
    { key: "Heating Finish", detail: batch?.heating_finish_details, fallback: batch?.heating_finish },
    { key: "Sterilization Start", detail: batch?.sterilization_start_details, fallback: batch?.sterilization_start },
    { key: "Sterilization After 5", detail: batch?.sterilization_after_5_details, fallback: batch?.sterilization_after_5 },
    { key: "Sterilization Finish", detail: batch?.sterilization_finish_details, fallback: batch?.sterilization_finish },
    { key: "Pre Cooling Start", detail: batch?.pre_cooling_start_details, fallback: batch?.pre_cooling_start },
    { key: "Pre Cooling Finish", detail: batch?.pre_cooling_finish_details, fallback: batch?.pre_cooling_finish },
    { key: "Cooling 1 Start", detail: batch?.cooling_1_start_details, fallback: batch?.cooling_1_start },
    { key: "Cooling 1 Finish", detail: batch?.cooling_1_finish_details, fallback: batch?.cooling_1_finish },
    { key: "Cooling 2 Start", detail: batch?.cooling_2_start_details, fallback: batch?.cooling_2_start },
    { key: "Cooling 2 Finish", detail: batch?.cooling_2_finish_details, fallback: batch?.cooling_2_finish },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <SheetTitle className="text-lg font-light">Steri Milk Process Log</SheetTitle>
                <SheetDescription className="text-sm font-light">
                  Complete information about the Steri Milk Process Log and its batch data
                </SheetDescription>
              </div>
              <Badge className={`${log.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} font-medium px-3 py-1 rounded-full`}>
                {log.approved ? "Approved" : "Pending"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              {(() => {
                const batchNumbers = batch ? [batch.batch_number] : []
                const hasTest = batchNumbers.some(bn => testReports.some(r => r.batch_number === bn))
                const hasPost = batchNumbers.some(bn => postTests.some(p => p.batch_number === bn))
                return (
                  <>
                    <Button
                      onClick={() => setShowTestReportForm(true)}
                      variant="outline"
                      size="sm"
                      className={`border-0 rounded-full ${hasTest ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"}`}
                    >
                      <Beaker className="h-4 w-4 mr-1" />
                      {hasTest ? "Edit Test Report" : "Create Test Report"}
                    </Button>
                    <Button
                      onClick={() => setShowPostTestForm(true)}
                      variant="outline"
                      size="sm"
                      className={`border-0 rounded-full ${hasPost ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"}`}
                    >
                      <Beaker className="h-4 w-4 mr-1" />
                      {hasPost ? "Edit Post Test" : "Create Post Test"}
                    </Button>
                  </>
                )
              })()}
              {onEdit && (
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 rounded-full"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Process Overview */}
          <div className="mb-2 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Factory className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm font-light">Filmatic Lines 1</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">Process Log</span>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Factory className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Filmatic Lines 2</span>
              </div>
            </div>
          </div>

          {/* Log Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Log Information</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Log ID</span>
                  <div className="mt-1">
                    <FormIdCopy displayId={log.tag} actualId={log.id} size="sm" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-light text-gray-500">Form</span>
                  <p className="text-sm font-light">
                    {filmaticFormTag ?? (log.filmatic_form_id ? `Form #${String(log.filmatic_form_id).slice(0, 8)}` : "Not linked")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Updated At</span>
                  <p className="text-sm font-light">{log.updated_at ? format(new Date(log.updated_at), "PPP 'at' p") : "N/A"}</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Approver</span>
                  <p className="text-sm font-light">{approverRoleName ?? (log.approver_id ? `Approver #${String(log.approver_id).slice(0, 8)}` : "Not assigned")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Filmatic Form ID</span>
                  <p className="text-sm font-light">{log.filmatic_form_id ? `Form #${String(log.filmatic_form_id).slice(0, 8)}` : "Not linked"}</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Batch</span>
                  <p className="text-sm font-light">{batch ? `#${batch.batch_number}` : "No batch"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Information (single batch_id) */}
          {batch && (
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-base font-light">Batch Information</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Batch Details</h4>
                  <div className="grid grid-cols-2 gap-4 pl-4">
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Batch ID:</span> {batch.id ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Batch Number:</span> #{batch.batch_number ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Date:</span> {batch.date ?? "—"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Process Times & Readings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    {detailItems.map(item => {
                      // compute safe display values: fallback may be a primitive or an object { time, temperature, pressure }
                      const fb = item.fallback as any
                      const fbIsObj = fb && typeof fb === "object"

                      const timeVal = item.detail?.time ?? (fbIsObj ? fb.time : fb) ?? "N/A"

                      const tempRaw = item.detail?.temperature ?? (fbIsObj ? fb.temperature : null)
                      const tempVal = tempRaw != null ? `${tempRaw}°C` : "N/A"

                      const pressureRaw = item.detail?.pressure ?? (fbIsObj ? fb.pressure : null)
                      const pressureVal = pressureRaw != null ? `${pressureRaw} Bar` : "N/A"

                      return (
                        <div key={String(item.key)} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{item.key}</span>
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div><span className="font-medium">Time:</span> {timeVal}</div>
                            <div><span className="font-medium">Temp:</span> {tempVal}</div>
                            <div><span className="font-medium">Pressure:</span> {pressureVal}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />
              </CardContent>
            </Card>
          )}

          {/* Approval Status */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-base font-light">Approval Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light">Status</span>
                <Badge className={log.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {log.approved ? 'Approved' : 'Pending Approval'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light">Approver</span>
                <span className="text-sm font-light">
                  {approverRoleName ? approverRoleName : (log.approver_id ? `Approver #${String(log.approver_id).slice(0,8)}` : "Not assigned")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Log Metadata */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardContent className="py-4">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p><span className="font-medium">Created:</span> {log.created_at ? format(new Date(log.created_at), "PPP 'at' p") : "N/A"}</p>
                </div>
                <div>
                  <p><span className="font-medium">Updated:</span> {log.updated_at ? format(new Date(log.updated_at), "PPP 'at' p") : "N/A"}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <Clock className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Latest Steri Milk Process Log</span>
              </div>
            </CardContent>
          </Card>

          {/* Test Reports Section */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <Beaker className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-base font-light">Test Reports</CardTitle>
                </div>
                {(() => {
                  const batchNumbers = log.steri_milk_process_log_batch?.map(b => b.batch_number) || []
                  const hasTest = batchNumbers.some(bn => testReports.some(r => r.batch_number === bn))
                  return (
                    <Button
                      onClick={() => setShowTestReportForm(true)}
                      size="sm"
                      className={`${hasTest ? 'border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full'}`}
                      variant={hasTest ? 'outline' : undefined as any}
                    >
                      {hasTest ? <Edit className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                      {hasTest ? 'Edit Test Report' : 'Create Test Report'}
                    </Button>
                  )
                })()}
              </div>
            </CardHeader>
            <CardContent>
              {loadingTestReports ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading test reports...</p>
                </div>
              ) : testReports.length > 0 ? (
                <div className="space-y-3">
                  {testReports.slice(0, 1).map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Beaker className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Test Report #{String(report.id).slice(0, 8)}</h4>
                            <p className="text-xs text-gray-500">
                              Issue Date: {report.issue_date} | Batch: {report.batch_number || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {report.variety || 'Steri Milk'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Created: {format(new Date(report.created_at), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Beaker className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No test reports created yet</p>
                  <p className="text-xs text-gray-400">Create your first test report to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>

      {/* Test Report Form Drawer */}
      <SteriMilkTestReportFormDrawer
        open={showTestReportForm}
        onOpenChange={setShowTestReportForm}
        processLogId={log.id}
        onSuccess={() => {
          setShowTestReportForm(false)
          loadTestReports() // Reload test reports after creation
        }}
      />

      {/* Post Test Form Drawer */}
      <SteriMilkPostTestFormDrawer
        open={showPostTestForm}
        onOpenChange={setShowPostTestForm}
        batchNumber={Number(batch?.batch_number) || 0}
        processLogId={log.id}
      />
    </Sheet>
  )
}
