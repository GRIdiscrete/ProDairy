"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  FileText,
  Edit,
  Eye,
  ArrowRight,
  ArrowLeft
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { FormData } from "./forms-dashboard"

export interface FormStep {
  id: string
  title: string
  description: string
  status: "pending" | "active" | "completed" | "error"
  fields: FormField[]
  isRequired: boolean
  estimatedTime?: string
}

export interface FormField {
  id: string
  label: string
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "date" | "time" | "array"
  value: any
  required?: boolean
  options?: { label: string; value: string }[]
  placeholder?: string
  description?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  arrayFields?: FormField[]
}

interface DynamicFormViewerProps {
  form: FormData
  steps: FormStep[]
  onSave?: (formData: FormData, stepData: FormStep[]) => void
  onComplete?: (formData: FormData) => void
  onCancel?: () => void
  mode?: "view" | "edit"
  className?: string
}

export function DynamicFormViewer({
  form,
  steps,
  onSave,
  onComplete,
  onCancel,
  mode = "view",
  className
}: DynamicFormViewerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formSteps, setFormSteps] = useState<FormStep[]>(steps)
  const [isSaving, setIsSaving] = useState(false)

  const currentStep = formSteps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / formSteps.length) * 100

  const handleFieldChange = (stepId: string, fieldId: string, value: any) => {
    setFormSteps(prev => prev.map(step => 
      step.id === stepId 
        ? {
            ...step,
            fields: step.fields.map(field =>
              field.id === fieldId ? { ...field, value } : field
            )
          }
        : step
    ))
  }

  const handleArrayFieldChange = (stepId: string, fieldId: string, index: number, subFieldId: string, value: any) => {
    setFormSteps(prev => prev.map(step => 
      step.id === stepId 
        ? {
            ...step,
            fields: step.fields.map(field =>
              field.id === fieldId 
                ? {
                    ...field,
                    value: field.value.map((item: any, i: number) =>
                      i === index 
                        ? { ...item, [subFieldId]: value }
                        : item
                    )
                  }
                : field
            )
          }
        : step
    ))
  }

  const addArrayItem = (stepId: string, fieldId: string) => {
    setFormSteps(prev => prev.map(step => 
      step.id === stepId 
        ? {
            ...step,
            fields: step.fields.map(field =>
              field.id === fieldId 
                ? {
                    ...field,
                    value: [...field.value, {}]
                  }
                : field
            )
          }
        : step
    ))
  }

  const removeArrayItem = (stepId: string, fieldId: string, index: number) => {
    setFormSteps(prev => prev.map(step => 
      step.id === stepId 
        ? {
            ...step,
            fields: step.fields.map(field =>
              field.id === fieldId 
                ? {
                    ...field,
                    value: field.value.filter((_: any, i: number) => i !== index)
                  }
                : field
            )
          }
        : step
    ))
  }

  const handleNext = () => {
    if (currentStepIndex < formSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave?.(form, formSteps)
    } finally {
      setIsSaving(false)
    }
  }

  const handleComplete = async () => {
    setIsSaving(true)
    try {
      await onComplete?.(form)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusIcon = (status: FormStep["status"]) => {
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

  const getStatusBadge = (status: FormStep["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Form Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{form.title}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{form.operator}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{form.type}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(form.status)}
              {mode === "edit" && (
                <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {formSteps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {formSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      index === currentStepIndex && "bg-primary/10 text-primary",
                      index < currentStepIndex && "bg-green-50 text-green-700",
                      index > currentStepIndex && "bg-gray-50 text-gray-500"
                    )}
                    onClick={() => setCurrentStepIndex(index)}
                  >
                    {getStatusIcon(step.status)}
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                  {index < formSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentStepIndex === formSteps.length - 1}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {getStatusIcon(currentStep.status)}
                    <span>{currentStep.title}</span>
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">{currentStep.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(currentStep.status)}
                  {currentStep.estimatedTime && (
                    <Badge variant="outline">{currentStep.estimatedTime}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormStepContent
                step={currentStep}
                mode={mode}
                onFieldChange={handleFieldChange}
                onArrayFieldChange={handleArrayFieldChange}
                onAddArrayItem={addArrayItem}
                onRemoveArrayItem={removeArrayItem}
              />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex items-center space-x-2">
          {mode === "edit" && (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>
          )}
          {currentStepIndex === formSteps.length - 1 && (
            <Button onClick={handleComplete} disabled={isSaving}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Form
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface FormStepContentProps {
  step: FormStep
  mode: "view" | "edit"
  onFieldChange: (stepId: string, fieldId: string, value: any) => void
  onArrayFieldChange: (stepId: string, fieldId: string, index: number, subFieldId: string, value: any) => void
  onAddArrayItem: (stepId: string, fieldId: string) => void
  onRemoveArrayItem: (stepId: string, fieldId: string, index: number) => void
}

function FormStepContent({
  step,
  mode,
  onFieldChange,
  onArrayFieldChange,
  onAddArrayItem,
  onRemoveArrayItem
}: FormStepContentProps) {
  const renderField = (field: FormField) => {
    const isReadOnly = mode === "view"

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={field.value || ""}
            onChange={(e) => onFieldChange(step.id, field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border rounded-md"
          />
        )
      case "number":
        return (
          <input
            type="number"
            value={field.value || ""}
            onChange={(e) => onFieldChange(step.id, field.id, parseFloat(e.target.value))}
            placeholder={field.placeholder}
            disabled={isReadOnly}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full px-3 py-2 border rounded-md"
          />
        )
      case "textarea":
        return (
          <textarea
            value={field.value || ""}
            onChange={(e) => onFieldChange(step.id, field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={isReadOnly}
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
          />
        )
      case "select":
        return (
          <select
            value={field.value || ""}
            onChange={(e) => onFieldChange(step.id, field.id, e.target.value)}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={field.value || false}
            onChange={(e) => onFieldChange(step.id, field.id, e.target.checked)}
            disabled={isReadOnly}
            className="h-4 w-4"
          />
        )
      case "date":
        return (
          <input
            type="date"
            value={field.value || ""}
            onChange={(e) => onFieldChange(step.id, field.id, e.target.value)}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border rounded-md"
          />
        )
      case "time":
        return (
          <input
            type="time"
            value={field.value || ""}
            onChange={(e) => onFieldChange(step.id, field.id, e.target.value)}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border rounded-md"
          />
        )
      case "array":
        return (
          <div className="space-y-4">
            {field.value?.map((item: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {!isReadOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveArrayItem(step.id, field.id, index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {field.arrayFields?.map((subField) => (
                    <div key={subField.id} className="space-y-1">
                      <label className="text-sm font-medium">{subField.label}</label>
                      {renderField({
                        ...subField,
                        value: item[subField.id]
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!isReadOnly && (
              <Button
                variant="outline"
                onClick={() => onAddArrayItem(step.id, field.id)}
              >
                Add Item
              </Button>
            )}
          </div>
        )
      default:
        return <div>Unsupported field type</div>
    }
  }

  return (
    <div className="space-y-6">
      {step.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="text-sm font-medium flex items-center space-x-1">
            <span>{field.label}</span>
            {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}
