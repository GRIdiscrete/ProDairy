"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { FilmaticLinesForm1, filmaticLinesForm1Api } from "@/lib/api/filmatic-lines-form-1"
import { BMTControlForm, bmtControlFormApi } from "@/lib/api/bmt-control-form"
import { FilmaticLinesGroup, filmaticLinesGroupsApi } from "@/lib/api/filmatic-lines-groups"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Factory, Beaker, FileText, Package, Clock, Sun, Moon, Users, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

interface FilmaticLinesForm1DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: FilmaticLinesForm1 | null
  mode?: "create" | "edit"
  processId?: string
}

// Time options for shifts
const DAY_SHIFT_TIMES = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
]

const NIGHT_SHIFT_TIMES = [
  "19:00", "20:00", "21:00", "22:00", "23:00", 
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00"
]

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Beaker className="w-4 h-4 text-orange-600" />
        </div>
        <span className="text-sm font-light">Standardizing</span>
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
          <Package className="h-4 w-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Palletizer</span>
      </div>
    </div>
  </div>
)

// Step 1: Shift Selection Schema
const shiftSelectionSchema = yup.object({
  shift_type: yup.string().required("Shift type is required"),
})

// Step 2: Group Selection Schema
const groupSelectionSchema = yup.object({
  selected_group: yup.string().required("Group selection is required"),
})

// Step 3: Basic Information Schema (conditional validation based on shift)
const createBasicInfoSchema = (selectedShift: string) => yup.object({
  date: yup.string().required("Date is required"),
  holding_tank_bmt: yup.string().required("Holding tank BMT is required"),
  ...(selectedShift === "day_shift" && {
    day_shift_opening_bottles: yup.number().required("Day shift opening bottles is required").min(0, "Must be positive"),
    day_shift_closing_bottles: yup.number().nullable(),
    day_shift_waste_bottles: yup.number().nullable(),
  }),
  ...(selectedShift === "night_shift" && {
    night_shift_opening_bottles: yup.number().required("Night shift opening bottles is required").min(0, "Must be positive"),
    night_shift_closing_bottles: yup.number().nullable(),
    night_shift_waste_bottles: yup.number().nullable(),
  }),
})

// Step 4: Shift Details Schema (simplified for debugging)
const shiftDetailsSchema = yup.object({
  supervisor_approve: yup.boolean(),
  operator_id: yup.string(),
  details: yup.array().of(
    yup.object({
      time: yup.string(),
      pallets: yup.number().min(0, "Must be positive"),
      target: yup.number().min(0, "Must be positive"),
      setbacks: yup.string(),
      stoppage_time: yup.object()
    })
  )
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
type GroupSelectionFormData = yup.InferType<typeof groupSelectionSchema>
type ShiftDetailsFormData = {
  supervisor_approve?: boolean
  operator_id?: string
  details?: Array<{
    time?: string
    pallets?: number
    target?: number
    setbacks?: string
    stoppage_time?: any
  }>
}

export function FilmaticLinesForm1Drawer({ 
  open, 
  onOpenChange, 
  form, 
  mode = "create",
  processId
}: FilmaticLinesForm1DrawerProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState({ create: false })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [bmtForms, setBmtForms] = useState<BMTControlForm[]>([])
  const [filmaticGroups, setFilmaticGroups] = useState<FilmaticLinesGroup[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loadingBmtForms, setLoadingBmtForms] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Step 1: Shift selection form
  const shiftSelectionForm = useForm<ShiftSelectionFormData>({
    resolver: yupResolver(shiftSelectionSchema),
    defaultValues: {
      shift_type: "",
    },
  })

  // Step 2: Group selection form
  const groupSelectionForm = useForm<GroupSelectionFormData>({
    resolver: yupResolver(groupSelectionSchema),
    defaultValues: {
      selected_group: "",
    },
  })

  // Get selected shift and group
  const selectedShift = shiftSelectionForm.watch("shift_type")
  const selectedGroup = groupSelectionForm.watch("selected_group")
  
  // Create dynamic schema based on selected shift
  const basicInfoSchema = useMemo(() => {
    return createBasicInfoSchema(selectedShift || "")
  }, [selectedShift])

  // Get selected group data - using first record as specified
  const selectedGroupData = useMemo(() => {
    if (!selectedGroup || !filmaticGroups.length) return null
    const firstGroup = filmaticGroups[0] // Using first group record as specified
    if (selectedGroup === "group_a") return { members: firstGroup.group_a, manager_id: firstGroup.manager_id }
    if (selectedGroup === "group_b") return { members: firstGroup.group_b, manager_id: firstGroup.manager_id }
    if (selectedGroup === "group_c") return { members: firstGroup.group_c, manager_id: firstGroup.manager_id }
    return null
  }, [selectedGroup, filmaticGroups])

  // Get operators for selected group
  const groupOperators = useMemo(() => {
    if (!selectedGroupData || !users.length) return []
    return users.filter(user => selectedGroupData.members.includes(user.id))
  }, [selectedGroupData, users])

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

  // Step 4: Shift details form with array fields
  const shiftDetailsForm = useForm<ShiftDetailsFormData>({
    resolver: yupResolver(shiftDetailsSchema),
    defaultValues: {
      supervisor_approve: false,
      operator_id: user?.id || "",
      details: [{
        time: "",
        pallets: undefined,
        target: undefined,
        setbacks: "",
        stoppage_time: {
          product_1: undefined,
          product_2: undefined,
          filler_1: undefined,
          filler_2: undefined,
          capper_1: undefined,
          capper_2: undefined,
          sleever_1: undefined,
          sleever_2: undefined,
          shrink_1: undefined,
          shrink_2: undefined,
        }
      }]
    },
  })

  const timeOptions = selectedShift === "day_shift" ? DAY_SHIFT_TIMES : NIGHT_SHIFT_TIMES

  const { fields, append, remove } = useFieldArray({
    control: shiftDetailsForm.control,
    name: "details"
  })

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!open) return
      
      setLoadingBmtForms(true)
      setLoadingGroups(true)
      setLoadingUsers(true)
      
      try {
        // Load BMT Control forms
        try {
          const bmtFormsResponse = await bmtControlFormApi.getAll()
          setBmtForms(bmtFormsResponse || [])
        } catch (error) {
          console.error("Failed to load BMT Control forms:", error)
          setBmtForms([])
        }

        // Load Filmatic Lines Groups
        try {
          const groupsResponse = await filmaticLinesGroupsApi.getGroups()
          if (groupsResponse && groupsResponse.data) {
            setFilmaticGroups(groupsResponse.data)
          } else {
            setFilmaticGroups([])
          }
        } catch (error) {
          console.error("Failed to load Filmatic Lines Groups:", error)
          setFilmaticGroups([])
        }

        // TODO: Load users from actual API when available
        setUsers([])
      } finally {
        setLoadingBmtForms(false)
        setLoadingGroups(false)
        setLoadingUsers(false)
      }
    }

    loadData()
  }, [open])

  // Reset forms when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && form) {
        // Populate forms with existing data for edit mode
        console.log("Edit mode - populating form data:", form)
        
        // Populate basic info form
        basicInfoForm.reset({
          date: form.date || "",
          holding_tank_bmt: form.holding_tank_bmt || "",
          day_shift_opening_bottles: undefined,
          day_shift_closing_bottles: undefined,
          night_shift_opening_bottles: undefined,
          night_shift_closing_bottles: undefined,
          day_shift_waste_bottles: undefined,
          night_shift_waste_bottles: undefined,
        })

        // Determine shift type based on existing data
        let shiftType = ""
        if (form.filmatic_line_form_1_day_shift && form.filmatic_line_form_1_day_shift.length > 0) {
          shiftType = "day_shift"
        } else if (form.filmatic_line_form_1_night_shift && form.filmatic_line_form_1_night_shift.length > 0) {
          shiftType = "night_shift"
        }

        shiftSelectionForm.reset({
          shift_type: shiftType,
        })

        // Determine group selection based on existing data
        let selectedGroupType = ""
        if (form.groups) {
          if (form.groups.group_a && form.groups.group_a.length > 0) selectedGroupType = "group_a"
          else if (form.groups.group_b && form.groups.group_b.length > 0) selectedGroupType = "group_b"
          else if (form.groups.group_c && form.groups.group_c.length > 0) selectedGroupType = "group_c"
        }

        groupSelectionForm.reset({
          selected_group: selectedGroupType,
        })

        setCurrentStep(1)
      } else {
        // Reset all forms to clean defaults
        basicInfoForm.reset({
          date: "",
          holding_tank_bmt: "",
          day_shift_opening_bottles: undefined,
          day_shift_closing_bottles: undefined,
          night_shift_opening_bottles: undefined,
          night_shift_closing_bottles: undefined,
          day_shift_waste_bottles: undefined,
          night_shift_waste_bottles: undefined,
        })
        shiftSelectionForm.reset({
          shift_type: "",
        })
        shiftDetailsForm.reset({
          supervisor_approve: false,
          operator_id: user?.id || "",
          details: [{
            time: "",
            pallets: undefined,
            target: undefined,
            setbacks: "",
            stoppage_time: {
              product_1: undefined,
              product_2: undefined,
              filler_1: undefined,
              filler_2: undefined,
              capper_1: undefined,
              capper_2: undefined,
              sleever_1: undefined,
              sleever_2: undefined,
              shrink_1: undefined,
              shrink_2: undefined,
            }
          }]
        })
        setCurrentStep(1)
      }
    }
  }, [open, mode, form, basicInfoForm, shiftSelectionForm, shiftDetailsForm])

  const handleShiftSelectionSubmit = async (data: ShiftSelectionFormData) => {
    setCurrentStep(2)
  }

  const handleGroupSelectionSubmit = async (data: GroupSelectionFormData) => {
    setCurrentStep(3)
  }

  const handleBasicInfoSubmit = async (data: any) => {
    setCurrentStep(4)
  }

  const handleShiftDetailsSubmit = async (data: ShiftDetailsFormData) => {
    console.log("Form submission started...")
    console.log("Shift details data:", data)
    
    setLoading({ create: true })
    
    try {
      const basicInfo = basicInfoForm.getValues()
      const shiftType = shiftSelectionForm.getValues().shift_type
      
      console.log("Basic info:", basicInfo)
      console.log("Shift type:", shiftType)
      console.log("Selected group:", selectedGroup)
      console.log("Selected group data:", selectedGroupData)
      
      // Build the form data according to the correct API structure
      const formData: any = {
        approved: true,
        process_id: processId || "",
        date: basicInfo.date,
        holding_tank_bmt: basicInfo.holding_tank_bmt,
        groups: selectedGroupData ? {
          group_a: selectedGroup === "group_a" ? selectedGroupData.members : [],
          manager_id: selectedGroupData.manager_id
        } : undefined
      }

      // Add shift-specific bottle counts and shift data
      if (shiftType === "day_shift") {
        formData.day_shift_opening_bottles = Number(basicInfo.day_shift_opening_bottles) || 0
        formData.day_shift_closing_bottles = Number(basicInfo.day_shift_closing_bottles) || 0
        formData.day_shift_waste_bottles = Number(basicInfo.day_shift_waste_bottles) || 0
        
        // Add day_shift object (not filmatic_line_form_1_day_shift)
        formData.day_shift = {
          supervisor_approve: data.supervisor_approve,
          operator_id: data.operator_id,
          details: data.details.map((detail: any) => ({
            time: detail.time,
            pallets: detail.pallets,
            target: detail.target,
            setbacks: detail.setbacks,
            stoppage_time: [detail.stoppage_time] // Array of stoppage time objects
          }))
        }
      } else if (shiftType === "night_shift") {
        formData.night_shift_opening_bottles = Number(basicInfo.night_shift_opening_bottles) || 0
        formData.night_shift_closing_bottles = Number(basicInfo.night_shift_closing_bottles) || 0
        formData.night_shift_waste_bottles = Number(basicInfo.night_shift_waste_bottles) || 0
        
        // Add night_shift object (not filmatic_line_form_1_night_shift)
        formData.night_shift = {
          supervisor_approve: data.supervisor_approve,
          operator_id: data.operator_id,
          details: data.details.map((detail: any) => ({
            time: detail.time,
            pallets: detail.pallets,
            target: detail.target,
            setbacks: detail.setbacks,
            stoppage_time: [detail.stoppage_time] // Array of stoppage time objects
          }))
        }
      }

      console.log("Submitting form data:", JSON.stringify(formData, null, 2))
      
      const response = await filmaticLinesForm1Api.createForm(formData)
      console.log("Filmatic Lines Form created successfully:", response)
      
      // Show success snackbar
      toast.success("Filmatic Lines Form created successfully!", {
        description: "Your form has been submitted and saved.",
        duration: 4000,
      })
      
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to create Filmatic Lines Form:", error)
      
      // Show error snackbar
      toast.error("Failed to create form", {
        description: error.message || "An unexpected error occurred. Please try again.",
        duration: 5000,
      })
    } finally {
      setLoading({ create: false })
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
      groupSelectionForm.handleSubmit(handleGroupSelectionSubmit)()
    } else if (currentStep === 3) {
      basicInfoForm.handleSubmit(handleBasicInfoSubmit)()
    }
  }

  const handleBmtFormSearch = async (query: string) => {
    if (!query.trim()) {
      // Return all BMT forms if no query
      return bmtForms.map(bmtForm => ({
        value: bmtForm.id,
        label: `BMT Form #${bmtForm.id?.slice(0, 8)}`,
        description: `${bmtForm.product} • Volume: ${bmtForm.volume}L • ${bmtForm.flow_meter_start ? new Date(bmtForm.flow_meter_start).toLocaleDateString() : 'No date'}`
      }))
    }
    
    try {
      // Filter loaded BMT forms based on query
      return bmtForms
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

  const renderStep1 = () => (
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
                      <div className="text-sm text-gray-500">08:00 - 18:00</div>
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
                      <div className="text-sm text-gray-500">19:00 - 06:00</div>
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

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />

      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Group Selection</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Select the group for this shift</p>
        </div>

        {loadingGroups ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading groups...</p>
          </div>
        ) : filmaticGroups.length > 0 ? (
          <div className="space-y-4">
            <Controller
              name="selected_group"
              control={groupSelectionForm.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-4"
                >
                  {["group_a", "group_b", "group_c"].map((groupKey) => {
                    const firstGroup = filmaticGroups[0] // Using first group record as specified
                    const members = firstGroup[groupKey as keyof FilmaticLinesGroup] as string[]

                    return (
                      <div key={groupKey} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={groupKey} id={groupKey} />
                        <Label htmlFor={groupKey} className="flex items-center space-x-3 cursor-pointer w-full">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Group {groupKey.split('_')[1].toUpperCase()}</div>
                            <div className="text-sm text-gray-500">{members?.length || 0} members</div>
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              )}
            />
            {groupSelectionForm.formState.errors.selected_group && (
              <p className="text-sm text-red-500">{groupSelectionForm.formState.errors.selected_group.message}</p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No groups available</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
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
                  label: bmtForm?.tag,
                  description: `${bmtForm.product} • Volume: ${bmtForm.volume ??0}L • `
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
                      value={String(field.value || "")}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  )}
                />
                {basicInfoForm.formState.errors.day_shift_opening_bottles && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.day_shift_opening_bottles.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="day_shift_closing_bottles">Day Shift Closing Bottles</Label>
                <Controller
                  name="day_shift_closing_bottles"
                  control={basicInfoForm.control}
                  render={({ field }) => (
                    <Input
                      id="day_shift_closing_bottles"
                      type="number"
                      placeholder="Enter closing bottles"
                      className="rounded-full border-gray-200"
                      value={String(field.value || "")}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  )}
                />
                {basicInfoForm.formState.errors.day_shift_closing_bottles && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.day_shift_closing_bottles.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="day_shift_waste_bottles">Day Shift Waste Bottles</Label>
              <Controller
                name="day_shift_waste_bottles"
                control={basicInfoForm.control}
                render={({ field }) => (
                  <Input
                    id="day_shift_waste_bottles"
                    type="number"
                    placeholder="Enter waste bottles"
                    className="rounded-full border-gray-200"
                    value={String(field.value || "")}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    onBlur={field.onBlur}
                    name={field.name}
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
                      value={String(field.value || "")}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  )}
                />
                {basicInfoForm.formState.errors.night_shift_opening_bottles && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.night_shift_opening_bottles.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="night_shift_closing_bottles">Night Shift Closing Bottles</Label>
                <Controller
                  name="night_shift_closing_bottles"
                  control={basicInfoForm.control}
                  render={({ field }) => (
                    <Input
                      id="night_shift_closing_bottles"
                      type="number"
                      placeholder="Enter closing bottles"
                      className="rounded-full border-gray-200"
                      value={String(field.value || "")}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  )}
                />
                {basicInfoForm.formState.errors.night_shift_closing_bottles && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.night_shift_closing_bottles.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="night_shift_waste_bottles">Night Shift Waste Bottles</Label>
              <Controller
                name="night_shift_waste_bottles"
                control={basicInfoForm.control}
                render={({ field }) => (
                  <Input
                    id="night_shift_waste_bottles"
                    type="number"
                    placeholder="Enter waste bottles"
                    className="rounded-full border-gray-200"
                    value={String(field.value || "")}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    onBlur={field.onBlur}
                    name={field.name}
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

  const renderStep4 = () => {
    const timeOptions = selectedShift === "day_shift" ? DAY_SHIFT_TIMES : NIGHT_SHIFT_TIMES

    return (
      <div className="space-y-6 p-6">
        <ProcessOverview />

        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Shift Details</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Enter the specific shift details and production information</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="supervisor_approve"
                control={shiftDetailsForm.control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>


            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Production Details</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    time: "",
                    pallets: 0,
                    target: 0,
                    setbacks: "",
                    stoppage_time: {
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
                    }
                  })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Entry
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Entry {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Time</Label>
                      <Controller
                        name={`details.${index}.time`}
                        control={shiftDetailsForm.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="rounded-full border-gray-200">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div>
                      <Label>Pallets</Label>
                      <Controller
                        name={`details.${index}.pallets`}
                        control={shiftDetailsForm.control}
                        render={({ field }) => (
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        )}
                      />
                    </div>

                    <div>
                      <Label>Target</Label>
                      <Controller
                        name={`details.${index}.target`}
                        control={shiftDetailsForm.control}
                        render={({ field }) => (
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Setbacks</Label>
                      <Controller
                        name={`details.${index}.setbacks`}
                        control={shiftDetailsForm.control}
                        render={({ field }) => (
                          <Textarea {...field} placeholder="Describe any setbacks" />
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Stoppage Time (minutes)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["product_1", "product_2", "filler_1", "filler_2", "capper_1", "capper_2", "sleever_1", "sleever_2", "shrink_1", "shrink_2"].map(key => (
                        <div key={key} className="flex items-center gap-2">
                          <Label className="text-xs w-20">{key.replace('_', ' ')}</Label>
                          <Controller
                            name={`details.${index}.stoppage_time.${key}`}
                            control={shiftDetailsForm.control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                className="h-8"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>
            {mode === "edit" ? "Edit Filmatic Lines Form 1" : "Create Filmatic Lines Form 1"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1 
              ? "Step 1: Shift Selection - Choose which shift you are creating data for"
              : currentStep === 2
              ? "Step 2: Group Selection - Select the group for this shift"
              : currentStep === 3
              ? "Step 3: Basic Information - Enter the basic form information and bottle counts"
              : "Step 4: Shift Details - Enter the specific shift details and production information"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white" key={`form-${open}-${currentStep}`}>
          {currentStep === 1 ? renderStep1() : 
           currentStep === 2 ? renderStep2() : 
           currentStep === 3 ? renderStep3() : 
           renderStep4()}
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
              Step {currentStep} of 4
            </span>
          </div>

          {currentStep < 4 ? (
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
              onClick={() => {
                console.log("Create Form button clicked!")
                console.log("Form errors:", shiftDetailsForm.formState.errors)
                console.log("Form values:", shiftDetailsForm.getValues())
                shiftDetailsForm.handleSubmit(handleShiftDetailsSubmit)()
              }}
              disabled={loading.create}
            >
              {loading.create ? "Creating..." : (mode === "edit" ? "Update Form" : "Create Form")}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
