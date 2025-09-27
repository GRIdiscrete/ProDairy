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
  createSteriMilkProcessLog,
  fetchSteriMilkProcessLogs
} from "@/lib/store/slices/steriMilkProcessLogSlice"
import { usersApi } from "@/lib/api/users"
import { filmaticLinesForm1Api } from "@/lib/api/filmatic-lines-form-1"
import { filmaticLinesForm2Api } from "@/lib/api/filmatic-lines-form-2"
import { toast } from "sonner"
import { SteriMilkProcessLog, CreateSteriMilkProcessLogRequest } from "@/lib/api/steri-milk-process-log"
import { ChevronLeft, ChevronRight, ArrowRight, Factory, Beaker, FileText, Package, Clock, Thermometer, Gauge } from "lucide-react"

interface SteriMilkProcessLogDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log?: SteriMilkProcessLog | null
  mode?: "create" | "edit"
  processId: string
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
        <span className="text-sm font-light">Process Log</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Factory className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-600">Steri Milk Process Log</span>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Package className="h-4 w-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Next Process</span>
      </div>
    </div>
  </div>
)

// Step 1: Basic Information Schema
const basicInfoSchema = yup.object({
  approved: yup.boolean().required("Approval status is required"),
  approver_id: yup.string().required("Approver is required"),
  filmatic_form_id: yup.string().required("Filmatic form is required"),
  batch_number: yup.number().required("Batch number is required").min(1, "Must be positive"),
})

// Step 2: Process Times Schema
const processTimesSchema = yup.object({
  filling_start: yup.string().required("Filling start is required"),
  autoclave_start: yup.string().required("Autoclave start is required"),
  heating_start: yup.string().required("Heating start is required"),
  heating_finish: yup.string().required("Heating finish is required"),
  sterilization_start: yup.string().required("Sterilization start is required"),
  sterilization_after_5: yup.string().required("Sterilization after 5 is required"),
  sterilization_finish: yup.string().required("Sterilization finish is required"),
  pre_cooling_start: yup.string().required("Pre cooling start is required"),
  pre_cooling_finish: yup.string().required("Pre cooling finish is required"),
  cooling_1_start: yup.string().required("Cooling 1 start is required"),
  cooling_1_finish: yup.string().required("Cooling 1 finish is required"),
  cooling_2_start: yup.string().required("Cooling 2 start is required"),
  cooling_2_finish: yup.string().required("Cooling 2 finish is required"),
})

// Step 3: Process Details Schema
const processDetailsSchema = yup.object({
  filling_start_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  autoclave_start_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  heating_start_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  heating_finish_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  sterilization_start_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  sterilization_after_5_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  sterilization_finish_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  pre_cooling_start_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  pre_cooling_finish_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  cooling_1_start_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  cooling_1_finish_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  cooling_2_start_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
  cooling_2_finish_details: yup.object({
    time: yup.string().required("Time is required"),
    temperature: yup.number().required("Temperature is required"),
    pressure: yup.number().required("Pressure is required"),
  }),
})

type BasicInfoFormData = yup.InferType<typeof basicInfoSchema>
type ProcessTimesFormData = yup.InferType<typeof processTimesSchema>
type ProcessDetailsFormData = yup.InferType<typeof processDetailsSchema>

export function SteriMilkProcessLogDrawer({ 
  open, 
  onOpenChange, 
  log, 
  mode = "create",
  processId
}: SteriMilkProcessLogDrawerProps) {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.steriMilkProcessLog)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [users, setUsers] = useState<any[]>([])
  const [filmaticForms, setFilmaticForms] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingFilmaticForms, setLoadingFilmaticForms] = useState(false)

  // Basic info form
  const basicInfoForm = useForm<BasicInfoFormData>({
    resolver: yupResolver(basicInfoSchema),
    defaultValues: {
      approved: true,
      approver_id: "",
      filmatic_form_id: "",
      batch_number: 1,
    },
  })

  // Process times form
  const processTimesForm = useForm<ProcessTimesFormData>({
    resolver: yupResolver(processTimesSchema),
    defaultValues: {
      filling_start: "",
      autoclave_start: "",
      heating_start: "",
      heating_finish: "",
      sterilization_start: "",
      sterilization_after_5: "",
      sterilization_finish: "",
      pre_cooling_start: "",
      pre_cooling_finish: "",
      cooling_1_start: "",
      cooling_1_finish: "",
      cooling_2_start: "",
      cooling_2_finish: "",
    },
  })

  // Process details form
  const processDetailsForm = useForm<ProcessDetailsFormData>({
    resolver: yupResolver(processDetailsSchema),
    defaultValues: {
      filling_start_details: { time: "", temperature: 0, pressure: 0 },
      autoclave_start_details: { time: "", temperature: 0, pressure: 0 },
      heating_start_details: { time: "", temperature: 0, pressure: 0 },
      heating_finish_details: { time: "", temperature: 0, pressure: 0 },
      sterilization_start_details: { time: "", temperature: 0, pressure: 0 },
      sterilization_after_5_details: { time: "", temperature: 0, pressure: 0 },
      sterilization_finish_details: { time: "", temperature: 0, pressure: 0 },
      pre_cooling_start_details: { time: "", temperature: 0, pressure: 0 },
      pre_cooling_finish_details: { time: "", temperature: 0, pressure: 0 },
      cooling_1_start_details: { time: "", temperature: 0, pressure: 0 },
      cooling_1_finish_details: { time: "", temperature: 0, pressure: 0 },
      cooling_2_start_details: { time: "", temperature: 0, pressure: 0 },
      cooling_2_finish_details: { time: "", temperature: 0, pressure: 0 },
    },
  })

  // Load users and filmatic forms on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingUsers(true)
      setLoadingFilmaticForms(true)
      
      try {
        // Load users
        try {
          const usersResponse = await usersApi.getUsers()
          setUsers(usersResponse.data || [])
        } catch (userError) {
          setUsers([
            {
              id: "fallback-user-1",
              first_name: "John",
              last_name: "Doe",
              email: "john.doe@example.com",
              department: "Production",
              role_id: "supervisor"
            }
          ])
        }
        
        // Load Filmatic forms
        try {
          const [form1Response, form2Response] = await Promise.all([
            filmaticLinesForm1Api.getForms(),
            filmaticLinesForm2Api.getForms()
          ])
          
          const allForms = [
            ...(form1Response.data || []).map(form => ({ ...form, type: 'Form 1' })),
            ...(form2Response.data || []).map(form => ({ ...form, type: 'Form 2' }))
          ]
          setFilmaticForms(allForms)
        } catch (formError) {
          setFilmaticForms([
            {
              id: "fallback-form-1",
              type: "Form 1",
              date: "2025-01-01",
              holding_tank_bmt: "Tank-001"
            }
          ])
        }
      } catch (error) {
        console.warn("Form will work with fallback data")
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
      if (mode === "edit" && log) {
        setCurrentStep(1)
      } else {
        basicInfoForm.reset()
        processTimesForm.reset()
        processDetailsForm.reset()
        setCurrentStep(1)
      }
    }
  }, [open, mode, log, basicInfoForm, processTimesForm, processDetailsForm])

  const handleBasicInfoSubmit = async (data: BasicInfoFormData) => {
    setCurrentStep(2)
  }

  const handleProcessTimesSubmit = async (data: ProcessTimesFormData) => {
    setCurrentStep(3)
  }

  const handleProcessDetailsSubmit = async (data: ProcessDetailsFormData) => {
    try {
      const basicInfo = basicInfoForm.getValues()
      const processTimes = processTimesForm.getValues()
      
      const formData: CreateSteriMilkProcessLogRequest = {
        approved: basicInfo.approved,
        approver_id: basicInfo.approver_id,
        filmatic_form_id: basicInfo.filmatic_form_id,
        batch: {
          batch_number: basicInfo.batch_number,
          ...processTimes,
          ...data
        }
      }

      await dispatch(createSteriMilkProcessLog(formData)).unwrap()
      toast.success("Steri Milk Process Log created successfully")
      
      setTimeout(() => {
        dispatch(fetchSteriMilkProcessLogs())
      }, 1000)

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to create Steri Milk Process Log")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep === 1) {
      basicInfoForm.handleSubmit(handleBasicInfoSubmit)()
    } else if (currentStep === 2) {
      processTimesForm.handleSubmit(handleProcessTimesSubmit)()
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
      return []
    }
  }

  const handleFilmaticFormSearch = async (query: string) => {
    if (!query.trim()) return []
    
    try {
      const [form1Response, form2Response] = await Promise.all([
        filmaticLinesForm1Api.getForms(),
        filmaticLinesForm2Api.getForms()
      ])
      
      const allForms = [
        ...(form1Response.data || []).map(form => ({ ...form, type: 'Form 1' })),
        ...(form2Response.data || []).map(form => ({ ...form, type: 'Form 2' }))
      ]
      
      return allForms
        .filter(form => 
          form.id?.toLowerCase().includes(query.toLowerCase()) ||
          form.date?.toLowerCase().includes(query.toLowerCase()) ||
          form.holding_tank_bmt?.toLowerCase().includes(query.toLowerCase())
        )
        .map(form => ({
          value: form.id,
          label: `${form.type} - ${form.date} - ${form.holding_tank_bmt}`,
          description: `ID: ${form.id.slice(0, 8)}...`
        }))
    } catch (error) {
      return []
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />
      
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Basic Information</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the basic log information and batch details</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="batch_number">Batch Number *</Label>
          <Controller
            name="batch_number"
            control={basicInfoForm.control}
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
          {basicInfoForm.formState.errors.batch_number && (
            <p className="text-sm text-red-500">{basicInfoForm.formState.errors.batch_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="approver_id">Approver *</Label>
          <Controller
            name="approver_id"
            control={basicInfoForm.control}
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
                searchPlaceholder="Search users..."
                emptyMessage="No users found"
                loading={loadingUsers}
              />
            )}
          />
          {basicInfoForm.formState.errors.approver_id && (
            <p className="text-sm text-red-500">{basicInfoForm.formState.errors.approver_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="filmatic_form_id">Filmatic Form *</Label>
          <Controller
            name="filmatic_form_id"
            control={basicInfoForm.control}
            render={({ field }) => (
              <SearchableSelect
                options={filmaticForms.map(form => ({
                  value: form.id,
                  label: `${form.type} - ${form.date} - ${form.holding_tank_bmt}`,
                  description: `ID: ${form.id.slice(0, 8)}...`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleFilmaticFormSearch}
                placeholder="Search and select filmatic form"
                searchPlaceholder="Search forms..."
                emptyMessage="No forms found"
                loading={loadingFilmaticForms}
              />
            )}
          />
          {basicInfoForm.formState.errors.filmatic_form_id && (
            <p className="text-sm text-red-500">{basicInfoForm.formState.errors.filmatic_form_id.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />
      
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Process Times</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the process timing information</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filling_start">Filling Start *</Label>
            <Controller
              name="filling_start"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="filling_start"
                  placeholder="Enter time (e.g., 20)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.filling_start && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.filling_start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="autoclave_start">Autoclave Start *</Label>
            <Controller
              name="autoclave_start"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="autoclave_start"
                  placeholder="Enter time (e.g., 30)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.autoclave_start && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.autoclave_start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="heating_start">Heating Start *</Label>
            <Controller
              name="heating_start"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="heating_start"
                  placeholder="Enter time (e.g., 40)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.heating_start && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.heating_start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="heating_finish">Heating Finish *</Label>
            <Controller
              name="heating_finish"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="heating_finish"
                  placeholder="Enter time (e.g., 50)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.heating_finish && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.heating_finish.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sterilization_start">Sterilization Start *</Label>
            <Controller
              name="sterilization_start"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="sterilization_start"
                  placeholder="Enter time (e.g., 60)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.sterilization_start && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.sterilization_start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sterilization_after_5">Sterilization After 5 *</Label>
            <Controller
              name="sterilization_after_5"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="sterilization_after_5"
                  placeholder="Enter time (e.g., 70)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.sterilization_after_5 && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.sterilization_after_5.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sterilization_finish">Sterilization Finish *</Label>
            <Controller
              name="sterilization_finish"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="sterilization_finish"
                  placeholder="Enter time (e.g., 80)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.sterilization_finish && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.sterilization_finish.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pre_cooling_start">Pre Cooling Start *</Label>
            <Controller
              name="pre_cooling_start"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="pre_cooling_start"
                  placeholder="Enter time (e.g., 30)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.pre_cooling_start && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.pre_cooling_start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pre_cooling_finish">Pre Cooling Finish *</Label>
            <Controller
              name="pre_cooling_finish"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="pre_cooling_finish"
                  placeholder="Enter time (e.g., 40)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.pre_cooling_finish && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.pre_cooling_finish.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooling_1_start">Cooling 1 Start *</Label>
            <Controller
              name="cooling_1_start"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="cooling_1_start"
                  placeholder="Enter time (e.g., 50)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.cooling_1_start && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.cooling_1_start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooling_1_finish">Cooling 1 Finish *</Label>
            <Controller
              name="cooling_1_finish"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="cooling_1_finish"
                  placeholder="Enter time (e.g., 60)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.cooling_1_finish && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.cooling_1_finish.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooling_2_start">Cooling 2 Start *</Label>
            <Controller
              name="cooling_2_start"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="cooling_2_start"
                  placeholder="Enter time (e.g., 80)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.cooling_2_start && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.cooling_2_start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooling_2_finish">Cooling 2 Finish *</Label>
            <Controller
              name="cooling_2_finish"
              control={processTimesForm.control}
              render={({ field }) => (
                <Input
                  id="cooling_2_finish"
                  placeholder="Enter time (e.g., 90)"
                  {...field}
                />
              )}
            />
            {processTimesForm.formState.errors.cooling_2_finish && (
              <p className="text-sm text-red-500">{processTimesForm.formState.errors.cooling_2_finish.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />
      
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Process Details</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the detailed process information with temperature and pressure readings</p>
        </div>
        
        <div className="space-y-6">
          {/* Filling Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Filling Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filling_start_details_time">Time *</Label>
                <Controller
                  name="filling_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="filling_start_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filling_start_details_temperature">Temperature *</Label>
                <Controller
                  name="filling_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="filling_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filling_start_details_pressure">Pressure *</Label>
                <Controller
                  name="filling_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="filling_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Autoclave Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-red-600" />
              <span>Autoclave Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="autoclave_start_details_time">Time *</Label>
                <Controller
                  name="autoclave_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="autoclave_start_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoclave_start_details_temperature">Temperature *</Label>
                <Controller
                  name="autoclave_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="autoclave_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoclave_start_details_pressure">Pressure *</Label>
                <Controller
                  name="autoclave_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="autoclave_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Heating Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-orange-600" />
              <span>Heating Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heating_start_details_time">Time *</Label>
                <Controller
                  name="heating_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="heating_start_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heating_start_details_temperature">Temperature *</Label>
                <Controller
                  name="heating_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="heating_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heating_start_details_pressure">Pressure *</Label>
                <Controller
                  name="heating_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="heating_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Heating Finish Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-orange-600" />
              <span>Heating Finish Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heating_finish_details_time">Time *</Label>
                <Controller
                  name="heating_finish_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="heating_finish_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heating_finish_details_temperature">Temperature *</Label>
                <Controller
                  name="heating_finish_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="heating_finish_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heating_finish_details_pressure">Pressure *</Label>
                <Controller
                  name="heating_finish_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="heating_finish_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sterilization Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-red-600" />
              <span>Sterilization Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sterilization_start_details_time">Time *</Label>
                <Controller
                  name="sterilization_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_start_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_start_details_temperature">Temperature *</Label>
                <Controller
                  name="sterilization_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_start_details_pressure">Pressure *</Label>
                <Controller
                  name="sterilization_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sterilization After 5 Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-red-600" />
              <span>Sterilization After 5 Minutes Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sterilization_after_5_details_time">Time *</Label>
                <Controller
                  name="sterilization_after_5_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_after_5_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_after_5_details_temperature">Temperature *</Label>
                <Controller
                  name="sterilization_after_5_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_after_5_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_after_5_details_pressure">Pressure *</Label>
                <Controller
                  name="sterilization_after_5_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_after_5_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sterilization Finish Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-red-600" />
              <span>Sterilization Finish Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sterilization_finish_details_time">Time *</Label>
                <Controller
                  name="sterilization_finish_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_finish_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_finish_details_temperature">Temperature *</Label>
                <Controller
                  name="sterilization_finish_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_finish_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_finish_details_pressure">Pressure *</Label>
                <Controller
                  name="sterilization_finish_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_finish_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Pre Cooling Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              <span>Pre Cooling Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_start_details_time">Time *</Label>
                <Controller
                  name="pre_cooling_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="pre_cooling_start_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_start_details_temperature">Temperature *</Label>
                <Controller
                  name="pre_cooling_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="pre_cooling_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_start_details_pressure">Pressure *</Label>
                <Controller
                  name="pre_cooling_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="pre_cooling_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Pre Cooling Finish Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              <span>Pre Cooling Finish Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_finish_details_time">Time *</Label>
                <Controller
                  name="pre_cooling_finish_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="pre_cooling_finish_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_finish_details_temperature">Temperature *</Label>
                <Controller
                  name="pre_cooling_finish_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="pre_cooling_finish_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_finish_details_pressure">Pressure *</Label>
                <Controller
                  name="pre_cooling_finish_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="pre_cooling_finish_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Cooling 1 Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-cyan-600" />
              <span>Cooling 1 Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cooling_1_start_details_time">Time *</Label>
                <Controller
                  name="cooling_1_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_1_start_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_1_start_details_temperature">Temperature *</Label>
                <Controller
                  name="cooling_1_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_1_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_1_start_details_pressure">Pressure *</Label>
                <Controller
                  name="cooling_1_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_1_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Cooling 1 Finish Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-cyan-600" />
              <span>Cooling 1 Finish Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cooling_1_finish_details_time">Time *</Label>
                <Controller
                  name="cooling_1_finish_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_1_finish_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_1_finish_details_temperature">Temperature *</Label>
                <Controller
                  name="cooling_1_finish_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_1_finish_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_1_finish_details_pressure">Pressure *</Label>
                <Controller
                  name="cooling_1_finish_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_1_finish_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Cooling 2 Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-indigo-600" />
              <span>Cooling 2 Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cooling_2_start_details_time">Time *</Label>
                <Controller
                  name="cooling_2_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_2_start_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_2_start_details_temperature">Temperature *</Label>
                <Controller
                  name="cooling_2_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_2_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_2_start_details_pressure">Pressure *</Label>
                <Controller
                  name="cooling_2_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_2_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Cooling 2 Finish Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-indigo-600" />
              <span>Cooling 2 Finish Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cooling_2_finish_details_time">Time *</Label>
                <Controller
                  name="cooling_2_finish_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_2_finish_details_time"
                      placeholder="10:30:00+00"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_2_finish_details_temperature">Temperature *</Label>
                <Controller
                  name="cooling_2_finish_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_2_finish_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_2_finish_details_pressure">Pressure *</Label>
                <Controller
                  name="cooling_2_finish_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_2_finish_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
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
            {mode === "edit" ? "Edit Steri Milk Process Log" : "Create Steri Milk Process Log"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1 
              ? "Basic Information: Enter the basic log information and batch details"
              : currentStep === 2
              ? "Process Times: Enter the process timing information"
              : "Process Details: Enter the detailed process information with temperature and pressure readings"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white" key={`form-${open}-${currentStep}`}>
          {currentStep === 1 ? renderStep1() : currentStep === 2 ? renderStep2() : renderStep3()}
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
              {currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Process Times" : "Process Details"} • Step {currentStep} of 3
            </span>
          </div>

          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={loading.create}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={processDetailsForm.handleSubmit(handleProcessDetailsSubmit)}
              disabled={loading.create}
            >
              {mode === "edit" ? "Update Log" : "Create Log"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
