"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Plus, Shield, Settings, Eye, Edit, Trash2 } from "lucide-react"
import { RoleFormDrawer } from "@/components/forms/role-form-drawer"
import { RoleViewDrawer } from "@/components/forms/role-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

// Mock data for roles
const mockRoles = [
  {
    id: "1",
    name: "Admin",
    description: "Full system administrator with all permissions",
    features: {
      user: ["Create", "Update", "Delete", "View"],
      role: ["Create", "Update", "Delete", "View"],
      machine_item: ["Create", "Update", "Delete", "View"],
      silo_item: ["Create", "Update", "Delete", "View"],
      supplier: ["Create", "Update", "Delete", "View"],
      process: ["Create", "Update", "Delete", "View"],
      devices: ["Create", "Update", "Delete", "View"],
    },
    views: [
      "admin_panel",
      "user_tab",
      "role_tab",
      "machine_tab",
      "silo_tab",
      "supplier_tab",
      "process_tab",
      "devices_tab",
    ],
  },
  {
    id: "2",
    name: "Manager",
    description: "Department manager with limited administrative access",
    features: {
      user: ["Update", "View"],
      machine_item: ["Create", "Update", "View"],
      silo_item: ["Create", "Update", "View"],
      supplier: ["Create", "Update", "View"],
      process: ["Create", "Update", "View"],
    },
    views: ["user_tab", "machine_tab", "silo_tab", "supplier_tab", "process_tab"],
  },
  {
    id: "3",
    name: "Operator",
    description: "Production operator with operational permissions",
    features: {
      machine_item: ["Update", "View"],
      silo_item: ["Update", "View"],
      process: ["Update", "View"],
    },
    views: ["machine_tab", "silo_tab", "process_tab"],
  },
]


export default function RolesPage() {
  const [roles, setRoles] = useState(mockRoles)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Selected role and mode
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Filter roles
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    
    setDeleteLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRoles(roles.filter(role => role.id !== selectedRole.id))
      setDeleteDialogOpen(false)
      setSelectedRole(null)
    } catch (error) {
      console.error("Error deleting role:", error)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }: any) => {
        const role = row.original
        const getRoleColor = () => {
          switch (role.name.toLowerCase()) {
            case "admin": return "bg-purple-100 text-purple-800"
            case "manager": return "bg-blue-100 text-blue-800"
            case "operator": return "bg-green-100 text-green-800"
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
                <span className="font-medium">{role.name}</span>
                <Badge className={getRoleColor()}>{role.name}</Badge>
              </div>
              {role.description && (
                <p className="text-sm text-gray-500 mt-1">{role.description}</p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "features",
      header: "Features",
      cell: ({ row }: any) => {
        const features = row.getValue("features") as Record<string, string[]>
        const featureCount = Object.keys(features).length
        const totalPermissions = Object.values(features).reduce((total: number, actions: string[]) => total + actions.length, 0)
        return (
          <div className="space-y-1">
            <Badge variant="outline">{featureCount} Features</Badge>
            <p className="text-xs text-gray-500">{totalPermissions} permissions</p>
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
            <Button variant="outline" size="sm" onClick={() => handleViewRole(role)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteRole(role)}>
              <Trash2 className="w-4 h-4" />
            </Button>
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
          <Button onClick={handleAddRole}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input 
                placeholder="Search roles..." 
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles List ({filteredRoles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={filteredRoles} loading={loading} searchKey="name" />
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
          description={`Are you sure you want to delete the ${selectedRole?.name} role? This action cannot be undone and may affect users assigned to this role.`}
          onConfirm={confirmDelete}
          loading={deleteLoading}
        />
      </div>
    </MainLayout>
  )
}
