"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, CheckCircle, XCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppSelector } from "@/lib/store"
import type { QualityTest } from "@/lib/types"
import { format } from "date-fns"

// Mock data for quality tests
const mockQualityTests: QualityTest[] = [
  {
    id: "T-2024-001",
    batchId: "B-2024-1357",
    testType: "microbiological",
    parameters: [
      { name: "Total Plate Count", value: 1500, unit: "CFU/ml", specification: { max: 10000 }, status: "pass" },
      { name: "Coliform", value: 0, unit: "CFU/ml", specification: { max: 10 }, status: "pass" },
      { name: "E. coli", value: 0, unit: "CFU/ml", specification: { max: 0 }, status: "pass" },
    ],
    result: "pass",
    testedBy: "Dr. Sarah Johnson",
    testedAt: "2024-01-01T10:30:00Z",
    approvedBy: "Dr. Michael Chen",
    approvedAt: "2024-01-01T14:00:00Z",
    notes: "All parameters within acceptable limits",
  },
  {
    id: "T-2024-002",
    batchId: "B-2024-1358",
    testType: "chemical",
    parameters: [
      { name: "Fat Content", value: 3.2, unit: "%", specification: { min: 3.0, max: 4.0 }, status: "pass" },
      { name: "Protein", value: 3.1, unit: "%", specification: { min: 2.8, max: 3.5 }, status: "pass" },
      { name: "pH", value: 6.7, unit: "", specification: { min: 6.5, max: 6.8 }, status: "pass" },
    ],
    result: "pass",
    testedBy: "Dr. Emily Davis",
    testedAt: "2024-01-01T11:15:00Z",
    approvedBy: "Dr. Michael Chen",
    approvedAt: "2024-01-01T15:30:00Z",
    notes: "Chemical composition meets standards",
  },
  {
    id: "T-2024-003",
    batchId: "B-2024-1359",
    testType: "physical",
    parameters: [
      { name: "Density", value: 1.032, unit: "g/ml", specification: { min: 1.028, max: 1.035 }, status: "pass" },
      { name: "Viscosity", value: 2.1, unit: "cP", specification: { min: 1.8, max: 2.5 }, status: "pass" },
      { name: "Temperature", value: 4.2, unit: "°C", specification: { max: 4.5 }, status: "pass" },
    ],
    result: "pass",
    testedBy: "Dr. Robert Wilson",
    testedAt: "2024-01-01T09:45:00Z",
    approvedBy: "Dr. Michael Chen",
    approvedAt: "2024-01-01T13:15:00Z",
    notes: "Physical properties within specifications",
  },
  {
    id: "T-2024-004",
    batchId: "B-2024-1360",
    testType: "organoleptic",
    parameters: [
      { name: "Appearance", value: "Normal", unit: "", specification: { expected: "Normal" }, status: "pass" },
      { name: "Odor", value: "Fresh", unit: "", specification: { expected: "Fresh" }, status: "pass" },
      { name: "Taste", value: "Good", unit: "", specification: { expected: "Good" }, status: "pass" },
    ],
    result: "pending",
    testedBy: "Dr. Lisa Anderson",
    testedAt: "2024-01-01T12:00:00Z",
    notes: "Sensory evaluation in progress",
  },
]

export function QualityTestsTable() {
  const loading = useAppSelector((state) => state.laboratory.loading)
  const tests = mockQualityTests // Using mock data for now

  const columns: ColumnDef<QualityTest>[] = [
    {
      accessorKey: "id",
      header: "Test ID",
      cell: ({ row }) => (
        <div className="font-medium text-primary">
          <Button variant="link" className="p-0 h-auto font-medium">
            {row.getValue("id")}
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
      accessorKey: "testType",
      header: "Test Type",
      cell: ({ row }) => {
        const testType = row.getValue("testType") as string
        return (
          <Badge variant="secondary" className="capitalize">
            {testType.replace("_", " ")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "result",
      header: "Result",
      cell: ({ row }) => <StatusBadge status={row.getValue("result")} />,
    },
    {
      accessorKey: "testedBy",
      header: "Tested By",
      cell: ({ row }) => <div className="font-medium">{row.getValue("testedBy")}</div>,
    },
    {
      accessorKey: "testedAt",
      header: "Test Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("testedAt"))
        return (
          <div>
            <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
            <div className="text-xs text-muted-foreground">{format(date, "HH:mm")}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "approvedBy",
      header: "Approved By",
      cell: ({ row }) => {
        const approvedBy = row.getValue("approvedBy")
        return approvedBy ? (
          <div className="font-medium">{approvedBy as string}</div>
        ) : (
          <span className="text-muted-foreground">Pending</span>
        )
      },
    },
    {
      accessorKey: "parameters",
      header: "Parameters",
      cell: ({ row }) => {
        const parameters = row.getValue("parameters") as QualityTest["parameters"]
        const passCount = parameters.filter((p) => p.status === "pass").length
        const totalCount = parameters.length

        return (
          <div className="text-center">
            <div className="text-sm font-medium">
              {passCount}/{totalCount}
            </div>
            <div className="text-xs text-muted-foreground">passed</div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const test = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(test.id)}>Copy test ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit test
              </DropdownMenuItem>
              {test.result === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve test
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject test
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const filters = [
    {
      key: "testType",
      label: "Test Type",
      options: [
        { label: "Microbiological", value: "microbiological" },
        { label: "Chemical", value: "chemical" },
        { label: "Physical", value: "physical" },
        { label: "Organoleptic", value: "organoleptic" },
      ],
    },
    {
      key: "result",
      label: "Result",
      options: [
        { label: "Pass", value: "pass" },
        { label: "Fail", value: "fail" },
        { label: "Pending", value: "pending" },
        { label: "Retest", value: "retest" },
      ],
    },
  ]

  if (loading) {
    return <div>Loading quality tests...</div>
  }

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={tests} searchKey="id" searchPlaceholder="Search tests..." filters={filters} />
    </div>
  )
}
