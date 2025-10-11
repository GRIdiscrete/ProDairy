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

const bmtControlFormSchema = yup.object({
  flow_meter_start: yup.string().optional(),
  flow_meter_start_reading: yup.number().optional().typeError("Start reading must be a valid number"),
  flow_meter_end: yup.string().optional(),
  flow_meter_end_reading: yup.number().optional().typeError("End reading must be a valid number"),
  source_silo_id: yup
    .array()
    .of(yup.string().required())
    .required("At least one source silo is required")
    .min(1, "At least one source silo is required"),
  destination_silo_id: yup.string().optional(),
  movement_start: yup.string().optional(),
  movement_end: yup.string().optional(),
  volume: yup.number().optional().typeError("Volume must be a valid number"),
  dispatch_operator_id: yup.string().required("Dispatch operator is required"),
  dispatch_operator_signature: yup.string().required("Dispatch operator signature is required"),
  receiver_operator_id: yup.string().required("Receiver operator is required"),
  receiver_operator_signature: yup.string().required("Receiver operator signature is required"),
  product: yup.string().required("Product selection is required"),
  status: yup.string().oneOf(["Draft", "Pending", "Final"]).required("Status is required"),
  id: yup.string().optional(),
})

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
  } = useForm<BMTControlFormData>({
    resolver: yupResolver(bmtControlFormSchema),
    defaultValues: {
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
      id: "",
    },
  })

  const onSubmit = async (data: BMTControlFormData) => {
    try {
      // Helper function to extract time only from datetime string
      const extractTimeOnly = (timeString: string | undefined): string | undefined => {
        if (!timeString) return undefined
        
        // If it's already in HH:MM format, return as is
        if (timeString.match(/^\d{2}:\d{2}$/)) {
          return timeString
        }
        
        // Handle time-only formats with seconds/microseconds
        if (timeString.match(/^\d{2}:\d{2}:\d{2}/)) {
          // Handle HH:MM:SS or HH:MM:SS.microseconds format
          return timeString.substring(0, 5) // Extract HH:MM
        }
        
        // Extract time from datetime string
        if (timeString.includes('T')) {
          return timeString.split('T')[1]?.substring(0, 5)
        } else if (timeString.includes(' ')) {
          return timeString.split(' ')[1]?.substring(0, 5)
        }
        
        return timeString
      }

      // Helper function to convert time to full timestamp
      const timeToTimestamp = (timeString: string | undefined): string | undefined => {
        if (!timeString) return undefined
        
        // If it's already a full timestamp, return as is
        if (timeString.includes('T') || timeString.includes(' ')) {
          return timeString
        }
        
        // If it's in HH:MM format, convert to full timestamp
        if (timeString.match(/^\d{2}:\d{2}$/)) {
          const currentDate = new Date().toISOString().split('T')[0]
          return `${currentDate}T${timeString}:00.000000+00:00`
        }
        
        return timeString
      }

      const payload = {
        ...data,
        // Flow meter times: send as time-only (HH:MM format)
        flow_meter_start: extractTimeOnly(data.flow_meter_start) || null,
        flow_meter_end: extractTimeOnly(data.flow_meter_end) || null,
        // Movement times: send as full timestamps
        movement_start: timeToTimestamp(data.movement_start) || null,
        movement_end: timeToTimestamp(data.movement_end) || null,
        // Handle null values for undefined readings
        flow_meter_start_reading: data.flow_meter_start_reading ?? null,
        flow_meter_end_reading: data.flow_meter_end_reading ?? null,
        volume: data.volume ?? null,
        // Handle null values for unselected users - map to API field names
        llm_operator_id: data.dispatch_operator_id || null,
        dpp_operator_id: data.receiver_operator_id || null,
        // Handle signatures - map to API field names
        llm_signature: data.dispatch_operator_signature ? normalizeDataUrlToBase64(data.dispatch_operator_signature) : null,
        dpp_signature: data.receiver_operator_signature ? normalizeDataUrlToBase64(data.receiver_operator_signature) : null,
        // Remove the form fields that don't exist in API
        dispatch_operator_id: undefined,
        receiver_operator_id: undefined,
        dispatch_operator_signature: undefined,
        receiver_operator_signature: undefined,
      }

      // Debug: Log the payload to see what's being sent
      console.log('BMT Form Payload:', JSON.stringify(payload, null, 2))

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
            {/* Flow Meter Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Flow Meter Information (Optional)</h3>
              {/* Flow Meter Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="flow_meter_start"
                    control={control}
                    render={({ field }) => (
                      <ShadcnTimePicker
                        label="Flow Meter Start Time"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start time (24h)"
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
                        label="Flow Meter End Time"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select end time (24h)"
                        error={!!errors.flow_meter_end}
                      />
                    )}
                  />
                  {errors.flow_meter_end && <p className="text-sm text-red-500">{errors.flow_meter_end.message}</p>}
                </div>
              </div>

              {/* Flow Meter Readings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flow_meter_start_reading">Start Reading</Label>
                  <Controller
                    name="flow_meter_start_reading"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="flow_meter_start_reading"
                        type="number"
                        placeholder="Enter start reading"
                        className="rounded-full border-gray-200"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    )}
                  />
                  {errors.flow_meter_start_reading && <p className="text-sm text-red-500">{errors.flow_meter_start_reading.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="flow_meter_end_reading">End Reading</Label>
                  <Controller
                    name="flow_meter_end_reading"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="flow_meter_end_reading"
                        type="number"
                        placeholder="Enter end reading"
                        className="rounded-full border-gray-200"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    )}
                  />
                  {errors.flow_meter_end_reading && <p className="text-sm text-red-500">{errors.flow_meter_end_reading.message}</p>}
                </div>
              </div>
            </div>

            {/* Movement Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">BMT Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source_silo_id">Source Silos *</Label>
                  <Controller
                    name="source_silo_id"
                    control={control}
                    render={({ field }) => {
                      // Debug: Log the field value to see what's happening
                      console.log('Source Silo Field Value:', field.value, typeof field.value)
                      
                      return (
                        <MultiSelect
                          options={silos}
                          value={Array.isArray(field.value) ? field.value : []}
                          onValueChange={(newValue) => {
                            console.log('MultiSelect onChange:', newValue)
                            field.onChange(newValue)
                          }}
                          placeholder="Select source silos"
                          searchPlaceholder="Search silos..."
                          emptyMessage="No silos found"
                          loading={loadingSilos}
                          className="w-full"
                        />
                      )
                    }}
                  />
                  {errors.source_silo_id && <p className="text-sm text-red-500">{errors.source_silo_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination_silo_id">Destination Silo *</Label>
                  <Controller
                    name="destination_silo_id"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={silos}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select destination silo"
                        searchPlaceholder="Search silos..."
                        emptyMessage="No silos found"
                        loading={loadingSilos}
                        onSearch={handleSiloSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
                  />
                  {errors.destination_silo_id && <p className="text-sm text-red-500">{errors.destination_silo_id.message}</p>}
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
