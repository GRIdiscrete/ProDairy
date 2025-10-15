"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { FilmaticLinesForm1, filmaticLinesForm1Api } from "@/lib/api/filmatic-lines-form-1"
import { BMTControlForm, bmtControlFormApi } from "@/lib/api/bmt-control-form"
import { FilmaticLinesGroup, filmaticLinesGroupsApi } from "@/lib/api/filmatic-lines-groups"
import { useAuth } from "@/hooks/use-auth"
import { useAppDispatch } from "@/lib/store"
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
import { Switch } from "@/components/ui/switch"
import { ArrowRight, Factory, Beaker, FileText, Package, Clock, Sun, Moon, Users, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { fetchFilmaticLinesForm1s } from "@/lib/store/slices/filmaticLinesForm1Slice"

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
  approved: yup.boolean().default(false),
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
  supervisor_id: yup.string().nullable(),
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
  approved?: boolean
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
  supervisor_id?: string
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
  const dispatch = useAppDispatch()
  
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
      approved: false,
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
      supervisor_id: "",
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
					approved: !!form.approved,
					day_shift_opening_bottles: form.day_shift_opening_bottles ?? undefined,
					day_shift_closing_bottles: form.day_shift_closing_bottles ?? undefined,
					day_shift_waste_bottles: form.day_shift_waste_bottles ?? undefined,
					night_shift_opening_bottles: form.night_shift_opening_bottles ?? undefined,
					night_shift_closing_bottles: form.night_shift_closing_bottles ?? undefined,
					night_shift_waste_bottles: form.night_shift_waste_bottles ?? undefined,
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

				// Prefill shift details
				try {
					const shiftEntry = shiftType === "day_shift"
						? (Array.isArray(form.filmatic_line_form_1_day_shift) ? form.filmatic_line_form_1_day_shift[0] : undefined)
						: (Array.isArray(form.filmatic_line_form_1_night_shift) ? form.filmatic_line_form_1_night_shift[0] : undefined)

					if (shiftEntry) {
						const details = Array.isArray(shiftEntry.filmatic_line_form_1_day_shift_details || shiftEntry.filmatic_line_form_1_night_shift_details)
							? (shiftEntry.filmatic_line_form_1_day_shift_details || shiftEntry.filmatic_line_form_1_night_shift_details)
							: []

						const mappedDetails = details.map((d: any) => {
							// pick the first stoppage object if present
							const stoppageArr = d.filmatic_line_form_1_day_shift_details_stoppage_time || d.filmatic_line_form_1_night_shift_details_stoppage_time || []
							const stoppage = Array.isArray(stoppageArr) && stoppageArr.length > 0 ? stoppageArr[0] : {}

							// normalize time to "HH:MM" if "HH:MM:SS"
							let timeVal = d.time || ""
							if (typeof timeVal === "string" && timeVal.indexOf(":") !== -1) {
								const parts = timeVal.split(":")
								if (parts.length >= 2) timeVal = `${parts[0].padStart(2,"0")}:${parts[1].padStart(2,"0")}`
							}

							return {
								time: timeVal,
								pallets: d.pallets ?? undefined,
								target: d.target ?? undefined,
								setbacks: d.setbacks ?? "",
								stoppage_time: {
									product_1: stoppage.product_1 ?? stoppage.product1 ?? undefined,
									product_2: stoppage.product_2 ?? stoppage.product2 ?? undefined,
									filler_1: stoppage.filler_1 ?? undefined,
									filler_2: stoppage.filler_2 ?? undefined,
									capper_1: stoppage.capper_1 ?? undefined,
									capper_2: stoppage.capper_2 ?? undefined,
									sleever_1: stoppage.sleever_1 ?? undefined,
									sleever_2: stoppage.sleever_2 ?? undefined,
									shrink_1: stoppage.shrink_1 ?? undefined,
									shrink_2: stoppage.shrink_2 ?? undefined,
								}
							}
						})

						shiftDetailsForm.reset({
							supervisor_approve: shiftEntry.supervisor_approve ?? false,
							supervisor_id: shiftEntry.supervisor_id ?? "",
							operator_id: shiftEntry.operator_id ?? user?.id ?? "",
							details: mappedDetails.length ? mappedDetails : [{
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
					} else {
						// no shift entry found -> keep defaults
						shiftDetailsForm.reset({
							supervisor_approve: false,
							supervisor_id: "",
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
					}
				} catch (err) {
					console.error("Error pre-filling shift details:", err)
				}

				setCurrentStep(1)
			} else {
				// Reset all forms to clean defaults
				basicInfoForm.reset({
					date: "",
					holding_tank_bmt: "",
					approved: false,
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
				groupSelectionForm.reset({
					selected_group: "",
				})
				shiftDetailsForm.reset({
					supervisor_approve: false,
					supervisor_id: "",
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
	}, [open, mode, form, basicInfoForm, shiftSelectionForm, groupSelectionForm, shiftDetailsForm, user?.id])

  // --- Debugging: Log form states on submit ---
  const onSubmit = async (data: any) => {
    console.log("Submitting form data:", data)
    // ...existing submit logic...
  }
  // --- End debugging ---

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-4xl p-6">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">
            Filmatic Lines Form 1
          </SheetTitle>
          <SheetDescription className="text-sm text-gray-500">
            {mode === "edit" ? "Edit existing record" : "Create new record"}
          </SheetDescription>
        </SheetHeader>

        {/* --- Debugging: Form state dumps --- */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h4>
          <pre className="text-xs text-gray-500 whitespace-pre-wrap">
            {JSON.stringify({
              shiftSelectionForm: shiftSelectionForm.getValues(),
              groupSelectionForm: groupSelectionForm.getValues(),
              basicInfoForm: basicInfoForm.getValues(),
              shiftDetailsForm: shiftDetailsForm.getValues(),
              currentStep,
              mode,
              form,
            }, null, 2)}
          </pre>
        </div>
        {/* --- End debugging ---*/}

        <form onSubmit={shiftDetailsForm.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Shift Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Step 1: Select Shift</h3>
              <Controller
                name="shift_type"
                control={shiftSelectionForm.control}
                render={({ field }) => (
                  <RadioGroup {...field} className="space-x-4">
                    <RadioGroupItem value="day_shift" id="day_shift" />
                    <RadioGroupItem value="night_shift" id="night_shift" />
                  </RadioGroup>
                )}
              />
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  disabled={!shiftSelectionForm.formState.isValid}
                  className="w-full sm:w-auto"
                >
                  Next: Select Group
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Group Selection */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Step 2: Select Group</h3>
              <Controller
                name="selected_group"
                control={groupSelectionForm.control}
                render={({ field }) => (
                  <Select {...field} className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {filmaticGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <div className="flex justify-between mt-4">
                <Button 
                  onClick={() => setCurrentStep(1)} 
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Back: Select Shift
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)} 
                  disabled={!groupSelectionForm.formState.isValid}
                  className="w-full sm:w-auto"
                >
                  Next: Basic Information
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Basic Information */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Step 3: Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="date"
                  control={basicInfoForm.control}
                  render={({ field }) => (
                    <DatePicker 
                      {...field} 
                      label="Date" 
                      placeholder="Select date"
                      className="w-full"
                    />
                  )}
                />
                <Controller
                  name="holding_tank_bmt"
                  control={basicInfoForm.control}
                  render={({ field }) => (
                    <Select {...field} className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select holding tank BMT" />
                      </SelectTrigger>
                      <SelectContent>
                        {bmtForms.map((bmt) => (
                          <SelectItem key={bmt.id} value={bmt.id}>
                            {bmt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {selectedShift === "day_shift" && (
                  <>
                    <Controller
                      name="day_shift_opening_bottles"
                      control={basicInfoForm.control}
                      render={({ field }) => (
                        <Input {...field} type="number" placeholder="Opening bottles" label="Day Shift Opening Bottles" />
                      )}
                    />
                    <Controller
                      name="day_shift_closing_bottles"
                      control={basicInfoForm.control}
                      render={({ field }) => (
                        <Input {...field} type="number" placeholder="Closing bottles" label="Day Shift Closing Bottles" />
                      )}
                    />
                    <Controller
                      name="day_shift_waste_bottles"
                      control={basicInfoForm.control}
                      render={({ field }) => (
                        <Input {...field} type="number" placeholder="Waste bottles" label="Day Shift Waste Bottles" />
                      )}
                    />
                  </>
                )}
                {selectedShift === "night_shift" && (
                  <>
                    <Controller
                      name="night_shift_opening_bottles"
                      control={basicInfoForm.control}
                      render={({ field }) => (
                        <Input {...field} type="number" placeholder="Opening bottles" label="Night Shift Opening Bottles" />
                      )}
                    />
                    <Controller
                      name="night_shift_closing_bottles"
                      control={basicInfoForm.control}
                      render={({ field }) => (
                        <Input {...field} type="number" placeholder="Closing bottles" label="Night Shift Closing Bottles" />
                      )}
                    />
                    <Controller
                      name="night_shift_waste_bottles"
                      control={basicInfoForm.control}
                      render={({ field }) => (
                        <Input {...field} type="number" placeholder="Waste bottles" label="Night Shift Waste Bottles" />
                      )}
                    />
                  </>
                )}
              </div>
              <div className="flex justify-between mt-4">
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Back: Select Group
                </Button>
                <Button 
                  onClick={() => setCurrentStep(4)} 
                  disabled={!basicInfoForm.formState.isValid}
                  className="w-full sm:w-auto"
                >
                  Next: Shift Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Shift Details */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Step 4: Shift Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <Controller
                  name="supervisor_id"
                  control={shiftDetailsForm.control}
                  render={({ field }) => (
                    <Select {...field} className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  name="operator_id"
                  control={shiftDetailsForm.control}
                  render={({ field }) => (
                    <Select {...field} className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select an operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupOperators.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Controller
                      name={`details.${index}.time`}
                      control={shiftDetailsForm.control}
                      render={({ field }) => (
                        <Select {...field} className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Controller
                      name={`details.${index}.pallets`}
                      control={shiftDetailsForm.control}
                      render={({ field }) => (
                        <Input {...field} type="number" placeholder="Pallets" label="Pallets" />
                      )}
                    />
                    <Controller
                      name={`details.${index}.target`}
                      control={shiftDetailsForm.control}
                      render={({ field }) => (
                        <Input {...field} type="number" placeholder="Target" label="Target" />
                      )}
                    />
                    <Controller
                      name={`details.${index}.setbacks`}
                      control={shiftDetailsForm.control}
                      render={({ field }) => (
                        <Textarea {...field} placeholder="Setbacks" label="Setbacks" />
                      )}
                    />
                    <div className="col-span-1 sm:col-span-2">
                      <Button 
                        type="button" 
                        onClick={() => remove(index)} 
                        variant="outline" 
                        className="w-full"
                      >
                        Remove Detail
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => append({ time: "", pallets: undefined, target: undefined, setbacks: "", stoppage_time: {} })} 
                    className="w-full sm:w-auto"
                  >
                    Add Detail
                  </Button>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <Button 
                  onClick={() => setCurrentStep(3)} 
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Back: Basic Information
                </Button>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto"
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}
