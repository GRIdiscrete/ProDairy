"use client"

import { useState, useCallback } from "react"
import { useForm, Controller, FormProvider } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Save } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'datetime-local' | 'select' | 'textarea' | 'checkbox'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  validation?: any
  description?: string
  colSpan?: 1 | 2 | 3 | 4 // For grid layout
}

export interface FormStep {
  id: string
  title: string
  description?: string
  fields: StepField[]
}

interface StepperFormProps {
  steps: FormStep[]
  validationSchema: any
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  initialData?: any
  loading?: boolean
  submitText?: string
  cancelText?: string
  className?: string
}

export function StepperForm({
  steps,
  validationSchema,
  onSubmit,
  onCancel,
  initialData = {},
  loading = false,
  submitText = "Submit",
  cancelText = "Cancel",
  className
}: StepperFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialData,
    mode: 'onChange'
  })

  const { handleSubmit, formState: { errors, isValid }, watch, trigger } = methods

  const currentStepData = steps[currentStep]
  const totalSteps = steps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  // Validate current step
  const validateCurrentStep = useCallback(async () => {
    const currentStepFields = currentStepData.fields.map(field => field.name)
    const isStepValid = await trigger(currentStepFields)
    
    if (isStepValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
    }
    
    return isStepValid
  }, [currentStep, currentStepData.fields, trigger])

  const goToNextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = async (stepIndex: number) => {
    // Allow going back to any step, but validate when going forward
    if (stepIndex < currentStep || await validateCurrentStep()) {
      setCurrentStep(stepIndex)
    }
  }

  const onFormSubmit = async (data: any) => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      await onSubmit(data)
    }
  }

  // Helper function to get field error
  const getFieldError = (fieldName: string) => {
    return errors[fieldName]?.message as string
  }

  // Helper function to render field
  const renderField = (field: StepField) => {
    const hasError = !!errors[field.name]
    const errorMessage = getFieldError(field.name)

    const fieldContent = (
      <Controller
        name={field.name}
        control={methods.control}
        render={({ field: { onChange, value, ...fieldProps } }) => {
          const commonProps = {
            ...fieldProps,
            value: value || '',
            onChange,
            placeholder: field.placeholder,
            className: cn(
              "w-full",
              hasError && "border-red-500 focus:border-red-500"
            )
          }

          switch (field.type) {
            case 'select':
              return (
                <select {...commonProps} className={cn(commonProps.className, "px-3 py-2 border rounded-md")}>
                  <option value="">{field.placeholder || `Select ${field.label}`}</option>
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )
            case 'textarea':
              return (
                <textarea 
                  {...commonProps} 
                  rows={3}
                  className={cn(commonProps.className, "px-3 py-2 border rounded-md resize-vertical")}
                />
              )
            case 'checkbox':
              return (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...fieldProps}
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm">{field.label}</span>
                </div>
              )
            default:
              return (
                <input
                  type={field.type}
                  {...commonProps}
                  className={cn(commonProps.className, "px-3 py-2 border rounded-md")}
                />
              )
          }
        }}
      />
    )

    return (
      <div 
        key={field.name} 
        className={cn(
          "space-y-2",
          field.colSpan === 2 && "col-span-2",
          field.colSpan === 3 && "col-span-3",
          field.colSpan === 4 && "col-span-4"
        )}
      >
        {field.type !== 'checkbox' && (
          <label className="text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {fieldContent}
        {field.description && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}
        {hasError && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className={cn("space-y-6", className)}>
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Step {currentStep + 1} of {totalSteps}</h2>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index)
            const isCurrent = index === currentStep
            const isPast = index < currentStep

            return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={loading}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isCurrent
                      ? "border-primary bg-primary text-white"
                      : isCompleted || isPast
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-500"
                  )}
                >
                  {isCompleted || isPast ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                {index < totalSteps - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-2",
                    isPast || isCompleted ? "bg-green-500" : "bg-gray-300"
                  )} />
                )}
              </div>
            )
          })}
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentStepData.title}</span>
              <Badge variant="outline">{currentStep + 1}/{totalSteps}</Badge>
            </CardTitle>
            {currentStepData.description && (
              <p className="text-sm text-gray-600">{currentStepData.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentStepData.fields.map(renderField)}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 0 ? onCancel : goToPrevStep}
                  disabled={loading}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentStep === 0 ? cancelText : "Previous"}
                </Button>

                <div className="flex items-center space-x-2">
                  {currentStep === totalSteps - 1 ? (
                    <Button
                      type="submit"
                      disabled={loading || !isValid}
                      className="flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Saving..." : submitText}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={goToNextStep}
                      disabled={loading}
                      className="flex items-center"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  )
}
