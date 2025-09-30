"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Droplets, Settings, FlaskConical, Users, Clock, CheckCircle } from "lucide-react"
import type { CIPControlForm } from "@/lib/api/data-capture-forms"

interface CIPControlFormViewDrawerProps {
  open: boolean
  onClose: () => void
  form: CIPControlForm | null
  onEdit?: () => void
}

export function CIPControlFormViewDrawer({ open, onClose, form, onEdit }: CIPControlFormViewDrawerProps) {
  if (!form) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft": return "bg-gray-100 text-gray-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Completed": return "bg-green-100 text-green-800"
      case "Approved": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[60vw] sm:max-w-[60vw] p-0 overflow-hidden bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            <Droplets className="w-5 h-5" />
            CIP Control Form Details
          </SheetTitle>
          <p className="text-sm font-light text-muted-foreground">
            Complete information about the cleaning in place control form record
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-light">CIP Control Form</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-light">Basic Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Status</span>
                <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Machine/System</span>
                <span className="text-sm font-light">{form.cip_control_form_machine_id_fkey?.name || form.machine_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Operator</span>
                <span className="text-sm font-light">
                  {form.cip_control_form_operator_id_fkey 
                    ? `${form.cip_control_form_operator_id_fkey.first_name} ${form.cip_control_form_operator_id_fkey.last_name}`
                    : form.operator_id
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Date</span>
                <span className="text-sm font-light">
                  {form.date ? new Date(form.date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Solution Concentrations */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-lg font-light">Solution Concentrations</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Caustic Solution</span>
                <span className="text-sm font-light text-orange-600">{form.caustic_solution_strength}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Acid Solution</span>
                <span className="text-sm font-light text-red-600">{form.acid_solution_strength}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Rinse Water Test</span>
                <span className="text-sm font-light text-blue-600">{form.rinse_water_test}</span>
              </div>
            </div>
          </div>

          {/* Approval & Verification */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-light">Approval & Verification</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Approver</span>
                <span className="text-sm font-light">{form.cip_control_form_approver_fkey?.role_name || form.approver}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Analyzer</span>
                <span className="text-sm font-light">
                  {form.cip_control_form_analyzer_fkey 
                    ? `${form.cip_control_form_analyzer_fkey.first_name} ${form.cip_control_form_analyzer_fkey.last_name}`
                    : form.analyzer
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Checked By</span>
                <span className="text-sm font-light">
                  {form.cip_control_form_checked_by_fkey 
                    ? `${form.cip_control_form_checked_by_fkey.first_name} ${form.cip_control_form_checked_by_fkey.last_name}`
                    : form.checked_by
                  }
                </span>
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
                  {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Last Updated</span>
                <span className="text-sm font-light">
                  {form.updated_at ? new Date(form.updated_at).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
