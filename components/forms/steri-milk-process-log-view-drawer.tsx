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
import { steriMilkTestReportApi, type SteriMilkTestReport } from "@/lib/api/steri-milk-test-report"
import { SignaturePad } from "@/components/ui/signature-pad"

interface SteriMilkProcessLogViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: SteriMilkProcessLog | null
  onEdit?: () => void
}

export function SteriMilkProcessLogViewDrawer({ 
  open, 
  onOpenChange, 
  log,
  onEdit
}: SteriMilkProcessLogViewDrawerProps) {
  const [testReports, setTestReports] = useState<SteriMilkTestReport[]>([])
  const [showTestReportForm, setShowTestReportForm] = useState(false)
  const [loadingTestReports, setLoadingTestReports] = useState(false)

  const loadTestReports = useCallback(async () => {
    try {
      setLoadingTestReports(true)
      const response = await steriMilkTestReportApi.getTestReports()
      setTestReports(response.data || [])
    } catch (error) {
      console.error('Failed to load test reports:', error)
    } finally {
      setLoadingTestReports(false)
    }
  }, [])

  // Load test reports when drawer opens
  useEffect(() => {
    if (open && log) {
      loadTestReports()
    }
  }, [open, log, loadTestReports])

  if (!log) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <SheetTitle className="text-lg font-light">Steri Milk Process Log</SheetTitle>
                <SheetDescription className="text-sm font-light">
                  Complete information about the Steri Milk Process Log and its batch data
                </SheetDescription>
              </div>
              <Badge className={`${log.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} font-medium px-3 py-1 rounded-full`}>
                {log.approved ? 'Approved' : 'Pending'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowTestReportForm(true)}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
              >
                <Beaker className="h-4 w-4 mr-1" />
                Create Test Report
              </Button>
              {onEdit && (
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
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
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-light">Process Log</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Factory className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">Steri Milk Process Log</span>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Next Process</span>
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
                  <p className="text-sm font-light">{log.id}</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Created At</span>
                  <p className="text-sm font-light">
                    {log.created_at ? format(new Date(log.created_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Updated At</span>
                  <p className="text-sm font-light">
                    {log.updated_at ? format(new Date(log.updated_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Approver ID</span>
                  <p className="text-sm font-light">
                    {log.approver_id ? `Approver #${String(log.approver_id).slice(0, 8)}` : "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Filmatic Form ID</span>
                  <p className="text-sm font-light">
                    {log.filmatic_form_id ? `Form #${String(log.filmatic_form_id).slice(0, 8)}` : "Not linked"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Batch ID</span>
                  <p className="text-sm font-light">
                    {log.batch_id ? `Batch #${String(log.batch_id).slice(0, 8)}` : "No batch"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Information */}
          {log.batch_id_fkey && (
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
                      <p className="text-sm font-light"><span className="font-medium">Batch Number:</span> {log.batch_id_fkey.batch_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Created:</span> {format(new Date(log.batch_id_fkey.created_at), "PPP 'at' p")}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Process Times */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Process Times</h4>
                  <div className="grid grid-cols-2 gap-4 pl-4">
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Filling Start:</span> {log.batch_id_fkey.filling_start?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Autoclave Start:</span> {log.batch_id_fkey.autoclave_start?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Heating Start:</span> {log.batch_id_fkey.heating_start?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Heating Finish:</span> {log.batch_id_fkey.heating_finish?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Sterilization Start:</span> {log.batch_id_fkey.sterilization_start?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Sterilization After 5:</span> {log.batch_id_fkey.sterilization_after_5?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Sterilization Finish:</span> {log.batch_id_fkey.sterilization_finish?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Pre Cooling Start:</span> {log.batch_id_fkey.pre_cooling_start?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Pre Cooling Finish:</span> {log.batch_id_fkey.pre_cooling_finish?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Cooling 1 Start:</span> {log.batch_id_fkey.cooling_1_start?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Cooling 1 Finish:</span> {log.batch_id_fkey.cooling_1_finish?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Cooling 2 Start:</span> {log.batch_id_fkey.cooling_2_start?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-light"><span className="font-medium">Cooling 2 Finish:</span> {log.batch_id_fkey.cooling_2_finish?.time || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Process Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Process Details</h4>
                  
                  {/* Filling Start Details */}
                  {log.batch_id_fkey.filling_start && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium mb-2 flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Filling Start Details</span>
                      </h5>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-light">{log.batch_id_fkey.filling_start.time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Temperature</p>
                          <p className="text-sm font-light">{log.batch_id_fkey.filling_start.temperature}°C</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pressure</p>
                          <p className="text-sm font-light">{log.batch_id_fkey.filling_start.pressure} bar</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Autoclave Start Details */}
                  {log.batch_id_fkey.autoclave_start && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium mb-2 flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-red-600" />
                        <span>Autoclave Start Details</span>
                      </h5>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-light">{log.batch_id_fkey.autoclave_start.time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Temperature</p>
                          <p className="text-sm font-light">{log.batch_id_fkey.autoclave_start.temperature}°C</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pressure</p>
                          <p className="text-sm font-light">{log.batch_id_fkey.autoclave_start.pressure} bar</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add more process details as needed... */}
                </div>
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
                  {log.approver_id ? `Approver #${String(log.approver_id).slice(0, 8)}` : "Not assigned"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Approver Signature */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Approver Signature</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <SignaturePad
                value={log.approver_signature || ''}
                onChange={() => {}} // Read-only display
                width={400}
                height={120}
                className="bg-white"
              />
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
                {testReports.length === 0 ? (
                  <Button
                    onClick={() => setShowTestReportForm(true)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Test Report
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowTestReportForm(true)}
                    size="sm"
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Test Report
                  </Button>
                )}
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
    </Sheet>
  )
}
