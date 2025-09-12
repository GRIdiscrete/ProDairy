"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { CopyButton } from "@/components/ui/copy-button"
import { Beaker, Package, User, Droplets, Clock, Calendar, FileText, Edit, Trash2, ArrowRight, Play, RotateCcw, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import type { StandardizingForm } from "@/lib/api/standardizing"

interface StandardizingFormViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: StandardizingForm | null
  onEdit?: () => void
  onDelete?: () => void
}

export function StandardizingFormViewDrawer({ 
  open, 
  onOpenChange, 
  form,
  onEdit,
  onDelete
}: StandardizingFormViewDrawerProps) {
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

  const totalRawMilk = form.raw_milk?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const totalSkimMilk = form.skim_milk?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const totalCream = form.cream?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[60vw] sm:max-w-[60vw] p-0 overflow-hidden bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            <Beaker className="w-5 h-5" />
            Standardizing Form Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Complete information about the standardizing form record
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-light">Raw Milk Intake</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-orange-600">Standardizing</span>
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Pasteurizing</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-light">Form #{form.id.slice(0, 8)}</h2>
              <CopyButton text={form.id} />
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

          {/* Visual Standardizing Process Animation */}
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light">Standardizing Process Visualization</h3>
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
              {/* Source - Raw Milk */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Beaker className="w-10 h-10 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Raw Milk</p>
                <p className="text-lg font-bold text-orange-600">{totalRawMilk.toFixed(1)}L</p>
              </div>

              {/* Process Arrow */}
              <div className="flex-1 mx-6">
                <div className="relative h-3 bg-gray-200 rounded-full shadow-inner">
                  <div 
                    className="absolute top-0 left-0 h-3 bg-gradient-to-r from-orange-500 via-yellow-500 to-blue-500 rounded-full transition-all duration-2000 shadow-lg"
                    style={{ width: `${animationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center mt-3 text-gray-600 font-medium">
                  {isAnimating ? 'Processing...' : 'Ready to process'}
                </p>
              </div>

              {/* Destination - Products */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <TrendingUp className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Products</p>
                <p className="text-lg font-bold text-blue-600">
                  {(totalSkimMilk + totalCream).toFixed(1)}L
                </p>
              </div>
            </div>
            
            {/* Process Legend */}
            <div className="mt-6 flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-t from-orange-400 to-orange-300 rounded"></div>
                <span className="text-sm text-gray-600">Raw Milk</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-500 via-yellow-500 to-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-t from-blue-400 to-blue-300 rounded"></div>
                <span className="text-sm text-gray-600">Products</span>
              </div>
            </div>
          </div>

          {/* Form Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-lg font-light">Basic Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Form ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-light">#{form.id.slice(0, 8)}</span>
                    <CopyButton text={form.id} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">BMT ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-light">#{form.bmt_id.slice(0, 8)}</span>
                    <CopyButton text={form.bmt_id} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Created</span>
                  <span className="text-sm font-light">
                    {new Date(form.created_at).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Products</span>
                  <span className="text-sm font-light text-orange-600">
                    {(form.skim_milk?.length || 0) + (form.cream?.length || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* BMT Form Details */}
            {form.standardizing_form_bmt_id_fkey && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-light">BMT Form</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Form ID</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-light">#{form.bmt_id.slice(0, 8)}</span>
                      <CopyButton text={form.bmt_id} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Volume</span>
                    <span className="text-sm font-light">{form.standardizing_form_bmt_id_fkey.volume}L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Product</span>
                    <span className="text-sm font-light text-blue-600">{form.standardizing_form_bmt_id_fkey.product}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Created</span>
                    <span className="text-sm font-light">
                      {new Date(form.standardizing_form_bmt_id_fkey.created_at).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Raw Milk Information */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-lg font-light">Raw Milk</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Entries</span>
                  <span className="text-sm font-light text-orange-600">{form.raw_milk?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Quantity</span>
                  <span className="text-sm font-light">{totalRawMilk.toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Avg Fat Content</span>
                  <span className="text-sm font-light">
                    {form.raw_milk?.length > 0 
                      ? (form.raw_milk.reduce((sum, item) => sum + item.fat, 0) / form.raw_milk.length).toFixed(1)
                      : 0}%
                  </span>
                </div>
                {form.raw_milk && form.raw_milk.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-light text-gray-600 mb-2">Raw Milk Entries:</p>
                    <div className="space-y-2">
                      {form.raw_milk.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-orange-50 p-2 rounded">
                          <span className="font-light">Entry {index + 1}</span>
                          <div className="flex items-center space-x-2">
                            <Badge className="text-xs bg-orange-100 text-orange-800">
                              {item.quantity}L
                            </Badge>
                            <Badge className="text-xs bg-yellow-100 text-yellow-800">
                              {item.fat}% fat
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skim Milk Information */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-light">Skim Milk</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Entries</span>
                  <span className="text-sm font-light text-blue-600">{form.skim_milk?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Quantity</span>
                  <span className="text-sm font-light">{totalSkimMilk.toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Avg Fat Content</span>
                  <span className="text-sm font-light">
                    {form.skim_milk?.length > 0 
                      ? (form.skim_milk.reduce((sum, item) => sum + item.fat, 0) / form.skim_milk.length).toFixed(1)
                      : 0}%
                  </span>
                </div>
                {form.skim_milk && form.skim_milk.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-light text-gray-600 mb-2">Skim Milk Entries:</p>
                    <div className="space-y-2">
                      {form.skim_milk.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-blue-50 p-2 rounded">
                          <span className="font-light">Entry {index + 1}</span>
                          <div className="flex items-center space-x-2">
                            <Badge className="text-xs bg-blue-100 text-blue-800">
                              {item.quantity}L
                            </Badge>
                            <Badge className="text-xs bg-cyan-100 text-cyan-800">
                              {item.fat}% fat
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cream Information */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </div>
                <h3 className="text-lg font-light">Cream</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Entries</span>
                  <span className="text-sm font-light text-yellow-600">{form.cream?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Quantity</span>
                  <span className="text-sm font-light">{totalCream.toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Avg Fat Content</span>
                  <span className="text-sm font-light">
                    {form.cream?.length > 0 
                      ? (form.cream.reduce((sum, item) => sum + item.fat, 0) / form.cream.length).toFixed(1)
                      : 0}%
                  </span>
                </div>
                {form.cream && form.cream.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-light text-gray-600 mb-2">Cream Entries:</p>
                    <div className="space-y-2">
                      {form.cream.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-yellow-50 p-2 rounded">
                          <span className="font-light">Entry {index + 1}</span>
                          <div className="flex items-center space-x-2">
                            <Badge className="text-xs bg-yellow-100 text-yellow-800">
                              {item.quantity}L
                            </Badge>
                            <Badge className="text-xs bg-orange-100 text-orange-800">
                              {item.fat}% fat
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Record Information */}
          <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-light mb-4">Record Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Created</span>
                <span className="text-sm font-light">
                  {form.created_at ? format(new Date(form.created_at), 'PPP') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Last Updated</span>
                <span className="text-sm font-light">
                  {form.updated_at ? format(new Date(form.updated_at), 'PPP') : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
