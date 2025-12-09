"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, TestTube } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

interface Sample {
  id: string
  sampleNumber: string
  batchId: string
  sampleType: string
  collectedBy: string
  collectedAt: string
  status: string
  priority: string
  testTypes: string[]
  notes?: string
}

// Mock data for samples
const mockSamples: Sample[] = [
  {
    id: "S-2024-001",
    sampleNumber: "SM-001-2024",
    batchId: "B-2024-1357",
    sampleType: "Raw Milk",
    collectedBy: "John Smith",
    collectedAt: "2024-01-01T08:30:00Z",
    status: "completed",
    priority: "high",
    testTypes: ["Microbiological", "Chemical"],
    notes: "Standard quality check",
  },
  {
    id: "S-2024-002",
    sampleNumber: "SM-002-2024",
    batchId: "B-2024-1358",
    sampleType: "Processed",
    collectedBy: "Jane Doe",
    collectedAt: "2024-01-01T10:15:00Z",
    status: "in_testing",
    priority: "medium",
    testTypes: ["Physical", "Organoleptic"],
    notes: "Post-pasteurization sample",
  },
  {
    id: "S-2024-003",
    sampleNumber: "SM-003-2024",
    batchId: "B-2024-1359",
    sampleType: "Finished Product",
    collectedBy: "Mike Johnson",
    collectedAt: "2024-01-01T14:20:00Z",
    status: "collected",
    priority: "high",
    testTypes: ["Microbiological", "Chemical", "Physical"],
    notes: "Final product quality verification",
  },
  {
    id: "S-2024-004",
    sampleNumber: "SM-004-2024",
    batchId: "B-2024-1360",
    sampleType: "Water",
    collectedBy: "Sarah Wilson",
    collectedAt: "2024-01-01T16:45:00Z",
    status: "rejected",
    priority: "low",
    testTypes: ["Chemical"],
    notes: "Contamination detected",
  },
]

export function SampleManagementTable() {
  const columns: ColumnDef<Sample>[] = [
    {
      accessorKey: "sampleNumber",
      header: "Sample Number",
      cell: ({ row }) => (
        <div className="font-medium text-primary">
          <Button variant="link" className="p-0 h-auto font-medium">
            {row.getValue("sampleNumber")}
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "batchId",
      header: "Batch ID",
      cell: ({ row }) => <Badge >{row.getValue("batchId")}</Badge>,
    },
    {
      accessorKey: "sampleType",
      header: "Sample Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.getValue("sampleType")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        const variant = priority === "high" ? "destructive" : priority === "medium" ? "default" : "secondary"
        return (
          <Badge variant={variant} className="capitalize">
            {priority}
          </Badge>
        )
      },
    },
    {
      accessorKey: "collectedBy",
      header: "Collected By",
      cell: ({ row }) => <div className="font-medium">{row.getValue("collectedBy")}</div>,
    },
    {
      accessorKey: "collectedAt",
      header: "Collection Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("collectedAt"))
        return (
          <div>
            <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
            <div className="text-xs text-muted-foreground">{format(date, "HH:mm")}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "testTypes",
      header: "Test Types",
      cell: ({ row }) => {
        const testTypes = row.getValue("testTypes") as string[]
        return (
          <div className="flex flex-wrap gap-1">
            {testTypes.slice(0, 2).map((type) => (
              <Badge key={type}  className="text-xs">
                {type}
              </Badge>
            ))}
            {testTypes.length > 2 && (
              <Badge  className="text-xs">
                +{testTypes.length - 2}
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
        const sample = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(sample.id)}>
                Copy sample ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit sample
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TestTube className="mr-2 h-4 w-4" />
                Start testing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const filters = [
    {
      key: "sampleType",
      label: "Sample Type",
      options: [
        { label: "Raw Milk", value: "Raw Milk" },
        { label: "Processed", value: "Processed" },
        { label: "Finished Product", value: "Finished Product" },
        { label: "Water", value: "Water" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Collected", value: "collected" },
        { label: "In Testing", value: "in_testing" },
        { label: "Completed", value: "completed" },
        { label: "Rejected", value: "rejected" },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={mockSamples}
        searchKey="sampleNumber"
        searchPlaceholder="Search samples..."
        filters={filters}
      />
    </div>
  )
}
