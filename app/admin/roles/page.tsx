"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
// Remove Card wrappers; use bordered sections like data-capture pages
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Trash2, Shield, Settings, Users, Database, Truck, Wrench, Edit } from "lucide-react"
import { RoleFormDrawer } from "@/components/forms/role-form-drawer"
import { RoleViewDrawer } from "@/components/forms/role-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchRoles, deleteRole } from "@/lib/store/slices/rolesSlice"
import { toast } from "sonner"
import { UserRole, TableFilters } from "@/lib/types"
import { ColumnDef } from "@tanstack/react-table"
import { TablePulseLoading, MetricsPulseLoading } from "@/components/ui/pulse-loading"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionButton } from "@/components/ui/permission-table-actions"

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
      dispatch(fetchRoles({}))
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

  // Update permissions and view labels for table columns
  const permissionLabels: Record<string, string> = {
    user_operations: "Users",
    devices_operations: "Devices",
    process_operations: "Processes",
    supplier_operations: "Suppliers",
    silo_item_operations: "Silos",
    machine_item_operations: "Machines",
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
  };

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
  };

  // Client-side filtering
  const filteredRoles = useMemo(() => {
    return (roles || []).filter(role => {
      // Search filter
      if (tableFilters.search) {
        const search = tableFilters.search.toLowerCase()
        const roleName = (role.role_name || "").toLowerCase()
        if (!roleName.includes(search)) return false
      }
      // Role name filter
      if (tableFilters.role_name && !role.role_name?.toLowerCase().includes(tableFilters.role_name.toLowerCase())) return false
      // Permissions filter
      if (tableFilters.permissions) {
        const hasPermission = role.role_operations?.some(op => op.toLowerCase().includes(tableFilters.permissions.toLowerCase()))
        if (!hasPermission) return false
      }
      return true
    })
  }, [roles, tableFilters])

  // Define columns for DataTable
  const columns: ColumnDef<UserRole>[] = [
    {
      accessorKey: "role_name",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original
        const roleLower = role.role_name?.toLowerCase() || ''
        const getRoleColor = (roleName: string) => {
          if (roleName.includes('admin')) return 'bg-blue-100 text-blue-800'
          if (roleName.includes('manager')) return 'bg-blue-100 text-blue-800'
          if (roleName.includes('technician')) return 'bg-orange-100 text-orange-800'
          if (roleName.includes('operator')) return 'bg-green-100 text-green-800'
          return 'bg-gray-100 text-gray-800'
        }

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
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
        // Show only first 5 permission keys with at least one operation, then "+N more"
        const allPerms = Object.keys(permissionLabels).filter((permKey) =>
          Array.isArray(role[permKey as keyof UserRole]) && (role[permKey as keyof UserRole] as any[]).length > 0
        )
        const shownPerms = allPerms.slice(0, 5)
        const moreCount = allPerms.length - shownPerms.length
        return (
          <div className="flex flex-wrap gap-1">
            {shownPerms.map((permKey) => (
              <Badge key={permKey} className="text-xs">
                {permissionLabels[permKey]}
              </Badge>
            ))}
            {moreCount > 0 && (
              <Badge className="text-xs">
                +{moreCount} more
              </Badge>
            )}
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
                  {viewLabels[view] || view}
                </Badge>
              ))}
              {role.views && role.views.length > 3 && (
                <Badge className="text-xs">
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

              size="sm"
              onClick={() => handleViewRole(role)}
              className="bg-[#006BC4] text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton

              size="sm"
              onClick={() => handleEditRole(role)}
              className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteRole(role)}
              className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full"
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
    <PermissionGuard requiredView="role_tab">
      <AdminDashboardLayout title="Roles Management" subtitle="Manage user roles and permissions">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-foreground">Roles Management</h1>
              <p className="text-sm font-light text-muted-foreground">Manage user roles and their permissions</p>
            </div>
            <LoadingButton
              onClick={handleAddRole}
              disabled={rolesLoading}
              className="bg-[#006BC4] text-white border-0 rounded-full px-6 py-2 font-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </LoadingButton>
          </div>

          {/* Metrics Cards */}
          {rolesLoading ? (
            <MetricsPulseLoading className="grid-cols-1 md:grid-cols-3" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-light">Total Roles</span>
                  <Shield className="h-4 w-4 text-gray-500" />
                </div>
                <div className="text-2xl font-light">{totalRoles}</div>
                <p className="text-xs text-muted-foreground">Active roles</p>
              </div>
              <div className="border border-gray-200 rounded-lg bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-light">Active Roles</span>
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-light text-blue-600">{activeRoles}</div>
                <p className="text-xs text-muted-foreground">With permissions</p>
              </div>
              <div className="border border-gray-200 rounded-lg bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-light">Admin Roles</span>
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-light text-blue-600">{adminRoles}</div>
                <p className="text-xs text-muted-foreground">Administrative access</p>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Roles</div>
            </div>
            <div className="p-6 space-y-4">
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
                  data={filteredRoles}
                  showSearch={false}
                />
              )}
            </div>
          </div>

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
    </PermissionGuard>
  )
}
