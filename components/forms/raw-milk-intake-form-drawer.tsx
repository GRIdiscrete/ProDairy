"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
  Droplets,
  Truck,
  Package,
  Save,
  ArrowRight,
  Beaker
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  createRawMilkIntakeForm,
  updateRawMilkIntakeForm,
  fetchRawMilkIntakeForms,
  fetchTrucks
} from "@/lib/store/slices/rawMilkIntakeSlice"
import { RawMilkIntakeForm, CreateRawMilkIntakeFormRequest, RawMilkIntakeDetail } from "@/lib/api/raw-milk-intake"
import { siloApi } from "@/lib/api/silo"
import { toast } from "sonner"
import { SearchableSelectOption } from "@/components/ui/searchable-select"

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6  from-blue-50 to-cyan-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Truck className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-sm font-light">Truck Arrival</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <Droplets className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-green-600">Raw Milk Intake</span>
          <div className=" bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Beaker className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Standardizing</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Package className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Pasteurizing</span>
      </div>
    </div>
  </div>
)

// Complete form schema with details
const rawMilkIntakeFormSchema = yup.object({
  truck: yup.string().required("Truck selection is required"),
  truck_compartment_number: yup.number().required("Compartment number is required"),
  silo_name: yup.string().required("Destination silo is required"),
  flow_meter_start: yup.string().required("Flow meter start time is required"),
  flow_meter_start_reading: yup.number().required("Flow meter start reading is required").min(0),
  flow_meter_end: yup.string().required("Flow meter end time is required"),
  flow_meter_end_reading: yup.number().required("Flow meter end reading is required").min(0),
  quantity: yup.number().required("Quantity is required").min(0.1, "Quantity must be greater than 0"),
  status: yup.string().oneOf(["draft", "pending", "final"]).required("Status is required"),
})

type RawMilkIntakeFormData = yup.InferType<typeof rawMilkIntakeFormSchema>

interface RawMilkIntakeFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: RawMilkIntakeForm | null
  mode: "create" | "edit"
}

export function RawMilkIntakeFormDrawer({
  open,
  onOpenChange,
  form,
  mode = "create"
}: RawMilkIntakeFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading, trucks } = useAppSelector((state) => state.rawMilkIntake)
  const { user } = useAppSelector((state) => state.auth)

  // State for searchable silos
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)

  // Single form for all data
  const formHook = useForm<RawMilkIntakeFormData>({
    resolver: yupResolver(rawMilkIntakeFormSchema),
    defaultValues: {
      truck: "",
      truck_compartment_number: undefined,
      silo_name: "",
      flow_meter_start: "",
      flow_meter_start_reading: undefined,
      flow_meter_end: "",
      flow_meter_end_reading: undefined,
      quantity: undefined,
      status: "draft",
    },
  })

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingSilos(true)

      // Load trucks
      await dispatch(fetchTrucks()).unwrap()

      // Load silos
      const silosResponse = await siloApi.getSilos()
      const silosData = silosResponse.data?.map(silo => ({
        value: silo.name,
        label: silo.name,
        description: `${silo.location} • ${silo.category} • ${silo.capacity}L capacity`
      })) || []
      setSilos(silosData)
    } catch (error) {
      console.error("Failed to load initial data:", error)
      toast.error("Failed to load form data")
    } finally {
      setLoadingSilos(false)
    }
  }

  // Load data when drawer opens
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open, dispatch])

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && form && form.details && form.details.length > 0) {
        const detail = form.details[0] // Use first detail for editing
        formHook.reset({
          truck: form.truck,
          truck_compartment_number: detail.truck_compartment_number,
          silo_name: detail.silo_name,
          flow_meter_start: detail.flow_meter_start,
          flow_meter_start_reading: detail.flow_meter_start_reading,
          flow_meter_end: detail.flow_meter_end,
          flow_meter_end_reading: detail.flow_meter_end_reading,
          quantity: detail.quantity,
          status: detail.status as any,
        })
      } else {
        formHook.reset({
          truck: "",
          truck_compartment_number: undefined,
          silo_name: "",
          flow_meter_start: "",
          flow_meter_start_reading: undefined,
          flow_meter_end: "",
          flow_meter_end_reading: undefined,
          quantity: undefined,
          status: "draft",
        })
      }
    }
  }, [open, mode, form])

  // Auto-populate compartment number from truck selection
  useEffect(() => {
    const subscription = formHook.watch((value, { name }) => {
      if (name === "truck" && value.truck) {
        const selectedTruck = trucks.find(t =>
          `${t.truck_number}-${t.truck_compartment_number}` === value.truck
        )
        if (selectedTruck) {
          formHook.setValue("truck_compartment_number", selectedTruck.truck_compartment_number)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [formHook.watch, trucks, formHook])

  const handleSubmit = async (data: RawMilkIntakeFormData) => {
    try {
      if (!user?.id) {
        toast.error("User not authenticated")
        return
      }

      // Extract truck number from combined selection
      const truckNumber = data.truck.split('-')[0]

      // Build detail object
      const detail: Omit<RawMilkIntakeDetail, 'id' | 'created_at' | 'updated_at' | 'raw_milk_intake_form_2_id'> = {
        truck_compartment_number: data.truck_compartment_number,
        silo_name: data.silo_name,
        flow_meter_start: data.flow_meter_start,
        flow_meter_start_reading: data.flow_meter_start_reading,
        flow_meter_end: data.flow_meter_end,
        flow_meter_end_reading: data.flow_meter_end_reading,
        quantity: data.quantity,
        status: data.status,
      }

      const formData: CreateRawMilkIntakeFormRequest = {
        operator: user.id,
        truck: truckNumber,
        details: [detail],
      }

      if (mode === "edit" && form) {
        await dispatch(updateRawMilkIntakeForm({
          ...formData,
          id: form.id
        })).unwrap()
        toast.success("Form updated successfully")
      } else {
        await dispatch(createRawMilkIntakeForm(formData)).unwrap()
        toast.success("Form created successfully")
      }

      // Fetch updated forms list
      await dispatch(fetchRawMilkIntakeForms())

      onOpenChange(false)
    } catch (error: any) {
      console.error("Form submission error:", error)
      toast.error(error?.message || "Failed to save form")
    }
  }

  const onInvalid = (errors: any) => {
    const errorMessages = Object.values(errors).map((err: any) => err.message).filter(Boolean)
    toast.error(`Please check the following fields: ${errorMessages.join(', ')}`, {
      style: { background: '#ef4444', color: 'white' }
    })
  }

  // Get truck options
  const truckOptions = trucks.map(truck => ({
    value: `${truck.truck_number}-${truck.truck_compartment_number}`,
    label: `${truck.truck_number} - Compartment ${truck.truck_compartment_number}`,
    description: `Volume: ${truck.total_compartment_volume}L • ${truck.voucher_contributions.length} voucher(s)`
  }))

  const renderForm = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />

      <div className="space-y-6">
        {/* Truck Selection */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Truck Information</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Select the truck compartment for intake</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="truck">Truck & Compartment *</Label>
            <Controller
              name="truck"
              control={formHook.control}
              render={({ field }) => (
                <SearchableSelect
                  options={truckOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Search and select truck compartment"
                  loading={operationLoading.fetchTrucks}
                />
              )}
            />
            {formHook.formState.errors.truck && (
              <p className="text-sm text-red-500">{formHook.formState.errors.truck.message}</p>
            )}
          </div>
        </div>

        {/* Intake Details */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Intake Details</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Enter flow meter readings and destination</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="silo_name">Destination Silo *</Label>
              <Controller
                name="silo_name"
                control={formHook.control}
                render={({ field }) => (
                  <SearchableSelect
                    options={silos}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select destination silo"
                    loading={loadingSilos}
                  />
                )}
              />
              {formHook.formState.errors.silo_name && (
                <p className="text-sm text-red-500">{formHook.formState.errors.silo_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Controller
                name="status"
                control={formHook.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full rounded-full py-2 px-4">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {formHook.formState.errors.status && (
                <p className="text-sm text-red-500">{formHook.formState.errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flow_meter_start">Flow Meter Start Time *</Label>
              <Controller
                name="flow_meter_start"
                control={formHook.control}
                render={({ field }) => (
                  <Input
                    type="datetime-local"
                    {...field}
                  />
                )}
              />
              {formHook.formState.errors.flow_meter_start && (
                <p className="text-sm text-red-500">{formHook.formState.errors.flow_meter_start.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="flow_meter_start_reading">Start Reading *</Label>
              <Controller
                name="flow_meter_start_reading"
                control={formHook.control}
                render={({ field }) => (
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter start reading"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                )}
              />
              {formHook.formState.errors.flow_meter_start_reading && (
                <p className="text-sm text-red-500">{formHook.formState.errors.flow_meter_start_reading.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flow_meter_end">Flow Meter End Time *</Label>
              <Controller
                name="flow_meter_end"
                control={formHook.control}
                render={({ field }) => (
                  <Input
                    type="datetime-local"
                    {...field}
                  />
                )}
              />
              {formHook.formState.errors.flow_meter_end && (
                <p className="text-sm text-red-500">{formHook.formState.errors.flow_meter_end.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="flow_meter_end_reading">End Reading *</Label>
              <Controller
                name="flow_meter_end_reading"
                control={formHook.control}
                render={({ field }) => (
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter end reading"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                )}
              />
              {formHook.formState.errors.flow_meter_end_reading && (
                <p className="text-sm text-red-500">{formHook.formState.errors.flow_meter_end_reading.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quantity Received (L) *</Label>
            <Controller
              name="quantity"
              control={formHook.control}
              render={({ field: { onChange, value } }) => (
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter quantity"
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              )}
            />
            {formHook.formState.errors.quantity && (
              <p className="text-sm text-red-500">{formHook.formState.errors.quantity.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-lg font-light">
            {mode === "edit" ? "Edit Raw Milk Intake Form" : "Create Raw Milk Intake Form"}
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Enter all raw milk intake details including truck selection and flow meter readings
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={formHook.handleSubmit(handleSubmit, onInvalid)}>
            {renderForm()}

            <div className="flex items-center justify-end p-6 border-t">
              <Button
                type="submit"
                disabled={operationLoading.create || operationLoading.update}
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
