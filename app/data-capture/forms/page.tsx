"use client"

import React, { useState, useEffect } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { FormsDashboard, FormData } from "@/components/forms/forms-dashboard"
import { ProcessFlowVisualization, ProcessStep } from "@/components/forms/process-flow-visualization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Users,
  Calendar
} from "lucide-react"

// Mock data - replace with actual API calls
const mockForms: FormData[] = [
  {
    id: "1",
    type: "driver-form",
    title: "Morning Milk Collection - Route A",
    status: "completed",
    operator: "John Driver",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:30:00Z",
    processStep: "driver-form",
    priority: "high",
    description: "Collection from 15 farms in Route A"
  },
  {
    id: "2",
    type: "bmt-control-form",
    title: "BMT Transfer - Silo 1 to Silo 2",
    status: "completed",
    operator: "Sarah Intake",
    createdAt: "2024-01-15T08:30:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
    processStep: "raw-milk-intake",
    priority: "high",
    description: "Transfer of 5000L raw milk"
  },
  {
    id: "3",
    type: "lab-forms",
    title: "Quality Test - Batch #2024-001",
    status: "active",
    operator: "Mike Lab",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:15:00Z",
    processStep: "lab-tests",
    priority: "high",
    description: "Comprehensive quality testing"
  },
  {
    id: "4",
    type: "operator-forms",
    title: "Standardization Process",
    status: "pending",
    operator: "Lisa Operator",
    createdAt: "2024-01-15T09:30:00Z",
    updatedAt: "2024-01-15T09:30:00Z",
    processStep: "standardizing",
    priority: "medium",
    description: "Fat content adjustment to 3.2%"
  },
  {
    id: "5",
    type: "sterilised-milk-process",
    title: "Pasteurization - Line 1",
    status: "pending",
    operator: "Tom Process",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    processStep: "pasteurizing",
    priority: "high",
    description: "HTST pasteurization at 72°C"
  },
  {
    id: "6",
    type: "filler-log-2",
    title: "Filler Log - Packaging Line 2",
    status: "pending",
    operator: "Anna Pack",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    processStep: "filmatic-line",
    priority: "medium",
    description: "1L carton packaging"
  },
  {
    id: "7",
    type: "palletiser-sheet",
    title: "Palletizing - Final Stage",
    status: "pending",
    operator: "Bob Pallet",
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
    processStep: "palletizer",
    priority: "low",
    description: "Final packaging and palletizing"
  }
]

export default function FormsPage() {
  const [forms, setForms] = useState<FormData[]>(mockForms)
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Simulate loading forms
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setForms(mockForms)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleFormClick = (form: FormData) => {
    setSelectedForm(form)
    // Navigate to form detail or open modal
    console.log("Form clicked:", form)
  }

  const handleFormCreate = (formType: string) => {
    // Navigate to form creation page
    console.log("Create form:", formType)
    // You can implement navigation logic here
  }

  const handleFormEdit = (form: FormData) => {
    // Navigate to form edit page
    console.log("Edit form:", form)
  }

  const handleFormView = (form: FormData) => {
    // Open form view modal or navigate to view page
    console.log("View form:", form)
  }

  const activeForms = forms.filter(f => f.status === "active")
  const pendingForms = forms.filter(f => f.status === "pending")
  const completedForms = forms.filter(f => f.status === "completed")
  const errorForms = forms.filter(f => f.status === "error")

  return (
    <DataCaptureDashboardLayout title="Process Forms" subtitle="Dynamic, process-driven form management">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeForms.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingForms.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedForms.length}</div>
              <p className="text-xs text-muted-foreground">Finished</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">Accuracy rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Process Flow and Forms Dashboard */}
        <FormsDashboard
          forms={forms}
          onFormClick={handleFormClick}
          onFormCreate={handleFormCreate}
          onFormEdit={handleFormEdit}
          onFormView={handleFormView}
        />

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forms.slice(0, 5).map((form) => (
                <div key={form.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{form.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {form.operator} • {new Date(form.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      form.status === "completed" ? "default" : 
                      form.status === "active" ? "secondary" : 
                      form.status === "error" ? "destructive" : "outline"
                    }>
                      {form.status}
                    </Badge>
                    <Button  size="sm" onClick={() => handleFormView(form)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Process Efficiency Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Process Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4</div>
              <p className="text-xs text-muted-foreground">hours per batch</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Operators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forms Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.length}</div>
              <p className="text-xs text-muted-foreground">Total processed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DataCaptureDashboardLayout>
  )
}
