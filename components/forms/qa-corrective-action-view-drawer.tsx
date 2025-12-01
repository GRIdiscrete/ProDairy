"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { QACorrectiveAction } from "@/lib/api/data-capture-forms"
import {
  AlertTriangle,
  Calendar,
  User,
  FileText,
  TestTube,
  Package,
  TrendingUp,
  Clock,
  Beaker,
  Edit,
  Copy,
  ArrowRight,
  CheckCircle,
  XCircle,
  Hash
} from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"

interface QACorrectiveActionViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action?: QACorrectiveAction | null
  onEdit?: () => void
}

export function QACorrectiveActionViewDrawer({
  open,
  onOpenChange,
  action,
  onEdit
}: QACorrectiveActionViewDrawerProps) {
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { usersApi } = await import("@/lib/api/users")
        const usersData = await usersApi.getUsers()
        setUsers(Array.isArray(usersData) ? usersData : [])

       
      } catch (error) {
        console.error("Error loading data:", error)
        setUsers([])
      }
    }

    if (open && action) {
      loadData()
    }
  }, [open, action])

  if (!action) return null

  const getUserName = (userId: string) => {
    const user = (users || []).find(u => u.id === userId)
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User'
  }

  const getProductName = (productId: string) => {
    const product = (products || []).find(p => p.id === productId)
    return product ? product.name : 'Unknown Product'
  }

  const details = action.qa_corrective_action_details

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">
            QA Corrective Action Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Quality assurance corrective action for batch #{action.batch_number}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-light">Test Stage</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-red-600">QA Corrective Action</span>
                  <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Dispatch</span>
              </div>
            </div>
          </div>

          {/* Action Overview */}
          <Card className="border-l-4 border-l-red-500 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-light">QA Corrective Action</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-red-100 text-red-800 font-light">
                        Batch #{action.batch_number}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 font-light">
                        {getProductName(action.product)}
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
                    {new Date(action.date_of_production).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-light text-gray-600">Analysis Date</span>
                  </div>
                  <p className="text-sm font-light">
                    {new Date(action.date_analysed).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personnel Information */}
          <Card className="shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-light">Personnel Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-light text-gray-500">Checked By</span>
                  <p className="text-sm font-light">{getUserName(action.checked_by)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-light text-gray-500">Analyst</span>
                  <p className="text-sm font-light">{getUserName(action.analyst)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-light text-gray-500">Created</span>
                  <p className="text-sm font-light">
                    {action.created_at ? new Date(action.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-light text-gray-500">Updated</span>
                  <p className="text-sm font-light">
                    {action.updated_at ? new Date(action.updated_at).toLocaleDateString() : 'Never updated'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issue and Decision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <CardTitle className="text-base font-light">Issue Description</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {action.issue || 'No issue description provided'}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-light">QA Decision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {action.qa_decision || 'No QA decision recorded'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          {details && (
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <TestTube className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-light">Test Results & Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">pH Level (7 days @ 30°C)</span>
                    <p className="text-lg font-medium text-blue-600">
                      {details.ph_after_7_days_at_30_degrees}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Packaging Integrity</span>
                    <p className="text-sm font-light text-gray-700">
                      {details.packaging_integrity}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-light text-gray-500">Defects</span>
                    <p className="text-sm font-light text-gray-700">
                      {details.defects}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <span className="text-xs font-light text-gray-500">Test Results Created</span>
                  <p className="text-sm font-light">
                    {details.created_at ? new Date(details.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card className="bg-gradient-to-r from-gray-50 to-red-50 border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-light text-gray-600">QA Corrective Action ID</h4>
                  <p className="text-lg font-medium text-gray-900">{action.id}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-light text-gray-600">Status</h4>
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                    {details ? 'Completed' : 'Pending Details'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
