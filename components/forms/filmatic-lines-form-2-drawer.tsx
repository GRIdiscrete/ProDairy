"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { FilmaticLinesForm2, filmaticLinesForm2Api, CreateFilmaticLinesForm2Request } from "@/lib/api/filmatic-lines-form-2"
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
import { fetchFilmaticLinesForm2s } from "@/lib/store/slices/filmaticLinesForm2Slice"

interface FilmaticLinesForm2DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: FilmaticLinesForm2 | null
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
  <div className="mb-8 p-6  from-blue-50 to-cyan-50 rounded-lg">
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
          <div className=" bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
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

// Step 3: Basic Information Schema (conditional validation based on shift) - Form 2 has no holding_tank_bmt
const createBasicInfoSchema = (selectedShift: string) => yup.object({
  date: yup.string().required("Date is required"),
  approved: yup.boolean().default(false),
  day_shift_opening_bottles: yup.number().required("Day shift opening bottles is required").min(0, "Must be positive"),
  // closing and waste are optional (no longer required)
  day_shift_closing_bottles: yup.number().min(0, "Must be positive").nullable(),
  day_shift_waste_bottles: yup.number().min(0, "Must be positive").nullable(),
  night_shift_opening_bottles: yup.number().required("Night shift opening bottles is required").min(0, "Must be positive"),
  night_shift_closing_bottles: yup.number().min(0, "Must be positive").nullable(),
  night_shift_waste_bottles: yup.number().min(0, "Must be positive").nullable(),
})

// Step 4: Shift Details Schema (Form 2 specific - only 6 stoppage fields)
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
  id?: string
  supervisor_approve: boolean | undefined
  operator_id: string | undefined
  details?: Array<{
    id?: string
    time?: string
    pallets?: number
    target?: number
    setbacks?: string
    stoppage_time?: any
  }>
}

export function FilmaticLinesForm2Drawer({
  open,
  onOpenChange,
  form,
  mode = "create",
  processId
}: FilmaticLinesForm2DrawerProps) {
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
    if (selectedGroup === "group_a") return { id: firstGroup.id, members: firstGroup.group_a, manager_id: firstGroup.manager_id }
    if (selectedGroup === "group_b") return { id: firstGroup.id, members: firstGroup.group_b, manager_id: firstGroup.manager_id }
    if (selectedGroup === "group_c") return { id: firstGroup.id, members: firstGroup.group_c, manager_id: firstGroup.manager_id }
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
      approved: false,
      day_shift_opening_bottles: undefined,
      day_shift_closing_bottles: undefined,
      night_shift_opening_bottles: undefined,
      night_shift_closing_bottles: undefined,
    },
  })

  // Step 4: Shift details form with array fields (Form 2 stoppage fields)
  const shiftDetailsForm = useForm<ShiftDetailsFormData>({
    resolver: yupResolver(shiftDetailsSchema) as any,
    defaultValues: {
      supervisor_approve: false,
      operator_id: user?.id || "",
      details: [{
        time: "",
        pallets: undefined,
        target: undefined,
        setbacks: "",
        stoppage_time: {
          capper_1_hours: undefined,
          capper_2_hours: undefined,
          sleever_1_hours: undefined,
          sleever_2_hours: undefined,
          shrink_1_hours: undefined,
          shrink_2_hours: undefined,
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

        // Populate basic info form using server values
        basicInfoForm.reset({
          date: form.date || "",
          approved: !!form.approved,
          day_shift_opening_bottles: (form as any).day_shift_opening_bottles ?? undefined,
          day_shift_closing_bottles: (form as any).day_shift_closing_bottles ?? undefined,
          day_shift_waste_bottles: (form as any).day_shift_waste_bottles ?? undefined,
          night_shift_opening_bottles: (form as any).night_shift_opening_bottles ?? undefined,
          night_shift_closing_bottles: (form as any).night_shift_closing_bottles ?? undefined,
          night_shift_waste_bottles: (form as any).night_shift_waste_bottles ?? undefined,
        })


        // Determine shift type based on existing data (support new API structure)
        let shiftType = ""
        const hasDayObject = !!(form as any).day_shift_id
        const hasNightObject = !!(form as any).night_shift_id
        const hasDayArray = Array.isArray((form as any).filmatic_line_form_2_day_shift) && (form as any).filmatic_line_form_2_day_shift.length > 0
        const hasNightArray = Array.isArray((form as any).filmatic_line_form_2_night_shift) && (form as any).filmatic_line_form_2_night_shift.length > 0
        const hasLegacyDay = (form as any).day_shift && Object.keys((form as any).day_shift).length > 0
        const hasLegacyNight = (form as any).night_shift && Object.keys((form as any).night_shift).length > 0

        if (hasDayObject || hasDayArray || hasLegacyDay) shiftType = "day_shift"
        else if (hasNightObject || hasNightArray || hasLegacyNight) shiftType = "night_shift"

        shiftSelectionForm.reset({ shift_type: shiftType })

        // Determine group selection based on existing data
        let selectedGroupType = ""
        if ((form as any).groups) {
          if ((form as any).groups.group_a && (form as any).groups.group_a.length > 0) selectedGroupType = "group_a"
          else if ((form as any).groups.group_b && (form as any).groups.group_b.length > 0) selectedGroupType = "group_b"
          else if ((form as any).groups.group_c && (form as any).groups.group_c.length > 0) selectedGroupType = "group_c"
        }
        groupSelectionForm.reset({ selected_group: selectedGroupType })

        // prefill details from detected shift (support new API object structure, arrays, and legacy)
        try {
          let shiftEntry: any = null

          if (shiftType === "day_shift") {
            if (hasDayObject) shiftEntry = (form as any).day_shift_id
            else if (hasDayArray) shiftEntry = (form as any).filmatic_line_form_2_day_shift[0] || null
            else shiftEntry = (form as any).day_shift || null
          } else if (shiftType === "night_shift") {
            if (hasNightObject) shiftEntry = (form as any).night_shift_id
            else if (hasNightArray) shiftEntry = (form as any).filmatic_line_form_2_night_shift[0] || null
            else shiftEntry = (form as any).night_shift || null
          }

          if (shiftEntry) {
            // New API structure: shift_details is an object with nested stoppage_time_id
            if (shiftEntry.shift_details) {
              const detail = shiftEntry.shift_details
              const stoppage = detail.stoppage_time_id || {}

              const mapped = [{
                id: detail.id,
                time: detail.time?.split(' ')[1]?.slice(0, 5) || detail.time || '',
                pallets: detail.pallets ?? undefined,
                target: detail.target ?? undefined,
                setbacks: detail.setbacks || '',
                stoppage_time: {
                  id: stoppage.id,
                  capper_1_hours: stoppage.capper_1_hours ?? undefined,
                  capper_2_hours: stoppage.capper_2_hours ?? undefined,
                  sleever_1_hours: stoppage.sleever_1_hours ?? undefined,
                  sleever_2_hours: stoppage.sleever_2_hours ?? undefined,
                  shrink_1_hours: stoppage.shrink_1_hours ?? undefined,
                  shrink_2_hours: stoppage.shrink_2_hours ?? undefined,
                  capper_1: stoppage.capper_1 ?? undefined,
                  capper_2: stoppage.capper_2 ?? undefined,
                  sleever_1: stoppage.sleever_1 ?? undefined,
                  sleever_2: stoppage.sleever_2 ?? undefined,
                  shrink_1: stoppage.shrink_1 ?? undefined,
                  shrink_2: stoppage.shrink_2 ?? undefined,
                }
              }]

              shiftDetailsForm.reset({
                supervisor_approve: shiftEntry?.supervisor_approve ?? false,
                operator_id: shiftEntry?.operator_id ?? user?.id ?? '',
                details: mapped
              })
            }
            // Legacy array structure: shift_details is an array
            else {
              const detailsKey = shiftType === "day_shift" ? "filmatic_line_form_2_day_shift_details" : "filmatic_line_form_2_night_shift_details"
              const stoppageKey = shiftType === "day_shift" ? "filmatic_line_form_2_day_shift_details_stoppage_time" : "filmatic_line_form_2_night_shift_details_stoppage_time"
              const details = shiftEntry[detailsKey] || []

              const mapped = details.map((d: any) => {
                const stoppageArray = d[stoppageKey] || []
                const stoppage = stoppageArray[0] || {}

                return {
                  id: d.id,
                  time: d.time?.split(' ')[1]?.slice(0, 5) || '',
                  pallets: d.pallets ?? undefined,
                  target: d.target ?? undefined,
                  setbacks: d.setbacks || '',
                  stoppage_time: {
                    id: stoppage.id,
                    capper_1_hours: stoppage.capper_1_hours ?? stoppage.capper_1 ?? undefined,
                    capper_2_hours: stoppage.capper_2_hours ?? stoppage.capper_2 ?? undefined,
                    sleever_1_hours: stoppage.sleever_1_hours ?? stoppage.sleever_1 ?? undefined,
                    sleever_2_hours: stoppage.sleever_2_hours ?? stoppage.sleever_2 ?? undefined,
                    shrink_1_hours: stoppage.shrink_1_hours ?? stoppage.shrink_1 ?? undefined,
                    shrink_2_hours: stoppage.shrink_2_hours ?? stoppage.shrink_2 ?? undefined,
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
                supervisor_approve: shiftEntry?.supervisor_approve ?? false,
                operator_id: shiftEntry?.operator_id ?? user?.id ?? '',
                details: mapped.length ? mapped : shiftDetailsForm.getValues().details
              })
            }
          }
        } catch (err) {
          console.error("Error pre-filling shift details:", err)
        }


        setCurrentStep(1)
      } else {
        // Reset all forms to clean defaults
        basicInfoForm.reset({
          date: "",
          approved: false,
          day_shift_opening_bottles: undefined,
          day_shift_closing_bottles: undefined,
          day_shift_waste_bottles: undefined,
          night_shift_opening_bottles: undefined,
          night_shift_closing_bottles: undefined,
          night_shift_waste_bottles: undefined,
        })
        shiftSelectionForm.reset({ shift_type: "" })
        groupSelectionForm.reset({ selected_group: "" })
        shiftDetailsForm.reset({
          supervisor_approve: false,
          operator_id: user?.id || "",
          details: [{
            time: "",
            pallets: undefined,
            target: undefined,
            setbacks: "",
            stoppage_time: {
              capper_1_hours: undefined,
              capper_2_hours: undefined,
              sleever_1_hours: undefined,
              sleever_2_hours: undefined,
              shrink_1_hours: undefined,
              shrink_2_hours: undefined,
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

  const handleShiftSelectionSubmit = async (data: ShiftSelectionFormData) => {
    setCurrentStep(2)
  }

  const handleGroupSelectionSubmit = async (data: GroupSelectionFormData) => {
    // Validate that selected group has members
    if (!selectedGroupData || !selectedGroupData.members || selectedGroupData.members.length === 0) {
      toast.error("Selected group has no members. Please select a group with at least one member.")
      return
    }
    setCurrentStep(3)
  }

  const handleBasicInfoSubmit = async (data: any) => {
    setCurrentStep(4)
  }

  const handleShiftDetailsSubmit = async (data: ShiftDetailsFormData) => {
    try {
      setLoading({ create: true })
      console.log("Submitting form with data:", data)

      const basicInfo = basicInfoForm.getValues()
      const shiftType = shiftSelectionForm.getValues().shift_type
      const groupData = groupSelectionForm.getValues()

      console.log("Basic info:", basicInfo)
      console.log("Shift type:", shiftType)
      console.log("Group data:", groupData)

      const formData: CreateFilmaticLinesForm2Request = {
        approved: !!basicInfo.approved,
        process_id: processId || "",
        date: basicInfo.date,
        // Add bottle counts based on selected shift (only include selected shift fields)
        ...(shiftType === "day_shift" && {
          day_shift_opening_bottles: basicInfo.day_shift_opening_bottles ?? 0,
          day_shift_closing_bottles: basicInfo.day_shift_closing_bottles ?? undefined,
          day_shift_waste_bottles: basicInfo.day_shift_waste_bottles ?? undefined,
        }),
        ...(shiftType === "night_shift" && {
          night_shift_opening_bottles: basicInfo.night_shift_opening_bottles ?? 0,
          night_shift_closing_bottles: basicInfo.night_shift_closing_bottles ?? undefined,
          night_shift_waste_bottles: basicInfo.night_shift_waste_bottles ?? undefined,
        }),
        groups: selectedGroupData ? {
          [groupData.selected_group]: selectedGroupData.members,
          manager_id: selectedGroupData.manager_id
        } : undefined,
      }

      // Add shift data based on selection
      if (shiftType === "day_shift") {
        formData.day_shift_id = {
          ...(mode === "edit" && form?.filmatic_line_form_2_day_shift?.[0]?.id ? { id: form.filmatic_line_form_2_day_shift[0].id } : {}),
          supervisor_approve: data.supervisor_approve || false,
          operator_id: data.operator_id || user?.id || "",
          shift_details: data.details?.map((detail: any) => ({
            ...(detail.id ? { id: detail.id } : {}),
            time: detail.time ? `${basicInfo.date} ${detail.time}:00+00` : "",
            pallets: detail.pallets || 0,
            target: detail.target || 0,
            setbacks: detail.setbacks || "",
            stoppage_time: [{
              ...((detail.stoppage_time as any)?.id ? { id: (detail.stoppage_time as any).id } : {}),
              capper_1_hours: detail.stoppage_time?.capper_1_hours ?? detail.stoppage_time?.capper_1 ?? null,
              capper_2_hours: detail.stoppage_time?.capper_2_hours ?? detail.stoppage_time?.capper_2 ?? null,
              sleever_1_hours: detail.stoppage_time?.sleever_1_hours ?? detail.stoppage_time?.sleever_1 ?? null,
              sleever_2_hours: detail.stoppage_time?.sleever_2_hours ?? detail.stoppage_time?.sleever_2 ?? null,
              shrink_1_hours: detail.stoppage_time?.shrink_1_hours ?? detail.stoppage_time?.shrink_1 ?? null,
              shrink_2_hours: detail.stoppage_time?.shrink_2_hours ?? detail.stoppage_time?.shrink_2 ?? null,
              capper_1: detail.stoppage_time?.capper_1 ?? null,
              capper_2: detail.stoppage_time?.capper_2 ?? null,
              sleever_1: detail.stoppage_time?.sleever_1 ?? null,
              sleever_2: detail.stoppage_time?.sleever_2 ?? null,
              shrink_1: detail.stoppage_time?.shrink_1 ?? null,
              shrink_2: detail.stoppage_time?.shrink_2 ?? null,
            }]
          })) || []
        }
        // Ensure night shift is not sent
      } else if (shiftType === "night_shift") {
        formData.night_shift_id = {
          ...(mode === "edit" && form?.filmatic_line_form_2_night_shift?.[0]?.id ? { id: form.filmatic_line_form_2_night_shift[0].id } : {}),
          supervisor_approve: data.supervisor_approve || false,
          operator_id: data.operator_id || user?.id || "",
          shift_details: data.details?.map((detail: any) => ({
            ...(detail.id ? { id: detail.id } : {}),
            time: detail.time ? `${basicInfo.date} ${detail.time}:00+00` : "",
            pallets: detail.pallets || 0,
            target: detail.target || 0,
            setbacks: detail.setbacks || "",
            stoppage_time: [{
              ...((detail.stoppage_time as any)?.id ? { id: (detail.stoppage_time as any).id } : {}),
              capper_1_hours: detail.stoppage_time?.capper_1_hours ?? detail.stoppage_time?.capper_1 ?? null,
              capper_2_hours: detail.stoppage_time?.capper_2_hours ?? detail.stoppage_time?.capper_2 ?? null,
              sleever_1_hours: detail.stoppage_time?.sleever_1_hours ?? detail.stoppage_time?.sleever_1 ?? null,
              sleever_2_hours: detail.stoppage_time?.sleever_2_hours ?? detail.stoppage_time?.sleever_2 ?? null,
              shrink_1_hours: detail.stoppage_time?.shrink_1_hours ?? detail.stoppage_time?.shrink_1 ?? null,
              shrink_2_hours: detail.stoppage_time?.shrink_2_hours ?? detail.stoppage_time?.shrink_2 ?? null,
              capper_1: detail.stoppage_time?.capper_1 ?? null,
              capper_2: detail.stoppage_time?.capper_2 ?? null,
              sleever_1: detail.stoppage_time?.sleever_1 ?? null,
              sleever_2: detail.stoppage_time?.sleever_2 ?? null,
              shrink_1: detail.stoppage_time?.shrink_1 ?? null,
              shrink_2: detail.stoppage_time?.shrink_2 ?? null,
            }]
          })) || []
        }
        // Ensure day shift is not sent
      }

      console.log("Final form data:", formData)
      if (mode === "edit" && form?.id) {
        const updatePayload: any = { ...formData }
        if (form.id) updatePayload.id = form.id
        await filmaticLinesForm2Api.updateForm?.(form.id, updatePayload) ?? await filmaticLinesForm2Api.createForm(formData)
        toast.success("Filmatic Lines Form 2 updated successfully")
      } else {
        await filmaticLinesForm2Api.createForm(formData)
        toast.success("Filmatic Lines Form 2 created successfully")
      }

      // Refresh list so the page updates immediately
      try {
        await dispatch(fetchFilmaticLinesForm2s()).unwrap()
      } catch (e) {
        console.warn("Failed to refresh Filmatic Lines Form 2 list:", e)
      }

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to create Filmatic Lines Form 2")
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
      // allow navigating to Shift Details from Basic Info without blocking on validation
      // form will still be validated on final submit
      setCurrentStep(4)
    }
  }

  const handleBmtFormSearch = async (query: string) => {
    if (!query.trim()) return []

    try {
      const bmtFormsResponse = await bmtControlFormApi.getAll()
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle className="text-2xl font-light">
            {mode === "edit" ? "Edit" : "Create"} Filmatic Lines Form 2
          </SheetTitle>
          <SheetDescription className="text-base font-light">
            Step {currentStep} of 4: {
              currentStep === 1 ? "Shift Selection" :
                currentStep === 2 ? "Group Selection" :
                  currentStep === 3 ? "Basic Information" :
                    "Shift Details"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <ProcessOverview />

          {/* Step 1: Shift Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 p-6">
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
          )}

          {/* Step 2: Group Selection */}
          {currentStep === 2 && (
            <div className="space-y-6 p-6">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-light text-gray-900">Group Selection</h3>
                  <p className="text-sm font-light text-gray-600 mt-2">Select the group for this shift</p>
                </div>

                {filmaticGroups.length > 0 ? (
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
          )}

          {/* Step 3: Basic Information */}
          {currentStep === 3 && (
            <div className="space-y-6 p-6">
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

                {/* Approval toggle (like Filmatic 1) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="approved">Approved</Label>
                    <Controller
                      name="approved"
                      control={basicInfoForm.control}
                      render={({ field }) => (
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={(v) => field.onChange(!!v)}
                        />
                      )}
                    />
                  </div>
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
                              value={field.value ?? ''}
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
                              value={field.value ?? ''}
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
                            value={field.value ?? ''}
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
                              value={field.value ?? ''}
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
                              value={field.value ?? ''}
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
                            value={field.value ?? ''}
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
          )}

          {/* Step 4: Shift Details */}
          {currentStep === 4 && (
            <div className="space-y-6 p-6">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-light text-gray-900">Shift Details</h3>
                  <p className="text-sm font-light text-gray-600 mt-2">Enter the specific shift details and production information</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Production Details</Label>
                    <Button
                      type="button"

                      size="sm"
                      onClick={() => append({
                        time: "",
                        pallets: undefined,
                        target: undefined,
                        setbacks: "",
                        stoppage_time: {
                          capper_1_hours: undefined,
                          capper_2_hours: undefined,
                          sleever_1_hours: undefined,
                          sleever_2_hours: undefined,
                          shrink_1_hours: undefined,
                          shrink_2_hours: undefined,
                          capper_1: undefined,
                          capper_2: undefined,
                          sleever_1: undefined,
                          sleever_2: undefined,
                          shrink_1: undefined,
                          shrink_2: undefined,
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
                              <Input
                                type="number"
                                placeholder="Enter pallets"
                                className="rounded-full border-gray-200"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            )}
                          />
                        </div>

                        <div>
                          <Label>Target</Label>
                          <Controller
                            name={`details.${index}.target`}
                            control={shiftDetailsForm.control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                placeholder="Enter target"
                                className="rounded-full border-gray-200"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            )}
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Setbacks</Label>
                          <Controller
                            name={`details.${index}.setbacks`}
                            control={shiftDetailsForm.control}
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                placeholder="Describe any setbacks"
                                className="border-gray-200"
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Stoppage Time (hours / minutes)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["capper_1_hours", "capper_2_hours", "sleever_1_hours", "sleever_2_hours", "shrink_1_hours", "shrink_2_hours", "capper_1", "capper_2", "sleever_1", "sleever_2", "shrink_1", "shrink_2"].map(key => (
                            <div key={key} className="flex items-center gap-2">
                              <Label className="text-xs w-20">{key.replace('_', ' ')}</Label>
                              <Controller
                                name={`details.${index}.stoppage_time.${key}`}
                                control={shiftDetailsForm.control}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="text-xs h-8 rounded-full border-gray-200"
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center p-6 border-t">
            <Button
              type="button"

              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${step === currentStep
                    ? "bg-blue-500"
                    : step < currentStep
                      ? "bg-green-500"
                      : "bg-gray-300"
                    }`}
                />
              ))}
            </div>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2  from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={shiftDetailsForm.handleSubmit(handleShiftDetailsSubmit)}
                disabled={loading.create}
                className="flex items-center space-x-2  from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {loading.create
                  ? (mode === "edit" ? "Updating..." : "Creating...")
                  : (mode === "edit" ? "Update Form" : "Create Form")}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
