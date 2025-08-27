"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Plus, Shield, Settings, Eye, Edit, Trash2 } from "lucide-react"
import { RoleFormDrawer } from "@/components/forms/role-form-drawer"
import { RoleViewDrawer } from "@/components/forms/role-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchRoles, deleteRole, clearError } from "@/lib/store/slices/rolesSlice"
import { toast } from "sonner"



export default function RolesPage() {
  const dispatch = useAppDispatch()
  const { roles, loading, error, operationLoading } = useAppSelector((state) => state.roles)
  
  const [searchTerm, setSearchTerm] = useState("")
  const hasFetchedRef = useRef(false)
  
  // Load roles on component mount - prevent duplicate calls with ref
  useEffect(() => {
    if (!hasFetchedRef.current && !operationLoading.fetch) {
      hasFetchedRef.current = true
      dispatch(fetchRoles())
    }
  }, [dispatch, operationLoading.fetch])
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])
  
  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Selected role and mode
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter roles
  const filteredRoles = roles.filter(role => 
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Action handlers
  const handleAddRole = () => {
    setSelectedRole(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditRole = (role: any) => {
    setSelectedRole(role)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewRole = (role: any) => {
    setSelectedRole(role)
    setViewDrawerOpen(true)
  }

  const handleDeleteRole = (role: any) => {
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
    } catch (error: any) {
      // Backend error message will be used from the thunk
      toast.error(error || 'Failed to delete role')
    }
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "role_name",
      header: "Role Name",
      cell: ({ row }: any) => {
        const role = row.original
        const getRoleColor = () => {
          switch (role.role_name.toLowerCase()) {
            case "administrator": return "bg-purple-100 text-purple-800"
            case "manager": return "bg-blue-100 text-blue-800"
            case "editor": return "bg-green-100 text-green-800"
            default: return "bg-gray-100 text-gray-800"
          }
        }
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{role.role_name}</span>
                <Badge className={getRoleColor()}>{role.role_name}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Created: {new Date(role.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }: any) => {
        const role = row.original
        const allOperations = [
          ...role.user_operations,
          ...role.role_operations,
          ...role.machine_item_operations,
          ...role.silo_item_operations,
          ...role.supplier_operations,
          ...role.process_operations,
          ...role.devices_operations
        ]
        const uniqueOperations = [...new Set(allOperations)]
        return (
          <div className="space-y-1">
            <Badge variant="outline">{uniqueOperations.length} Operations</Badge>
            <p className="text-xs text-gray-500">{uniqueOperations.join(', ')}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ row }: any) => {
        const views = row.getValue("views") as string[]
        return <Badge variant="secondary">{views.length} Views</Badge>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const role = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton variant="outline" size="sm" onClick={() => handleViewRole(role)}>
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton variant="outline" size="sm" onClick={() => handleEditRole(role)}>
              <Settings className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteRole(role)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Roles Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <LoadingButton onClick={handleAddRole}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </LoadingButton>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{roles.length}</div>
                  <p className="text-xs text-muted-foreground">System roles</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Permissions</CardTitle>
              <Settings className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    {roles.reduce((total, role) => {
                      return total + [
                        ...role.user_operations,
                        ...role.role_operations,
                        ...role.machine_item_operations,
                        ...role.silo_item_operations,
                        ...role.supplier_operations,
                        ...role.process_operations,
                        ...role.devices_operations
                      ].length
                    }, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total permissions</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Views</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {roles.reduce((total, role) => total + role.views.length, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Accessible views</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            {operationLoading.fetch ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading roles...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredRoles}
                searchKey="role_name"
                searchPlaceholder="Search roles..."
              />
            )}
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <RoleFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          role={selectedRole}
          mode={formMode} 
        />

        {/* View Drawer */}
        <RoleViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          role={selectedRole}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditRole(selectedRole)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Role"
          description={`Are you sure you want to delete the ${selectedRole?.role_name} role? This action cannot be undone and may affect users assigned to this role.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </MainLayout>
  )
}
