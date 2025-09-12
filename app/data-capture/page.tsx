"use client"

import { useState } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { ProcessBoard, ProcessColumn, ProcessForm, defaultProcessColumns } from "@/components/dashboard/process-board"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ClipboardList, 
  User, 
  FlaskConical, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  TrendingUp,
  Plus
} from "lucide-react"

// Mock data for demonstration
const mockProcessForms: ProcessForm[] = [
  {
    id: "1",
    title: "Morning Milk Collection - Route A",
    type: "Raw Milk Intake",
    status: "completed",
    priority: "high",
    operator: "John Driver",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:30:00Z",
    description: "Collection from 15 farms in Route A with initial quality assessment"
  },
  {
    id: "2",
    title: "BMT Transfer - Silo 1 to Silo 2",
    type: "Raw Milk Intake",
    status: "active",
    priority: "high",
    operator: "Sarah Intake",
    createdAt: "2024-01-15T08:30:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
    description: "Transfer of 5000L raw milk with quality checks"
  },
  {
    id: "3",
    title: "Standardization Process - Batch #001",
    type: "Standardizing",
    status: "pending",
    priority: "medium",
    operator: "Lisa Operator",
    createdAt: "2024-01-15T09:30:00Z",
    updatedAt: "2024-01-15T09:30:00Z",
    description: "Fat content adjustment to 3.2% for UHT milk production"
  },
  {
    id: "4",
    title: "Pasteurization - Line 1",
    type: "Pasteurizing",
    status: "pending",
    priority: "high",
    operator: "Tom Process",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    description: "HTST pasteurization at 72°C for 15 seconds"
  },
  {
    id: "5",
    title: "Filler Log - Packaging Line 2",
    type: "Filmatic Lines",
    status: "pending",
    priority: "medium",
    operator: "Anna Pack",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    description: "1L carton packaging with quality control checks"
  },
  {
    id: "6",
    title: "Palletizing - Final Stage",
    type: "Palletiser Sheet",
    status: "pending",
    priority: "low",
    operator: "Bob Pallet",
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
    description: "Final packaging and palletizing for shipment"
  }
]

export default function DataCaptureDashboard() {
  const [processColumns, setProcessColumns] = useState<ProcessColumn[]>(() => {
    // Initialize columns with forms distributed across them
    return defaultProcessColumns.map(column => ({
      ...column,
      forms: mockProcessForms.filter(form => {
        switch (column.id) {
          case "raw-milk-intake":
            return form.type === "Raw Milk Intake"
          case "standardizing":
            return form.type === "Standardizing"
          case "pasteurizing":
            return form.type === "Pasteurizing"
          case "filmatic-lines":
            return form.type === "Filmatic Lines"
          case "palletiser-sheet":
            return form.type === "Palletiser Sheet"
          case "process-log":
            return form.type === "Process Log"
          default:
            return false
        }
      })
    }))
  })

  const handleFormClick = (form: ProcessForm) => {
    console.log("Form clicked:", form)
    // Navigate to form detail or open modal
  }

  const handleFormCreate = (columnId: string) => {
    console.log("Create form for column:", columnId)
    // Navigate to form creation page
  }

  // Calculate stats
  const totalForms = mockProcessForms.length
  const activeForms = mockProcessForms.filter(f => f.status === "active").length
  const completedForms = mockProcessForms.filter(f => f.status === "completed").length
  const pendingForms = mockProcessForms.filter(f => f.status === "pending").length

  return (
    <DataCaptureDashboardLayout title="Process Dashboard" subtitle="Milk production process management">
      <div className="h-full max-h-[calc(100vh-8rem)]">
        {/* Process Board */}
        <ProcessBoard
          columns={processColumns}
          onFormClick={handleFormClick}
          onFormCreate={handleFormCreate}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
