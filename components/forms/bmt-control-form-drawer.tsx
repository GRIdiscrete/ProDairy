"use client"

import { useState, useEffect } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createBMTControlFormAction, updateBMTControlFormAction, fetchBMTControlForms } from "@/lib/store/slices/bmtControlFormSlice"
import { siloApi } from "@/lib/api/silo"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"
import type { BMTControlForm } from "@/lib/api/bmt-control-form"
import { SignatureModal } from "@/components/ui/signature-modal"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { formatDateToBackend } from "@/lib/utils/date"
import { Plus, Trash2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Updated schema to match new API structure
const sourceSiloDetailSchema = yup.object({
  name: yup.string().required("Source silo name is required"),
  flow_meter_start: yup.string().optional(),
  flow_meter_start_reading: yup.number().optional().nullable().transform((value, originalValue) => originalValue === '' ? undefined : value),
  flow_meter_end: yup.string().optional(),
  flow_meter_end_reading: yup.number().optional().nullable().transform((value, originalValue) => originalValue === '' ? undefined : value),
  source_silo_quantity_requested: yup.number().optional().nullable().transform((value, originalValue) => originalValue === '' ? undefined : value),
  product: yup.string().required("Product is required"),
})

const destinationSiloDetailSchema = yup.object({
  name: yup.string().required("Destination silo name is required"),
  flow_meter_start: yup.string().optional(),
  flow_meter_start_reading: yup.number().optional().nullable().transform((value, originalValue) => originalValue === '' ? undefined : value),
  flow_meter_end: yup.string().optional(),
  flow_meter_end_reading: yup.number().optional().nullable().transform((value, originalValue) => originalValue === '' ? undefined : value),
  quantity_received: yup.number().optional().nullable().transform((value, originalValue) => originalValue === '' ? undefined : value),
  product: yup.string().required("Product is required"),
})

const sourceDestinationPairSchema = yup.object({
  source_silo_details: sourceSiloDetailSchema.required("Source silo details are required"),
  destination_silo_details: destinationSiloDetailSchema.required("Destination silo details are required"),
})

const bmtControlFormSchema = yup.object({
  source_destination_details: yup.array().of(sourceDestinationPairSchema).min(1, "At least one source-destination pair is required").required("Source-destination details are required"),
  movement_start: yup.string().required("Movement start is required"),
  movement_end: yup.string().required("Movement end is required"),
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
type DestinationSiloDetail = yup.InferType<typeof destinationSiloDetailSchema>
type SourceDestinationPair = yup.InferType<typeof sourceDestinationPairSchema>
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BMTControlFormData>({
    resolver: yupResolver(bmtControlFormSchema) as any,
    defaultValues: {
      source_destination_details: [],
      movement_start: "",
      movement_end: "",
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

  // Use field array for dynamic source-destination pairs
  const { fields, append, remove } = useFieldArray({
    control,
    name: "source_destination_details",
  })

  // Validation message helpers
  const getErrorMsg = (field: any) => (field ? <p className="text-sm text-red-500">{field.message}</p> : null)

  // Extract "HH:mm" from backend/ISO/time inputs for display in time pickers
  const extractTime = (value: string | undefined | null) => {
    if (!value) return "";
    // backend format with space
    if (value.includes(" ") && /\d{4}-\d{2}-\d{2}/.test(value)) {
      const timePart = value.split(" ")[1] || "";
      return timePart.substring(0, 5);
    }
    // ISO format with T
    if (value.includes("T")) {
      const t = value.split("T")[1] || "";
      return t.substring(0, 5);
    }
    // already a time like "HH:mm" or "HH:mm:ss"
    const hhmmMatch = value.match(/^(\d{1,2}:\d{2})/);
    return hhmmMatch ? hhmmMatch[1] : "";
  };

  // Convert time to ISO datetime
  const toIsoDateTime = (time: string | undefined | null) => {
    if (!time || time === "") return null
    // If already backend-style with a date part (space between date and time), assume it's acceptable and return as-is
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
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh, mm, 0, 0));
      return formatDateToBackend(d);
    }
    return "";
  };

  // Load data when drawer opens
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  // Populate form when editing
  useEffect(() => {
    if (open && form && mode === "edit" && silos.length > 0) {
      // Build source-destination pairs from API response
      const sourceSilos = Array.isArray((form as any).bmt_control_form_source_silo)
        ? (form as any).bmt_control_form_source_silo
        : []
      const destSilos = Array.isArray((form as any).bmt_control_form_destination_silo)
        ? (form as any).bmt_control_form_destination_silo
        : []

      // Create pairs (assuming 1:1 mapping or use first dest for all sources)
      const pairs: SourceDestinationPair[] = sourceSilos.map((source: any, idx: number) => {
        const dest = destSilos[idx] || destSilos[0] || {}
        return {
          source_silo_details: {
            name: source.name || "",
            flow_meter_start: source.flow_meter_start || "",
            flow_meter_start_reading: source.flow_meter_start_reading ?? 0,
            flow_meter_end: source.flow_meter_end || "",
            flow_meter_end_reading: source.flow_meter_end_reading ?? 0,
            source_silo_quantity_requested: source.source_silo_quantity_requested ?? 0,
            product: source.product || "",
          },
          destination_silo_details: {
            name: dest.name || "",
            flow_meter_start: dest.flow_meter_start || "",
            flow_meter_start_reading: dest.flow_meter_start_reading ?? 0,
            flow_meter_end: dest.flow_meter_end || "",
            flow_meter_end_reading: dest.flow_meter_end_reading ?? 0,
            quantity_received: dest.quantity_received ?? 0,
            product: dest.product || "",
          }
        }
      })

      reset({
        source_destination_details: pairs.length > 0 ? pairs : [],
        movement_start: form.movement_start || "",
        movement_end: form.movement_end || "",
        dispatch_operator_id: (form as any).dispatch_operator_id || form.llm_operator_id || "",
        dispatch_operator_signature: (form as any).dispatch_operator_signature || form.llm_signature || "",
        receiver_operator_id: (form as any).receiver_operator_id || form.dpp_operator_id || "",
        receiver_operator_signature: (form as any).receiver_operator_signature || form.dpp_signature || "",
        product: form.product || "",
        status: (form as any).status || "Draft",
        tag: (form as any).tag || "",
        id: form.id || "",
      } as any)
    } else if (open && mode === "create") {
      reset({
        source_destination_details: [],
        movement_start: "",
        movement_end: "",
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
  }, [open, form, mode, silos, reset])

  // Add new pair
  const addPair = () => {
    append({
      source_silo_details: {
        name: "",
        flow_meter_start: "",
        flow_meter_start_reading: "" as any,
        flow_meter_end: "",
        flow_meter_end_reading: "" as any,
        source_silo_quantity_requested: "" as any,
        product: "",
      },
      destination_silo_details: {
        name: "",
        flow_meter_start: "",
        flow_meter_start_reading: "" as any,
        flow_meter_end: "",
        flow_meter_end_reading: "" as any,
        quantity_received: "" as any,
        product: "",
      }
    })
  }

  // Submit handler
  const onSubmit = async (data: BMTControlFormData) => {
    try {
      const payload = {
        movement_start: toIsoDateTime(data.movement_start),
        movement_end: toIsoDateTime(data.movement_end),
        source_destination_details: data.source_destination_details.map(pair => ({
          source_silo_details: {
            name: pair.source_silo_details.name,
            flow_meter_start: toIsoDateTime(pair.source_silo_details.flow_meter_start),
            flow_meter_start_reading: Number(pair.source_silo_details.flow_meter_start_reading),
            flow_meter_end: toIsoDateTime(pair.source_silo_details.flow_meter_end),
            flow_meter_end_reading: Number(pair.source_silo_details.flow_meter_end_reading),
            source_silo_quantity_requested: Number(pair.source_silo_details.source_silo_quantity_requested),
            product: pair.source_silo_details.product,
          },
          destination_silo_details: {
            name: pair.destination_silo_details.name,
            flow_meter_start: toIsoDateTime(pair.destination_silo_details.flow_meter_start),
            flow_meter_start_reading: Number(pair.destination_silo_details.flow_meter_start_reading),
            flow_meter_end: toIsoDateTime(pair.destination_silo_details.flow_meter_end),
            flow_meter_end_reading: Number(pair.destination_silo_details.flow_meter_end_reading),
            quantity_received: Number(pair.destination_silo_details.quantity_received),
            product: pair.destination_silo_details.product,
          }
        })),
        dispatch_operator_id: data.dispatch_operator_id,
        dispatch_operator_signature: data.dispatch_operator_signature,
        receiver_operator_id: data.receiver_operator_id,
        receiver_operator_signature: data.receiver_operator_signature,
        product: data.product,
        status: data.status,
        tag: data.tag,
      };

      if (mode === "create") {
        await dispatch(createBMTControlFormAction(payload as any)).unwrap();
        toast.success('BMT Control Form created successfully');
        dispatch(fetchBMTControlForms()).catch(() => { });
        onOpenChange(false);
        reset();
      } else if (form) {
        const updatePayload = {
          ...payload,
          id: form.id
        };

        await dispatch(updateBMTControlFormAction({ id: form.id, formData: updatePayload as any })).unwrap();
        toast.success('BMT Control Form updated successfully');
        dispatch(fetchBMTControlForms()).catch(() => { });
        onOpenChange(false);
        reset();
      }
    } catch (error: any) {
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

  const onInvalid = (errors: any) => {
    const errorMessages = Object.values(errors).map((err: any) => err.message).filter(Boolean)
    toast.error(`Please check the following fields: ${errorMessages.join(', ')}`, {
      style: { background: '#ef4444', color: 'white' }
    })
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

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 mt-6">
              {/* BMT Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">BMT Information</h3>
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
                          <SelectItem value="Raw milk">Raw milk</SelectItem>
                          <SelectItem value="Skim Milk">Skim Milk</SelectItem>
                          <SelectItem value="Standardized Milk">Standardized Milk</SelectItem>
                          <SelectItem value="Pasteurized Milk">Pasteurized Milk</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {getErrorMsg(errors.product)}
                </div>
              </div>

              {/* Source-Destination Pairs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex-1">Source-Destination Pairs</h3>
                  <Button type="button" onClick={addPair} size="sm" className="ml-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pair
                  </Button>
                </div>
                {getErrorMsg(errors.source_destination_details)}

                {fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">Pair {index + 1}</h4>
                      <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Source Silo */}
                      <div className="space-y-3 border-r border-gray-200 pr-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-600">S</span>
                          </div>
                          <h5 className="font-semibold text-sm">Source Silo</h5>
                        </div>

                        <div className="space-y-2">
                          <Label>Silo Name *</Label>
                          <Controller
                            name={`source_destination_details.${index}.source_silo_details.name`}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full rounded-full border-gray-200">
                                  <SelectValue placeholder="Select source silo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {silos.map(silo => (
                                    <SelectItem key={silo.value} value={silo.label}>
                                      {silo.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Flow Start</Label>
                            <Controller
                              name={`source_destination_details.${index}.source_silo_details.flow_meter_start`}
                              control={control}
                              render={({ field }) => (
                                <ShadcnTimePicker
                                  label=""
                                  value={extractTime(field.value)}
                                  onChange={val => field.onChange(val)}
                                  placeholder="HH:mm"
                                  error={false}
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Reading</Label>
                            <Controller
                              name={`source_destination_details.${index}.source_silo_details.flow_meter_start_reading`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  value={field.value === 0 ? '' : (field.value ?? '')}
                                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="Enter reading"
                                  className="rounded-full border-gray-200"
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Flow End</Label>
                            <Controller
                              name={`source_destination_details.${index}.source_silo_details.flow_meter_end`}
                              control={control}
                              render={({ field }) => (
                                <ShadcnTimePicker
                                  label=""
                                  value={extractTime(field.value)}
                                  onChange={val => field.onChange(val)}
                                  placeholder="HH:mm"
                                  error={false}
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Reading</Label>
                            <Controller
                              name={`source_destination_details.${index}.source_silo_details.flow_meter_end_reading`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  value={field.value === 0 ? '' : (field.value ?? '')}
                                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="Enter reading"
                                  className="rounded-full border-gray-200"
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Quantity Requested</Label>
                          <Controller
                            name={`source_destination_details.${index}.source_silo_details.source_silo_quantity_requested`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                value={field.value === 0 ? '' : (field.value ?? '')}
                                onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="Enter quantity"
                                className="rounded-full border-gray-200"
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Product</Label>
                          <Controller
                            name={`source_destination_details.${index}.source_silo_details.product`}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full rounded-full border-gray-200">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Raw milk">Raw milk</SelectItem>
                                  <SelectItem value="Skim Milk">Skim Milk</SelectItem>
                                  <SelectItem value="Standardized Milk">Standardized Milk</SelectItem>
                                  <SelectItem value="Pasteurized Milk">Pasteurized Milk</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>

                      {/* Destination Silo */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-green-600">D</span>
                          </div>
                          <h5 className="font-semibold text-sm">Destination Silo</h5>
                        </div>

                        <div className="space-y-2">
                          <Label>Silo Name *</Label>
                          <Controller
                            name={`source_destination_details.${index}.destination_silo_details.name`}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full rounded-full border-gray-200">
                                  <SelectValue placeholder="Select destination silo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {silos.map(silo => (
                                    <SelectItem key={silo.value} value={silo.label}>
                                      {silo.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Flow Start</Label>
                            <Controller
                              name={`source_destination_details.${index}.destination_silo_details.flow_meter_start`}
                              control={control}
                              render={({ field }) => (
                                <ShadcnTimePicker
                                  label=""
                                  value={extractTime(field.value)}
                                  onChange={val => field.onChange(val)}
                                  placeholder="HH:mm"
                                  error={false}
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Reading</Label>
                            <Controller
                              name={`source_destination_details.${index}.destination_silo_details.flow_meter_start_reading`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  value={field.value === 0 ? '' : (field.value ?? '')}
                                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="Enter reading"
                                  className="rounded-full border-gray-200"
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Flow End</Label>
                            <Controller
                              name={`source_destination_details.${index}.destination_silo_details.flow_meter_end`}
                              control={control}
                              render={({ field }) => (
                                <ShadcnTimePicker
                                  label=""
                                  value={extractTime(field.value)}
                                  onChange={val => field.onChange(val)}
                                  placeholder="HH:mm"
                                  error={false}
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Reading</Label>
                            <Controller
                              name={`source_destination_details.${index}.destination_silo_details.flow_meter_end_reading`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  value={field.value === 0 ? '' : (field.value ?? '')}
                                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="Enter reading"
                                  className="rounded-full border-gray-200"
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Quantity Received</Label>
                          <Controller
                            name={`source_destination_details.${index}.destination_silo_details.quantity_received`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                value={field.value === 0 ? '' : (field.value ?? '')}
                                onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="Enter quantity"
                                className="rounded-full border-gray-200"
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Product</Label>
                          <Controller
                            name={`source_destination_details.${index}.destination_silo_details.product`}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full rounded-full border-gray-200">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Raw milk">Raw milk</SelectItem>
                                  <SelectItem value="Skim Milk">Skim Milk</SelectItem>
                                  <SelectItem value="Standardized Milk">Standardized Milk</SelectItem>
                                  <SelectItem value="Pasteurized Milk">Pasteurized Milk</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Operators */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dispatch & Receiver Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dispatch_operator_id">Dispatch Operator *</Label>
                    <Controller
                      name="dispatch_operator_id"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full rounded-full border-gray-200">
                            <SelectValue placeholder="Select dispatch operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.value} value={user.value}>
                                {user.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {getErrorMsg(errors.dispatch_operator_id)}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiver_operator_id">Receiver Operator *</Label>
                    <Controller
                      name="receiver_operator_id"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full rounded-full border-gray-200">
                            <SelectValue placeholder="Select receiver operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.value} value={user.value}>
                                {user.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {getErrorMsg(errors.receiver_operator_id)}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Status</h3>
                <div>
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

              {/* Signatures */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Signatures</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dispatch Operator Signature *</Label>
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
                            <LoadingButton type="button" onClick={() => setDispatchSigOpen(true)}>Add Signature</LoadingButton>
                            {field.value && (
                              <>
                                <LoadingButton type="button" onClick={() => setDispatchSigOpen(true)}>View Signature</LoadingButton>
                                <LoadingButton type="button" variant="ghost" onClick={() => field.onChange("")}>Clear</LoadingButton>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    />
                    {getErrorMsg(errors.dispatch_operator_signature)}
                  </div>

                  <div className="space-y-2">
                    <Label>Receiver Operator Signature *</Label>
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
                            <LoadingButton type="button" onClick={() => setReceiverSigOpen(true)}>Add Signature</LoadingButton>
                            {field.value && (
                              <>
                                <LoadingButton type="button" onClick={() => setReceiverSigOpen(true)}>View Signature</LoadingButton>
                                <LoadingButton type="button" variant="ghost" onClick={() => field.onChange("")}>Clear</LoadingButton>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    />
                    {getErrorMsg(errors.receiver_operator_signature)}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <LoadingButton
                  loading={mode === "create" ? operationLoading.create : operationLoading.update}
                  disabled={mode === "create" ? operationLoading.create : operationLoading.update}
                  className="w-full rounded-full"
                  type="submit"
                >
                  {mode === "create" ? "Create BMT Control Form" : "Update BMT Control Form"}
                </LoadingButton>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Signature Modals */}
      <SignatureModal
        open={dispatchSigOpen}
        onOpenChange={setDispatchSigOpen}
        title="Capture Dispatch Operator Signature"
        onSave={(dataUrl) => {
          setValue("dispatch_operator_signature", dataUrl)
          setDispatchSigOpen(false)
        }}
      />
      <SignatureModal
        open={receiverSigOpen}
        onOpenChange={setReceiverSigOpen}
        title="Capture Receiver Operator Signature"
        onSave={(dataUrl) => {
          setValue("receiver_operator_signature", dataUrl)
          setReceiverSigOpen(false)
        }}
      />
    </>
  )
}
