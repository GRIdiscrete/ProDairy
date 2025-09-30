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
import { DatePicker } from "@/components/ui/date-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createBMTControlFormAction, updateBMTControlFormAction, fetchBMTControlForms } from "@/lib/store/slices/bmtControlFormSlice"
import { fetchProcesses } from "@/lib/store/slices/processSlice"
import { siloApi } from "@/lib/api/silo"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"
import type { BMTControlForm } from "@/lib/api/data-capture-forms"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl, normalizeDataUrlToBase64 } from "@/lib/utils/signature"

const bmtControlFormSchema = yup.object({
  flow_meter_start: yup.string().required("Flow meter start time is required"),
  flow_meter_start_reading: yup.number().required("Flow meter start reading is required").min(0, "Reading must be positive"),
  flow_meter_end: yup.string().required("Flow meter end time is required"),
  flow_meter_end_reading: yup.number().required("Flow meter end reading is required").min(0, "Reading must be positive"),
  source_silo_id: yup.string().required("Source silo is required"),
  destination_silo_id: yup.string().required("Destination silo is required").test(
    'different-from-source',
    'Destination silo must be different from source silo',
    function(value) {
      return value !== this.parent.source_silo_id
    }
  ),
  movement_start: yup.string().required("Movement start time is required"),
  movement_end: yup.string().required("Movement end time is required"),
  volume: yup.number().required("Volume is required").min(0, "Volume must be positive"),
  llm_operator_id: yup.string().required("LLM operator is required"),
  llm_signature: yup.string().required("LLM signature is required"),
  dpp_operator_id: yup.string().required("DPP operator is required"),
  dpp_signature: yup.string().required("DPP signature is required"),
  product: yup.string().required("Product is required"),
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
  const { processes } = useAppSelector((state) => state.process)

  // State for searchable selects
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])
  const [users, setUsers] = useState<SearchableSelectOption[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [llmSigOpen, setLlmSigOpen] = useState(false)
  const [dppSigOpen, setDppSigOpen] = useState(false)

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingSilos(true)
      setLoadingUsers(true)
      
      // Load processes first
      dispatch(fetchProcesses())
      
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
      flow_meter_start_reading: 0,
      flow_meter_end: "",
      flow_meter_end_reading: 0,
      source_silo_id: "",
      destination_silo_id: "",
      movement_start: "",
      movement_end: "",
      volume: 0,
      llm_operator_id: "",
      llm_signature: "",
      dpp_operator_id: "",
      dpp_signature: "",
      product: "",
    },
  })

  const onSubmit = async (data: BMTControlFormData) => {
    try {
      const payload = {
        ...data,
        llm_signature: normalizeDataUrlToBase64(data.llm_signature),
        dpp_signature: normalizeDataUrlToBase64(data.dpp_signature),
      }

      if (mode === "create") {
        await dispatch(createBMTControlFormAction(payload)).unwrap()
        toast.success('BMT Control Form created successfully')
        // Refresh the data to get complete relationship information
        setTimeout(() => {
          dispatch(fetchBMTControlForms())
        }, 100)
      } else if (form) {
        await dispatch(updateBMTControlFormAction({
          ...payload,
          id: form.id,
          created_at: form.created_at,
          updated_at: form.updated_at,
        })).unwrap()
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
      reset({
        flow_meter_start: form.flow_meter_start || "",
        flow_meter_start_reading: form.flow_meter_start_reading || 0,
        flow_meter_end: form.flow_meter_end || "",
        flow_meter_end_reading: form.flow_meter_end_reading || 0,
        source_silo_id: form.source_silo_id || "",
        destination_silo_id: form.destination_silo_id || "",
        movement_start: form.movement_start || "",
        movement_end: form.movement_end || "",
        volume: form.volume || 0,
        llm_operator_id: form.llm_operator_id || "",
        llm_signature: form.llm_signature || "",
        dpp_operator_id: form.dpp_operator_id || "",
        dpp_signature: form.dpp_signature || "",
        product: form.product || "",
      })
    } else if (open && mode === "create") {
      reset({
        flow_meter_start: "",
        flow_meter_start_reading: 0,
        flow_meter_end: "",
        flow_meter_end_reading: 0,
        source_silo_id: "",
        destination_silo_id: "",
        movement_start: "",
        movement_end: "",
        volume: 0,
        llm_operator_id: "",
        llm_signature: "",
        dpp_operator_id: "",
        dpp_signature: "",
        product: "",
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
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto bg-white">
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
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Flow Meter Information</h3>
              {/* Flow Meter Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="flow_meter_start"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Flow Meter Start Time *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start time"
                        showTime={true}
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
                      <DatePicker
                        label="Flow Meter End Time *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select end time"
                        showTime={true}
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
                  <Label htmlFor="flow_meter_start_reading">Start Reading *</Label>
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  {errors.flow_meter_start_reading && <p className="text-sm text-red-500">{errors.flow_meter_start_reading.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="flow_meter_end_reading">End Reading *</Label>
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  {errors.flow_meter_end_reading && <p className="text-sm text-red-500">{errors.flow_meter_end_reading.message}</p>}
                </div>
              </div>
            </div>

            {/* Movement Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Movement Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source_silo_id">Source Silo *</Label>
                  <Controller
                    name="source_silo_id"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={silos}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select source silo"
                        searchPlaceholder="Search silos..."
                        emptyMessage="No silos found"
                        loading={loadingSilos}
                        onSearch={handleSiloSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
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
                      <DatePicker
                        label="Movement Start Time *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start time"
                        showTime={true}
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
                      <DatePicker
                        label="Movement End Time *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select end time"
                        showTime={true}
                        error={!!errors.movement_end}
                      />
                    )}
                  />
                  {errors.movement_end && <p className="text-sm text-red-500">{errors.movement_end.message}</p>}
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                          {processes?.map((process) => (
                            <SelectItem key={process.id} value={process.id}>
                              <div className="flex flex-col">
                                <span className="font-light">{process.name}</span>
                                <span className="text-xs text-gray-500">
                                  {process.raw_material_ids.length} materials
                                </span>
                              </div>
                            </SelectItem>
                          ))}
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
                  <Label htmlFor="llm_operator_id">LLM Operator *</Label>
                  <Controller
                    name="llm_operator_id"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={users}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select LLM operator"
                        searchPlaceholder="Search users..."
                        emptyMessage="No users found"
                        loading={loadingUsers}
                        onSearch={handleUserSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
                  />
                  {errors.llm_operator_id && <p className="text-sm text-red-500">{errors.llm_operator_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="llm_signature">LLM Signature *</Label>
                  <Controller
                    name="llm_signature"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        {field.value ? (
                          <img src={base64ToPngDataUrl(field.value)} alt="LLM signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                        ) : (
                          <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                            No signature captured
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <LoadingButton type="button" variant="outline" onClick={() => setLlmSigOpen(true)}>Add Signature</LoadingButton>
                          {field.value && (
                            <>
                              <LoadingButton type="button" variant="outline" onClick={() => setLlmSigOpen(true)}>View Signature</LoadingButton>
                              <LoadingButton type="button" variant="ghost" onClick={() => field.onChange("")}>Clear</LoadingButton>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  />
                  {errors.llm_signature && <p className="text-sm text-red-500">{errors.llm_signature.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dpp_operator_id">DPP Operator *</Label>
                  <Controller
                    name="dpp_operator_id"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={users}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select DPP operator"
                        searchPlaceholder="Search users..."
                        emptyMessage="No users found"
                        loading={loadingUsers}
                        onSearch={handleUserSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
                  />
                  {errors.dpp_operator_id && <p className="text-sm text-red-500">{errors.dpp_operator_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dpp_signature">DPP Signature *</Label>
                  <Controller
                    name="dpp_signature"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        {field.value ? (
                          <img src={base64ToPngDataUrl(field.value)} alt="DPP signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                        ) : (
                          <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                            No signature captured
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <LoadingButton type="button" variant="outline" onClick={() => setDppSigOpen(true)}>Add Signature</LoadingButton>
                          {field.value && (
                            <>
                              <LoadingButton type="button" variant="outline" onClick={() => setDppSigOpen(true)}>View Signature</LoadingButton>
                              <LoadingButton type="button" variant="ghost" onClick={() => field.onChange("")}>Clear</LoadingButton>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  />
                  {errors.dpp_signature && <p className="text-sm text-red-500">{errors.dpp_signature.message}</p>}
                </div>
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
      open={llmSigOpen}
      onOpenChange={setLlmSigOpen}
      title="Capture LLM Signature"
      onSave={(dataUrl) => {
        setValue("llm_signature", dataUrl, { shouldValidate: true, shouldDirty: true })
      }}
    />
    <SignatureViewer
      open={false}
      onOpenChange={() => {}}
      title="LLM Signature"
      value={undefined}
    />
    <SignatureModal
      open={dppSigOpen}
      onOpenChange={setDppSigOpen}
      title="Capture DPP Signature"
      onSave={(dataUrl) => {
        setValue("dpp_signature", dataUrl, { shouldValidate: true, shouldDirty: true })
      }}
    />
    <SignatureViewer
      open={false}
      onOpenChange={() => {}}
      title="DPP Signature"
      value={undefined}
    />
    </>
  )
}
