/**
 * Permission Debug Component
 * 
 * This component helps debug permission issues by showing:
 * - User profile data
 * - Role information
 * - View permissions
 * - Feature permissions
 * - Route access
 */

import { usePermissions } from '@/hooks/use-permissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PermissionDebug() {
  const { 
    profile, 
    isAuthenticated, 
    isAdmin, 
    roleName,
    hasViewPermission,
    hasRouteAccess,
    hasFeaturePermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    getAccessibleRoutes
  } = usePermissions()
  
  const [isVisible, setIsVisible] = useState(false)

  if (!isAuthenticated || !profile) {
    return null
  }

  const userRole = profile.users_role_id_fkey
  const accessibleRoutes = getAccessibleRoutes()
  
  const allViews = ['dashboard', 'settings', 'user_tab', 'role_tab', 'machine_tab', 'silo_tab', 'supplier_tab', 'process_tab', 'devices_tab']
  const allFeatures = ['user', 'role', 'machine_item', 'silo_item', 'supplier', 'process', 'devices']
  const allPermissions = ['create', 'read', 'update', 'delete']

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Permission Debug Information</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isVisible ? 'Hide' : 'Show'} Debug Info
          </Button>
        </div>
      </CardHeader>
      
      {isVisible && (
        <CardContent className="space-y-6">
          {/* User Info */}
          <div>
            <h3 className="text-sm font-semibold mb-2">User Information</h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Department:</strong> {profile.department}</p>
              <p><strong>Role Name:</strong> {roleName}</p>
              <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Role Data */}
          {userRole && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Role Data</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Role ID:</strong> {userRole.id}</p>
                <p><strong>Role Name:</strong> {userRole.role_name}</p>
                <p><strong>Views:</strong> {userRole.views?.join(', ') || 'None'}</p>
                <div className="mt-2">
                  <p><strong>Operations:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>User: {userRole.user_operations?.join(', ') || 'None'}</li>
                    <li>Role: {userRole.role_operations?.join(', ') || 'None'}</li>
                    <li>Devices: {userRole.devices_operations?.join(', ') || 'None'}</li>
                    <li>Process: {userRole.process_operations?.join(', ') || 'None'}</li>
                    <li>Supplier: {userRole.supplier_operations?.join(', ') || 'None'}</li>
                    <li>Silo: {userRole.silo_item_operations?.join(', ') || 'None'}</li>
                    <li>Machine: {userRole.machine_item_operations?.join(', ') || 'None'}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* View Permissions */}
          <div>
            <h3 className="text-sm font-semibold mb-2">View Permissions</h3>
            <div className="flex flex-wrap gap-2">
              {allViews.map(view => (
                <Badge 
                  key={view} 
                  variant={hasViewPermission(view) ? "default" : "secondary"}
                  className={hasViewPermission(view) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                >
                  {view}: {hasViewPermission(view) ? '✓' : '✗'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Route Access */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Route Access</h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>Accessible Routes:</strong></p>
              <ul className="ml-4 space-y-1">
                {accessibleRoutes.map(route => (
                  <li key={route} className="text-green-600">✓ {route}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature Permissions */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Feature Permissions</h3>
            <div className="space-y-3">
              {allFeatures.map(feature => (
                <div key={feature} className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium capitalize mb-2">{feature.replace('_', ' ')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {allPermissions.map(permission => (
                      <Badge 
                        key={permission} 
                        variant={hasFeaturePermission(feature as any, permission as any) ? "default" : "secondary"}
                        className={hasFeaturePermission(feature as any, permission as any) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                      >
                        {permission}: {hasFeaturePermission(feature as any, permission as any) ? '✓' : '✗'}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CRUD Permissions Summary */}
          <div>
            <h3 className="text-sm font-semibold mb-2">CRUD Permissions Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allFeatures.map(feature => (
                <div key={feature} className="bg-gray-50 p-3 rounded text-sm">
                  <h4 className="font-medium capitalize mb-2">{feature.replace('_', ' ')}</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>Create: {canCreate(feature as any) ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Read: {canRead(feature as any) ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span>Update: {canUpdate(feature as any) ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span>Delete: {canDelete(feature as any) ? '✓' : '✗'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
