"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Shield, Settings, Eye, CheckCircle, Calendar, Clock } from "lucide-react"
import { UserRole, UserRoleResponse, convertApiResponseToUserRole } from "@/lib/types/roles"

interface RoleViewDrawerProps {
  open: boolean
  onClose: () => void
  role: UserRole | null
  onEdit?: () => void
}

// Update featureLabels to match backend keys
const featureLabels: Record<string, string> = {
  user_operations: "User Management",
  role_operations: "Role Management",
  machine_item_operations: "Machine Management",
  silo_item_operations: "Silo Management",
  supplier_operations: "Supplier Management",
  process_operations: "Process Management",
  devices_operations: "Device Management",
  raw_product_collection_operations: "Raw Product Collection",
  raw_milk_intake_operations: "Raw Milk Intake",
  raw_milk_lab_test_operations: "Raw Milk Lab Test",
  before_and_after_autoclave_lab_test_operations: "Before & After Autoclave Lab Test",
  pasteurizing_operations: "Pasteurizing",
  filmatic_operation_operations: "Filmatic Operation",
  steri_process_operation_operations: "Steri Process Operation",
  incubation_operations: "Incubation",
  incubation_lab_test_operations: "Incubation Lab Test",
  dispatch_operations: "Dispatch",
  production_plan_operations: "Production Plan",
  bmt_operations: "BMT",
}

// Update viewLabels to include all requested views
const viewLabels: Record<string, string> = {
  admin_panel: "Admin Panel",
  production_dashboard: "Production Dashboard",
  user_tab: "Users Tab",
  machine_tab: "Machine Tab",
  supplier_tab: "Supplier Tab",
  devices_tab: "Devices Tab",
  data_capture_module: "Data Capture Module",
  settings: "Settings",
  role_tab: "Role Tab",
  silo_tab: "Silo Tab",
  process_tab: "Process Tab",
  driver_ui: "Driver UI",
  lab_tests: "Lab Tests",
  bmt: "BMT",
  general_lab_test: "General Lab Test",
  cip: "CIP",
  ist: "IST",
}

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800",
  read: "bg-blue-100 text-blue-800",
  update: "bg-yellow-100 text-yellow-800", 
  delete: "bg-red-100 text-red-800",
  approve: "bg-blue-100 text-blue-800",
}

export function RoleViewDrawer({ open, onClose, role, onEdit }: RoleViewDrawerProps) {
  if (!role) return null

  // Accept backend structure directly
  const normalizedRole = role as any

  const getRoleColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case "administrator":
        return "bg-blue-100 text-blue-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "editor":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get all operations from all features (flattened)
  const getAllOperations = () => {
    return Object.keys(featureLabels).reduce((acc, key) => {
      const ops = normalizedRole[key]
      if (Array.isArray(ops)) return [...acc, ...ops]
      return acc
    }, [] as string[])
  }

  // Get operations for a feature
  const getFeatureOperations = (featureKey: string) => {
    const ops = normalizedRole[featureKey]
    return Array.isArray(ops) ? ops : []
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <SheetTitle className="flex items-center space-x-2">
                  <span>{normalizedRole.role_name} Role</span>
                  <Badge className={getRoleColor(normalizedRole.role_name)}>{normalizedRole.role_name}</Badge>
                </SheetTitle>
              </div>
            </div>
            {onEdit && (
              <Button  size="sm" onClick={onEdit}>
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
                  <p className="text-sm font-semibold">{normalizedRole.role_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Views</label>
                  <p className="text-sm font-semibold">{(normalizedRole.views || []).length} Views</p>
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
                  <p className="text-sm">{formatDate(normalizedRole.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Updated At
                  </label>
                  <p className="text-sm">{formatDate(normalizedRole.updated_at)}</p>
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
                      <Badge >
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
              {(normalizedRole.views || []).length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {(normalizedRole.views || []).map((viewKey: string) => (
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
