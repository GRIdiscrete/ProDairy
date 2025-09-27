"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { CopyButton } from "@/components/ui/copy-button"
import { FlaskConical, Package, User, Droplets, Clock, Calendar, FileText, Edit, Trash2, ArrowRight, Play, RotateCcw, TrendingUp, Factory } from "lucide-react"
import { format } from "date-fns"
import type { PasteurizingForm } from "@/lib/api/pasteurizing"

interface PasteurizingFormViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: PasteurizingForm | null
  onEdit?: () => void
  onDelete?: () => void
}

export function PasteurizingFormViewDrawer({ 
  open, 
  onOpenChange, 
  form,
  onEdit,
  onDelete
}: PasteurizingFormViewDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)

  if (!form) return null

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

  const totalProduction = form.production?.reduce((sum, item) => sum + (item.output_target?.value || 0), 0) || 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[75vw] sm:max-w-[75vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-lg font-light">
            Pasteurizing Form Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            View complete pasteurizing form information and process details
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-light">Standardizing</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">Pasteurizing</span>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Factory className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Filmatic Lines</span>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-light text-gray-900">Pasteurizing Form</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">#{form.id.slice(0, 8)}</span>
                    <CopyButton text={form.id} />
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {onEdit && (
                  <LoadingButton 
                    variant="outline" 
                    onClick={onEdit}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </LoadingButton>
                )}
                {onDelete && (
                  <LoadingButton 
                    variant="destructive" 
                    onClick={onDelete}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </LoadingButton>
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FlaskConical className="h-4 w-4 text-blue-500" />
                  <p className="text-sm font-light text-gray-600">Total Production</p>
                </div>
                <p className="text-2xl font-light text-blue-600">{totalProduction.toFixed(1)}L</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-light text-gray-600">Fat Content</p>
                </div>
                <p className="text-2xl font-light text-green-600">{form.fat}%</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-orange-500" />
                  <p className="text-sm font-light text-gray-600">Products</p>
                </div>
                <p className="text-2xl font-light text-orange-600">{form.production?.length || 0}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-light text-gray-600">Created</p>
                </div>
                <p className="text-2xl font-light text-gray-600">
                  {form.created_at ? format(new Date(form.created_at), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Machine and Equipment Information */}
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-6">Machine & Equipment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Factory className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">Machine</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Machine ID</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-light">#{form.machine.slice(0, 8)}</span>
                      <CopyButton text={form.machine} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">Source Silo</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Silo ID</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-light">#{form.source_silo.slice(0, 8)}</span>
                      <CopyButton text={form.source_silo} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">BMT Form</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">BMT ID</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-light">#{form.bmt.slice(0, 8)}</span>
                      <CopyButton text={form.bmt} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-purple-100 text-purple-800">Linked</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Timing */}
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-6">Process Timing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Preheating Phase</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start Time</span>
                    <span className="text-sm font-light">
                      {form.preheating_start ? format(new Date(form.preheating_start), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Water Circulation</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start Time</span>
                    <span className="text-sm font-light">
                      {form.water_circulation ? format(new Date(form.water_circulation), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Production Phase</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start Time</span>
                    <span className="text-sm font-light">
                      {form.production_start ? format(new Date(form.production_start), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">End Time</span>
                    <span className="text-sm font-light">
                      {form.production_end ? format(new Date(form.production_end), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Machine Operation</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start Time</span>
                    <span className="text-sm font-light">
                      {form.machine_start ? format(new Date(form.machine_start), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">End Time</span>
                    <span className="text-sm font-light">
                      {form.machine_end ? format(new Date(form.machine_end), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Production Details */}
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-6">Production Details</h3>
            
            <div className="space-y-4">
              {form.production?.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <FlaskConical className="w-3 h-3 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900">Production Entry {index + 1}</h4>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {item.output_target?.value || 0}{item.output_target?.unit_of_measure || 'L'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs text-gray-500">Time</span>
                      <p className="text-sm font-light text-gray-900">{item.time}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-gray-500">Hot Water Temp</span>
                      <p className="text-sm font-light text-gray-900">{item.temp_hot_water}°C</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-gray-500">Pasteurisation Temp</span>
                      <p className="text-sm font-light text-gray-900">{item.temp_product_pasteurisation}°C</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-gray-500">Stage 1 Pressure</span>
                      <p className="text-sm font-light text-gray-900">{item.homogenisation_pressure_stage_1} bar</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-gray-500">Stage 2 Pressure</span>
                      <p className="text-sm font-light text-gray-900">{item.homogenisation_pressure_stage_2} bar</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-gray-500">Total Pressure</span>
                      <p className="text-sm font-light text-gray-900">{item.total_homogenisation_pressure} bar</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-gray-500">Product Out Temp</span>
                      <p className="text-sm font-light text-gray-900">{item.temperature_product_out}°C</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-gray-500">Output Target</span>
                      <p className="text-sm font-light text-gray-900">
                        {item.output_target?.value || 0} {item.output_target?.unit_of_measure || 'L'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Metadata */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Form Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Created</span>
                <p className="text-sm font-light">
                  {form.created_at ? format(new Date(form.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Last Updated</span>
                <p className="text-sm font-light">
                  {form.updated_at ? format(new Date(form.updated_at), 'MMM dd, yyyy HH:mm') : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
