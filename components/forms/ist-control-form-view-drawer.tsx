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
      <SheetContent className="w-[60vw] sm:max-w-[60vw] p-0 overflow-hidden bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            <Package className="w-5 h-5" />
            IST Control Form Details
          </SheetTitle>
          <p className="text-sm font-light text-muted-foreground">
            Complete information about the item stock transfer control form record
          </p>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-light">IST Control Form</h2>
            </div>
          </div>

          {/* Item Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-light">Item Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Item Code</span>
                <span className="text-sm font-light text-blue-600">{form.item_code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Transaction</span>
                <span className="text-sm font-light text-green-600">{form.item_trans}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Description</span>
                <span className="text-sm font-light">{form.item_description}</span>
              </div>
            </div>
          </div>

          {/* Warehouse Transfer */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-lg font-light">Warehouse Transfer</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">From Warehouse</span>
                <span className="text-sm font-light text-orange-600">{form.from_warehouse}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">To Warehouse</span>
                <span className="text-sm font-light text-green-600">{form.to_warehouse}</span>
              </div>
            </div>
          </div>

          {/* Personnel Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-light">Personnel Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Issued By</span>
                <span className="text-sm font-light">
                  {form.ist_control_form_issued_by_fkey
                    ? `${form.ist_control_form_issued_by_fkey.first_name} ${form.ist_control_form_issued_by_fkey.last_name}`
                    : `User: ${form.issued_by?.slice(0, 8)}...`
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Received By</span>
                <span className="text-sm font-light">
                  {form.ist_control_form_received_by_fkey
                    ? `${form.ist_control_form_received_by_fkey.first_name} ${form.ist_control_form_received_by_fkey.last_name}`
                    : `User: ${form.received_by?.slice(0, 8)}...`
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Approver</span>
                <span className="text-sm font-light">
                  {form.ist_control_form_approver_fkey
                    ? `${form.ist_control_form_approver_fkey.first_name} ${form.ist_control_form_approver_fkey.last_name}`
                    : `User: ${form.approver?.slice(0, 8)}...`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Record Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-light mb-4">Record Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-light text-gray-600">Created</p>
                <p className="text-sm font-light">
                  {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-light text-gray-600">Last Updated</p>
                <p className="text-sm font-light">
                  {form.updated_at ? new Date(form.updated_at).toLocaleDateString() : 'Never updated'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
