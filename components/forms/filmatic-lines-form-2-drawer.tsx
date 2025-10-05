"use client"

import { useState, useEffect, useMemo } from "react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createFilmaticLinesForm2,
  fetchFilmaticLinesForm2s
} from "@/lib/store/slices/filmaticLinesForm2Slice"
import { silosApi } from "@/lib/api/silos"
import { getBMTControlForms } from "@/lib/api/data-capture-forms"
import { toast } from "sonner"
import { FilmaticLinesForm2, CreateFilmaticLinesForm2Request } from "@/lib/api/filmatic-lines-form-2"
import { ChevronLeft, ChevronRight, ArrowRight, Factory, Beaker, FileText, Package, Clock, Sun, Moon } from "lucide-react"

interface FilmaticLinesForm2DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: FilmaticLinesForm2 | null
  mode?: "create" | "edit"
  processId?: string
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
          <span className="text-sm font-medium text-blue-600">Filmatic Lines 2</span>
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
        <span className="text-sm font-light text-gray-400">Palletizer</span>
      </div>
    </div>
  </div>
)

// Step 1: Basic Information Schema (conditional validation based on shift)
const createBasicInfoSchema = (selectedShift: string) => yup.object({
  date: yup.string().required("Date is required"),
  holding_tank_bmt: yup.string().required("Holding tank BMT is required"),
  ...(selectedShift === "day_shift" && {
    day_shift_opening_bottles: yup.number().required("Day shift opening bottles is required").min(0, "Must be positive"),
    day_shift_closing_bottles: yup.number().required("Day shift closing bottles is required").min(0, "Must be positive"),
    day_shift_waste_bottles: yup.number().required("Day shift waste bottles is required").min(0, "Must be positive"),
  }),
  ...(selectedShift === "night_shift" && {
    night_shift_opening_bottles: yup.number().required("Night shift opening bottles is required").min(0, "Must be positive"),
    night_shift_closing_bottles: yup.number().required("Night shift closing bottles is required").min(0, "Must be positive"),
    night_shift_waste_bottles: yup.number().required("Night shift waste bottles is required").min(0, "Must be positive"),
  }),
})

// Step 2: Shift Selection Schema
const shiftSelectionSchema = yup.object({
  shift_type: yup.string().required("Shift type is required"),
})

// Step 3: Shift Details Schema - Form 2 specific stoppage fields
const shiftDetailsSchema = yup.object({
  supervisor_approve: yup.boolean().required("Supervisor approval is required"),
  time: yup.string().required("Time is required"),
  pallets: yup.number().required("Pallets is required").min(0, "Must be positive"),
  target: yup.number().required("Target is required").min(0, "Must be positive"),
  setbacks: yup.string().required("Setbacks is required"),
  capper_1: yup.number().required("Capper 1 stoppage time is required").min(0, "Must be positive"),
  capper_2: yup.number().required("Capper 2 stoppage time is required").min(0, "Must be positive"),
  sleever_1: yup.number().required("Sleever 1 stoppage time is required").min(0, "Must be positive"),
  sleever_2: yup.number().required("Sleever 2 stoppage time is required").min(0, "Must be positive"),
  shrink_1: yup.number().required("Shrink 1 stoppage time is required").min(0, "Must be positive"),
  shrink_2: yup.number().required("Shrink 2 stoppage time is required").min(0, "Must be positive"),
})

type BasicInfoFormData = {
  date: string
  holding_tank_bmt: string
  day_shift_opening_bottles?: number
  day_shift_closing_bottles?: number
  night_shift_opening_bottles?: number
  night_shift_closing_bottles?: number
  day_shift_waste_bottles?: number
  night_shift_waste_bottles?: number
}
type ShiftSelectionFormData = yup.InferType<typeof shiftSelectionSchema>
type ShiftDetailsFormData = yup.InferType<typeof shiftDetailsSchema>

export function FilmaticLinesForm2Drawer({ 
  open, 
  onOpenChange, 
  form, 
  mode = "create",
  processId
}: FilmaticLinesForm2DrawerProps) {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.filmaticLinesForm2)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [silos, setSilos] = useState<any[]>([])
  const [bmtForms, setBmtForms] = useState<any[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)
  const [loadingBmtForms, setLoadingBmtForms] = useState(false)

  // Shift selection form
  const shiftSelectionForm = useForm<ShiftSelectionFormData>({
    resolver: yupResolver(shiftSelectionSchema),
    defaultValues: {
      shift_type: "",
    },
  })

  // Get selected shift
  const selectedShift = shiftSelectionForm.watch("shift_type")
  
  // Create dynamic schema based on selected shift
  const basicInfoSchema = useMemo(() => {
    return createBasicInfoSchema(selectedShift || "")
  }, [selectedShift])

  // Basic info form with dynamic schema
  const basicInfoForm = useForm({
    resolver: yupResolver(basicInfoSchema),
    defaultValues: {
      date: "",
      holding_tank_bmt: "",
      day_shift_opening_bottles: undefined,
      day_shift_closing_bottles: undefined,
      night_shift_opening_bottles: undefined,
      night_shift_closing_bottles: undefined,
      day_shift_waste_bottles: undefined,
      night_shift_waste_bottles: undefined,
    },
  })

  // Shift details form
  const shiftDetailsForm = useForm<ShiftDetailsFormData>({
    resolver: yupResolver(shiftDetailsSchema),
    defaultValues: {
      supervisor_approve: false,
      time: "",
      pallets: undefined,
      target: undefined,
      setbacks: "",
      capper_1: undefined,
      capper_2: undefined,
      sleever_1: undefined,
      sleever_2: undefined,
      shrink_1: undefined,
      shrink_2: undefined,
    },
  })

  // Load BMT forms on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingBmtForms(true)
      
      try {
        
        // Load BMT Control forms for holding tank selection
        try {
          console.log("Loading BMT Control forms...")
          const bmtFormsResponse = await getBMTControlForms()
          console.log("BMT Forms response:", bmtFormsResponse)
          setBmtForms(bmtFormsResponse || [])
        } catch (bmtError) {
          console.error("Failed to load BMT Control forms:", bmtError)
          // Set fallback BMT forms data
          setBmtForms([
            {
              id: "fallback-bmt-1",
              product: "Milk",
              volume: 1000,
              flow_meter_start: "2025-01-01T08:00:00Z",
              flow_meter_start_reading: 100,
              flow_meter_end: "2025-01-01T16:00:00Z",
              flow_meter_end_reading: 200,
              source_silo_id: "fallback-silo-1",
              destination_silo_id: "fallback-silo-2",
              movement_start: "2025-01-01T08:00:00Z",
              movement_end: "2025-01-01T16:00:00Z"
            }
          ])
          console.warn("Using fallback BMT Control forms data")
        }
      } catch (error) {
        console.error("Failed to load data:", error)
        // Don't show error toast for data loading failures, just log them
        console.warn("Form will work with fallback data")
      } finally {
        setLoadingBmtForms(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  // Reset forms when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && form) {
        // Populate forms with existing data for edit mode
        // This would be implemented based on the form structure
        setCurrentStep(1)
      } else {
        // Reset all forms to clean defaults
        basicInfoForm.reset({
          date: "",
          holding_tank_bmt: "",
          day_shift_opening_bottles: 0,
          day_shift_closing_bottles: 0,
          night_shift_opening_bottles: 0,
          night_shift_closing_bottles: 0,
          day_shift_waste_bottles: 0,
          night_shift_waste_bottles: 0,
        })
        shiftSelectionForm.reset({
          shift_type: "",
        })
        shiftDetailsForm.reset({
          supervisor_approve: false,
          time: "",
          pallets: 0,
          target: 0,
          setbacks: "",
          capper_1: 0,
          capper_2: 0,
          sleever_1: 0,
          sleever_2: 0,
          shrink_1: 0,
          shrink_2: 0,
        })
        setCurrentStep(1)
      }
    }
  }, [open, mode, form, basicInfoForm, shiftSelectionForm, shiftDetailsForm])

  const handleShiftSelectionSubmit = async (data: ShiftSelectionFormData) => {
    setCurrentStep(2)
  }

  const handleBasicInfoSubmit = async (data: any) => {
    setCurrentStep(3)
  }

  const handleShiftDetailsSubmit = async (data: ShiftDetailsFormData) => {
    try {
      console.log("Submitting form with data:", data)
      const basicInfo = basicInfoForm.getValues()
      const shiftType = shiftSelectionForm.getValues().shift_type
      
      console.log("Basic info:", basicInfo)
      console.log("Shift type:", shiftType)
      
      const formData: CreateFilmaticLinesForm2Request = {
        approved: true,
        process_id: processId || "",
        date: basicInfo.date,
        holding_tank_bmt: basicInfo.holding_tank_bmt,
        day_shift_opening_bottles: Number(basicInfo.day_shift_opening_bottles) || 0,
        day_shift_closing_bottles: Number(basicInfo.day_shift_closing_bottles) || 0,
        night_shift_opening_bottles: Number(basicInfo.night_shift_opening_bottles) || 0,
        night_shift_closing_bottles: Number(basicInfo.night_shift_closing_bottles) || 0,
        day_shift_waste_bottles: Number(basicInfo.day_shift_waste_bottles) || 0,
        night_shift_waste_bottles: Number(basicInfo.night_shift_waste_bottles) || 0,
      }

      // Add shift data based on selection
      if (shiftType === "day_shift") {
        formData.day_shift = {
          supervisor_approve: data.supervisor_approve,
          operator_id: data.operator_id,
          shift_details: {
            time: data.time,
            pallets: data.pallets,
            target: data.target,
            setbacks: data.setbacks,
            stoppage_time: {
              capper_1: data.capper_1,
              capper_2: data.capper_2,
              sleever_1: data.sleever_1,
              sleever_2: data.sleever_2,
              shrink_1: data.shrink_1,
              shrink_2: data.shrink_2,
            }
          }
        }
      } else if (shiftType === "night_shift") {
        formData.night_shift = {
          supervisor_approve: data.supervisor_approve,
          operator_id: data.operator_id,
          shift_details: {
            time: data.time,
            pallets: data.pallets,
            target: data.target,
            setbacks: data.setbacks,
            stoppage_time: {
              capper_1: data.capper_1,
              capper_2: data.capper_2,
              sleever_1: data.sleever_1,
              sleever_2: data.sleever_2,
              shrink_1: data.shrink_1,
              shrink_2: data.shrink_2,
            }
          }
        }
      }

      console.log("Final form data:", formData)
      await dispatch(createFilmaticLinesForm2(formData)).unwrap()
      toast.success("Filmatic Lines Form 2 created successfully")
      
      // Refresh the forms list
      setTimeout(() => {
        dispatch(fetchFilmaticLinesForm2s())
      }, 1000)

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to create Filmatic Lines Form 2")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep === 1) {
      shiftSelectionForm.handleSubmit(handleShiftSelectionSubmit)()
    } else if (currentStep === 2) {
      basicInfoForm.handleSubmit(handleBasicInfoSubmit)()
    }
  }


  const handleBmtFormSearch = async (query: string) => {
    if (!query.trim()) return []
    
    try {
      const bmtFormsResponse = await getBMTControlForms()
      return (bmtFormsResponse || [])
        .filter(bmtForm => 
          bmtForm.product?.toLowerCase().includes(query.toLowerCase()) ||
          bmtForm.id?.toLowerCase().includes(query.toLowerCase()) ||
          bmtForm.volume?.toString().includes(query)
        )
        .map(bmtForm => ({
          value: bmtForm.id,
          label: `BMT Form #${bmtForm.id?.slice(0, 8)}`,
          description: `${bmtForm.product} • Volume: ${bmtForm.volume}L • ${bmtForm.flow_meter_start ? new Date(bmtForm.flow_meter_start).toLocaleDateString() : 'No date'}`
        }))
    } catch (error) {
      console.error("Failed to search BMT Control forms:", error)
      return []
    }
  }

  const renderStep1 = () => {
    const selectedShift = shiftSelectionForm.watch("shift_type")
    
    return (
      <div className="space-y-6 p-6">
        <ProcessOverview />
        
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Basic Information</h3>
            <p className="text-sm font-light text-gray-600 mt-2">
              Enter the basic form information and bottle counts
              {selectedShift && (
                <span className="block mt-1 text-blue-600">
                  {selectedShift === "day_shift" ? "Day Shift" : "Night Shift"} - Showing relevant fields
                </span>
              )}
            </p>
          </div>
        
        <div className="space-y-2">
          <Controller
            name="date"
            control={basicInfoForm.control}
            render={({ field }) => (
              <DatePicker
                label="Date *"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select date"
                error={!!basicInfoForm.formState.errors.date}
              />
            )}
          />
          {basicInfoForm.formState.errors.date && (
            <p className="text-sm text-red-500">{basicInfoForm.formState.errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="holding_tank_bmt">Holding Tank BMT *</Label>
          <Controller
            name="holding_tank_bmt"
            control={basicInfoForm.control}
            render={({ field }) => (
              <SearchableSelect
                options={bmtForms.map(bmtForm => ({
                  value: bmtForm.id,
                  label: `BMT Form #${bmtForm.id?.slice(0, 8)}`,
                  description: `${bmtForm.product} • Volume: ${bmtForm.volume}L • ${bmtForm.flow_meter_start ? new Date(bmtForm.flow_meter_start).toLocaleDateString() : 'No date'}`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleBmtFormSearch}
                placeholder="Search and select BMT Control form"
                searchPlaceholder="Search BMT forms..."
                emptyMessage="No BMT Control forms found"
                loading={loadingBmtForms}
              />
            )}
          />
          {basicInfoForm.formState.errors.holding_tank_bmt && (
            <p className="text-sm text-red-500">{basicInfoForm.formState.errors.holding_tank_bmt.message}</p>
          )}
        </div>

        {/* Show shift-specific fields based on selected shift */}
        {selectedShift === "day_shift" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day_shift_opening_bottles">Day Shift Opening Bottles *</Label>
                <Controller
                  name="day_shift_opening_bottles"
                  control={basicInfoForm.control}
                  render={({ field }) => (
                    <Input
                      id="day_shift_opening_bottles"
                      type="number"
                      placeholder="Enter opening bottles"
                      className="rounded-full border-gray-200"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  )}
                />
                {basicInfoForm.formState.errors.day_shift_opening_bottles && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.day_shift_opening_bottles.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="day_shift_closing_bottles">Day Shift Closing Bottles *</Label>
                <Controller
                  name="day_shift_closing_bottles"
                  control={basicInfoForm.control}
                  render={({ field }) => (
                    <Input
                      id="day_shift_closing_bottles"
                      type="number"
                      placeholder="Enter closing bottles"
                      className="rounded-full border-gray-200"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  )}
                />
                {basicInfoForm.formState.errors.day_shift_closing_bottles && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.day_shift_closing_bottles.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="day_shift_waste_bottles">Day Shift Waste Bottles *</Label>
              <Controller
                name="day_shift_waste_bottles"
                control={basicInfoForm.control}
                render={({ field }) => (
                  <Input
                    id="day_shift_waste_bottles"
                    type="number"
                    placeholder="Enter waste bottles"
                    className="rounded-full border-gray-200"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {basicInfoForm.formState.errors.day_shift_waste_bottles && (
                <p className="text-sm text-red-500">{basicInfoForm.formState.errors.day_shift_waste_bottles.message}</p>
              )}
            </div>
          </>
        )}

        {selectedShift === "night_shift" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="night_shift_opening_bottles">Night Shift Opening Bottles *</Label>
                <Controller
                  name="night_shift_opening_bottles"
                  control={basicInfoForm.control}
                  render={({ field }) => (
                    <Input
                      id="night_shift_opening_bottles"
                      type="number"
                      placeholder="Enter opening bottles"
                      className="rounded-full border-gray-200"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  )}
                />
                {basicInfoForm.formState.errors.night_shift_opening_bottles && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.night_shift_opening_bottles.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="night_shift_closing_bottles">Night Shift Closing Bottles *</Label>
                <Controller
                  name="night_shift_closing_bottles"
                  control={basicInfoForm.control}
                  render={({ field }) => (
                    <Input
                      id="night_shift_closing_bottles"
                      type="number"
                      placeholder="Enter closing bottles"
                      className="rounded-full border-gray-200"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  )}
                />
                {basicInfoForm.formState.errors.night_shift_closing_bottles && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.night_shift_closing_bottles.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="night_shift_waste_bottles">Night Shift Waste Bottles *</Label>
              <Controller
                name="night_shift_waste_bottles"
                control={basicInfoForm.control}
                render={({ field }) => (
                  <Input
                    id="night_shift_waste_bottles"
                    type="number"
                    placeholder="Enter waste bottles"
                    className="rounded-full border-gray-200"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {basicInfoForm.formState.errors.night_shift_waste_bottles && (
                <p className="text-sm text-red-500">{basicInfoForm.formState.errors.night_shift_waste_bottles.message}</p>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    )
  }

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />
      
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Shift Selection</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Choose which shift you are creating data for</p>
        </div>
        
        <div className="space-y-4">
          <Controller
            name="shift_type"
            control={shiftSelectionForm.control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="day_shift" id="day_shift" />
                  <Label htmlFor="day_shift" className="flex items-center space-x-3 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Sun className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">Day Shift</div>
                      <div className="text-sm text-gray-500">Create data for day shift operations</div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="night_shift" id="night_shift" />
                  <Label htmlFor="night_shift" className="flex items-center space-x-3 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Night Shift</div>
                      <div className="text-sm text-gray-500">Create data for night shift operations</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
          {shiftSelectionForm.formState.errors.shift_type && (
            <p className="text-sm text-red-500">{shiftSelectionForm.formState.errors.shift_type.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />
      
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Shift Details</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the specific shift details and production information</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Controller
              name="time"
              control={shiftDetailsForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Time *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select time"
                  showTime={true}
                  error={!!shiftDetailsForm.formState.errors.time}
                />
              )}
            />
            {shiftDetailsForm.formState.errors.time && (
              <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.time.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pallets">Pallets *</Label>
            <Controller
              name="pallets"
              control={shiftDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="pallets"
                  type="number"
                  placeholder="Enter pallets"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {shiftDetailsForm.formState.errors.pallets && (
              <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.pallets.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target *</Label>
            <Controller
              name="target"
              control={shiftDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="target"
                  type="number"
                  placeholder="Enter target"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {shiftDetailsForm.formState.errors.target && (
              <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.target.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="setbacks">Setbacks *</Label>
          <Controller
            name="setbacks"
            control={shiftDetailsForm.control}
            render={({ field }) => (
              <Textarea
                id="setbacks"
                placeholder="Describe any setbacks or issues"
                {...field}
              />
            )}
          />
          {shiftDetailsForm.formState.errors.setbacks && (
            <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.setbacks.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium">Stoppage Time (Minutes) - Form 2 Specific</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capper_1">Capper 1 *</Label>
              <Controller
                name="capper_1"
                control={shiftDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="capper_1"
                    type="number"
                    placeholder="Enter minutes"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {shiftDetailsForm.formState.errors.capper_1 && (
                <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.capper_1.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capper_2">Capper 2 *</Label>
              <Controller
                name="capper_2"
                control={shiftDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="capper_2"
                    type="number"
                    placeholder="Enter minutes"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {shiftDetailsForm.formState.errors.capper_2 && (
                <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.capper_2.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleever_1">Sleever 1 *</Label>
              <Controller
                name="sleever_1"
                control={shiftDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="sleever_1"
                    type="number"
                    placeholder="Enter minutes"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {shiftDetailsForm.formState.errors.sleever_1 && (
                <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.sleever_1.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleever_2">Sleever 2 *</Label>
              <Controller
                name="sleever_2"
                control={shiftDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="sleever_2"
                    type="number"
                    placeholder="Enter minutes"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {shiftDetailsForm.formState.errors.sleever_2 && (
                <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.sleever_2.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shrink_1">Shrink 1 *</Label>
              <Controller
                name="shrink_1"
                control={shiftDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="shrink_1"
                    type="number"
                    placeholder="Enter minutes"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {shiftDetailsForm.formState.errors.shrink_1 && (
                <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.shrink_1.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shrink_2">Shrink 2 *</Label>
              <Controller
                name="shrink_2"
                control={shiftDetailsForm.control}
                render={({ field }) => (
                  <Input
                    id="shrink_2"
                    type="number"
                    placeholder="Enter minutes"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {shiftDetailsForm.formState.errors.shrink_2 && (
                <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.shrink_2.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Controller
              name="supervisor_approve"
              control={shiftDetailsForm.control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="supervisor_approve"
                  checked={field.value}
                  onChange={field.onChange}
                  className="rounded"
                />
              )}
            />
            <Label htmlFor="supervisor_approve">Supervisor Approval</Label>
          </div>
          {shiftDetailsForm.formState.errors.supervisor_approve && (
            <p className="text-sm text-red-500">{shiftDetailsForm.formState.errors.supervisor_approve.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>
            {mode === "edit" ? "Edit Filmatic Lines Form 2" : "Create Filmatic Lines Form 2"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1 
              ? "Shift Selection: Choose which shift you are creating data for"
              : currentStep === 2
              ? "Basic Information: Enter the basic form information and bottle counts"
              : "Shift Details: Enter the specific shift details and production information"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white" key={`form-${open}-${currentStep}`}>
          {currentStep === 1 ? renderStep2() : currentStep === 2 ? renderStep1() : renderStep3()}
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
              {currentStep === 1 ? "Shift Selection" : currentStep === 2 ? "Basic Information" : "Shift Details"} • Step {currentStep} of 3
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
              onClick={shiftDetailsForm.handleSubmit(handleShiftDetailsSubmit)}
              disabled={loading.create}
            >
              {mode === "edit" ? "Update Form" : "Create Form"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}