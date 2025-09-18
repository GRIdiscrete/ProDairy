"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createPalletiserSheetAction, 
  updatePalletiserSheetAction,
  fetchPalletiserSheets
} from "@/lib/store/slices/palletiserSheetSlice"
import { usersApi } from "@/lib/api/users"
import { machineApi } from "@/lib/api/machine"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import { PalletiserSheet, PalletiserSheetDetails } from "@/lib/api/data-capture-forms"
import { ChevronLeft, ChevronRight, ArrowRight, Package, Beaker, FileText } from "lucide-react"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl, normalizeDataUrlToBase64 } from "@/lib/utils/signature"

interface PalletiserSheetDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheet?: PalletiserSheet | null
  mode?: "create" | "edit"
}

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Beaker className="w-4 h-4 text-orange-600" />
        </div>
        <span className="text-sm font-light">Filmatic Lines</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Package className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-600">Palletizing</span>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Process Log</span>
      </div>
    </div>
  </div>
)

// Step 1: Sheet Form Schema
const sheetSchema = yup.object({
  machine_id: yup.string().required("Machine is required"),
  manufacturing_date: yup.string().required("Manufacturing date is required"),
  expiry_date: yup.string().required("Expiry date is required"),
  batch_number: yup.number().required("Batch number is required").min(1, "Must be positive"),
  product_type: yup.string().required("Product type is required"),
  approved_by: yup.string().required("Approved by is required"),
})

// Step 2: Sheet Details Form Schema
const sheetDetailsSchema = yup.object({
  pallet_number: yup.number().required("Pallet number is required").min(1, "Must be positive"),
  start_time: yup.string().required("Start time is required"),
  end_time: yup.string().required("End time is required"),
  cases_packed: yup.number().required("Cases packed is required").min(0, "Must be positive"),
  serial_number: yup.string().required("Serial number is required"),
  counter_id: yup.string().required("Counter is required"),
  counter_signature: yup.string().required("Counter signature is required"),
})

type SheetFormData = yup.InferType<typeof sheetSchema>
type SheetDetailsFormData = yup.InferType<typeof sheetDetailsSchema>

export function PalletiserSheetDrawer({ 
  open, 
  onOpenChange, 
  sheet, 
  mode = "create" 
}: PalletiserSheetDrawerProps) {
  const dispatch = useAppDispatch()
  const palletiserSheetState = useAppSelector((state) => state.palletiserSheets)
  const { operationLoading } = palletiserSheetState || { 
    operationLoading: { create: false, update: false, delete: false, fetch: false }
  }
  
  const [currentStep, setCurrentStep] = useState(1)
  const [createdSheet, setCreatedSheet] = useState<PalletiserSheet | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMachines, setLoadingMachines] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [counterSignatureOpen, setCounterSignatureOpen] = useState(false)
  const [counterSignatureViewOpen, setCounterSignatureViewOpen] = useState(false)

  // Sheet form
  const sheetForm = useForm<SheetFormData>({
    resolver: yupResolver(sheetSchema),
    defaultValues: {
      machine_id: "",
      manufacturing_date: "",
      expiry_date: "",
      batch_number: 0,
      product_type: "",
      approved_by: "",
    },
  })

  // Sheet details form
  const sheetDetailsForm = useForm<SheetDetailsFormData>({
    resolver: yupResolver(sheetDetailsSchema),
    defaultValues: {
      pallet_number: 0,
      start_time: "",
      end_time: "",
      cases_packed: 0,
      serial_number: "",
      counter_id: "",
      counter_signature: "",
    },
    mode: "onChange"
  })

  // Load users, machines, and roles on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingUsers(true)
      setLoadingMachines(true)
      setLoadingRoles(true)
      try {
        // Load users
        const usersResponse = await usersApi.getUsers()
        setUsers(usersResponse.data || [])
        
        // Load machines
        const machinesResponse = await machineApi.getMachines()
        setMachines(machinesResponse.data || [])
        
        // Load roles
        const rolesResponse = await rolesApi.getRoles()
        setRoles(rolesResponse.data || [])
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load form data")
      } finally {
        setLoadingUsers(false)
        setLoadingMachines(false)
        setLoadingRoles(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  // Reset forms when drawer opens/closes
  useEffect(() => {
    if (open) {
      console.log("Form opening, mode:", mode, "sheet:", sheet)
      
      if (mode === "edit" && sheet) {
        sheetForm.reset({
          machine_id: sheet.machine_id || "",
          manufacturing_date: sheet.manufacturing_date || "",
          expiry_date: sheet.expiry_date || "",
          batch_number: sheet.batch_number || 0,
          product_type: sheet.product_type || "",
          approved_by: sheet.approved_by || "",
        })
        
        // Reset sheet details form with clean defaults
        sheetDetailsForm.reset({
          pallet_number: 0,
          start_time: "",
          end_time: "",
          cases_packed: 0,
          serial_number: "",
          counter_id: "",
          counter_signature: "",
        })
        
        setCreatedSheet(sheet)
        setCurrentStep(2) // Skip to details step for edit mode
      } else {
        // Reset both forms to clean defaults
        sheetForm.reset({
          machine_id: "",
          manufacturing_date: "",
          expiry_date: "",
          batch_number: 0,
          product_type: "",
          approved_by: "",
        })
        sheetDetailsForm.reset({
          pallet_number: 0,
          start_time: "",
          end_time: "",
          cases_packed: 0,
          serial_number: "",
          counter_id: "",
          counter_signature: "",
        })
        setCreatedSheet(null)
        setCurrentStep(1)
      }
    }
  }, [open, mode, sheet, sheetForm, sheetDetailsForm])

  const handleSheetSubmit = async (data: SheetFormData) => {
    try {
      if (mode === "edit" && sheet) {
        await dispatch(updatePalletiserSheetAction({
          ...sheet,
          ...data,
        })).unwrap()
        toast.success("Sheet updated successfully")
        setCreatedSheet({ ...sheet, ...data })
      } else {
        const result = await dispatch(createPalletiserSheetAction(data)).unwrap()
        toast.success("Sheet created successfully")
        setCreatedSheet(result)
      }
      setCurrentStep(2)
    } catch (error: any) {
      toast.error(error || "Failed to save sheet")
    }
  }

  const handleSheetDetailsSubmit = async (data: SheetDetailsFormData) => {
    if (!createdSheet) {
      toast.error("No sheet found")
      return
    }

    try {
      const sheetDetailsData = {
        ...data,
        palletiser_sheet_id: createdSheet.id!,
        counter_signature: normalizeDataUrlToBase64(data.counter_signature),
      }

      if (mode === "edit" && sheet) {
        // For edit mode, update the existing sheet
        await dispatch(updatePalletiserSheetAction({
          ...sheet,
          ...sheetDetailsData
        })).unwrap()
        toast.success("Sheet updated successfully")
      } else {
        // For create mode, the sheet was already created above
        toast.success("Sheet created successfully")
      }

      // Refresh the sheets list
      setTimeout(() => {
        dispatch(fetchPalletiserSheets())
      }, 1000)

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to save sheet details")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep === 1) {
      sheetForm.handleSubmit(handleSheetSubmit)()
    }
  }

  const handleUserSearch = async (query: string) => {
    if (!query.trim()) return []
    
    try {
      const usersResponse = await usersApi.getUsers({
        filters: { search: query }
      })
      return (usersResponse.data || [])
        .map(user => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name}`.trim() || user.email,
          description: `${user.department} • ${user.email}`
        }))
    } catch (error) {
      console.error("Failed to search users:", error)
      return []
    }
  }

  const handleMachineSearch = async (query: string) => {
    if (!query.trim()) return []
    
    try {
      const machinesResponse = await machineApi.getMachines({
        filters: { search: query }
      })
      return (machinesResponse.data || [])
        .map(machine => ({
          value: machine.id,
          label: machine.name,
          description: `${machine.category} • ${machine.location}`
        }))
    } catch (error) {
      console.error("Failed to search machines:", error)
      return []
    }
  }

  const handleRoleSearch = async (query: string) => {
    if (!query.trim()) return []
    
    try {
      const rolesResponse = await rolesApi.getRoles({
        filters: { search: query }
      })
      return (rolesResponse.data || [])
        .map(role => ({
          value: role.id,
          label: role.role_name,
          description: `${role.views?.length || 0} views • ${role.user_operations?.length || 0} user operations`
        }))
    } catch (error) {
      console.error("Failed to search roles:", error)
      return []
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />
      
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Basic Information</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the basic palletiser sheet details and machine information</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="machine_id">Machine *</Label>
            <Controller
              name="machine_id"
              control={sheetForm.control}
              render={({ field }) => (
                <SearchableSelect
                  options={machines.map(machine => ({
                    value: machine.id,
                    label: machine.name,
                    description: `${machine.category} • ${machine.location}`
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearch={handleMachineSearch}
                  placeholder="Search and select machine"
                  searchPlaceholder="Search machines..."
                  emptyMessage="No machines found"
                  loading={loadingMachines}
                />
              )}
            />
            {sheetForm.formState.errors.machine_id && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.machine_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_type">Product Type *</Label>
            <Controller
              name="product_type"
              control={sheetForm.control}
              render={({ field }) => (
                <Input
                  id="product_type"
                  placeholder="Enter product type (e.g., UHT Milk 1L)"
                  {...field}
                />
              )}
            />
            {sheetForm.formState.errors.product_type && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.product_type.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Controller
              name="manufacturing_date"
              control={sheetForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Manufacturing Date *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select manufacturing date"
                  error={!!sheetForm.formState.errors.manufacturing_date}
                />
              )}
            />
            {sheetForm.formState.errors.manufacturing_date && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.manufacturing_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Controller
              name="expiry_date"
              control={sheetForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Expiry Date *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select expiry date"
                  error={!!sheetForm.formState.errors.expiry_date}
                />
              )}
            />
            {sheetForm.formState.errors.expiry_date && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.expiry_date.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batch_number">Batch Number *</Label>
            <Controller
              name="batch_number"
              control={sheetForm.control}
              render={({ field }) => (
                <Input
                  id="batch_number"
                  type="number"
                  placeholder="Enter batch number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {sheetForm.formState.errors.batch_number && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.batch_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="approved_by">Approved By (Role) *</Label>
            <Controller
              name="approved_by"
              control={sheetForm.control}
              render={({ field }) => (
                <SearchableSelect
                  options={roles.map(role => ({
                    value: role.id,
                    label: role.role_name,
                    description: `${role.views?.length || 0} views • ${role.user_operations?.length || 0} user operations`
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearch={handleRoleSearch}
                  placeholder="Search and select role"
                  searchPlaceholder="Search roles..."
                  emptyMessage="No roles found"
                  loading={loadingRoles}
                />
              )}
            />
            {sheetForm.formState.errors.approved_by && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.approved_by.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />
      
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Details</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the specific pallet details and counter information</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pallet_number">Pallet Number *</Label>
            <Controller
              name="pallet_number"
              control={sheetDetailsForm.control}
              render={({ field }) => {
                const safeValue = typeof field.value === 'number' ? field.value : 0
                return (
                  <Input
                    id="pallet_number"
                    type="number"
                    placeholder="Enter pallet number"
                    value={safeValue || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      const numValue = value === "" ? 0 : parseInt(value, 10) || 0
                      field.onChange(numValue)
                    }}
                  />
                )
              }}
            />
            {sheetDetailsForm.formState.errors.pallet_number && (
              <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.pallet_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cases_packed">Cases Packed *</Label>
            <Controller
              name="cases_packed"
              control={sheetDetailsForm.control}
              render={({ field }) => {
                const safeValue = typeof field.value === 'number' ? field.value : 0
                return (
                  <Input
                    id="cases_packed"
                    type="number"
                    placeholder="Enter cases packed"
                    value={safeValue || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      const numValue = value === "" ? 0 : parseInt(value, 10) || 0
                      field.onChange(numValue)
                    }}
                  />
                )
              }}
            />
            {sheetDetailsForm.formState.errors.cases_packed && (
              <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.cases_packed.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Controller
              name="start_time"
              control={sheetDetailsForm.control}
              render={({ field }) => {
                const safeValue = typeof field.value === 'string' && field.value !== 'UTC' ? field.value : ""
                return (
                  <DatePicker
                    label="Start Time *"
                    value={safeValue}
                    onChange={(value) => {
                      field.onChange(value || "")
                    }}
                    placeholder="Select start time"
                    showTime={true}
                    error={!!sheetDetailsForm.formState.errors.start_time}
                  />
                )
              }}
            />
            {sheetDetailsForm.formState.errors.start_time && (
              <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.start_time.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Controller
              name="end_time"
              control={sheetDetailsForm.control}
              render={({ field }) => {
                const safeValue = typeof field.value === 'string' && field.value !== 'UTC' ? field.value : ""
                return (
                  <DatePicker
                    label="End Time *"
                    value={safeValue}
                    onChange={(value) => {
                      field.onChange(value || "")
                    }}
                    placeholder="Select end time"
                    showTime={true}
                    error={!!sheetDetailsForm.formState.errors.end_time}
                  />
                )
              }}
            />
            {sheetDetailsForm.formState.errors.end_time && (
              <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.end_time.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serial_number">Serial Number *</Label>
            <Controller
              name="serial_number"
              control={sheetDetailsForm.control}
              render={({ field }) => {
                const safeValue = typeof field.value === 'string' ? field.value : ""
                return (
                  <Input
                    id="serial_number"
                    placeholder="Enter serial number (e.g., PAL-20250821-001)"
                    value={safeValue}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                    }}
                  />
                )
              }}
            />
            {sheetDetailsForm.formState.errors.serial_number && (
              <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.serial_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="counter_id">Counter *</Label>
            <Controller
              name="counter_id"
              control={sheetDetailsForm.control}
              render={({ field }) => {
                const safeValue = typeof field.value === 'string' ? field.value : ""
                return (
                  <SearchableSelect
                    options={users.map(user => ({
                      value: user.id,
                      label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                      description: `${user.department} • ${user.email}`
                    }))}
                    value={safeValue}
                    onValueChange={(value) => {
                      field.onChange(value || "")
                    }}
                    onSearch={handleUserSearch}
                    placeholder="Search and select counter"
                    loading={loadingUsers}
                  />
                )
              }}
            />
            {sheetDetailsForm.formState.errors.counter_id && (
              <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.counter_id.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="counter_signature">Counter Signature *</Label>
          <Controller
            name="counter_signature"
            control={sheetDetailsForm.control}
            render={({ field }) => {
              const safeValue = typeof field.value === 'string' ? field.value : ""
              return (
                <div className="space-y-2">
                  {safeValue ? (
                    <img src={base64ToPngDataUrl(safeValue)} alt="Counter signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                  ) : (
                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                      No signature captured
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setCounterSignatureOpen(true)}>
                      Add Signature
                    </Button>
                    {safeValue && (
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setCounterSignatureViewOpen(true)}>
                        View Signature
                      </Button>
                    )}
                    {safeValue && (
                      <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => field.onChange("")}>Clear</Button>
                    )}
                  </div>
                </div>
              )
            }}
          />
          {sheetDetailsForm.formState.errors.counter_signature && (
            <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.counter_signature.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>
            {mode === "edit" ? "Edit Palletiser Sheet" : "Create Palletiser Sheet"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1 
              ? "Basic Information: Enter sheet information and machine details"
              : "Details: Enter pallet details and counter information"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white" key={`form-${open}-${currentStep}`}>
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t bg-white">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentStep === 1 ? "Basic Information" : "Details"} • Step {currentStep} of 2
            </span>
          </div>

          {currentStep === 1 ? (
            <Button
              onClick={handleNext}
              disabled={operationLoading.create}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={sheetDetailsForm.handleSubmit(handleSheetDetailsSubmit)}
              disabled={operationLoading.create}
            >
              {mode === "edit" ? "Update Sheet" : "Create Sheet"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
    <SignatureModal
      open={counterSignatureOpen}
      onOpenChange={setCounterSignatureOpen}
      title="Capture Counter Signature"
      onSave={(dataUrl) => {
        sheetDetailsForm.setValue("counter_signature", dataUrl, { shouldValidate: true })
      }}
    />
    <SignatureViewer
      open={counterSignatureViewOpen}
      onOpenChange={setCounterSignatureViewOpen}
      title="Counter Signature"
      value={sheetDetailsForm.getValues("counter_signature")}
    />
    </>
  )
}