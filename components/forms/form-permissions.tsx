"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { 
  Shield, 
  User, 
  Users, 
  Lock, 
  Unlock, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FormData } from "./forms-dashboard"

export interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  permissions: string[]
}

export interface FormPermission {
  id: string
  formType: string
  formId?: string
  userId?: string
  role?: string
  department?: string
  permissions: {
    view: boolean
    edit: boolean
    delete: boolean
    approve: boolean
    create: boolean
  }
  conditions?: {
    status?: string[]
    timeRange?: {
      start: string
      end: string
    }
    customRules?: string[]
  }
}

interface FormPermissionsProps {
  forms: FormData[]
  currentUser: User
  permissions: FormPermission[]
  onPermissionChange?: (permission: FormPermission) => void
  className?: string
}

export function FormPermissions({ 
  forms, 
  currentUser, 
  permissions, 
  onPermissionChange,
  className 
}: FormPermissionsProps) {
  const [filteredForms, setFilteredForms] = useState<FormData[]>([])
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null)

  useEffect(() => {
    // Filter forms based on user permissions
    const accessibleForms = forms.filter(form => {
      const userPermissions = getUserPermissions(form, currentUser, permissions)
      return userPermissions.view
    })
    setFilteredForms(accessibleForms)
  }, [forms, currentUser, permissions])

  const getUserPermissions = (form: FormData, user: User, allPermissions: FormPermission[]) => {
    // Find permissions for this user and form
    const userPermission = allPermissions.find(p => 
      p.userId === user.id && 
      (p.formId === form.id || p.formType === form.type)
    )
    
    // Find role-based permissions
    const rolePermission = allPermissions.find(p => 
      p.role === user.role && 
      (p.formId === form.id || p.formType === form.type)
    )
    
    // Find department-based permissions
    const departmentPermission = allPermissions.find(p => 
      p.department === user.department && 
      (p.formId === form.id || p.formType === form.type)
    )

    // Combine permissions (user-specific overrides role, role overrides department)
    const finalPermission = userPermission || rolePermission || departmentPermission

    return finalPermission?.permissions || {
      view: false,
      edit: false,
      delete: false,
      approve: false,
      create: false
    }
  }

  const canUserAccess = (form: FormData, action: keyof FormPermission['permissions']) => {
    const userPermissions = getUserPermissions(form, currentUser, permissions)
    return userPermissions[action]
  }

  const getPermissionIcon = (permission: boolean) => {
    return permission ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )
  }

  const getPermissionBadge = (permission: boolean) => {
    return permission ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Allowed</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">Denied</Badge>
    )
  }

  const getAccessLevel = (form: FormData) => {
    const permissions = getUserPermissions(form, currentUser, permissions)
    const accessCount = Object.values(permissions).filter(Boolean).length
    
    if (accessCount === 0) return { level: "No Access", color: "text-red-600", icon: Lock }
    if (accessCount === 1) return { level: "View Only", color: "text-yellow-600", icon: Eye }
    if (accessCount <= 3) return { level: "Limited", color: "text-blue-600", icon: Edit }
    return { level: "Full Access", color: "text-green-600", icon: Unlock }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Current User Permissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{currentUser.name}</h3>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge >{currentUser.role}</Badge>
                  <Badge >{currentUser.department}</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Accessible Forms</p>
              <p className="text-2xl font-bold text-primary">{filteredForms.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms Access Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Forms Access Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forms.map((form) => {
              const accessLevel = getAccessLevel(form)
              const AccessIcon = accessLevel.icon
              const canView = canUserAccess(form, 'view')
              const canEdit = canUserAccess(form, 'edit')
              const canDelete = canUserAccess(form, 'delete')
              const canApprove = canUserAccess(form, 'approve')

              return (
                <div 
                  key={form.id} 
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all",
                    selectedForm?.id === form.id && "ring-2 ring-primary",
                    !canView && "opacity-50"
                  )}
                  onClick={() => canView && setSelectedForm(form)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <AccessIcon className={cn("h-5 w-5", accessLevel.color)} />
                      <div>
                        <h4 className="font-medium">{form.title}</h4>
                        <p className="text-sm text-muted-foreground">{form.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("text-xs", accessLevel.color)}>
                        {accessLevel.level}
                      </Badge>
                      {!canView && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  {canView && (
                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        {getPermissionIcon(canView)}
                        <span>View</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getPermissionIcon(canEdit)}
                        <span>Edit</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getPermissionIcon(canDelete)}
                        <span>Delete</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getPermissionIcon(canApprove)}
                        <span>Approve</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Form Details */}
      {selectedForm && (
        <Card>
          <CardHeader>
            <CardTitle>Form Permissions Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">{selectedForm.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedForm.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(getUserPermissions(selectedForm, currentUser, permissions)).map(([action, allowed]) => (
                  <div key={action} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      {action === 'view' && <Eye className="h-4 w-4" />}
                      {action === 'edit' && <Edit className="h-4 w-4" />}
                      {action === 'delete' && <Trash2 className="h-4 w-4" />}
                      {action === 'approve' && <CheckCircle className="h-4 w-4" />}
                      {action === 'create' && <Edit className="h-4 w-4" />}
                      <span className="font-medium capitalize">{action}</span>
                    </div>
                    {getPermissionBadge(allowed)}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Permission Source</h4>
                <p className="text-sm text-muted-foreground">
                  Permissions are determined by your role ({currentUser.role}) and department ({currentUser.department}).
                  Contact your administrator to modify permissions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permission Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {forms.filter(f => canUserAccess(f, 'view')).length}
              </div>
              <p className="text-xs text-muted-foreground">Can View</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {forms.filter(f => canUserAccess(f, 'edit')).length}
              </div>
              <p className="text-xs text-muted-foreground">Can Edit</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {forms.filter(f => canUserAccess(f, 'approve')).length}
              </div>
              <p className="text-xs text-muted-foreground">Can Approve</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {forms.filter(f => !canUserAccess(f, 'view')).length}
              </div>
              <p className="text-xs text-muted-foreground">No Access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
