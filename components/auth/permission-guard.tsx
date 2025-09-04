/**
 * Permission Guard Components
 * 
 * Components for protecting routes and UI elements based on user permissions.
 */

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft, Home } from 'lucide-react'

interface PermissionGuardProps {
  children: ReactNode
  requiredView?: string
  requiredRoute?: string
  requiredFeature?: string
  requiredPermission?: 'create' | 'read' | 'update' | 'delete'
  fallback?: ReactNode
  redirectTo?: string
}

/**
 * Route-level permission guard
 */
export function PermissionGuard({
  children,
  requiredView,
  requiredRoute,
  requiredFeature,
  requiredPermission,
  fallback,
  redirectTo = '/admin'
}: PermissionGuardProps) {
  const { 
    isAuthenticated, 
    hasRouteAccess, 
    hasViewPermission, 
    hasFeaturePermission 
  } = usePermissions()
  const router = useRouter()

  // Check authentication first
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  // Check route access
  if (requiredRoute && !hasRouteAccess(requiredRoute)) {
    if (redirectTo) {
      router.push(redirectTo)
      return null
    }
    return fallback || <AccessDenied />
  }

  // Check view permission
  if (requiredView && !hasViewPermission(requiredView as any)) {
    if (redirectTo) {
      router.push(redirectTo)
      return null
    }
    return fallback || <AccessDenied />
  }

  // Check feature permission
  if (requiredFeature && requiredPermission && !hasFeaturePermission(requiredFeature as any, requiredPermission)) {
    if (redirectTo) {
      router.push(redirectTo)
      return null
    }
    return fallback || <AccessDenied />
  }

  return <>{children}</>
}

/**
 * Component-level permission guard (doesn't redirect, just hides content)
 */
export function ConditionalRender({
  children,
  requiredView,
  requiredRoute,
  requiredFeature,
  requiredPermission,
  fallback = null
}: PermissionGuardProps) {
  const { 
    hasRouteAccess, 
    hasViewPermission, 
    hasFeaturePermission 
  } = usePermissions()

  // Check route access
  if (requiredRoute && !hasRouteAccess(requiredRoute)) {
    return <>{fallback}</>
  }

  // Check view permission
  if (requiredView && !hasViewPermission(requiredView as any)) {
    return <>{fallback}</>
  }

  // Check feature permission
  if (requiredFeature && requiredPermission && !hasFeaturePermission(requiredFeature as any, requiredPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Access denied component
 */
function AccessDenied() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Access Denied
          </CardTitle>
          <CardDescription className="text-gray-600">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button 
              onClick={() => router.push('/admin')}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Higher-order component for route protection
 */
export function withPermissionGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<PermissionGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <PermissionGuard {...guardProps}>
        <Component {...props} />
      </PermissionGuard>
    )
  }
}
