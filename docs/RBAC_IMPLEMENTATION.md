# Role-Based Access Control (RBAC) Implementation

This document describes the comprehensive RBAC system implemented in the ProDairy Admin application.

## Overview

The RBAC system provides two levels of permissions:
1. **View Permissions**: Control access to pages/routes
2. **Feature Permissions**: Control CRUD operations on specific features

## Permission Structure

### View Permissions
These control which pages a user can access:

- `dashboard` - Main dashboard
- `settings` - Settings page
- `user_tab` - Users management page
- `role_tab` - Roles management page
- `machine_tab` - Machines management page
- `silo_tab` - Silos management page
- `supplier_tab` - Suppliers management page
- `process_tab` - Processes management page
- `devices_tab` - Devices management page

### Feature Permissions
These control CRUD operations on features:

- `user` - User Management
- `role` - Role Management
- `machine_item` - Machine Management
- `silo_item` - Silo Management
- `supplier` - Supplier Management
- `process` - Process Management
- `devices` - Device Management

Each feature supports these operations:
- `create` - Create new records
- `read` - View records
- `update` - Edit existing records
- `delete` - Delete records

## Implementation Components

### 1. Permission Utilities (`lib/utils/permissions.ts`)

Core utility functions for checking permissions:

```typescript
import { hasViewPermission, hasFeaturePermission, canCreate, canRead, canUpdate, canDelete } from '@/lib/utils/permissions'

// Check view permission
const canAccessUsers = hasViewPermission(profile, 'user_tab')

// Check feature permission
const canCreateUsers = hasFeaturePermission(profile, 'user', 'create')

// CRUD shortcuts
const canCreate = canCreate(profile, 'user')
const canRead = canRead(profile, 'user')
const canUpdate = canUpdate(profile, 'user')
const canDelete = canDelete(profile, 'user')
```

### 2. Permission Hooks (`hooks/use-permissions.ts`)

React hooks for easy permission checking in components:

```typescript
import { usePermissions, useCRUDPermissions, useViewPermission } from '@/hooks/use-permissions'

function MyComponent() {
  // Comprehensive permissions hook
  const { canCreate, canRead, canUpdate, canDelete, hasViewPermission } = usePermissions()
  
  // Specific CRUD permissions for a feature
  const { canCreate: canCreateUsers, canUpdate: canUpdateUsers } = useCRUDPermissions('user')
  
  // View permission check
  const canAccessUsers = useViewPermission('user_tab')
  
  return (
    <div>
      {canCreateUsers && <button>Add User</button>}
      {canUpdateUsers && <button>Edit User</button>}
    </div>
  )
}
```

### 3. Permission Guards (`components/auth/permission-guard.tsx`)

Components for protecting routes and UI elements:

```typescript
import { PermissionGuard, ConditionalRender } from '@/components/auth/permission-guard'

// Route-level protection
function UsersPage() {
  return (
    <PermissionGuard requiredView="user_tab">
      <div>Users page content</div>
    </PermissionGuard>
  )
}

// Component-level conditional rendering
function UserActions() {
  return (
    <div>
      <ConditionalRender requiredFeature="user" requiredPermission="create">
        <button>Add User</button>
      </ConditionalRender>
      
      <ConditionalRender requiredFeature="user" requiredPermission="update">
        <button>Edit User</button>
      </ConditionalRender>
    </div>
  )
}
```

### 4. Permission-Aware Table Actions (`components/ui/permission-table-actions.tsx`)

Components for rendering table actions based on permissions:

```typescript
import { PermissionTableActions, PermissionButton } from '@/components/ui/permission-table-actions'

// Table actions with automatic permission checking
function UserTable() {
  return (
    <DataTable
      columns={[
        // ... other columns
        {
          id: 'actions',
          cell: ({ row }) => (
            <PermissionTableActions
              feature="user"
              onView={() => handleView(row.original)}
              onEdit={() => handleEdit(row.original)}
              onDelete={() => handleDelete(row.original)}
            />
          )
        }
      ]}
    />
  )
}

// Permission-aware buttons
function UserActions() {
  return (
    <div>
      <PermissionButton
        feature="user"
        permission="create"
        onClick={handleAddUser}
      >
        Add User
      </PermissionButton>
    </div>
  )
}
```

## Usage Examples

### 1. Protecting a Page

```typescript
// app/admin/users/page.tsx
import { PermissionGuard } from '@/components/auth/permission-guard'

export default function UsersPage() {
  return (
    <PermissionGuard requiredView="user_tab">
      <AdminDashboardLayout>
        {/* Page content */}
      </AdminDashboardLayout>
    </PermissionGuard>
  )
}
```

### 2. Conditional UI Elements

```typescript
import { ConditionalRender } from '@/components/auth/permission-guard'

function UserCard({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      
      <ConditionalRender requiredFeature="user" requiredPermission="update">
        <button onClick={() => editUser(user)}>Edit</button>
      </ConditionalRender>
      
      <ConditionalRender requiredFeature="user" requiredPermission="delete">
        <button onClick={() => deleteUser(user)}>Delete</button>
      </ConditionalRender>
    </div>
  )
}
```

### 3. Table with Permission-Based Actions

```typescript
import { PermissionTableActions } from '@/components/ui/permission-table-actions'

const columns = [
  // ... other columns
  {
    id: 'actions',
    cell: ({ row }) => (
      <PermissionTableActions
        feature="user"
        onView={() => viewUser(row.original)}
        onEdit={() => editUser(row.original)}
        onDelete={() => deleteUser(row.original)}
        onCopy={() => copyUser(row.original)}
        onDownload={() => downloadUser(row.original)}
      />
    )
  }
]
```

### 4. Sidebar Navigation Filtering

The sidebar automatically filters navigation items based on user permissions:

```typescript
// components/layout/admin-sidebar.tsx
import { useFilteredNavigation } from '@/hooks/use-permissions'

export function AdminSidebar() {
  const filteredNavigation = useFilteredNavigation(adminNavigation)
  
  return (
    <nav>
      {filteredNavigation.map(item => (
        <Link href={item.href}>{item.name}</Link>
      ))}
    </nav>
  )
}
```

## Route Mapping

The system automatically maps routes to view permissions:

```typescript
const ROUTE_TO_VIEW_MAP = {
  '/admin': 'dashboard',
  '/admin/users': 'user_tab',
  '/admin/roles': 'role_tab',
  '/admin/machines': 'machine_tab',
  '/admin/silos': 'silo_tab',
  '/admin/suppliers': 'supplier_tab',
  '/admin/processes': 'process_tab',
  '/admin/devices': 'devices_tab',
  '/admin/settings': 'settings',
  '/profile': 'settings',
}
```

## Role Configuration

Roles are configured in the role form with:

1. **View Permissions**: Checkboxes for each view the role can access
2. **Feature Permissions**: Matrix showing CRUD permissions for each feature

Example role configuration:
- **Administrator**: All views, all CRUD permissions
- **Manager**: Dashboard, Users, Roles views; Read/Update permissions for Users, Read-only for Roles
- **Operator**: Dashboard view only; Read permissions for assigned features

## Best Practices

1. **Always use permission checks**: Don't rely on UI hiding alone for security
2. **Use appropriate components**: Use `PermissionGuard` for routes, `ConditionalRender` for UI elements
3. **Consistent naming**: Use the same feature names across the application
4. **Test permissions**: Ensure all permission combinations work correctly
5. **Document role requirements**: Clearly document what each role should have access to

## Security Considerations

1. **Server-side validation**: Always validate permissions on the server side
2. **Token validation**: Ensure tokens are valid and not expired
3. **Permission inheritance**: Be careful with permission inheritance and delegation
4. **Audit logging**: Log permission checks and access attempts
5. **Regular reviews**: Regularly review and audit user permissions

## Troubleshooting

### Common Issues

1. **Permission not working**: Check if the user has the correct role and permissions
2. **Route not accessible**: Verify the route is mapped in `ROUTE_TO_VIEW_MAP`
3. **Feature not found**: Ensure the feature name matches the defined features
4. **UI not hiding**: Check if you're using the correct permission components

### Debug Tools

```typescript
import { usePermissions } from '@/hooks/use-permissions'

function DebugPermissions() {
  const { profile, isAdmin, roleName } = usePermissions()
  
  console.log('User profile:', profile)
  console.log('Is admin:', isAdmin)
  console.log('Role name:', roleName)
  
  return <div>Check console for permission debug info</div>
}
```

This RBAC system provides a robust, scalable, and maintainable way to control access throughout the application while keeping the code clean and easy to understand.
