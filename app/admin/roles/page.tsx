"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Trash2, Shield, Settings, Users, Database, Truck, Wrench } from "lucide-react"
import { RoleFormDrawer } from "@/components/forms/role-form-drawer"
import { RoleViewDrawer } from "@/components/forms/role-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchRoles, deleteRole } from "@/lib/store/slices/rolesSlice"
import { toast } from "sonner"
import { UserRole, TableFilters } from "@/lib/types"
import { ColumnDef } from "@tanstack/react-table"
import { TablePulseLoading, MetricsPulseLoading } from "@/components/ui/pulse-loading"

export default function AdminRolesPage() {
  const dispatch = useAppDispatch()
  const { roles, loading: rolesLoading, error: rolesError, isInitialized: rolesInitialized } = useAppSelector((s) => s.roles)
  
  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Selected role and mode
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  
  // Filter state
  const [tableFilters, setTableFilters] = useState<TableFilters>({})

  // Load roles only once on mount
  useEffect(() => {
    if (!rolesInitialized && (!roles || roles.length === 0)) {
      dispatch(fetchRoles())
    }
  }, [dispatch, rolesInitialized, roles])

  // Handle errors with toast notifications
  useEffect(() => {
    if (rolesError) {
      toast.error(rolesError)
    }
  }, [rolesError])

  // Calculate metrics
  const totalRoles = roles?.length || 0
  const activeRoles = roles?.filter(role => role.role_operations?.length > 0)?.length || 0
  const adminRoles = roles?.filter(role => role.role_name?.toLowerCase().includes('admin'))?.length || 0

  // Filter fields configuration
  const filterFields = useMemo(() => [
    {
      key: "role_name",
      label: "Role Name",
      type: "text" as const,
      placeholder: "Filter by role name"
    },
    {
      key: "permissions",
      label: "Permissions",
      type: "select" as const,
      options: [
        { label: "User Operations", value: "user_operations" },
        { label: "Device Operations", value: "devices_operations" },
        { label: "Process Operations", value: "process_operations" },
        { label: "Supplier Operations", value: "supplier_operations" },
        { label: "Silo Operations", value: "silo_item_operations" },
        { label: "Machine Operations", value: "machine_item_operations" }
      ],
      placeholder: "Select permission type"
    }
  ], [])

  // Define columns for DataTable
  const columns: ColumnDef<UserRole>[] = [
    {
      accessorKey: "role_name",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original
        const roleLower = role.role_name?.toLowerCase() || ''
        const getRoleColor = (roleName: string) => {
          if (roleName.includes('admin')) return 'bg-purple-100 text-purple-800'
          if (roleName.includes('manager')) return 'bg-blue-100 text-blue-800'
          if (roleName.includes('technician')) return 'bg-orange-100 text-orange-800'
          if (roleName.includes('operator')) return 'bg-green-100 text-green-800'
          return 'bg-gray-100 text-gray-800'
        }
        
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <Badge className={getRoleColor(roleLower)}>
                {role.role_name || 'Unknown Role'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {role.role_operations?.length || 0} permissions
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => {
        const role = row.original
        const permissions = [
          { key: 'user_operations', label: 'Users', icon: Users, color: 'bg-blue-100 text-blue-800' },
          { key: 'devices_operations', label: 'Devices', icon: Database, color: 'bg-green-100 text-green-800' },
          { key: 'process_operations', label: 'Processes', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
          { key: 'supplier_operations', label: 'Suppliers', icon: Truck, color: 'bg-purple-100 text-purple-800' },
          { key: 'silo_item_operations', label: 'Silos', icon: Database, color: 'bg-indigo-100 text-indigo-800' },
          { key: 'machine_item_operations', label: 'Machines', icon: Wrench, color: 'bg-red-100 text-red-800' }
        ]

        return (
          <div className="flex flex-wrap gap-1">
            {permissions.map((perm) => {
              const hasPermission = role[perm.key as keyof UserRole]?.length > 0
              if (!hasPermission) return null
              
              return (
                <Badge key={perm.key} variant="outline" className={`text-xs ${perm.color}`}>
                  <perm.icon className="w-3 h-3 mr-1" />
                  {perm.label}
                </Badge>
              )
            })}
          </div>
        )
      },
    },
    {
      accessorKey: "views",
      header: "Views Access",
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {role.views?.length || 0} views
            </div>
            <div className="flex flex-wrap gap-1">
              {role.views?.slice(0, 3).map((view, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {view}
                </Badge>
              ))}
              {role.views && role.views.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{role.views.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">
              {role.updated_at ? `Updated: ${new Date(role.updated_at).toLocaleDateString()}` : 'Never updated'}
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewRole(role)}
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditRole(role)}
            >
              <Settings className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteRole(role)}
              disabled={rolesLoading}
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  // Action handlers
  const handleAddRole = () => {
    setSelectedRole(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleViewRole = (role: UserRole) => {
    setSelectedRole(role)
    setViewDrawerOpen(true)
  }

  const handleEditRole = (role: UserRole) => {
    setSelectedRole(role)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleDeleteRole = (role: UserRole) => {
    setSelectedRole(role)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedRole) return
    
    try {
      await dispatch(deleteRole(selectedRole.id)).unwrap()
      toast.success('Role deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedRole(null)
    } catch (error) {
      toast.error('Failed to delete role')
    }
  }

  return (
    <AdminDashboardLayout title="Roles Management" subtitle="Manage user roles and permissions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Roles Management</h1>
            <p className="text-muted-foreground">Manage user roles and their permissions</p>
          </div>
          <LoadingButton onClick={handleAddRole} loading={rolesLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </LoadingButton>
        </div>

        {/* Metrics Cards */}
        {rolesLoading ? (
          <MetricsPulseLoading />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRoles}</div>
                <p className="text-xs text-muted-foreground">Active roles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{activeRoles}</div>
                <p className="text-xs text-muted-foreground">With permissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Roles</CardTitle>
                <Shield className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{adminRoles}</div>
                <p className="text-xs text-muted-foreground">Administrative access</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search roles by name or permissions..."
              filterFields={filterFields}
            />
            
            {rolesLoading ? (
              <TablePulseLoading rows={6} />
            ) : (
              <DataTable
                columns={columns}
                data={roles || []}
                showSearch={false}
              />
            )}
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <RoleFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={(open) => {
            setFormDrawerOpen(open)
            if (!open) setSelectedRole(null)
          }}
          role={formMode === 'edit' && selectedRole ? selectedRole : undefined}
          mode={formMode}
          onSuccess={() => {
            setFormDrawerOpen(false)
            setSelectedRole(null)
          }}
        />
        
        {/* View Drawer */}
        <RoleViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          role={selectedRole}
          onEdit={() => {
            setFormMode('edit')
            setViewDrawerOpen(false)
            setFormDrawerOpen(true)
          }}
        />
        
        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Role"
          description={`Are you sure you want to delete the role "${selectedRole?.role_name}"? This action cannot be undone and may affect users with this role.`}
          onConfirm={confirmDelete}
          loading={rolesLoading}
        />
      </div>
    </AdminDashboardLayout>
  )
}
