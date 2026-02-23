"use client"

import { useState, useEffect, useCallback } from "react"
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
  Droplets, Truck, Plus, Trash2, Save, ArrowRight, Package, ChevronDown, ChevronUp, Info
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
import type { RawMilkIntakeForm, TruckCompartment } from "@/lib/api/raw-milk-intake"

// ── Schemas ───────────────────────────────────────────────────────────────────

const detailSchema = yup.object({
  truck_compartment_number: yup.number().required("Compartment number is required"),
  silo_name: yup.string().required("Destination silo is required"),
  flow_meter_start_reading: yup.number().nullable().optional(),
  flow_meter_end_reading: yup.number().nullable().optional(),
  quantity: yup.number().nullable().optional(),
})

const createSchema = yup.object({
  truck: yup.string().required("Truck is required"),
  details: yup.array(detailSchema).min(1, "At least one compartment is required").required(),
})

const editSchema = yup.object({
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
          Compartment #{compartment.truck_compartment_number} — {compartment.total_compartment_volume.toLocaleString()}L
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
  const createDetails = useFieldArray({ control: createForm.control, name: "details" })
  const selectedTruck = createForm.watch("truck")

  // ── Edit form ──────────────────────────────────────────────────────────────

  const editForm = useForm<EditFormData>({
    resolver: yupResolver(editSchema),
    defaultValues: { details: [] },
  })
  const editDetails = useFieldArray({ control: editForm.control, name: "details" })

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
        details: (form.details ?? []).map((d) => ({
          truck_compartment_number: d.truck_compartment_number,
          silo_name: d.silo_name,
          flow_meter_start_reading: d.flow_meter_start_reading ?? null,
          flow_meter_end_reading: d.flow_meter_end_reading ?? null,
          quantity: d.quantity ?? null,
        })),
      })
    }
  }, [open, isCreate, form])

  // ── Fetch compartments when truck changes ──────────────────────────────────

  useEffect(() => {
    if (!selectedTruck) return
    dispatch(clearTruckCompartments())
    createDetails.replace([])
    dispatch(fetchTruckCompartments(selectedTruck))
  }, [selectedTruck])

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
          flow_meter_end_reading: d.flow_meter_end_reading ?? undefined,
          quantity: d.quantity ?? undefined,
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
        operator: typeof form.operator === "string"
          ? form.operator
          : `${(form.operator as any).first_name}`,
        truck: form.truck,
        details: data.details.map((d) => ({
          truck_compartment_number: d.truck_compartment_number,
          silo_name: d.silo_name,
          flow_meter_start_reading: d.flow_meter_start_reading ?? undefined,
          flow_meter_end_reading: d.flow_meter_end_reading ?? undefined,
          quantity: d.quantity ?? undefined,
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
    const existing = createDetails.fields.find(
      (f) => f.truck_compartment_number === comp.truck_compartment_number
    )
    if (existing) { toast.error("Compartment already added"); return }
    createDetails.append({
      truck_compartment_number: comp.truck_compartment_number,
      silo_name: "",
      flow_meter_start_reading: null,
      flow_meter_end_reading: null,
      quantity: null,
    })
  }

  // ── Detail row renderer ────────────────────────────────────────────────────

  const renderDetailRow = (
    idx: number,
    compartmentNumber: number,
    formObj: any,
    namePrefix: string,
    onRemove?: () => void
  ) => (
    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="font-light">
          Compartment #{compartmentNumber}
        </Badge>
        {onRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700 h-7 w-7 p-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Silo */}
      <div className="space-y-1">
        <Label className="text-xs">Destination Silo *</Label>
        <Controller
          name={`${namePrefix}.${idx}.silo_name` as any}
          control={formObj.control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={loadingSilos}>
              <SelectTrigger className="rounded-full border-gray-200 text-sm">
                <SelectValue placeholder={loadingSilos ? "Loading silos…" : "Select destination silo"} />
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
          <p className="text-xs text-red-500">{formObj.formState.errors.details[idx]?.silo_name?.message}</p>
        )}
      </div>

      {/* Flow meter readings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Start Reading <span className="text-gray-400">(optional)</span></Label>
          <Controller
            name={`${namePrefix}.${idx}.flow_meter_start_reading` as any}
            control={formObj.control}
            render={({ field }) => (
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 6493"
                className="rounded-full text-sm"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
              />
            )}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">End Reading <span className="text-gray-400">(optional)</span></Label>
          <Controller
            name={`${namePrefix}.${idx}.flow_meter_end_reading` as any}
            control={formObj.control}
            render={({ field }) => (
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 7550"
                className="rounded-full text-sm"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
              />
            )}
          />
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-1">
        <Label className="text-xs">Quantity (L) <span className="text-gray-400">(optional)</span></Label>
        <Controller
          name={`${namePrefix}.${idx}.quantity` as any}
          control={formObj.control}
          render={({ field }) => (
            <Input
              type="number"
              step="0.1"
              placeholder="e.g. 1000"
              className="rounded-full text-sm"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
            />
          )}
        />
      </div>
    </div>
  )

  // ── CREATE UI ──────────────────────────────────────────────────────────────

  if (isCreate) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="tablet-sheet-full p-0 bg-white">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="text-lg font-light">Create Raw Milk Intake Form</SheetTitle>
            <SheetDescription className="text-sm font-light">
              Select a truck, add compartments, and assign destination silos
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={createForm.handleSubmit(onCreateSubmit, onInvalid)}>
              <div className="p-6 space-y-6">
                <ProcessOverview />

                {/* Truck Select */}
                <div className="space-y-2">
                  <Label className="font-medium">Truck *</Label>
                  <Controller
                    name="truck"
                    control={createForm.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={operationLoading.fetchTrucks}
                      >
                        <SelectTrigger className="rounded-full border-gray-200">
                          <SelectValue placeholder={operationLoading.fetchTrucks ? "Loading trucks…" : "Select a truck"} />
                        </SelectTrigger>
                        <SelectContent>
                          {testedTrucks.map((t) => (
                            <SelectItem key={t.truck} value={t.truck}>
                              <span className="font-medium">{t.truck}</span>
                              <span className="text-gray-400 ml-2 text-xs">
                                {t.route} · {t.driver_first_name} {t.driver_last_name}
                              </span>
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

                {/* Available Compartments */}
                {selectedTruck && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Available Compartments</Label>
                      <span className="text-xs text-gray-400">Click + to add to form</span>
                    </div>
                    {operationLoading.fetchCompartments ? (
                      <div className="text-sm text-gray-500 text-center py-4">Loading compartments…</div>
                    ) : truckCompartments.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        No tested compartments found for this truck
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {truckCompartments.map((comp) => (
                          <div key={comp.truck_compartment_number} className="space-y-1">
                            <CompartmentInfoCard compartment={comp} />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full rounded-full text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => addCompartment(comp)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Compartment #{comp.truck_compartment_number} to form
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Added Compartment Details */}
                {createDetails.fields.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Compartment Details</Label>
                      <Badge variant="outline" className="font-normal text-xs">{createDetails.fields.length} added</Badge>
                    </div>
                    {createDetails.fields.map((field, idx) =>
                      renderDetailRow(
                        idx,
                        field.truck_compartment_number,
                        createForm,
                        "details",
                        () => createDetails.remove(idx)
                      )
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
          <SheetTitle className="text-lg font-light">Edit Raw Milk Intake Form</SheetTitle>
          <SheetDescription className="text-sm font-light">
            Update silo assignments and flow meter readings for each compartment
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={editForm.handleSubmit(onEditSubmit, onInvalid)}>
            <div className="p-6 space-y-6">
              {/* Summary card */}
              {form && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">{form.truck}</span>
                    <Badge variant="outline" className="text-xs font-normal ml-auto">{form.tag}</Badge>
                  </div>
                  <p className="text-xs text-blue-600">Operator: {operatorName}</p>
                </div>
              )}

              {/* Editable compartment details */}
              <div className="space-y-3">
                <Label className="font-medium">Compartment Details</Label>
                {editDetails.fields.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No compartment details available</p>
                ) : (
                  editDetails.fields.map((field, idx) =>
                    renderDetailRow(idx, field.truck_compartment_number, editForm, "details")
                  )
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
