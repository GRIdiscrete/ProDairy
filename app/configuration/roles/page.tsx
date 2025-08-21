"use client"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Plus, Shield, Settings } from "lucide-react"

const columns = [
  {
    accessorKey: "name",
    header: "Role Name",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }: any) => {
      const features = row.getValue("features") as Record<string, string[]>
      const featureCount = Object.keys(features).length
      return <Badge variant="outline">{featureCount} Features</Badge>
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
    cell: ({ row }: any) => (
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">
          <Settings className="mr-1 h-3 w-3" />
          Configure
        </Button>
        <Button variant="outline" size="sm">
          Edit
        </Button>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </div>
    ),
  },
]

// Mock data for roles
const mockRoles = [
  {
    id: "1",
    name: "Admin",
    features: {
      user: ["Create", "Update", "Delete"],
      role: ["Create", "Update", "Delete"],
      machine_item: ["Create", "Update", "Delete"],
      silo_item: ["Create", "Update", "Delete"],
      supplier: ["Create", "Update", "Delete"],
      process: ["Create", "Update", "Delete"],
      devices: ["Create", "Update", "Delete"],
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
    features: {
      user: ["Update"],
      machine_item: ["Create", "Update"],
      silo_item: ["Create", "Update"],
      supplier: ["Create", "Update"],
      process: ["Create", "Update"],
    },
    views: ["user_tab", "machine_tab", "silo_tab", "supplier_tab", "process_tab"],
  },
  {
    id: "3",
    name: "Operator",
    features: {
      machine_item: ["Update"],
      silo_item: ["Update"],
      process: ["Update"],
    },
    views: ["machine_tab", "silo_tab", "process_tab"],
  },
]

export default function RolesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Roles Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <Button>
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
              <Input placeholder="Search roles..." className="flex-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockRoles} loading={false} searchKey="name" />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
