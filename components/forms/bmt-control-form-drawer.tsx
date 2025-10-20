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

  // --- Validation message helpers ---
  const getErrorMsg = (field: any) => (field ? <p className="text-sm text-red-500">{field.message}</p> : null)

  // --- Watch for changes ---
  const sourceSiloDetails = watch("source_silo_details") || []
  const destinationSiloId = watch("destination_silo_id")
  const destinationSiloDetails = watch("destination_silo_details")

  // --- Only show details cards if there are selected silos/destination silo ---
  // Use source_silo_details to get selected ids for MultiSelect value
  const selectedSourceSiloIds = Array.isArray(sourceSiloDetails)
    ? sourceSiloDetails.map((s: SourceSiloDetail) => s.id)
    : []
  const showSourceSiloDetails = selectedSourceSiloIds.length > 0
  const showDestinationSiloDetails = !!destinationSiloId

  // --- Handler for updating a source silo detail ---
  const updateSourceSiloDetail = (idx: number, field: keyof SourceSiloDetail, value: any) => {
    const details = [...(watch("source_silo_details") || [])]
    details[idx] = { ...details[idx], [field]: value }
    setValue("source_silo_details", details)
  }

  // --- Handler for updating destination silo detail ---
  const updateDestinationSiloDetail = (field: keyof SourceSiloDetail, value: any) => {
    setValue("destination_silo_details", { ...watch("destination_silo_details"), [field]: value })
  }

  // --- On edit: only populate source/destination silo details if present and if selector matches ---
  useEffect(() => {
    if (open && form && mode === "edit") {
      // Prefill using ISO strings as received from API
      const sourceSiloDetails = Array.isArray((form as any).bmt_control_form_source_silo)
        ? (form as any).bmt_control_form_source_silo.map((silo: any) => ({
            id: silo.id,
            name: silo.name,
            flow_meter_start: silo.flow_meter_start || "",
            flow_meter_start_reading: silo.flow_meter_start_reading ?? 0,
            flow_meter_end: silo.flow_meter_end || "",
            flow_meter_end_reading: silo.flow_meter_end_reading ?? 0,
            source_silo_quantity_requested: silo.source_silo_quantity_requested ?? 0,
            product: silo.product ?? "",
          }))
        : []

      const destinationSilo = (form as any).destination_silo
        ? {
            id: (form as any).destination_silo.id,
            name: (form as any).destination_silo.name,
            flow_meter_start: (form as any).destination_silo.flow_meter_start || "",
            flow_meter_start_reading: (form as any).destination_silo.flow_meter_start_reading ?? 0,
            flow_meter_end: (form as any).destination_silo.flow_meter_end || "",
            flow_meter_end_reading: (form as any).destination_silo.flow_meter_end_reading ?? 0,
            source_silo_quantity_requested: (form as any).destination_silo.source_silo_quantity_requested ?? 0,
            product: (form as any).destination_silo.product ?? "",
          }
        : undefined

      reset({
        flow_meter_start: form.flow_meter_start || "",
        flow_meter_start_reading: form.flow_meter_start_reading || undefined,
        flow_meter_end: form.flow_meter_end || "",
        flow_meter_end_reading: form.flow_meter_end_reading || undefined,
        source_silo_id: Array.isArray(form.source_silo_id) ? form.source_silo_id : [],
        destination_silo_id: form.destination_silo_id || "",
        movement_start: form.movement_start || "",
        movement_end: form.movement_end || "",
        volume: form.volume || undefined,
        // Map API fields to form fields
        dispatch_operator_id: (form as any).dispatch_operator_id || form.llm_operator_id || "",
        dispatch_operator_signature: (form as any).dispatch_operator_signature || form.llm_signature || "",
        receiver_operator_id: (form as any).receiver_operator_id || form.dpp_operator_id || "",
        receiver_operator_signature: (form as any).receiver_operator_signature || form.dpp_signature || "",
        product: form.product || "",
        status: (form as any).status || "Draft",
        tag: (form as any).tag || "",
        id: form.id || "",
        source_silo_details: sourceSiloDetails,
        destination_silo_details: destinationSilo,
        destination_silo_id: destinationSilo ? destinationSilo.id : "",
      })
    } else if (open && mode === "create") {
      reset({
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
      })
    }
  }, [open, form, mode, reset])

  // --- Fix: Always load silos before populating selectors ---
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  // --- Fix: On edit, map source/destination silo ids to selector values if present ---
  useEffect(() => {
    if (open && form && mode === "edit" && silos.length > 0) {
      // Map source silo ids (array or null) to selector values
      let sourceSiloIds: string[] = []
      if (Array.isArray(form.source_silo_details)) {
        sourceSiloIds = form.source_silo_details.map((s: any) => s.id)
      }

      // If no details but ids exist, populate details from silos list
      let sourceSiloDetails = []
      if (
        (!form.bmt_control_form_source_silo || form.bmt_control_form_source_silo.length === 0) &&
        sourceSiloIds.length > 0
      ) {
        sourceSiloDetails = sourceSiloIds.map(id => {
          const silo = silos.find(s => s.value === id)
          return {
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
      } else if (Array.isArray(form.bmt_control_form_source_silo)) {
        sourceSiloDetails = form.bmt_control_form_source_silo.map((silo: any) => ({
          id: silo.id,
          name: silo.name,
          flow_meter_start: silo.flow_meter_start || "",
          flow_meter_start_reading: silo.flow_meter_start_reading ?? 0,
          flow_meter_end: silo.flow_meter_end || "",
          flow_meter_end_reading: silo.flow_meter_end_reading ?? 0,
          source_silo_quantity_requested: silo.source_silo_quantity_requested ?? 0,
          product: silo.product ?? "",
        }))
      }

      // Destination silo id
      let destinationSiloId = ""
      if (form.destination_silo_id) {
        destinationSiloId = form.destination_silo_id
      } else if (form.destination_silo && form.destination_silo.id) {
        destinationSiloId = form.destination_silo.id
      }

      // Destination silo details
      let destinationSiloDetails = undefined
      if (!form.destination_silo && destinationSiloId) {
        const silo = silos.find(s => s.value === destinationSiloId)
        if (silo) {
          destinationSiloDetails = {
            id: silo.value,
            name: silo.label,
            flow_meter_start: "",
            flow_meter_start_reading: 0,
            flow_meter_end: "",
            flow_meter_end_reading: 0,
            source_silo_quantity_requested: 0,
            product: "",
          }
        }
      } else if (form.destination_silo) {
        destinationSiloDetails = {
          id: form.destination_silo.id,
          name: form.destination_silo.name,
          flow_meter_start: form.destination_silo.flow_meter_start || "",
          flow_meter_start_reading: form.destination_silo.flow_meter_start_reading ?? 0,
          flow_meter_end: form.destination_silo.flow_meter_end || "",
          flow_meter_end_reading: form.destination_silo.flow_meter_end_reading ?? 0,
          source_silo_quantity_requested: form.destination_silo.source_silo_quantity_requested ?? 0,
          product: form.destination_silo.product ?? "",
        }
      }

      reset({
        flow_meter_start: form.flow_meter_start || "",
        flow_meter_start_reading: form.flow_meter_start_reading || undefined,
        flow_meter_end: form.flow_meter_end || "",
        flow_meter_end_reading: form.flow_meter_end_reading || undefined,
        source_silo_id: sourceSiloIds,
        destination_silo_id: destinationSiloId,
        movement_start: form.movement_start || "",
        movement_end: form.movement_end || "",
        volume: form.volume || undefined,
        // Map API fields to form fields
        dispatch_operator_id: (form as any).dispatch_operator_id || form.llm_operator_id || "",
        dispatch_operator_signature: (form as any).dispatch_operator_signature || form.llm_signature || "",
        receiver_operator_id: (form as any).receiver_operator_id || form.dpp_operator_id || "",
        receiver_operator_signature: (form as any).receiver_operator_signature || form.dpp_signature || "",
        product: form.product || "",
        status: (form as any).status || "Draft",
        tag: (form as any).tag || "",
        id: form.id || "",
        source_silo_details: sourceSiloDetails,
        destination_silo_details: destinationSiloDetails,
        destination_silo_id: destinationSiloId,
      })
    }
  }, [open, form, mode, silos, reset])

  // --- Prevent posting empty strings for time fields, send null instead ---
  const toIsoDateTime = (time: string | undefined | null) => {
    if (!time || time === "") return null
    // If already backend-style with a date part (space between date and time), assume it's acceptable and return as-is
    // e.g. "2025-08-21 12:58:15.357772+00"
    if (time.includes(" ") && /\d{4}-\d{2}-\d{2}/.test(time)) {
      return time;
    }
    // If ISO (contains 'T' or ends with Z), parse and convert to backend format
    if (time.includes("T") || time.endsWith("Z")) {
      const parsed = new Date(time);
      if (isNaN(parsed.getTime())) return "";
      return formatDateToBackend(parsed);
    }
    // If "HH:mm" (or "HH:mm:ss"), build today's UTC date with those hours/minutes
    const hhmmMatch = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (hhmmMatch) {
      const hh = Number(hhmmMatch[1]);
      const mm = Number(hhmmMatch[2]);
      if (Number.isNaN(hh) || Number.isNaN(mm)) return "";
      const now = new Date();
      // construct in UTC to avoid timezone issues
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh, mm, 0, 0));
      return formatDateToBackend(d);
    }
    // Fallback: return empty string to avoid invalid Date
    return "";
  };

  // Extract "HH:mm" from backend/ISO/time inputs for display in time pickers
  const extractTime = (value: string | undefined | null) => {
    if (!value) return "";
    // backend format with space
    if (value.includes(" ") && /\d{4}-\d{2}-\d{2}/.test(value)) {
      const timePart = value.split(" ")[1] || "";
      return timePart.substring(0,5);
    }
    // ISO format with T
    if (value.includes("T")) {
      const t = value.split("T")[1] || "";
      return t.substring(0,5);
    }
    // already a time like "HH:mm" or "HH:mm:ss"
    const hhmmMatch = value.match(/^(\d{1,2}:\d{2})/);
    return hhmmMatch ? hhmmMatch[1] : "";
  };

  // --- On submit: clean up empty string times to null ---
  const onSubmit = async (data: BMTControlFormData) => {
    try {
      // Convert all time fields to backend format and omit source_silo_quantity_requested
      const convertSiloDetails = (details: any[]) =>
        details.map((silo) => {
          const { source_silo_quantity_requested, ...rest } = silo
          return {
            ...rest,
            flow_meter_start: toIsoDateTime(silo.flow_meter_start),
            flow_meter_end: toIsoDateTime(silo.flow_meter_end),
          }
        })

      const payload = {
        ...data,
        movement_start: toIsoDateTime(data.movement_start),
        movement_end: toIsoDateTime(data.movement_end),
        source_silo_details: convertSiloDetails(data.source_silo_details || []),
        destination_silo_details: data.destination_silo_details
          ? (() => {
              const { source_silo_quantity_requested, ...rest } = data.destination_silo_details
              return {
                ...rest,
                flow_meter_start: toIsoDateTime(data.destination_silo_details.flow_meter_start),
                flow_meter_end: toIsoDateTime(data.destination_silo_details.flow_meter_end),
              }
            })()
          : undefined,
      };

      if (mode === "create") {
        await dispatch(createBMTControlFormAction(payload as any)).unwrap();
        toast.success('BMT Control Form created successfully');
        setTimeout(() => {
          dispatch(fetchBMTControlForms());
        }, 100);
      } else if (form) {
        const updatePayload = {
          ...payload,
          id: form.id,
          created_at: form.created_at,
          updated_at: form.updated_at,
        };
        await dispatch(updateBMTControlFormAction({ id: form.id, formData: payload as any })).unwrap();
        toast.success('BMT Control Form updated successfully');
        setTimeout(() => {
          dispatch(fetchBMTControlForms());
        }, 100);
      }
      onOpenChange(false);
      reset();
    } catch (error: any) {
      // Ensure only a string is passed to toast.error
      let errorMessage = mode === "create" ? 'Failed to create BMT control form' : 'Failed to update BMT control form';
      if (error) {
        if (typeof error === "string") {
          errorMessage = error;
        } else if (typeof error?.message === "string") {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
    }
  }

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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="flow_meter_start"
                    control={control}
                    render={({ field }) => (
                      <ShadcnTimePicker
                        label="Flow Meter Start"
                        value={extractTime(field.value)}
                        onChange={val => field.onChange(toIsoDateTime(val))}
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
                        value={extractTime(field.value)}
                        onChange={val => field.onChange(toIsoDateTime(val))}
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
                        value={extractTime(field.value)}
                        onChange={val => field.onChange(val)}
                        placeholder="Select start time (24h)"
                        error={!!errors.movement_start}
                      />
                    )}
                  />
                  {getErrorMsg(errors.movement_start)}
                </div>
                
                <div className="space-y-2">
                  <Controller
                    name="movement_end"
                    control={control}
                    render={({ field }) => (
                      <ShadcnTimePicker
                        label="Movement End Time"
                        value={extractTime(field.value)}
                        onChange={val => field.onChange(val)}
                        placeholder="Select end time (24h)"
                        error={!!errors.movement_end}
                      />
                    )}
                  />
                  {getErrorMsg(errors.movement_end)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume (Liters) *</Label>
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
                  {getErrorMsg(errors.volume)}
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
                  {getErrorMsg(errors.product)}
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
                      // Always use selectedSourceSiloIds for value to reflect selected silos in MultiSelect
                      value={selectedSourceSiloIds}
                      onValueChange={(ids) => {
                        // Remove details for deselected silos
                        let details = Array.isArray(field.value) ? field.value.filter((s: SourceSiloDetail) => ids.includes(s.id)) : [];
                        // Add new details for newly selected silos (avoid duplicates by id)
                        ids.forEach((id: string) => {
                          if (!details.some((s: SourceSiloDetail) => s.id === id)) {
                            const silo = silos.find(s => s.value === id);
                            details.push({
                              id,
                              name: silo?.label || "",
                              flow_meter_start: "",
                              flow_meter_start_reading: 0,
                              flow_meter_end: "",
                              flow_meter_end_reading: 0,
                              source_silo_quantity_requested: 0,
                              product: "",
                            });
                          }
                        });
                        // Ensure only one detail per id (deduplicate)
                        details = details.filter(
                          (detail, idx, arr) => arr.findIndex(d => d.id === detail.id) === idx
                        );
                        field.onChange(details);
                      }}
                      placeholder="Select source silos"
                      searchPlaceholder="Search silos..."
                      emptyMessage="No silos found"
                      loading={loadingSilos}
                      className="w-full"
                    />
                    {showSourceSiloDetails && selectedSourceSiloIds.length > 0 && Array.isArray(field.value) && selectedSourceSiloIds.map((id: string) => {
                      const silo = field.value.find((s: SourceSiloDetail) => s.id === id);
                      if (!silo) return null;
                      const idx = field.value.findIndex((s: SourceSiloDetail) => s.id === id);
                      return (
                        <div key={silo.id} className="border rounded p-3 mt-2 bg-gray-50">
                          <div className="font-semibold mb-2">{silo.name}</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Flow Meter Start</Label>
                              <ShadcnTimePicker
                                label=""
                                value={extractTime(silo.flow_meter_start)}
                                onChange={val => updateSourceSiloDetail(idx, "flow_meter_start", toIsoDateTime(val))}
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
                                value={extractTime(silo.flow_meter_end)}
                                onChange={val => updateSourceSiloDetail(idx, "flow_meter_end", toIsoDateTime(val))}
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
                      );
                    })}
                  </>
                )}
              />
              {getErrorMsg(errors.source_silo_details)}
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
              {showDestinationSiloDetails && (
                <Controller
                  name="destination_silo_details"
                  control={control}
                  render={({ field }) => field.value && (
                    <div className="border rounded p-3 mt-2 bg-gray-50">
                      <div className="font-semibold mb-2">{field.value.name}</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-1">Flow Meter Start</Label>
                          <ShadcnTimePicker
                            label=""
                            value={extractTime(field.value.flow_meter_start)}
                            onChange={val => updateDestinationSiloDetail("flow_meter_start", toIsoDateTime(val))}
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
                            value={extractTime(field.value.flow_meter_end)}
                            onChange={val => updateDestinationSiloDetail("flow_meter_end", toIsoDateTime(val))}
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
              )}
              {getErrorMsg(errors.destination_silo_details)}
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
                  {getErrorMsg(errors.dispatch_operator_id)}
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
                  {getErrorMsg(errors.dispatch_operator_signature)}
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
                  {getErrorMsg(errors.receiver_operator_id)}
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
                  {getErrorMsg(errors.receiver_operator_signature)}
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
                {getErrorMsg(errors.status)}
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
