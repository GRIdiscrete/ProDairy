"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { CopyButton } from "@/components/ui/copy-button"
import { AnimatedSiloTransfer } from "@/components/ui/animated-silo-transfer"
import { Edit, Beaker, Droplets, Users, Clock, BarChart3, ArrowRight, Play, RotateCcw, FileText, Package, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
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
      <SheetContent className="w-[60vw] sm:max-w-[60vw] p-0 overflow-hidden bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            <Beaker className="w-5 h-5" />
            BMT Control Form Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Complete information about the bulk milk transfer control form record
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Process Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-light">Source Silo</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600">BMT Transfer</span>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    Current Step
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-light text-gray-400">Destination Silo</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-light">BMT Control Form</h2>
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
            </div>
          </div>

          {/* Transfer Details */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Beaker className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-light">Transfer Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Product</span>
                <span className="text-sm font-light text-blue-600">{form.product}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Volume</span>
                <span className="text-sm font-light text-green-600">{form.volume}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Source Silo</span>
                <span className="text-sm font-light">{form.bmt_control_form_source_silo_id_fkey?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Destination Silo</span>
                <span className="text-sm font-light">{form.bmt_control_form_destination_silo_id_fkey?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

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
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-lg font-light">Flow Meter Readings</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Start Reading</span>
                <span className="text-sm font-light text-blue-600">{form.flow_meter_start_reading}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">End Reading</span>
                <span className="text-sm font-light text-green-600">{form.flow_meter_end_reading}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Volume Difference</span>
                <span className={`text-sm font-light ${volumeDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {volumeDifference > 0 ? '+' : ''}{volumeDifference}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Start Time</span>
                <span className="text-sm font-light">
                  {form.flow_meter_start ? format(new Date(form.flow_meter_start), 'PPp') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">End Time</span>
                <span className="text-sm font-light">
                  {form.flow_meter_end ? format(new Date(form.flow_meter_end), 'PPp') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Movement Timeline */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-lg font-light">Movement Timeline</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Movement Start</span>
                <span className="text-sm font-light">
                  {form.movement_start ? format(new Date(form.movement_start), 'PPp') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Movement End</span>
                <span className="text-sm font-light">
                  {form.movement_end ? format(new Date(form.movement_end), 'PPp') : 'N/A'}
                </span>
              </div>
              {form.movement_start && form.movement_end && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Duration</span>
                  <span className="text-sm font-light text-indigo-600">
                    {Math.round((new Date(form.movement_end).getTime() - new Date(form.movement_start).getTime()) / (1000 * 60))} minutes
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Operator Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-light">Operator Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">LLM Operator</span>
                  <span className="text-sm font-light">
                    {form.bmt_control_form_llm_operator_id_fkey 
                      ? `${form.bmt_control_form_llm_operator_id_fkey.first_name} ${form.bmt_control_form_llm_operator_id_fkey.last_name}`
                      : form.llm_operator_id
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Department</span>
                  <span className="text-sm font-light">
                    {form.bmt_control_form_llm_operator_id_fkey?.department || 'N/A'}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-light text-gray-600">LLM Signature</span>
                  {form.llm_signature ? (
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <img
                        src={base64ToPngDataUrl(form.llm_signature)}
                        alt="LLM signature"
                        className="w-full h-20 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center text-gray-500 text-sm">
                      No signature available
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">DPP Operator</span>
                  <span className="text-sm font-light">
                    {form.bmt_control_form_dpp_operator_id_fkey 
                      ? `${form.bmt_control_form_dpp_operator_id_fkey.first_name} ${form.bmt_control_form_dpp_operator_id_fkey.last_name}`
                      : form.dpp_operator_id
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Department</span>
                  <span className="text-sm font-light">
                    {form.bmt_control_form_dpp_operator_id_fkey?.department || 'N/A'}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-light text-gray-600">DPP Signature</span>
                  {form.dpp_signature ? (
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <img
                        src={base64ToPngDataUrl(form.dpp_signature)}
                        alt="DPP signature"
                        className="w-full h-20 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center text-gray-500 text-sm">
                      No signature available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Record Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
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
