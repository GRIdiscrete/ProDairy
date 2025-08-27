"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Trash2, User, Settings } from "lucide-react"
import { UserFormDrawer } from "@/components/forms/user-form-drawer"
import { UserViewDrawer } from "@/components/forms/user-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchUsers, deleteUser } from "@/lib/store/slices/usersSlice"
import { fetchRoles } from "@/lib/store/slices/rolesSlice"
import { toast } from "sonner"
import { User as UserType } from "@/lib/types"
import { ColumnDef } from "@tanstack/react-table"

export default function UsersPage() {
  const dispatch = useAppDispatch()
  const { items: userEntities, loading: usersLoading, error: usersError } = useAppSelector((s) => s.users)
  
  const { roles } = useAppSelector((s) => s.roles)
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

  // Map UserEntity to User type
  const mappedUsers = useMemo(() => {
    return userEntities.map(user => ({
      ...user,
      role: roleNameById.get(user.role_id) || 'operator', // Default to operator if role not found
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || user.created_at || new Date().toISOString()
    } as UserType))
  }, [userEntities, roleNameById])

  // Load data on component mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchUsers())
      if (!roles || roles.length === 0) {
        dispatch(fetchRoles())
      }
    }
  }, [dispatch, roles])

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
        const role = roleNameById.get(row.original.role_id) || 'operator'
        const roleLower = role.toLowerCase()
        const getRoleColor = (roleName: string) => {
          if (roleLower.includes('admin')) return 'bg-purple-100 text-purple-800'
          if (roleLower.includes('manager')) return 'bg-blue-100 text-blue-800'
          if (roleLower.includes('technician')) return 'bg-orange-100 text-orange-800'
          return 'bg-green-100 text-green-800'
        }
        
        return (
          <Badge className={getRoleColor(role)}>
            {role}
          </Badge>
        )
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
        // All users are considered active in this implementation
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
              variant="outline" 
              size="sm" 
              onClick={() => handleViewUser(user)}
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditUser(user)}
            >
              <Settings className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteUser(user)}
              disabled={usersLoading}
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  // Prepare filters for DataTable
  const filters = [
    {
      key: 'role_id',
      label: 'Role',
      options: [
        { label: 'All Roles', value: 'all' },
        ...roles.map(role => ({
          label: role.role_name,
          value: role.id
        }))
      ]
    },
    {
      key: 'department',
      label: 'Department',
      options: [
        { label: 'All Departments', value: 'all' },
        ...departments.map(dept => ({
          label: dept,
          value: dept
        }))
      ]
    }
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
      // Ensure we have all required fields
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
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
            <p className="text-muted-foreground">Manage system users and their permissions</p>
          </div>
          <LoadingButton onClick={handleAddUser} loading={usersLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </LoadingButton>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={mappedUsers}
                searchKey="email"
                searchPlaceholder="Search users by name or email..."
                filters={filters}
              />
            )}
          </CardContent>
        </Card>

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
    </MainLayout>
  )
}
