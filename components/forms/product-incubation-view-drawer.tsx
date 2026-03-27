"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductIncubation } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"
import { TestTube, FileText, Clock, TrendingUp, ArrowRight, Package } from "lucide-react"

interface ProductIncubationViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incubation: ProductIncubation | null
  onEdit?: () => void
}

export function ProductIncubationViewDrawer({ 
  open, 
  onOpenChange, 
  incubation,
  onEdit 
}: ProductIncubationViewDrawerProps) {
  if (!incubation) return null

  const approver = incubation.product_incubation_approved_by_fkey

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">
            Product Incubation Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            View detailed information about the product incubation and its process
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
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
                  <TestTube className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-purple-600">Incubation</span>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <TestTube className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Test</span>
              </div>
            </div>
          </div>

          {/* Incubation Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <TestTube className="h-4 w-4 text-purple-600" />
                </div>
                <CardTitle className="text-base font-light">Incubation Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Product Description</span>
                  <p className="text-sm font-light">
                    {incubation.product_description && incubation.product_description.length > 20 ? 'N/A' : (incubation.product_description || 'N/A')}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Batch Number</span>
                  <p className="text-sm font-light">{incubation.bn}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Incubation Days</span>
                  <p className="text-sm font-light">{incubation.incubation_days} days</p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Created At</span>
                  <p className="text-sm font-light">
                    {incubation.created_at ? format(new Date(incubation.created_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manufacturing Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-base font-light">Manufacturing Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Manufacturing Date (MNF)</span>
                  <p className="text-sm font-light">
                    {incubation.mnf ? format(new Date(incubation.mnf), "PPP") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Best Before (BB)</span>
                  <p className="text-sm font-light">
                    {incubation.bb ? format(new Date(incubation.bb), "PPP") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incubation Dates */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <CardTitle className="text-base font-light">Incubation Dates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs font-light text-gray-500">Date In</span>
                  <p className="text-sm font-light">
                    {incubation.date_in ? format(new Date(incubation.date_in), "PPP") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Expected Date Out</span>
                  <p className="text-sm font-light">
                    {incubation.expected_date_out ? format(new Date(incubation.expected_date_out), "PPP") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Actual Date Out</span>
                  <p className="text-sm font-light">
                    {incubation.actual_date_out ? format(new Date(incubation.actual_date_out), "PPP") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Information */}
          <Card className="shadow-none border border-gray-200 rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <CardTitle className="text-base font-light">Approval Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {approver ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-light text-gray-500">Role</span>
                    <span className="text-xs font-light">{approver.role_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-light text-gray-500">User Operations</span>
                    <span className="text-xs font-light">{approver.user_operations?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-light text-gray-500">Process Operations</span>
                    <span className="text-xs font-light">{approver.process_operations?.length || 0}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No approval details available</p>
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
                    {incubation.created_at ? format(new Date(incubation.created_at), "PPP 'at' p") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-light text-gray-500">Updated</span>
                  <p className="text-sm font-light">
                    {incubation.updated_at ? format(new Date(incubation.updated_at), "PPP 'at' p") : "Never updated"}
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
              Edit Incubation
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
