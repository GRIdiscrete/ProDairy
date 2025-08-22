"use client"
import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Database, MapPin, Eye, Edit, Trash2 } from "lucide-react"
import { SiloFormDrawer } from "@/components/forms/silo-form-drawer"
import { SiloViewDrawer } from "@/components/forms/silo-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"


// Mock data for silos
const mockSilos = [
  {
    id: "1",
    name: "PMT 3",
    serial_no: "PMT3564356456A",
    status: "Active",
    created_at: "2024-03-04T13:23:22Z",
    category: "Pasteurizing Silos",
    location: "PD2",
    milk_volume: 4200.324,
    capacity: 5000.242,
  },
  {
    id: "2",
    name: "PMT 4",
    serial_no: "PMT4564356456B",
    status: "Active",
    created_at: "2024-03-04T13:23:22Z",
    category: "Storage Silos",
    location: "PD1",
    milk_volume: 3800.15,
    capacity: 4500.0,
  },
  {
    id: "3",
    name: "PMT 5",
    serial_no: "PMT5564356456C",
    status: "Maintenance",
    created_at: "2024-03-04T13:23:22Z",
    category: "Cooling Silos",
    location: "PD3",
    milk_volume: 0.0,
    capacity: 6000.0,
  },
]

export default function SilosPage() {
  const [selectedSilo, setSelectedSilo] = useState<any>(null)
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  // Define columns inside component to access state functions
  const columns = [
    {
      accessorKey: "name",
      header: "Silo Name",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "serial_no",
      header: "Serial Number",
      cell: ({ row }: any) => <code className="text-sm bg-muted px-2 py-1 rounded">{row.getValue("serial_no")}</code>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "Active" ? "default" : status === "Maintenance" ? "destructive" : "secondary"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{row.getValue("location")}</span>
        </div>
      ),
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }: any) => {
        const capacity = row.getValue("capacity") as number
        const milkVolume = row.original.milk_volume as number
        const percentage = (milkVolume / capacity) * 100

        return (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{milkVolume.toFixed(1)}L</span>
              <span>{capacity.toFixed(1)}L</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">{percentage.toFixed(1)}% Full</div>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const silo = row.original
        return (
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedSilo(silo)
                setViewDrawerOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedSilo(silo)
                setFormMode("edit")
                setFormDrawerOpen(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedSilo(silo)
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  // Filter silos based on search and filters
  const filteredSilos = mockSilos.filter((silo) => {
    const matchesSearch = silo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         silo.serial_no.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || silo.status === statusFilter
    const matchesLocation = locationFilter === "all" || silo.location === locationFilter
    return matchesSearch && matchesStatus && matchesLocation
  })

  const handleAddSilo = () => {
    setSelectedSilo(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditFromView = () => {
    setViewDrawerOpen(false)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Deleting silo:", selectedSilo?.name)
      setDeleteDialogOpen(false)
      setSelectedSilo(null)
    } catch (error) {
      console.error("Error deleting silo:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Silos Management</h1>
            <p className="text-muted-foreground">Manage storage silos and milk volume tracking</p>
          </div>
          <Button onClick={handleAddSilo}>
            <Plus className="mr-2 h-4 w-4" />
            Add Silo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Silos</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">9</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-red-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                  <p className="text-2xl font-bold">45,500L</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Silo Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input 
                placeholder="Search silos..." 
                className="flex-1" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="PD1">PD1</SelectItem>
                  <SelectItem value="PD2">PD2</SelectItem>
                  <SelectItem value="PD3">PD3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Silos List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={filteredSilos} searchKey="name" />
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <SiloFormDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          silo={selectedSilo}
          mode={formMode}
        />

        {/* View Drawer */}
        <SiloViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          silo={selectedSilo}
          onEdit={handleEditFromView}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          loading={loading}
          title="Delete Silo"
          description={`Are you sure you want to delete "${selectedSilo?.name}"? This action cannot be undone.`}
        />
      </div>
    </MainLayout>
  )
}
