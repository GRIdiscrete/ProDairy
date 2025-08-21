"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Plus, Cpu, Wifi, WifiOff } from "lucide-react"

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
    cell: ({ row }: any) => (
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">
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
  },
  {
    id: "2",
    name: "Flow Meter 02",
    device_id: "FLOW002",
    type: "Flow Meter",
    status: "Online",
    location: "Pasteurization Unit",
    last_seen: "2024-01-15T10:29:45Z",
  },
  {
    id: "3",
    name: "Pressure Gauge 03",
    device_id: "PRES003",
    type: "Pressure Gauge",
    status: "Offline",
    location: "Storage Tank 1",
    last_seen: "2024-01-15T08:15:22Z",
  },
]

export default function DevicesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Devices Management</h1>
            <p className="text-muted-foreground">Manage IoT devices and sensors</p>
          </div>
          <Button>
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
              <Input placeholder="Search devices..." className="flex-1" />
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="temperature-sensor">Temperature Sensor</SelectItem>
                  <SelectItem value="flow-meter">Flow Meter</SelectItem>
                  <SelectItem value="pressure-gauge">Pressure Gauge</SelectItem>
                  <SelectItem value="ph-sensor">pH Sensor</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
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
            <DataTable columns={columns} data={mockDevices} loading={false} searchKey="name" />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
