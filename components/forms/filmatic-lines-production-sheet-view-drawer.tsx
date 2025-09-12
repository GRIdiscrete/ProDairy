"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CopyButton } from "@/components/ui/copy-button"
import { 
  Package, 
  Calendar, 
  User, 
  Building, 
  Clock, 
  Hash,
  Edit,
  ArrowRight,
  CheckCircle,
  XCircle,
  Beaker,
  FileText,
  Factory,
  FlaskConical,
  AlertTriangle,
  Droplets
} from "lucide-react"
import { FilmaticLinesProductionSheet } from "@/lib/api/filmatic-lines"

interface FilmaticLinesProductionSheetViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheet: FilmaticLinesProductionSheet | null
  onEdit: () => void
}

export function FilmaticLinesProductionSheetViewDrawer({ 
  open, 
  onOpenChange, 
  sheet,
  onEdit 
}: FilmaticLinesProductionSheetViewDrawerProps) {
  if (!sheet) return null

  const approver = sheet.filmatic_lines_production_sheet_approved_by_fkey
  const details = sheet.filmatic_lines_production_sheet_details_fkey

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">
            Filmatic Lines Production Sheet Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            View detailed information about the Filmatic lines production sheet and its process
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-light">Pasturizing</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Factory className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">Filmatic Lines</span>
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
                <span className="text-sm font-light text-gray-400">Paletizer</span>
              </div>
            </div>
          </div>

          {/* Sheet Overview */}
          <Card className="border-l-4 border-l-blue-500 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Factory className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-light">Sheet #{sheet.id?.slice(0, 8)}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-800 font-light">
                        {sheet.product}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 font-light">
                        {sheet.shift}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-light text-gray-600">Production Date</span>
                  </div>
                  <p className="text-sm font-light">
                    {new Date(sheet.date).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-light text-gray-600">Created</span>
                  </div>
                  <p className="text-sm font-light">
                    {new Date(sheet.created_at).toLocaleString('en-GB')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Information */}
          {approver && (
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-base font-light">Approval Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Approved By</span>
                    <p className="text-sm font-light">{approver.role_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">User Operations</span>
                    <p className="text-sm font-light">{approver.user_operations?.length || 0} operations</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Process Operations</span>
                    <p className="text-sm font-light">{approver.process_operations?.length || 0} operations</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Views</span>
                    <p className="text-sm font-light">{approver.views?.length || 0} views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Production Details */}
          {details && (
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-orange-600" />
                  </div>
                  <CardTitle className="text-base font-light">Production Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Day Shift Hours</span>
                    <p className="text-sm font-light">{details.day_shift_hours}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Number of Pallets</span>
                    <p className="text-sm font-light">{details.no_of_pallets}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Hourly Target</span>
                    <p className="text-sm font-light">{details.hourly_target}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Variance</span>
                    <p className={`text-sm font-light ${details.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {details.variance > 0 ? '+' : ''}{details.variance}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-xs font-light text-gray-500">Reason for Variance</span>
                    <p className="text-sm font-light">{details.reason_for_variance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottles Reconciliation */}
          {details?.bottles_reconciliation && (
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-cyan-600" />
                  </div>
                  <CardTitle className="text-base font-light">Bottles Reconciliation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Shift</span>
                    <p className="text-sm font-light">{details.bottles_reconciliation.shift}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Opening</span>
                    <p className="text-sm font-light">{details.bottles_reconciliation.opening}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Added</span>
                    <p className="text-sm font-light">{details.bottles_reconciliation.added}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Closing</span>
                    <p className="text-sm font-light">{details.bottles_reconciliation.closing}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Wastes</span>
                    <p className="text-sm font-light text-red-600">{details.bottles_reconciliation.wastes}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Damages</span>
                    <p className="text-sm font-light text-red-600">{details.bottles_reconciliation.damages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milk Reconciliation */}
          {details?.milk_reconciliation && (
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Droplets className="h-4 w-4 text-green-600" />
                  </div>
                  <CardTitle className="text-base font-light">Milk Reconciliation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Shift</span>
                    <p className="text-sm font-light">{details.milk_reconciliation.shift}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Opening</span>
                    <p className="text-sm font-light">{details.milk_reconciliation.opening}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Added</span>
                    <p className="text-sm font-light">{details.milk_reconciliation.added}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Closing</span>
                    <p className="text-sm font-light">{details.milk_reconciliation.closing}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Total</span>
                    <p className="text-sm font-light font-medium">{details.milk_reconciliation.total}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Transfer</span>
                    <p className="text-sm font-light">{details.milk_reconciliation.transfer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stoppage Time Minutes */}
          {details?.filmatic_lines_production_sheet_details_stoppages_fkey && (
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <CardTitle className="text-base font-light">Stoppage Time Minutes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Product 1</span>
                    <p className="text-sm font-light">{details.filmatic_lines_production_sheet_details_stoppages_fkey.product_1} min</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Product 2</span>
                    <p className="text-sm font-light">{details.filmatic_lines_production_sheet_details_stoppages_fkey.product_2} min</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Filler 1</span>
                    <p className="text-sm font-light">{details.filmatic_lines_production_sheet_details_stoppages_fkey.filler_1} min</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Filler 2</span>
                    <p className="text-sm font-light">{details.filmatic_lines_production_sheet_details_stoppages_fkey.filler_2} min</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Capper 1</span>
                    <p className="text-sm font-light">{details.filmatic_lines_production_sheet_details_stoppages_fkey.capper_1} min</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Capper 2</span>
                    <p className="text-sm font-light">{details.filmatic_lines_production_sheet_details_stoppages_fkey.capper_2} min</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Sleever 1</span>
                    <p className="text-sm font-light">{details.filmatic_lines_production_sheet_details_stoppages_fkey.sleever_1} min</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Sleever 2</span>
                    <p className="text-sm font-light">{details.filmatic_lines_production_sheet_details_stoppages_fkey.sleever_2} min</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Shrink 1</span>
                    <p className="text-sm font-light">{details.filmatic_lines_production_sheet_details_stoppages_fkey.shrink_1} min</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Shrink 2</span>
                    <p className="text-sm font-light">{details.filmatic_lines_production_sheet_details_stoppages_fkey.shrink_2} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Process Timeline */}
          <Card className="shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Process Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-light">Sheet Created</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sheet.created_at).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>
                {details && (
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-light">Production Details Added</p>
                      <p className="text-xs text-gray-500">
                        {new Date(details.created_at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                )}
                {details?.bottles_reconciliation && (
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm font-light">Bottles Reconciliation Complete</p>
                      <p className="text-xs text-gray-500">
                        {new Date(details.bottles_reconciliation.created_at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                )}
                {details?.milk_reconciliation && (
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-light">Milk Reconciliation Complete</p>
                      <p className="text-xs text-gray-500">
                        {new Date(details.milk_reconciliation.created_at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                )}
                {details?.filmatic_lines_production_sheet_details_stoppages_fkey && (
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-light">Stoppage Time Recorded</p>
                      <p className="text-xs text-gray-500">
                        {new Date(details.filmatic_lines_production_sheet_details_stoppages_fkey.created_at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}