"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Droplets, Truck, User, Package, Clock, Calendar, FileText, Beaker, Edit, Check,
  Save,
  ArrowRight,
  Info
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  createRawMilkIntakeForm,
  updateRawMilkIntakeForm,
  fetchRawMilkIntakeForms,
  fetchTestedTrucks,
  fetchTruckCompartments,
  clearTruckCompartments,
} from "@/lib/store/slices/rawMilkIntakeSlice"
import { siloApi } from "@/lib/api/silo"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"
import type { RawMilkIntakeForm, TruckCompartment } from "@/lib/api/raw-milk-intake"

// ── Schemas ───────────────────────────────────────────────────────────────────

const detailSchema = yup.object({
  id: yup.string().nullable().optional(),
  truck_compartment_number: yup.number().required("Compartment number is required"),
  silo_name: yup.string().required("Destination silo is required"),
  flow_meter_start: yup.string().nullable().optional(),
  flow_meter_end: yup.string().nullable().optional(),
  flow_meter_start_reading: yup.number().nullable().optional(),
  flow_meter_end_reading: yup.number().nullable().optional(),
})

const createSchema = yup.object({
  truck: yup.string().required("Truck is required"),
  details: yup.array(detailSchema).min(1, "At least one compartment is required").required(),
})

const editSchema = yup.object({
  created_at: yup.string().required("Date is required"),
  details: yup.array(detailSchema).required(),
})

type CreateFormData = yup.InferType<typeof createSchema>
type EditFormData = yup.InferType<typeof editSchema>

// ── Props ─────────────────────────────────────────────────────────────────────

interface RawMilkIntakeFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: RawMilkIntakeForm | null
  mode: "create" | "edit"
}

// ── Process Overview ──────────────────────────────────────────────────────────

const ProcessOverview = () => (
  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center justify-between flex-wrap gap-3">
      {[
        { icon: Truck, label: "Truck Arrival", color: "blue", done: true },
        { icon: Droplets, label: "Raw Milk Intake", color: "blue", current: true },
        { icon: Package, label: "Standardizing", color: "gray", future: true },
      ].map(({ icon: Icon, label, color, current, future }, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && <ArrowRight className="w-3 h-3 text-gray-300" />}
          <div className={`flex items-center gap-2 ${future ? "opacity-40" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${current ? "bg-blue-100" : "bg-gray-100"}`}>
              <Icon className={`w-3 h-3 ${current ? "text-blue-600" : "text-gray-500"}`} />
            </div>
            <span className={`text-xs ${current ? "font-medium text-blue-600" : "text-gray-500 font-light"}`}>{label}</span>
            {current && <Badge className="text-[10px] bg-gray-100 text-gray-600 font-normal">Current</Badge>}
          </div>
        </div>
      ))}
    </div>
  </div>
)

// ── Compartment Info Card ─────────────────────────────────────────────────────

function CompartmentInfoCard({ compartment }: { compartment: TruckCompartment }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-blue-100 bg-blue-50 rounded-lg p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-blue-800">
          Compartment #{compartment?.truck_compartment_number} — {compartment?.total_compartment_volume?.toLocaleString()}L
        </span>
        <button type="button" onClick={() => setExpanded(!expanded)} className="text-blue-600">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>
      {expanded && (
        <div className="mt-2 space-y-1 text-blue-700">
          <p>Route: {compartment.route_name}</p>
          <p>Driver: {compartment.driver_first_name} {compartment.driver_last_name}</p>
          {compartment.voucher_contributions.map((v, i) => (
            <div key={i} className="pl-2 border-l border-blue-200 mt-1">
              <p>{v.supplier_first_name} {v.supplier_last_name} — {v.volume}L</p>
              <p className="text-blue-500">{v.voucher_tag} · {v.supplier_tank}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RawMilkIntakeFormDrawer({
  open,
  onOpenChange,
  form,
  mode = "create",
}: RawMilkIntakeFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading, testedTrucks, truckCompartments } = useAppSelector((s) => s.rawMilkIntake)
  const { user } = useAppSelector((s) => s.auth)

  const [silos, setSilos] = useState<{ value: string; label: string }[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)

  const isCreate = mode === "create"

  // ── Create form ────────────────────────────────────────────────────────────

  const createForm = useForm<CreateFormData>({
    resolver: yupResolver(createSchema),
    defaultValues: { truck: "", details: [] },
  })
  const { fields: createFields, replace, append: appendCreate } = useFieldArray({
    control: createForm.control,
    name: "details"
  })
  const selectedTruck = createForm.watch("truck")

  // ── Edit form ──────────────────────────────────────────────────────────────

  const editForm = useForm<EditFormData>({
    resolver: yupResolver(editSchema),
    defaultValues: { created_at: "", details: [] },
  })
  const { fields: editFields, replace: editReplace, append: appendEdit } = useFieldArray({
    control: editForm.control,
    name: "details"
  })

  // ── Load data when drawer opens ────────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    // Load silos
    setLoadingSilos(true)
    siloApi.getSilos()
      .then((res) => setSilos(res.data?.map((s: any) => ({ value: s.name, label: s.name })) ?? []))
      .catch(() => toast.error("Failed to load silos"))
      .finally(() => setLoadingSilos(false))

    if (isCreate) {
      dispatch(fetchTestedTrucks())
      createForm.reset({ truck: "", details: [] })
      dispatch(clearTruckCompartments())
    } else if (form) {
      // Populate edit form from existing record
      editForm.reset({
        created_at: form.created_at || "",
        details: (form.details ?? []).map((d) => ({
          id: d.id ?? null,
          truck_compartment_number: d.truck_compartment_number,
          silo_name: d.silo_name,
          flow_meter_start: d.flow_meter_start ?? null,
          flow_meter_end: d.flow_meter_end ?? null,
          flow_meter_start_reading: d.flow_meter_start_reading ?? null,
          flow_meter_end_reading: d.flow_meter_end_reading ?? null,
        })),
      })
    }
  }, [open, isCreate, form])

  // ── Fetch compartments when truck changes ──────────────────────────────────

  useEffect(() => {
    if (!selectedTruck) return
    dispatch(clearTruckCompartments())
    replace([])
    dispatch(fetchTruckCompartments(selectedTruck))
  }, [selectedTruck, dispatch, replace])

  // Auto-populate details when compartments are fetched
  useEffect(() => {
    if (isCreate && truckCompartments.length > 0) {
      replace(truckCompartments.map(comp => ({
        truck_compartment_number: comp.truck_compartment_number,
        silo_name: "",
        flow_meter_start_reading: null,
      })))
    }
  }, [truckCompartments, isCreate, replace])

  // ── Submit handlers ────────────────────────────────────────────────────────

  const onCreateSubmit = async (data: CreateFormData) => {
    try {
      if (!user?.id) { toast.error("User not authenticated"); return }
      await dispatch(createRawMilkIntakeForm({
        operator: user.id,
        truck: data.truck,
        details: data.details.map((d) => ({
          truck_compartment_number: d.truck_compartment_number,
          silo_name: d.silo_name,
          flow_meter_start_reading: d.flow_meter_start_reading ?? undefined,
        })),
      })).unwrap()
      toast.success("Intake form created successfully")
      await dispatch(fetchRawMilkIntakeForms())
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "Failed to create form")
    }
  }

  const onEditSubmit = async (data: EditFormData) => {
    try {
      if (!form?.id) return
      await dispatch(updateRawMilkIntakeForm({
        id: form.id,
        created_at: data.created_at,
        operator: typeof form.operator === "string"
          ? form.operator
          : (form.operator as any).id || (form.operator as any).first_name,
        truck: form.truck,
        details: data.details.map((d) => ({
          id: d.id || undefined,
          truck_compartment_number: d.truck_compartment_number,
          silo_name: d.silo_name,
          flow_meter_start: d.flow_meter_start || undefined,
          flow_meter_end: d.flow_meter_end || undefined,
          flow_meter_start_reading: d.flow_meter_start_reading != null ? d.flow_meter_start_reading : undefined,
          flow_meter_end_reading: d.flow_meter_end_reading != null ? d.flow_meter_end_reading : undefined,
        })),
      })).unwrap()
      toast.success("Intake form updated successfully")
      await dispatch(fetchRawMilkIntakeForms())
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "Failed to update form")
    }
  }

  const onInvalid = (errors: any) => {
    const msgs = Object.values(errors).map((e: any) => e?.message || e?.details?.message || "Invalid field").filter(Boolean)
    if (msgs.length) toast.error(`Please fix: ${msgs.slice(0, 2).join(", ")}`)
  }

  // ── Add compartment from truck compartments ────────────────────────────────

  const addCompartment = (comp: TruckCompartment) => {
    const existing = createFields.find(
      (f) => f.truck_compartment_number === comp.truck_compartment_number
    )
    if (existing) { toast.error("Compartment already added"); return }
    appendCreate({
      truck_compartment_number: comp.truck_compartment_number,
      silo_name: "",
      flow_meter_start_reading: null,
    })
  }

  // ── Detail row renderer ────────────────────────────────────────────────────

  const renderCompartmentTable = (
    formObj: any,
    namePrefix: string,
    fieldArray: any[]
  ) => (
    <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="p-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider w-20">Comp #</th>
            <th className="p-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Silo</th>
            <th className="p-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">Start Reading</th>
            {!isCreate && (
              <th className="p-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">End Reading</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {fieldArray.map((field, idx) => (
            <tr key={field.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="p-3 text-sm font-medium text-gray-700">
                #{field.truck_compartment_number}
              </td>
              <td className="p-3">
                <Controller
                  name={`${namePrefix}.${idx}.silo_name` as any}
                  control={formObj.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={loadingSilos}>
                      <SelectTrigger className="h-9 rounded-lg border-gray-200 text-sm bg-white">
                        <SelectValue placeholder={loadingSilos ? "Loading…" : "Select Silo"} />
                      </SelectTrigger>
                      <SelectContent>
                        {silos.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {formObj.formState.errors?.details?.[idx]?.silo_name && (
                  <p className="text-[10px] text-red-500 mt-1">{formObj.formState.errors.details[idx]?.silo_name?.message}</p>
                )}
              </td>
              <td className="p-3">
                <Controller
                  name={`${namePrefix}.${idx}.flow_meter_start_reading` as any}
                  control={formObj.control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Start"
                      className="h-9 rounded-lg text-sm bg-white"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  )}
                />
              </td>
              {!isCreate && (
                <td className="p-3">
                  <Controller
                    name={`${namePrefix}.${idx}.flow_meter_end_reading` as any}
                    control={formObj.control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="End"
                        className="h-9 rounded-lg text-sm bg-white border-blue-100 focus:border-blue-300"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    )}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // ── CREATE UI ──────────────────────────────────────────────────────────────

  if (isCreate) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="tablet-sheet-full p-0 bg-white">
          <SheetHeader className="p-6 pb-0">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <SheetTitle className="text-lg font-light">Create Raw Milk Intake Form</SheetTitle>
                <SheetDescription className="text-sm font-light">
                  Select a truck and assign destination silos
                </SheetDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <User className="w-3 h-3 text-blue-500" />
                  <span>Operator: <span className="text-blue-600">{user?.first_name} {user?.last_name}</span></span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={createForm.handleSubmit(onCreateSubmit, onInvalid)}>
              <div className="p-6 space-y-6">
                <ProcessOverview />

                {/* Truck Select */}
                <div className="space-y-2">
                  <Label className="font-medium text-sm text-gray-700">Select Truck *</Label>
                  <Controller
                    name="truck"
                    control={createForm.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={operationLoading.fetchTrucks}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white">
                          <SelectValue placeholder={operationLoading.fetchTrucks ? "Loading trucks…" : "Select a truck"} />
                        </SelectTrigger>
                        <SelectContent>
                          {testedTrucks.map((t) => (
                            <SelectItem key={t.truck_number} value={t.truck_number} className="py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{t.truck_number}</span>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                                    Vol: {t.total_volume.toLocaleString()}L
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    Date: {new Date(t.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {createForm.formState.errors.truck && (
                    <p className="text-xs text-red-500">{createForm.formState.errors.truck.message}</p>
                  )}
                </div>

                {/* Compartment Assignments Table */}
                {selectedTruck && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium text-sm text-gray-700">Compartment Assignments</Label>
                      <Badge variant="outline" className="font-normal text-[10px] uppercase tracking-wider text-gray-400">
                        {createFields.length} Compartments
                      </Badge>
                    </div>

                    {operationLoading.fetchCompartments ? (
                      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 text-center">
                        <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Fetching compartments...</p>
                      </div>
                    ) : createFields.length === 0 ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 italic">
                        <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">No tested compartments found for this truck.</p>
                      </div>
                    ) : (
                      renderCompartmentTable(createForm, "details", createFields)
                    )}
                  </div>
                )}

                {createForm.formState.errors.details?.root && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.details.root?.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end p-6 border-t gap-3">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={operationLoading.create}
                  className="rounded-full flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {operationLoading.create ? "Saving…" : "Create Form"}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // ── EDIT UI ────────────────────────────────────────────────────────────────

  const operatorName = form
    ? typeof form.operator === "string"
      ? form.operator
      : `${(form.operator as any).first_name} ${(form.operator as any).last_name}`
    : ""

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <SheetTitle className="text-lg font-light">Edit Raw Milk Intake Form</SheetTitle>
              <SheetDescription className="text-sm font-light">
                Update silo assignments and flow meter readings
              </SheetDescription>
            </div>
            {form && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <User className="w-3 h-3 text-blue-500" />
                  <span>Operator: <span className="text-blue-600">{operatorName}</span></span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {(() => {
                      if (!form.created_at) return "N/A";
                      const d = new Date(form.created_at);
                      if (!isNaN(d.getTime())) {
                        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                      }
                      // Handle space instead of T
                      const d2 = new Date(form.created_at.replace(' ', 'T'));
                      return !isNaN(d2.getTime())
                        ? d2.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : "Invalid Date";
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={editForm.handleSubmit(onEditSubmit, onInvalid)}>
            <div className="p-6 space-y-6">
              {/* Summary card */}
              {form && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">{form.truck}</span>
                    <Badge variant="outline" className="text-xs font-normal ml-auto">{form.tag}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-blue-400 uppercase font-bold tracking-tighter">Operator</Label>
                      <p className="text-xs text-blue-800 font-medium tabular-nums">{operatorName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-blue-400 uppercase font-bold tracking-tighter">Intake Date</Label>
                      <Controller
                        name="created_at"
                        control={editForm.control}
                        render={({ field }) => (
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            className="w-full"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Editable compartment details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium text-sm text-gray-700">Compartment Assignments</Label>
                  <Badge variant="outline" className="font-normal text-[10px] uppercase tracking-wider text-gray-400">
                    {editFields.length} Compartments
                  </Badge>
                </div>
                {editFields.length === 0 ? (
                  <p className="text-sm text-gray-400 italic bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-200">No compartment details available</p>
                ) : (
                  renderCompartmentTable(editForm, "details", editFields)
                )}
              </div>
            </div>

            <div className="flex items-center justify-end p-6 border-t gap-3">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={operationLoading.update}
                className="rounded-full flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {operationLoading.update ? "Saving…" : "Update Form"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
