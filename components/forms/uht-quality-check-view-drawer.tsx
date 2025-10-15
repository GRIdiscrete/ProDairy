"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UHTQualityCheckAfterIncubation } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"
import { TestTube, FileText, Clock, TrendingUp, ArrowRight, Beaker } from "lucide-react"

interface UHTQualityCheckViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qualityCheck: UHTQualityCheckAfterIncubation | null
  onEdit?: () => void
}

export function UHTQualityCheckViewDrawer({ 
  open, 
  onOpenChange, 
  qualityCheck,
  onEdit 
}: UHTQualityCheckViewDrawerProps) {
  if (!qualityCheck) return null

  const details = qualityCheck.uht_qa_check_after_incubation_details_fkey
  const checkedBy = qualityCheck.uht_qa_check_after_incubation_checked_by_fkey

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">
            Incubation Test Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            View detailed information about the Incubation quality  check and its analysis results
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-light">Palletizer</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-light">Incubation</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <TestTube className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600">Test</span>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Check Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <TestTube className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-base font-light">Quality Check Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Product</span>
                  <p className="text-sm font-light">
                    {qualityCheck.product && qualityCheck.product.length > 20 ? 'N/A' : (qualityCheck.product || 'N/A')}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Batch Number</span>
                  <p className="text-sm font-light">{qualityCheck.batch_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">pH 0 Days</span>
                  <p className="text-sm font-light">{qualityCheck.ph_0_days}</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Created At</span>
                  <p className="text-sm font-light">
                    {qualityCheck.created_at ? format(new Date(qualityCheck.created_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Dates */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <CardTitle className="text-base font-light">Analysis Dates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Date of Production</span>
                  <p className="text-sm font-light">
                    {qualityCheck.date_of_production ? format(new Date(qualityCheck.date_of_production), "PPP") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Date Analysed</span>
                  <p className="text-sm font-light">
                    {qualityCheck.date_analysed ? format(new Date(qualityCheck.date_analysed), "PPP") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Details */}
          {details && (
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <TestTube className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-base font-light">Test Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-light text-gray-500">Time</span>
                    <p className="text-sm font-light">
                      {details.time ? format(new Date(details.time), "PPP 'at' p") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-light text-gray-500">pH 30°C</span>
                    <p className="text-sm font-light">{details.ph_30_degrees}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-light text-gray-500">pH 55°C</span>
                    <p className="text-sm font-light">{details.ph_55_degrees}</p>
                  </div>
                  <div>
                    <span className="text-xs font-light text-gray-500">Created At</span>
                    <p className="text-sm font-light">
                      {details.created_at ? format(new Date(details.created_at), "PPP 'at' p") : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-light text-gray-500">Defects</span>
                  <p className="text-sm font-light">{details.defects}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-light text-gray-500">Event</span>
                  <p className="text-sm font-light">{details.event}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personnel Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Personnel Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkedBy && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Checked By</h4>
                  <div className="pl-4 space-y-1">
                    <p className="text-sm font-light"><span className="font-medium">Name:</span> {`${checkedBy.first_name} ${checkedBy.last_name}`.trim() || 'N/A'}</p>
                    <p className="text-sm font-light"><span className="font-medium">Email:</span> {checkedBy.email}</p>
                    <p className="text-sm font-light"><span className="font-medium">Department:</span> {checkedBy.department}</p>
                  </div>
                </div>
              )}

              {details && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Test Personnel</h4>
                  <div className="pl-4 space-y-1">
                    <p className="text-sm font-light"><span className="font-medium">Analyst:</span> {details.analyst}</p>
                    <p className="text-sm font-light"><span className="font-medium">Verified By:</span> {details.verified_by}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <CardTitle className="text-base font-light">Record Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Created</span>
                  <p className="text-sm font-light">
                    {qualityCheck.created_at ? format(new Date(qualityCheck.created_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Updated</span>
                  <p className="text-sm font-light">
                    {qualityCheck.updated_at ? format(new Date(qualityCheck.updated_at), "PPP 'at' p") : "Never updated"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t bg-white">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={onEdit}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              Edit Quality Check
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
