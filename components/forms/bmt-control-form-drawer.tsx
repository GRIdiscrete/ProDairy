"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select"
import { DatePicker } from "@/components/ui/date-picker"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createBMTControlFormAction, updateBMTControlFormAction, fetchBMTControlForms } from "@/lib/store/slices/bmtControlFormSlice"
import { siloApi } from "@/lib/api/silo"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"
import type { BMTControlForm, CreateBMTControlFormRequest } from "@/lib/api/bmt-control-form"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl, normalizeDataUrlToBase64 } from "@/lib/utils/signature"

// Update schema to match new API structure
const sourceSiloDetailSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  flow_meter_start: yup.string().required("Start time is required"),
  flow_meter_start_reading: yup.number().required("Start reading is required"),
  flow_meter_end: yup.string().required("End time is required"),
  flow_meter_end_reading: yup.number().required("End reading is required"),
  source_silo_quantity_requested: yup.number().required("Quantity requested is required"),
  product: yup.string().required("Product is required"),
})

const bmtControlFormSchema = yup.object({
  source_silo_details: yup.array().of(sourceSiloDetailSchema).min(1, "At least one source silo is required"),
  movement_start: yup.string().required("Movement start is required"),
  movement_end: yup.string().required("Movement end is required"),
  destination_silo_id: yup.string().required("Destination silo is required"),
  destination_silo_details: sourceSiloDetailSchema.required("Destination silo details are required"),
  dispatch_operator_id: yup.string().required("Dispatch operator is required"),
  dispatch_operator_signature: yup.string().required("Dispatch operator signature is required"),
  receiver_operator_id: yup.string().required("Receiver operator is required"),
  receiver_operator_signature: yup.string().required("Receiver operator signature is required"),
  product: yup.string().required("Product selection is required"),
  status: yup.string().oneOf(["Draft", "Pending", "Final"]).required("Status is required"),
  tag: yup.string().optional(),
  id: yup.string().optional(),
})

type SourceSiloDetail = yup.InferType<typeof sourceSiloDetailSchema>
type BMTControlFormData = yup.InferType<typeof bmtControlFormSchema>

interface BMTControlFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: BMTControlForm | null
  mode: "create" | "edit"
}

export function BMTControlFormDrawer({ open, onOpenChange, form, mode }: BMTControlFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.bmtControlForms)

  // State for searchable selects
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])
  const [users, setUsers] = useState<SearchableSelectOption[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [dispatchSigOpen, setDispatchSigOpen] = useState(false)
  const [receiverSigOpen, setReceiverSigOpen] = useState(false)

  // State for source silo details
  const [selectedSourceSilos, setSelectedSourceSilos] = useState<SourceSiloDetail[]>([])
  const [destinationSiloDetail, setDestinationSiloDetail] = useState<SourceSiloDetail | null>(null)

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingSilos(true)
      setLoadingUsers(true)
      
      const [silosResponse, usersResponse] = await Promise.all([
        siloApi.getSilos(),
        usersApi.getUsers()
      ])
      
      setSilos(silosResponse.data?.map(silo => ({
        value: silo.id,
        label: silo.name,
        description: `${silo.location} • ${silo.category} • ${silo.capacity}L capacity`
      })) || [])
      
      setUsers(usersResponse.data?.map(user => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
        description: `${user.department} • ${user.email}`
      })) || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Failed to load form data')
    } finally {
      setLoadingSilos(false)
      setLoadingUsers(false)
    }
  }

  // Handle silo search
  const handleSiloSearch = async (searchTerm: string) => {
    try {
      setLoadingSilos(true)
      const response = await siloApi.getSilos({
        filters: { search: searchTerm }
      })
      setSilos(response.data?.map(silo => ({
        value: silo.id,
        label: silo.name,
        description: `${silo.location} • ${silo.category} • ${silo.capacity}L capacity`
      })) || [])
    } catch (error) {
      console.error('Error searching silos:', error)
    } finally {
      setLoadingSilos(false)
    }
  }

  // Handle user search
  const handleUserSearch = async (searchTerm: string) => {
    try {
      setLoadingUsers(true)
      const response = await usersApi.getUsers({
        filters: { search: searchTerm }
      })
      setUsers(response.data?.map(user => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
        description: `${user.department} • ${user.email}`
      })) || [])
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BMTControlFormData>({
    resolver: yupResolver(bmtControlFormSchema),
    defaultValues: {
      source_silo_details: [],
      movement_start: "",
      movement_end: "",
      destination_silo_id: "",
      destination_silo_details: undefined,
      dispatch_operator_id: "",
      dispatch_operator_signature: "",
      receiver_operator_id: "",
      receiver_operator_signature: "",
      product: "",
      status: "Draft",
      tag: "",
      id: "",
    },
  })

  // Watch for changes in selected silos and update details
  const sourceSiloDetails = watch("source_silo_details") || []
  const sourceSiloIds = Array.isArray(sourceSiloDetails) ? sourceSiloDetails.map((s: any) => s.id) : []
  const destinationSiloId = watch("destination_silo_id")

  // Handler for updating a source silo detail
  const updateSourceSiloDetail = (idx: number, field: keyof SourceSiloDetail, value: any) => {
    const details = [...(watch("source_silo_details") || [])]
    details[idx] = { ...details[idx], [field]: value }
    setValue("source_silo_details", details)
  }

  // Handler for updating destination silo detail
  const updateDestinationSiloDetail = (field: keyof SourceSiloDetail, value: any) => {
    setValue("destination_silo_details", { ...watch("destination_silo_details"), [field]: value })
  }

  // When user selects source silos, initialize their details if not present
  useEffect(() => {
    const selected = (watch("source_silo_details") as SourceSiloDetail[]) || []
    if (selected.length === 0 && selectedSourceSilos.length > 0) {
      setValue("source_silo_details", selectedSourceSiloDetails)
    }
  }, [selectedSourceSilos, setValue, watch])

  // When user selects destination silo, initialize its details if not present
  useEffect(() => {
    if (destinationSiloId && !watch("destination_silo_details")) {
      const silo = silos.find(s => s.value === destinationSiloId)
      if (silo) {
        setValue("destination_silo_details", {
          id: silo.value,
          name: silo.label,
          flow_meter_start: "",
          flow_meter_start_reading: 0,
          flow_meter_end: "",
          flow_meter_end_reading: 0,
          source_silo_quantity_requested: 0,
          product: "",
        })
      }
    }
  }, [destinationSiloId, silos, setValue, watch])

  const onSubmit = async (data: BMTControlFormData) => {
    try {
      // Send data as is, matches new API structure
      const payload = {
        ...data,
      }

      if (mode === "create") {
        await dispatch(createBMTControlFormAction(payload as any)).unwrap()
        toast.success('BMT Control Form created successfully')
        // Refresh the data to get complete relationship information
        setTimeout(() => {
          dispatch(fetchBMTControlForms())
        }, 100)
      } else if (form) {
        const updatePayload = {
          ...payload,
          id: form.id,
          created_at: form.created_at,
          updated_at: form.updated_at,
        }
        
        // Debug: Log the update payload
        console.log('BMT Update Payload Id:', form)
        console.log('BMT Update Full Payload:', updatePayload)
        
        await dispatch(updateBMTControlFormAction({ id: form.id, formData: payload as any })).unwrap()
        toast.success('BMT Control Form updated successfully')
        // Refresh the data to get complete relationship information
        setTimeout(() => {
          dispatch(fetchBMTControlForms())
        }, 100)
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast.error(error || (mode === "create" ? 'Failed to create BMT control form' : 'Failed to update BMT control form'))
    }
  }

  useEffect(() => {
    if (open && form && mode === "edit") {
      // Debug: Log the entire form object to see what we're getting
      console.log('Form object in useEffect:', form)
      console.log('Form ID specifically:', form.id)
      console.log('Form keys:', Object.keys(form))
      
      // Helper to extract time from datetime strings - handles multiple formats
      const extractTime = (timeString: string | undefined) => {
        if (!timeString) return ""
        
        // Handle ISO timestamp format (2025-01-11T12:58:15.357772)
        if (timeString.includes('T')) {
          return timeString.split('T')[1]?.substring(0, 5) || ""
        } 
        // Handle space-separated datetime (2025-01-11 12:58:15.357772)
        else if (timeString.includes(' ')) {
          return timeString.split(' ')[1]?.substring(0, 5) || ""
        } 
        // Handle time-only formats
        else if (timeString.match(/^\d{2}:\d{2}:\d{2}/)) {
          // Handle HH:MM:SS or HH:MM:SS.microseconds format
          return timeString.substring(0, 5) // Extract HH:MM
        } 
        else if (timeString.match(/^\d{2}:\d{2}$/)) {
          // Handle HH:MM format
          return timeString
        }
        
        return ""
      }

      reset({
        flow_meter_start: extractTime(form.flow_meter_start),
        flow_meter_start_reading: form.flow_meter_start_reading || undefined,
        flow_meter_end: extractTime(form.flow_meter_end),
        flow_meter_end_reading: form.flow_meter_end_reading || undefined,
        source_silo_id: Array.isArray(form.source_silo_id) ? form.source_silo_id : [],
        destination_silo_id: form.destination_silo_id || "",
        movement_start: extractTime(form.movement_start),
        movement_end: extractTime(form.movement_end),
        volume: form.volume || undefined,
        // Map API fields to form fields
        dispatch_operator_id: (form as any).dispatch_operator_id || form.llm_operator_id || "",
        dispatch_operator_signature: (form as any).dispatch_operator_signature || form.llm_signature || "",
        receiver_operator_id: (form as any).receiver_operator_id || form.dpp_operator_id || "",
        receiver_operator_signature: (form as any).receiver_operator_signature || form.dpp_signature || "",
        product: form.product || "",
        status: (form as any).status || "Draft",
        id: form.id || "",
      })
    } else if (open && mode === "create") {
      reset({
        flow_meter_start: "",
        flow_meter_start_reading: undefined,
        flow_meter_end: "",
        flow_meter_end_reading: undefined,
        source_silo_id: [],
        destination_silo_id: "",
        movement_start: "",
        movement_end: "",
        volume: undefined,
        dispatch_operator_id: "",
        dispatch_operator_signature: "",
        receiver_operator_id: "",
        receiver_operator_signature: "",
        product: "",
        status: "Draft",
      })
    }
  }, [open, form, mode, reset])

  // Load initial data when drawer opens
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white overflow-y-auto max-h-screen">
        <div className="p-6 bg-white">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New BMT Control Form" : "Edit BMT Control Form"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new bulk milk transfer control form" : "Update bulk milk transfer control form"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Source Silo Details */}
             <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">BMT Information</h3>
              
              {/* Flow Meter Start/End */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="flow_meter_start"
                    control={control}
                    render={({ field }) => (
                      <ShadcnTimePicker
                        label="Flow Meter Start"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select flow meter start time"
                        error={!!errors.flow_meter_start}
                      />
                    )}
                  />
                  {errors.flow_meter_start && <p className="text-sm text-red-500">{errors.flow_meter_start.message}</p>}
                </div>
                <div className="space-y-2">
                  <Controller
                    name="flow_meter_end"
                    control={control}
                    render={({ field }) => (
                      <ShadcnTimePicker
                        label="Flow Meter End"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select flow meter end time"
                        error={!!errors.flow_meter_end}
                      />
                    )}
                  />
                  {errors.flow_meter_end && <p className="text-sm text-red-500">{errors.flow_meter_end.message}</p>}
                </div>
              </div>

              {/* Movement Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="movement_start"
                    control={control}
                    render={({ field }) => (
                      <ShadcnTimePicker
                        label="Movement Start Time"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start time (24h)"
                        error={!!errors.movement_start}
                      />
                    )}
                  />
                  {errors.movement_start && <p className="text-sm text-red-500">{errors.movement_start.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Controller
                    name="movement_end"
                    control={control}
                    render={({ field }) => (
                      <ShadcnTimePicker
                        label="Movement End Time"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select end time (24h)"
                        error={!!errors.movement_end}
                      />
                    )}
                  />
                  {errors.movement_end && <p className="text-sm text-red-500">{errors.movement_end.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume (Liters)</Label>
                  <Controller
                    name="volume"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="volume"
                        type="number"
                        placeholder="Enter volume"
                        className="rounded-full border-gray-200"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    )}
                  />
                  {errors.volume && <p className="text-sm text-red-500">{errors.volume.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  <Controller
                    name="product"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full rounded-full border-gray-200">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Raw Milk">
                            <span className="font-light">Raw Milk</span>
                          </SelectItem>
                          <SelectItem value="Skim Milk">
                            <span className="font-light">Skim Milk</span>
                          </SelectItem>
                          <SelectItem value="Standardized Milk">
                            <span className="font-light">Standardized Milk</span>
                          </SelectItem>
                          <SelectItem value="Pasteurized Milk">
                            <span className="font-light">Pasteurized Milk</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.product && <p className="text-sm text-red-500">{errors.product.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Source Silo(s) Details</h3>
              <Controller
                name="source_silo_details"
                control={control}
                render={({ field }) => (
                  <>
                    <MultiSelect
                      options={silos}
                      value={Array.isArray(field.value) ? field.value.map((s: SourceSiloDetail) => s.id) : []}
                      onValueChange={(ids) => {
                        // When silos are selected, initialize their details if not present
                        const details = ids.map((id: string) => {
                          const silo = silos.find(s => s.value === id)
                          const existing = Array.isArray(field.value) ? field.value.find((s: SourceSiloDetail) => s.id === id) : undefined
                          return existing || {
                            id,
                            name: silo?.label || "",
                            flow_meter_start: "",
                            flow_meter_start_reading: 0,
                            flow_meter_end: "",
                            flow_meter_end_reading: 0,
                            source_silo_quantity_requested: 0,
                            product: "",
                          }
                        })
                        field.onChange(details)
                      }}
                      placeholder="Select source silos"
                      searchPlaceholder="Search silos..."
                      emptyMessage="No silos found"
                      loading={loadingSilos}
                      className="w-full"
                    />
                    {Array.isArray(field.value) && field.value.map((silo: SourceSiloDetail, idx: number) => (
                      <div key={silo.id} className="border rounded p-3 mt-2 bg-gray-50">
                        <div className="font-semibold mb-2">{silo.name}</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Flow Meter Start</Label>
                            <ShadcnTimePicker
                              label=""
                              value={silo.flow_meter_start}
                              onChange={val => updateSourceSiloDetail(idx, "flow_meter_start", val)}
                              placeholder="Select start time (24h)"
                              error={false}
                            />
                          </div>
                          <div>
                            <Label>Start Reading</Label>
                            <Input
                              type="number"
                              value={silo.flow_meter_start_reading}
                              onChange={e => updateSourceSiloDetail(idx, "flow_meter_start_reading", Number(e.target.value))}
                              placeholder="Start reading"
                            />
                          </div>
                          <div>
                            <Label>Flow Meter End</Label>
                            <ShadcnTimePicker
                              label=""
                              value={silo.flow_meter_end}
                              onChange={val => updateSourceSiloDetail(idx, "flow_meter_end", val)}
                              placeholder="Select end time (24h)"
                              error={false}
                            />
                          </div>
                          <div>
                            <Label>End Reading</Label>
                            <Input
                              type="number"
                              value={silo.flow_meter_end_reading}
                              onChange={e => updateSourceSiloDetail(idx, "flow_meter_end_reading", Number(e.target.value))}
                              placeholder="End reading"
                            />
                          </div>
                          <div>
                            <Label>Quantity Requested</Label>
                            <Input
                              type="number"
                              value={silo.source_silo_quantity_requested}
                              onChange={e => updateSourceSiloDetail(idx, "source_silo_quantity_requested", Number(e.target.value))}
                              placeholder="Quantity requested"
                            />
                          </div>
                          <div>
                            <Label>Product</Label>
                            {/* Use dropdown for product */}
                            <Select
                              value={silo.product}
                              onValueChange={val => updateSourceSiloDetail(idx, "product", val)}
                            >
                              <SelectTrigger className="w-full rounded-full border-gray-200">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Raw Milk">
                                  <span className="font-light">Raw Milk</span>
                                </SelectItem>
                                <SelectItem value="Skim Milk">
                                  <span className="font-light">Skim Milk</span>
                                </SelectItem>
                                <SelectItem value="Standardized Milk">
                                  <span className="font-light">Standardized Milk</span>
                                </SelectItem>
                                <SelectItem value="Pasteurized Milk">
                                  <span className="font-light">Pasteurized Milk</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              />
              {errors.source_silo_details && <p className="text-sm text-red-500">{(errors.source_silo_details as any).message}</p>}
            </div>

            {/* Destination Silo Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Destination Silo Details</h3>
              <Controller
                name="destination_silo_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={silos}
                    value={field.value}
                    onValueChange={val => {
                      field.onChange(val)
                      const silo = silos.find(s => s.value === val)
                      if (silo) {
                        setValue("destination_silo_details", {
                          id: silo.value,
                          name: silo.label,
                          flow_meter_start: "",
                          flow_meter_start_reading: 0,
                          flow_meter_end: "",
                          flow_meter_end_reading: 0,
                          source_silo_quantity_requested: 0,
                          product: "",
                        })
                      }
                    }}
                    placeholder="Select destination silo"
                    searchPlaceholder="Search silos..."
                    emptyMessage="No silos found"
                    loading={loadingSilos}
                    onSearch={handleSiloSearch}
                    className="w-full rounded-full border-gray-200"
                  />
                )}
              />
              <Controller
                name="destination_silo_details"
                control={control}
                render={({ field }) => field.value && (
                  <div className="border rounded p-3 mt-2 bg-gray-50">
                    <div className="font-semibold mb-2">{field.value.name}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Flow Meter Start</Label>
                        <ShadcnTimePicker
                          label=""
                          value={field.value.flow_meter_start}
                          onChange={val => updateDestinationSiloDetail("flow_meter_start", val)}
                          placeholder="Select start time (24h)"
                          error={false}
                        />
                      </div>
                      <div>
                        <Label>Start Reading</Label>
                        <Input
                          type="number"
                          value={field.value.flow_meter_start_reading}
                          onChange={e => updateDestinationSiloDetail("flow_meter_start_reading", Number(e.target.value))}
                          placeholder="Start reading"
                        />
                      </div>
                      <div>
                        <Label>Flow Meter End</Label>
                        <ShadcnTimePicker
                          label=""
                          value={field.value.flow_meter_end}
                          onChange={val => updateDestinationSiloDetail("flow_meter_end", val)}
                          placeholder="Select end time (24h)"
                          error={false}
                        />
                      </div>
                      <div>
                        <Label>End Reading</Label>
                        <Input
                          type="number"
                          value={field.value.flow_meter_end_reading}
                          onChange={e => updateDestinationSiloDetail("flow_meter_end_reading", Number(e.target.value))}
                          placeholder="End reading"
                        />
                      </div>
                      <div>
                        <Label>Quantity Requested</Label>
                        <Input
                          type="number"
                          value={field.value.source_silo_quantity_requested}
                          onChange={e => updateDestinationSiloDetail("source_silo_quantity_requested", Number(e.target.value))}
                          placeholder="Quantity requested"
                        />
                      </div>
                      <div>
                        <Label>Product</Label>
                        {/* Use dropdown for product */}
                        <Select
                          value={field.value.product}
                          onValueChange={val => updateDestinationSiloDetail("product", val)}
                        >
                          <SelectTrigger className="w-full rounded-full border-gray-200">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Raw Milk">
                              <span className="font-light">Raw Milk</span>
                            </SelectItem>
                            <SelectItem value="Skim Milk">
                              <span className="font-light">Skim Milk</span>
                            </SelectItem>
                            <SelectItem value="Standardized Milk">
                              <span className="font-light">Standardized Milk</span>
                            </SelectItem>
                            <SelectItem value="Pasteurized Milk">
                              <span className="font-light">Pasteurized Milk</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              />
              {errors.destination_silo_details && <p className="text-sm text-red-500">{(errors.destination_silo_details as any).message}</p>}
            </div>

            {/* Movement Information */}
           
            {/* Operator Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Operator Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dispatch_operator_id">Dispatch Operator *</Label>
                  <Controller
                    name="dispatch_operator_id"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={users}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select dispatch operator"
                        searchPlaceholder="Search users..."
                        emptyMessage="No users found"
                        loading={loadingUsers}
                        onSearch={handleUserSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
                  />
                  {errors.dispatch_operator_id && <p className="text-sm text-red-500">{errors.dispatch_operator_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dispatch_operator_signature">Dispatch Operator Signature *</Label>
                  <Controller
                    name="dispatch_operator_signature"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        {field.value ? (
                          <img src={base64ToPngDataUrl(field.value)} alt="Dispatch signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                        ) : (
                          <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                            No signature captured
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <LoadingButton type="button" variant="outline" onClick={() => setDispatchSigOpen(true)}>Add Signature</LoadingButton>
                          {field.value && (
                            <>
                              <LoadingButton type="button" variant="outline" onClick={() => setDispatchSigOpen(true)}>View Signature</LoadingButton>
                              <LoadingButton type="button" variant="ghost" onClick={() => field.onChange("")}>Clear</LoadingButton>
                            </>
                          )}
                        </div>
                        <SignatureModal
                          open={dispatchSigOpen}
                          onOpenChange={setDispatchSigOpen}
                          title="Capture Dispatch Operator Signature"
                          onSave={(dataUrl) => {
                            field.onChange(dataUrl)
                            setDispatchSigOpen(false)
                          }}
                        />
                      </div>
                    )}
                  />
                  {errors.dispatch_operator_signature && <p className="text-sm text-red-500">{errors.dispatch_operator_signature.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiver_operator_id">Receiver Operator *</Label>
                  <Controller
                    name="receiver_operator_id"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={users}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select receiver operator"
                        searchPlaceholder="Search users..."
                        emptyMessage="No users found"
                        loading={loadingUsers}
                        onSearch={handleUserSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
                  />
                  {errors.receiver_operator_id && <p className="text-sm text-red-500">{errors.receiver_operator_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver_operator_signature">Receiver Operator Signature *</Label>
                  <Controller
                    name="receiver_operator_signature"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        {field.value ? (
                          <img src={base64ToPngDataUrl(field.value)} alt="Receiver signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                        ) : (
                          <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                            No signature captured
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <LoadingButton type="button" variant="outline" onClick={() => setReceiverSigOpen(true)}>Add Signature</LoadingButton>
                          {field.value && (
                            <>
                              <LoadingButton type="button" variant="outline" onClick={() => setReceiverSigOpen(true)}>View Signature</LoadingButton>
                              <LoadingButton type="button" variant="ghost" onClick={() => field.onChange("")}>Clear</LoadingButton>
                            </>
                          )}
                        </div>
                        <SignatureModal
                          open={receiverSigOpen}
                          onOpenChange={setReceiverSigOpen}
                          title="Capture Receiver Operator Signature"
                          onSave={(dataUrl) => {
                            field.onChange(dataUrl)
                            setReceiverSigOpen(false)
                          }}
                        />
                      </div>
                    )}
                  />
                  {errors.receiver_operator_signature && <p className="text-sm text-red-500">{errors.receiver_operator_signature.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full rounded-full border-gray-200">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </LoadingButton>
              <LoadingButton 
                type="submit" 
                loading={mode === "create" ? operationLoading.create : operationLoading.update}
                loadingText={mode === "create" ? "Creating..." : "Updating..."}
              >
                {mode === "create" ? "Create BMT Form" : "Update BMT Form"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
    <SignatureModal
      open={dispatchSigOpen}
      onOpenChange={setDispatchSigOpen}
      title="Capture Dispatch Operator Signature"
      onSave={(dataUrl) => {
        setValue("dispatch_operator_signature", dataUrl, { shouldValidate: true, shouldDirty: true })
      }}
    />
    <SignatureViewer
      open={false}
      onOpenChange={() => {}}
      title="Dispatch Operator Signature"
      value={undefined}
    />
    <SignatureModal
      open={receiverSigOpen}
      onOpenChange={setReceiverSigOpen}
      title="Capture Receiver Operator Signature"
      onSave={(dataUrl) => {
        setValue("receiver_operator_signature", dataUrl, { shouldValidate: true, shouldDirty: true })
      }}
    />
    <SignatureViewer
      open={false}
      onOpenChange={() => {}}
      title="Receiver Operator Signature"
      value={undefined}
    />
    </>
  )
}
