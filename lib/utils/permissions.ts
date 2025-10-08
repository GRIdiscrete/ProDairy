/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * This module provides utilities for checking user permissions based on their role.
 * It handles both view permissions (page access) and feature permissions (CRUD operations).
 */

import type { ExtendedUserProfile, UserRole } from '@/lib/types/auth'

// Permission types
export type Permission = 'create' | 'read' | 'update' | 'delete'
export type Feature = 'user' | 'role' | 'machine_item' | 'silo_item' | 'supplier' | 'process' | 'devices' | 'material' | 'tanker' | 'filmatic_group' | 'production_plan' | 'audit_trail' | 'profile'
export type View = 'dashboard' | 'settings' | 'user_tab' | 'role_tab' | 'machine_tab' | 'silo_tab' | 'supplier_tab' | 'process_tab' | 'devices_tab' | 'material_tab' | 'tanker_tab' | 'filmatic_group_tab' | 'production_plan_tab' | 'audit_trail_tab' | 'profile_tab' | 'data_capture_module' | 'drivers_module' | 'tools_module'

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
  '/admin/materials': 'material_tab',
  '/admin/tankers': 'tanker_tab',
  '/admin/filmatic-lines-groups': 'filmatic_group_tab',
  '/admin/production-plan': 'production_plan_tab',
  '/admin/audit': 'audit_trail_tab',
  '/admin/settings': 'settings',
  '/profile': 'profile_tab',
  // Module-level routes
  '/data-capture': 'data_capture_module',
  '/drivers': 'drivers_module',
  '/tools': 'tools_module',
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
  'material_tab': 'material',
  'tanker_tab': 'tanker',
  'filmatic_group_tab': 'filmatic_group',
  'production_plan_tab': 'production_plan',
  'audit_trail_tab': 'audit_trail',
  'profile_tab': 'profile',
  // Module-level views don't map to specific features
  'data_capture_module': null,
  'drivers_module': null,
  'tools_module': null,
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
  'material': ['material_operations'],
  'tanker': ['tanker_operations'],
  'filmatic_group': ['filmatic_group_operations'],
  'production_plan': ['production_plan_operations'],
  'audit_trail': ['audit_trail_operations'],
  'profile': ['profile_operations'],
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
  // TEMPORARY: Bypass all permission checks - allow access to all views
  return true
  
  const userRole = getUserRole(profile)
  if (!userRole?.views) return false
  
  return userRole.views.includes(view)
}

/**
 * Check if user has access to a specific route
 */
export function hasRouteAccess(profile: ExtendedUserProfile | null, route: string): boolean {
  // TEMPORARY: Bypass all permission checks - allow access to all routes
  return true
  
  // Always allow access to profile page for authenticated users
  if (route === '/profile' && profile) {
    return true
  }
  
  // Check if user has dashboard view role - if so, allow access to all routes
  if (hasDashboardViewRole(profile)) {
    return true
  }
  
  const view = ROUTE_TO_VIEW_MAP[route]
  if (!view) return false // Deny access to unmapped routes for security
  
  return hasViewPermission(profile, view)
}

/**
 * Check if user has dashboard view role
 */
export function hasDashboardViewRole(profile: ExtendedUserProfile | null): boolean {
  const userRole = getUserRole(profile)
  if (!userRole?.name) return false
  
  const roleName = userRole.name.toLowerCase()
  return roleName.includes('dashboard view') || 
         roleName.includes('dashboard_view') ||
         roleName.includes('view')
}

/**
 * Check if user has a specific feature permission
 */
export function hasFeaturePermission(
  profile: ExtendedUserProfile | null, 
  feature: Feature, 
  permission: Permission
): boolean {
  // TEMPORARY: Bypass all permission checks - allow all feature permissions
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
  const permissions: Permission[] = ['create', 'read', 'update', 'delete']
  return permissions.some(permission => hasFeaturePermission(profile, feature, permission))
}

/**
 * Get all permissions for a specific feature
 */
export function getFeaturePermissions(profile: ExtendedUserProfile | null, feature: Feature): Permission[] {
  const permissions: Permission[] = ['create', 'read', 'update', 'delete']
  return permissions.filter(permission => hasFeaturePermission(profile, feature, permission))
}

/**
 * Check if user can perform CRUD operations on a feature
 */
export function canCreate(profile: ExtendedUserProfile | null, feature: Feature): boolean {
  return hasFeaturePermission(profile, feature, 'create')
}

export function canRead(profile: ExtendedUserProfile | null, feature: Feature): boolean {
  return hasFeaturePermission(profile, feature, 'read')
}

export function canUpdate(profile: ExtendedUserProfile | null, feature: Feature): boolean {
  return hasFeaturePermission(profile, feature, 'update')
}

export function canDelete(profile: ExtendedUserProfile | null, feature: Feature): boolean {
  return hasFeaturePermission(profile, feature, 'delete')
}

/**
 * Get accessible routes for a user
 */
export function getAccessibleRoutes(profile: ExtendedUserProfile | null): string[] {
  const userRole = getUserRole(profile)
  const accessibleRoutes: string[] = []
  
  // Always include profile page for authenticated users
  if (profile) {
    accessibleRoutes.push('/profile')
  }
  
  // Check if user has dashboard view role - if so, allow access to all routes
  if (hasDashboardViewRole(profile)) {
    const allRoutes = Object.keys(ROUTE_TO_VIEW_MAP)
    accessibleRoutes.push(...allRoutes)
    return accessibleRoutes
  }
  
  // Add other routes based on user permissions
  if (userRole?.views) {
    const roleBasedRoutes = Object.entries(ROUTE_TO_VIEW_MAP)
      .filter(([_, view]) => userRole.views.includes(view))
      .map(([route, _]) => route)
    accessibleRoutes.push(...roleBasedRoutes)
  }
  
  return accessibleRoutes
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationByPermissions<T extends { href: string }>(
  navigationItems: T[],
  profile: ExtendedUserProfile | null
): T[] {
  // Check if user has dashboard view role - if so, show all navigation items
  if (hasDashboardViewRole(profile)) {
    return navigationItems
  }
  
  // Otherwise, filter navigation items based on user permissions
  return navigationItems.filter(item => {
    // Always show profile page for authenticated users
    if (item.href === '/profile' && profile) {
      return true
    }
    return hasRouteAccess(profile, item.href)
  })
}

/**
 * Check if user is admin (has all permissions)
 */
export function isAdmin(profile: ExtendedUserProfile | null): boolean {
  const userRole = getUserRole(profile)
  if (!userRole) return false
  
  // Check if role name indicates admin
  const roleName = userRole.role_name?.toLowerCase() || ''
  if (roleName.includes('admin') || roleName.includes('administrator')) {
    // Admin has all view permissions (profile_tab is always accessible, so not required)
    const allViews: View[] = ['dashboard', 'settings', 'user_tab', 'role_tab', 'machine_tab', 'silo_tab', 'supplier_tab', 'process_tab', 'devices_tab', 'material_tab', 'tanker_tab', 'filmatic_group_tab', 'production_plan_tab', 'audit_trail_tab', 'data_capture_module', 'drivers_module', 'tools_module']
    const hasAllViews = allViews.every(view => userRole.views?.includes(view))
    
    if (!hasAllViews) return false
    
    // Admin has all CRUD permissions for all features
    const features: Feature[] = ['user', 'role', 'machine_item', 'silo_item', 'supplier', 'process', 'devices', 'material', 'tanker', 'filmatic_group', 'production_plan', 'audit_trail', 'profile']
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
  const userRole = getUserRole(profile)
  return userRole?.role_name === roleName
}

/**
 * Check if user has access to a specific module
 */
export function hasModuleAccess(profile: ExtendedUserProfile | null, module: 'admin' | 'data-capture' | 'drivers' | 'tools'): boolean {
  // TEMPORARY: Bypass all permission checks - allow access to all modules
  return true
  
  const moduleViewMap: Record<string, View> = {
    'admin': 'dashboard',
    'data-capture': 'data_capture_module',
    'drivers': 'drivers_module',
    'tools': 'tools_module',
  }
  
  const view = moduleViewMap[module]
  if (!view) return false
  
  return hasViewPermission(profile, view)
}

/**
 * Get accessible modules for current user
 */
export function getAccessibleModules(profile: ExtendedUserProfile | null): string[] {
  const modules = ['admin', 'data-capture', 'drivers', 'tools']
  return modules.filter(module => hasModuleAccess(profile, module as any))
}
