"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { CopyButton } from "@/components/ui/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Factory, Package, Droplets, Clock, FileText, Edit, Trash2, ArrowRight, Play, RotateCcw, FlaskConical, AlertTriangle, Target, Beaker } from "lucide-react"
import { format } from "date-fns"
import type { FilmaticLinesProductionSheet } from "@/lib/api/filmatic-lines"

interface FilmaticLinesProductionSheetViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheetId: string | null
  onEdit?: () => void
  onDelete?: () => void
}

export function FilmaticLinesProductionSheetViewDrawer({ 
  open, 
  onOpenChange, 
  sheetId,
  onEdit,
  onDelete
}: FilmaticLinesProductionSheetViewDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data - in real app, this would come from props or API call
  const sheet: FilmaticLinesProductionSheet = {
    id: sheetId || "mock-id",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T14:20:00Z",
    approved_by: "John Smith",
    date: "2024-01-15",
    shift: "Morning Shift",
    product: "BIM Milk",
    details: "Production running smoothly with no major issues. All machines operating within normal parameters.",
    bottles_reconciliation: "Opening: 5000, Added: 15000, Closing: 18000, Wastes: 200, Damages: 50",
    stoppage: "Minor stoppage at 11:30 AM for 15 minutes due to label alignment issue. Resolved quickly.",
    milk_reconciliation: "Opening: 2000L, Added: 8000L, Closing: 9500L, Total: 10000L, Transfer: 500L",
    filmatic_lines_production_sheet_approved_by_fkey: {
      id: "approver-1",
      role_name: "Production Supervisor",
      views: [],
      role_operations: [],
      user_operations: [],
      devices_operations: [],
      process_operations: [],
      supplier_operations: [],
      silo_item_operations: [],
      machine_item_operations: [],
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    }
  }

  if (!sheet) return null

  const startAnimation = () => {
    setIsAnimating(true)
    setAnimationProgress(0)
    
    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAnimating(false)
          return 100
        }
        return prev + 2
      })
    }, 50)
  }

  const resetAnimation = () => {
    setIsAnimating(false)
    setAnimationProgress(0)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[75vw] sm:max-w-[75vw] p-0 overflow-hidden bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            <Factory className="w-5 h-5" />
            Filmatic Lines Production Sheet Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Complete information about the Filmatic lines production sheet record
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
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
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Paletizer</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-light">Sheet #{sheet.id.slice(0, 8)}</h2>
              <CopyButton text={sheet.id} />
            </div>
            <div className="flex items-center space-x-2">
              <LoadingButton
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </LoadingButton>
              <LoadingButton
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </LoadingButton>
            </div>
          </div>

          {/* Visual Filmatic Lines Process Animation */}
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light">Filmatic Lines Process Visualization</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startAnimation}
                  disabled={isAnimating}
                  className="rounded-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Animate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAnimation}
                  className="rounded-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Source - Standardized Milk */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Beaker className="w-10 h-10 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Standardized Milk</p>
                <p className="text-lg font-bold text-orange-600">8000L</p>
              </div>

              {/* Process Arrow */}
              <div className="flex-1 mx-6">
                <div className="relative h-3 bg-gray-200 rounded-full shadow-inner">
                  <div 
                    className="absolute top-0 left-0 h-3 bg-gradient-to-r from-orange-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-2000 shadow-lg"
                    style={{ width: `${animationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center mt-3 text-gray-600 font-medium">
                  {isAnimating ? 'Processing...' : 'Ready to process'}
                </p>
              </div>

              {/* Destination - Packaged Products */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <FlaskConical className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Packaged Products</p>
                <p className="text-lg font-bold text-blue-600">7500L</p>
              </div>
            </div>
            
            {/* Process Legend */}
            <div className="mt-6 flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-t from-orange-400 to-orange-300 rounded"></div>
                <span className="text-sm text-gray-600">Standardized Milk</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-500 via-blue-500 to-cyan-500 rounded"></div>
                <span className="text-sm text-gray-600">Filmatic Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-t from-blue-400 to-blue-300 rounded"></div>
                <span className="text-sm text-gray-600">Packaged Products</span>
              </div>
            </div>
          </div>

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Sheet ID</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-light">#{sheet.id.slice(0, 8)}</span>
                        <CopyButton text={sheet.id} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Date</span>
                      <span className="text-sm font-light">
                        {new Date(sheet.date).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Shift</span>
                      <Badge className="bg-blue-100 text-blue-800">{sheet.shift}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Product</span>
                      <Badge className="bg-green-100 text-green-800">{sheet.product}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Approved By</span>
                      <span className="text-sm font-light">{sheet.approved_by}</span>
                    </div>
                  </div>
                </div>

                {/* Production Summary */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-light">Production Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Status</span>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Efficiency</span>
                      <span className="text-sm font-light text-green-600">94.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Quality Score</span>
                      <span className="text-sm font-light text-blue-600">98.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Downtime</span>
                      <span className="text-sm font-light text-orange-600">15 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Production Tab */}
            <TabsContent value="production" className="mt-6">
              <div className="space-y-6">
                {/* Production Details */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Factory className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-light">Production Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Production Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {sheet.details || "No production details available"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Line 1 Status</h4>
                        <Badge className="bg-green-100 text-green-800">Running</Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Line 2 Status</h4>
                        <Badge className="bg-green-100 text-green-800">Running</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stoppage Information */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-light">Stoppage Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Stoppage Details</h4>
                      <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                        {sheet.stoppage || "No stoppage recorded"}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Stoppage</p>
                        <p className="text-lg font-bold text-orange-600">15 min</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Stoppage Count</p>
                        <p className="text-lg font-bold text-orange-600">1</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Availability</p>
                        <p className="text-lg font-bold text-green-600">96.8%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Reconciliation Tab */}
            <TabsContent value="reconciliation" className="mt-6">
              <div className="space-y-6">
                {/* Bottles Reconciliation */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <FlaskConical className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-light">Bottles Reconciliation</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Reconciliation Details</h4>
                      <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                        {sheet.bottles_reconciliation || "No bottles reconciliation data available"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Opening Stock</p>
                        <p className="text-lg font-bold text-blue-600">5,000</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Added</p>
                        <p className="text-lg font-bold text-green-600">15,000</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Closing Stock</p>
                        <p className="text-lg font-bold text-purple-600">18,000</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Waste</p>
                        <p className="text-lg font-bold text-red-600">200</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milk Reconciliation */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-cyan-600" />
                    </div>
                    <h3 className="text-lg font-light">Milk Reconciliation</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Reconciliation Details</h4>
                      <p className="text-sm text-gray-600 bg-cyan-50 p-3 rounded-lg">
                        {sheet.milk_reconciliation || "No milk reconciliation data available"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Opening</p>
                        <p className="text-lg font-bold text-blue-600">2,000L</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Added</p>
                        <p className="text-lg font-bold text-green-600">8,000L</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Closing</p>
                        <p className="text-lg font-bold text-purple-600">9,500L</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Transfer</p>
                        <p className="text-lg font-bold text-orange-600">500L</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-6">
              <div className="space-y-6">
                {/* Record Information */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-light">Record Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Created</span>
                      <span className="text-sm font-light">
                        {sheet.created_at ? format(new Date(sheet.created_at), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Last Updated</span>
                      <span className="text-sm font-light">
                        {sheet.updated_at ? format(new Date(sheet.updated_at), 'MMM dd, yyyy') : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Approved By</span>
                      <span className="text-sm font-light">{sheet.approved_by}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Role</span>
                      <span className="text-sm font-light">
                        {sheet.filmatic_lines_production_sheet_approved_by_fkey?.role_name || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-light">Quality Metrics</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Overall Quality</p>
                      <p className="text-2xl font-bold text-green-600">98.2%</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Efficiency</p>
                      <p className="text-2xl font-bold text-blue-600">94.5%</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Availability</p>
                      <p className="text-2xl font-bold text-purple-600">96.8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}