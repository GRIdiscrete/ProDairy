"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createPalletiserSheetAction, 
  updatePalletiserSheetAction,
  fetchPalletiserSheets
} from "@/lib/store/slices/palletiserSheetSlice"
import { usersApi } from "@/lib/api/users"
import { machineApi } from "@/lib/api/machine"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import { PalletiserSheet } from "@/lib/api/data-capture-forms"
import { ChevronLeft, ChevronRight, ArrowRight, Package, Beaker, FileText } from "lucide-react"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl, normalizeDataUrlToBase64 } from "@/lib/utils/signature"

interface PalletiserSheetDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheet?: PalletiserSheet | null
  mode?: "create" | "edit"
  productType?: string
}

const sheetSchema = yup.object({
  machine_id: yup.string().required("Machine is required"),
  manufacturing_date: yup.string().required("Manufacturing date is required"),
  expiry_date: yup.string().required("Expiry date is required"),
  batch_number: yup.number().required("Batch number is required").min(1),
  approved_by: yup.string().required("Approved by is required"),
})

const sheetDetailsSchema = yup.object({
  pallet_number: yup.number().required("Pallet number is required").min(1),
  start_time: yup.string().required("Start time is required"),
  end_time: yup.string().required("End time is required"),
  cases_packed: yup.number().required("Cases packed is required").min(0),
  serial_number: yup.string().required("Serial number is required"),
  counter_id: yup.string().required("Counter is required"),
  counter_signature: yup.string().required("Counter signature is required"),
})

type SheetFormData = yup.InferType<typeof sheetSchema>
type SheetDetailsFormData = yup.InferType<typeof sheetDetailsSchema>

export function PalletiserSheetDrawer({
  open,
  onOpenChange,
  sheet,
  mode = "create",
  productType
}: PalletiserSheetDrawerProps) {
  const dispatch = useAppDispatch()
  const palletiserSheetState = useAppSelector((s) => s.palletiserSheets)
  const { operationLoading } = palletiserSheetState || { operationLoading: { create: false, update: false } }

  const [currentStep, setCurrentStep] = useState(1)
  const [tempSheetData, setTempSheetData] = useState<any | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMachines, setLoadingMachines] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [counterSignatureOpen, setCounterSignatureOpen] = useState(false)
  const [counterSignatureViewOpen, setCounterSignatureViewOpen] = useState(false)

  const sheetForm = useForm<SheetFormData>({
    resolver: yupResolver(sheetSchema),
    defaultValues: {
      machine_id: "",
      manufacturing_date: "",
      expiry_date: "",
      batch_number: undefined,
      approved_by: "",
    }
  })

  const sheetDetailsForm = useForm<SheetDetailsFormData>({
    resolver: yupResolver(sheetDetailsSchema),
    defaultValues: {
      pallet_number: undefined,
      start_time: "",
      end_time: "",
      cases_packed: undefined,
      serial_number: "",
      counter_id: "",
      counter_signature: "",
    },
    mode: "onChange"
  })

  useEffect(() => {
    const load = async () => {
      setLoadingUsers(true); setLoadingMachines(true); setLoadingRoles(true)
      try {
        const [uRes, mRes, rRes] = await Promise.allSettled([
          usersApi.getUsers(),
          machineApi.getMachines(),
          rolesApi.getRoles()
        ])
        if (uRes.status === "fulfilled") setUsers(uRes.value.data || [])
        else setUsers([])

        if (mRes.status === "fulfilled") setMachines(mRes.value.data || [])
        else setMachines([])

        if (rRes.status === "fulfilled") setRoles(rRes.value.data || [])
        else setRoles([])
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingUsers(false); setLoadingMachines(false); setLoadingRoles(false)
      }
    }
    if (open) load()
  }, [open])

  // Prefill forms for edit mode or reset for create
  useEffect(() => {
    if (!open) return
    if (mode === "edit" && sheet) {
      sheetForm.reset({
        machine_id: sheet.machine_id || "",
        manufacturing_date: sheet.manufacturing_date || "",
        expiry_date: sheet.expiry_date || "",
        batch_number: sheet.batch_number ?? undefined,
        approved_by: sheet.approved_by || ""
      })
      // take first details entry if exists
      const first = Array.isArray(sheet.palletiser_sheet_details) && sheet.palletiser_sheet_details.length > 0
        ? sheet.palletiser_sheet_details[0]
        : null
      sheetDetailsForm.reset({
        pallet_number: first?.pallet_number ?? undefined,
        // normalize stored "HH:MM:SS" to "HH:MM" for the time picker
        start_time: normalizeTimeForPicker(first?.start_time ?? "") ?? "",
        end_time: normalizeTimeForPicker(first?.end_time ?? "") ?? "",
        cases_packed: first?.cases_packed ?? undefined,
        serial_number: first?.serial_number ?? "",
        counter_id: first?.counter_id ?? "",
        counter_signature: first?.counter_signature ?? ""
      })
      setTempSheetData({
        machine_id: sheet.machine_id,
        manufacturing_date: sheet.manufacturing_date,
        expiry_date: sheet.expiry_date,
        batch_number: sheet.batch_number,
        product_type: sheet.product_type || productType,
        approved_by: sheet.approved_by
      })
      setCurrentStep(1)
    } else {
      sheetForm.reset()
      sheetDetailsForm.reset()
      setTempSheetData(null)
      setCurrentStep(1)
    }
  }, [open, mode, sheet, productType, sheetForm, sheetDetailsForm])

  const handleSheetSubmit = (data: SheetFormData) => {
    setTempSheetData({
      ...data,
      product_type: productType || (data as any).product_type || null
    })
    setCurrentStep(2)
  }

  // helpers: convert "HH:MM:SS" -> "HH:MM" for time picker, and back to "HH:MM:00" for backend
  const normalizeTimeForPicker = (t?: string | null) => {
    if (!t) return ""
    // if t like "00:00:00" or "00:00", return "HH:MM"
    const parts = t.split(":")
    if (parts.length >= 2) return `${parts[0].padStart(2,"0")}:${parts[1].padStart(2,"0")}`
    return t
  }

  const normalizeTimeForBackend = (t?: string | null) => {
    if (!t) return null
    // if already has seconds (HH:MM:SS) return as-is
    if (t.split(":").length === 3) return t
    // if "HH:MM" -> append :00
    if (t.split(":").length === 2) return `${t}:00`
    return t
  }

  // helper: build full timestamp "YYYY-MM-DD HH:MM:SS+00"
  const buildFullTimestamp = (date?: string | null, time?: string | null) => {
    if (!time) return null
    // ensure time is HH:MM:SS
    const t = normalizeTimeForBackend(time) || ""
    const d = date || tempSheetData?.manufacturing_date || sheet?.manufacturing_date
    if (!d) return t // fallback
    // if t already includes seconds and possibly timezone, keep as-is if contains space
    if (t.includes(" ")) return t
    return `${d} ${t}+00`
  }

  const handleFinalSubmit = async (details: SheetDetailsFormData) => {
    if (!tempSheetData && mode !== "edit") {
      toast.error("Missing sheet information")
      return
    }

    const payload: any = {
      // include id for update payload
      ...(mode === "edit" && sheet?.id ? { id: sheet.id } : {}),
       machine_id: tempSheetData?.machine_id ?? sheet?.machine_id,
       manufacturing_date: tempSheetData?.manufacturing_date ?? sheet?.manufacturing_date,
       expiry_date: tempSheetData?.expiry_date ?? sheet?.expiry_date,
       batch_number: tempSheetData?.batch_number ?? sheet?.batch_number,
       product_type: tempSheetData?.product_type ?? sheet?.product_type ?? productType,
       approved_by: tempSheetData?.approved_by ?? sheet?.approved_by,
      palletiser_sheet_details: [
        (() => {
          const detailPayload: any = {
            pallet_number: details.pallet_number,
            // build full timestamp using sheet date
            start_time: buildFullTimestamp(tempSheetData?.manufacturing_date ?? sheet?.manufacturing_date, details.start_time),
            end_time: buildFullTimestamp(tempSheetData?.manufacturing_date ?? sheet?.manufacturing_date, details.end_time),
            cases_packed: details.cases_packed ?? null,
            serial_number: details.serial_number || null,
            counter_id: details.counter_id || null,
            counter_signature: normalizeDataUrlToBase64(details.counter_signature || "")
          }
          // if editing, include detail id and palletiser_sheet_id if available
          if (mode === "edit") {
            const first = Array.isArray(sheet?.palletiser_sheet_details) && sheet!.palletiser_sheet_details.length > 0 ? sheet!.palletiser_sheet_details[0] : null
            if (first?.id) detailPayload.id = first.id
            if (sheet?.id) detailPayload.palletiser_sheet_id = sheet.id
          }
          return detailPayload
        })()
      ]
     }

    try {
      if (mode === "edit" && sheet?.id) {
        // update thunk expects { id, data } shape handled in slice
        await dispatch(updatePalletiserSheetAction({ id: sheet.id, data: payload })).unwrap()
        toast.success("Palletiser sheet updated")
      } else {
        await dispatch(createPalletiserSheetAction(payload)).unwrap()
        toast.success("Palletiser sheet created")
      }
      setTimeout(() => dispatch(fetchPalletiserSheets()), 1000)
      onOpenChange(false)
    } catch (err: any) {
      const msg = typeof err === "string" ? err : (err?.message || "Failed to save palletiser sheet")
      toast.error(msg)
      console.error(err)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleUserSearch = async (q: string) => {
    if (!q.trim()) return []
    try {
      const resp = await usersApi.getUsers({ filters: { search: q } })
      return (resp.data || []).map((u: any) => ({ value: u.id, label: `${u.first_name} ${u.last_name}`.trim() || u.email, description: u.email }))
    } catch {
      return []
    }
  }

  const handleMachineSearch = async (q: string) => {
    if (!q.trim()) return []
    try {
      const resp = await machineApi.getMachines({ filters: { search: q } })
      return (resp.data || []).map((m: any) => ({ value: m.id, label: m.name, description: `${m.category} • ${m.location}` }))
    } catch {
      return []
    }
  }

  const handleRoleSearch = async (q: string) => {
    if (!q.trim()) return []
    try {
      const resp = await rolesApi.getRoles({ filters: { search: q } })
      return (resp.data || []).map((r: any) => ({ value: r.id, label: r.role_name, description: r.description || "Role" }))
    } catch {
      return []
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-light">Basic Information</h3>
        <p className="text-sm text-gray-600 mt-1">Enter sheet information</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-2">Machine</Label>
          <Controller
            name="machine_id"
            control={sheetForm.control}
            render={({ field }) => (
              <SearchableSelect
                options={machines.map(m => ({ value: m.id, label: m.name, description: `${m.category} • ${m.location}` }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleMachineSearch}
                placeholder="Select machine"
                loading={loadingMachines}
              />
            )}
          />
          {sheetForm.formState.errors.machine_id && <p className="text-xs text-red-500">{sheetForm.formState.errors.machine_id.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Manufacturing Date</Label>
            <Controller name="manufacturing_date" control={sheetForm.control} render={({ field }) => (
              <DatePicker value={field.value ? new Date(field.value) : undefined} onChange={(v:any)=> field.onChange(v ? new Date(v).toISOString().slice(0,10) : "")} />
            )} />
            {sheetForm.formState.errors.manufacturing_date && <p className="text-xs text-red-500">{sheetForm.formState.errors.manufacturing_date.message}</p>}
          </div>
          <div>
            <Label className="mb-2">Expiry Date</Label>
            <Controller name="expiry_date" control={sheetForm.control} render={({ field }) => (
              <DatePicker value={field.value ? new Date(field.value) : undefined} onChange={(v:any)=> field.onChange(v ? new Date(v).toISOString().slice(0,10) : "")} />
            )} />
            {sheetForm.formState.errors.expiry_date && <p className="text-xs text-red-500">{sheetForm.formState.errors.expiry_date.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Batch Number</Label>
            <Controller name="batch_number" control={sheetForm.control} render={({ field }) => (
              <Input type="number" {...field} value={field.value ?? ""} onChange={(e)=> field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
            )} />
            {sheetForm.formState.errors.batch_number && <p className="text-xs text-red-500">{sheetForm.formState.errors.batch_number.message}</p>}
          </div>

          <div>
            <Label className="mb-2">Approved By (Role)</Label>
            <Controller name="approved_by" control={sheetForm.control} render={({ field }) => (
              <SearchableSelect
                options={roles.map(r => ({ value: r.id, label: r.role_name, description: r.description }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleRoleSearch}
                loading={loadingRoles}
              />
            )} />
            {sheetForm.formState.errors.approved_by && <p className="text-xs text-red-500">{sheetForm.formState.errors.approved_by.message}</p>}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-light">Details</h3>
        <p className="text-sm text-gray-600 mt-1">Enter pallet details and counter information</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">Pallet Number</Label>
          <Controller name="pallet_number" control={sheetDetailsForm.control} render={({ field }) => (
            <Input type="number" {...field} value={field.value ?? ""} onChange={(e)=> field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
          )} />
          {sheetDetailsForm.formState.errors.pallet_number && <p className="text-xs text-red-500">{sheetDetailsForm.formState.errors.pallet_number.message}</p>}
        </div>

        <div>
          <Label className="mb-2">Cases Packed</Label>
          <Controller name="cases_packed" control={sheetDetailsForm.control} render={({ field }) => (
            <Input type="number" {...field} value={field.value ?? ""} onChange={(e)=> field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
          )} />
          {sheetDetailsForm.formState.errors.cases_packed && <p className="text-xs text-red-500">{sheetDetailsForm.formState.errors.cases_packed.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <Label className="mb-2">Start Time</Label>
          <Controller name="start_time" control={sheetDetailsForm.control} render={({ field }) => (
            <ShadcnTimePicker value={field.value} onChange={field.onChange} />
          )} />
          {sheetDetailsForm.formState.errors.start_time && <p className="text-xs text-red-500">{sheetDetailsForm.formState.errors.start_time.message}</p>}
        </div>

        <div>
          <Label className="mb-2">End Time</Label>
          <Controller name="end_time" control={sheetDetailsForm.control} render={({ field }) => (
            <ShadcnTimePicker value={field.value} onChange={field.onChange} />
          )} />
          {sheetDetailsForm.formState.errors.end_time && <p className="text-xs text-red-500">{sheetDetailsForm.formState.errors.end_time.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <Label className="mb-2">Serial Number</Label>
          <Controller name="serial_number" control={sheetDetailsForm.control} render={({ field }) => (
            <Input {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} />
          )} />
          {sheetDetailsForm.formState.errors.serial_number && <p className="text-xs text-red-500">{sheetDetailsForm.formState.errors.serial_number.message}</p>}
        </div>

        <div>
          <Label className="mb-2">Counter</Label>
          <Controller name="counter_id" control={sheetDetailsForm.control} render={({ field }) => (
            <SearchableSelect
              options={users.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}`.trim() || u.email, description: u.email }))}
              value={field.value}
              onValueChange={field.onChange}
              onSearch={handleUserSearch}
              loading={loadingUsers}
            />
          )} />
          {sheetDetailsForm.formState.errors.counter_id && <p className="text-xs text-red-500">{sheetDetailsForm.formState.errors.counter_id.message}</p>}
        </div>
      </div>

      <div className="mt-4">
        <Label className="mb-2">Counter Signature</Label>
        <Controller name="counter_signature" control={sheetDetailsForm.control} render={({ field }) => {
          const val = typeof field.value === "string" ? field.value : ""
          return (
            <div className="space-y-2">
              {val ? (
                <img src={base64ToPngDataUrl(val)} alt="signature" className="h-24 border rounded-md" />
              ) : (
                <div className="h-24 border-dashed border rounded-md flex items-center justify-center text-xs text-gray-500">No signature</div>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCounterSignatureOpen(true)}>Add</Button>
                {val && <Button type="button" variant="outline" onClick={() => setCounterSignatureViewOpen(true)}>View</Button>}
                {val && <Button type="button" variant="ghost" onClick={() => field.onChange("")}>Clear</Button>}
              </div>
            </div>
          )
        }} />
        {sheetDetailsForm.formState.errors.counter_signature && <p className="text-xs text-red-500">{sheetDetailsForm.formState.errors.counter_signature.message}</p>}
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>{mode === "edit" ? "Edit Palletiser Sheet" : "Create Palletiser Sheet"}</SheetTitle>
          <SheetDescription>{currentStep === 1 ? "Basic Information" : "Details"}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white" key={`form-${open}-${currentStep}`}>
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-white">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          <div className="text-sm text-muted-foreground">{currentStep === 1 ? "Basic Information" : "Details"} • Step {currentStep} of 2</div>

          {currentStep === 1 ? (
            <Button onClick={sheetForm.handleSubmit(handleSheetSubmit)} className="flex items-center gap-2" disabled={operationLoading.create}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={sheetDetailsForm.handleSubmit(handleFinalSubmit)} disabled={operationLoading.create}>
              {mode === "edit" ? "Update Sheet" : "Create Sheet"}
            </Button>
          )}
        </div>
      </SheetContent>

      <SignatureModal open={counterSignatureOpen} onOpenChange={setCounterSignatureOpen} title="Capture Counter Signature" onSave={(dataUrl) => sheetDetailsForm.setValue("counter_signature", dataUrl, { shouldValidate: true })} />
      <SignatureViewer open={counterSignatureViewOpen} onOpenChange={setCounterSignatureViewOpen} title="Counter Signature" value={sheetDetailsForm.getValues("counter_signature")} />
    </Sheet>
  )
}