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
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createRawMilkResultSlip, updateRawMilkResultSlip } from "@/lib/store/slices/rawMilkResultSlipSlice"
import { usersApi } from "@/lib/api/users"
import { silosApi } from "@/lib/api/silos"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl, normalizeDataUrlToBase64 } from "@/lib/utils/signature"

const detailSchema = yup.object({
  temperature: yup.number().nullable(),
  time: yup.string().required("Time is required"),
  ot: yup.string().required("OT is required"),
  cob: yup.boolean().required(),
  alcohol: yup.number().nullable(),
  titrable_acidity: yup.number().nullable(),
  ph: yup.number().nullable(),
  resazurin: yup.string().required("Resazurin is required"),
  fat: yup.number().nullable(),
  protein: yup.number().nullable(),
  lr_snf: yup.string().required("LR SNF is required"),
  total_solids: yup.number().nullable(),
  fpd: yup.number().nullable(),
  scc: yup.number().nullable(),
  density: yup.number().nullable(),
  antibiotics: yup.boolean().required(),
  silo: yup.string().required("Silo is required"),
  remark: yup.string().required("Remark is required"),
})

const schema = yup.object({
  date: yup.string().required("Date is required"),
  time_in: yup.string().required("Time in is required"),
  time_out: yup.string().required("Time out is required"),
  approved_by: yup.string().required("Approver is required"),
  approver_signature: yup.string().required("Approver signature is required"),
  source: yup.string().required("Source is required"),
  analyst: yup.string().required("Analyst is required"),
  results_collected_by: yup.string().required("Results collector is required"),
  details: yup.array().of(detailSchema).min(1, "At least one detail is required").required("Details are required"),
})

export type RawMilkResultSlipFormData = yup.InferType<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  rawMilkIntakeFormId: string
  mode: "create" | "edit"
  existingId?: string
  existingData?: any
}

export function RawMilkResultSlipDrawer({ open, onOpenChange, rawMilkIntakeFormId, mode, existingId, existingData }: Props) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((s) => (s as any).rawMilkResultSlips)
  const [users, setUsers] = useState<SearchableSelectOption[]>([])
  const [roles, setRoles] = useState<SearchableSelectOption[]>([])
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [loadingSilos, setLoadingSilos] = useState(false)
  const [signatureOpen, setSignatureOpen] = useState(false)

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
          details: existingData.raw_milk_result_slip_details?.map((detail: any) => ({
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
            remark: detail.remark ?? ""
          })) || [{
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

      ;(async () => {
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

      ;(async () => {
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
  }, [open, mode, existingData, form])

  const onSubmit = async (data: RawMilkResultSlipFormData) => {
    try {
      const payload = {
        ...data,
        raw_milk_intake_id: rawMilkIntakeFormId,
        details: data.details || [], // Ensure details is always an array
        approver_signature: normalizeDataUrlToBase64(data.approver_signature),
      }

      if (mode === "edit" && existingId) {
        await dispatch(updateRawMilkResultSlip({ 
          id: existingId, 
          ...payload 
        })).unwrap()
        toast.success("Result slip updated")
      } else {
        await dispatch(createRawMilkResultSlip(payload)).unwrap()
        toast.success("Result slip created")
      }
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e || "Failed to save result slip")
    }
  }

  const addDetail = () => {
    append({
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
    })
  }

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white overflow-y-auto">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-lg font-light">{mode === "edit" ? "Update Lab Test" : "Create Lab Test"}</SheetTitle>
          <SheetDescription className="text-sm font-light">Capture or update raw milk result slip for this intake form</SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Controller name="date" control={form.control} render={({ field }) => (
                <DatePicker label=" " value={field.value} onChange={field.onChange} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Time In</Label>
              <Controller name="time_in" control={form.control} render={({ field }) => (
                <ShadcnTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select time in"
                />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Time Out</Label>
              <Controller name="time_out" control={form.control} render={({ field }) => (
                <ShadcnTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select time out"
                />
              )} />
            </div>
          </div>

          {/* Personnel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Approved By (Role)</Label>
              <Controller name="approved_by" control={form.control} render={({ field }) => (
                <SearchableSelect options={roles} value={field.value} onValueChange={field.onChange} placeholder="Select approver role" loading={loadingRoles} />
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
              <Label>Source</Label>
              <Controller name="source" control={form.control} render={({ field }) => (
                <SearchableSelect options={silos} value={field.value} onValueChange={field.onChange} placeholder="Select source" loading={loadingSilos} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Approver Signature</Label>
              <Controller name="approver_signature" control={form.control} render={({ field }) => (
                <div className="space-y-2">
                  {field.value ? (
                    <img src={base64ToPngDataUrl(field.value)} alt="Approver signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                  ) : (
                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                      No signature captured
                    </div>
                  )}
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

          {/* Test Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-light">Test Details</h3>
              <Button type="button" variant="outline" size="sm" onClick={addDetail}>
                <Plus className="w-4 h-4 mr-2" />
                Add Detail
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 bg-gray-50 rounded-md border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium">Detail {index + 1}</h4>
                  <Button type="button" variant="ghost" onClick={() => remove(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Controller name={`details.${index}.temperature`} control={form.control} render={({ field }) => (
                      <Input type="number" step="0.1" placeholder="72.5" {...field} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Controller name={`details.${index}.time`} control={form.control} render={({ field }) => (
                      <ShadcnTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select time"
                      />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>OT</Label>
                    <Controller name={`details.${index}.ot`} control={form.control} render={({ field }) => (
                      <Input placeholder="OK" {...field} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>COB</Label>
                    <Controller name={`details.${index}.cob`} control={form.control} render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                        <Label>COB Detected</Label>
                      </div>
                    )} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Alcohol</Label>
                    <Controller name={`details.${index}.alcohol`} control={form.control} render={({ field }) => (
                      <Input type="number" step="0.1" placeholder="0.1" {...field} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>Titrable Acidity</Label>
                    <Controller name={`details.${index}.titrable_acidity`} control={form.control} render={({ field }) => (
                      <Input type="number" step="0.1" placeholder="0.1" {...field} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>pH</Label>
                    <Controller name={`details.${index}.ph`} control={form.control} render={({ field }) => (
                      <Input type="number" step="0.1" placeholder="6.8" {...field} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>Resazurin</Label>
                    <Controller name={`details.${index}.resazurin`} control={form.control} render={({ field }) => (
                      <Input placeholder="LB" {...field} />
                    )} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Fat</Label>
                    <Controller name={`details.${index}.fat`} control={form.control} render={({ field }) => (
                      <Input type="number" step="0.1" placeholder="3.5" {...field} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>Protein</Label>
                    <Controller name={`details.${index}.protein`} control={form.control} render={({ field }) => (
                      <Input type="number" step="0.1" placeholder="3.5" {...field} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>LR SNF</Label>
                    <Controller name={`details.${index}.lr_snf`} control={form.control} render={({ field }) => (
                      <Input placeholder="30/8.95" {...field} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Solids</Label>
                    <Controller name={`details.${index}.total_solids`} control={form.control} render={({ field }) => (
                      <Input type="number" step="0.01" placeholder="12.55" {...field} />
                    )} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>FPD</Label>
                    <Controller name={`details.${index}.fpd`} control={form.control} render={({ field }) => (
                      <Input type="number" step="0.01" placeholder="12.55" {...field} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>SCC</Label>
                    <Controller name={`details.${index}.scc`} control={form.control} render={({ field }) => (
                      <Input type="number" step="0.01" placeholder="12.55" {...field} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>Density</Label>
                    <Controller name={`details.${index}.density`} control={form.control} render={({ field }) => (
                      <Input type="number" step="0.01" placeholder="12.55" {...field} />
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Silo</Label>
                    <Controller name={`details.${index}.silo`} control={form.control} render={({ field }) => (
                      <SearchableSelect options={silos} value={field.value} onValueChange={field.onChange} placeholder="Select silo" loading={loadingSilos} />
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>Remark</Label>
                    <Controller name={`details.${index}.remark`} control={form.control} render={({ field }) => (
                      <Textarea rows={2} placeholder="Test completed successfully" {...field} />
                    )} />
                  </div>
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
      onOpenChange={() => {}}
      title="Approver Signature"
      value={form.watch("approver_signature")}
    />
    </>
  )
}
