"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, User, Building2, ArrowRight, Calendar, Hash } from "lucide-react"
import type { ISTControlForm } from "@/lib/api/data-capture-forms"

interface ISTControlFormViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: ISTControlForm | null
}

export function ISTControlFormViewDrawer({ open, onOpenChange, form }: ISTControlFormViewDrawerProps) {
  if (!form) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>IST Control Form Details</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Form Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{form.item_description}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {form.item_code} • {form.item_trans}
                    </p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">IST Form</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Item Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Package className="w-4 h-4" />
                <span>Item Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Item Code</span>
                  </div>
                  <p className="text-sm font-semibold">{form.item_code}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Transaction</span>
                  </div>
                  <p className="text-sm font-semibold">{form.item_trans}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Description</span>
                </div>
                <p className="text-sm font-semibold">{form.item_description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Warehouse Transfer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Building2 className="w-4 h-4" />
                <span>Warehouse Transfer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-2">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold">{form.from_warehouse}</p>
                  <p className="text-xs text-gray-500">Source</p>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <ArrowRight className="w-6 h-6 text-blue-600" />
                  <Badge className="bg-blue-100 text-blue-800">Transfer</Badge>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-2">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold">{form.to_warehouse}</p>
                  <p className="text-xs text-gray-500">Destination</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personnel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <User className="w-4 h-4" />
                <span>Personnel Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Issued By</p>
                      <p className="text-sm font-semibold">
                        {form.ist_control_form_issued_by_fkey
                          ? `${form.ist_control_form_issued_by_fkey.first_name} ${form.ist_control_form_issued_by_fkey.last_name}`
                          : `User: ${form.issued_by?.slice(0, 8)}...`
                        }
                      </p>
                      {form.ist_control_form_issued_by_fkey && (
                        <p className="text-xs text-gray-400">{form.ist_control_form_issued_by_fkey.department} • {form.ist_control_form_issued_by_fkey.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Received By</p>
                      <p className="text-sm font-semibold">
                        {form.ist_control_form_received_by_fkey
                          ? `${form.ist_control_form_received_by_fkey.first_name} ${form.ist_control_form_received_by_fkey.last_name}`
                          : `User: ${form.received_by?.slice(0, 8)}...`
                        }
                      </p>
                      {form.ist_control_form_received_by_fkey && (
                        <p className="text-xs text-gray-400">{form.ist_control_form_received_by_fkey.department} • {form.ist_control_form_received_by_fkey.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approver</p>
                      <p className="text-sm font-semibold">
                        {form.ist_control_form_approver_fkey
                          ? `${form.ist_control_form_approver_fkey.first_name} ${form.ist_control_form_approver_fkey.last_name}`
                          : `User: ${form.approver?.slice(0, 8)}...`
                        }
                      </p>
                      {form.ist_control_form_approver_fkey && (
                        <p className="text-xs text-gray-400">{form.ist_control_form_approver_fkey.department} • {form.ist_control_form_approver_fkey.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Calendar className="w-4 h-4" />
                <span>Form Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm">
                    {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm">
                    {form.updated_at ? new Date(form.updated_at).toLocaleDateString() : 'Never updated'}
                  </p>
                </div>
              </div>
              
              {form.id && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Form ID</p>
                  <p className="text-xs font-mono text-gray-500 break-all">{form.id}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
