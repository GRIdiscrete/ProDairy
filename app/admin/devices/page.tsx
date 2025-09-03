"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Plus, Cpu, Wifi, WifiOff, Eye, Edit, Trash2 } from "lucide-react"
import { DeviceFormDrawer } from "@/components/forms/device-form-drawer"
import { DeviceViewDrawer } from "@/components/forms/device-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"

// Mock data for devices
const mockDevices = [
  {
    id: "1",
    name: "Temperature Sensor 01",
    device_id: "TEMP001",
    type: "Temperature Sensor",
    status: "Online",
    location: "Production Line A",
    last_seen: "2024-01-15T10:30:00Z",
    configuration: '{"interval": 30, "threshold": 25}',
    description: "Monitors temperature in the main production line"
  },
  {
    id: "2",
    name: "Flow Meter 02",
    device_id: "FLOW002",
    type: "Flow Meter",
    status: "Online",
    location: "Pasteurization Unit",
    last_seen: "2024-01-15T10:29:45Z",
    configuration: '{"units": "L/min", "calibration": 1.05}',
    description: "Measures milk flow rate during pasteurization"
  },
  {
    id: "3",
    name: "Pressure Gauge 03",
    device_id: "PRES003",
    type: "Pressure Gauge",
    status: "Offline",
    location: "Storage Tank 1",
    last_seen: "2024-01-15T08:15:22Z",
    configuration: '{"range": "0-10 bar", "accuracy": 0.1}',
    description: "Monitors pressure levels in storage tank"
  },
]

export default function DevicesPage() {
  const [selectedDevice, setSelectedDevice] = useState<any>(null)
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  // Define columns inside component to access state functions
  const columns = [
  {
    accessorKey: "name",
    header: "Device Name",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Cpu className="h-4 w-4 text-purple-500" />
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "device_id",
    header: "Device ID",
    cell: ({ row }: any) => <code className="text-sm bg-muted px-2 py-1 rounded">{row.getValue("device_id")}</code>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: any) => <Badge variant="outline">{row.getValue("type")}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status") as string
      const isOnline = status === "Online"
      return (
        <div className="flex items-center space-x-2">
          {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
          <Badge variant={isOnline ? "default" : "destructive"}>{status}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "last_seen",
    header: "Last Seen",
    cell: ({ row }: any) => {
      const date = new Date(row.getValue("last_seen"))
      return date.toLocaleString()
    },
  },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const device = row.original
        return (
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedDevice(device)
                setViewDrawerOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedDevice(device)
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
                setSelectedDevice(device)
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

  // Filter devices based on search and filters
  const filteredDevices = mockDevices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.device_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || device.type === typeFilter
    const matchesStatus = statusFilter === "all" || device.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleAddDevice = () => {
    setSelectedDevice(null)
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
      console.log("Deleting device:", selectedDevice?.name)
      setDeleteDialogOpen(false)
      setSelectedDevice(null)
    } catch (error) {
      console.error("Error deleting device:", error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <AdminDashboardLayout title="Device Configuration" subtitle="Manage and configure IoT devices and sensors">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Devices Management</h1>
            <p className="text-muted-foreground">Manage IoT devices and sensors</p>
          </div>
          <Button onClick={handleAddDevice}>
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Wifi className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Online</p>
                  <p className="text-2xl font-bold text-green-600">18</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <WifiOff className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offline</p>
                  <p className="text-2xl font-bold text-red-600">6</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold">98.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Device Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input 
                placeholder="Search devices..." 
                className="flex-1" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Temperature Sensor">Temperature Sensor</SelectItem>
                  <SelectItem value="Flow Meter">Flow Meter</SelectItem>
                  <SelectItem value="Pressure Gauge">Pressure Gauge</SelectItem>
                  <SelectItem value="pH Sensor">pH Sensor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={filteredDevices} searchKey="name" />
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <DeviceFormDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          device={selectedDevice}
          mode={formMode}
        />

        {/* View Drawer */}
        <DeviceViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          device={selectedDevice}
          onEdit={handleEditFromView}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          loading={loading}
          title="Delete Device"
          description={`Are you sure you want to delete "${selectedDevice?.name}"? This action cannot be undone.`}
        />
      </div>
    </AdminDashboardLayout>
  )
}
