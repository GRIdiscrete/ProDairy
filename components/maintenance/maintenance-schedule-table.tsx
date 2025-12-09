"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, CheckCircle, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

interface MaintenanceTask {
  id: string
  taskNumber: string
  machineId: string
  machineName: string
  taskType: string
  priority: string
  status: string
  scheduledDate: string
  assignedTo: string
  estimatedDuration: number
  description: string
}

// Mock data for maintenance tasks
const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: "MT-001",
    taskNumber: "MT-2024-001",
    machineId: "m01",
    machineName: "Pasteurizer Unit 1",
    taskType: "Preventive",
    priority: "high",
    status: "scheduled",
    scheduledDate: "2024-01-15T09:00:00Z",
    assignedTo: "Mike Johnson",
    estimatedDuration: 4,
    description: "Monthly preventive maintenance check",
  },
  {
    id: "MT-002",
    taskNumber: "MT-2024-002",
    machineId: "m02",
    machineName: "Homogenizer Unit 1",
    taskType: "Corrective",
    priority: "critical",
    status: "in_progress",
    scheduledDate: "2024-01-10T08:00:00Z",
    assignedTo: "Sarah Wilson",
    estimatedDuration: 6,
    description: "Repair pressure valve malfunction",
  },
  {
    id: "MT-003",
    taskNumber: "MT-2024-003",
    machineId: "m03",
    machineName: "Separator Unit 1",
    taskType: "Preventive",
    priority: "medium",
    status: "completed",
    scheduledDate: "2024-01-05T10:00:00Z",
    assignedTo: "Tom Brown",
    estimatedDuration: 3,
    description: "Quarterly cleaning and calibration",
  },
  {
    id: "MT-004",
    taskNumber: "MT-2024-004",
    machineId: "m04",
    machineName: "Filler Unit 1",
    taskType: "Inspection",
    priority: "low",
    status: "overdue",
    scheduledDate: "2024-01-08T14:00:00Z",
    assignedTo: "Lisa Anderson",
    estimatedDuration: 2,
    description: "Safety inspection and documentation",
  },
]

export function MaintenanceScheduleTable() {
  const columns: ColumnDef<MaintenanceTask>[] = [
    {
      accessorKey: "taskNumber",
      header: "Task Number",
      cell: ({ row }) => (
        <div className="font-medium text-primary">
          <Button variant="link" className="p-0 h-auto font-medium">
            {row.getValue("taskNumber")}
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "machineName",
      header: "Machine",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("machineName")}</div>
          <div className="text-xs text-muted-foreground">{row.original.machineId.toUpperCase()}</div>
        </div>
      ),
    },
    {
      accessorKey: "taskType",
      header: "Type",
      cell: ({ row }) => (
        <Badge  className="capitalize">
          {row.getValue("taskType")}
        </Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        const variant = priority === "critical" ? "destructive" : priority === "high" ? "default" : "secondary"
        return (
          <Badge variant={variant} className="capitalize">
            {priority}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "scheduledDate",
      header: "Scheduled Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("scheduledDate"))
        const isOverdue = date < new Date() && row.original.status !== "completed"
        return (
          <div>
            <div className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>{format(date, "MMM dd, yyyy")}</div>
            <div className="text-xs text-muted-foreground">{format(date, "HH:mm")}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => <div className="font-medium">{row.getValue("assignedTo")}</div>,
    },
    {
      accessorKey: "estimatedDuration",
      header: "Duration",
      cell: ({ row }) => (
        <div className="text-center">
          <div className="font-medium">{row.getValue("estimatedDuration")}h</div>
          <div className="text-xs text-muted-foreground">estimated</div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const task = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(task.id)}>Copy task ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit task
              </DropdownMenuItem>
              {task.status === "scheduled" && (
                <DropdownMenuItem>
                  <Clock className="mr-2 h-4 w-4" />
                  Start task
                </DropdownMenuItem>
              )}
              {task.status === "in_progress" && (
                <DropdownMenuItem className="text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const filters = [
    {
      key: "priority",
      label: "Priority",
      options: [
        { label: "Critical", value: "critical" },
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Scheduled", value: "scheduled" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Overdue", value: "overdue" },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={mockMaintenanceTasks}
        searchKey="taskNumber"
        searchPlaceholder="Search maintenance tasks..."
        filters={filters}
      />
    </div>
  )
}
