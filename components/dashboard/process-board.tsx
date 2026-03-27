"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  Droplets, 
  Beaker, 
  Thermometer, 
  Factory, 
  Package, 
  FileText,
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { KanbanSkeleton } from "@/components/ui/kanban-skeleton"

export interface ProcessForm {
  id: string
  title: string
  type: string
  status: "pending" | "active" | "completed" | "error"
  priority: "low" | "medium" | "high"
  operator: string
  createdAt: string
  updatedAt: string
  description?: string
  metadata?: Record<string, any>
}

export interface ProcessColumn {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  forms: ProcessForm[]
}

interface ProcessBoardProps {
  columns: ProcessColumn[]
  onFormClick?: (form: ProcessForm) => void
  onFormCreate?: (columnId: string) => void
  className?: string
  loading?: boolean
}

export function ProcessBoard({ 
  columns, 
  onFormClick, 
  onFormCreate,
  className,
  loading = false
}: ProcessBoardProps) {
  const [draggedForm, setDraggedForm] = useState<ProcessForm | null>(null)
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null)

  const getStatusIcon = (status: ProcessForm["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "active":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ProcessForm["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Completed</Badge>
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Active</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Error</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Pending</Badge>
    }
  }

  const getPriorityBadge = (priority: ProcessForm["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Medium</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">Low</Badge>
    }
  }

  const handleDragStart = (form: ProcessForm, columnId: string) => {
    setDraggedForm(form)
    setDraggedFromColumn(columnId)
  }

  const handleDragEnd = () => {
    setDraggedForm(null)
    setDraggedFromColumn(null)
  }

  if (loading) {
    return (
      <KanbanSkeleton 
        columns={columns.length} 
        cardsPerColumn={3}
        className={className}
      />
    )
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <div className="flex space-x-4 overflow-x-auto pb-4 h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {columns.map((column) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 w-80"
          >
            <div className="h-full border border-gray-200 rounded-lg">
              <CardHeader className={cn("pb-3", column.bgColor)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", column.color)}>
                      <column.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{column.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {column.forms.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFormCreate?.(column.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {column.forms.map((form) => (
                        <motion.div
                          key={form.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          draggable
                          onDragStart={() => handleDragStart(form, column.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-all duration-200",
                            "hover:shadow-md hover:border-primary/50",
                            "bg-white border-gray-200"
                          )}
                          onClick={() => onFormClick?.(form)}
                        >
                          <div className="space-y-3">
                            {/* Form Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {form.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {form.type}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {getStatusIcon(form.status)}
                              </div>
                            </div>

                            {/* Form Description */}
                            {form.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {form.description}
                              </p>
                            )}

                            {/* Status and Priority Badges */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                {getStatusBadge(form.status)}
                                {getPriorityBadge(form.priority)}
                              </div>
                            </div>

                            {/* Form Metadata */}
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", column.color)}>
                                  <User className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span className="truncate">{form.operator}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", column.color)}>
                                  <Calendar className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onFormClick?.(form)
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle edit
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {column.forms.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <column.icon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No forms in this stage</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFormCreate?.(column.id)}
                          className="mt-2"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Form
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Default process columns for milk production
export const defaultProcessColumns: ProcessColumn[] = [
  {
    id: "raw-milk-intake",
    title: "Raw Milk Intake",
    description: "Initial milk collection and quality assessment",
    icon: Droplets,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    forms: []
  },
  {
    id: "standardizing",
    title: "Standardizing",
    description: "Fat content adjustment and standardization",
    icon: Beaker,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    forms: []
  },
  {
    id: "pasteurizing",
    title: "Pasteurizing",
    description: "Heat treatment and pasteurization process",
    icon: Thermometer,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    forms: []
  },
  {
    id: "filmatic-lines",
    title: "Filmatic Lines",
    description: "Packaging preparation and filling",
    icon: Factory,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    forms: []
  },
  {
    id: "palletiser-sheet",
    title: "Palletiser Sheet",
    description: "Final packaging and palletizing",
    icon: Package,
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    forms: []
  },
  {
    id: "process-log",
    title: "Process Log",
    description: "Final documentation and logging",
    icon: FileText,
    color: "bg-gray-500",
    bgColor: "bg-gray-50",
    forms: []
  }
]
