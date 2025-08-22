"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Shield, Settings, Eye, CheckCircle } from "lucide-react"

interface RoleViewDrawerProps {
  open: boolean
  onClose: () => void
  role: any
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
}

const viewLabels: Record<string, string> = {
  admin_panel: "Admin Panel",
  user_tab: "User Tab",
  role_tab: "Role Tab",
  machine_tab: "Machine Tab",
  silo_tab: "Silo Tab",
  supplier_tab: "Supplier Tab",
  process_tab: "Process Tab",
  devices_tab: "Devices Tab",
}

const actionColors: Record<string, string> = {
  Create: "bg-green-100 text-green-800",
  Update: "bg-blue-100 text-blue-800", 
  Delete: "bg-red-100 text-red-800",
  View: "bg-gray-100 text-gray-800",
}

export function RoleViewDrawer({ open, onClose, role, onEdit }: RoleViewDrawerProps) {
  if (!role) return null

  const getRoleColor = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "operator":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
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
                  <span>{role.name} Role</span>
                  <Badge className={getRoleColor(role.name)}>{role.name}</Badge>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Role Name</label>
                  <p className="text-sm font-semibold">{role.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Features</label>
                  <p className="text-sm font-semibold">{Object.keys(role.features || {}).length} Features</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Views</label>
                  <p className="text-sm font-semibold">{(role.views || []).length} Views</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Permissions</label>
                  <p className="text-sm font-semibold">
                    {Object.values(role.features || {}).reduce((total: number, actions: any) => total + actions.length, 0)} Permissions
                  </p>
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
              {Object.keys(role.features || {}).length > 0 ? (
                Object.entries(role.features || {}).map(([featureKey, actions]) => (
                  <div key={featureKey} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {featureLabels[featureKey] || featureKey}
                      </h4>
                      <Badge variant="outline">
                        {(actions as string[]).length} {(actions as string[]).length === 1 ? 'Permission' : 'Permissions'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(actions as string[]).map((action) => (
                        <Badge 
                          key={action} 
                          className={actionColors[action] || "bg-gray-100 text-gray-800"}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No feature permissions assigned</p>
                </div>
              )}
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
                        {viewLabels[viewKey] || viewKey}
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
