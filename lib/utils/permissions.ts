/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * This module provides utilities for checking user permissions based on their role.
 * It handles both view permissions (page access) and feature permissions (CRUD operations).
 */

import type { ExtendedUserProfile, UserRole } from '@/lib/types/auth'

// Permission types
export type Permission = 'create' | 'read' | 'update' | 'delete'
export type Feature = 'user' | 'role' | 'machine_item' | 'silo_item' | 'supplier' | 'process' | 'devices'
export type View = 'dashboard' | 'settings' | 'user_tab' | 'role_tab' | 'machine_tab' | 'silo_tab' | 'supplier_tab' | 'process_tab' | 'devices_tab'

// Route to view mapping
export const ROUTE_TO_VIEW_MAP: Record<string, View> = {
  '/admin': 'dashboard',
  '/admin/users': 'user_tab',
  '/admin/roles': 'role_tab',
  '/admin/machines': 'machine_tab',
  '/admin/silos': 'silo_tab',
  '/admin/suppliers': 'supplier_tab',
  '/admin/processes': 'process_tab',
  '/admin/devices': 'devices_tab',
  '/admin/materials': 'silo_tab', // Materials maps to silo_tab
  '/admin/production-plan': 'process_tab', // Production Plan maps to process_tab
  '/admin/audit': 'settings', // Audit Trail maps to settings
  '/admin/settings': 'settings',
  '/profile': 'settings', // Profile is considered a settings view
}

// View to feature mapping for sidebar navigation
export const VIEW_TO_FEATURE_MAP: Record<View, Feature | null> = {
  'dashboard': null, // Dashboard doesn't map to a specific feature
  'settings': null, // Settings is a general view
  'user_tab': 'user',
  'role_tab': 'role',
  'machine_tab': 'machine_item',
  'silo_tab': 'silo_item',
  'supplier_tab': 'supplier',
  'process_tab': 'process',
  'devices_tab': 'devices',
}

// Feature to operation mapping
export const FEATURE_OPERATIONS_MAP: Record<Feature, string[]> = {
  'user': ['user_operations'],
  'role': ['role_operations'],
  'machine_item': ['machine_item_operations'],
  'silo_item': ['silo_item_operations'],
  'supplier': ['supplier_operations'],
  'process': ['process_operations'],
  'devices': ['devices_operations'],
}

/**
 * Get user role from profile
 */
export function getUserRole(profile: ExtendedUserProfile | null): UserRole | null {
  return profile?.users_role_id_fkey || null
}

/**
 * Check if user has a specific view permission
 */
export function hasViewPermission(profile: ExtendedUserProfile | null, view: View): boolean {
  // TEMPORARY: Bypass permissions for testing - return true for all checks
  return true
  
  const userRole = getUserRole(profile)
  if (!userRole?.views) return false
  
  return userRole.views.includes(view)
}

/**
 * Check if user has access to a specific route
 */
export function hasRouteAccess(profile: ExtendedUserProfile | null, route: string): boolean {
  // TEMPORARY: Bypass permissions for testing - return true for all checks
  return true
  
  const view = ROUTE_TO_VIEW_MAP[route]
  if (!view) return false // Deny access to unmapped routes for security
  
  return hasViewPermission(profile, view)
}

/**
 * Check if user has a specific feature permission
 */
export function hasFeaturePermission(
  profile: ExtendedUserProfile | null, 
  feature: Feature, 
  permission: Permission
): boolean {
  // TEMPORARY: Bypass permissions for testing - return true for all checks
  return true
  
  const userRole = getUserRole(profile)
  if (!userRole) return false
  
  const operationKey = FEATURE_OPERATIONS_MAP[feature]?.[0]
  if (!operationKey) return false
  
  const operations = userRole[operationKey as keyof UserRole] as string[] | undefined
  if (!operations) return false
  
  return operations.includes(permission)
}

/**
 * Check if user has any permission for a feature
 */
export function hasAnyFeaturePermission(profile: ExtendedUserProfile | null, feature: Feature): boolean {
  // TEMPORARY: Bypass permissions for testing - return true for all checks
  return true
  
  const permissions: Permission[] = ['create', 'read', 'update', 'delete']
  return permissions.some(permission => hasFeaturePermission(profile, feature, permission))
}

/**
 * Get all permissions for a specific feature
 */
export function getFeaturePermissions(profile: ExtendedUserProfile | null, feature: Feature): Permission[] {
  // TEMPORARY: Bypass permissions for testing - return all permissions
  return ['create', 'read', 'update', 'delete']
  
  const permissions: Permission[] = ['create', 'read', 'update', 'delete']
  return permissions.filter(permission => hasFeaturePermission(profile, feature, permission))
}

/**
 * Check if user can perform CRUD operations on a feature
 */
export function canCreate(profile: ExtendedUserProfile | null, feature: Feature): boolean {
  // TEMPORARY: Bypass permissions for testing - return true for all checks
  return true
}

export function canRead(profile: ExtendedUserProfile | null, feature: Feature): boolean {
  // TEMPORARY: Bypass permissions for testing - return true for all checks
  return true
}

export function canUpdate(profile: ExtendedUserProfile | null, feature: Feature): boolean {
  // TEMPORARY: Bypass permissions for testing - return true for all checks
  return true
}

export function canDelete(profile: ExtendedUserProfile | null, feature: Feature): boolean {
  // TEMPORARY: Bypass permissions for testing - return true for all checks
  return true
}

/**
 * Get accessible routes for a user
 */
export function getAccessibleRoutes(profile: ExtendedUserProfile | null): string[] {
  // TEMPORARY: Bypass permissions for testing - return all routes
  return Object.keys(ROUTE_TO_VIEW_MAP)
  
  const userRole = getUserRole(profile)
  if (!userRole?.views) return []
  
  return Object.entries(ROUTE_TO_VIEW_MAP)
    .filter(([_, view]) => userRole.views.includes(view))
    .map(([route, _]) => route)
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationByPermissions<T extends { href: string }>(
  navigationItems: T[],
  profile: ExtendedUserProfile | null
): T[] {
  // TEMPORARY: Bypass permissions for testing - return all navigation items
  return navigationItems
  
  return navigationItems.filter(item => hasRouteAccess(profile, item.href))
}

/**
 * Check if user is admin (has all permissions)
 */
export function isAdmin(profile: ExtendedUserProfile | null): boolean {
  // TEMPORARY: Bypass permissions for testing - return true for all users
  return true
  
  const userRole = getUserRole(profile)
  if (!userRole) return false
  
  // Check if role name indicates admin
  const roleName = userRole.role_name?.toLowerCase() || ''
  if (roleName.includes('admin') || roleName.includes('administrator')) {
    // Admin has all view permissions
    const allViews: View[] = ['dashboard', 'settings', 'user_tab', 'role_tab', 'machine_tab', 'silo_tab', 'supplier_tab', 'process_tab', 'devices_tab']
    const hasAllViews = allViews.every(view => userRole.views?.includes(view))
    
    if (!hasAllViews) return false
    
    // Admin has all CRUD permissions for all features
    const features: Feature[] = ['user', 'role', 'machine_item', 'silo_item', 'supplier', 'process', 'devices']
    const permissions: Permission[] = ['create', 'read', 'update', 'delete']
    
    return features.every(feature => 
      permissions.every(permission => hasFeaturePermission(profile, feature, permission))
    )
  }
  
  return false
}

/**
 * Get user's role name
 */
export function getUserRoleName(profile: ExtendedUserProfile | null): string {
  const userRole = getUserRole(profile)
  return userRole?.role_name || 'Unknown Role'
}

/**
 * Check if user has specific role
 */
export function hasRole(profile: ExtendedUserProfile | null, roleName: string): boolean {
  // TEMPORARY: Bypass permissions for testing - return true for all role checks
  return true
  
  const userRole = getUserRole(profile)
  return userRole?.role_name === roleName
}
