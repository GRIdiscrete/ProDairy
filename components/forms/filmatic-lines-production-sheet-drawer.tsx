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
  updateFilmaticLinesProductionSheet,
  fetchFilmaticLinesProductionSheets
} from "@/lib/store/slices/filmaticLinesProductionSheetSlice"
import { filmaticLinesApi } from "@/lib/api/filmatic-lines"
import { 
  fetchStandardizingForms 
} from "@/lib/store/slices/standardizingSlice"
import { 
  fetchRoles 
} from "@/lib/store/slices/rolesSlice"
import { 
  FilmaticLinesProductionSheet, 
  CreateFilmaticLinesProductionSheetRequest,
  CreateFilmaticLinesProductionSheetDetailRequest,
  CreateFilmaticLinesBottlesReconciliationRequest,
  CreateFilmaticLinesMilkReconciliationRequest,
  CreateFilmaticLinesStoppageTimeMinutesRequest
} from "@/lib/api/filmatic-lines"
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

// Form Schema - All fields optional for step-by-step validation
const filmaticLinesProductionSheetSchema = yup.object({
  // Step 1: Basic Information
  approved_by: yup.string().required("Approved by is required"),
  date: yup.string().required("Date is required"),
  shift: yup.string().required("Shift is required"),
  product: yup.string().required("Product is required"),
  
  // Step 2: Production Details
  day_shift_hours: yup.string().optional(),
  no_of_pallets: yup.number().optional().min(0, "Must be positive"),
  hourly_target: yup.number().optional().min(0, "Must be positive"),
  variance: yup.number().optional(),
  reason_for_variance: yup.string().optional(),
  
  // Step 3: Bottles Reconciliation
  bottles_shift: yup.string().optional(),
  bottles_opening: yup.number().optional().min(0, "Must be positive"),
  bottles_added: yup.number().optional().min(0, "Must be positive"),
  bottles_closing: yup.number().optional().min(0, "Must be positive"),
  bottles_wastes: yup.number().optional().min(0, "Must be positive"),
  bottles_damages: yup.number().optional().min(0, "Must be positive"),
  
  // Step 4: Milk Reconciliation
  milk_shift: yup.string().optional(),
  milk_opening: yup.number().optional().min(0, "Must be positive"),
  milk_added: yup.number().optional().min(0, "Must be positive"),
  milk_closing: yup.number().optional().min(0, "Must be positive"),
  milk_total: yup.number().optional().min(0, "Must be positive"),
  milk_transfer: yup.number().optional().min(0, "Must be positive"),
  
  // Step 5: Stoppage Time
  product_1: yup.number().optional().min(0, "Must be positive"),
  product_2: yup.number().optional().min(0, "Must be positive"),
  filler_1: yup.number().optional().min(0, "Must be positive"),
  filler_2: yup.number().optional().min(0, "Must be positive"),
  capper_1: yup.number().optional().min(0, "Must be positive"),
  capper_2: yup.number().optional().min(0, "Must be positive"),
  sleever_1: yup.number().optional().min(0, "Must be positive"),
  sleever_2: yup.number().optional().min(0, "Must be positive"),
  shrink_1: yup.number().optional().min(0, "Must be positive"),
  shrink_2: yup.number().optional().min(0, "Must be positive"),
}).required()

interface FilmaticLinesProductionSheetData {
  // Step 1: Basic Information
  approved_by: string
  date: string
  shift: string
  product: string
  
  // Step 2: Production Details
  day_shift_hours?: string
  no_of_pallets?: number
  hourly_target?: number
  variance?: number
  reason_for_variance?: string
  
  // Step 3: Bottles Reconciliation
  bottles_shift?: string
  bottles_opening?: number
  bottles_added?: number
  bottles_closing?: number
  bottles_wastes?: number
  bottles_damages?: number
  
  // Step 4: Milk Reconciliation
  milk_shift?: string
  milk_opening?: number
  milk_added?: number
  milk_closing?: number
  milk_total?: number
  milk_transfer?: number
  
  // Step 5: Stoppage Time
  product_1?: number
  product_2?: number
  filler_1?: number
  filler_2?: number
  capper_1?: number
  capper_2?: number
  sleever_1?: number
  sleever_2?: number
  shrink_1?: number
  shrink_2?: number
}

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
  const [createdSheetId, setCreatedSheetId] = useState<string | null>(null)
  const [createdDetailId, setCreatedDetailId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Single form for all data
  const formHook = useForm<FilmaticLinesProductionSheetData>({
    // resolver: yupResolver(filmaticLinesProductionSheetSchema),
    defaultValues: {
      // Step 1: Basic Information
      approved_by: "",
      date: "",
      shift: "",
      product: "",
      
      // Step 2: Production Details
      day_shift_hours: "",
      no_of_pallets: 0,
      hourly_target: 0,
      variance: 0,
      reason_for_variance: "",
      
      // Step 3: Bottles Reconciliation
      bottles_shift: "",
      bottles_opening: 0,
      bottles_added: 0,
      bottles_closing: 0,
      bottles_wastes: 0,
      bottles_damages: 0,
      
      // Step 4: Milk Reconciliation
      milk_shift: "",
      milk_opening: 0,
      milk_added: 0,
      milk_closing: 0,
      milk_total: 0,
      milk_transfer: 0,
      
      // Step 5: Stoppage Time
      product_1: 0,
      product_2: 0,
      filler_1: 0,
      filler_2: 0,
      capper_1: 0,
      capper_2: 0,
      sleever_1: 0,
      sleever_2: 0,
      shrink_1: 0,
      shrink_2: 0,
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
      setCurrentStep(1)
      setCreatedSheetId(null)
      setCreatedDetailId(null)
      setIsSubmitting(false)
      
      if (mode === "edit" && sheet) {
        // For edit mode, populate with existing data
        formHook.reset({
          approved_by: sheet.approved_by,
          date: sheet.date,
          shift: sheet.shift,
          product: sheet.product,
          day_shift_hours: "",
          no_of_pallets: 0,
          hourly_target: 0,
          variance: 0,
          reason_for_variance: "",
          bottles_shift: "",
          bottles_opening: 0,
          bottles_added: 0,
          bottles_closing: 0,
          bottles_wastes: 0,
          bottles_damages: 0,
          milk_shift: "",
          milk_opening: 0,
          milk_added: 0,
          milk_closing: 0,
          milk_total: 0,
          milk_transfer: 0,
          product_1: 0,
          product_2: 0,
          filler_1: 0,
          filler_2: 0,
          capper_1: 0,
          capper_2: 0,
          sleever_1: 0,
          sleever_2: 0,
          shrink_1: 0,
          shrink_2: 0,
        })
      } else {
        // Reset to default values for create mode
        formHook.reset({
          approved_by: "",
          date: "",
          shift: "",
          product: "",
          day_shift_hours: "",
          no_of_pallets: 0,
          hourly_target: 0,
          variance: 0,
          reason_for_variance: "",
          bottles_shift: "",
          bottles_opening: 0,
          bottles_added: 0,
          bottles_closing: 0,
          bottles_wastes: 0,
          bottles_damages: 0,
          milk_shift: "",
          milk_opening: 0,
          milk_added: 0,
          milk_closing: 0,
          milk_total: 0,
          milk_transfer: 0,
          product_1: 0,
          product_2: 0,
          filler_1: 0,
          filler_2: 0,
          capper_1: 0,
          capper_2: 0,
          sleever_1: 0,
          sleever_2: 0,
          shrink_1: 0,
          shrink_2: 0,
        })
      }
    }
  }, [open, mode, sheet])

  // Handle step-by-step submission
  const handleStepSubmit = async (data: FilmaticLinesProductionSheetData) => {
    if (isSubmitting) return
    
    // Manual validation for current step
    if (currentStep === 1) {
      if (!data.approved_by || !data.date || !data.shift || !data.product) {
        toast.error("Please fill in all required fields")
        return
      }
    } else if (currentStep === 2) {
      if (!data.day_shift_hours || data.no_of_pallets === undefined || data.hourly_target === undefined || data.variance === undefined || !data.reason_for_variance) {
        toast.error("Please fill in all required fields")
        return
      }
    } else if (currentStep === 3) {
      // Skip validation for Bottles Reconciliation step - allow empty fields
    } else if (currentStep === 4) {
      if (!data.milk_shift || data.milk_opening === undefined || data.milk_added === undefined || data.milk_closing === undefined || data.milk_total === undefined || data.milk_transfer === undefined) {
        toast.error("Please fill in all required fields")
        return
      }
    } else if (currentStep === 5) {
      if (data.product_1 === undefined || data.product_2 === undefined || data.filler_1 === undefined || data.filler_2 === undefined || data.capper_1 === undefined || data.capper_2 === undefined || data.sleever_1 === undefined || data.sleever_2 === undefined || data.shrink_1 === undefined || data.shrink_2 === undefined) {
        toast.error("Please fill in all required fields")
        return
      }
    }
    
    setIsSubmitting(true)
    
    try {
      // Step 1: Create basic production sheet
      if (currentStep === 1) {
        const formData: CreateFilmaticLinesProductionSheetRequest = {
          approved_by: data.approved_by,
          date: data.date,
          shift: data.shift,
          product: data.product,
        }

        const result = await dispatch(createFilmaticLinesProductionSheet(formData)).unwrap()
        setCreatedSheetId(result.id)
        toast.success("Production sheet created successfully")
        setCurrentStep(2)
      }
      
      // Step 2: Create production sheet details
      else if (currentStep === 2 && createdSheetId) {
        const detailData: CreateFilmaticLinesProductionSheetDetailRequest = {
          filmatic_lines_production_sheet_id: createdSheetId,
          day_shift_hours: data.day_shift_hours || "",
          no_of_pallets: data.no_of_pallets || 0,
          hourly_target: data.hourly_target || 0,
          variance: data.variance || 0,
          reason_for_variance: data.reason_for_variance || "",
        }

        console.log("Creating production sheet details with data:", detailData)
        const result = await filmaticLinesApi.createProductionSheetDetail(detailData)
        console.log("Production sheet details result:", result)
        setCreatedDetailId(result.id)
        toast.success("Production details created successfully")
        setCurrentStep(3)
      }
      
      // Step 3: Create bottles reconciliation
      else if (currentStep === 3 && createdDetailId) {
        const bottlesData: CreateFilmaticLinesBottlesReconciliationRequest = {
          filmatic_lines_production_sheet_details_id: createdDetailId,
          shift: data.bottles_shift || "",
          opening: data.bottles_opening || 0,
          added: data.bottles_added || 0,
          closing: data.bottles_closing || 0,
          wastes: data.bottles_wastes || 0,
          damages: data.bottles_damages || 0,
        }

        console.log("Creating bottles reconciliation with data:", bottlesData)
        const result = await filmaticLinesApi.createBottlesReconciliation(bottlesData)
        console.log("Bottles reconciliation result:", result)
        toast.success("Bottles reconciliation created successfully")
        setCurrentStep(4)
      }
      
      // Step 4: Create milk reconciliation
      else if (currentStep === 4 && createdDetailId) {
        const milkData: CreateFilmaticLinesMilkReconciliationRequest = {
          filmatic_lines_production_sheet_details_id: createdDetailId,
          shift: data.milk_shift || "",
          opening: data.milk_opening || 0,
          added: data.milk_added || 0,
          closing: data.milk_closing || 0,
          total: data.milk_total || 0,
          transfer: data.milk_transfer || 0,
        }

        console.log("Creating milk reconciliation with data:", milkData)
        const result = await filmaticLinesApi.createMilkReconciliation(milkData)
        console.log("Milk reconciliation result:", result)
        toast.success("Milk reconciliation created successfully")
        setCurrentStep(5)
      }
      
      // Step 5: Create stoppage time minutes
      else if (currentStep === 5 && createdDetailId) {
        const stoppageData: CreateFilmaticLinesStoppageTimeMinutesRequest = {
          filmatic_lines_production_sheet_details_id: createdDetailId,
          product_1: data.product_1 || 0,
          product_2: data.product_2 || 0,
          filler_1: data.filler_1 || 0,
          filler_2: data.filler_2 || 0,
          capper_1: data.capper_1 || 0,
          capper_2: data.capper_2 || 0,
          sleever_1: data.sleever_1 || 0,
          sleever_2: data.sleever_2 || 0,
          shrink_1: data.shrink_1 || 0,
          shrink_2: data.shrink_2 || 0,
        }

        console.log("Creating stoppage time minutes with data:", stoppageData)
        const result = await filmaticLinesApi.createStoppageTimeMinutes(stoppageData)
        console.log("Stoppage time minutes result:", result)
        toast.success("Stoppage time recorded successfully")
        toast.success("Filmatic Lines Production Sheet completed successfully!")
        onOpenChange(false)
      }
    } catch (error: any) {
      console.error("Step submission error:", error)
      toast.error(error?.message || "Failed to save step data")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Update form resolver when step changes
  useEffect(() => {
    formHook.clearErrors()
  }, [currentStep, formHook])

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
                    <DatePicker
                      value={field.value || ''}
                      onChange={(date) => field.onChange(date)}
                      placeholder="Select production date"
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
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="day_shift_hours">Day Shift Hours *</Label>
                <Controller
                  name="day_shift_hours"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="day_shift_hours"
                      placeholder="e.g., 08:00-16:00"
                      {...field}
                    />
                  )}
                />
                {formHook.formState.errors.day_shift_hours && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.day_shift_hours.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_of_pallets">Number of Pallets *</Label>
                <Controller
                  name="no_of_pallets"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="no_of_pallets"
                      type="number"
                      min="0"
                      placeholder="Enter number of pallets"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.no_of_pallets && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.no_of_pallets.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourly_target">Hourly Target (cases/hour) *</Label>
                <Controller
                  name="hourly_target"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="hourly_target"
                      type="number"
                      min="0"
                      placeholder="Enter hourly target in cases"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.hourly_target && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.hourly_target.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="variance">Variance (cases) *</Label>
                <Controller
                  name="variance"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="variance"
                      type="number"
                      placeholder="Enter variance in cases (+/-)"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.variance && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.variance.message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="reason_for_variance">Reason for Variance *</Label>
                <Controller
                  name="reason_for_variance"
                  control={formHook.control}
                  render={({ field }) => (
                    <Textarea
                      id="reason_for_variance"
                      placeholder="Enter reason for variance..."
                      rows={3}
                      {...field}
                    />
                  )}
                />
                {formHook.formState.errors.reason_for_variance && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.reason_for_variance.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Bottles Reconciliation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Bottles Reconciliation</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter bottles reconciliation information</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bottles_shift">Shift *</Label>
                <Controller
                  name="bottles_shift"
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
                {formHook.formState.errors.bottles_shift && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.bottles_shift.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bottles_opening">Opening (bottles) *</Label>
                <Controller
                  name="bottles_opening"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="bottles_opening"
                      type="number"
                      min="0"
                      placeholder="Enter opening bottles count"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.bottles_opening && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.bottles_opening.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bottles_added">Added (bottles) *</Label>
                <Controller
                  name="bottles_added"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="bottles_added"
                      type="number"
                      min="0"
                      placeholder="Enter added bottles count"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.bottles_added && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.bottles_added.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bottles_closing">Closing (bottles) *</Label>
                <Controller
                  name="bottles_closing"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="bottles_closing"
                      type="number"
                      min="0"
                      placeholder="Enter closing bottles count"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.bottles_closing && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.bottles_closing.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bottles_wastes">Wastes (bottles) *</Label>
                <Controller
                  name="bottles_wastes"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="bottles_wastes"
                      type="number"
                      min="0"
                      placeholder="Enter wasted bottles count"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.bottles_wastes && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.bottles_wastes.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bottles_damages">Damages (bottles) *</Label>
                <Controller
                  name="bottles_damages"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="bottles_damages"
                      type="number"
                      min="0"
                      placeholder="Enter damaged bottles count"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.bottles_damages && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.bottles_damages.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Milk Reconciliation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Milk Reconciliation</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter milk reconciliation information</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="milk_shift">Shift *</Label>
                <Controller
                  name="milk_shift"
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
                {formHook.formState.errors.milk_shift && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.milk_shift.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="milk_opening">Opening (liters) *</Label>
                <Controller
                  name="milk_opening"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="milk_opening"
                      type="number"
                      min="0"
                      placeholder="Enter opening milk quantity"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.milk_opening && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.milk_opening.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="milk_added">Added (liters) *</Label>
                <Controller
                  name="milk_added"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="milk_added"
                      type="number"
                      min="0"
                      placeholder="Enter added milk quantity"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.milk_added && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.milk_added.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="milk_closing">Closing (liters) *</Label>
                <Controller
                  name="milk_closing"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="milk_closing"
                      type="number"
                      min="0"
                      placeholder="Enter closing milk quantity"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.milk_closing && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.milk_closing.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="milk_total">Total (liters) *</Label>
                <Controller
                  name="milk_total"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="milk_total"
                      type="number"
                      min="0"
                      placeholder="Enter total milk quantity"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.milk_total && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.milk_total.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="milk_transfer">Transfer (liters) *</Label>
                <Controller
                  name="milk_transfer"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="milk_transfer"
                      type="number"
                      min="0"
                      placeholder="Enter transfer milk quantity"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.milk_transfer && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.milk_transfer.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Stoppage Time Minutes */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Stoppage Time Minutes</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter stoppage time for each machine component</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="product_1">Product 1 (minutes) *</Label>
                <Controller
                  name="product_1"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="product_1"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.product_1 && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.product_1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_2">Product 2 (minutes) *</Label>
                <Controller
                  name="product_2"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="product_2"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.product_2 && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.product_2.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="filler_1">Filler 1 (minutes) *</Label>
                <Controller
                  name="filler_1"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="filler_1"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.filler_1 && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.filler_1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="filler_2">Filler 2 (minutes) *</Label>
                <Controller
                  name="filler_2"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="filler_2"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.filler_2 && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.filler_2.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capper_1">Capper 1 (minutes) *</Label>
                <Controller
                  name="capper_1"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="capper_1"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.capper_1 && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.capper_1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capper_2">Capper 2 (minutes) *</Label>
                <Controller
                  name="capper_2"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="capper_2"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.capper_2 && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.capper_2.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sleever_1">Sleever 1 (minutes) *</Label>
                <Controller
                  name="sleever_1"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="sleever_1"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.sleever_1 && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.sleever_1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sleever_2">Sleever 2 (minutes) *</Label>
                <Controller
                  name="sleever_2"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="sleever_2"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.sleever_2 && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.sleever_2.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shrink_1">Shrink 1 (minutes) *</Label>
                <Controller
                  name="shrink_1"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="shrink_1"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.shrink_1 && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.shrink_1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shrink_2">Shrink 2 (minutes) *</Label>
                <Controller
                  name="shrink_2"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="shrink_2"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.shrink_2 && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.shrink_2.message}</p>
                )}
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
          <form onSubmit={formHook.handleSubmit(handleStepSubmit)}>
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
                    onClick={handlePrevious}
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {currentStep < 5 ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading.create || loading.update}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save & Continue
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading.create || loading.update}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Complete Process
                      </>
                    )}
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