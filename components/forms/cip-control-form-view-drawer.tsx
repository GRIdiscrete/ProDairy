"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Droplets, Settings, FlaskConical, Users, Clock, CheckCircle } from "lucide-react"
import { UserAvatar } from "@/components/ui/user-avatar"
import type { CIPControlForm } from "@/lib/api/data-capture-forms"

interface CIPControlFormViewDrawerProps {
  open: boolean
  onClose: () => void
  form: CIPControlForm | null
  users?: any[]
  roles?: any[]
  getUserById?: (userId: string) => any
  getRoleById?: (roleId: string) => any
  onEdit?: () => void
}

export function CIPControlFormViewDrawer({ open, onClose, form, users = [], roles = [], getUserById, getRoleById, onEdit }: CIPControlFormViewDrawerProps) {
  if (!form) return null

  // Get user objects
  const operatorUser = getUserById?.(form.operator_id)
  const analyzerUser = getUserById?.(form.analyzer)
  const checkedByUser = getUserById?.(form.checked_by)
  
  // Get role for approver
  const approverRole = getRoleById?.(form.approver)

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
      <SheetContent className="tablet-sheet-full p-0 bg-white">
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
                
                size="sm"
                onClick={onEdit}
                className="bg-[#A0CF06] text-[#211D1E] rounded-full"
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
                <span className="text-sm font-light text-gray-600">{form.machine_id ? 'Machine' : form.silo_id ? 'Silo' : 'Machine/Silo'}</span>
                <span className="text-sm font-light">{form.machine_or_silo || form.machine_id?.name || form.silo_id?.name || 'N/A'}</span>
              </div>
              
              {/* Operator with UserAvatar */}
              <div>
                <span className="text-sm font-light text-gray-600 block mb-2">Operator</span>
                {operatorUser ? (
                  <UserAvatar 
                    user={operatorUser} 
                    size="md" 
                    showName={true} 
                    showEmail={false}
                    showDropdown={true}
                  />
                ) : (
                  <span className="text-sm font-light text-gray-500">
                    {form.operator_id ? `User not found (${form.operator_id.slice(0, 8)}...)` : 'No operator assigned'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-light text-gray-600">Date</span>
                <span className="text-sm font-light">
                  {form.date ? new Date(form.date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Machine/Silo Details */}
          {form.machine_id && (
            <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-light">Machine Details</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Machine Name</span>
                  <span className="text-sm font-light">{form.machine_id?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Tag</span>
                  <span className="text-sm font-light">{form.machine_id?.tag || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Serial Number</span>
                  <span className="text-sm font-light">{form.machine_id?.serial_number || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Category</span>
                  <span className="text-sm font-light">{form.machine_id?.category || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Location</span>
                  <span className="text-sm font-light">{form.machine_id?.location || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Machine Status</span>
                  <Badge className={form.machine_id?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {form.machine_id?.status || 'N/A'}
                  </Badge>
                </div>
                {form.machine_id?.cases_packed && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-600">Cases Packed</span>
                    <span className="text-sm font-light">{form.machine_id.cases_packed}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Silo Details */}
          {form.silo_id && (
            <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                </div>
                <h3 className="text-lg font-light">Silo Details</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Silo Name</span>
                  <span className="text-sm font-light">{form.silo_id?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Serial Number</span>
                  <span className="text-sm font-light">{form.silo_id?.serial_number || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Category</span>
                  <span className="text-sm font-light">{form.silo_id?.category || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Location</span>
                  <span className="text-sm font-light">{form.silo_id?.location || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Capacity</span>
                  <span className="text-sm font-light">{form.silo_id?.capacity ? `${form.silo_id.capacity}L` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Milk Volume</span>
                  <span className="text-sm font-light">{form.silo_id?.milk_volume ? `${form.silo_id.milk_volume}L` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600">Silo Status</span>
                  <Badge className={form.silo_id?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {form.silo_id?.status || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

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
            <div className="space-y-4">
              {/* Approver (Role) */}
              <div>
                <span className="text-sm font-light text-gray-600 block mb-2">Approver Role</span>
                {approverRole ? (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#0068BD] flex items-center justify-center text-white font-medium">
                      {approverRole.role_name?.substring(0, 2).toUpperCase() || 'NA'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{approverRole.role_name || 'Unknown Role'}</div>
                      <div className="text-xs text-gray-500">Role ID: {form.approver}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    {form.approver ? `Role not found (${form.approver.slice(0, 8)}...)` : 'No approver assigned'}
                  </div>
                )}
              </div>
              
              {/* Analyzer (User) */}
              <div>
                <span className="text-sm font-light text-gray-600 block mb-2">Analyzer</span>
                {analyzerUser ? (
                  <UserAvatar 
                    user={analyzerUser} 
                    size="lg" 
                    showName={true} 
                    showEmail={true}
                    showDropdown={true}
                  />
                ) : (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    {form.analyzer ? `User not found (${form.analyzer.slice(0, 8)}...)` : 'No analyzer assigned'}
                  </div>
                )}
              </div>
              
              {/* Checked By (User) */}
              <div>
                <span className="text-sm font-light text-gray-600 block mb-2">Checked By</span>
                {checkedByUser ? (
                  <UserAvatar 
                    user={checkedByUser} 
                    size="lg" 
                    showName={true} 
                    showEmail={true}
                    showDropdown={true}
                  />
                ) : (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    {form.checked_by ? `User not found (${form.checked_by.slice(0, 8)}...)` : 'No checker assigned'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CIP Stages */}
          {form.cip_control_form_stages && form.cip_control_form_stages.length > 0 && (
            <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-cyan-600" />
                </div>
                <h3 className="text-lg font-light">CIP Stages</h3>
              </div>
              <div className="space-y-3">
                {form.cip_control_form_stages.map((stage, index) => (
                  <div key={stage.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Stage {index + 1}: {stage.stage}</h4>
                      <span className="text-xs text-gray-500">
                        {stage.created_at ? new Date(stage.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Start Time</span>
                        <span className="text-xs font-light text-blue-600">
                          {stage.start_time ? new Date(stage.start_time).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Stop Time</span>
                        <span className="text-xs font-light text-red-600">
                          {stage.stop_time ? new Date(stage.stop_time).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
