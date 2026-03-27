"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createQACorrectiveActionAction, 
  updateQACorrectiveActionAction,
  fetchQACorrectiveActions
} from "@/lib/store/slices/qaCorrectiveActionSlice"
import { usersApi } from "@/lib/api/users"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import { QACorrectiveAction, QACorrectiveActionDetails } from "@/lib/api/data-capture-forms"
import { ChevronLeft, ChevronRight, ArrowRight, AlertTriangle, Beaker, FileText, TestTube } from "lucide-react"

interface QACorrectiveActionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action?: QACorrectiveAction | null
  mode?: "create" | "edit"
  processId?: string
}

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">QA Corrective Action Process</h3>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Beaker className="w-4 h-4 text-orange-600" />
        </div>
        <span className="text-sm font-light">Test Stage</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-red-600">QA Corrective Action</span>
          <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Dispatch</span>
      </div>
    </div>
  </div>
)

// Step 1: QA Corrective Action Form Schema
const actionSchema = yup.object({
  date_of_production: yup.string().required("Production date is required"),
  date_analysed: yup.string().required("Analysis date is required"),
  batch_number: yup.number().required("Batch number is required").min(1, "Must be positive"),
  product: yup.string().required("Product is required"),
  checked_by: yup.string().required("Checked by is required"),
  issue: yup.string().required("Issue description is required"),
  analyst: yup.string().required("Analyst is required"),
  qa_decision: yup.string().required("QA decision is required"),
})

// Step 2: QA Corrective Action Details Form Schema
const actionDetailsSchema = yup.object({
  ph_after_7_days_at_30_degrees: yup.number().required("pH level is required").min(0, "Must be positive"),
  packaging_integrity: yup.string().required("Packaging integrity is required"),
  defects: yup.string().required("Defects description is required"),
})

type ActionFormData = yup.InferType<typeof actionSchema>
type ActionDetailsFormData = yup.InferType<typeof actionDetailsSchema>

export function QACorrectiveActionDrawer({ 
  open, 
  onOpenChange, 
  action, 
  mode = "create",
  processId
}: QACorrectiveActionDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.qaCorrectiveActions)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [createdAction, setCreatedAction] = useState<QACorrectiveAction | null>(null)
  const [dataLoading, setDataLoading] = useState(false)
  
  // Form instances
  const actionForm = useForm<ActionFormData>({
    resolver: yupResolver(actionSchema),
    defaultValues: {
      date_of_production: "",
      date_analysed: "",
      batch_number: undefined,
      product: processId || "",
      checked_by: "",
      issue: "",
      analyst: "",
      qa_decision: "",
    }
  })

  const actionDetailsForm = useForm<ActionDetailsFormData>({
    resolver: yupResolver(actionDetailsSchema),
    defaultValues: {
      ph_after_7_days_at_30_degrees: undefined,
      packaging_integrity: "",
      defects: "",
    }
  })

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true)
      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          usersApi.getUsers(),
          rolesApi.getRoles()
        ])
        console.log("Users response:", usersResponse)
        console.log("Roles response:", rolesResponse)
        
        const usersData = usersResponse.data || usersResponse
        const rolesData = rolesResponse.data || rolesResponse
        
        console.log("Users data:", usersData)
        console.log("Roles data:", rolesData)
        
        setUsers(Array.isArray(usersData) ? usersData : [])
        setRoles(Array.isArray(rolesData) ? rolesData : [])
      
        
       
      } catch (error) {
        console.error("Error loading data:", error)
        setUsers([])
        setRoles([])
      } finally {
        setDataLoading(false)
      }
    }
    
    if (open) {
      loadData()
    }
  }, [open])

  // Also load users when drawer opens (fallback)
  useEffect(() => {
    if (open && users.length === 0) {
      const loadUsersOnly = async () => {
        try {
          const usersResponse = await usersApi.getUsers()
          const usersData = usersResponse.data || usersResponse
          if (Array.isArray(usersData) && usersData.length > 0) {
            setUsers(usersData)
            console.log("Fallback users loaded:", usersData)
          }
        } catch (error) {
          console.error("Fallback user loading failed:", error)
        }
      }
      loadUsersOnly()
    }
  }, [open, users.length])

  // Populate form when editing
  useEffect(() => {
    if (action && mode === "edit") {
      actionForm.reset({
        date_of_production: action.date_of_production || "",
        date_analysed: action.date_analysed || "",
        batch_number: action.batch_number ?? undefined,
        product:  processId || "",
        checked_by: action.checked_by || "",
        issue: action.issue || "",
        analyst: action.analyst || "",
        qa_decision: action.qa_decision || "",
      })

      if (action.qa_corrective_action_details_fkey) {
        const details = action.qa_corrective_action_details_fkey
        actionDetailsForm.reset({
          ph_after_7_days_at_30_degrees: details.ph_after_7_days_at_30_degrees ?? undefined,
          packaging_integrity: details.packaging_integrity || "",
          defects: details.defects || "",
        })
      }
    }
  }, [action, mode, actionForm, actionDetailsForm])

  const handleActionSubmit = async (data: ActionFormData) => {
    try {
      if (mode === "edit" && action) {
        // For edit mode, update the existing action
        const result = await dispatch(updateQACorrectiveActionAction({
          ...action,
          ...data
        })).unwrap()
        setCreatedAction(result)
        toast.success("QA Corrective Action updated successfully")
      } else {
        // For create mode, create new action
        const result = await dispatch(createQACorrectiveActionAction(data)).unwrap()
        console.log("First step result:", result)
        
        // Extract the actual data from the response
        const actionData = (result as any).data || result
        console.log("Action data to store:", actionData)
        
        setCreatedAction(actionData)
        toast.success("QA Corrective Action created successfully")
      }
      setCurrentStep(2)
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to save QA corrective action'
      toast.error(errorMessage)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleDetailsSubmit = async (data: ActionDetailsFormData) => {
    if (!createdAction) {
      toast.error("No QA corrective action found")
      return
    }

    try {
      const { createQACorrectiveActionDetails, updateQACorrectiveActionDetails } = await import("@/lib/api/data-capture-forms")
      
  
      
      const payload = {
        qa_corrective_action_id: createdAction.id!,
        ph_after_7_days_at_30_degrees: parseFloat(data.ph_after_7_days_at_30_degrees.toString()),
        packaging_integrity: data.packaging_integrity,
        defects: data.defects
      }
      console.log("Full payload:", payload)
      
      if (mode === "edit" && action?.qa_corrective_action_details_fkey) {
        // Update existing details
        const updatePayload = {
          ...action.qa_corrective_action_details_fkey,
          ph_after_7_days_at_30_degrees: parseFloat(data.ph_after_7_days_at_30_degrees.toString()),
          packaging_integrity: data.packaging_integrity,
          defects: data.defects
        }
        console.log("Update payload:", updatePayload)
        await updateQACorrectiveActionDetails(updatePayload)
        toast.success("QA Corrective Action details updated successfully")
      } else {
        // Create new details
        await createQACorrectiveActionDetails(payload)
        toast.success("QA Corrective Action created successfully")
      }

      // Refresh the actions list
      setTimeout(() => {
        dispatch(fetchQACorrectiveActions())
      }, 1000)

      onOpenChange(false)
      resetForms()
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to save QA corrective action details'
      toast.error(errorMessage)
    }
  }

  const resetForms = () => {
    actionForm.reset()
    actionDetailsForm.reset()
    setCurrentStep(1)
    setCreatedAction(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForms()
  }

  const getStepTitle = () => {
    if (currentStep === 1) return "QA Corrective Action Details"
    if (currentStep === 2) return "Test Results & Analysis"
    return ""
  }

  const getStepDescription = () => {
    if (currentStep === 1) return "Enter the basic information about the quality issue and corrective action."
    if (currentStep === 2) return "Record the test results and analysis details."
    return ""
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="tablet-sheet-full overflow-y-auto p-6 bg-white">
        <SheetHeader>
          <SheetTitle className="text-xl font-light">
            {mode === "create" ? "Add QA Corrective Action" : "Edit QA Corrective Action"}
          </SheetTitle>
          <SheetDescription>
            {getStepDescription()}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <ProcessOverview />
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm font-light">Action Details</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm font-light">Test Results</span>
              </div>
            </div>
          </div>

          {/* Step 1: Action Details */}
          {currentStep === 1 && (
            <form onSubmit={actionForm.handleSubmit(handleActionSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date_of_production">Production Date *</Label>
                  <Controller
                    name="date_of_production"
                    control={actionForm.control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select production date"
                      />
                    )}
                  />
                  {actionForm.formState.errors.date_of_production && (
                    <p className="text-sm text-red-600">{actionForm.formState.errors.date_of_production.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_analysed">Analysis Date *</Label>
                  <Controller
                    name="date_analysed"
                    control={actionForm.control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select analysis date"
                      />
                    )}
                  />
                  {actionForm.formState.errors.date_analysed && (
                    <p className="text-sm text-red-600">{actionForm.formState.errors.date_analysed.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch_number">Batch Number *</Label>
                  <Input
                    id="batch_number"
                    type="number"
                    {...actionForm.register("batch_number", { valueAsNumber: true })}
                    placeholder="Enter batch number"
                    value={actionForm.watch("batch_number") || ""}
                    onChange={(e) => actionForm.setValue("batch_number", e.target.value ? Number(e.target.value) : undefined)}
                  />
                  {actionForm.formState.errors.batch_number && (
                    <p className="text-sm text-red-600">{actionForm.formState.errors.batch_number.message}</p>
                  )}
                </div>
{/* 
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  {processId ? (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium text-gray-900">
                        {products.find(p => p.id === processId)?.name || `Process ${processId.substring(0, 8)}...`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Auto-selected from process</p>
                    </div>
                  ) : (
                    <Controller
                      name="product"
                      control={actionForm.control}
                      render={({ field }) => (
                        <SearchableSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          options={products.map(p => ({ value: p.id, label: p.name }))}
                          placeholder="Select product"
                        />
                      )}
                    />
                  )}
                  {actionForm.formState.errors.product && (
                    <p className="text-sm text-red-600">{actionForm.formState.errors.product.message}</p>
                  )}
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="checked_by">Checked By *</Label>
                  <Controller
                    name="checked_by"
                    control={actionForm.control}
                    render={({ field }) => (
                      <SearchableSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={(users || []).map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` }))}
                        placeholder={dataLoading || users.length === 0 ? "Loading users..." : "Select checker"}
                        disabled={dataLoading || users.length === 0}
                      />
                    )}
                  />
                  {actionForm.formState.errors.checked_by && (
                    <p className="text-sm text-red-600">{actionForm.formState.errors.checked_by.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analyst">Analyst *</Label>
                  <Controller
                    name="analyst"
                    control={actionForm.control}
                    render={({ field }) => (
                      <SearchableSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={(users || []).map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` }))}
                        placeholder={dataLoading || users.length === 0 ? "Loading users..." : "Select analyst"}
                        disabled={dataLoading || users.length === 0}
                      />
                    )}
                  />
                  {actionForm.formState.errors.analyst && (
                    <p className="text-sm text-red-600">{actionForm.formState.errors.analyst.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue">Issue Description *</Label>
                <Controller
                  name="issue"
                  control={actionForm.control}
                  render={({ field }) => (
                    <Textarea
                      id="issue"
                      {...field}
                      placeholder="Describe the quality issue..."
                      rows={3}
                    />
                  )}
                />
                {actionForm.formState.errors.issue && (
                  <p className="text-sm text-red-600">{actionForm.formState.errors.issue.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qa_decision">QA Decision *</Label>
                <Controller
                  name="qa_decision"
                  control={actionForm.control}
                  render={({ field }) => (
                    <Textarea
                      id="qa_decision"
                      {...field}
                      placeholder="Enter QA decision..."
                      rows={3}
                    />
                  )}
                />
                {actionForm.formState.errors.qa_decision && (
                  <p className="text-sm text-red-600">{actionForm.formState.errors.qa_decision.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                  disabled={operationLoading.create || operationLoading.update}
                >
                  {mode === "create" ? "Create Action" : "Update Action"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Test Results */}
          {currentStep === 2 && (
            <form onSubmit={actionDetailsForm.handleSubmit(handleDetailsSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ph_after_7_days_at_30_degrees">pH Level After 7 Days at 30°C *</Label>
                <Input
                  id="ph_after_7_days_at_30_degrees"
                  type="number"
                  step="0.1"
                  {...actionDetailsForm.register("ph_after_7_days_at_30_degrees", { valueAsNumber: true })}
                  placeholder="Enter pH level"
                  value={actionDetailsForm.watch("ph_after_7_days_at_30_degrees") || ""}
                  onChange={(e) => actionDetailsForm.setValue("ph_after_7_days_at_30_degrees", e.target.value ? Number(e.target.value) : undefined)}
                />
                {actionDetailsForm.formState.errors.ph_after_7_days_at_30_degrees && (
                  <p className="text-sm text-red-600">{actionDetailsForm.formState.errors.ph_after_7_days_at_30_degrees.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="packaging_integrity">Packaging Integrity *</Label>
                <Controller
                  name="packaging_integrity"
                  control={actionDetailsForm.control}
                  render={({ field }) => (
                    <Textarea
                      id="packaging_integrity"
                      {...field}
                      placeholder="Describe packaging integrity..."
                      rows={3}
                    />
                  )}
                />
                {actionDetailsForm.formState.errors.packaging_integrity && (
                  <p className="text-sm text-red-600">{actionDetailsForm.formState.errors.packaging_integrity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="defects">Defects Description *</Label>
                <Controller
                  name="defects"
                  control={actionDetailsForm.control}
                  render={({ field }) => (
                    <Textarea
                      id="defects"
                      {...field}
                      placeholder="Describe any defects found..."
                      rows={3}
                    />
                  )}
                />
                {actionDetailsForm.formState.errors.defects && (
                  <p className="text-sm text-red-600">{actionDetailsForm.formState.errors.defects.message}</p>
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                  disabled={operationLoading.create || operationLoading.update}
                >
                  {mode === "create" ? "Complete QA Corrective Action" : "Update Details"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
