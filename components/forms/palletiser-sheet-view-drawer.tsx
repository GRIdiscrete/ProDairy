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
  FileText
} from "lucide-react"
import { PalletiserSheet } from "@/lib/api/data-capture-forms"

interface PalletiserSheetViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheet: PalletiserSheet | null
  onEdit: () => void
}

export function PalletiserSheetViewDrawer({ 
  open, 
  onOpenChange, 
  sheet,
  onEdit 
}: PalletiserSheetViewDrawerProps) {
  const [sheetDetails, setSheetDetails] = useState<any[]>([])

  // Load sheet details when sheet changes
  useEffect(() => {
    if (sheet && open) {
      // Use real data from palletiser_sheet_details_fkey
      const details = (sheet as any).palletiser_sheet_details_fkey
      if (details) {
        // Convert the single details object to array format for consistency
        setSheetDetails([details])
      } else {
        // No details available
        setSheetDetails([])
      }
    }
  }, [sheet, open])

  if (!sheet) return null

  const machine = sheet.palletiser_sheet_machine_id_fkey
  const approver = sheet.palletiser_sheet_approved_by_fkey

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">
            Palletiser Sheet Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            View detailed information about the palletiser sheet and its process
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
                <span className="text-sm font-light">Filmatic Lines 2</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">Palletizing</span>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Incubation</span>
              </div>
            </div>
          </div>

          {/* Sheet Overview */}
          <Card className="border-l-4 border-l-blue-500 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-light">Palletiser Sheet</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-800 font-light">
                        Batch #{sheet.batch_number}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 font-light">
                        {sheet.product_type && sheet.product_type.length > 20 ? 'N/A' : (sheet.product_type || 'N/A')}
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
                    <span className="text-sm font-light text-gray-600">Manufacturing Date</span>
                  </div>
                  <p className="text-sm font-light">
                    {new Date(sheet.manufacturing_date).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-light text-gray-600">Expiry Date</span>
                  </div>
                  <p className="text-sm font-light">
                    {new Date(sheet.expiry_date).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Machine Information */}
          {machine && (
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Building className="h-4 w-4 text-green-600" />
                  </div>
                  <CardTitle className="text-base font-light">Machine Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Machine Name</span>
                    <p className="text-sm font-light">{machine.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Category</span>
                    <Badge className="text-xs bg-green-100 text-green-800">
                      {machine.category}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Location</span>
                    <p className="text-sm font-light">{machine.location}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Serial Number</span>
                    <p className="text-sm font-light">{machine.serial_number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Pallet Details */}
          <Card className="shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
                <CardTitle className="text-base font-light">Pallet Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {sheetDetails.length > 0 ? (
                <div className="space-y-4">
                  {sheetDetails.map((detail, index) => (
                    <div key={detail.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-orange-100 text-orange-800 font-light">
                            Pallet {detail.pallet_number}
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-600 font-light">
                            #{index + 1}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs font-light text-green-600">Completed</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-light text-gray-600">Start Time</span>
                          </div>
                          <p className="text-sm font-light">
                            {new Date(detail.start_time).toLocaleString('en-GB')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-light text-gray-600">End Time</span>
                          </div>
                          <p className="text-sm font-light">
                            {new Date(detail.end_time).toLocaleString('en-GB')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-light text-gray-600">Cases Packed</span>
                          </div>
                          <p className="text-sm font-light">{detail.cases_packed} cases</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-light text-gray-600">Serial Number</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-light">{detail.serial_number}</p>
                            <CopyButton text={detail.serial_number} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-light text-gray-500">No pallet details available</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                      {new Date(sheet.created_at!).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-light">Approved</p>
                    <p className="text-xs text-gray-500">
                      {approver?.role_name} • {new Date(sheet.created_at!).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>
                {sheet.updated_at && (
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-light">Last Updated</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sheet.updated_at).toLocaleString('en-GB')}
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