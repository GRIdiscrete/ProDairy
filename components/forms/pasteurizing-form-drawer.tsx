"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { DatePicker, TimePicker } from "@/components/ui/date-picker"
import { 
  Plus, 
  Trash2, 
  FlaskConical, 
  Package, 
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Droplets,
  TrendingUp,
  Clock,
  Factory
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createPasteurizingForm, 
  updatePasteurizingForm
} from "@/lib/store/slices/pasteurizingSlice"
import { 
  fetchStandardizingForms 
} from "@/lib/store/slices/standardizingSlice"
import { 
  fetchMachines 
} from "@/lib/store/slices/machineSlice"
import { 
  fetchSilos 
} from "@/lib/store/slices/siloSlice"
import { 
  fetchBMTControlForms 
} from "@/lib/store/slices/bmtControlFormSlice"
import { 
  fetchUsers 
} from "@/lib/store/slices/userSlice"
import { PasteurizingForm, CreatePasteurizingFormRequest, Production } from "@/lib/api/pasteurizing"
import { toast } from "sonner"

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-orange-600" />
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
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Factory className="w-4 h-4 text-gray-400" />
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
  source_silo: yup.string().required("Source silo is required"),
  preheating_start: yup.string().required("Preheating start time is required"),
  water_circulation: yup.string().required("Water circulation time is required"),
  production_start: yup.string().required("Production start time is required"),
  production_end: yup.string().required("Production end time is required"),
  machine_start: yup.string().required("Machine start time is required"),
  machine_end: yup.string().required("Machine end time is required"),
  bmt: yup.string().required("BMT is required"),
  fat: yup.number().required("Fat content is required").min(0, "Fat content must be positive"),
  production: yup.array().of(
    yup.object({
      time: yup.string().required("Time is required"),
      temp_hot_water: yup.number().required("Temp hot water required"),
      temp_product_pasteurisation: yup.number().required("Temp pasteurisation required"),
      homogenisation_pressure_stage_1: yup.number().required("Stage 1 pressure required"),
      homogenisation_pressure_stage_2: yup.number().required("Stage 2 pressure required"),
      total_homogenisation_pressure: yup.number().required("Total pressure required"),
      temperature_product_out: yup.number().required("Product out temp required"),
      output_target_value: yup.number().required("Output target required").min(0, "Must be positive"),
      output_target_unit: yup.string().required("Unit required"),
    })
  ).min(1, "At least one production entry is required"),
})

type PasteurizingFormData = yup.InferType<typeof pasteurizingFormSchema>

interface PasteurizingFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: PasteurizingForm | null
  mode: "create" | "edit"
}

export function PasteurizingFormDrawer({ 
  open, 
  onOpenChange, 
  form, 
  mode = "create" 
}: PasteurizingFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.pasteurizing)
  const { forms: standardizingForms } = useAppSelector((state) => state.standardizing)
  const { machines } = useAppSelector((state) => state.machine)
  const { silos } = useAppSelector((state) => state.silo)
  const { forms: bmtForms } = useAppSelector((state) => state.bmtControlForms)
  const { users } = useAppSelector((state) => state.user)

  const [loadingInitialData, setLoadingInitialData] = useState(false)

  // Single form for all data
  const formHook = useForm<PasteurizingFormData>({
    resolver: yupResolver(pasteurizingFormSchema),
    defaultValues: {
      operator: "",
      date: new Date().toISOString().split('T')[0],
      machine: "",
      source_silo: "",
      preheating_start: "",
      water_circulation: "",
      production_start: "",
      production_end: "",
      machine_start: "",
      machine_end: "",
      bmt: "",
      fat: 0,
      production: [{
        time: "",
        temp_hot_water: 0,
        temp_product_pasteurisation: 0,
        homogenisation_pressure_stage_1: 0,
        homogenisation_pressure_stage_2: 0,
        total_homogenisation_pressure: 0,
        temperature_product_out: 0,
        output_target_value: 0,
        output_target_unit: "L",
      }],
    },
  })

  const { fields: productionFields, append: appendProduction, remove: removeProduction } = useFieldArray({
    control: formHook.control,
    name: "production"
  })

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingInitialData(true)
      
      // Load standardizing forms to show process flow
      if (standardizingForms.length === 0) {
        await dispatch(fetchStandardizingForms())
      }
      
      // Load machines for the searchable select
      if (machines.length === 0) {
        await dispatch(fetchMachines({}))
      }
      
      // Load silos for the searchable select
      if (silos.length === 0) {
        await dispatch(fetchSilos({}))
      }
      
      // Load BMT forms for the searchable select
      if (bmtForms.length === 0) {
        await dispatch(fetchBMTControlForms())
      }
      
      // Load users for the operator select
      if (users.length === 0) {
        await dispatch(fetchUsers({}))
      }
    } catch (error) {
      console.error("Failed to load initial data:", error)
      toast.error("Failed to load form data")
    } finally {
      setLoadingInitialData(false)
    }
  }

  // Load data when drawer opens
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  // Reset form when form prop changes
  useEffect(() => {
    if (form && mode === "edit") {
      formHook.reset({
        operator: (form as any).operator || "",
        date: (form as any).date || new Date().toISOString().split('T')[0],
        machine: form.machine || "",
        source_silo: form.source_silo || "",
        preheating_start: form.preheating_start || "",
        water_circulation: form.water_circulation || "",
        production_start: form.production_start || "",
        production_end: form.production_end || "",
        machine_start: form.machine_start || "",
        machine_end: form.machine_end || "",
        bmt: form.bmt || "",
        fat: form.fat || 0,
        production: (form as any).production?.length > 0
          ? (form as any).production.map((p: any) => ({
              time: p.time || "",
              temp_hot_water: p.temp_hot_water ?? 0,
              temp_product_pasteurisation: p.temp_product_pasteurisation ?? 0,
              homogenisation_pressure_stage_1: p.homogenisation_pressure_stage_1 ?? 0,
              homogenisation_pressure_stage_2: p.homogenisation_pressure_stage_2 ?? 0,
              total_homogenisation_pressure: p.total_homogenisation_pressure ?? 0,
              temperature_product_out: p.temperature_product_out ?? 0,
              output_target_value: p.output_target?.value ?? 0,
              output_target_unit: p.output_target?.unit_of_measure ?? "L",
            }))
          : [{
              time: "",
              temp_hot_water: 0,
              temp_product_pasteurisation: 0,
              homogenisation_pressure_stage_1: 0,
              homogenisation_pressure_stage_2: 0,
              total_homogenisation_pressure: 0,
              temperature_product_out: 0,
              output_target_value: 0,
              output_target_unit: "L",
            }],
      })
    } else if (mode === "create") {
      formHook.reset({
        operator: "",
        date: new Date().toISOString().split('T')[0],
        machine: "",
        source_silo: "",
        preheating_start: "",
        water_circulation: "",
        production_start: "",
        production_end: "",
        machine_start: "",
        machine_end: "",
        bmt: "",
        fat: 0,
        production: [{
          time: "",
          temp_hot_water: 0,
          temp_product_pasteurisation: 0,
          homogenisation_pressure_stage_1: 0,
          homogenisation_pressure_stage_2: 0,
          total_homogenisation_pressure: 0,
          temperature_product_out: 0,
          output_target_value: 0,
          output_target_unit: "L",
        }],
      })
    }
  }, [form, mode, formHook])

  const pathname = usePathname()
  const handleSubmit = async (data: PasteurizingFormData) => {
    try {
      const processIdMatch = pathname.match(/data-capture\/(.*?)\//)
      const processId = processIdMatch ? processIdMatch[1] : ""

      const formData: any = {
        operator: data.operator,
        date: data.date,
        machine: data.machine,
        source_silo: data.source_silo,
        preheating_start: data.preheating_start,
        water_circulation: data.water_circulation,
        production_start: data.production_start,
        production_end: data.production_end,
        machine_start: data.machine_start,
        machine_end: data.machine_end,
        bmt: data.bmt,
        fat: data.fat,
        production: data.production.map(p => ({
          time: p.time,
          temp_hot_water: p.temp_hot_water,
          temp_product_pasteurisation: p.temp_product_pasteurisation,
          homogenisation_pressure_stage_1: p.homogenisation_pressure_stage_1,
          homogenisation_pressure_stage_2: p.homogenisation_pressure_stage_2,
          total_homogenisation_pressure: p.total_homogenisation_pressure,
          temperature_product_out: p.temperature_product_out,
          process_id: processId,
          output_target: { value: p.output_target_value, unit_of_measure: p.output_target_unit }
        }))
      }

      if (mode === "create") {
        await dispatch(createPasteurizingForm(formData as any)).unwrap()
        toast.success("Pasteurizing form created successfully")
      } else if (form) {
        await dispatch(updatePasteurizingForm({ id: form.id, formData: formData as any })).unwrap()
        toast.success("Pasteurizing form updated successfully")
      }

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to save pasteurizing form")
    }
  }

  const renderForm = () => {
    // Convert machines to searchable select options
    const machineOptions: SearchableSelectOption[] = machines.map(machine => ({
      value: machine.id,
      label: machine.name,
      description: `${machine.category} • ${machine.status}`
    }))

    // Convert silos to searchable select options
    const siloOptions: SearchableSelectOption[] = silos.map(silo => ({
      value: silo.id,
      label: silo.name,
      description: `${silo.capacity}L • ${silo.status}`
    }))

    // Convert BMT forms to searchable select options
    const bmtOptions: SearchableSelectOption[] = bmtForms.map(bmt => ({
      value: bmt.id,
      label: `BMT Form #${bmt.id.slice(0, 8)}`,
      description: `${bmt.volume}L • ${bmt.product}`
    }))

    // Convert users to searchable select options
    const operatorOptions: SearchableSelectOption[] = users.map(user => {
      // Debug: Log user object structure
      console.log('User object:', user)
      
      // Handle different possible user object structures
      const firstName = user.first_name || user.firstName || user.name?.split(' ')[0] || 'Unknown'
      const lastName = user.last_name || user.lastName || user.name?.split(' ').slice(1).join(' ') || 'User'
      const email = user.email || 'No email'
      const role = user.role || user.user_role || 'No role'
      
      return {
        value: user.id,
        label: `${firstName} ${lastName}`,
        description: `${email} • ${role}`
      }
    })

    return (
      <div className="space-y-6 p-6">
        <ProcessOverview />

        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Basic Information</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter the basic pasteurizing form details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operator">Operator *</Label>
                <Controller
                  name="operator"
                  control={formHook.control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={operatorOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select operator..."
                      searchPlaceholder="Search operators..."
                      emptyMessage="No operators found"
                      loading={loadingInitialData}
                    />
                  )}
                />
                {formHook.formState.errors.operator && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.operator.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  name="date"
                  control={formHook.control}
                  render={({ field }) => (
                    <DatePicker
                      label="Date *"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select date"
                      showTime={false}
                      error={!!formHook.formState.errors.date}
                    />
                  )}
                />
                {formHook.formState.errors.date && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="machine">Machine *</Label>
                <Controller
                  name="machine"
                  control={formHook.control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={machineOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select machine..."
                      searchPlaceholder="Search machines..."
                      emptyMessage="No machines found"
                      loading={loadingInitialData}
                    />
                  )}
                />
                {formHook.formState.errors.machine && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.machine.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_silo">Source Silo *</Label>
                <Controller
                  name="source_silo"
                  control={formHook.control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={siloOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select source silo..."
                      searchPlaceholder="Search silos..."
                      emptyMessage="No silos found"
                      loading={loadingInitialData}
                    />
                  )}
                />
                {formHook.formState.errors.source_silo && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.source_silo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmt">BMT Form *</Label>
                <Controller
                  name="bmt"
                  control={formHook.control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={bmtOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select BMT form..."
                      searchPlaceholder="Search BMT forms..."
                      emptyMessage="No BMT forms found"
                      loading={loadingInitialData}
                    />
                  )}
                />
                {formHook.formState.errors.bmt && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.bmt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fat">Fat Content (%) *</Label>
                <Controller
                  name="fat"
                  control={formHook.control}
                  render={({ field }) => (
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      placeholder="Enter fat content"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
                {formHook.formState.errors.fat && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.fat.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timing Section */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Process Timing</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter the process timing information</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Controller
                  name="preheating_start"
                  control={formHook.control}
                  render={({ field }) => (
                    <DatePicker
                      label="Preheating Start *"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select preheating start date and time"
                      showTime={true}
                      error={!!formHook.formState.errors.preheating_start}
                    />
                  )}
                />
                {formHook.formState.errors.preheating_start && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.preheating_start.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  name="water_circulation"
                  control={formHook.control}
                  render={({ field }) => (
                    <DatePicker
                      label="Water Circulation *"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select water circulation date and time"
                      showTime={true}
                      error={!!formHook.formState.errors.water_circulation}
                    />
                  )}
                />
                {formHook.formState.errors.water_circulation && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.water_circulation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  name="production_start"
                  control={formHook.control}
                  render={({ field }) => (
                    <DatePicker
                      label="Production Start *"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select production start date and time"
                      showTime={true}
                      error={!!formHook.formState.errors.production_start}
                    />
                  )}
                />
                {formHook.formState.errors.production_start && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.production_start.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  name="production_end"
                  control={formHook.control}
                  render={({ field }) => (
                    <DatePicker
                      label="Production End *"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select production end date and time"
                      showTime={true}
                      error={!!formHook.formState.errors.production_end}
                    />
                  )}
                />
                {formHook.formState.errors.production_end && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.production_end.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  name="machine_start"
                  control={formHook.control}
                  render={({ field }) => (
                    <DatePicker
                      label="Machine Start *"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select machine start date and time"
                      showTime={true}
                      error={!!formHook.formState.errors.machine_start}
                    />
                  )}
                />
                {formHook.formState.errors.machine_start && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.machine_start.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  name="machine_end"
                  control={formHook.control}
                  render={({ field }) => (
                    <DatePicker
                      label="Machine End *"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select machine end date and time"
                      showTime={true}
                      error={!!formHook.formState.errors.machine_end}
                    />
                  )}
                />
                {formHook.formState.errors.machine_end && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.machine_end.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Production Section */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Production Details</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter production information</p>
            </div>
            
            <div className="space-y-4">
              {productionFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Production Entry {index + 1}</h4>
                    {productionFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduction(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Controller
                        name={`production.${index}.time`}
                        control={formHook.control}
                        render={({ field }) => (
                          <TimePicker
                            label="Time *"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select time"
                            error={!!formHook.formState.errors.production?.[index]?.time}
                          />
                        )}
                      />
                      {formHook.formState.errors.production?.[index]?.time && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.production[index]?.time?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`production.${index}.temp_hot_water`}>Hot Water Temp (°C) *</Label>
                      <Controller
                        name={`production.${index}.temp_hot_water`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`production.${index}.temp_hot_water`}
                            type="number"
                            step="0.1"
                            placeholder="Enter temperature"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.production?.[index]?.temp_hot_water && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.production[index]?.temp_hot_water?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`production.${index}.temp_product_pasteurisation`}>Pasteurisation Temp (°C) *</Label>
                      <Controller
                        name={`production.${index}.temp_product_pasteurisation`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`production.${index}.temp_product_pasteurisation`}
                            type="number"
                            step="0.1"
                            placeholder="Enter temperature"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.production?.[index]?.temp_product_pasteurisation && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.production[index]?.temp_product_pasteurisation?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`production.${index}.homogenisation_pressure_stage_1`}>Stage 1 Pressure (bar) *</Label>
                      <Controller
                        name={`production.${index}.homogenisation_pressure_stage_1`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`production.${index}.homogenisation_pressure_stage_1`}
                            type="number"
                            step="0.1"
                            placeholder="Enter pressure"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.production?.[index]?.homogenisation_pressure_stage_1 && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.production[index]?.homogenisation_pressure_stage_1?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`production.${index}.homogenisation_pressure_stage_2`}>Stage 2 Pressure (bar) *</Label>
                      <Controller
                        name={`production.${index}.homogenisation_pressure_stage_2`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`production.${index}.homogenisation_pressure_stage_2`}
                            type="number"
                            step="0.1"
                            placeholder="Enter pressure"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.production?.[index]?.homogenisation_pressure_stage_2 && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.production[index]?.homogenisation_pressure_stage_2?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`production.${index}.total_homogenisation_pressure`}>Total Pressure (bar) *</Label>
                      <Controller
                        name={`production.${index}.total_homogenisation_pressure`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`production.${index}.total_homogenisation_pressure`}
                            type="number"
                            step="0.1"
                            placeholder="Enter total pressure"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.production?.[index]?.total_homogenisation_pressure && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.production[index]?.total_homogenisation_pressure?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`production.${index}.temperature_product_out`}>Product Out Temp (°C) *</Label>
                      <Controller
                        name={`production.${index}.temperature_product_out`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`production.${index}.temperature_product_out`}
                            type="number"
                            step="0.1"
                            placeholder="Enter temperature"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.production?.[index]?.temperature_product_out && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.production[index]?.temperature_product_out?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`production.${index}.output_target_value`}>Output Target *</Label>
                      <Controller
                        name={`production.${index}.output_target_value`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`production.${index}.output_target_value`}
                            type="number"
                            step="0.1"
                            placeholder="Enter target value"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.production?.[index]?.output_target_value && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.production[index]?.output_target_value?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`production.${index}.output_target_unit`}>Unit *</Label>
                      <Controller
                        name={`production.${index}.output_target_unit`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border border-gray-300 hover:border-gray-400 focus:border-blue-500 shadow-none hover:shadow-none focus:shadow-none rounded-full">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="L">Liters (L)</SelectItem>
                              <SelectItem value="ML">Milliliters (ML)</SelectItem>
                              <SelectItem value="KG">Kilograms (KG)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {formHook.formState.errors.production?.[index]?.output_target_unit && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.production[index]?.output_target_unit?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => appendProduction({ 
                  time: "",
                  temp_hot_water: 0,
                  temp_product_pasteurisation: 0,
                  homogenisation_pressure_stage_1: 0,
                  homogenisation_pressure_stage_2: 0,
                  total_homogenisation_pressure: 0,
                  temperature_product_out: 0,
                  output_target_value: 0,
                  output_target_unit: "L"
                })}
                className="w-full border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Production Entry
              </Button>
            </div>
          </div>

        </div>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[75vw] sm:max-w-[75vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-lg font-light">
            {mode === "edit" ? "Edit Pasteurizing Form" : "Create Pasteurizing Form"}
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Enter all pasteurizing form details including machine information and production data
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={formHook.handleSubmit(handleSubmit)}>
            {renderForm()}
            
            <div className="flex items-center justify-end p-6 border-t">
              <Button
                type="submit"
                disabled={loading.create || loading.update}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {mode === "edit" ? "Update Form" : "Create Form"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
