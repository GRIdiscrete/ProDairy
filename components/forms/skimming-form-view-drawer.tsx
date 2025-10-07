"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Beaker, TrendingUp, Clock } from "lucide-react"
import { SkimmingForm } from "@/lib/api/skimming-form"

interface SkimmingFormViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: SkimmingForm | null
  onEdit?: () => void
}

export function SkimmingFormViewDrawer({ 
  open, 
  onOpenChange, 
  form, 
  onEdit 
}: SkimmingFormViewDrawerProps) {
  if (!form) return null

  const rawMilkData = (form as any).standardizing_form_raw_milk?.[0]
  const skimMilkData = (form as any).standardizing_form_skim_milk?.[0]
  const creamData = (form as any).standardizing_form_cream?.[0]

  const totalRawMilk = rawMilkData ? rawMilkData.quantity || 0 : 0
  const totalSkimMilk = skimMilkData ? skimMilkData.quantity || 0 : 0
  const totalCream = creamData ? creamData.quantity || 0 : 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 overflow-hidden bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            <Beaker className="w-5 h-5" />
            Skimming Form Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            View details of the skimming form #{form.id.slice(0, 8)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-light mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Form ID</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-light">#{form.id.slice(0, 8)}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Clock className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">BMT ID</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-light">
                    {form.bmt_id ? `#${form.bmt_id.slice(0, 8)}` : 'Not specified'}
                  </span>
                  {form.bmt_id && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Clock className="h-3 w-3" />
                    </Button>
                  )}
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
                  {(() => {
                    let count = 0
                    if (rawMilkData) count++
                    if (skimMilkData) count++
                    if (creamData) count++
                    return count
                  })()}
                </span>
              </div>
              <div className="space-y-2 pt-2">
                <span className="text-sm font-light text-gray-600">Operator</span>
                <div className="text-sm font-light">
                  {form.operator_id ? `ID: ${form.operator_id.slice(0, 8)}` : 'Not specified'}
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <span className="text-sm font-light text-gray-600">Operator Signature</span>
                {form.operator_signature ? (
                  <div className="mt-1">
                    <img
                      src={`data:image/png;base64,${form.operator_signature}`}
                      alt="Operator signature"
                      className="h-16 border border-gray-200 rounded-md bg-white"
                    />
                  </div>
                ) : (
                  <div className="h-16 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                    No signature available
                  </div>
                )}
              </div>
            </div>
          </div>

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
                <span className="text-sm font-light text-gray-600">Quantity</span>
                <span className="text-sm font-light text-orange-600">
                  {rawMilkData ? '1 entry' : '0 entries'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Total Quantity</span>
                <span className="text-sm font-light">{totalRawMilk.toFixed(1)}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Fat Content</span>
                <span className="text-sm font-light">
                  {rawMilkData ? `${rawMilkData.fat || 0}%` : '0.0%'}
                </span>
              </div>
              {rawMilkData ? (
                <div className="mt-4">
                  <p className="text-xs font-light text-gray-600 mb-2">Raw Milk Details:</p>
                  <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs bg-orange-50 p-2 rounded">
                        <span className="font-light">Raw Milk Entry</span>
                        <div className="flex items-center space-x-2">
                          <Badge className="text-xs bg-orange-100 text-orange-800">
                            {rawMilkData.quantity || 0}L
                          </Badge>
                          <Badge className="text-xs bg-yellow-100 text-yellow-800">
                            {rawMilkData.fat || 0}% fat
                          </Badge>
                        </div>
                      </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">No raw milk data available</p>
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
                <span className="text-sm font-light text-gray-600">Quantity</span>
                <span className="text-sm font-light text-blue-600">
                  {skimMilkData ? '1 entry' : '0 entries'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Total Quantity</span>
                <span className="text-sm font-light">{totalSkimMilk.toFixed(1)}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Fat Content</span>
                <span className="text-sm font-light">
                  {skimMilkData ? `${skimMilkData.fat || 0}%` : '0.0%'}
                </span>
              </div>
              {skimMilkData ? (
                <div className="mt-4">
                  <p className="text-xs font-light text-gray-600 mb-2">Skim Milk Details:</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs bg-blue-50 p-2 rounded">
                      <span className="font-light">Skim Milk Entry</span>
                      <div className="flex items-center space-x-2">
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                          {skimMilkData.quantity || 0}L
                        </Badge>
                        <Badge className="text-xs bg-cyan-100 text-cyan-800">
                          {skimMilkData.fat || 0}% fat
                        </Badge>
                        {skimMilkData.destination_silo_id && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Silo #{skimMilkData.destination_silo_id.slice(0, 6)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">No skim milk data available</p>
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
                <span className="text-sm font-light text-gray-600">Quantity</span>
                <span className="text-sm font-light text-yellow-600">
                  {creamData ? '1 entry' : '0 entries'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Total Quantity</span>
                <span className="text-sm font-light">{totalCream.toFixed(1)}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Fat Content</span>
                <span className="text-sm font-light">
                  {creamData ? `${creamData.fat || 0}%` : '0.0%'}
                </span>
              </div>
              {creamData ? (
                <div className="mt-4">
                  <p className="text-xs font-light text-gray-600 mb-2">Cream Details:</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs bg-yellow-50 p-2 rounded">
                      <span className="font-light">Cream Entry</span>
                      <div className="flex items-center space-x-2">
                        <Badge className="text-xs bg-yellow-100 text-yellow-800">
                          {creamData.quantity || 0}L
                        </Badge>
                        <Badge className="text-xs bg-orange-100 text-orange-800">
                          {creamData.fat || 0}% fat
                        </Badge>
                        {creamData.transfer_start && creamData.transfer_end && (
                          <Badge className="text-xs bg-purple-100 text-purple-800">
                            {Math.round((new Date(creamData.transfer_end).getTime() - new Date(creamData.transfer_start).getTime()) / (1000 * 60))}min
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">No cream data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Record Information */}
          <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-light mb-4">Record Information</h3>
            <div className="grid grid-cols-2 gap-4">
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
              {form.updated_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Updated</span>
                  <span className="text-sm font-light">
                    {new Date(form.updated_at).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={onEdit}>
                Edit Form
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
