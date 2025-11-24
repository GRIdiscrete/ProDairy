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
import { ArrowRight, Factory, Beaker, Package, Sun, Moon, Users, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
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

// Process Overview Component (copied style from Form 2)
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

// Step 3: Basic Information Schema (Form 1 includes holding_tank_bmt)
const createBasicInfoSchema = (selectedShift: string) => yup.object({
  date: yup.string().required("Date is required"),
  holding_tank_bmt: yup.string().nullable(),
  approved: yup.boolean().default(false),
  status: yup.string().default("Ongoing"),
  transferrable_milk: yup.number().nullable(),
  // Day shift fields
  day_shift_opening_bottles: yup.number().min(0, "Must be positive").nullable(),
  day_shift_closing_bottles: yup.number().min(0, "Must be positive").nullable(),
  day_shift_waste_bottles: yup.number().min(0, "Must be positive").nullable(),
  day_shift_received_bottles: yup.number().min(0, "Must be positive").nullable(),
  day_shift_damaged_bottles: yup.number().min(0, "Must be positive").nullable(),
  day_shift_foiled_bottles: yup.number().min(0, "Must be positive").nullable(),
  // Night shift fields
  night_shift_opening_bottles: yup.number().min(0, "Must be positive").nullable(),
  night_shift_closing_bottles: yup.number().min(0, "Must be positive").nullable(),
  night_shift_waste_bottles: yup.number().min(0, "Must be positive").nullable(),
  night_shift_received_bottles: yup.number().min(0, "Must be positive").nullable(),
  night_shift_damaged_bottles: yup.number().min(0, "Must be positive").nullable(),
  night_shift_foiled_bottles: yup.number().min(0, "Must be positive").nullable(),
})

// Step 4: Shift Details Schema (Form 1 stoppage_time is extensive)
const shiftDetailsSchema = yup.object({
  supervisor_approve: yup.boolean(),
  operator_id: yup.string(),
  details: yup.array().of(
    yup.object({
      time: yup.string(),
      pallets: yup.number().min(0, "Must be positive").nullable(),
      target: yup.number().min(0, "Must be positive").nullable(),
      setbacks: yup.string(),
      stoppage_time: yup.object()
    })
  )
})

type ShiftSelectionFormData = yup.InferType<typeof shiftSelectionSchema>
type GroupSelectionFormData = yup.InferType<typeof groupSelectionSchema>
type ShiftDetailsFormData = {
  id?: string
  supervisor_approve?: boolean
  operator_id?: string
  details?: Array<{
    id?: string
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
  const [bmtOptions, setBmtOptions] = useState<Array<{ value: string, label: string, description?: string }>>([])
  const [filmaticGroups, setFilmaticGroups] = useState<FilmaticLinesGroup[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loadingBmtForms, setLoadingBmtForms] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Step forms
  const shiftSelectionForm = useForm<ShiftSelectionFormData>({
    resolver: yupResolver(shiftSelectionSchema),
    defaultValues: { shift_type: "" }
  })
  const groupSelectionForm = useForm<GroupSelectionFormData>({
    resolver: yupResolver(groupSelectionSchema),
    defaultValues: { selected_group: "" }
  })

  const selectedShift = shiftSelectionForm.watch("shift_type")
  const selectedGroup = groupSelectionForm.watch("selected_group")

  const basicInfoSchema = useMemo(() => createBasicInfoSchema(selectedShift || ""), [selectedShift])
  const basicInfoForm = useForm({
    resolver: yupResolver(basicInfoSchema),
    defaultValues: {
      date: "",
      holding_tank_bmt: undefined,
      approved: false,
      status: "Ongoing",
      transferrable_milk: undefined,
      // Day shift
      day_shift_opening_bottles: undefined,
      day_shift_closing_bottles: undefined,
      day_shift_waste_bottles: undefined,
      day_shift_received_bottles: undefined,
      day_shift_damaged_bottles: undefined,
      day_shift_foiled_bottles: undefined,
      // Night shift  
      night_shift_opening_bottles: undefined,
      night_shift_closing_bottles: undefined,
      night_shift_waste_bottles: undefined,
      night_shift_received_bottles: undefined,
      night_shift_damaged_bottles: undefined,
      night_shift_foiled_bottles: undefined,
    }
  })

  // Detailed shift form (stoppage_time fields expanded)
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
          product_1_hours: undefined,
          product_2_hours: undefined,
          filler_1_hours: undefined,
          filler_2_hours: undefined,
          product_1: undefined,
          product_2: undefined,
          filler_1: undefined,
          filler_2: undefined,
        }
      }]
    }
  })

  const timeOptions = selectedShift === "day_shift" ? DAY_SHIFT_TIMES : NIGHT_SHIFT_TIMES

  const { fields, append, remove } = useFieldArray({
    control: shiftDetailsForm.control,
    name: "details"
  })

  // Load data when drawer opens
  useEffect(() => {
    const loadData = async () => {
      if (!open) return

      setLoadingBmtForms(true)
      setLoadingGroups(true)
      setLoadingUsers(true)

      try {
        try {
          const bmtFormsResponse = await bmtControlFormApi.getAll()
          setBmtForms(bmtFormsResponse || [])
          // populate select options immediately so dropdown isn't empty
          setBmtOptions((bmtFormsResponse || []).map((b: any) => ({
            value: b.id,
            label: b.tag || b.id,
            description: `${b.product ?? "Unknown product"} • ${b.volume ?? ""}L${b.flow_meter_start ? ` • ${new Date(b.flow_meter_start).toLocaleDateString()}` : ""}`
          })))
        } catch (error) {
          console.error("Failed to load BMT Control forms:", error)
          setBmtForms([])
          setBmtOptions([])
        }

        try {
          const groupsResponse = await filmaticLinesGroupsApi.getGroups()
          if (groupsResponse && groupsResponse.data) setFilmaticGroups(groupsResponse.data)
          else setFilmaticGroups([])
        } catch (error) {
          console.error("Failed to load Filmatic Lines Groups:", error)
          setFilmaticGroups([])
        }

        // keep users empty for now (no users API call here)
        setUsers([])
      } finally {
        setLoadingBmtForms(false)
        setLoadingGroups(false)
        setLoadingUsers(false)
      }
    }

    loadData()
  }, [open])

  // Reset / populate forms on open/edit
  useEffect(() => {
    if (!open) return

    if (mode === "edit" && form) {
      // populate basic info (bottles and approved exist at top-level)
      basicInfoForm.reset({
        date: form.date || "",
        holding_tank_bmt: (form as any).holding_tank_bmt || undefined,
        approved: !!(form as any).approved,
        status: "Ongoing",
        transferrable_milk: undefined,
        // Day shift
        day_shift_opening_bottles: (form as any).day_shift_opening_bottles ?? undefined,
        day_shift_closing_bottles: (form as any).day_shift_closing_bottles ?? undefined,
        day_shift_waste_bottles: (form as any).day_shift_waste_bottles ?? undefined,
        day_shift_received_bottles: (form as any).day_shift_received_bottles ?? undefined,
        day_shift_damaged_bottles: (form as any).day_shift_damaged_bottles ?? undefined,
        day_shift_foiled_bottles: (form as any).day_shift_foiled_bottles ?? undefined,
        // Night shift  
        night_shift_opening_bottles: (form as any).night_shift_opening_bottles ?? undefined,
        night_shift_closing_bottles: (form as any).night_shift_closing_bottles ?? undefined,
        night_shift_waste_bottles: (form as any).night_shift_waste_bottles ?? undefined,
        night_shift_received_bottles: (form as any).night_shift_received_bottles ?? undefined,
        night_shift_damaged_bottles: (form as any).night_shift_damaged_bottles ?? undefined,
        night_shift_foiled_bottles: (form as any).night_shift_foiled_bottles ?? undefined,
      })

      // detect shift type from either the legacy objects or the API arrays
      let shiftType = ""
      const hasDayArray = Array.isArray((form as any).filmatic_line_form_1_day_shift) && (form as any).filmatic_line_form_1_day_shift.length > 0
      const hasNightArray = Array.isArray((form as any).filmatic_line_form_1_night_shift) && (form as any).filmatic_line_form_1_night_shift.length > 0
      // legacy keys check
      const hasLegacyDay = (form as any).day_shift && Object.keys((form as any).day_shift).length > 0
      const hasLegacyNight = (form as any).night_shift && Object.keys((form as any).night_shift).length > 0

      if (hasDayArray || hasLegacyDay) shiftType = "day_shift"
      else if (hasNightArray || hasLegacyNight) shiftType = "night_shift"
      shiftSelectionForm.reset({ shift_type: shiftType })

      // group detection (use same logic as Form 2)
      let selectedGroupType = ""
      if ((form as any).groups) {
        if ((form as any).groups.group_a && (form as any).groups.group_a.length > 0) selectedGroupType = "group_a"
        else if ((form as any).groups.group_b && (form as any).groups.group_b.length > 0) selectedGroupType = "group_b"
        else if ((form as any).groups.group_c && (form as any).groups.group_c.length > 0) selectedGroupType = "group_c"
      }
      groupSelectionForm.reset({ selected_group: selectedGroupType })

      // prefill details from detected shift (support both shapes)
      try {
        // get shift entry either from API arrays or legacy single object
        let shiftEntry: any = null

        if (shiftType === "day_shift") {
          if (hasDayArray) {
            shiftEntry = (form as any).filmatic_line_form_1_day_shift[0] || null
            const details = shiftEntry?.filmatic_line_form_1_day_shift_details || []
            const mapped = details.map((d: any) => {
              const stoppageArray = d.filmatic_line_form_1_day_shift_details_stoppage_time || []
              const stoppage = stoppageArray[0] || {}
              
              // Keep track of IDs
              return {
                id: d.id, // Preserve detail ID
                time: d.time?.split(' ')[1]?.slice(0, 5) || '',
                pallets: d.pallets ?? undefined,
                target: d.target ?? undefined,
                setbacks: d.setbacks || '',
                stoppage_time: {
                  id: stoppage.id, // Preserve stoppage time ID
                  product_1_hours: stoppage.product_1_hours ?? stoppage.product_1 ?? undefined,
                  product_2_hours: stoppage.product_2_hours ?? stoppage.product_2 ?? undefined,
                  filler_1_hours: stoppage.filler_1_hours ?? stoppage.filler_1 ?? undefined,
                  filler_2_hours: stoppage.filler_2_hours ?? stoppage.filler_2 ?? undefined,
                  product_1: stoppage.product_1 ?? undefined,
                  product_2: stoppage.product_2 ?? undefined,
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
              supervisor_approve: shiftEntry?.supervisor_approve ?? false,
              operator_id: shiftEntry?.operator_id ?? user?.id ?? '',
              details: mapped.length ? mapped : shiftDetailsForm.getValues().details
            })
          }
        } else if (shiftType === "night_shift") {
          if (hasNightArray) {
            shiftEntry = (form as any).filmatic_line_form_1_night_shift[0] || null
            const details = shiftEntry?.filmatic_line_form_1_night_shift_details || []
            const mapped = details.map((d: any) => {
              const stoppageArray = d.filmatic_line_form_1_night_shift_details_stoppage_time || []
              const stoppage = stoppageArray[0] || {}

              return {
                id: d.id, // Preserve detail ID
                time: d.time?.split(' ')[1]?.slice(0, 5) || '',
                pallets: d.pallets ?? undefined,
                target: d.target ?? undefined,
                setbacks: d.setbacks || '',
                stoppage_time: {
                  id: stoppage.id, // Preserve stoppage time ID
                  product_1_hours: stoppage.product_1_hours ?? stoppage.product_1 ?? undefined,
                  product_2_hours: stoppage.product_2_hours ?? stoppage.product_2 ?? undefined,
                  filler_1_hours: stoppage.filler_1_hours ?? stoppage.filler_1 ?? undefined,
                  filler_2_hours: stoppage.filler_2_hours ?? stoppage.filler_2 ?? undefined,
                  product_1: stoppage.product_1 ?? undefined,
                  product_2: stoppage.product_2 ?? undefined,
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
      // fresh create
      basicInfoForm.reset({
        date: "",
        holding_tank_bmt: undefined,
        approved: false,
        status: "Ongoing",
        transferrable_milk: undefined,
        // Day shift
        day_shift_opening_bottles: undefined,
        day_shift_closing_bottles: undefined,
        day_shift_waste_bottles: undefined,
        day_shift_received_bottles: undefined,
        day_shift_damaged_bottles: undefined,
        day_shift_foiled_bottles: undefined,
        // Night shift  
        night_shift_opening_bottles: undefined,
        night_shift_closing_bottles: undefined,
        night_shift_waste_bottles: undefined,
        night_shift_received_bottles: undefined,
        night_shift_damaged_bottles: undefined,
        night_shift_foiled_bottles: undefined,
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
            product_1_hours: undefined,
            product_2_hours: undefined,
            filler_1_hours: undefined,
            filler_2_hours: undefined,
            product_1: undefined,
            product_2: undefined,
            filler_1: undefined,
            filler_2: undefined,
          }
        }]
      })
      setCurrentStep(1)
    }
  }, [open, mode, form, basicInfoForm, shiftSelectionForm, groupSelectionForm, shiftDetailsForm, user?.id])

  // Search handler for BMT forms used by SearchableSelect
  const handleBmtFormSearch = async (query: string) => {
    // quick search over loaded forms; if query empty return preloaded options
    if (!query.trim()) return bmtOptions
    try {
      const all = await bmtControlFormApi.getAll()
      return (all || [])
        .filter((b: any) =>
          (b.product || "").toLowerCase().includes(query.toLowerCase()) ||
          (b.tag || b.id || "").toLowerCase().includes(query.toLowerCase())
        )
        .map((b: any) => ({
          value: b.id,
          label: b.tag || b.id,
          description: `${b.product ?? "Unknown product"} • ${b.volume ?? ""}L${b.flow_meter_start ? ` • ${new Date(b.flow_meter_start).toLocaleDateString()}` : ""}`
        }))
    } catch (err) {
      console.error("BMT search failed", err)
      return bmtOptions
    }
  }

  // Build payload and submit
  const handleFinalSubmit = async (data: ShiftDetailsFormData) => {
    try {
      setLoading(prev => ({ ...prev, create: true }))

      const basicInfo = basicInfoForm.getValues()
      const shiftType = shiftSelectionForm.getValues().shift_type
      
      // Start with common fields
      const payload: any = {
        process_id: processId || "",
        date: basicInfo.date || null,
        holding_tank_bmt: basicInfo.holding_tank_bmt || null,
        approved: !!basicInfo.approved,
        status: "Ongoing",
        transferrable_milk: basicInfo.transferrable_milk || null,
      }

      // Add ID if editing
      if (mode === "edit" && form?.id) {
        payload.id = form.id
      }

      // Add groups if selected
      if (selectedGroup && filmaticGroups.length > 0) {
        const matchedGroup = filmaticGroups.find(g =>
          Array.isArray((g as any)[selectedGroup]) && (g as any)[selectedGroup].length > 0
        ) || filmaticGroups[0]

        if (matchedGroup) {
          payload.groups = {
            id: matchedGroup.id,
            [selectedGroup]: (matchedGroup as any)[selectedGroup],
            manager_id: matchedGroup.manager_id
          }
        }
      }

      // Add shift-specific data with IDs
      if (shiftType === "day_shift") {
        // Day shift bottles
        payload.day_shift_opening_bottles = basicInfo.day_shift_opening_bottles || null
        payload.day_shift_closing_bottles = basicInfo.day_shift_closing_bottles || null
        payload.day_shift_waste_bottles = basicInfo.day_shift_waste_bottles || null
        payload.day_shift_received_bottles = basicInfo.day_shift_received_bottles || null
        payload.day_shift_damaged_bottles = basicInfo.day_shift_damaged_bottles || null
        payload.day_shift_foiled_bottles = basicInfo.day_shift_foiled_bottles || null

        // Day shift object with details and IDs if updating
        payload.day_shift = {
          ...(mode === "edit" && form?.filmatic_line_form_1_day_shift?.[0]?.id ? { id: form.filmatic_line_form_1_day_shift[0].id } : {}),
          supervisor_approve: !!data.supervisor_approve,
          operator_id: data.operator_id || null,
          details: (data.details || []).map(d => ({
            ...(d.id ? { id: d.id } : {}), // Preserve detail ID if exists
            time: d.time || null,
            pallets: d.pallets ?? null,
            target: d.target ?? null,
            setbacks: d.setbacks || null,
            stoppage_time: [{
              ...((d.stoppage_time as any)?.id ? { id: (d.stoppage_time as any).id } : {}), // Preserve stoppage time ID if exists
              product_1_hours: d.stoppage_time?.product_1_hours ?? null,
              product_2_hours: d.stoppage_time?.product_2_hours ?? null,
              filler_1_hours: d.stoppage_time?.filler_1_hours ?? null,
              filler_2_hours: d.stoppage_time?.filler_2_hours ?? null,
              product_1: d.stoppage_time?.product_1 ?? null,
              product_2: d.stoppage_time?.product_2 ?? null,
              filler_1: d.stoppage_time?.filler_1 ?? null,
              filler_2: d.stoppage_time?.filler_2 ?? null,
            }]
          }))
        }

        // Ensure night shift fields are null
        payload.night_shift_opening_bottles = null
        payload.night_shift_closing_bottles = null
        payload.night_shift_waste_bottles = null
        payload.night_shift_received_bottles = null
        payload.night_shift_damaged_bottles = null
        payload.night_shift_foiled_bottles = null
        payload.night_shift = null

      } else {
        // Night shift bottles
        payload.night_shift_opening_bottles = basicInfo.night_shift_opening_bottles || null
        payload.night_shift_closing_bottles = basicInfo.night_shift_closing_bottles || null
        payload.night_shift_waste_bottles = basicInfo.night_shift_waste_bottles || null
        payload.night_shift_received_bottles = basicInfo.night_shift_received_bottles || null
        payload.night_shift_damaged_bottles = basicInfo.night_shift_damaged_bottles || null
        payload.night_shift_foiled_bottles = basicInfo.night_shift_foiled_bottles || null

        // Night shift object with details and IDs if updating
        payload.night_shift = {
          ...(mode === "edit" && form?.filmatic_line_form_1_night_shift?.[0]?.id ? { id: form.filmatic_line_form_1_night_shift[0].id } : {}),
          supervisor_approve: !!data.supervisor_approve,
          operator_id: data.operator_id || null,
          details: (data.details || []).map(d => ({
            ...(d.id ? { id: d.id } : {}), // Preserve detail ID if exists
            time: d.time || null,
            pallets: d.pallets ?? null,
            target: d.target ?? null,
            setbacks: d.setbacks || null,
            stoppage_time: [{
              ...((d.stoppage_time as any)?.id ? { id: (d.stoppage_time as any).id } : {}), // Preserve stoppage time ID if exists
              product_1_hours: d.stoppage_time?.product_1_hours ?? null,
              product_2_hours: d.stoppage_time?.product_2_hours ?? null,
              filler_1_hours: d.stoppage_time?.filler_1_hours ?? null,
              filler_2_hours: d.stoppage_time?.filler_2_hours ?? null,
              product_1: d.stoppage_time?.product_1 ?? null,
              product_2: d.stoppage_time?.product_2 ?? null,
              filler_1: d.stoppage_time?.filler_1 ?? null,
              filler_2: d.stoppage_time?.filler_2 ?? null,
            }]
          }))
        }

        // Ensure day shift fields are null
        payload.day_shift_opening_bottles = null
        payload.day_shift_closing_bottles = null
        payload.day_shift_waste_bottles = null
        payload.day_shift_received_bottles = null
        payload.day_shift_damaged_bottles = null
        payload.day_shift_foiled_bottles = null
        payload.day_shift = null
      }

      if (mode === "edit" && form?.id) {
        await filmaticLinesForm1Api.updateForm(form.id, payload)
        toast.success("Filmatic Lines Form 1 updated")
      } else {
        await filmaticLinesForm1Api.createForm(payload)
        toast.success("Filmatic Lines Form 1 created")
      }

      // Silently refetch to get complete updated data from backend
      dispatch(fetchFilmaticLinesForm1s()).catch(() => {/* Silent fail */})
      onOpenChange(false)

    } catch (err: any) {
      console.error("Failed to submit:", err)
      toast.error(err?.message || "Failed to submit form")
    } finally {
      setLoading(prev => ({ ...prev, create: false }))
    }
  }

    const handleShiftSelectionSubmit = () => setCurrentStep(2)
    const handleGroupSelectionSubmit = () => setCurrentStep(3)
    const handleBasicInfoSubmit = () => setCurrentStep(4)
    const handleBack = () => setCurrentStep(prev => Math.max(1, prev - 1))
    const handleNext = () => {
      if (currentStep === 1) shiftSelectionForm.handleSubmit(handleShiftSelectionSubmit)()
      else if (currentStep === 2) groupSelectionForm.handleSubmit(handleGroupSelectionSubmit)()
      else if (currentStep === 3) basicInfoForm.handleSubmit(handleBasicInfoSubmit)()
    }

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle className="text-2xl font-light">
              {mode === "edit" ? "Edit" : "Create"} Filmatic Lines Form 1
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

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-6 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-light text-gray-900">Shift Selection</h3>
                  <p className="text-sm font-light text-gray-600 mt-2">Choose shift for this record</p>
                </div>
                <div className="space-y-4">
                  <Controller
                    name="shift_type"
                    control={shiftSelectionForm.control}
                    render={({ field }) => (
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-4">
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
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-6 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-light text-gray-900">Group Selection</h3>
                  <p className="text-sm font-light text-gray-600 mt-2">Select the group for this shift</p>
                </div>

                {filmaticGroups.length > 0 ? (
                  <Controller
                    name="selected_group"
                    control={groupSelectionForm.control}
                    render={({ field }) => (
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-4">
                        {["group_a", "group_b", "group_c"].map((groupKey) => {
                          const firstGroup = filmaticGroups[0]
                          const members = firstGroup ? (firstGroup as any)[groupKey] as string[] : []
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
                ) : (
                  <div className="text-center py-8"><p className="text-sm text-gray-500">No groups available</p></div>
                )}
              </div>
            )}

            {/* Step 3: Basic Info */}
            {currentStep === 3 && (
              <div className="space-y-6 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-light text-gray-900">Basic Information</h3>
                  <p className="text-sm font-light text-gray-600 mt-2">
                    Enter date, holding tank BMT and bottle counts
                  </p>
                </div>

                <div className="space-y-4">
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
                  <Controller
                    name="holding_tank_bmt"
                    control={basicInfoForm.control}
                    render={({ field }) => (
                      <div>
                        {/* ensure label is visible and spaced */}
                        <Label className="mb-2">Holding Tank BMT</Label>

                        <SearchableSelect
                          value={field.value || ''}
                          options={bmtOptions}
                          onSearch={handleBmtFormSearch}
                          onValueChange={(v) => field.onChange(v)}
                          placeholder="Search BMT forms..."
                        />
                      </div>
                    )}
                  />

                  {/* shift-specific fields */}
                  {selectedShift === "day_shift" && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="mb-2">Opening Bottles</Label>
                          <Controller
                            name="day_shift_opening_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Closing Bottles</Label>
                          <Controller
                            name="day_shift_closing_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Waste Bottles</Label>
                          <Controller
                            name="day_shift_waste_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Received Bottles</Label>
                          <Controller
                            name="day_shift_received_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Damaged Bottles</Label>
                          <Controller
                            name="day_shift_damaged_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Foiled Bottles</Label>
                          <Controller
                            name="day_shift_foiled_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2">Transferrable Milk (L)</Label>
                        <Controller
                          name="transferrable_milk"
                          control={basicInfoForm.control}
                          render={({ field }) => (
                            <Input type="number" {...field} value={field.value ?? ''} 
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                          )}
                        />
                      </div>
                    </>
                  )}

                  {selectedShift === "night_shift" && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="mb-2">Opening Bottles</Label>
                          <Controller
                            name="night_shift_opening_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Closing Bottles</Label>
                          <Controller
                            name="night_shift_closing_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Waste Bottles</Label>
                          <Controller
                            name="night_shift_waste_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Received Bottles</Label>
                          <Controller
                            name="night_shift_received_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Damaged Bottles</Label>
                          <Controller
                            name="night_shift_damaged_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Foiled Bottles</Label>
                          <Controller
                            name="night_shift_foiled_bottles"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                              <Input type="number" {...field} value={field.value ?? ''} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="approved">Approved</Label>
                      <Controller
                        name="approved"
                        control={basicInfoForm.control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    {basicInfoForm.formState.errors.approved && (
                      <p className="text-sm text-red-500">{basicInfoForm.formState.errors.approved.message}</p>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Step 4: Shift Details */}
            {currentStep === 4 && (
              <div className="space-y-6 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-light text-gray-900">Shift Details</h3>
                  <p className="text-sm font-light text-gray-600 mt-2">Enter production details and stoppage times</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Production Details</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({
                        time: "",
                        pallets: undefined,
                        target: undefined,
                        setbacks: "",
                        stoppage_time: {
                          product_1_hours: undefined,
                          product_2_hours: undefined,
                          filler_1_hours: undefined,
                          filler_2_hours: undefined,
                          product_1: undefined,
                          product_2: undefined,
                          filler_1: undefined,
                          filler_2: undefined,
                        }
                      })}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Entry
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Entry {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* <div>
                          <Label htmlFor="approved" className="mb-3">Approved</Label>
                          <Controller
                            name={`details.${index}.supervisor_approve`}
                            control={shiftDetailsForm.control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                        </div> */}
                        <div>
                          <Label className="mb-3">Time</Label>
                          <Controller
                            name={`details.${index}.time`}
                            control={shiftDetailsForm.control}
                            render={({ field }) => (
                              <Select value={field.value || ''} onValueChange={field.onChange}>
                                <SelectTrigger className="rounded-full w-full p-6 border-gray-200"><SelectValue placeholder="Select time" /></SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div>
                          <Label className="mb-3">Pallets</Label>
                          <Controller
                            name={`details.${index}.pallets`}
                            control={shiftDetailsForm.control}
                            render={({ field }) => (
                              <Input type="number" value={String(field.value ?? "")} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>

                        <div>
                          <Label className="mb-3">Target</Label>
                          <Controller
                            name={`details.${index}.target`}
                            control={shiftDetailsForm.control}
                            render={({ field }) => (
                              <Input type="number" value={String(field.value ?? "")} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            )}
                          />
                        </div>

                        <div className="col-span-2">
                          <Label className="mb-3">Setbacks</Label>
                          <Controller
                            name={`details.${index}.setbacks`}
                            control={shiftDetailsForm.control}
                            render={({ field }) => <Textarea {...field} placeholder="Describe any setbacks" />}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Stoppage Time (minutes / hours)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["product_1_hours", "product_2_hours", "filler_1_hours", "filler_2_hours", "product_1", "product_2", "filler_1", "filler_2"].map(key => (
                            <div key={key} className="flex items-center gap-2">
                              <Label className="text-xs w-28">{key.replace(/_/g, ' ')}</Label>
                              <Controller
                                name={`details.${index}.stoppage_time.${key}`}
                                control={shiftDetailsForm.control}
                                render={({ field }) => (
                                  <Input type="number" className="text-xs h-8 rounded-full border-gray-200" value={String(field.value ?? "")} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
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
            )}


            {/* Navigation */}
            <div className="flex justify-between items-center p-6 border-t">
              <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1} className="flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" /><span>Back</span>
              </Button>

              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className={`w-3 h-3 rounded-full ${step === currentStep ? "bg-blue-500" : step < currentStep ? "bg-green-500" : "bg-gray-300"}`} />
                ))}
              </div>

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500">
                  <span>Next</span><ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="button" onClick={shiftDetailsForm.handleSubmit(handleFinalSubmit)} disabled={loading.create} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500">
                  {loading.create ? "Saving..." : (mode === "edit" ? "Update Form" : "Create Form")}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }
