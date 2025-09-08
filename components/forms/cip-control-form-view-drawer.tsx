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
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <SheetTitle className="flex items-center space-x-2">
                  <span>CIP Control Form</span>
                  <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                </SheetTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {form.cip_control_form_machine_id_fkey?.name || form.machine_id} • {form.date && new Date(form.date).toLocaleDateString()}
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
                <Settings className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm font-semibold">
                    <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Machine/System</label>
                  <p className="text-sm font-semibold">{form.cip_control_form_machine_id_fkey?.name || form.machine_id}</p>
                  {form.cip_control_form_machine_id_fkey && (
                    <p className="text-xs text-gray-400">{form.cip_control_form_machine_id_fkey.location} • {form.cip_control_form_machine_id_fkey.category}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Operator</label>
                  <p className="text-sm font-semibold">
                    {form.cip_control_form_operator_id_fkey 
                      ? `${form.cip_control_form_operator_id_fkey.first_name} ${form.cip_control_form_operator_id_fkey.last_name}`
                      : form.operator_id
                    }
                  </p>
                  {form.cip_control_form_operator_id_fkey && (
                    <p className="text-xs text-gray-400">{form.cip_control_form_operator_id_fkey.department} • {form.cip_control_form_operator_id_fkey.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-sm font-semibold flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {form.date ? new Date(form.date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solution Concentrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FlaskConical className="w-5 h-5 mr-2" />
                Solution Concentrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Caustic Solution</label>
                  <p className="text-2xl font-bold text-orange-600">{form.caustic_solution_strength}%</p>
                  <p className="text-xs text-gray-500">Strength concentration</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Acid Solution</label>
                  <p className="text-2xl font-bold text-red-600">{form.acid_solution_strength}%</p>
                  <p className="text-xs text-gray-500">Strength concentration</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="text-sm font-medium text-blue-700">Rinse Water Test Result</label>
                <p className="text-lg font-bold text-blue-800">{form.rinse_water_test}</p>
                <p className="text-xs text-blue-600">Water quality after rinse cycle</p>
              </div>
            </CardContent>
          </Card>

          {/* Approval & Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Approval & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Approver</label>
                  <p className="text-sm font-semibold">{form.cip_control_form_approver_fkey?.role_name || form.approver}</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Approved</span>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Analyzer</label>
                  <p className="text-sm font-semibold">
                    {form.cip_control_form_analyzer_fkey 
                      ? `${form.cip_control_form_analyzer_fkey.first_name} ${form.cip_control_form_analyzer_fkey.last_name}`
                      : form.analyzer
                    }
                  </p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Analyzed</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <label className="text-sm font-medium text-green-700">Checked By</label>
                <p className="text-lg font-bold text-green-800">
                  {form.cip_control_form_checked_by_fkey 
                    ? `${form.cip_control_form_checked_by_fkey.first_name} ${form.cip_control_form_checked_by_fkey.last_name}`
                    : form.checked_by
                  }
                </p>
                <p className="text-xs text-green-600">Final verification and sign-off</p>
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
