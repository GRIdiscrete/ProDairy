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
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createBMTControlFormAction, updateBMTControlFormAction, fetchBMTControlForms } from "@/lib/store/slices/bmtControlFormSlice"
import { usersApi } from "@/lib/api/users"
import { siloApi } from "@/lib/api/silo"
import { toast } from "sonner"
import type { BMTControlForm } from "@/lib/api/bmt-control-form"
import { SignatureModal } from "@/components/ui/signature-modal"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { Plus, Trash2, Info } from "lucide-react"
import type { SearchableSelectOption } from "@/components/ui/searchable-select"

// ─── Schemas ──────────────────────────────────────────────────────────────────

/** Silo pair used in CREATE mode – just names */
const createPairSchema = yup.object({
  source_silo_name: yup.string().required("Source silo name is required"),
  destination_silo_name: yup.string().optional().nullable(),
})

/** Silo pair used in EDIT mode – names preserved + end reading editable */
const editPairSchema = yup.object({
  /** IDs come from the fetched record and are passed through silently */
  pair_id: yup.string().required(),
  source_silo_id: yup.string().required(),
  destination_silo_id: yup.string().optional().nullable(),

  source_silo_name: yup.string().required("Source silo name is required"),
  destination_silo_name: yup.string().optional().nullable(),

  /** The key PATCH field – records the milk movement */
  source_flow_meter_end_reading: yup
    .number()
    .typeError("End reading must be a number")
    .required("Flowmeter end reading is required for this silo")
    .positive("Must be a positive number"),

  // destination end reading is optional on patch
  destination_flow_meter_end_reading: yup
    .number()
    .optional()
    .nullable()
    .transform((v, o) => (o === "" ? undefined : v)),
})

const baseSchema = {
  dispatch_operator_id: yup.string().optional().nullable(),
  dispatch_operator_signature: yup.string().optional().nullable(),
  dpp_operator_id: yup.string().optional().nullable(),
  dpp_signature: yup.string().optional().nullable(),
  llm_operator_id: yup.string().optional().nullable(),
  llm_signature: yup.string().optional().nullable(),
  product: yup.string().required("Product is required"),
}

const createSchema = yup.object({
  ...baseSchema,
  /** Optional on POST */
  source_destination_details: yup.array().of(createPairSchema).optional(),
})

const editSchema = yup.object({
  ...baseSchema,
  /** Mandatory on PATCH */
  source_destination_details: yup
    .array()
    .of(editPairSchema)
    .min(1, "At least one silo pair is required when updating")
    .required(),
})

type CreatePair = yup.InferType<typeof createPairSchema>
type EditPair = yup.InferType<typeof editPairSchema>
type CreateFormData = yup.InferType<typeof createSchema>
type EditFormData = yup.InferType<typeof editSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface BMTControlFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: BMTControlForm | null
  mode: "create" | "edit"
}

// ─── Signature field helper ───────────────────────────────────────────────────

interface SignatureFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  error?: string | null
}

function SignatureField({ label, value, onChange, error }: SignatureFieldProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-2">
      <Label>{label} *</Label>
      {value ? (
        <img
          src={base64ToPngDataUrl(value)}
          alt={label}
          className="h-24 border border-gray-200 rounded-md bg-white object-contain"
        />
      ) : (
        <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-400 bg-white">
          No signature captured
        </div>
      )}
      <div className="flex items-center gap-2">
        <LoadingButton type="button" size="sm" onClick={() => setOpen(true)}>
          {value ? "Change" : "Add Signature"}
        </LoadingButton>
        {value && (
          <LoadingButton type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
            Clear
          </LoadingButton>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <SignatureModal
        open={open}
        onOpenChange={setOpen}
        title={`Capture ${label}`}
        onSave={(dataUrl) => {
          onChange(dataUrl)
          setOpen(false)
        }}
      />
    </div>
  )
}

// ─── Operators section (shared between create & edit) ─────────────────────────

interface OperatorsSectionProps {
  control: any
  errors: any
  users: SearchableSelectOption[]
}

function OperatorsSection({ control, errors, users }: OperatorsSectionProps) {
  const operatorFields: { id: keyof CreateFormData; sigId: keyof CreateFormData; label: string }[] = [
    { id: "dispatch_operator_id", sigId: "dispatch_operator_signature", label: "Dispatch Operator" },
    { id: "dpp_operator_id", sigId: "dpp_signature", label: "DPP Operator" },
    { id: "llm_operator_id", sigId: "llm_signature", label: "LLM Operator" },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Operators & Signatures</h3>
      {operatorFields.map(({ id, sigId, label }) => (
        <div key={id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
          <div className="space-y-2">
            <Label htmlFor={id}>{label} <span className="text-xs text-gray-400">(optional)</span></Label>
            <Controller
              name={id as any}
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger className="w-full rounded-full border-gray-200">
                    <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors[id] && <p className="text-sm text-red-500">{errors[id]?.message}</p>}
          </div>

          <Controller
            name={sigId as any}
            control={control}
            render={({ field }) => (
              <SignatureField
                label={`${label} Signature`}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors[sigId]?.message}
              />
            )}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BMTControlFormDrawer({ open, onOpenChange, form, mode }: BMTControlFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.bmtControlForms)

  const [users, setUsers] = useState<SearchableSelectOption[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [silos, setSilos] = useState<{ value: string; label: string }[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)

  // ── Load users + silos ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    setLoadingUsers(true)
    usersApi
      .getUsers()
      .then((res) =>
        setUsers(
          res.data?.map((u) => ({
            value: u.id,
            label: `${u.first_name} ${u.last_name}`,
            description: `${u.department} • ${u.email}`,
          })) ?? []
        )
      )
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoadingUsers(false))

    setLoadingSilos(true)
    siloApi
      .getSilos()
      .then((res) =>
        setSilos(
          res.data?.map((s: any) => ({ value: s.name, label: s.name })) ?? []
        )
      )
      .catch(() => toast.error("Failed to load silos"))
      .finally(() => setLoadingSilos(false))
  }, [open])

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE form
  // ─────────────────────────────────────────────────────────────────────────────

  const createForm = useForm<CreateFormData>({
    resolver: yupResolver(createSchema) as any,
    defaultValues: {
      dispatch_operator_id: "",
      dispatch_operator_signature: "",
      dpp_operator_id: "",
      dpp_signature: "",
      llm_operator_id: "",
      llm_signature: "",
      product: "",
      source_destination_details: [],
    },
  })

  const createPairs = useFieldArray({
    control: createForm.control,
    name: "source_destination_details",
  })

  // Reset create form when drawer opens in create mode
  useEffect(() => {
    if (open && mode === "create") {
      createForm.reset({
        dispatch_operator_id: "",
        dispatch_operator_signature: "",
        dpp_operator_id: "",
        dpp_signature: "",
        llm_operator_id: "",
        llm_signature: "",
        product: "",
        source_destination_details: [],
      })
    }
  }, [open, mode])

  const onCreateSubmit = async (data: CreateFormData) => {
    try {
      const pairs = (data.source_destination_details ?? []).filter((p) => p.source_silo_name)
      await dispatch(
        createBMTControlFormAction({
          dispatch_operator_id: data.dispatch_operator_id,
          dispatch_operator_signature: data.dispatch_operator_signature,
          dpp_operator_id: data.dpp_operator_id,
          dpp_signature: data.dpp_signature,
          llm_operator_id: data.llm_operator_id,
          llm_signature: data.llm_signature,
          product: data.product,
          ...(pairs.length > 0 && {
            source_destination_details: pairs.map((p) => ({
              source_silo_details: { silo_name: p.source_silo_name },
              ...(p.destination_silo_name
                ? { destination_silo_details: { silo_name: p.destination_silo_name } }
                : {}),
            })),
          }),
        })
      ).unwrap()

      toast.success("BMT Control Form created successfully")
      dispatch(fetchBMTControlForms()).catch(() => { })
      onOpenChange(false)
      createForm.reset()
    } catch (error: any) {
      toast.error(typeof error === "string" ? error : error?.message ?? "Failed to create BMT control form")
    }
  }

  const onCreateInvalid = (errs: any) => {
    const msgs = Object.values(errs)
      .map((e: any) => e?.message)
      .filter(Boolean)
    toast.error(`Please fix: ${msgs.join(", ")}`, { style: { background: "#ef4444", color: "white" } })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EDIT form
  // ─────────────────────────────────────────────────────────────────────────────

  const editForm = useForm<EditFormData>({
    resolver: yupResolver(editSchema) as any,
    defaultValues: {
      dispatch_operator_id: "",
      dispatch_operator_signature: "",
      dpp_operator_id: "",
      dpp_signature: "",
      llm_operator_id: "",
      llm_signature: "",
      product: "",
      source_destination_details: [],
    },
  })

  const editPairs = useFieldArray({
    control: editForm.control,
    name: "source_destination_details",
  })

  // Populate edit form from the fetched record
  useEffect(() => {
    if (!open || mode !== "edit" || !form) return

    const pairs: EditPair[] =
      (form.source_destination_details ?? []).map((p) => ({
        pair_id: p.id,
        source_silo_id: p.source_silo_details?.id ?? "",
        destination_silo_id: p.destination_silo_details?.id ?? null,
        source_silo_name: p.source_silo_details?.silo_name ?? "",
        destination_silo_name: p.destination_silo_details?.silo_name ?? null,
        source_flow_meter_end_reading: p.source_silo_details?.flow_meter_end_reading ?? ("" as any),
        destination_flow_meter_end_reading: p.destination_silo_details?.flow_meter_end_reading ?? null,
      })) ?? []

    editForm.reset({
      dispatch_operator_id: form.dispatch_operator_id ?? "",
      dispatch_operator_signature: form.dispatch_operator_signature ?? "",
      dpp_operator_id: form.dpp_operator_id ?? "",
      dpp_signature: form.dpp_signature ?? "",
      llm_operator_id: form.llm_operator_id ?? "",
      llm_signature: form.llm_signature ?? "",
      product: form.product ?? "",
      source_destination_details: pairs,
    })
  }, [open, mode, form])

  const onEditSubmit = async (data: EditFormData) => {
    if (!form) return
    try {
      await dispatch(
        updateBMTControlFormAction({
          id: form.id,
          dispatch_operator_id: data.dispatch_operator_id,
          dispatch_operator_signature: data.dispatch_operator_signature,
          dpp_operator_id: data.dpp_operator_id,
          dpp_signature: data.dpp_signature,
          llm_operator_id: data.llm_operator_id,
          llm_signature: data.llm_signature,
          product: data.product,
          source_destination_details: data.source_destination_details.map((p) => ({
            id: p.pair_id,
            source_silo_details: {
              id: p.source_silo_id,
              silo_name: p.source_silo_name,
              flow_meter_end_reading: Number(p.source_flow_meter_end_reading),
            },
            ...(p.destination_silo_id
              ? {
                destination_silo_details: {
                  id: p.destination_silo_id,
                  silo_name: p.destination_silo_name ?? "",
                  ...(p.destination_flow_meter_end_reading != null
                    ? { flow_meter_end_reading: Number(p.destination_flow_meter_end_reading) }
                    : {}),
                },
              }
              : {}),
          })),
        })
      ).unwrap()

      toast.success("BMT Control Form updated successfully")
      dispatch(fetchBMTControlForms()).catch(() => { })
      onOpenChange(false)
    } catch (error: any) {
      toast.error(typeof error === "string" ? error : error?.message ?? "Failed to update BMT control form")
    }
  }

  const onEditInvalid = (errs: any) => {
    const msgs = Object.values(errs)
      .map((e: any) => e?.message)
      .filter(Boolean)
    toast.error(`Please fix: ${msgs.join(", ")}`, { style: { background: "#ef4444", color: "white" } })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  const isCreate = mode === "create"
  const isLoading = isCreate ? operationLoading.create : operationLoading.update

  if (isCreate) {
    // ── CREATE UI ────────────────────────────────────────────────────────────
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="tablet-sheet-full p-0 bg-white overflow-y-auto max-h-screen">
          <div className="p-6">
            <SheetHeader>
              <SheetTitle>New BMT Control Form</SheetTitle>
              <SheetDescription>Create a new bulk milk transfer control record.</SheetDescription>
            </SheetHeader>

            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit, onCreateInvalid)}
              className="space-y-8 mt-6"
            >
              {/* Product */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product</h3>
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Controller
                    name="product"
                    control={createForm.control}
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
                  {createForm.formState.errors.product && (
                    <p className="text-sm text-red-500">{createForm.formState.errors.product.message}</p>
                  )}
                </div>
              </div>

              {/* Operators */}
              <OperatorsSection
                control={createForm.control}
                errors={createForm.formState.errors}
                users={users}
              />

              {/* Source-Destination Pairs (optional on POST) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Silo Pairs</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Optional — the backend will auto-generate flow meter readings on submission.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      createPairs.append({ source_silo_name: "", destination_silo_name: null })
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Pair
                  </Button>
                </div>

                {createPairs.fields.length === 0 && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      No silo pairs added. The backend will create default source-destination entries
                      automatically. You can add pairs here to specify silo names.
                    </span>
                  </div>
                )}

                {createPairs.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Pair {idx + 1}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => createPairs.remove(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Source silo select */}
                      <div className="space-y-1">
                        <Label className="flex items-center gap-1">
                          <span className="inline-flex w-5 h-5 rounded-full bg-blue-100 items-center justify-center text-xs font-bold text-blue-600">
                            S
                          </span>
                          Source Silo *
                        </Label>
                        <Controller
                          name={`source_destination_details.${idx}.source_silo_name`}
                          control={createForm.control}
                          render={({ field }) => {
                            const destName = createForm.watch(`source_destination_details.${idx}.destination_silo_name`)
                            return (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                                disabled={loadingSilos}
                              >
                                <SelectTrigger className="w-full rounded-full border-gray-200">
                                  <SelectValue placeholder={loadingSilos ? "Loading silos…" : "Select source silo"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {silos
                                    .filter((s) => s.value !== destName)
                                    .map((s) => (
                                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )
                          }}
                        />
                        {createForm.formState.errors.source_destination_details?.[idx]?.source_silo_name && (
                          <p className="text-sm text-red-500">
                            {createForm.formState.errors.source_destination_details[idx]?.source_silo_name?.message}
                          </p>
                        )}
                      </div>

                      {/* Destination silo select */}
                      <div className="space-y-1">
                        <Label className="flex items-center gap-1">
                          <span className="inline-flex w-5 h-5 rounded-full bg-green-100 items-center justify-center text-xs font-bold text-green-600">
                            D
                          </span>
                          Destination Silo{" "}
                          <span className="text-xs text-gray-400">(optional)</span>
                        </Label>
                        <Controller
                          name={`source_destination_details.${idx}.destination_silo_name`}
                          control={createForm.control}
                          render={({ field }) => {
                            const srcName = createForm.watch(`source_destination_details.${idx}.source_silo_name`)
                            return (
                              <Select
                                onValueChange={(val) => field.onChange(val === "__none__" ? null : val)}
                                value={field.value ?? "__none__"}
                                disabled={loadingSilos}
                              >
                                <SelectTrigger className="w-full rounded-full border-gray-200">
                                  <SelectValue placeholder={loadingSilos ? "Loading silos…" : "Select destination silo"} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">— None —</SelectItem>
                                  {silos
                                    .filter((s) => s.value !== srcName)
                                    .map((s) => (
                                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <LoadingButton
                loading={isLoading}
                disabled={isLoading}
                className="w-full rounded-full"
                type="submit"
              >
                Create BMT Control Form
              </LoadingButton>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // ── EDIT UI ────────────────────────────────────────────────────────────────
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white overflow-y-auto max-h-screen">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>Update BMT Control Form</SheetTitle>
            <SheetDescription>
              Record milk movement by entering the flowmeter end readings below.
              {form?.tag && (
                <span className="ml-1 font-medium text-gray-700">— {form.tag}</span>
              )}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={editForm.handleSubmit(onEditSubmit, onEditInvalid)}
            className="space-y-8 mt-6"
          >
            {/* Product */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product</h3>
              <div className="space-y-2">
                <Label>Product *</Label>
                <Controller
                  name="product"
                  control={editForm.control}
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
                {editForm.formState.errors.product && (
                  <p className="text-sm text-red-500">{editForm.formState.errors.product.message}</p>
                )}
              </div>
            </div>

            {/* Operators */}
            <OperatorsSection
              control={editForm.control}
              errors={editForm.formState.errors}
              users={users}
            />

            {/* Milk Movement – flowmeter end readings */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Record Milk Movement
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the flowmeter end reading for each source silo to record the amount of milk
                  transferred. The backend auto-generates the end timestamp.
                </p>
              </div>

              {editPairs.fields.length === 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    No source-destination pairs are attached to this record. Please check the backend
                    data.
                  </span>
                </div>
              )}

              {editPairs.fields.map((field, idx) => {
                const srcName = editForm.watch(`source_destination_details.${idx}.source_silo_name`)
                const dstName = editForm.watch(`source_destination_details.${idx}.destination_silo_name`)
                const hasDest = !!editForm.watch(
                  `source_destination_details.${idx}.destination_silo_id`
                )

                return (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <span className="inline-flex w-5 h-5 rounded-full bg-blue-100 items-center justify-center text-xs font-bold text-blue-600">
                        S
                      </span>
                      <span className="text-sm font-semibold text-gray-700">{srcName || "Source Silo"}</span>
                      {hasDest && (
                        <>
                          <span className="text-gray-400 text-xs">→</span>
                          <span className="inline-flex w-5 h-5 rounded-full bg-green-100 items-center justify-center text-xs font-bold text-green-600">
                            D
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {dstName || "Destination Silo"}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Source end reading */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Source Flowmeter End Reading *
                        </Label>
                        <p className="text-xs text-gray-400">
                          Current silo volume before the flowmeter stop (auto-set as start reading on
                          POST). Enter the final reading to close out this milk transfer.
                        </p>
                        <Controller
                          name={`source_destination_details.${idx}.source_flow_meter_end_reading`}
                          control={editForm.control}
                          render={({ field: f }) => (
                            <Input
                              type="number"
                              value={f.value === 0 ? "" : (f.value ?? "")}
                              onChange={(e) =>
                                f.onChange(e.target.value === "" ? "" : Number(e.target.value))
                              }
                              placeholder="Enter flowmeter end reading (e.g. 6200)"
                              className="rounded-full border-gray-200 max-w-sm"
                            />
                          )}
                        />
                        {editForm.formState.errors.source_destination_details?.[idx]
                          ?.source_flow_meter_end_reading && (
                            <p className="text-sm text-red-500">
                              {
                                editForm.formState.errors.source_destination_details[idx]
                                  ?.source_flow_meter_end_reading?.message
                              }
                            </p>
                          )}
                      </div>

                      {/* Destination end reading (optional) */}
                      {hasDest && (
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">
                            Destination Flowmeter End Reading{" "}
                            <span className="text-xs text-gray-400">(optional)</span>
                          </Label>
                          <Controller
                            name={`source_destination_details.${idx}.destination_flow_meter_end_reading`}
                            control={editForm.control}
                            render={({ field: f }) => (
                              <Input
                                type="number"
                                value={f.value === 0 ? "" : (f.value ?? "")}
                                onChange={(e) =>
                                  f.onChange(e.target.value === "" ? null : Number(e.target.value))
                                }
                                placeholder="Enter flowmeter end reading"
                                className="rounded-full border-gray-200 max-w-sm"
                              />
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Submit */}
            <LoadingButton
              loading={isLoading}
              disabled={isLoading}
              className="w-full rounded-full"
              type="submit"
            >
              Save BMT Control Form
            </LoadingButton>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
