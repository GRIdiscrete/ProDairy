"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, Eye, Edit, Settings, Wrench, Play, Pause } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppSelector } from "@/lib/store"
import type { Machine } from "@/lib/types"
import { format } from "date-fns"

// Mock data for machines
const mockMachines: Machine[] = [
  {
    id: "m01",
    name: "Pasteurizer Unit 1",
    code: "M/C 01",
    type: "pasteurizer",
    location: "Production Line A",
    floor: "Floor 01",
    warehouse: "Warehouse 01",
    status: "running",
    operator: "John Smith",
    temperature: 85,
    pressure: 2.5,
    speed: 1200,
    efficiency: 96,
    lastMaintenance: "2024-01-01T00:00:00Z",
    nextMaintenance: "2024-02-01T00:00:00Z",
    specifications: {
      capacity: 5000,
      powerConsumption: 150,
      operatingTemperature: { min: 80, max: 90 },
      operatingPressure: { min: 2.0, max: 3.0 },
    },
  },
  {
    id: "m02",
    name: "Homogenizer Unit 1",
    code: "M/C 02",
    type: "homogenizer",
    location: "Production Line A",
    floor: "Floor 01",
    warehouse: "Warehouse 01",
    status: "running",
    operator: "Jane Doe",
    temperature: 82,
    pressure: 15.0,
    speed: 3000,
    efficiency: 94,
    lastMaintenance: "2023-12-15T00:00:00Z",
    nextMaintenance: "2024-01-15T00:00:00Z",
    specifications: {
      capacity: 3000,
      powerConsumption: 200,
      operatingTemperature: { min: 75, max: 85 },
      operatingPressure: { min: 10.0, max: 20.0 },
    },
  },
  {
    id: "m03",
    name: "Separator Unit 1",
    code: "M/C 03",
    type: "separator",
    location: "Production Line B",
    floor: "Floor 01",
    warehouse: "Warehouse 01",
    status: "maintenance",
    temperature: 25,
    efficiency: 0,
    lastMaintenance: "2024-01-01T00:00:00Z",
    nextMaintenance: "2024-02-01T00:00:00Z",
    specifications: {
      capacity: 4000,
      powerConsumption: 120,
      operatingTemperature: { min: 70, max: 80 },
      operatingPressure: { min: 1.5, max: 2.5 },
    },
  },
  {
    id: "m04",
    name: "Filler Unit 1",
    code: "M/C 04",
    type: "filler",
    location: "Packaging Line",
    floor: "Floor 02",
    warehouse: "Warehouse 01",
    status: "idle",
    temperature: 25,
    efficiency: 0,
    lastMaintenance: "2023-12-20T00:00:00Z",
    nextMaintenance: "2024-01-20T00:00:00Z",
    specifications: {
      capacity: 2000,
      powerConsumption: 80,
      operatingTemperature: { min: 20, max: 30 },
      operatingPressure: { min: 1.0, max: 2.0 },
    },
  },
]

export function MachineListTable() {
  const loading = useAppSelector((state) => state.machine.loading)
  const machines = mockMachines // Using mock data for now

  const columns: ColumnDef<Machine>[] = [
    {
      accessorKey: "code",
      header: "Machine Code",
      cell: ({ row }) => (
        <div className="font-medium text-primary">
          <Button variant="link" className="p-0 h-auto font-medium">
            {row.getValue("code")}
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Machine Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-xs text-muted-foreground capitalize">{row.original.type.replace("_", " ")}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{row.getValue("location")}</div>
          <div className="text-xs text-muted-foreground">{row.original.floor}</div>
        </div>
      ),
    },
    {
      accessorKey: "operator",
      header: "Operator",
      cell: ({ row }) => {
        const operator = row.getValue("operator")
        return operator ? (
          <div className="font-medium">{operator as string}</div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )
      },
    },
    {
      accessorKey: "efficiency",
      header: "Efficiency",
      cell: ({ row }) => {
        const efficiency = row.getValue("efficiency") as number
        return (
          <div className="w-20">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>{efficiency}%</span>
            </div>
            <Progress value={efficiency} className="h-2" />
          </div>
        )
      },
    },
    {
      accessorKey: "temperature",
      header: "Temperature",
      cell: ({ row }) => {
        const temp = row.getValue("temperature") as number
        const status = row.original.status
        return (
          <div className="text-center">
            <div className="font-medium">{temp}°C</div>
            {status === "running" && (
              <Badge variant="secondary" className="text-xs">
                Normal
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "nextMaintenance",
      header: "Next Maintenance",
      cell: ({ row }) => {
        const date = new Date(row.getValue("nextMaintenance"))
        const isOverdue = date < new Date()
        return (
          <div>
            <div className={`text-sm ${isOverdue ? "text-red-600 font-medium" : ""}`}>
              {format(date, "MMM dd, yyyy")}
            </div>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const machine = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(machine.id)}>
                Copy machine ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit machine
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configuration
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {machine.status === "running" && (
                <DropdownMenuItem>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop machine
                </DropdownMenuItem>
              )}
              {machine.status === "idle" && (
                <DropdownMenuItem>
                  <Play className="mr-2 h-4 w-4" />
                  Start machine
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Wrench className="mr-2 h-4 w-4" />
                Schedule maintenance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Running", value: "running" },
        { label: "Idle", value: "idle" },
        { label: "Maintenance", value: "maintenance" },
        { label: "Fault", value: "fault" },
        { label: "Offline", value: "offline" },
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        { label: "Pasteurizer", value: "pasteurizer" },
        { label: "Homogenizer", value: "homogenizer" },
        { label: "Separator", value: "separator" },
        { label: "Filler", value: "filler" },
        { label: "Packaging", value: "packaging" },
      ],
    },
  ]

  if (loading) {
    return <div>Loading machines...</div>
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={machines}
        searchKey="name"
        searchPlaceholder="Search machines..."
        filters={filters}
      />
    </div>
  )
}
