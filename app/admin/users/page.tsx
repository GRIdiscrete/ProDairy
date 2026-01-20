"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
// Remove Card wrappers; use bordered sections like data-capture pages
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Trash2, User, Settings, Edit } from "lucide-react"
import { UserFormDrawer } from "@/components/forms/user-form-drawer"
import { UserViewDrawer } from "@/components/forms/user-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchUsers, deleteUser } from "@/lib/store/slices/usersSlice"
import { fetchRoles } from "@/lib/store/slices/rolesSlice"
import { toast } from "sonner"
import { User as UserType, TableFilters } from "@/lib/types"
import { ColumnDef } from "@tanstack/react-table"
import { TablePulseLoading } from "@/components/ui/pulse-loading"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionButton } from "@/components/ui/permission-table-actions"

export default function AdminUsersPage() {
  const dispatch = useAppDispatch()
  const { items: userEntities, loading: usersLoading, error: usersError, isInitialized: usersInitialized } = useAppSelector((s) => s.users)

  const { roles, isInitialized: rolesInitialized } = useAppSelector((s) => s.roles)
  const hasFetchedRef = useRef(false)

  const roleNameById = useMemo(() => {
    const map = new Map<string, string>()
    roles?.forEach((role) => role && role.id && map.set(role.id, role.role_name || 'Unknown Role'))
    return map
  }, [roles])

  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Selected user and mode
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter state
  const [tableFilters, setTableFilters] = useState<TableFilters>({})

  // Map UserEntity to User type and filter client-side
  const filteredUsers = useMemo(() => {
    return userEntities
      .map(user => ({
        ...user,
        role: user.users_role_id_fkey?.role_name || roleNameById.get(user.role_id) || 'Unknown Role',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || user.created_at || new Date().toISOString()
      } as UserType))
      .filter(user => {
        // Search filter (name or email)
        if (tableFilters.search) {
          const search = tableFilters.search.toLowerCase()
          const firstName = (user.first_name || "").toLowerCase()
          const lastName = (user.last_name || "").toLowerCase()
          const email = (user.email || "").toLowerCase()
          if (!firstName.includes(search) && !lastName.includes(search) && !email.includes(search)) {
            return false
          }
        }
        // Email filter
        if (tableFilters.email && !user.email?.toLowerCase().includes(tableFilters.email.toLowerCase())) {
          return false
        }
        // Department filter
        if (tableFilters.department && user.department !== tableFilters.department) {
          return false
        }
        // Role filter
        if (tableFilters.role_id && user.role_id !== tableFilters.role_id) {
          return false
        }
        return true
      })
  }, [userEntities, roleNameById, tableFilters])

  // Load roles only once on mount
  useEffect(() => {
    if (!rolesInitialized && (!roles || roles.length === 0)) {
      dispatch(fetchRoles({}))
    }
  }, [dispatch, rolesInitialized, roles])

  // Load users only when needed
  useEffect(() => {
    // Only fetch users once on initialization
    if (!usersInitialized) {
      dispatch(fetchUsers({}))
    }
  }, [dispatch, usersInitialized])

  // Handle errors with toast notifications
  useEffect(() => {
    if (usersError) {
      toast.error(usersError)
    }
  }, [usersError])

  // Get unique departments for filters
  const departments = useMemo(() => {
    const deptSet = new Set<string>()
    userEntities.forEach(user => user.department && deptSet.add(user.department))
    return Array.from(deptSet).sort()
  }, [userEntities])

  // Filter fields configuration
  const filterFields = useMemo(() => [
    {
      key: "email",
      label: "Email",
      type: "text" as const,
      placeholder: "Filter by email"
    },
    {
      key: "department",
      label: "Department",
      type: "select" as const,
      options: departments.map(dept => ({ label: dept, value: dept })),
      placeholder: "Select department"
    },
    {
      key: "role_id",
      label: "Role",
      type: "select" as const,
      options: roles?.map(role => ({ label: role.role_name, value: role.id })) || [],
      placeholder: "Select role"
    },
  ], [departments, roles])

  // Define columns for DataTable
  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{`${user.first_name} ${user.last_name}`.trim() || 'Unknown User'}</p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.users_role_id_fkey?.role_name || roleNameById.get(row.original.role_id) || 'Unknown'
        const getRoleColor = (roleName: string) => {
          if (!roleName) return 'bg-gray-100 text-gray-800';
          const roleLower = roleName.toLowerCase()
          if (roleLower.includes('admin')) return 'bg-blue-100 text-blue-800'
          if (roleLower.includes('manager') || roleLower.includes('supervisor')) return 'bg-purple-100 text-purple-800'
          if (roleLower.includes('technician') || roleLower.includes('quality')) return 'bg-orange-100 text-orange-800'
          if (roleLower.includes('driver')) return 'bg-yellow-100 text-yellow-800'
          if (roleLower.includes('operator')) return 'bg-green-100 text-green-800'
          return 'bg-gray-100 text-gray-800'
        }

        return (
          <Badge className={getRoleColor(role)}>
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.phone_number || 'N/A'
        return <span className="text-sm text-muted-foreground">{phone}</span>
      },
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => {
        const department = row.original.department || 'N/A'
        return <span className="text-sm">{department}</span>
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : 'N/A'
        return <span className="text-sm">{date}</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return (
          <Badge variant="default">
            Active
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton

              size="sm"
              onClick={() => handleViewUser(user)}
              className="bg-[#006BC4] text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton

              size="sm"
              onClick={() => handleEditUser(user)}
              className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteUser(user)}
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
  const handleAddUser = () => {
    setSelectedUser(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user)
    setViewDrawerOpen(true)
  }

  const handleEditUser = (user: UserType) => {
    setSelectedUser({
      ...user,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role_id: user.role_id || '',
      department: user.department || ''
    })
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleDeleteUser = (user: UserType) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedUser) return

    try {
      await dispatch(deleteUser(selectedUser.id)).unwrap()
      toast.success('User deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  return (
    <PermissionGuard requiredView="user_tab">
      <AdminDashboardLayout title="Users Management" subtitle="Manage system users and their permissions">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-foreground">Users Management</h1>
              <p className="text-sm font-light text-muted-foreground">Manage system users and their permissions</p>
            </div>
            <PermissionButton
              feature="user"
              permission="create"
              onClick={handleAddUser}
              disabled={usersLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </PermissionButton>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Users</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search users by name or email..."
                filterFields={filterFields}
              />

              {usersLoading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-gray-100 rounded w-48" />
                  <div className="h-64 bg-gray-50 border border-dashed border-gray-200 rounded" />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredUsers}
                  showSearch={false}
                />
              )}
            </div>
          </div>

          {/* Form Drawer */}
          <UserFormDrawer
            open={formDrawerOpen}
            onOpenChange={(open) => {
              setFormDrawerOpen(open)
              if (!open) setSelectedUser(null)
            }}
            user={formMode === 'edit' && selectedUser ? selectedUser : undefined}
            mode={formMode}
            onSuccess={() => {
              setFormDrawerOpen(false)
              setSelectedUser(null)
            }}
          />

          {/* View Drawer */}
          <UserViewDrawer
            open={viewDrawerOpen}
            onClose={() => setViewDrawerOpen(false)}
            user={selectedUser}
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
            title="Delete User"
            description={`Are you sure you want to delete ${selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}`.trim() || 'User' : 'User'}? This action cannot be undone.`}
            onConfirm={confirmDelete}
            loading={usersLoading}
          />
        </div>
      </AdminDashboardLayout>
    </PermissionGuard>
  )
}
