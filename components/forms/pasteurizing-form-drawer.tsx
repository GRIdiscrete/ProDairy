"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Trash2,
  FlaskConical,
  Package,
  Save,
  X,
  ArrowRight,
  Droplets,
  TrendingUp,
  Clock,
  Factory,
  Beaker
} from "lucide-react"
import { toast } from "sonner"
import { pasteurizingApi, CreatePasteurizingFormRequest, PasteurizingForm } from "@/lib/api/pasteurizing"
import { useAuth } from "@/hooks/use-auth"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchMachines } from "@/lib/store/slices/machineSlice"
import { fetchBMTControlForms } from "@/lib/store/slices/bmtControlFormSlice"
import { fetchPasteurizingForms } from "@/lib/store/slices/pasteurizingSlice"
import { format } from "date-fns"
import { id } from "date-fns/locale"

// Helpers — convert/parse times so we always send backend datetime format:
const formatDateToBackend = (d: Date) => {
  const iso = d.toISOString();
  const [datePart, fracPart] = iso.split(".");
  const millis = (fracPart || "000Z").replace("Z", "");
  const micro = `${millis}000`;
  return `${datePart.replace("T", " ")}.${micro}+00`;
}

const convertTimeToBackend = (dateStr: string | null | undefined, timeVal: any) => {
  if (!timeVal && timeVal !== 0) return null;
  const val = String(timeVal);
  if (val.includes(" ") && /\d{4}-\d{2}-\d{2}/.test(val)) return val;
  if (val.includes("T") || val.endsWith("Z")) {
    const parsed = new Date(val);
    if (isNaN(parsed.getTime())) return null;
    return formatDateToBackend(parsed);
  }
  const hhmmMatch = val.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (hhmmMatch) {
    const hh = Number(hhmmMatch[1]);
    const mm = Number(hhmmMatch[2]);
    const ss = Number(hhmmMatch[3] || 0);
    let d: Date;
    if (dateStr && /\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [y, m, day] = dateStr.split("-").map(Number);
      d = new Date(Date.UTC(y, (m || 1) - 1, day, hh, mm, ss, 0));
    } else {
      const now = new Date();
      d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh, mm, ss, 0));
    }
    return formatDateToBackend(d);
  }
  return null;
}

const extractTime = (value: string | undefined | null) => {
  if (!value) return "";
  if (value.includes(" ") && /\d{4}-\d{2}-\d{2}/.test(value)) {
    const timePart = value.split(" ")[1] || "";
    return timePart.substring(0, 5);
  }
  if (value.includes("T")) {
    const t = value.split("T")[1] || "";
    return t.substring(0, 5);
  }
  const hhmmMatch = value.match(/^(\d{1,2}:\d{2})/);
  return hhmmMatch ? hhmmMatch[1] : "";
}

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-6 p-6  from-blue-50 to-cyan-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Beaker className="w-4 h-4 text-orange-600" />
        </div>
        <span className="text-sm font-light">Standardizing</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-600">Pasteurizing</span>
          <div className=" bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Factory className="h-4 w-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Filmatic Lines</span>
      </div>
    </div>
  </div>
)

// Form Schema
const pasteurizingFormSchema = yup.object({
  operator: yup.string().required("Operator is required"),
  date: yup.string().required("Date is required"),
  machine: yup.string().required("Machine is required"),
  preheating_start: yup.string().required("Preheating start time is required"),

  production_start: yup.string().required("Production start time is required"),
  production_end: yup.string().required("Production end time is required"),
  machine_start: yup.string().required("Machine start time is required"),
  machine_end: yup.string().required("Machine end time is required"),
  bmt: yup.string().required("BMT is required"),
  fat: yup.number().required("Fat content is required").min(0, "Fat content must be positive"),
  cream_index: yup.number().optional().nullable().min(0, "Cream index must be positive"),
  steri_milk_pasteurizing_form_production: yup.array().of(
    yup.object({
      process_id: yup.string().required("Process ID is required"),
      time: yup.string().required("Time is required"),
      temp_hot_water: yup.number().required("Hot water temperature required").min(0, "Must be positive"),
      temp_product_out: yup.number().required("Product out temperature required").min(0, "Must be positive"),
      temp_product_pasteurisation: yup.number().required("Pasteurisation temperature required").min(0, "Must be positive"),
      homogenisation_pressure_stage_1: yup.number().required("Stage 1 pressure required").min(0, "Must be positive"),
      homogenisation_pressure_stage_2: yup.number().required("Stage 2 pressure required").min(0, "Must be positive"),
      total_homogenisation_pressure: yup.number().required("Total pressure required").min(0, "Must be positive"),
      output_target_value: yup.number().required("Output target value required").min(0, "Must be positive"),
      ouput_target_units: yup.string().required("Output target units required"),
    })
  ).min(1, "At least one production entry is required"),
})

type PasteurizingFormData = yup.InferType<typeof pasteurizingFormSchema>

interface PasteurizingFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: PasteurizingForm | null
  mode: "create" | "edit"
  onSuccess?: () => void
}

export function PasteurizingFormDrawer({
  open,
  onOpenChange,
  form,
  mode = "create",
  onSuccess
}: PasteurizingFormDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  // Get data from Redux store
  const { machines = [], loading: machinesLoading = false } = useAppSelector((state) => state.machine || {})
  const { forms: bmtForms = [], loading: bmtLoading = false } = useAppSelector((state) => state.bmtControlForms || {})

  // Process ID from route params
  const processId = params?.process_id as string || ""

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      operator: "",
      date: "",
      machine: "",
      preheating_start: "",
      water_circulation: "",
      production_start: "",
      production_end: "",
      machine_start: "",
      machine_end: "",
      bmt: "",
      fat: "",
      cream_index: "",
      steri_milk_pasteurizing_form_production: [] as any[]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steri_milk_pasteurizing_form_production"
  })

  useEffect(() => {
    if (dispatch) {
      dispatch(fetchMachines({}))
      dispatch(fetchBMTControlForms())
    }
  }, [dispatch])

  // Auto-prefill operator and process ID when component opens
  useEffect(() => {
    if (open) {
      // Always auto-prefill operator from logged-in user (for both create and edit)
      if (user?.id) {
        console.log("Auto-filling operator with user ID:", user.id)
        setValue("operator", user.id)
      } else {
        console.log("No user ID available for auto-fill:", user)
      }

      // Auto-prefill process ID from route params and add initial production entry (create mode only)
      if (mode === "create" && processId) {
        // Add initial production entry with process ID
        setValue("steri_milk_pasteurizing_form_production", [{
          process_id: processId,
          time: "",
          temp_hot_water: "",
          temp_product_out: "",
          temp_product_pasteurisation: "",
          homogenisation_pressure_stage_1: "",
          homogenisation_pressure_stage_2: "",
          total_homogenisation_pressure: "",
          output_target_value: "",
          ouput_target_units: ""
        }])
      }
    }
  }, [open, mode, user?.id, processId, setValue])

  // Reset form when form prop changes
  useEffect(() => {
    if (form && mode === "edit") {
      reset({
        operator: form.operator || "",
        date: form.date || "",
        machine: form.machine || "",
        // extract HH:mm for time-only backend values like "23:00:00" or full datetimes
        preheating_start: extractTime(form.preheating_start),
        water_circulation: extractTime(form.water_circulation),
        production_start: extractTime(form.production_start),
        production_end: extractTime(form.production_end),
        machine_start: extractTime(form.machine_start),
        machine_end: extractTime(form.machine_end),
        bmt: form.bmt || "",
        fat: (form.fat as any) || "",
        cream_index: (form.cream_index as any) || "",
        // include existing production ids so they persist through edit -> submit
        steri_milk_pasteurizing_form_production: form.steri_milk_pasteurizing_form_production?.map(prod => ({
          id: prod.id || "", // ensure id exists
          process_id: prod.process_id,
          // prefill picker with HH:mm (handles "HH:mm:ss" and full datetimes)
          time: extractTime(prod.time),
          temp_hot_water: prod.temp_hot_water,
          temp_product_out: prod.temp_product_out,
          temp_product_pasteurisation: prod.temp_product_pasteurisation,
          homogenisation_pressure_stage_1: prod.homogenisation_pressure_stage_1,
          homogenisation_pressure_stage_2: prod.homogenisation_pressure_stage_2,
          total_homogenisation_pressure: prod.total_homogenisation_pressure,
          output_target_value: prod.output_target_value,
          ouput_target_units: prod.ouput_target_units,
        })) || []
      })
    } else if (mode === "create") {
      reset({
        operator: "",
        date: "",
        machine: "",
        preheating_start: "",
        water_circulation: "",
        production_start: "",
        production_end: "",
        machine_start: "",
        machine_end: "",
        bmt: "",
        fat: undefined,
        cream_index: undefined,
        steri_milk_pasteurizing_form_production: []
      })
    }
  }, [form, mode, reset])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Ensure operator is always set from logged-in user
      const operatorId = data.operator || user?.id || ""

      // Helper: normalize empty time/string to null
      const normalizeTime = (val: any) => (val === "" || val === undefined || val === null) ? null : val


      // Normalize production entries (time -> null if empty; numeric fields -> null if empty)
      const productionEntries = (data.steri_milk_pasteurizing_form_production || []).map((p: any) => ({
        ...p,
        // ensure id exists (use existing or generate one)
        id: p.id || (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        time: normalizeTime(p.time),
        temp_hot_water: p.temp_hot_water === "" || p.temp_hot_water === undefined ? null : p.temp_hot_water,
        temp_product_out: p.temp_product_out === "" || p.temp_product_out === undefined ? null : p.temp_product_out,
        temp_product_pasteurisation: p.temp_product_pasteurisation === "" || p.temp_product_pasteurisation === undefined ? null : p.temp_product_pasteurisation,
        homogenisation_pressure_stage_1: p.homogenisation_pressure_stage_1 === "" || p.homogenisation_pressure_stage_1 === undefined ? null : p.homogenisation_pressure_stage_1,
        homogenisation_pressure_stage_2: p.homogenisation_pressure_stage_2 === "" || p.homogenisation_pressure_stage_2 === undefined ? null : p.homogenisation_pressure_stage_2,
        total_homogenisation_pressure: p.total_homogenisation_pressure === "" || p.total_homogenisation_pressure === undefined ? null : p.total_homogenisation_pressure,
        output_target_value: p.output_target_value === "" || p.output_target_value === undefined ? null : p.output_target_value,
        ouput_target_units: p.ouput_target_units || null,
      }))

      // Tag generation: SMPF-{machineIndex}-{DD}-{MM}-{YYYY}
      const machineIndex = machines.findIndex(m => m.id === data.machine) + 1
      const dateObj = data.date ? new Date(data.date) : new Date()
      const d = String(dateObj.getDate()).padStart(2, '0')
      const m = String(dateObj.getMonth() + 1).padStart(2, '0')
      const y = dateObj.getFullYear()
      const tag = `SMPF-${machineIndex || 1}-${d}-${m}-${y}`

      const formData: any = {
        operator: operatorId || null,
        date: data.date || null,
        machine: data.machine || null,
        preheating_start: convertTimeToBackend(data.date, data.preheating_start) || null,
        water_circulation: convertTimeToBackend(data.date, data.water_circulation) || null,
        production_start: convertTimeToBackend(data.date, data.production_start) || null,
        production_end: convertTimeToBackend(data.date, data.production_end) || null,
        machine_start: convertTimeToBackend(data.date, data.machine_start) || null,
        machine_end: convertTimeToBackend(data.date, data.machine_end) || null,
        bmt: data.bmt || null,
        fat: (data.fat === "" || data.fat === undefined || isNaN(data.fat)) ? null : data.fat,
        cream_index: (data.cream_index === "" || data.cream_index === undefined || isNaN(data.cream_index)) ? null : data.cream_index,
        tag: tag,
        steri_milk_pasteurizing_form_production: productionEntries
      }

      if (mode === "create") {
        await pasteurizingApi.create(formData)
        toast.success("Pasteurizing form created successfully")
      } else if (form?.id) {
        await pasteurizingApi.update(form.id, { id: form.id, ...formData })
        toast.success("Pasteurizing form updated successfully")
      }

      // re-fetch pasteurizing forms so UI updates (and notify parent)
      try {
        await dispatch(fetchPasteurizingForms()).unwrap()
      } catch (e) {
        console.warn("Failed to refresh pasteurizing forms:", e)
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${mode} pasteurizing form`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onInvalid = (errors: any) => {
    const errorMessages = Object.values(errors).map((err: any) => err.message).filter(Boolean)
    toast.error(`Please check the following fields: ${errorMessages.join(', ')}`, {
      style: { background: '#ef4444', color: 'white' }
    })
  }

  // Create options arrays from Redux data
  const machineOptions: SearchableSelectOption[] = machines.map(machine => ({
    value: machine.id,
    label: (machine.name as string) || "Unknown Machine",
    description: `${machine.category} - ${machine.location}`
  }))

  const bmtOptions: SearchableSelectOption[] = bmtForms.map(bmt => ({
    value: bmt.id,
    label: (bmt?.tag as string) || "Unknown BMT",
    description: `Volume: ${bmt.volume ?? 0}L`
  }))

  const addProductionEntry = () => {
    append({
      // generate id for new entry so it persists through edits/submits
      id: (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      process_id: processId || "",
      time: "",
      temp_hot_water: undefined,
      temp_product_out: undefined,
      temp_product_pasteurisation: undefined,
      homogenisation_pressure_stage_1: undefined,
      homogenisation_pressure_stage_2: undefined,
      total_homogenisation_pressure: undefined,
      output_target_value: undefined,
      ouput_target_units: ""
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-light">
                {mode === "create" ? "Create" : "Edit"} Pasteurizing Form
              </SheetTitle>
              <SheetDescription className="text-sm font-light">
                Enter all pasteurizing form details including machine information and production data
              </SheetDescription>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              size="sm"
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <ProcessOverview />

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            {/* Basic Information */}
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-light">Basic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hidden operator field - auto-filled */}
                <input type="hidden" {...register("operator")} />

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                    <DatePicker
                      value={watch("date")}
                      onChange={(date) => setValue("date", date ? format(date, "yyyy-MM-dd") : "")}
                    />
                    {errors.date && (
                      <p className="text-sm text-red-500">{errors.date.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="machine">Machine <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      options={machineOptions}
                      value={watch("machine")}
                      onValueChange={(value) => setValue("machine", value)}
                      placeholder={machinesLoading ? "Loading machines..." : "Select machine..."}
                      disabled={machinesLoading}
                    />
                    {errors.machine && (
                      <p className="text-sm text-red-500">{errors.machine.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bmt">BMT Form <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      options={bmtOptions}
                      value={watch("bmt")}
                      onValueChange={(value) => setValue("bmt", value)}
                      placeholder={bmtLoading ? "Loading BMT forms..." : "Select BMT form..."}
                      disabled={bmtLoading}
                    />
                    {errors.bmt && (
                      <p className="text-sm text-red-500">{errors.bmt.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat Content (%) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Enter fat content"
                      {...register("fat", { valueAsNumber: true })}
                    />
                    {errors.fat && (
                      <p className="text-sm text-red-500">{errors.fat.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cream_index">Cream Index</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Enter cream index"
                      {...register("cream_index", { valueAsNumber: true, min: 0, max: 100 })}
                    />
                    {errors.cream_index && (
                      <p className="text-sm text-red-500">{errors.cream_index.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Information */}
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <CardTitle className="text-base font-light">Time Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preheating_start">Preheating Start <span className="text-red-500">*</span></Label>
                    <ShadcnTimePicker
                      value={watch("preheating_start")}
                      onChange={(time) => setValue("preheating_start", time)}
                      placeholder="Select preheating start time"
                    />
                    {errors.preheating_start && (
                      <p className="text-sm text-red-500">{errors.preheating_start.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="water_circulation">Water Circulation</Label>
                    <ShadcnTimePicker
                      value={watch("water_circulation")}
                      onChange={(time) => setValue("water_circulation", time)}
                      placeholder="Select water circulation time"
                    />
                    {errors.water_circulation && (
                      <p className="text-sm text-red-500">{errors.water_circulation.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="production_start">Production Start <span className="text-red-500">*</span></Label>
                    <ShadcnTimePicker
                      value={watch("production_start")}
                      onChange={(time) => setValue("production_start", time)}
                      placeholder="Select production start time"
                    />
                    {errors.production_start && (
                      <p className="text-sm text-red-500">{errors.production_start.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="production_end">Production End <span className="text-red-500">*</span></Label>
                    <ShadcnTimePicker
                      value={watch("production_end")}
                      onChange={(time) => setValue("production_end", time)}
                      placeholder="Select production end time"
                    />
                    {errors.production_end && (
                      <p className="text-sm text-red-500">{errors.production_end.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="machine_start">Machine Start <span className="text-red-500">*</span></Label>
                    <ShadcnTimePicker
                      value={watch("machine_start")}
                      onChange={(time) => setValue("machine_start", time)}
                      placeholder="Select machine start time"
                    />
                    {errors.machine_start && (
                      <p className="text-sm text-red-500">{errors.machine_start.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="machine_end">Machine End <span className="text-red-500">*</span></Label>
                    <ShadcnTimePicker
                      value={watch("machine_end")}
                      onChange={(time) => setValue("machine_end", time)}
                      placeholder="Select machine end time"
                    />
                    {errors.machine_end && (
                      <p className="text-sm text-red-500">{errors.machine_end.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Production Details */}
            <Card className="shadow-none border border-gray-200 rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-base font-light">Production Details</CardTitle>
                  </div>
                  <Button
                    type="button"
                    onClick={addProductionEntry}

                    size="sm"
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No production entries yet</p>
                    <p className="text-xs text-gray-400">Click "Add Entry" to start</p>
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Production Entry #{index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Hidden process ID field - auto-filled */}
                      <input type="hidden" {...register(`steri_milk_pasteurizing_form_production.${index}.id`)} />
                      <input type="hidden" {...register(`steri_milk_pasteurizing_form_production.${index}.process_id`)} />

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label>Time <span className="text-red-500">*</span></Label>
                          <ShadcnTimePicker
                            value={watch(`steri_milk_pasteurizing_form_production.${index}.time`) || ""}
                            onChange={(time) => setValue(`steri_milk_pasteurizing_form_production.${index}.time`, time)}
                            placeholder="Select production time"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Hot Water Temp (°C) <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter temperature"
                            {...register(`steri_milk_pasteurizing_form_production.${index}.temp_hot_water`, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Product Out Temp (°C) <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter temperature"
                            {...register(`steri_milk_pasteurizing_form_production.${index}.temp_product_out`, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pasteurisation Temp (°C) <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter temperature"
                            {...register(`steri_milk_pasteurizing_form_production.${index}.temp_product_pasteurisation`, { valueAsNumber: true })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Stage 1 Pressure <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter pressure (bar)"
                            {...register(`steri_milk_pasteurizing_form_production.${index}.homogenisation_pressure_stage_1`, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Stage 2 Pressure <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter pressure (bar)"
                            {...register(`steri_milk_pasteurizing_form_production.${index}.homogenisation_pressure_stage_2`, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Total Pressure <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter total pressure (bar)"
                            {...register(`steri_milk_pasteurizing_form_production.${index}.total_homogenisation_pressure`, { valueAsNumber: true })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Output Target Value <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Enter target value"
                            {...register(`steri_milk_pasteurizing_form_production.${index}.output_target_value`, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Output Target Units <span className="text-red-500">*</span></Label>
                          <Select
                            value={watch(`steri_milk_pasteurizing_form_production.${index}.ouput_target_units`) || ""}
                            onValueChange={(value) => setValue(`steri_milk_pasteurizing_form_production.${index}.ouput_target_units`, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select units" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="liters">Liters</SelectItem>
                              <SelectItem value="gallons">Gallons</SelectItem>
                              <SelectItem value="kg">Kilograms</SelectItem>
                              <SelectItem value="pounds">Pounds</SelectItem>
                              <SelectItem value="ml">Milliliters</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"

                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className=" from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === "create" ? "Create Form" : "Update Form"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
