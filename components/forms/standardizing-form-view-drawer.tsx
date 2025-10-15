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
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { UserAvatar } from "@/components/ui/user-avatar"
import { generateStandardizingFormId, generateBMTFormId } from "@/lib/utils/form-id-generator"
import { useAppSelector } from "@/lib/store"

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
  
  // Get users and BMT forms from state
  const { items: users } = useAppSelector((state) => state.users)
  const { forms: bmtForms } = useAppSelector((state) => state.bmtControlForms)

  // Helper functions
  const getUserById = (userId: string) => {
    return users.find((user: any) => user.id === userId)
  }

  const getBMTFormById = (bmtId: string) => {
    return bmtForms.find((form: any) => form.id === bmtId)
  }

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

  const totalRawMilk = 0; // Not applicable for standardizing forms
  const totalSkimMilk = ((form as any).standardizing_form_no_skim_skim_milk && Array.isArray((form as any).standardizing_form_no_skim_skim_milk)) ? (form as any).standardizing_form_no_skim_skim_milk.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) : 0
  const totalCream = 0; // Not applicable for standardizing forms

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 overflow-hidden bg-white">
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
              <h2 className="text-xl font-light">Standardizing Form</h2>
              <FormIdCopy 
                displayId={form?.tag}
                actualId={form.id}
                size="md"
              />
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
                  <FormIdCopy 
                    displayId={form?.tag}
                    actualId={form.id}
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">BMT Form</span>
                  {form.bmt_id ? (
                    (() => {
                      const bmtForm = getBMTFormById(form.bmt_id)
                      return bmtForm ? (
                        <FormIdCopy 
                          displayId={bmtForm?.tag}
                          actualId={form.bmt_id}
                          size="sm"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-light">#{form.bmt_id.slice(0, 8)}</span>
                        </div>
                      )
                    })()
                  ) : (
                    <span className="text-sm font-light text-gray-400">Not specified</span>
                  )}
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
                    {((form as any).standardizing_form_no_skim_skim_milk && Array.isArray((form as any).standardizing_form_no_skim_skim_milk)) ? (form as any).standardizing_form_no_skim_skim_milk.length : 0}
                  </span>
                </div>
                <div className="space-y-2 pt-2">
                  <span className="text-sm font-light text-gray-600">Operator</span>
                  <div className="text-sm font-light">
                    {form.operator_id ? (
                      (() => {
                        const operatorUser = getUserById(form.operator_id)
                        return operatorUser ? (
                          <UserAvatar 
                            user={operatorUser} 
                            size="md" 
                            showName={true} 
                            showEmail={true}
                            showDropdown={true}
                          />
                        ) : (
                          <div className="text-xs text-gray-400">Unknown operator ({form.operator_id.slice(0, 8)})</div>
                        )
                      })()
                    ) : (
                      <div className="text-xs text-gray-400">Not specified</div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <span className="text-sm font-light text-gray-600">Operator Signature</span>
                  {form.operator_signature ? (
                    <div className="mt-1">
                      <img
                        src={base64ToPngDataUrl(form.operator_signature)}
                        alt="Operator signature"
                        className="h-24 border border-gray-200 rounded-md bg-white"
                      />
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                      No signature available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BMT Form Details */}
            {form.bmt_id && (() => {
              const bmtForm = getBMTFormById(form.bmt_id)
              return bmtForm ? (
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-light">BMT Form Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">BMT Form ID</span>
                      <FormIdCopy 
                        displayId={bmtForm?.tag}
                        actualId={form.bmt_id}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Volume</span>
                      <span className="text-sm font-light">{bmtForm.volume}L</span>
                    </div>
                    {/* <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">Product</span>
                      <span className="text-sm font-light text-blue-600">{bmtForm.product}</span>
                    </div> */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-600">BMT Created</span>
                      <span className="text-sm font-light">
                        {new Date(bmtForm.created_at).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null
            })()}


            {/* Raw Milk Information */}

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
                  <span className="text-sm font-light text-blue-600">
                    {((form as any).standardizing_form_no_skim_skim_milk && Array.isArray((form as any).standardizing_form_no_skim_skim_milk)) ? (form as any).standardizing_form_no_skim_skim_milk.length : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Total Quantity</span>
                  <span className="text-sm font-light">{totalSkimMilk.toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Avg Fat Content</span>
                  <span className="text-sm font-light">
                    {((form as any).standardizing_form_no_skim_skim_milk && Array.isArray((form as any).standardizing_form_no_skim_skim_milk) && (form as any).standardizing_form_no_skim_skim_milk.length > 0)
                      ? (((form as any).standardizing_form_no_skim_skim_milk).reduce((sum: number, item: any) => sum + (item.resulting_fat || 0), 0) / (form as any).standardizing_form_no_skim_skim_milk.length).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
                {((form as any).standardizing_form_no_skim_skim_milk && Array.isArray((form as any).standardizing_form_no_skim_skim_milk) && (form as any).standardizing_form_no_skim_skim_milk.length > 0) ? (
                  <div className="mt-4">
                    <p className="text-xs font-light text-gray-600 mb-2">Skim Milk Entries:</p>
                    <div className="space-y-2">
                      {(form as any).standardizing_form_no_skim_skim_milk.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-blue-50 p-2 rounded">
                          <span className="font-light">Entry {index + 1}</span>
                          <div className="flex items-center space-x-2">
                            <Badge className="text-xs bg-blue-100 text-blue-800">
                              {item.quantity || 0}L
                            </Badge>
                            <Badge className="text-xs bg-cyan-100 text-cyan-800">
                              {item.resulting_fat || 0}% fat
                            </Badge>
                          </div>
                        </div>
                      ))}
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
