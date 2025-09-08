"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedSiloTransfer } from "@/components/ui/animated-silo-transfer"
import { Edit, Beaker, Droplets, Users, Clock, BarChart3, ArrowRight, Play, RotateCcw } from "lucide-react"
import type { BMTControlForm } from "@/lib/api/data-capture-forms"

interface BMTControlFormViewDrawerProps {
  open: boolean
  onClose: () => void
  form: BMTControlForm | null
  onEdit?: () => void
}

export function BMTControlFormViewDrawer({ open, onClose, form, onEdit }: BMTControlFormViewDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)

  if (!form) return null

  const volumeDifference = (form.flow_meter_end_reading || 0) - (form.flow_meter_start_reading || 0)

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
    }, 50) // Faster animation for demo
  }

  const resetAnimation = () => {
    setIsAnimating(false)
    setAnimationProgress(0)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Beaker className="w-5 h-5 text-white" />
              </div>
              <div>
                <SheetTitle className="flex items-center space-x-2">
                  <span>BMT Control Form</span>
                  <Badge className="bg-blue-100 text-blue-800">{form.product}</Badge>
                </SheetTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {form.bmt_control_form_source_silo_id_fkey?.name || form.source_silo_id} → {form.bmt_control_form_destination_silo_id_fkey?.name || form.destination_silo_id} • {form.volume}L
                </p>
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Form
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Beaker className="w-5 h-5 mr-2" />
                Product Transfer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Type</label>
                  <p className="text-sm font-semibold">{form.product}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Volume</label>
                  <p className="text-sm font-semibold">{form.volume} Liters</p>
                </div>
              </div>
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{form.bmt_control_form_source_silo_id_fkey?.name || form.source_silo_id}</div>
                    <div className="text-xs text-gray-500">Source Silo</div>
                    {form.bmt_control_form_source_silo_id_fkey && (
                      <div className="text-xs text-gray-400">{form.bmt_control_form_source_silo_id_fkey.location}</div>
                    )}
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{form.bmt_control_form_destination_silo_id_fkey?.name || form.destination_silo_id}</div>
                    <div className="text-xs text-gray-500">Destination Silo</div>
                    {form.bmt_control_form_destination_silo_id_fkey && (
                      <div className="text-xs text-gray-400">{form.bmt_control_form_destination_silo_id_fkey.location}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Animated Silo Transfer Visualization */}
          {form.bmt_control_form_source_silo_id_fkey && form.bmt_control_form_destination_silo_id_fkey && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Milk Transfer Visualization</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startAnimation}
                    disabled={isAnimating}
                    className="flex items-center space-x-1"
                  >
                    <Play className="w-4 h-4" />
                    <span>Demo Transfer</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAnimation}
                    className="flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </Button>
                </div>
              </div>
              
              <AnimatedSiloTransfer
                sourceSilo={{
                  id: form.bmt_control_form_source_silo_id_fkey.id,
                  name: form.bmt_control_form_source_silo_id_fkey.name,
                  capacity: form.bmt_control_form_source_silo_id_fkey.capacity,
                  currentVolume: form.bmt_control_form_source_silo_id_fkey.milk_volume - (isAnimating ? (animationProgress / 100) * form.volume : form.volume),
                  location: form.bmt_control_form_source_silo_id_fkey.location,
                  category: form.bmt_control_form_source_silo_id_fkey.category
                }}
                destinationSilo={{
                  id: form.bmt_control_form_destination_silo_id_fkey.id,
                  name: form.bmt_control_form_destination_silo_id_fkey.name,
                  capacity: form.bmt_control_form_destination_silo_id_fkey.capacity,
                  currentVolume: form.bmt_control_form_destination_silo_id_fkey.milk_volume + (isAnimating ? (animationProgress / 100) * form.volume : form.volume),
                  location: form.bmt_control_form_destination_silo_id_fkey.location,
                  category: form.bmt_control_form_destination_silo_id_fkey.category
                }}
                transferVolume={form.volume}
                isTransferring={isAnimating}
                transferProgress={animationProgress}
              />
            </div>
          )}

          {/* Flow Meter Readings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Flow Meter Readings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Start Reading</label>
                  <p className="text-2xl font-bold text-blue-600">{form.flow_meter_start_reading}</p>
                  <p className="text-xs text-gray-500">
                    {form.flow_meter_start ? new Date(form.flow_meter_start).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">End Reading</label>
                  <p className="text-2xl font-bold text-green-600">{form.flow_meter_end_reading}</p>
                  <p className="text-xs text-gray-500">
                    {form.flow_meter_end ? new Date(form.flow_meter_end).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border rounded-lg">
                <label className="text-sm font-medium text-gray-500">Volume Difference</label>
                <p className={`text-2xl font-bold ${volumeDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {volumeDifference > 0 ? '+' : ''}{volumeDifference}
                </p>
                <p className="text-xs text-gray-500">Flow meter differential</p>
              </div>
            </CardContent>
          </Card>

          {/* Movement Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Movement Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Movement Start</label>
                  <p className="text-sm font-semibold">
                    {form.movement_start ? new Date(form.movement_start).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Movement End</label>
                  <p className="text-sm font-semibold">
                    {form.movement_end ? new Date(form.movement_end).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              {form.movement_start && form.movement_end && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="text-sm font-medium text-blue-700">Total Duration</label>
                  <p className="text-lg font-bold text-blue-800">
                    {Math.round((new Date(form.movement_end).getTime() - new Date(form.movement_start).getTime()) / (1000 * 60))} minutes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operator Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Operator Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">LLM Operator</label>
                  <p className="text-sm font-semibold">
                    {form.bmt_control_form_llm_operator_id_fkey 
                      ? `${form.bmt_control_form_llm_operator_id_fkey.first_name} ${form.bmt_control_form_llm_operator_id_fkey.last_name}`
                      : form.llm_operator_id
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {form.bmt_control_form_llm_operator_id_fkey && (
                      <span>{form.bmt_control_form_llm_operator_id_fkey.department} • </span>
                    )}
                    Signature: {form.llm_signature}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">DPP Operator</label>
                  <p className="text-sm font-semibold">
                    {form.bmt_control_form_dpp_operator_id_fkey 
                      ? `${form.bmt_control_form_dpp_operator_id_fkey.first_name} ${form.bmt_control_form_dpp_operator_id_fkey.last_name}`
                      : form.dpp_operator_id
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {form.bmt_control_form_dpp_operator_id_fkey && (
                      <span>{form.bmt_control_form_dpp_operator_id_fkey.department} • </span>
                    )}
                    Signature: {form.dpp_signature}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm font-semibold">
                    {form.created_at ? new Date(form.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm font-semibold">
                    {form.updated_at ? new Date(form.updated_at).toLocaleString() : 'Never updated'}
                  </p>
                </div>
              </div>
              {form.id && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Form ID</label>
                  <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{form.id}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
