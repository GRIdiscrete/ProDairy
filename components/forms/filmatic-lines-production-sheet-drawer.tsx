"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { 
  Plus, 
  Trash2, 
  Package, 
  Factory,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Droplets,
  Beaker,
  FlaskConical,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Circle,
  FileText
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createFilmaticLinesProductionSheet, 
  updateFilmaticLinesProductionSheet
} from "@/lib/store/slices/filmaticLinesProductionSheetSlice"
import { 
  fetchStandardizingForms 
} from "@/lib/store/slices/standardizingSlice"
import { 
  fetchRoles 
} from "@/lib/store/slices/rolesSlice"
import { FilmaticLinesProductionSheet, CreateFilmaticLinesProductionSheetRequest } from "@/lib/api/filmatic-lines"
import { toast } from "sonner"

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Beaker className="w-4 h-4 text-orange-600" />
        </div>
        <span className="text-sm font-light">Pasturizing</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Factory className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-600">Filmatic Lines</span>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Package className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Paletizer</span>
      </div>
    </div>
  </div>
)

// Step Navigation Component
const StepNavigation = ({ currentStep, onStepChange }: { currentStep: number, onStepChange: (step: number) => void }) => {
  const steps = [
    { id: 1, title: "Basic Information", icon: FileText, description: "Sheet details and approval" },
    { id: 2, title: "Production Details", icon: Factory, description: "Production information" },
    { id: 3, title: "Reconciliation", icon: FlaskConical, description: "Bottles and milk reconciliation" },
    { id: 4, title: "Stoppage & Quality", icon: AlertTriangle, description: "Stoppage and quality metrics" },
    { id: 5, title: "Review & Submit", icon: CheckCircle, description: "Review and finalize" }
  ]

  return (
    <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-light text-gray-900 mb-6">Filmatic Lines Process Steps</h3>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isUpcoming = currentStep < step.id

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className="flex items-center">
                {/* Connector line */}
                {index > 0 && (
                  <div className={`h-0.5 w-12 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
                
                {/* Step circle */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                    isCurrent ? 'bg-blue-500 border-blue-500 text-white' : 
                    'bg-white border-gray-300 text-gray-400'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
              </div>
              
              {/* Step info */}
              <div className="mt-3 text-center">
                <h4 className={`text-sm font-medium ${
                  isCurrent ? 'text-blue-600' : 
                  isCompleted ? 'text-green-600' : 
                  'text-gray-500'
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                {isCurrent && (
                  <div className="mt-2">
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Current Step
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Form Schema
const filmaticLinesProductionSheetSchema = yup.object({
  approved_by: yup.string().required("Approved by is required"),
  date: yup.string().required("Date is required"),
  shift: yup.string().required("Shift is required"),
  product: yup.string().required("Product is required"),
  details: yup.string().optional(),
  bottles_reconciliation: yup.string().optional(),
  stoppage: yup.string().optional(),
  milk_reconciliation: yup.string().optional(),
})

type FilmaticLinesProductionSheetData = yup.InferType<typeof filmaticLinesProductionSheetSchema>

interface FilmaticLinesProductionSheetDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheet?: FilmaticLinesProductionSheet | null
  mode: "create" | "edit"
}

export function FilmaticLinesProductionSheetDrawer({ 
  open, 
  onOpenChange, 
  sheet, 
  mode = "create" 
}: FilmaticLinesProductionSheetDrawerProps) {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.filmaticLinesProductionSheets)
  const { forms: standardizingForms } = useAppSelector((state) => state.standardizing)
  const { roles } = useAppSelector((state) => state.roles)

  const [loadingStandardizingForms, setLoadingStandardizingForms] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Single form for all data
  const formHook = useForm<FilmaticLinesProductionSheetData>({
    resolver: yupResolver(filmaticLinesProductionSheetSchema),
    defaultValues: {
      approved_by: "",
      date: "",
      shift: "",
      product: "",
      details: "",
      bottles_reconciliation: "",
      stoppage: "",
      milk_reconciliation: "",
    },
  })

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingStandardizingForms(true)
      
      // Load standardizing forms to show process flow
      if (standardizingForms.length === 0) {
        await dispatch(fetchStandardizingForms())
      }
      
      // Load roles for the searchable select
      if (roles.length === 0) {
        await dispatch(fetchRoles({}))
      }
    } catch (error) {
      console.error("Failed to load initial data:", error)
      toast.error("Failed to load form data")
    } finally {
      setLoadingStandardizingForms(false)
    }
  }

  // Load data when drawer opens
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open, dispatch, standardizingForms.length])

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && sheet) {
        formHook.reset({
          approved_by: sheet.approved_by,
          date: sheet.date,
          shift: sheet.shift,
          product: sheet.product,
          details: sheet.details || "",
          bottles_reconciliation: sheet.bottles_reconciliation || "",
          stoppage: sheet.stoppage || "",
          milk_reconciliation: sheet.milk_reconciliation || "",
        })
      } else {
        formHook.reset({
          approved_by: "",
          date: "",
          shift: "",
          product: "",
          details: "",
          bottles_reconciliation: "",
          stoppage: "",
          milk_reconciliation: "",
        })
      }
    }
  }, [open, mode, sheet])

  const handleSubmit = async (data: FilmaticLinesProductionSheetData) => {
    try {
      const formData: CreateFilmaticLinesProductionSheetRequest = {
        approved_by: data.approved_by,
        date: data.date,
        shift: data.shift,
        product: data.product,
      }

      if (mode === "edit" && sheet) {
        await dispatch(updateFilmaticLinesProductionSheet({
          id: sheet.id,
          ...formData,
        })).unwrap()
        toast.success("Production sheet updated successfully")
      } else {
        await dispatch(createFilmaticLinesProductionSheet(formData)).unwrap()
        toast.success("Production sheet created successfully")
      }

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to save production sheet")
    }
  }

  const renderForm = () => {
    // Convert roles to searchable select options
    const roleOptions: SearchableSelectOption[] = roles.map(role => ({
      value: role.id,
      label: role.role_name,
      description: `Role ID: ${role.id.slice(0, 8)}`
    }))

    return (
      <div className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Basic Information</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter the basic Filmatic lines production sheet details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="approved_by">Approved By *</Label>
                <Controller
                  name="approved_by"
                  control={formHook.control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={roleOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select approver role..."
                      searchPlaceholder="Search roles..."
                      emptyMessage="No roles found"
                      loading={loadingStandardizingForms}
                    />
                  )}
                />
                {formHook.formState.errors.approved_by && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.approved_by.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Controller
                  name="date"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="date"
                      type="date"
                      {...field}
                    />
                  )}
                />
                {formHook.formState.errors.date && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift">Shift *</Label>
                <Controller
                  name="shift"
                  control={formHook.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 border border-gray-300 hover:border-gray-400 focus:border-blue-500 shadow-none hover:shadow-none focus:shadow-none rounded-full">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning Shift">Morning Shift</SelectItem>
                        <SelectItem value="Afternoon Shift">Afternoon Shift</SelectItem>
                        <SelectItem value="Night Shift">Night Shift</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {formHook.formState.errors.shift && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.shift.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Controller
                  name="product"
                  control={formHook.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 border border-gray-300 hover:border-gray-400 focus:border-blue-500 shadow-none hover:shadow-none focus:shadow-none rounded-full">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BIM Milk">BIM Milk</SelectItem>
                        <SelectItem value="UHT Milk">UHT Milk</SelectItem>
                        <SelectItem value="Fresh Milk">Fresh Milk</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {formHook.formState.errors.product && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.product.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Production Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Production Details</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter production information and details</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="details">Production Details</Label>
                <Controller
                  name="details"
                  control={formHook.control}
                  render={({ field }) => (
                    <Textarea
                      id="details"
                      placeholder="Enter production details..."
                      rows={4}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Reconciliation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Reconciliation</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter bottles and milk reconciliation information</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bottles_reconciliation">Bottles Reconciliation</Label>
                <Controller
                  name="bottles_reconciliation"
                  control={formHook.control}
                  render={({ field }) => (
                    <Textarea
                      id="bottles_reconciliation"
                      placeholder="Enter bottles reconciliation details..."
                      rows={3}
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="milk_reconciliation">Milk Reconciliation</Label>
                <Controller
                  name="milk_reconciliation"
                  control={formHook.control}
                  render={({ field }) => (
                    <Textarea
                      id="milk_reconciliation"
                      placeholder="Enter milk reconciliation details..."
                      rows={3}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Stoppage & Quality */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Stoppage & Quality</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter stoppage information and quality metrics</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stoppage">Stoppage Information</Label>
                <Controller
                  name="stoppage"
                  control={formHook.control}
                  render={({ field }) => (
                    <Textarea
                      id="stoppage"
                      placeholder="Enter stoppage information..."
                      rows={4}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Review & Submit</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Review all information before submitting</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Form Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Approved By:</p>
                    <p className="font-medium">{formHook.watch('approved_by') || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date:</p>
                    <p className="font-medium">{formHook.watch('date') || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shift:</p>
                    <p className="font-medium">{formHook.watch('shift') || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Product:</p>
                    <p className="font-medium">{formHook.watch('product') || 'Not selected'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[75vw] sm:max-w-[75vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-lg font-light">
            {mode === "edit" ? "Edit Filmatic Lines Production Sheet" : "Create Filmatic Lines Production Sheet"}
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Enter all Filmatic lines production sheet details including production information and reconciliation data
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={formHook.handleSubmit(handleSubmit)}>
            <div className="p-6">
              <ProcessOverview />
              <StepNavigation currentStep={currentStep} onStepChange={setCurrentStep} />
              {renderForm()}
            </div>
            
            <div className="flex items-center justify-between p-6 border-t">
              <div className="flex items-center space-x-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading.create || loading.update}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {mode === "edit" ? "Update Sheet" : "Create Sheet"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}