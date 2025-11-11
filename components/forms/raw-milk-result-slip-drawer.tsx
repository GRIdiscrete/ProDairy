"use client"

import { useEffect, useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { RootState, useAppDispatch, useAppSelector } from "@/lib/store"
import { createRawMilkResultSlip, updateRawMilkResultSlip } from "@/lib/store/slices/rawMilkResultSlipSlice"
import { usersApi } from "@/lib/api/users"
import { silosApi } from "@/lib/api/silos"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl, normalizeDataUrlToBase64 } from "@/lib/utils/signature"
import { CircleColorSelector } from "@/components/ui/circle-color-selector"
import { DriverForm } from "@/lib/types"

const RESAZURIN_OPTIONS = [
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "light_blue", label: "Light Blue", color: "bg-blue-300" },
  { value: "purple", label: "Purple", color: "bg-purple-500" },
  { value: "pink", label: "Pink", color: "bg-pink-400" },
  { value: "white", label: "White", color: "bg-white border border-gray-200" },
]

const compartmentTestSchema = yup.object({
  temperature: yup.number().nullable(),
  time: yup.string().nullable(),
  ot: yup.string().nullable(),
  cob: yup.boolean().nullable(),
  alcohol: yup.number().nullable(),
  titrable_acidity: yup.number().nullable(),
  ph: yup.number().nullable(),
  resazurin: yup.string().nullable(),
  fat: yup.number().nullable(),
  protein: yup.number().nullable(),
  lr_snf: yup.string().nullable(),
  total_solids: yup.number().nullable(),
  fpd: yup.number().nullable(),
  scc: yup.number().nullable(),
  density: yup.number().nullable(),
  antibiotics: yup.boolean().nullable(),
  starch: yup.boolean().nullable(),
  silo: yup.string().nullable(),
  remark: yup.string().nullable(),
})

const detailSchema = yup.object({
  temperature: yup.number().nullable(),
  time: yup.string().nullable(),
  ot: yup.string().nullable(),
  cob: yup.boolean().nullable(),
  alcohol: yup.number().nullable(),
  titrable_acidity: yup.number().nullable(),
  ph: yup.number().nullable(),
  resazurin: yup.string().nullable(),
  fat: yup.number().nullable(),
  protein: yup.number().nullable(),
  lr_snf: yup.string().nullable(),
  total_solids: yup.number().nullable(),
  fpd: yup.number().nullable(),
  scc: yup.number().nullable(),
  density: yup.number().nullable(),
  antibiotics: yup.boolean().nullable(),
  silo: yup.string().nullable(),
  remark: yup.string().nullable(),
  starch: yup.boolean().nullable(),
  compartment_test: yup.array().of(compartmentTestSchema).nullable(),
})

const schema = yup.object({
  date: yup.string().required("Date is required"),
  time_in: yup.string().required("Time in is required"),
  time_out: yup.string().required("Time out is required"),
  approved_by: yup.string().required("Approver is required"),
  approver_signature: yup.string().required("Approver signature is required"),
  source: yup.string().required("Source is required"),
  analyst: yup.string().nullable(),
  results_collected_by: yup.string().nullable(),
  details: yup.array().of(detailSchema).length(1, "Exactly one detail is required").required("Details are required"),
})

export type RawMilkResultSlipFormData = yup.InferType<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  rawMilkIntakeFormId: string
  mode: "create" | "edit"
  existingId?: string
  existingData?: any
  driverFormId: string
  onSuccess?: () => void
}

export function RawMilkResultSlipDrawer({
  open,
  onOpenChange,
  rawMilkIntakeFormId,
  mode,
  existingId,
  existingData,
  driverFormId,
  onSuccess
}: Props) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((s) => (s as any).rawMilkResultSlips)
  const [users, setUsers] = useState<SearchableSelectOption[]>([])
  const [roles, setRoles] = useState<SearchableSelectOption[]>([])
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [loadingSilos, setLoadingSilos] = useState(false)
  const [signatureOpen, setSignatureOpen] = useState(false)
  const { driverForms } = useAppSelector((state: RootState) => state.driverForm)

  const form = useForm<RawMilkResultSlipFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      time_in: "",
      time_out: "",
      approved_by: "",
      approver_signature: "",
      source: "",
      analyst: "",
      results_collected_by: "",
      details: [{
        temperature: undefined,
        time: "",
        ot: "",
        cob: false,
        alcohol: undefined,
        titrable_acidity: undefined,
        ph: undefined,
        resazurin: "",
        fat: undefined,
        protein: undefined,
        lr_snf: "",
        total_solids: undefined,
        fpd: undefined,
        scc: undefined,
        density: undefined,
        antibiotics: false,
        silo: "",
        remark: ""
      }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details"
  })

  const getDriverFormById = (driverFormId: string): DriverForm | undefined => {
    return driverForms.find((form: any) => form.id === driverFormId)
  }

  const getCompartmentCount = (): number => {
    const driverForm = getDriverFormById(driverFormId)
    return driverForm?.tanker?.compartments || 1
  }

  const createEmptyCompartmentTest = () => ({
    temperature: undefined,
    time: "",
    ot: "",
    cob: false,
    alcohol: undefined,
    titrable_acidity: undefined,
    ph: undefined,
    resazurin: "",
    fat: undefined,
    protein: undefined,
    lr_snf: "",
    total_solids: undefined,
    fpd: undefined,
    scc: undefined,
    density: undefined,
    antibiotics: false,
    starch: false,
    silo: "",
    remark: ""
  })

  const createEmptyDetail = () => {
    const compartmentCount = getCompartmentCount()
    return {
      temperature: undefined,
      time: "",
      ot: "",
      cob: false,
      alcohol: undefined,
      titrable_acidity: undefined,
      ph: undefined,
      resazurin: "",
      fat: undefined,
      protein: undefined,
      lr_snf: "",
      total_solids: undefined,
      fpd: undefined,
      scc: undefined,
      density: undefined,
      antibiotics: false,
      silo: "",
      remark: "",
      starch: false,
      compartment_test: Array.from({ length: compartmentCount }, () => createEmptyCompartmentTest())
    }
  }

  useEffect(() => {
    if (open) {
      // Load existing data if in edit mode
      if (mode === "edit" && existingData) {
        form.reset({
          date: existingData.date || new Date().toISOString().split("T")[0],
          time_in: existingData.time_in ? existingData.time_in.split('+')[0].substring(0, 5) : "",
          time_out: existingData.time_out ? existingData.time_out.split('+')[0].substring(0, 5) : "",
          approved_by: existingData.approved_by || "",
          approver_signature: existingData.approver_signature || "",
          source: existingData.source || "",
          analyst: existingData.analyst || "",
          results_collected_by: existingData.results_collected_by || "",
          details: existingData.raw_milk_result_slip_details?.slice(0, 1).map((detail: any) => ({
            ...detail,
            temperature: detail.temperature ?? undefined,
            time: detail.time ? detail.time.split('+')[0].substring(0, 5) : "",
            ot: detail.ot ?? "",
            cob: detail.cob ?? false,
            alcohol: detail.alcohol ?? undefined,
            titrable_acidity: detail.titrable_acidity ?? undefined,
            ph: detail.ph ?? undefined,
            resazurin: detail.resazurin ?? "",
            fat: detail.fat ?? undefined,
            protein: detail.protein ?? undefined,
            lr_snf: detail.lr_snf ?? "",
            total_solids: detail.total_solids ?? undefined,
            fpd: detail.fpd ?? undefined,
            scc: detail.scc ?? undefined,
            density: detail.density ?? undefined,
            antibiotics: detail.antibiotics ?? false,
            silo: detail.silo ?? "",
            remark: detail.remark ?? "",
            starch: detail.starch ?? false,
            compartment_test: detail.compartment_test?.map((ct: any) => ({
              temperature: ct.temperature ?? undefined,
              time: ct.time ? ct.time.split('+')[0].substring(0, 5) : "",
              ot: ct.ot ?? "",
              cob: ct.cob ?? false,
              alcohol: ct.alcohol ?? undefined,
              titrable_acidity: ct.titrable_acidity ?? undefined,
              ph: ct.ph ?? undefined,
              resazurin: ct.resazurin ?? "",
              fat: ct.fat ?? undefined,
              protein: ct.protein ?? undefined,
              lr_snf: ct.lr_snf ?? "",
              total_solids: ct.total_solids ?? undefined,
              fpd: ct.fpd ?? undefined,
              scc: ct.scc ?? undefined,
              density: ct.density ?? undefined,
              antibiotics: ct.antibiotics ?? false,
              starch: ct.starch ?? false,
              silo: ct.silo ?? "",
              remark: ct.remark ?? ""
            })) || []
          })) || [createEmptyDetail()],
        })
      } else {
        // Initialize with exactly 1 detail with compartment tests
        form.reset({
          date: new Date().toISOString().split("T")[0],
          time_in: "",
          time_out: "",
          approved_by: "",
          approver_signature: "",
          source: "",
          analyst: "",
          results_collected_by: "",
          details: [createEmptyDetail()],
        })
      }

      // Load users, roles and silos
      (async () => {
        try {
          setLoadingUsers(true)
          const res = await usersApi.getUsers()
          const opts = (res.data || []).map((u: any) => ({
            value: u.id,
            label: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
            description: `${u.email} • ${u.department || '-'}`,
          }))
          setUsers(opts)
        } catch (e) {
          toast.error("Failed to load users")
        } finally { setLoadingUsers(false) }
      })()

        ; (async () => {
          try {
            setLoadingRoles(true)
            const res = await rolesApi.getRoles()
            const opts = (res.data || []).map((r: any) => ({
              value: r.id,
              label: r.role_name,
              description: r.description || 'Role description',
            }))
            setRoles(opts)
          } catch (e) {
            toast.error("Failed to load roles")
          } finally { setLoadingRoles(false) }
        })()

        ; (async () => {
          try {
            setLoadingSilos(true)
            const res = await silosApi.getSilos()
            const opts = (res.data || []).map((s: any) => ({
              value: s.id,
              label: s.name,
              description: `${s.location} • Capacity: ${s.capacity}L`,
            }))
            setSilos(opts)
          } catch (e) {
            toast.error("Failed to load silos")
          } finally { setLoadingSilos(false) }
        })()
    }
  }, [open, mode, existingData, form, driverFormId])

  const onSubmit = async (data: RawMilkResultSlipFormData) => {
    try {
      // Helper function to format time to HH:MM:SS.microseconds+TZ
      const formatTime = (timeString: string | null | undefined): string => {
        if (!timeString) return "00:00:00.000000+00"
        // timeString is in HH:MM format from ShadcnTimePicker
        const [hours, minutes] = timeString.split(':')
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00.000000+00`
      }

      // Format the payload to match backend expectations
      const payload = {
        date: data.date,
        time_in: formatTime(data.time_in),
        time_out: formatTime(data.time_out),
        approved_by: data.approved_by,
        approver_signature: normalizeDataUrlToBase64(data.approver_signature),
        source: data.source,
        analyst: data.analyst,
        results_collected_by: data.results_collected_by,
        raw_milk_intake_id: rawMilkIntakeFormId,
        details: data.details.map(detail => ({
          temperature: detail.temperature ? Number(detail.temperature) : null,
          time: formatTime(detail.time),
          ot: detail.ot,
          cob: Boolean(detail.cob),
          alcohol: detail.alcohol ? Number(detail.alcohol) : null,
          titrable_acidity: detail.titrable_acidity ? Number(detail.titrable_acidity) : null,
          ph: detail.ph ? Number(detail.ph) : null,
          resazurin: detail.resazurin,
          fat: detail.fat ? Number(detail.fat) : null,
          protein: detail.protein ? Number(detail.protein) : null,
          lr_snf: detail.lr_snf,
          total_solids: detail.total_solids ? Number(detail.total_solids) : null,
          fpd: detail.fpd ? Number(detail.fpd) : null,
          scc: detail.scc ? Number(detail.scc) : null,
          density: detail.density ? Number(detail.density) : null,
          antibiotics: Boolean(detail.antibiotics),
          starch: Boolean(detail.starch),
          silo: detail.silo == "" || detail.silo == null ? data.source : detail.silo,
          remark: detail.remark,
          compartment_test: detail.compartment_test?.map(ct => ({
            temperature: ct.temperature ? Number(ct.temperature) : null,
            time: formatTime(ct.time),
            ot: ct.ot,
            cob: Boolean(ct.cob),
            alcohol: ct.alcohol ? Number(ct.alcohol) : null,
            titrable_acidity: ct.titrable_acidity ? Number(ct.titrable_acidity) : null,
            ph: ct.ph ? Number(ct.ph) : null,
            resazurin: ct.resazurin,
            fat: ct.fat ? Number(ct.fat) : null,
            protein: ct.protein ? Number(ct.protein) : null,
            lr_snf: ct.lr_snf,
            total_solids: ct.total_solids ? Number(ct.total_solids) : null,
            fpd: ct.fpd ? Number(ct.fpd) : null,
            scc: ct.scc ? Number(ct.scc) : null,
            density: ct.density ? Number(ct.density) : null,
            antibiotics: Boolean(ct.antibiotics),
            starch: Boolean(ct.starch),
            silo: ct.silo == "" || ct.silo == null ? data.source : ct.silo,
            remark: ct.remark
          })) || []
        }))
      }

      console.log("Submitting payload:", JSON.stringify(payload, null, 2))

      if (mode === "edit" && existingId) {
        const result = await dispatch(updateRawMilkResultSlip({
          id: existingId,
          ...payload
        })).unwrap()
        toast.success("Result slip updated")
        onSuccess?.()
      } else {
        const result = await dispatch(createRawMilkResultSlip(payload)).unwrap()
        toast.success("Result slip created")
        onSuccess?.()
      }
      onOpenChange(false)
    } catch (e: any) {
      console.error("Form submission error:", e)
      toast.error(e?.message || e || "Failed to save result slip")
    }
  }

  const addDetail = () => {
    // Only allow maximum 2 details
    if (fields.length < 2) {
      append(createEmptyDetail())
    } else {
      toast.error("Maximum 2 details allowed")
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="tablet-sheet-full p-0 bg-white overflow-y-auto">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="text-lg font-light">{mode === "edit" ? "Update Lab Test" : "Create Lab Test"}</SheetTitle>
            <SheetDescription className="text-sm font-light">
              Capture or update raw milk result slip for this intake form
              {driverFormId && ` (${getCompartmentCount()} compartments detected)`}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date <span className="text-red-500">*</span></Label>
                <Controller name="date" control={form.control} render={({ field, fieldState }) => (
                  <>
                    <DatePicker label=" " value={field.value} onChange={field.onChange} />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </>
                )} />
              </div>
              <div className="space-y-2">
                <Label>Time In <span className="text-red-500">*</span></Label>
                <Controller name="time_in" control={form.control} render={({ field, fieldState }) => (
                  <>
                    <ShadcnTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time in"
                    />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </>
                )} />
              </div>
              <div className="space-y-2">
                <Label>Time Out <span className="text-red-500">*</span></Label>
                <Controller name="time_out" control={form.control} render={({ field, fieldState }) => (
                  <>
                    <ShadcnTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time out"
                    />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </>
                )} />
              </div>
            </div>

            {/* Personnel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Approved By (Role) <span className="text-red-500">*</span></Label>
                <Controller name="approved_by" control={form.control} render={({ field, fieldState }) => (
                  <>
                    <SearchableSelect options={roles} value={field.value} onValueChange={field.onChange} placeholder="Select approver role" loading={loadingRoles} />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </>
                )} />
              </div>
              <div className="space-y-2">
                <Label>Analyst</Label>
                <Controller name="analyst" control={form.control} render={({ field }) => (
                  <SearchableSelect options={users} value={field.value} onValueChange={field.onChange} placeholder="Select analyst" loading={loadingUsers} />
                )} />
              </div>
              <div className="space-y-2">
                <Label>Results Collected By</Label>
                <Controller name="results_collected_by" control={form.control} render={({ field }) => (
                  <SearchableSelect options={users} value={field.value} onValueChange={field.onChange} placeholder="Select collector" loading={loadingUsers} />
                )} />
              </div>
            </div>

            {/* Source and Signature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source <span className="text-red-500">*</span></Label>
                <Controller name="source" control={form.control} render={({ field, fieldState }) => (
                  <>
                    <SearchableSelect options={silos} value={field.value} onValueChange={field.onChange} placeholder="Select source" loading={loadingSilos} />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </>
                )} />
              </div>
              <div className="space-y-2">
                <Label>Approver Signature <span className="text-red-500">*</span></Label>
                <Controller name="approver_signature" control={form.control} render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    {field.value ? (
                      <img src={base64ToPngDataUrl(field.value)} alt="Approver signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                    ) : (
                      <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                        No signature captured
                      </div>
                    )}
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={() => setSignatureOpen(true)}>Add Signature</Button>
                      {field.value && (
                        <>
                          <Button type="button" variant="outline" onClick={() => setSignatureOpen(true)}>View Signature</Button>
                          <Button type="button" variant="ghost" onClick={() => field.onChange("")}>Clear</Button>
                        </>
                      )}
                    </div>
                  </div>
                )} />
              </div>
            </div>

            {/* Test Details - Single Detail Only */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light">Test Details</h3>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-gray-50 rounded-md border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium">General Test Information</h4>
                  </div>

                  {/* Basic Measurements */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold text-gray-700">Basic Measurements</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Controller name={`details.${index}.id`} control={form.control} render={({ field }) => (
                        <input type="hidden" {...field} />
                      )} />
                      <div className="space-y-2">
                        <Label>Temperature (°C)</Label>
                        <Controller name={`details.${index}.temperature`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input type="number" step="0.1" placeholder="72.5" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Controller name={`details.${index}.time`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <ShadcnTimePicker value={field.value} onChange={field.onChange} placeholder="Select time" />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>OT</Label>
                        <Controller name={`details.${index}.ot`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input placeholder="OK" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                    </div>
                  </div>

                  {/* Test Results */}
                  <div className="space-y-4 mt-6">
                    <h5 className="text-sm font-semibold text-gray-700">Chemical Tests</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Alcohol (%)</Label>
                        <Controller name={`details.${index}.alcohol`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input type="number" step="0.1" placeholder="0.1" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>Titrable Acidity</Label>
                        <Controller name={`details.${index}.titrable_acidity`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input type="number" step="0.1" placeholder="0.1" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>pH Level</Label>
                        <Controller name={`details.${index}.ph`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input type="number" step="0.1" placeholder="6.8" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label className="mb-2">Resazurin</Label>
                        <Controller
                          name={`details.${index}.resazurin`}
                          control={form.control}
                          render={({ field }) => (
                            <CircleColorSelector
                              value={field.value}
                              onValueChange={field.onChange}
                              options={RESAZURIN_OPTIONS}
                              placeholder="Select color"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Composition Analysis */}
                  <div className="space-y-4 mt-6">
                    <h5 className="text-sm font-semibold text-gray-700">Composition Analysis</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Fat (%)</Label>
                        <Controller name={`details.${index}.fat`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input type="number" step="0.1" placeholder="3.5" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>Protein (%)</Label>
                        <Controller name={`details.${index}.protein`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input type="number" step="0.1" placeholder="3.5" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Solids (%)</Label>
                        <Controller name={`details.${index}.total_solids`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input type="number" step="0.01" placeholder="12.55" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>LR SNF</Label>
                        <Controller name={`details.${index}.lr_snf`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input placeholder="30/8.95" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                    </div>
                  </div>

                  {/* Additional Parameters */}
                  <div className="space-y-4 mt-6">
                    <h5 className="text-sm font-semibold text-gray-700">Additional Parameters</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>FPD</Label>
                        <Controller name={`details.${index}.fpd`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input type="number" step="0.01" placeholder="12.55" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>SCC</Label>
                        <Controller name={`details.${index}.scc`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input type="number" step="0.01" placeholder="12.55" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>Density</Label>
                        <Controller name={`details.${index}.density`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Input type="number" step="0.01" placeholder="12.55" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                    </div>
                  </div>

                  {/* Quality Indicators */}
                  <div className="space-y-4 mt-6">
                    <h5 className="text-sm font-semibold text-gray-700">Quality Indicators</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>COB</Label>
                        <Controller name={`details.${index}.cob`} control={form.control} render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                            <Label>COB Detected</Label>
                          </div>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>Antibiotics</Label>
                        <Controller name={`details.${index}.antibiotics`} control={form.control} render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                            <Label>Antibiotics Detected</Label>
                          </div>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>Starch</Label>
                        <Controller name={`details.${index}.starch`} control={form.control} render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                            <Label>Starch Detected</Label>
                          </div>
                        )} />
                      </div>
                    </div>
                  </div>

                  {/* Final Details */}
                  <div className="space-y-4 mt-6">
                    <h5 className="text-sm font-semibold text-gray-700">Final Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Silo</Label>
                        <Controller name={`details.${index}.silo`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <SearchableSelect options={silos} value={field.value} onValueChange={field.onChange} placeholder="Select silo" loading={loadingSilos} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label>Remark</Label>
                        <Controller name={`details.${index}.remark`} control={form.control} render={({ field, fieldState }) => (
                          <>
                            <Textarea rows={2} placeholder="Test completed successfully" {...field} />
                            {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                          </>
                        )} />
                      </div>
                    </div>
                  </div>

                  {/* Compartment Tests */}
                  <div className="space-y-4 mt-6">
                    <h5 className="text-sm font-semibold text-gray-700">
                      Compartment Tests ({form.watch(`details.${index}.compartment_test`)?.length || 0} compartments)
                    </h5>
                    {form.watch(`details.${index}.compartment_test`)?.map((_, compartmentIndex) => (
                      <div key={compartmentIndex} className="p-4 bg-white rounded-md border">
                        <h6 className="text-sm font-medium mb-4">Compartment {compartmentIndex + 1}</h6>

                        {/* Basic Measurements */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Temperature (°C)</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.temperature`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input type="number" step="0.1" placeholder="72.5" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>Time</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.time`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <ShadcnTimePicker value={field.value} onChange={field.onChange} placeholder="Select time" />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>OT</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.ot`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input placeholder="OK" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                          </div>
                        </div>

                        {/* Chemical Tests */}
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Alcohol (%)</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.alcohol`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input type="number" step="0.1" placeholder="0.1" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>Titrable Acidity</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.titrable_acidity`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input type="number" step="0.1" placeholder="0.1" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>pH Level</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.ph`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input type="number" step="0.1" placeholder="6.8" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>Resazurin</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.resazurin`} control={form.control} render={({ field }) => (
                                <CircleColorSelector value={field.value} onValueChange={field.onChange} options={RESAZURIN_OPTIONS} placeholder="Select color" />
                              )} />
                            </div>
                          </div>
                        </div>

                        {/* Composition Analysis */}
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Fat (%)</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.fat`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input type="number" step="0.1" placeholder="3.5" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>Protein (%)</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.protein`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input type="number" step="0.1" placeholder="3.5" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>Total Solids (%)</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.total_solids`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input type="number" step="0.01" placeholder="12.55" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>LR SNF</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.lr_snf`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input placeholder="30/8.95" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                          </div>
                        </div>

                        {/* Additional Parameters */}
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>FPD</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.fpd`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input type="number" step="0.01" placeholder="12.55" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>SCC</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.scc`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input type="number" step="0.01" placeholder="12.55" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>Density</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.density`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Input type="number" step="0.01" placeholder="12.55" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                          </div>
                        </div>

                        {/* Quality Indicators */}
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>COB</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.cob`} control={form.control} render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                  <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                                  <Label>COB Detected</Label>
                                </div>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>Antibiotics</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.antibiotics`} control={form.control} render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                  <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                                  <Label>Antibiotics Detected</Label>
                                </div>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>Starch</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.starch`} control={form.control} render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                  <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                                  <Label>Starch Detected</Label>
                                </div>
                              )} />
                            </div>
                          </div>
                        </div>

                        {/* Final Details for Compartment */}
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Silo</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.silo`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <SearchableSelect options={silos} value={field.value} onValueChange={field.onChange} placeholder="Select silo" loading={loadingSilos} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                            <div className="space-y-2">
                              <Label>Remark</Label>
                              <Controller name={`details.${index}.compartment_test.${compartmentIndex}.remark`} control={form.control} render={({ field, fieldState }) => (
                                <>
                                  <Textarea rows={2} placeholder="Test completed successfully" {...field} />
                                  {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                                </>
                              )} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={operationLoading.create || operationLoading.update} className="rounded-full">
                {mode === "edit" ? "Update Lab Test" : "Create Lab Test"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
      <SignatureModal
        open={signatureOpen}
        onOpenChange={setSignatureOpen}
        title="Capture Approver Signature"
        onSave={(dataUrl) => {
          form.setValue("approver_signature", dataUrl, { shouldValidate: true, shouldDirty: true })
        }}
      />
      <SignatureViewer
        open={false}
        onOpenChange={() => { }}
        title="Approver Signature"
        value={form.watch("approver_signature")}
      />
    </>
  )
}
