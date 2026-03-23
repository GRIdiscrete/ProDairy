"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Beaker, TrendingUp, Clock } from "lucide-react"
import { SkimmingForm } from "@/lib/api/skimming-form"
import { RootState, useAppSelector } from "@/lib/store"

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

  const rawMilkData = form.raw_milk
  const skimMilkData = form.skim_milk
  const creamData = form.cream

  const totalRawMilk = rawMilkData ? rawMilkData.quantity || 0 : 0
  const totalSkimMilk = skimMilkData ? skimMilkData.quantity || 0 : 0
  const totalCream = creamData ? creamData.quantity || 0 : 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 overflow-hidden bg-white flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            <Beaker className="w-5 h-5" />
            Skimming Form Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            View details of the skimming form {form.tag}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-light mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between col-span-2">
                <span className="text-sm font-light text-gray-600">Form ID</span>
                <span className="text-sm font-light">{form?.tag}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Created</span>
                <span className="text-sm font-light">
                  {form.created_at ? new Date(form.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'N/A'}
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
                <span className="text-sm font-light text-gray-600">Operator ID</span>
                <div className="text-sm font-light truncate max-w-[150px]">
                  {form.operator_id || 'Not specified'}
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
          <div className="p-6 bg-white border border-gray-200 rounded-lg border-l-4 border-l-green-500">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Beaker className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-lg font-light">Raw Milk</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Source Silo</span>
                <span className="text-sm font-light">{rawMilkData?.source_silo_name || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Quantity</span>
                <span className="text-sm font-light">{totalRawMilk.toFixed(1)}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Fat Content</span>
                <span className="text-sm font-light">
                  {rawMilkData?.fat != null ? `${rawMilkData.fat}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Skim Milk Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg border-l-4 border-l-[#006BC4]">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#006BC4]" />
              </div>
              <h3 className="text-lg font-light">Skim Milk</h3>
            </div>
            <div className="space-y-3">
              {skimMilkData ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Destination Silo</span>
                    <span className="text-sm font-light">{skimMilkData.destination_silo_name || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Quantity</span>
                    <span className="text-sm font-light">{totalSkimMilk.toFixed(1)}L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Fat Content</span>
                    <span className="text-sm font-light">
                      {skimMilkData.fat != null ? `${skimMilkData.fat}%` : '—'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm font-light text-gray-400 italic">No skim milk produced</p>
                </div>
              )}
            </div>
          </div>

          {/* Cream Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg border-l-4 border-l-yellow-500">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
              </div>
              <h3 className="text-lg font-light">Cream</h3>
            </div>
            <div className="space-y-3">
              {creamData ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Cream Tank</span>
                    <span className="text-sm font-light">{creamData.cream_tank || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Quantity</span>
                    <span className="text-sm font-light">{totalCream.toFixed(1)}L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Fat Content</span>
                    <span className="text-sm font-light">
                      {creamData.fat != null ? `${creamData.fat}%` : '—'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm font-light text-gray-400 italic">No cream produced</p>
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
                  {form.created_at ? new Date(form.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'N/A'}
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
            <Button  onClick={() => onOpenChange(false)}>
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
