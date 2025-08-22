"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"
import { UserFormDrawer } from "@/components/forms/user-form-drawer"
import { UserViewDrawer } from "@/components/forms/user-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

// Dummy users data
const DUMMY_USERS = [
  { id: 1, name: "John Doe", email: "john@prodairy.com", role: "Admin", department: "Production", phone: "+1234567890", status: "active", created_at: "2024-01-15" },
  { id: 2, name: "Jane Smith", email: "jane@prodairy.com", role: "Manager", department: "Quality", phone: "+1234567891", status: "active", created_at: "2024-01-20" },
  { id: 3, name: "Mike Johnson", email: "mike@prodairy.com", role: "Operator", department: "Production", phone: "+1234567892", status: "inactive", created_at: "2024-02-01" },
  { id: 4, name: "Sarah Wilson", email: "sarah@prodairy.com", role: "Technician", department: "Maintenance", phone: "+1234567893", status: "active", created_at: "2024-02-10" },
]

export default function UsersPage() {
  const [users, setUsers] = useState(DUMMY_USERS)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [departmentFilter, setDepartmentFilter] = useState("All Departments")
  const [loading, setLoading] = useState(false)
  
  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Selected user and mode
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter
    const matchesDepartment = departmentFilter === "All Departments" || user.department === departmentFilter
    return matchesSearch && matchesRole && matchesDepartment
  })

  // Action handlers
  const handleAddUser = () => {
    setSelectedUser(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setViewDrawerOpen(true)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedUser) return
    
    setDeleteLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUsers(users.filter(user => user.id !== selectedUser.id))
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }: any) => {
        const role = row.getValue("role")
        const getVariant = () => {
          switch (role) {
            case "Admin": return "default"
            case "Manager": return "secondary"
            case "Operator": return "outline"
            default: return "secondary"
          }
        }
        return <Badge variant={getVariant()}>{role}</Badge>
      },
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status")
        return (
          <Badge variant={status === "active" ? "default" : "secondary"} 
                 className={status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }: any) => {
        const date = new Date(row.getValue("created_at"))
        return date.toLocaleDateString()
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const user = row.original
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)}>
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
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
            <p className="text-muted-foreground">Manage system users and their permissions</p>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Roles">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Operator">Operator</SelectItem>
                  <SelectItem value="Technician">Technician</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Departments">All Departments</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users List ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={filteredUsers} loading={loading} searchKey="name" />
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <UserFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          user={selectedUser}
          mode={formMode} 
        />

        {/* View Drawer */}
        <UserViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          user={selectedUser}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditUser(selectedUser)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete User"
          description={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          loading={deleteLoading}
        />
      </div>
    </MainLayout>
  )
}
