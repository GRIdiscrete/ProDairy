"use client"

import { useState, useEffect, useCallback } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { UserAvatar } from "@/components/ui/user-avatar"
import { usersApi } from "@/lib/api/users"

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
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

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
    const loadUsers = async () => {
      try {
        setLoadingUsers(true)
        const resp = await usersApi.getUsers()
        setUsers(resp.data || [])
      } catch (e) {
        setUsers([])
      } finally {
        setLoadingUsers(false)
      }
    }
    loadPost()
    loadUsers()
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
                      
                      size="sm"
                      className={`border-0 rounded-full ${hasTest ? " from-green-500 to-emerald-500 text-white" : " from-blue-500 to-cyan-500 text-white"}`}
                    >
                      <Beaker className="h-4 w-4 mr-1" />
                      {hasTest ? "Edit Test Report" : "Mixing & Pasteurizing Test"}
                    </Button>
                    <Button
                      onClick={() => setShowPostTestForm(true)}
                      
                      size="sm"
                      className={`border-0 rounded-full ${hasPost ? "bg-[#A0D001] text-white" : "bg-[#0068BD] text-white"}`}
                    >
                      <Beaker className="h-4 w-4 mr-1" />
                      {hasPost ? "Edit Post Test" : "Post Autoclave Test"}
                    </Button>
                  </>
                )
              })()}
              {onEdit && (
                <Button
                  onClick={onEdit}
                  
                  size="sm"
                  className=" from-green-500 to-emerald-500 text-white border-0 rounded-full"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          <Tabs defaultValue="log-details" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              <TabsTrigger value="log-details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#006BC4] data-[state=active]:bg-transparent">
                Log Details
              </TabsTrigger>
              <TabsTrigger value="test-report" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent">
                Mixing & Pasteurizing Test
              </TabsTrigger>
              <TabsTrigger value="post-test" className="rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:bg-transparent">
                Post Autoclave Test
              </TabsTrigger>
            </TabsList>

            {/* Log Details Tab */}
            <TabsContent value="log-details" className="mt-6 space-y-6">
              {/* Process Overview */}
              <div className="mb-2 p-6  from-blue-50 to-cyan-50 rounded-lg">
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
                      <div className=" bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
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
                    <FormIdCopy displayId={log.tag || 'N/A'} actualId={log.id} size="sm" />
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
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
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
            </TabsContent>

            {/* Test Report Tab */}
            <TabsContent value="test-report" className="mt-6">
              {loadingTestReports ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-4">Loading test report...</p>
                </div>
              ) : (() => {
                // Filter test reports that match the current batch number
                const batchNumber = batch?.batch_number
                const filteredReports = testReports.filter((r: any) => r.batch_number === batchNumber)
                
                return filteredReports.length > 0 ? (
                  <div className="space-y-6">
                    {filteredReports.map((report: any) => (
                      <div key={report.id}>
                      {/* Report Header */}
                      <Card className="shadow-none border border-gray-200 rounded-lg">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg font-medium">Mixing & Pasteurizing Test Report</CardTitle>
                              <p className="text-sm text-gray-500 mt-1">Created: {format(new Date(report.created_at), "PPP 'at' p")}</p>
                            </div>
                            <Button
                              onClick={() => setShowTestReportForm(true)}
                              size="sm"
                              
                              className="rounded-full"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Report
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Basic Information */}
                      <Card className="shadow-none border border-gray-200 rounded-lg mt-4">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-base font-light">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <span className="text-xs font-light text-gray-500">Issue Date</span>
                              <p className="text-sm font-light">{report.issue_date || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-light text-gray-500">Date of Production</span>
                              <p className="text-sm font-light">{report.date_of_production || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-light text-gray-500">Batch Number</span>
                              <p className="text-sm font-light">#{report.batch_number || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-light text-gray-500">Variety</span>
                              <p className="text-sm font-light">{report.variety || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-light text-gray-500">Approved By</span>
                              <p className="text-sm font-light">{report.approved_by ? `#${String(report.approved_by).slice(0, 8)}` : 'N/A'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Raw Milk Silos */}
                      {report.raw_milk_silos && report.raw_milk_silos.length > 0 && (
                        <Card className="shadow-none border border-gray-200 rounded-lg mt-4">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-base font-light">Raw Milk Silos</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {report.raw_milk_silos.map((silo: any, index: number) => (
                              <div key={index} className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Tank</span>
                                    <p className="text-sm font-light">{silo.tank ? `#${String(silo.tank).slice(0, 8)}` : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Time</span>
                                    <p className="text-sm font-light">{silo.time || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Temperature</span>
                                    <p className="text-sm font-light">{silo.temperature ? `${silo.temperature}°C` : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Alcohol</span>
                                    <p className="text-sm font-light">{silo.alcohol || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Res</span>
                                    <p className="text-sm font-light">{silo.res || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">COB</span>
                                    <p className="text-sm font-light">{silo.cob ? 'Yes' : 'No'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">pH</span>
                                    <p className="text-sm font-light">{silo.ph || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Fat</span>
                                    <p className="text-sm font-light">{silo.fat ? `${silo.fat}%` : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">LR/SNF</span>
                                    <p className="text-sm font-light">{silo.lr_snf || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Acidity</span>
                                    <p className="text-sm font-light">{silo.acidity || 'N/A'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-xs font-light text-gray-500">Remarks</span>
                                    <p className="text-sm font-light">{silo.remarks || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Other Tests */}
                      {report.other_tests && report.other_tests.length > 0 && (
                        <Card className="shadow-none border border-gray-200 rounded-lg mt-4">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-base font-light">Other Tests</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {report.other_tests.map((test: any, index: number) => (
                              <div key={index} className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="col-span-2">
                                    <span className="text-xs font-light text-gray-500">Sample Details</span>
                                    <p className="text-sm font-light">{test.sample_details || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">pH</span>
                                    <p className="text-sm font-light">{test.ph || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Caustic</span>
                                    <p className="text-sm font-light">{test.caustic || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Acid</span>
                                    <p className="text-sm font-light">{test.acid || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Chlorine</span>
                                    <p className="text-sm font-light">{test.chlorine || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">HD</span>
                                    <p className="text-sm font-light">{test.hd || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">TDS</span>
                                    <p className="text-sm font-light">{test.tds || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Hydrogen Peroxide</span>
                                    <p className="text-sm font-light">{test.hydrogen_peroxide || 'N/A'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-xs font-light text-gray-500">Remarks</span>
                                    <p className="text-sm font-light">{test.remarks || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Standardisation & Pasteurisation */}
                      {report.standardisation_and_pasteurisation && report.standardisation_and_pasteurisation.length > 0 && (
                        <Card className="shadow-none border border-gray-200 rounded-lg mt-4">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-base font-light">Standardisation & Pasteurisation</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {report.standardisation_and_pasteurisation.map((std: any, index: number) => (
                              <div key={index} className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Tank</span>
                                    <p className="text-sm font-light">{std.tank ? `#${String(std.tank).slice(0, 8)}` : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Batch</span>
                                    <p className="text-sm font-light">#{std.batch || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Time</span>
                                    <p className="text-sm font-light">{std.time || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Temperature</span>
                                    <p className="text-sm font-light">{std.temperature ? `${std.temperature}°C` : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">OT</span>
                                    <p className="text-sm font-light">{std.ot || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Alcohol</span>
                                    <p className="text-sm font-light">{std.alcohol || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Phosphatase</span>
                                    <p className="text-sm font-light">{std.phosphatase || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">pH</span>
                                    <p className="text-sm font-light">{std.ph || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">COB</span>
                                    <p className="text-sm font-light">{std.cob ? 'Yes' : 'No'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Fat</span>
                                    <p className="text-sm font-light">{std.fat ? `${std.fat}%` : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">CI/SI</span>
                                    <p className="text-sm font-light">{std.ci_si || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">LR/SNF</span>
                                    <p className="text-sm font-light">{std.lr_snf || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Acidity</span>
                                    <p className="text-sm font-light">{std.acidity || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Analyst</span>
                                    <p className="text-sm font-light">{std.analyst ? `#${String(std.analyst).slice(0, 8)}` : 'N/A'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-xs font-light text-gray-500">Remarks</span>
                                    <p className="text-sm font-light">{std.remarks || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* UHT Steri Milk */}
                      {report.uht_steri_milk && report.uht_steri_milk.length > 0 && (
                        <Card className="shadow-none border border-gray-200 rounded-lg mt-4">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-base font-light">UHT Steri Milk</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {report.uht_steri_milk.map((uht: any, index: number) => (
                              <div key={index} className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Time</span>
                                    <p className="text-sm font-light">{uht.time || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Batch</span>
                                    <p className="text-sm font-light">{uht.batch || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Temperature</span>
                                    <p className="text-sm font-light">{uht.temperature ? `${uht.temperature}°C` : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">OT</span>
                                    <p className="text-sm font-light">{uht.ot || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Alc</span>
                                    <p className="text-sm font-light">{uht.alc || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Res</span>
                                    <p className="text-sm font-light">{uht.res || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">COB</span>
                                    <p className="text-sm font-light">{uht.cob ? 'Yes' : 'No'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">pH</span>
                                    <p className="text-sm font-light">{uht.ph || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Fat</span>
                                    <p className="text-sm font-light">{uht.fat ? `${uht.fat}%` : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">LR/SNF</span>
                                    <p className="text-sm font-light">{uht.lr_snf || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">CI/SI</span>
                                    <p className="text-sm font-light">{uht.ci_si || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Total Solids</span>
                                    <p className="text-sm font-light">{uht.total_solids || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Acidity</span>
                                    <p className="text-sm font-light">{uht.acidity || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Coffee</span>
                                    <p className="text-sm font-light">{uht.coffee || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">H2O2/Turbidity</span>
                                    <p className="text-sm font-light">{uht.hydrogen_peroxide_or_turbidity || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-light text-gray-500">Analyst</span>
                                    <p className="text-sm font-light">{uht.analyst ? `#${String(uht.analyst).slice(0, 8)}` : 'N/A'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-xs font-light text-gray-500">Remarks</span>
                                    <p className="text-sm font-light">{uht.remarks || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Beaker className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-base font-medium">No Test Report Created</p>
                  <p className="text-sm text-gray-400 mt-2">Create a mixing & pasteurizing test report to view details here</p>
                  <Button
                    onClick={() => setShowTestReportForm(true)}
                    size="sm"
                    className="mt-4  text-white border-0 rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Test Report
                  </Button>
                </div>
              )
            })()}
            </TabsContent>

            {/* Post Test Tab */}
            <TabsContent value="post-test" className="mt-6">
              {loadingPostTests ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-4">Loading post test...</p>
                </div>
              ) : (() => {
                // Filter post tests that match the current batch number
                const batchNumber = batch?.batch_number
                const filteredTests = postTests.filter((t: any) => t.batch_number === batchNumber)
                
                return filteredTests.length > 0 ? (
                  <div className="space-y-6">
                    {filteredTests.map((test: any) => {
                      // Find the scientist user
                      const scientist = users.find(u => u.id === test.scientist_id)
                      
                      return (
                        <div key={test.id}>
                          {/* Test Header */}
                          <Card className="shadow-none border border-gray-200 rounded-lg">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <CardTitle className="text-lg font-medium">Post Autoclave Test</CardTitle>
                                    {test.tag && (
                                      <Badge  className="font-mono text-xs">
                                        {test.tag}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <p className="text-sm text-gray-500">
                                      <Clock className="inline h-3 w-3 mr-1" />
                                      Created: {format(new Date(test.created_at), "PPP 'at' p")}
                                    </p>
                                    {test.updated_at && (
                                      <p className="text-sm text-gray-500">
                                        Updated: {format(new Date(test.updated_at), "PPP 'at' p")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => setShowPostTestForm(true)}
                                  size="sm"
                                  
                                  className="rounded-full"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit Test
                                </Button>
                              </div>
                            </CardHeader>
                          </Card>

                          {/* Basic Information */}
                          <Card className="shadow-none border border-gray-200 rounded-lg mt-4">
                            <CardHeader className="pb-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <CardTitle className="text-base font-light">Basic Information</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                  <span className="text-xs font-light text-gray-500">Test ID</span>
                                  <div className="mt-1">
                                    <FormIdCopy displayId={test.tag || 'N/A'} actualId={test.id} size="sm" />
                                  </div>
                                </div>
                                <div>
                                  <span className="text-xs font-light text-gray-500">Batch Number</span>
                                  <p className="text-sm font-light">#{test.batch_number || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-xs font-light text-gray-500">Time</span>
                                  <p className="text-sm font-light">
                                    {test.time ? format(new Date(test.time), "PPP 'at' p") : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs font-light text-gray-500">Temperature</span>
                                  <p className="text-sm font-light flex items-center">
                                    <Thermometer className="h-4 w-4 mr-1 text-orange-500" />
                                    {test.temperature != null ? `${test.temperature}°C` : 'N/A'}
                                  </p>
                                </div>
                              </div>

                              <Separator />

                              {/* Scientist Information */}
                              <div>
                                <span className="text-xs font-light text-gray-500 block mb-2">Scientist</span>
                                {scientist ? (
                                  <UserAvatar 
                                    user={{
                                      id: scientist.id,
                                      first_name: scientist.first_name,
                                      last_name: scientist.last_name,
                                      email: scientist.email,
                                      phone: scientist.phone,
                                      role: scientist.role_name,
                                      department: scientist.department,
                                      created_at: scientist.created_at
                                    }}
                                    size="sm"
                                    showName={true}
                                    showEmail={true}
                                    showDropdown={true}
                                  />
                                ) : (
                                  <p className="text-sm font-light text-gray-400">
                                    {test.scientist_id ? `Scientist #${String(test.scientist_id).slice(0, 8)}` : 'Not assigned'}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Test Parameters - Chemical Analysis */}
                          <Card className="shadow-none border border-gray-200 rounded-lg mt-4">
                            <CardHeader className="pb-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Beaker className="h-4 w-4 text-blue-600" />
                                </div>
                                <CardTitle className="text-base font-light">Chemical Analysis</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">Alcohol</span>
                                  <p className="text-sm font-medium">{test.alcohol != null ? test.alcohol : 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">Phosphatase</span>
                                  <p className="text-sm font-medium">{test.phosphatase || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">Res</span>
                                  <p className="text-sm font-medium">{test.res != null ? test.res : 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">COB</span>
                                  <div className="flex items-center space-x-1">
                                    <div className={`w-2 h-2 rounded-full ${test.cob ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <p className="text-sm font-medium">{test.cob ? 'Positive' : 'Negative'}</p>
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">pH</span>
                                  <p className="text-sm font-medium">{test.ph != null ? test.ph : 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">CI/SI</span>
                                  <p className="text-sm font-medium">{test.ci_si || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">LR/SNF</span>
                                  <p className="text-sm font-medium">{test.lr_snf || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">Acidity</span>
                                  <p className="text-sm font-medium">{test.acidity != null ? test.acidity : 'N/A'}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Test Parameters - Additional Tests */}
                          <Card className="shadow-none border border-gray-200 rounded-lg mt-4">
                            <CardHeader className="pb-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Gauge className="h-4 w-4 text-blue-600" />
                                </div>
                                <CardTitle className="text-base font-light">Additional Tests</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">Coffee</span>
                                  <p className="text-sm font-medium">{test.coffee || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="text-xs font-medium text-gray-500 block mb-1">Turbidity</span>
                                  <p className="text-sm font-medium">{test.turbidity || 'N/A'}</p>
                                </div>
                              </div>

                              {test.remarks && (
                                <>
                                  <Separator className="my-4" />
                                  <div>
                                    <span className="text-xs font-medium text-gray-500 block mb-2">Remarks</span>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                      <p className="text-sm font-light">{test.remarks}</p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Beaker className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-base font-medium">No Post Test Created</p>
                    <p className="text-sm text-gray-400 mt-2">Create a post autoclave test to view details here</p>
                    <Button
                      onClick={() => setShowPostTestForm(true)}
                      size="sm"
                      className="mt-4  text-white border-0 rounded-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Post Test
                    </Button>
                  </div>
                )
              })()}
            </TabsContent>
          </Tabs>

          {/* Test Reports Section - REMOVED, now in tab */}
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
