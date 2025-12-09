"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  FileText,
  TrendingUp,
  Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProcessFlowVisualization, ProcessStep, defaultMilkProcessSteps } from "./process-flow-visualization"

export interface FormData {
  id: string
  type: string
  title: string
  status: "pending" | "active" | "completed" | "error"
  operator: string
  createdAt: string
  updatedAt: string
  processStep: string
  priority: "low" | "medium" | "high"
  description?: string
  metadata?: Record<string, any>
}

interface FormsDashboardProps {
  forms: FormData[]
  onFormClick?: (form: FormData) => void
  onFormCreate?: (formType: string) => void
  onFormEdit?: (form: FormData) => void
  onFormView?: (form: FormData) => void
  className?: string
}

const formTypeConfig = {
  "driver-form": {
    name: "Driver Form",
    description: "Milk collection and delivery forms",
    color: "bg-green-100 text-green-800",
    icon: "🚛"
  },
  "bmt-control-form": {
    name: "BMT Control",
    description: "Bulk milk transfer control",
    color: "bg-blue-100 text-blue-800",
    icon: "🥛"
  },
  "lab-forms": {
    name: "Lab Tests",
    description: "Laboratory test forms",
    color: "bg-blue-100 text-blue-800",
    icon: "🧪"
  },
  "operator-forms": {
    name: "Operator Forms",
    description: "Production operator forms",
    color: "bg-orange-100 text-orange-800",
    icon: "👷"
  },
  "sterilised-milk-process": {
    name: "Sterilization",
    description: "Milk sterilization process",
    color: "bg-red-100 text-red-800",
    icon: "🔥"
  },
  "filler-log-2": {
    name: "Filler Log",
    description: "Packaging filler logs",
    color: "bg-cyan-100 text-cyan-800",
    icon: "📦"
  },
  "palletiser-sheet": {
    name: "Palletizer",
    description: "Palletizing operations",
    color: "bg-blue-100 text-blue-800",
    icon: "🏭"
  }
}

export function FormsDashboard({ 
  forms, 
  onFormClick, 
  onFormCreate, 
  onFormEdit, 
  onFormView,
  className 
}: FormsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("active")
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(defaultMilkProcessSteps)

  // Update process steps based on forms data
  useEffect(() => {
    const updatedSteps = processSteps.map(step => {
      const relatedForms = forms.filter(form => form.processStep === step.id)
      const hasActiveForm = relatedForms.some(form => form.status === "active")
      const hasCompletedForm = relatedForms.some(form => form.status === "completed")
      const hasErrorForm = relatedForms.some(form => form.status === "error")

      let status: ProcessStep["status"] = "pending"
      if (hasErrorForm) status = "error"
      else if (hasActiveForm) status = "active"
      else if (hasCompletedForm) status = "completed"

      return {
        ...step,
        status,
        timestamp: relatedForms.find(f => f.status === "active" || f.status === "completed")?.updatedAt
      }
    })
    setProcessSteps(updatedSteps)
  }, [forms])

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.operator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || form.status === statusFilter
    const matchesType = typeFilter === "all" || form.type === typeFilter
    const matchesPriority = priorityFilter === "all" || form.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const getStatusBadge = (status: FormData["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>
      default:
        return <Badge >Pending</Badge>
    }
  }

  const getPriorityBadge = (priority: FormData["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Low</Badge>
    }
  }

  const getFormTypeConfig = (type: string) => {
    return formTypeConfig[type as keyof typeof formTypeConfig] || {
      name: type,
      description: "Form type",
      color: "bg-gray-100 text-gray-800",
      icon: "📄"
    }
  }

  const activeForms = filteredForms.filter(f => f.status === "active")
  const pendingForms = filteredForms.filter(f => f.status === "pending")
  const completedForms = filteredForms.filter(f => f.status === "completed")
  const errorForms = filteredForms.filter(f => f.status === "error")

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Stats */}
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
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorForms.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Process Flow Visualization */}
      <ProcessFlowVisualization 
        steps={processSteps}
        onStepClick={(step) => {
          const relatedForm = forms.find(f => f.processStep === step.id && f.status === "active")
          if (relatedForm) {
            onFormClick?.(relatedForm)
          }
        }}
      />

      {/* Forms Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Forms Management</CardTitle>
            <Button onClick={() => onFormCreate?.("driver-form")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(formTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Forms Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active">Active ({activeForms.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingForms.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedForms.length})</TabsTrigger>
              <TabsTrigger value="error">Issues ({errorForms.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <FormList 
                forms={activeForms} 
                onFormClick={onFormClick}
                onFormEdit={onFormEdit}
                onFormView={onFormView}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                getFormTypeConfig={getFormTypeConfig}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <FormList 
                forms={pendingForms} 
                onFormClick={onFormClick}
                onFormEdit={onFormEdit}
                onFormView={onFormView}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                getFormTypeConfig={getFormTypeConfig}
              />
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <FormList 
                forms={completedForms} 
                onFormClick={onFormClick}
                onFormEdit={onFormEdit}
                onFormView={onFormView}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                getFormTypeConfig={getFormTypeConfig}
              />
            </TabsContent>

            <TabsContent value="error" className="mt-6">
              <FormList 
                forms={errorForms} 
                onFormClick={onFormClick}
                onFormEdit={onFormEdit}
                onFormView={onFormView}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                getFormTypeConfig={getFormTypeConfig}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface FormListProps {
  forms: FormData[]
  onFormClick?: (form: FormData) => void
  onFormEdit?: (form: FormData) => void
  onFormView?: (form: FormData) => void
  getStatusBadge: (status: FormData["status"]) => React.ReactNode
  getPriorityBadge: (priority: FormData["priority"]) => React.ReactNode
  getFormTypeConfig: (type: string) => any
}

function FormList({ 
  forms, 
  onFormClick, 
  onFormEdit, 
  onFormView,
  getStatusBadge,
  getPriorityBadge,
  getFormTypeConfig
}: FormListProps) {
  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
        <p className="text-gray-500">No forms match your current filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {forms.map((form, index) => (
          <motion.div
            key={form.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onFormClick?.(form)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {getFormTypeConfig(form.type).icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">{form.title}</h4>
                    {getStatusBadge(form.status)}
                    {getPriorityBadge(form.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {getFormTypeConfig(form.type).description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{form.operator}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFormView?.(form)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFormEdit?.(form)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
