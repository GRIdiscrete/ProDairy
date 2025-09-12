"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { CopyButton } from "@/components/ui/copy-button"
import { Droplets, Truck, User, Package, Clock, Calendar, FileText, Beaker, Edit, Trash2, ArrowRight, Play, RotateCcw, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import type { RawMilkIntakeForm } from "@/lib/api/raw-milk-intake"

interface RawMilkIntakeFormViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: RawMilkIntakeForm | null
  onEdit?: () => void
  onDelete?: () => void
}

export function RawMilkIntakeFormViewDrawer({ 
  open, 
  onOpenChange, 
  form,
  onEdit,
  onDelete
}: RawMilkIntakeFormViewDrawerProps) {
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[60vw] sm:max-w-[60vw] p-0 overflow-hidden bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            <Droplets className="w-5 h-5" />
            Raw Milk Intake Form Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Complete information about the raw milk intake form record
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-light">Drivers Form</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600">Raw Milk Intake</span>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Standardizing</span>
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

          {/* Visual Milk Transfer Animation */}
          {form.raw_milk_intake_form_destination_silo_id_fkey && (
            <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light">Milk Transfer Visualization</h3>
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
                {/* Source - Driver Tanker */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <Truck className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Driver Tanker</p>
                  <p className="text-lg font-bold text-blue-600">{form.quantity_received}L</p>
                </div>

                {/* Transfer Arrow */}
                <div className="flex-1 mx-6">
                  <div className="relative h-3 bg-gray-200 rounded-full shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 rounded-full transition-all duration-2000 shadow-lg"
                      style={{ width: `${animationProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center mt-3 text-gray-600 font-medium">
                    {isAnimating ? 'Transferring...' : 'Ready to transfer'}
                  </p>
                </div>

                {/* Destination - 3D Silo */}
                <div className="text-center">
                  <div className="relative w-24 h-32 mb-3">
                    {/* 3D Silo Container */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-full shadow-2xl transform rotate-3">
                      {/* Silo Base */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-300 to-gray-200 rounded-b-full"></div>
                      
                      {/* Current Milk Level (Before) */}
                      <div 
                        className="absolute bottom-8 left-1 right-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-full transition-all duration-1000"
                        style={{ 
                          height: `${Math.min((form.raw_milk_intake_form_destination_silo_id_fkey.milk_volume / form.raw_milk_intake_form_destination_silo_id_fkey.capacity) * 80, 80)}%` 
                        }}
                      ></div>
                      
                      {/* New Milk Level (After) - Animated */}
                      <div 
                        className="absolute bottom-8 left-1 right-1 bg-gradient-to-t from-green-400 to-green-300 rounded-t-full transition-all duration-2000 opacity-70"
                        style={{ 
                          height: `${Math.min(((form.raw_milk_intake_form_destination_silo_id_fkey.milk_volume + (form.quantity_received * animationProgress / 100)) / form.raw_milk_intake_form_destination_silo_id_fkey.capacity) * 80, 80)}%` 
                        }}
                      ></div>
                      
                      {/* Silo Cap */}
                      <div className="absolute top-0 left-2 right-2 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-full"></div>
                      
                      {/* Silo Label */}
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 shadow">
                        {form.raw_milk_intake_form_destination_silo_id_fkey.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">{form.raw_milk_intake_form_destination_silo_id_fkey.name}</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm text-blue-600 font-medium">
                        {form.raw_milk_intake_form_destination_silo_id_fkey.milk_volume.toLocaleString()}L
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-green-600 font-bold">
                        {(form.raw_milk_intake_form_destination_silo_id_fkey.milk_volume + form.quantity_received).toLocaleString()}L
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      +{form.quantity_received}L incoming
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Volume Legend */}
              <div className="mt-6 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-t from-blue-400 to-blue-300 rounded"></div>
                  <span className="text-sm text-gray-600">Current Volume</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-t from-green-400 to-green-300 rounded"></div>
                  <span className="text-sm text-gray-600">New Volume</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Transfer Progress</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Details Grid */}
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
                  <span className="text-sm font-light text-gray-600">Form ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-light">#{form.id.slice(0, 8)}</span>
                    <CopyButton text={form.id} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Date</span>
                  <span className="text-sm font-light">
                    {new Date(form.date).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Quantity Received</span>
                  <span className="text-sm font-light text-blue-600">{form.quantity_received}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Samples Collected</span>
                  <span className="text-sm font-light text-green-600">{form.samples_collected?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Driver Form Details */}
            {form.raw_milk_intake_form_drivers_form_id_fkey && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-light">Driver Form</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Form ID</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-light">#{form.drivers_form_id.slice(0, 8)}</span>
                      <CopyButton text={form.drivers_form_id} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Start Date</span>
                    <span className="text-sm font-light">
                      {new Date(form.raw_milk_intake_form_drivers_form_id_fkey.start_date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Status</span>
                    <Badge className={`text-xs ${form.raw_milk_intake_form_drivers_form_id_fkey.delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {form.raw_milk_intake_form_drivers_form_id_fkey.delivered ? 'Delivered' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Products</span>
                    <span className="text-sm font-light">{form.raw_milk_intake_form_drivers_form_id_fkey.collected_products?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Destination Silo Details */}
            {form.raw_milk_intake_form_destination_silo_id_fkey && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-light">Destination Silo</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Silo Name</span>
                    <span className="text-sm font-light text-green-600">{form.raw_milk_intake_form_destination_silo_id_fkey.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Location</span>
                    <span className="text-sm font-light">{form.raw_milk_intake_form_destination_silo_id_fkey.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Capacity</span>
                    <span className="text-sm font-light">{form.raw_milk_intake_form_destination_silo_id_fkey.capacity.toLocaleString()}L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Current Volume</span>
                    <span className="text-sm font-light text-blue-600">{form.raw_milk_intake_form_destination_silo_id_fkey.milk_volume.toLocaleString()}L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Expected New</span>
                    <span className="text-sm font-light text-orange-600">
                      {(form.raw_milk_intake_form_destination_silo_id_fkey.milk_volume + form.quantity_received).toLocaleString()}L
                    </span>
                  </div>
                  
                  {/* Capacity Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-light text-gray-600 mb-2">
                      <span>Capacity Usage</span>
                      <span>{Math.round((form.raw_milk_intake_form_destination_silo_id_fkey.milk_volume / form.raw_milk_intake_form_destination_silo_id_fkey.capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((form.raw_milk_intake_form_destination_silo_id_fkey.milk_volume / form.raw_milk_intake_form_destination_silo_id_fkey.capacity) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Samples Information */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-light">Samples Collected</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Samples</span>
                  <span className="text-sm font-light text-purple-600">{form.samples_collected?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Volume</span>
                  <span className="text-sm font-light">
                    {form.samples_collected?.reduce((sum, sample) => sum + sample.amount_collected, 0).toFixed(1)}L
                  </span>
                </div>
                {form.samples_collected && form.samples_collected.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-light text-gray-600 mb-2">Sample Serial Numbers:</p>
                    <div className="flex flex-wrap gap-1">
                      {form.samples_collected.map((sample, index) => (
                        <Badge key={index} className="text-xs bg-purple-100 text-purple-800">
                          {sample.serial_no.slice(0, 8)}
                        </Badge>
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