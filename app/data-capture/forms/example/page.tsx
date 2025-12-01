"use client"

import React, { useState } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { FormsDashboard, FormData } from "@/components/forms/forms-dashboard"
import { DynamicFormViewer, FormStep, FormField } from "@/components/forms/dynamic-form-viewer"
import { FormStatusTracker } from "@/components/forms/form-status-tracker"
import { FormPermissions, User, FormPermission } from "@/components/forms/form-permissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Workflow, 
  BarChart3, 
  Shield, 
  Eye,
  Edit,
  Settings
} from "lucide-react"

// Mock data for demonstration
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

const mockFormSteps: FormStep[] = [
  {
    id: "step1",
    title: "Collection Details",
    description: "Record milk collection information",
    status: "completed",
    fields: [
      {
        id: "collection_time",
        label: "Collection Time",
        type: "time",
        value: "08:00",
        required: true
      },
      {
        id: "route",
        label: "Collection Route",
        type: "select",
        value: "Route A",
        required: true,
        options: [
          { label: "Route A", value: "Route A" },
          { label: "Route B", value: "Route B" },
          { label: "Route C", value: "Route C" }
        ]
      },
      {
        id: "farms_visited",
        label: "Farms Visited",
        type: "number",
        value: 15,
        required: true,
        validation: { min: 1, max: 50 }
      }
    ],
    isRequired: true
  },
  {
    id: "step2",
    title: "Quality Assessment",
    description: "Initial quality checks",
    status: "active",
    fields: [
      {
        id: "temperature",
        label: "Milk Temperature (°C)",
        type: "number",
        value: 4.2,
        required: true,
        validation: { min: 0, max: 10 }
      },
      {
        id: "ph_level",
        label: "pH Level",
        type: "number",
        value: 6.7,
        required: true,
        validation: { min: 6.0, max: 7.0 }
      },
      {
        id: "visual_check",
        label: "Visual Quality Check",
        type: "select",
        value: "Good",
        required: true,
        options: [
          { label: "Excellent", value: "Excellent" },
          { label: "Good", value: "Good" },
          { label: "Fair", value: "Fair" },
          { label: "Poor", value: "Poor" }
        ]
      }
    ],
    isRequired: true
  },
  {
    id: "step3",
    title: "Volume & Weight",
    description: "Record collected volumes",
    status: "pending",
    fields: [
      {
        id: "total_volume",
        label: "Total Volume (Liters)",
        type: "number",
        value: 2500,
        required: true,
        validation: { min: 0 }
      },
      {
        id: "weight_measurements",
        label: "Weight Measurements",
        type: "array",
        value: [
          { weight: 1250, time: "08:15" },
          { weight: 1250, time: "08:30" }
        ],
        required: true,
        arrayFields: [
          {
            id: "weight",
            label: "Weight (kg)",
            type: "number",
            value: 1250,
            required: true
          },
          {
            id: "time",
            label: "Time",
            type: "time",
            value: "08:15",
            required: true
          }
        ]
      }
    ],
    isRequired: true
  }
]

const mockUser: User = {
  id: "user1",
  name: "John Driver",
  email: "john.driver@prodairy.co.zw",
  role: "Driver",
  department: "Logistics",
  permissions: ["view_forms", "edit_own_forms", "create_forms"]
}

const mockPermissions: FormPermission[] = [
  {
    id: "perm1",
    formType: "driver-form",
    role: "Driver",
    permissions: {
      view: true,
      edit: true,
      delete: false,
      approve: false,
      create: true
    }
  },
  {
    id: "perm2",
    formType: "lab-forms",
    role: "Driver",
    permissions: {
      view: true,
      edit: false,
      delete: false,
      approve: false,
      create: false
    }
  }
]

export default function FormsExamplePage() {
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleFormClick = (form: FormData) => {
    setSelectedForm(form)
    setActiveTab("viewer")
  }

  const handleFormCreate = (formType: string) => {
    console.log("Create form:", formType)
  }

  const handleFormEdit = (form: FormData) => {
    console.log("Edit form:", form)
  }

  const handleFormView = (form: FormData) => {
    setSelectedForm(form)
    setActiveTab("viewer")
  }

  const handleFormSave = async (formData: FormData, stepData: FormStep[]) => {
    console.log("Save form:", formData, stepData)
  }

  const handleFormComplete = async (formData: FormData) => {
    console.log("Complete form:", formData)
  }

  return (
    <DataCaptureDashboardLayout title="Process Forms Example" subtitle="Complete demonstration of the dynamic forms system">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Process Forms System</h1>
            <p className="text-muted-foreground">Dynamic, process-driven form management for milk production</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800">Live Demo</Badge>
            <Badge variant="outline">v2.0</Badge>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Workflow className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="viewer" className="flex items-center space-x-2" disabled={!selectedForm}>
              <Eye className="h-4 w-4" />
              <span>Form Viewer</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <FormsDashboard
              forms={mockForms}
              onFormClick={handleFormClick}
              onFormCreate={handleFormCreate}
              onFormEdit={handleFormEdit}
              onFormView={handleFormView}
            />
          </TabsContent>

          <TabsContent value="viewer" className="mt-6">
            {selectedForm ? (
              <DynamicFormViewer
                form={selectedForm}
                steps={mockFormSteps}
                onSave={handleFormSave}
                onComplete={handleFormComplete}
                onCancel={() => setActiveTab("dashboard")}
                mode="edit"
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Form Selected</h3>
                  <p className="text-gray-500">Select a form from the dashboard to view its details.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <FormStatusTracker forms={mockForms} />
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <FormPermissions
              forms={mockForms}
              currentUser={mockUser}
              permissions={mockPermissions}
            />
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Workflow className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium">Process Flow Visualization</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Visual workflow showing milk processing steps from collection to packaging with real-time status updates.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Edit className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium">Dynamic Form Builder</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Step-by-step form interface with dynamic fields, validation, and array support for complex data entry.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium">Role-Based Permissions</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Granular access control ensuring users only see and can modify forms they have permission for.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DataCaptureDashboardLayout>
  )
}
