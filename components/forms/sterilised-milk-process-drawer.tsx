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
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createSterilisedMilkProcessAction, 
  updateSterilisedMilkProcessAction,
  fetchSterilisedMilkProcesses,
  createSterilisedMilkProcessDetailsAction,
  updateSterilisedMilkProcessDetailsAction
} from "@/lib/store/slices/sterilisedMilkProcessSlice"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"
import { SterilisedMilkProcess, SterilisedMilkProcessDetails } from "@/lib/api/data-capture-forms"
import { ChevronLeft, ChevronRight, ArrowRight, Package, Beaker, FileText } from "lucide-react"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl } from "@/lib/utils/signature"

interface SterilisedMilkProcessDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process?: SterilisedMilkProcess | null
  mode?: "create" | "edit"
}

// Step 1: Process Form Schema
const processSchema = yup.object({
  approved_by: yup.string().required("Approved by is required"),
  approver_signature: yup.string().required("Approver signature is required"),
  operator_id: yup.string().required("Operator is required"),
  operator_signature: yup.string().required("Operator signature is required"),
  supervisor_id: yup.string().required("Supervisor is required"),
  supervisor_signature: yup.string().required("Supervisor signature is required"),
  filmatic_form_id: yup.string().required("Filmatic form is required"),
})

// Step 2: Process Details Form Schema
const processDetailsSchema = yup.object({
  parameter_name: yup.string().required("Parameter name is required"),
  filling_start_reading: yup.number().required("Filling start reading is required"),
  autoclave_start_reading: yup.number().required("Autoclave start reading is required"),
  heating_start_reading: yup.number().required("Heating start reading is required"),
  heating_finish_reading: yup.number().required("Heating finish reading is required"),
  sterilization_start_reading: yup.number().required("Sterilization start reading is required"),
  sterilisation_after_five_six_minutes_reading: yup.number().required("Sterilisation after 5-6 minutes reading is required"),
  sterilisation_finish_reading: yup.number().required("Sterilisation finish reading is required"),
  precooling_start_reading: yup.number().required("Precooling start reading is required"),
  precooling_finish_reading: yup.number().required("Precooling finish reading is required"),
  cooling_one_start_reading: yup.number().required("Cooling one start reading is required"),
  cooling_one_finish_reading: yup.number().required("Cooling one finish reading is required"),
  cooling_two_start_reading: yup.number().required("Cooling two start reading is required"),
  cooling_two_finish_reading: yup.number().required("Cooling two finish reading is required"),
})

type ProcessFormData = yup.InferType<typeof processSchema>
type ProcessDetailsFormData = yup.InferType<typeof processDetailsSchema>

export function SterilisedMilkProcessDrawer({ 
  open, 
  onOpenChange, 
  process, 
  mode = "create" 
}: SterilisedMilkProcessDrawerProps) {
  const dispatch = useAppDispatch()
  const sterilisedMilkProcessState = useAppSelector((state) => state.sterilisedMilkProcesses)
  const { operationLoading } = sterilisedMilkProcessState || { 
    operationLoading: { create: false, update: false, delete: false, fetch: false }
  }
  
  const [currentStep, setCurrentStep] = useState(1)
  const [createdProcess, setCreatedProcess] = useState<SterilisedMilkProcess | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [filmaticForms, setFilmaticForms] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingFilmaticForms, setLoadingFilmaticForms] = useState(false)
  const [operatorSignatureOpen, setOperatorSignatureOpen] = useState(false)
  const [supervisorSignatureOpen, setSupervisorSignatureOpen] = useState(false)
  const [approverSignatureOpen, setApproverSignatureOpen] = useState(false)
  const [operatorSignatureViewOpen, setOperatorSignatureViewOpen] = useState(false)
  const [supervisorSignatureViewOpen, setSupervisorSignatureViewOpen] = useState(false)
  const [approverSignatureViewOpen, setApproverSignatureViewOpen] = useState(false)

  // Process form
  const processForm = useForm<ProcessFormData>({
    resolver: yupResolver(processSchema),
    defaultValues: {
      approved_by: "",
      approver_signature: "",
      operator_id: "",
      operator_signature: "",
      supervisor_id: "",
      supervisor_signature: "",
      filmatic_form_id: "",
    },
  })

  // Process details form
  const processDetailsForm = useForm<ProcessDetailsFormData>({
    resolver: yupResolver(processDetailsSchema),
    defaultValues: {
      parameter_name: "Temperature",
      filling_start_reading: 0,
      autoclave_start_reading: 0,
      heating_start_reading: 0,
      heating_finish_reading: 0,
      sterilization_start_reading: 0,
      sterilisation_after_five_six_minutes_reading: 0,
      sterilisation_finish_reading: 0,
      precooling_start_reading: 0,
      precooling_finish_reading: 0,
      cooling_one_start_reading: 0,
      cooling_one_finish_reading: 0,
      cooling_two_start_reading: 0,
      cooling_two_finish_reading: 0,
    },
  })

  // Load users and filmatic forms on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingUsers(true)
      setLoadingFilmaticForms(true)
      try {
        // Load users
        const usersResponse = await usersApi.getUsers()
        setUsers(usersResponse.data || [])
        
        // Load filmatic forms
        const { sterilisedMilkApi } = await import("@/lib/api/sterilised-milk-process")
        const filmaticResponse = await sterilisedMilkApi.getFilmaticForms()
        setFilmaticForms(filmaticResponse.data || [])
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load form data")
      } finally {
        setLoadingUsers(false)
        setLoadingFilmaticForms(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  // Reset forms when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && process) {
        processForm.reset({
          approved_by: process.approved_by,
          approver_signature: process.approver_signature || "",
          operator_id: process.operator_id,
          operator_signature: process.operator_signature,
          supervisor_id: process.supervisor_id,
          supervisor_signature: process.supervisor_signature,
          filmatic_form_id: process.filmatic_form_id || "",
        })
        setCreatedProcess(process)
        setCurrentStep(2) // Skip to details step for edit mode
      } else {
        processForm.reset()
        processDetailsForm.reset()
        setCreatedProcess(null)
        setCurrentStep(1)
      }
    }
  }, [open, mode, process, processForm, processDetailsForm])

  const handleProcessSubmit = async (data: ProcessFormData) => {
    try {
      // Debug: Log what's being sent
      console.log("Form data being sent:", data)
      
      if (mode === "edit" && process) {
        await dispatch(updateSterilisedMilkProcessAction({
          ...process,
          ...data,
        })).unwrap()
        toast.success("Process updated successfully")
        setCreatedProcess({ ...process, ...data })
      } else {
        const result = await dispatch(createSterilisedMilkProcessAction(data)).unwrap()
        toast.success("Process created successfully")
        setCreatedProcess(result)
      }
      setCurrentStep(2)
    } catch (error: any) {
      toast.error(error || "Failed to save process")
    }
  }

  const handleProcessDetailsSubmit = async (data: ProcessDetailsFormData) => {
    if (!createdProcess) {
      toast.error("No process found")
      return
    }

    try {
      const processDetailsData = {
        ...data,
        sterilised_milk_process_id: createdProcess.id!,
      }

      if (mode === "edit" && process) {
        // For edit mode, we would need to get the existing process details
        // For now, we'll create new details
        await dispatch(createSterilisedMilkProcessDetailsAction(processDetailsData)).unwrap()
        toast.success("Process details updated successfully")
      } else {
        await dispatch(createSterilisedMilkProcessDetailsAction(processDetailsData)).unwrap()
        toast.success("Process details created successfully")
      }

      // Refresh the processes list
      setTimeout(() => {
        dispatch(fetchSterilisedMilkProcesses())
      }, 1000)

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to save process details")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep === 1) {
      processForm.handleSubmit(handleProcessSubmit)()
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

  const ProcessOverview = () => (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
      <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Beaker className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-sm font-light">Filmatic Lines 1</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-600">Process Log</span>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              Current Step
            </div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Beaker className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-sm font-light">Filmatic Lines 2</span>
        </div>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6 p-6 bg-white">
      <ProcessOverview />
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Process Information</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the basic process details and personnel information</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="filmatic_form_id">Filmatic Form *</Label>
          <Controller
            name="filmatic_form_id"
            control={processForm.control}
            render={({ field }) => (
              <SearchableSelect
                options={filmaticForms.map(form => ({
                  value: form.id,
                  label: `Filmatic Form #${form.id.slice(0, 8)}`,
                  description: `${form.date} • ${form.approved ? 'Approved' : 'Pending'} • ${form.day_shift_opening_bottles + form.night_shift_opening_bottles} bottles`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select filmatic form"
                loading={loadingFilmaticForms}
              />
            )}
          />
          {processForm.formState.errors.filmatic_form_id && (
            <p className="text-sm text-red-500">{processForm.formState.errors.filmatic_form_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="approved_by">Approved By *</Label>
            <Controller
              name="approved_by"
              control={processForm.control}
              render={({ field }) => (
                <SearchableSelect
                  options={users.map(user => ({
                    value: user.id,
                    label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                    description: `${user.department} • ${user.email}`
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearch={handleUserSearch}
                  placeholder="Search and select approver"
                  loading={loadingUsers}
                />
              )}
            />
            {processForm.formState.errors.approved_by && (
              <p className="text-sm text-red-500">{processForm.formState.errors.approved_by.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="approver_signature">Approver Signature *</Label>
            <Controller
              name="approver_signature"
              control={processForm.control}
              render={({ field }) => (
                <div className="space-y-2">
                  {field.value ? (
                    <img src={base64ToPngDataUrl(field.value)} alt="Approver signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                  ) : (
                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                      No signature captured
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setApproverSignatureOpen(true)}>
                      Add Signature
                    </Button>
                    {field.value && (
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setApproverSignatureViewOpen(true)}>
                        View Signature
                      </Button>
                    )}
                    {field.value && (
                      <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => field.onChange("")}>Clear</Button>
                    )}
                  </div>
                </div>
              )}
            />
            {processForm.formState.errors.approver_signature && (
              <p className="text-sm text-red-500">{processForm.formState.errors.approver_signature.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="operator_id">Operator *</Label>
            <Controller
              name="operator_id"
              control={processForm.control}
              render={({ field }) => (
                <SearchableSelect
                  options={users.map(user => ({
                    value: user.id,
                    label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                    description: `${user.department} • ${user.email}`
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearch={handleUserSearch}
                  placeholder="Search and select operator"
                  loading={loadingUsers}
                />
              )}
            />
            {processForm.formState.errors.operator_id && (
              <p className="text-sm text-red-500">{processForm.formState.errors.operator_id.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="operator_signature">Operator Signature *</Label>
          <Controller
            name="operator_signature"
            control={processForm.control}
            render={({ field }) => {
              const safeValue = typeof field.value === 'string' ? field.value : ""
              return (
                <div className="space-y-2">
                  {safeValue ? (
                    <img src={base64ToPngDataUrl(safeValue)} alt="Operator signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                  ) : (
                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                      No signature captured
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setOperatorSignatureOpen(true)}>
                      Add Signature
                    </Button>
                    {safeValue && (
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setOperatorSignatureViewOpen(true)}>
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
          {processForm.formState.errors.operator_signature && (
            <p className="text-sm text-red-500">{processForm.formState.errors.operator_signature.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supervisor_id">Supervisor *</Label>
          <Controller
            name="supervisor_id"
            control={processForm.control}
            render={({ field }) => (
              <SearchableSelect
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                  description: `${user.department} • ${user.email}`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleUserSearch}
                placeholder="Search and select supervisor"
                loading={loadingUsers}
              />
            )}
          />
          {processForm.formState.errors.supervisor_id && (
            <p className="text-sm text-red-500">{processForm.formState.errors.supervisor_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supervisor_signature">Supervisor Signature *</Label>
          <Controller
            name="supervisor_signature"
            control={processForm.control}
            render={({ field }) => {
              const safeValue = typeof field.value === 'string' ? field.value : ""
              return (
                <div className="space-y-2">
                  {safeValue ? (
                    <img src={base64ToPngDataUrl(safeValue)} alt="Supervisor signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                  ) : (
                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                      No signature captured
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSupervisorSignatureOpen(true)}>
                      Add Signature
                    </Button>
                    {safeValue && (
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSupervisorSignatureViewOpen(true)}>
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
          {processForm.formState.errors.supervisor_signature && (
            <p className="text-sm text-red-500">{processForm.formState.errors.supervisor_signature.message}</p>
          )}
        </div>

      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Step 2: Process Details</h3>
          <p className="text-sm text-gray-600 mt-2">Enter the specific process parameters and temperature readings</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="parameter_name">Parameter Name *</Label>
          <Controller
            name="parameter_name"
            control={processDetailsForm.control}
            render={({ field }) => (
              <Input
                id="parameter_name"
                placeholder="Enter parameter name"
                {...field}
              />
            )}
          />
          {processDetailsForm.formState.errors.parameter_name && (
            <p className="text-sm text-red-500">{processDetailsForm.formState.errors.parameter_name.message}</p>
          )}
        </div>

        {/* Filling Readings */}
        <div className="space-y-4">
          <h4 className="font-medium">Filling Readings</h4>
          <div className="space-y-2">
            <Label htmlFor="filling_start_reading">Filling Start Reading *</Label>
            <Controller
              name="filling_start_reading"
              control={processDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="filling_start_reading"
                  type="number"
                  step="0.1"
                  placeholder="Enter filling start reading"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {processDetailsForm.formState.errors.filling_start_reading && (
              <p className="text-sm text-red-500">{processDetailsForm.formState.errors.filling_start_reading.message}</p>
            )}
          </div>
        </div>

        {/* Autoclave Readings */}
        <div className="space-y-4">
          <h4 className="font-medium">Autoclave Readings</h4>
          <div className="space-y-2">
            <Label htmlFor="autoclave_start_reading">Autoclave Start Reading *</Label>
            <Controller
              name="autoclave_start_reading"
              control={processDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="autoclave_start_reading"
                  type="number"
                  step="0.1"
                  placeholder="Enter autoclave start reading"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {processDetailsForm.formState.errors.autoclave_start_reading && (
              <p className="text-sm text-red-500">{processDetailsForm.formState.errors.autoclave_start_reading.message}</p>
            )}
          </div>
        </div>

        {/* Heating Readings */}
        <div className="space-y-4">
          <h4 className="font-medium">Heating Readings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heating_start_reading">Heating Start Reading *</Label>
              <Controller
                name="heating_start_reading"
                control={processDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="heating_start_reading"
                    type="number"
                    step="0.1"
                    placeholder="Enter heating start reading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {processDetailsForm.formState.errors.heating_start_reading && (
                <p className="text-sm text-red-500">{processDetailsForm.formState.errors.heating_start_reading.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="heating_finish_reading">Heating Finish Reading *</Label>
              <Controller
                name="heating_finish_reading"
                control={processDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="heating_finish_reading"
                    type="number"
                    step="0.1"
                    placeholder="Enter heating finish reading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {processDetailsForm.formState.errors.heating_finish_reading && (
                <p className="text-sm text-red-500">{processDetailsForm.formState.errors.heating_finish_reading.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sterilization Readings */}
        <div className="space-y-4">
          <h4 className="font-medium">Sterilization Readings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sterilization_start_reading">Sterilization Start Reading *</Label>
              <Controller
                name="sterilization_start_reading"
                control={processDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="sterilization_start_reading"
                    type="number"
                    step="0.1"
                    placeholder="Enter sterilization start reading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {processDetailsForm.formState.errors.sterilization_start_reading && (
                <p className="text-sm text-red-500">{processDetailsForm.formState.errors.sterilization_start_reading.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sterilisation_after_five_six_minutes_reading">After 5-6 Minutes Reading *</Label>
              <Controller
                name="sterilisation_after_five_six_minutes_reading"
                control={processDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="sterilisation_after_five_six_minutes_reading"
                    type="number"
                    step="0.1"
                    placeholder="Enter after 5-6 minutes reading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {processDetailsForm.formState.errors.sterilisation_after_five_six_minutes_reading && (
                <p className="text-sm text-red-500">{processDetailsForm.formState.errors.sterilisation_after_five_six_minutes_reading.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sterilisation_finish_reading">Sterilisation Finish Reading *</Label>
            <Controller
              name="sterilisation_finish_reading"
              control={processDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="sterilisation_finish_reading"
                  type="number"
                  step="0.1"
                  placeholder="Enter sterilisation finish reading"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {processDetailsForm.formState.errors.sterilisation_finish_reading && (
              <p className="text-sm text-red-500">{processDetailsForm.formState.errors.sterilisation_finish_reading.message}</p>
            )}
          </div>
        </div>

        {/* Precooling Readings */}
        <div className="space-y-4">
          <h4 className="font-medium">Precooling Readings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precooling_start_reading">Precooling Start Reading *</Label>
              <Controller
                name="precooling_start_reading"
                control={processDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="precooling_start_reading"
                    type="number"
                    step="0.1"
                    placeholder="Enter precooling start reading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {processDetailsForm.formState.errors.precooling_start_reading && (
                <p className="text-sm text-red-500">{processDetailsForm.formState.errors.precooling_start_reading.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="precooling_finish_reading">Precooling Finish Reading *</Label>
              <Controller
                name="precooling_finish_reading"
                control={processDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="precooling_finish_reading"
                    type="number"
                    step="0.1"
                    placeholder="Enter precooling finish reading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {processDetailsForm.formState.errors.precooling_finish_reading && (
                <p className="text-sm text-red-500">{processDetailsForm.formState.errors.precooling_finish_reading.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cooling One Readings */}
        <div className="space-y-4">
          <h4 className="font-medium">Cooling One Readings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cooling_one_start_reading">Cooling One Start Reading *</Label>
              <Controller
                name="cooling_one_start_reading"
                control={processDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="cooling_one_start_reading"
                    type="number"
                    step="0.1"
                    placeholder="Enter cooling one start reading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {processDetailsForm.formState.errors.cooling_one_start_reading && (
                <p className="text-sm text-red-500">{processDetailsForm.formState.errors.cooling_one_start_reading.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooling_one_finish_reading">Cooling One Finish Reading *</Label>
              <Controller
                name="cooling_one_finish_reading"
                control={processDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="cooling_one_finish_reading"
                    type="number"
                    step="0.1"
                    placeholder="Enter cooling one finish reading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {processDetailsForm.formState.errors.cooling_one_finish_reading && (
                <p className="text-sm text-red-500">{processDetailsForm.formState.errors.cooling_one_finish_reading.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cooling Two Readings */}
        <div className="space-y-4">
          <h4 className="font-medium">Cooling Two Readings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cooling_two_start_reading">Cooling Two Start Reading *</Label>
              <Controller
                name="cooling_two_start_reading"
                control={processDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="cooling_two_start_reading"
                    type="number"
                    step="0.1"
                    placeholder="Enter cooling two start reading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {processDetailsForm.formState.errors.cooling_two_start_reading && (
                <p className="text-sm text-red-500">{processDetailsForm.formState.errors.cooling_two_start_reading.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooling_two_finish_reading">Cooling Two Finish Reading *</Label>
              <Controller
                name="cooling_two_finish_reading"
                control={processDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="cooling_two_finish_reading"
                    type="number"
                    step="0.1"
                    placeholder="Enter cooling two finish reading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {processDetailsForm.formState.errors.cooling_two_finish_reading && (
                <p className="text-sm text-red-500">{processDetailsForm.formState.errors.cooling_two_finish_reading.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>
            {mode === "edit" ? "Edit Sterilised Milk Process" : "Create Sterilised Milk Process"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1 
              ? "Step 1: Enter process information and personnel details"
              : "Step 2: Enter process details and readings"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white">
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
              Step {currentStep} of 2
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
              onClick={processDetailsForm.handleSubmit(handleProcessDetailsSubmit)}
              disabled={operationLoading.create}
            >
              {mode === "edit" ? "Update Process" : "Create Process"}
            </Button>
          )}
        </div>
      </SheetContent>
      <SignatureModal
        open={operatorSignatureOpen}
        onOpenChange={setOperatorSignatureOpen}
        title="Capture Operator Signature"
        onSave={(dataUrl) => {
          processForm.setValue("operator_signature", dataUrl, { shouldValidate: true })
        }}
      />
      <SignatureViewer
        open={operatorSignatureViewOpen}
        onOpenChange={setOperatorSignatureViewOpen}
        title="Operator Signature"
        value={processForm.getValues("operator_signature")}
      />
      <SignatureModal
        open={supervisorSignatureOpen}
        onOpenChange={setSupervisorSignatureOpen}
        title="Capture Supervisor Signature"
        onSave={(dataUrl) => {
          processForm.setValue("supervisor_signature", dataUrl, { shouldValidate: true })
        }}
      />
      <SignatureViewer
        open={supervisorSignatureViewOpen}
        onOpenChange={setSupervisorSignatureViewOpen}
        title="Supervisor Signature"
        value={processForm.getValues("supervisor_signature")}
      />
      <SignatureModal
        open={approverSignatureOpen}
        onOpenChange={setApproverSignatureOpen}
        title="Capture Approver Signature"
        onSave={(dataUrl) => {
          processForm.setValue("approver_signature", dataUrl, { shouldValidate: true })
        }}
      />
      <SignatureViewer
        open={approverSignatureViewOpen}
        onOpenChange={setApproverSignatureViewOpen}
        title="Approver Signature"
        value={processForm.getValues("approver_signature")}
      />
    </Sheet>
  )
}
