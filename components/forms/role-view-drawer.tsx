"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Shield, Settings, Eye, CheckCircle, Calendar, Clock } from "lucide-react"
import { UserRole } from "@/lib/types/roles"

interface RoleViewDrawerProps {
  open: boolean
  onClose: () => void
  role: UserRole | null
  onEdit?: () => void
}

const featureLabels: Record<string, string> = {
  user: "User Management",
  role: "Role Management", 
  machine_item: "Machine Management",
  silo_item: "Silo Management",
  supplier: "Supplier Management",
  process: "Process Management",
  devices: "Device Management",
  raw_product_collection: "Raw Product Collection",
  raw_milk_intake: "Raw Milk Intake",
  raw_milk_lab_test: "Raw Milk Lab Test",
  before_and_after_autoclave_lab_test: "Before & After Autoclave Lab Test",
  pasteurizing: "Pasteurizing",
  filmatic_operation: "Filmatic Operation",
  steri_process_operation: "Steri Process Operation",
  incubation: "Incubation",
  incubation_lab_test: "Incubation Lab Test",
  dispatch: "Dispatch",
  production_plan: "Production Plan",
}

const viewLabels: Record<string, string> = {
  dashboard: "Dashboard",
  settings: "Settings",
  admin_panel: "Admin Panel",
  user_tab: "User Tab",
  role_tab: "Role Tab",
  machine_tab: "Machine Tab",
  silo_tab: "Silo Tab",
  supplier_tab: "Supplier Tab",
  process_tab: "Process Tab",
  devices_tab: "Devices Tab",
  driver_ui: "Driver UI",
  data_capture_module: "Data Capture Module",
  lab_tests: "Lab Tests",
  operations: "Operations",
}

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800",
  read: "bg-blue-100 text-blue-800",
  update: "bg-yellow-100 text-yellow-800", 
  delete: "bg-red-100 text-red-800",
  approve: "bg-purple-100 text-purple-800",
}

export function RoleViewDrawer({ open, onClose, role, onEdit }: RoleViewDrawerProps) {
  if (!role) return null

  const getRoleColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case "administrator":
        return "bg-purple-100 text-purple-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "editor":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAllOperations = () => {
    if (!role) return []
    return [
      ...(role.user_operations || []),
      ...(role.role_operations || []),
      ...(role.machine_item_operations || []),
      ...(role.silo_item_operations || []),
      ...(role.supplier_operations || []),
      ...(role.process_operations || []),
      ...(role.devices_operations || []),
      ...(role.raw_product_collection || []),
      ...(role.raw_milk_intake || []),
      ...(role.raw_milk_lab_test || []),
      ...(role.before_and_after_autoclave_lab_test || []),
      ...(role.pasteurizing || []),
      ...(role.filmatic_operation || []),
      ...(role.steri_process_operation || []),
      ...(role.incubation || []),
      ...(role.incubation_lab_test || []),
      ...(role.dispatch || []),
      ...(role.production_plan || [])
    ]
  }

  const getFeatureOperations = (featureKey: string) => {
    if (!role) return []
    switch (featureKey) {
      case 'user': return role.user_operations || []
      case 'role': return role.role_operations || []
      case 'machine_item': return role.machine_item_operations || []
      case 'silo_item': return role.silo_item_operations || []
      case 'supplier': return role.supplier_operations || []
      case 'process': return role.process_operations || []
      case 'devices': return role.devices_operations || []
      case 'raw_product_collection': return role.raw_product_collection || []
      case 'raw_milk_intake': return role.raw_milk_intake || []
      case 'raw_milk_lab_test': return role.raw_milk_lab_test || []
      case 'before_and_after_autoclave_lab_test': return role.before_and_after_autoclave_lab_test || []
      case 'pasteurizing': return role.pasteurizing || []
      case 'filmatic_operation': return role.filmatic_operation || []
      case 'steri_process_operation': return role.steri_process_operation || []
      case 'incubation': return role.incubation || []
      case 'incubation_lab_test': return role.incubation_lab_test || []
      case 'dispatch': return role.dispatch || []
      case 'production_plan': return role.production_plan || []
      default: return []
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <SheetTitle className="flex items-center space-x-2">
                  <span>{role.role_name} Role</span>
                  <Badge className={getRoleColor(role.role_name)}>{role.role_name}</Badge>
                </SheetTitle>
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Role
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Role Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Role Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Role Name</label>
                  <p className="text-sm font-semibold">{role.role_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Views</label>
                  <p className="text-sm font-semibold">{(role.views || []).length} Views</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Operations</label>
                  <p className="text-sm font-semibold">
                    {getAllOperations().length} Operations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created At
                  </label>
                  <p className="text-sm">{formatDate(role.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Updated At
                  </label>
                  <p className="text-sm">{formatDate(role.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feature Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(featureLabels).map((featureKey) => {
                const operations = getFeatureOperations(featureKey)
                return (
                  <div key={featureKey} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {featureLabels[featureKey]}
                      </h4>
                      <Badge variant="outline">
                        {operations.length} {operations.length === 1 ? 'Operation' : 'Operations'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {operations.length > 0 ? (
                        operations.map((operation: string) => (
                          <Badge 
                            key={operation} 
                            className={actionColors[operation] || "bg-gray-100 text-gray-800"}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {operation.charAt(0).toUpperCase() + operation.slice(1)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 italic">No operations assigned</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* View Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">View Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              {(role.views || []).length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {(role.views || []).map((viewKey: string) => (
                    <div key={viewKey} className="flex items-center space-x-2 p-2 border rounded-lg">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {viewLabels[viewKey] || viewKey.charAt(0).toUpperCase() + viewKey.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No view permissions assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
