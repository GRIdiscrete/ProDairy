/**
 * Permission Hooks
 * 
 * React hooks for checking user permissions throughout the application.
 * These hooks provide a clean interface for components to check permissions.
 */

import { useMemo } from 'react'
import { useAppSelector } from '@/lib/store'
import {
  type Permission,
  type Feature,
  type View,
  hasViewPermission,
  hasRouteAccess,
  hasFeaturePermission,
  hasAnyFeaturePermission,
  getFeaturePermissions,
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  getAccessibleRoutes,
  isAdmin,
  getUserRoleName,
  hasRole,
  filterNavigationByPermissions,
} from '@/lib/utils/permissions'

/**
 * Hook to get current user's profile
 */
export function useCurrentUser() {
  const { profile, isAuthenticated } = useAppSelector((state) => state.auth)
  return { profile, isAuthenticated }
}

/**
 * Hook to check if user has a specific view permission
 */
export function useViewPermission(view: View) {
  const { profile } = useCurrentUser()
  return useMemo(() => hasViewPermission(profile, view), [profile, view])
}

/**
 * Hook to check if user has access to a specific route
 */
export function useRouteAccess(route: string) {
  const { profile } = useCurrentUser()
  return useMemo(() => hasRouteAccess(profile, route), [profile, route])
}

/**
 * Hook to check if user has a specific feature permission
 */
export function useFeaturePermission(feature: Feature, permission: Permission) {
  const { profile } = useCurrentUser()
  return useMemo(() => hasFeaturePermission(profile, feature, permission), [profile, feature, permission])
}

/**
 * Hook to check if user has any permission for a feature
 */
export function useAnyFeaturePermission(feature: Feature) {
  const { profile } = useCurrentUser()
  return useMemo(() => hasAnyFeaturePermission(profile, feature), [profile, feature])
}

/**
 * Hook to get all permissions for a specific feature
 */
export function useFeaturePermissions(feature: Feature) {
  const { profile } = useCurrentUser()
  return useMemo(() => getFeaturePermissions(profile, feature), [profile, feature])
}

/**
 * Hook to check CRUD permissions for a feature
 */
export function useCRUDPermissions(feature: Feature) {
  const { profile } = useCurrentUser()
  
  return useMemo(() => ({
    canCreate: canCreate(profile, feature),
    canRead: canRead(profile, feature),
    canUpdate: canUpdate(profile, feature),
    canDelete: canDelete(profile, feature),
  }), [profile, feature])
}

/**
 * Hook to get accessible routes for current user
 */
export function useAccessibleRoutes() {
  const { profile } = useCurrentUser()
  return useMemo(() => getAccessibleRoutes(profile), [profile])
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin() {
  const { profile } = useCurrentUser()
  return useMemo(() => isAdmin(profile), [profile])
}

/**
 * Hook to get current user's role name
 */
export function useUserRoleName() {
  const { profile } = useCurrentUser()
  return useMemo(() => getUserRoleName(profile), [profile])
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(roleName: string) {
  const { profile } = useCurrentUser()
  return useMemo(() => hasRole(profile, roleName), [profile, roleName])
}

/**
 * Hook to filter navigation items by permissions
 */
export function useFilteredNavigation<T extends { href: string }>(navigationItems: T[]) {
  const { profile } = useCurrentUser()
  return useMemo(() => filterNavigationByPermissions(navigationItems, profile), [navigationItems, profile])
}

/**
 * Comprehensive permission hook that provides all permission-related data
 */
export function usePermissions() {
  const { profile, isAuthenticated } = useCurrentUser()
  
  return useMemo(() => ({
    // User info
    profile,
    isAuthenticated,
    isAdmin: isAdmin(profile),
    roleName: getUserRoleName(profile),
    
    // Permission checkers
    hasViewPermission: (view: View) => hasViewPermission(profile, view),
    hasRouteAccess: (route: string) => hasRouteAccess(profile, route),
    hasFeaturePermission: (feature: Feature, permission: Permission) => hasFeaturePermission(profile, feature, permission),
    hasAnyFeaturePermission: (feature: Feature) => hasAnyFeaturePermission(profile, feature),
    hasRole: (roleName: string) => hasRole(profile, roleName),
    
    // CRUD checkers
    canCreate: (feature: Feature) => canCreate(profile, feature),
    canRead: (feature: Feature) => canRead(profile, feature),
    canUpdate: (feature: Feature) => canUpdate(profile, feature),
    canDelete: (feature: Feature) => canDelete(profile, feature),
    
    // Data getters
    getFeaturePermissions: (feature: Feature) => getFeaturePermissions(profile, feature),
    getAccessibleRoutes: () => getAccessibleRoutes(profile),
    filterNavigation: <T extends { href: string }>(items: T[]) => filterNavigationByPermissions(items, profile),
  }), [profile, isAuthenticated])
}
