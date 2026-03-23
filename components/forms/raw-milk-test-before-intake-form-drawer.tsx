"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { SignatureModal } from "@/components/ui/signature-modal"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
    createResultSlip,
    updateResultSlip,
    fetchUntestedCompartments,
} from "@/lib/store/slices/rawMilkTestBeforeIntakeSlice"
import { usersApi } from "@/lib/api/users"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import { base64ToPngDataUrl, normalizeDataUrlToBase64 } from "@/lib/utils/signature"
import { FlaskConical, Truck, User, Calendar, Clock } from "lucide-react"
import type { RawMilkResultSlipBeforeIntake, UntestedCompartment, UntestedCompartmentSupplier } from "@/lib/types"

// ─── Schema ─────────────────────────────────────────────────────────────────

const labTestEntrySchema = yup.object({
    id: yup.string().optional(),
    truck_compartment_number: yup.number().required(),
    temperature: yup.number().nullable(),
    time: yup.string().nullable(),
    ot: yup.string().nullable(),
    cob: yup.boolean().nullable(),
    alcohol: yup.number().nullable(),
    titratable_acidity: yup.number().nullable(),
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
    remark: yup.string().nullable(),
    pass: yup.boolean().default(false),
})

const schema = yup.object({
    truck_number: yup.string().required("Truck is required"),
    route: yup.string().nullable(),
    tag: yup.string().nullable(),
    date: yup.string().required("Date is required"),
    time_in: yup.string().nullable(),
    time_out: yup.string().nullable(),
    analyst: yup.string().nullable(),
    results_collected_by: yup.string().nullable(),
    approved_by: yup.string().nullable(),
    approver_signature: yup.string().nullable(),
    lab_test: yup.array().of(labTestEntrySchema).min(1, "At least one compartment result required").required(),
})

type LabTestEntry = yup.InferType<typeof labTestEntrySchema>
type FormData = yup.InferType<typeof schema>

// ─── Parameter Rows Definition ───────────────────────────────────────────────

type ParamType = "number" | "text" | "time" | "checkbox" | "textarea"

const PARAMETERS: { label: string; key: keyof LabTestEntry; type: ParamType; step?: string; placeholder?: string }[] = [
    { label: "Temperature (°C)", key: "temperature", type: "number", step: "0.1" },
    { label: "Time", key: "time", type: "time" },
    { label: "OT", key: "ot", type: "text", placeholder: "OK" },
    { label: "Clot On Boil", key: "cob", type: "checkbox" },
    { label: "Alcohol (%)", key: "alcohol", type: "number", step: "0.01" },
    { label: "Titratable Acidity", key: "titratable_acidity", type: "number", step: "0.01" },
    { label: "pH", key: "ph", type: "number", step: "0.01" },
    { label: "Resazurin", key: "resazurin", type: "text", placeholder: "OK" },
    { label: "Fat (%)", key: "fat", type: "number", step: "0.01" },
    { label: "Protein (%)", key: "protein", type: "number", step: "0.01" },
    { label: "LR/SNF", key: "lr_snf", type: "text" },
    { label: "Total Solids (%)", key: "total_solids", type: "number", step: "0.01" },
    { label: "FPD", key: "fpd", type: "number", step: "0.0001" },
    { label: "SCC", key: "scc", type: "number" },
    { label: "Density", key: "density", type: "number", step: "0.001" },
    { label: "Antibiotics", key: "antibiotics", type: "checkbox" },
    { label: "Starch", key: "starch", type: "checkbox" },
    { label: "Pass", key: "pass", type: "checkbox" },
    { label: "Remark", key: "remark", type: "textarea" },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const emptyLabEntry = (compartmentNumber: number): LabTestEntry => ({
    truck_compartment_number: compartmentNumber,
    temperature: null,
    time: "",
    ot: "",
    cob: false,
    alcohol: null,
    titratable_acidity: null,
    ph: null,
    resazurin: "",
    fat: null,
    protein: null,
    lr_snf: "",
    total_solids: null,
    fpd: null,
    scc: null,
    density: null,
    antibiotics: false,
    starch: false,
    remark: "",
    pass: false,
})

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: RawMilkResultSlipBeforeIntake | null
    mode: "create" | "edit"
    onSuccess?: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RawMilkTestBeforeIntakeFormDrawer({ open, onOpenChange, form: existingSlip, mode, onSuccess }: Props) {
    const dispatch = useAppDispatch()
    const { untestedCompartments, operationLoading } = useAppSelector((s) => s.rawMilkTestBeforeIntake)
    const currentUser = useAppSelector((state) => (state as any).auth.user)

    const [users, setUsers] = useState<SearchableSelectOption[]>([])
    const [roles, setRoles] = useState<SearchableSelectOption[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [loadingRoles, setLoadingRoles] = useState(false)
    const [signatureOpen, setSignatureOpen] = useState(false)
    const [expandedCompartments, setExpandedCompartments] = useState<Record<number, boolean>>({})
    // Prevents the selectedTruck watcher from wiping edit-mode data on initial reset
    const skipTruckEffect = useRef(false)

    // ── Derive unique trucks ──────────────────────────────────────────────────
    const uniqueTrucks = useMemo(() => {
        const map = new Map<string, UntestedCompartment[]>()
        untestedCompartments.forEach((c) => {
            const existing = map.get(c.truck) || []
            map.set(c.truck, [...existing, c])
        })
        return map
    }, [untestedCompartments])

    const truckOptions = useMemo(() => {
        const options = Array.from(uniqueTrucks.keys()).map((t) => ({ value: t, label: t }))

        // In edit mode, if the current truck is not in the untested list, add it
        if (mode === "edit" && existingSlip?.truck_number && !uniqueTrucks.has(existingSlip.truck_number)) {
            options.push({ value: existingSlip.truck_number, label: existingSlip.truck_number })
        }

        return options
    }, [uniqueTrucks, mode, existingSlip?.truck_number])

    // ── Form ─────────────────────────────────────────────────────────────────
    const formHook = useForm<FormData>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            truck_number: "",
            route: "",
            tag: "",
            date: new Date().toISOString().split("T")[0],
            time_in: "",
            time_out: "",
            analyst: currentUser?.id || "",
            results_collected_by: currentUser?.id || "",
            approved_by: "",
            approver_signature: "",
            lab_test: [],
        },
    })

    const { fields, replace } = useFieldArray({
        control: formHook.control,
        name: "lab_test",
    })

    const selectedTruck = formHook.watch("truck_number")

    // When truck changes, rebuild lab_test entries from compartments
    useEffect(() => {
        if (!selectedTruck) return

        // In edit mode, if we just loaded the original truck, skip the auto-replace
        // so we don't wipe the results that came from the reset() call.
        if (mode === "edit" && selectedTruck === existingSlip?.truck_number && fields.length > 0) {
            return
        }

        // Handle the manual skip flag (for the very first reset call)
        if (skipTruckEffect.current) {
            skipTruckEffect.current = false
            return
        }

        const compartments = uniqueTrucks.get(selectedTruck) || []

        // Only replace if we actually found compartments for an untested truck.
        // If we are in edit mode and the truck isn't in the untested list (common),
        // we shouldn't wipe the existing fields.
        if (compartments.length > 0) {
            // Set route from first compartment
            if (compartments[0]) formHook.setValue("route", compartments[0].route)
            // Build new entries
            replace(compartments.map((c) => emptyLabEntry(c.truck_compartment_number)))
        }
    }, [selectedTruck, uniqueTrucks, mode, existingSlip, fields.length])

    // ── Load data on open ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!open) return
        dispatch(fetchUntestedCompartments())
            ; (async () => {
                try {
                    setLoadingUsers(true)
                    const res = await usersApi.getUsers()
                    setUsers((res.data || []).map((u: any) => ({
                        value: u.id,
                        label: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
                        description: u.email,
                    })))
                } catch { toast.error("Failed to load users") }
                finally { setLoadingUsers(false) }
            })()
            ; (async () => {
                try {
                    setLoadingRoles(true)
                    const res = await rolesApi.getRoles()
                    setRoles((res.data || []).map((r: any) => ({
                        value: r.id,
                        label: r.role_name,
                        description: r.description || "",
                    })))
                } catch { toast.error("Failed to load roles") }
                finally { setLoadingRoles(false) }
            })()

        if (mode === "edit" && existingSlip) {
            const labTests = Array.isArray(existingSlip.lab_test) ? existingSlip.lab_test : []
            // Signal the selectedTruck watcher to skip the replace() so existing data is kept
            skipTruckEffect.current = true
            formHook.reset({
                truck_number: existingSlip.truck_number || "",
                route: existingSlip.route || "",
                tag: existingSlip.tag || "",
                date: existingSlip.date || new Date().toISOString().split("T")[0],
                time_in: existingSlip.time_in ? existingSlip.time_in.substring(0, 5) : "",
                time_out: existingSlip.time_out ? existingSlip.time_out.substring(0, 5) : "",
                analyst: existingSlip.analyst || "",
                results_collected_by: existingSlip.results_collected_by || "",
                approved_by: existingSlip.approved_by || "",
                approver_signature: existingSlip.approver_signature || "",
                lab_test: labTests.map((lt: any) => ({
                    id: lt.id,
                    truck_compartment_number: lt.truck_compartment_number ?? 1,
                    temperature: lt.temperature ?? null,
                    time: lt.time ? lt.time.substring(0, 5) : "",
                    ot: lt.ot ?? "",
                    cob: lt.cob ?? false,
                    alcohol: lt.alcohol ?? null,
                    titratable_acidity: lt.titratable_acidity ?? null,
                    ph: lt.ph ?? null,
                    resazurin: lt.resazurin ?? "",
                    fat: lt.fat ?? null,
                    protein: lt.protein ?? null,
                    lr_snf: lt.lr_snf ?? "",
                    total_solids: lt.total_solids ?? null,
                    fpd: lt.fpd ?? null,
                    scc: lt.scc ?? null,
                    density: lt.density ?? null,
                    antibiotics: lt.antibiotics ?? false,
                    starch: lt.starch ?? false,
                    remark: lt.remark ?? "",
                    pass: lt.pass ?? false,
                })),
            })
        } else {
            formHook.reset({
                truck_number: "", route: "", tag: "",
                date: new Date().toISOString().split("T")[0],
                time_in: "", time_out: "",
                analyst: "", results_collected_by: "",
                approved_by: "", approver_signature: "",
                lab_test: [],
            })
        }
    }, [open, mode, existingSlip])

    // ── Submit ────────────────────────────────────────────────────────────────
    const onSubmit = async (data: FormData) => {
        try {
            const formatTime = (t: string | null | undefined) => {
                if (!t) return "00:00:00.000000+00"
                const [h, m] = t.split(":")
                return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00.000000+00`
            }

            const labTestPayload = (data.lab_test || []).map((lt) => ({
                id: lt.id,
                truck_compartment_number: lt.truck_compartment_number,
                temperature: lt.temperature ? Number(lt.temperature) : null,
                time: lt.time && lt.time.trim() ? formatTime(lt.time) : null,
                ot: lt.ot || null,
                cob: Boolean(lt.cob),
                alcohol: lt.alcohol ? Number(lt.alcohol) : null,
                titratable_acidity: lt.titratable_acidity ? Number(lt.titratable_acidity) : null,
                ph: lt.ph ? Number(lt.ph) : null,
                resazurin: lt.resazurin || null,
                fat: lt.fat ? Number(lt.fat) : null,
                protein: lt.protein ? Number(lt.protein) : null,
                lr_snf: lt.lr_snf || null,
                total_solids: lt.total_solids ? Number(lt.total_solids) : null,
                fpd: lt.fpd ? Number(lt.fpd) : null,
                scc: lt.scc ? Number(lt.scc) : null,
                density: lt.density ? Number(lt.density) : null,
                antibiotics: Boolean(lt.antibiotics),
                starch: Boolean(lt.starch),
                remark: lt.remark || null,
                pass: Boolean(lt.pass),
            }))

            const payload = {
                date: data.date,
                time_in: data.time_in || null,
                time_out: data.time_out || null,
                approved_by: data.approved_by || null,
                approver_signature: data.approver_signature ? normalizeDataUrlToBase64(data.approver_signature) : null,
                analyst: data.analyst || currentUser?.id || "",
                results_collected_by: data.results_collected_by || currentUser?.id || "",
                truck_number: data.truck_number,
                route: data.route || null,
                lab_test: labTestPayload,
            }

            if (mode === "edit" && existingSlip) {
                await dispatch(updateResultSlip({ id: existingSlip.id, ...payload } as any)).unwrap()
                toast.success("Test result updated")
            } else {
                await dispatch(createResultSlip(payload as any)).unwrap()
                toast.success("Test result created")
            }
            onOpenChange(false)
            onSuccess?.()
        } catch (e: any) {
            toast.error(e?.message || e || "Failed to save test result")
        }
    }

    // ── Compartment info for selected truck ───────────────────────────────────
    const compartmentsForTruck = useMemo(
        () => uniqueTrucks.get(selectedTruck) || [],
        [uniqueTrucks, selectedTruck]
    )

    // Helper to render a cell input
    const renderCell = (colIdx: number, param: typeof PARAMETERS[0]) => {
        const fieldName = `lab_test.${colIdx}.${param.key}` as any
        return (
            <Controller
                key={fieldName}
                name={fieldName}
                control={formHook.control}
                render={({ field }) => {
                    switch (param.type) {
                        case "checkbox":
                            return (
                                <div className="flex justify-center">
                                    <Checkbox
                                        checked={field.value || false}
                                        onCheckedChange={field.onChange}
                                        className={param.key === "pass" ? "border-blue-400 data-[state=checked]:bg-blue-600" : ""}
                                    />
                                </div>
                            )
                        case "textarea":
                            return (
                                <Textarea
                                    {...field}
                                    value={field.value ?? ""}
                                    rows={2}
                                    className="text-xs min-w-[120px] resize-none"
                                />
                            )
                        case "time":
                            return (
                                <ShadcnTimePicker
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    className="h-8 text-xs min-w-[110px]"
                                />
                            )
                        default:
                            return (
                                <Input
                                    type={param.type}
                                    step={param.step}
                                    placeholder={param.placeholder ?? ""}
                                    {...field}
                                    value={field.value ?? ""}
                                    className="text-xs min-w-[90px]"
                                />
                            )
                    }
                }}
            />
        )
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="tablet-sheet-full p-0 bg-white min-w-[80vw] flex flex-col">

                    {/* ── Header ──────────────────────────────────────────── */}
                    <SheetHeader className="p-6 pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-blue-900">PRO dairy</div>
                            <div className="flex-1 text-center">
                                <SheetTitle className="text-lg font-semibold text-gray-800">
                                    RAW MILK RESULT SLIP — BEFORE INTAKE
                                </SheetTitle>
                                <SheetDescription className="text-sm font-light">
                                    {mode === "edit" ? "Edit existing test result" : "Record test results for untested compartments"}
                                </SheetDescription>
                                <div className="flex items-center justify-center gap-6 mt-3 text-[11px] text-gray-500 font-medium bg-gray-50/50 py-1.5 rounded-full border border-gray-100">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Date: <span className="text-gray-900">{formHook.watch("date")}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Analyst: <span className="text-gray-900">{currentUser?.first_name} {currentUser?.last_name}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Collected By: <span className="text-gray-900">{currentUser?.first_name} {currentUser?.last_name}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* ── Scrollable Body ──────────────────────────────────── */}
                    <div className="flex-1 overflow-y-auto">
                        <form id="test-before-intake-form" onSubmit={formHook.handleSubmit(onSubmit)} className="p-6 space-y-6">

                            {/* ── Truck Selection ─────────────────────────────── */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 text-blue-700">
                                    <Truck className="w-4 h-4" />
                                    <h3 className="text-base font-medium">Truck Selection</h3>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Truck */}
                                    <div className="space-y-1">
                                        <Label className="text-xs">Truck <span className="text-red-500">*</span></Label>
                                        <Controller
                                            name="truck_number"
                                            control={formHook.control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={operationLoading.fetchUntested}
                                                >
                                                    <SelectTrigger className="rounded-full text-xs">
                                                        <SelectValue placeholder={
                                                            operationLoading.fetchUntested ? "Loading..." :
                                                                untestedCompartments.length === 0 ? "No trucks" : "Select truck"
                                                        } />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {truckOptions.map((t) => (
                                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {formHook.formState.errors.truck_number && (
                                            <p className="text-[10px] text-red-500">{formHook.formState.errors.truck_number.message}</p>
                                        )}
                                    </div>

                                    {/* Route (auto) */}
                                    <div className="space-y-1">
                                        <Label className="text-xs">Route</Label>
                                        <Controller
                                            name="route"
                                            control={formHook.control}
                                            render={({ field }) => (
                                                <Input {...field} value={field.value ?? ""} className="rounded-full text-xs bg-gray-50" readOnly />
                                            )}
                                        />
                                    </div>

                                    {/* Tag */}
                                    {/* <div className="space-y-1">
                                        <Label className="text-xs">Tag / Reference</Label>
                                        <Controller
                                            name="tag"
                                            control={formHook.control}
                                            render={({ field }) => (
                                                <Input {...field} value={field.value ?? ""} placeholder="RMRSBI-1-15-1-2026" className="rounded-full text-xs" />
                                            )}
                                        />
                                    </div> */}

                                    {/* Compartment count badge */}
                                    {selectedTruck && (
                                        <div className="flex items-end pb-1">
                                            <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
                                                <Truck className="w-3 h-3" />
                                                {compartmentsForTruck.length} compartment(s)
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {compartmentsForTruck.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex gap-2 flex-wrap">
                                            {compartmentsForTruck.map((c, i) => {
                                                const isExpanded = expandedCompartments[i]
                                                const visibleSuppliers = isExpanded ? c.suppliers : c.suppliers?.slice(0, 3)
                                                const hasMore = c.suppliers && c.suppliers.length > 3

                                                return (
                                                    <div key={i} className="text-[10px] bg-blue-50 border border-blue-100 rounded-lg p-2 min-w-[200px]">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-semibold text-blue-700">Compartment #{c.truck_compartment_number}</span>
                                                            <span className="text-green-700 font-medium">{c.total_compartment_volume}L</span>
                                                        </div>
                                                        <div className="text-gray-500 mb-1">{c.route} · {c.driver_first_name} {c.driver_last_name}</div>

                                                        {c.suppliers && c.suppliers.length > 0 && (
                                                            <div className="border-t border-blue-100 pt-1 mt-1">
                                                                <div className="text-[9px] text-gray-400 font-medium uppercase mb-0.5">Suppliers:</div>
                                                                {visibleSuppliers?.map((s: UntestedCompartmentSupplier, si: number) => (
                                                                    <div key={si} className="text-[9px] text-gray-600 truncate">
                                                                        • {s.first_name} {s.last_name} ({s.volume}L) - {s.voucher}
                                                                    </div>
                                                                ))}
                                                                {hasMore && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setExpandedCompartments(prev => ({ ...prev, [i]: !prev[i] }))}
                                                                        className="text-[9px] text-blue-600 font-semibold hover:underline mt-1 focus:outline-none"
                                                                    >
                                                                        {isExpanded ? "Show Less" : `View ${c.suppliers.length - 3} More...`}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                            </div>

                            <Separator />

                            {/* ── Lab Results Table ────────────────────────────── */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-green-700">
                                    <FlaskConical className="w-4 h-4" />
                                    <h3 className="text-base font-medium">Laboratory Test Results</h3>
                                </div>

                                {fields.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400 border border-dashed rounded-lg text-sm">
                                        {selectedTruck ? (mode === "edit" ? "Loading existing test results..." : "Loading compartments...") : "Select a truck above to begin entering test results"}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto border border-gray-300 rounded-lg">
                                        <table className="min-w-full border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 min-w-[150px] sticky left-0 bg-gray-100 z-10">
                                                        Parameter
                                                    </th>
                                                    {fields.map((field, idx) => {
                                                        const compartmentInfo = compartmentsForTruck[idx]
                                                        return (
                                                            <th key={field.id} className="border border-gray-300 px-3 py-2 text-center font-semibold text-blue-700 min-w-[130px]">
                                                                <div>Result {idx + 1}</div>
                                                                <div className="text-gray-500 font-normal text-[10px]">
                                                                    Compartment #{field.truck_compartment_number}
                                                                    {compartmentInfo && (
                                                                        <span className="ml-1 text-gray-400">({compartmentInfo.total_compartment_volume}L)</span>
                                                                    )}
                                                                </div>
                                                            </th>
                                                        )
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {PARAMETERS.map((param, rowIdx) => (
                                                    <tr
                                                        key={param.key}
                                                        className={`${rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"} ${param.key === "pass" ? "bg-blue-50" : ""
                                                            }`}
                                                    >
                                                        <td className={`border border-gray-300 px-3 py-2 font-medium text-gray-700 sticky left-0 z-10 ${rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                            } ${param.key === "pass" ? "!bg-blue-50 text-blue-700" : ""}`}>
                                                            {param.label}
                                                        </td>
                                                        {fields.map((_, colIdx) => (
                                                            <td key={colIdx} className="border border-gray-300 px-2 py-1.5">
                                                                {renderCell(colIdx, param)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 text-purple-700">
                                    <User className="w-4 h-4" />
                                    <h3 className="text-base font-medium">Administration & Personnel</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs"><Clock className="inline w-3 h-3 mr-1" />Time In</Label>
                                        <Controller name="time_in" control={formHook.control} render={({ field }) => (
                                            <ShadcnTimePicker value={field.value ?? ""} onChange={field.onChange} />
                                        )} />
                                        {formHook.formState.errors.time_in && <p className="text-[10px] text-red-500">{formHook.formState.errors.time_in.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs"><Clock className="inline w-3 h-3 mr-1" />Time Out</Label>
                                        <Controller name="time_out" control={formHook.control} render={({ field }) => (
                                            <ShadcnTimePicker value={field.value ?? ""} onChange={field.onChange} />
                                        )} />
                                        {formHook.formState.errors.time_out && <p className="text-[10px] text-red-500">{formHook.formState.errors.time_out.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Approved By (Role)</Label>
                                        <Controller name="approved_by" control={formHook.control} render={({ field, fieldState }) => (
                                            <>
                                                <SearchableSelect options={roles} value={field.value ?? ""} onValueChange={field.onChange} placeholder="Select approver role" loading={loadingRoles} />
                                                {fieldState.error && <p className="text-[10px] text-red-500">{fieldState.error.message}</p>}
                                            </>
                                        )} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Approver Signature</Label>
                                        <Controller name="approver_signature" control={formHook.control} render={({ field, fieldState }) => (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    {field.value ? (
                                                        <img src={base64ToPngDataUrl(field.value)} alt="Signature" className="h-10 border rounded bg-white" />
                                                    ) : (
                                                        <div className="h-10 w-full border border-dashed rounded flex items-center justify-center text-[10px] text-gray-400">
                                                            Capture needed
                                                        </div>
                                                    )}
                                                    <Button type="button" size="sm" variant="outline" className="rounded-full shrink-0" onClick={() => setSignatureOpen(true)}>
                                                        {field.value ? "Change" : "Capture"}
                                                    </Button>
                                                </div>
                                                {fieldState.error && <p className="text-[10px] text-red-500">{fieldState.error.message}</p>}
                                            </>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* ── Footer ──────────────────────────────────────────────── */}
                    <div className="p-6 border-t flex justify-end space-x-3 bg-gray-50 shrink-0">
                        <Button type="button" variant="outline" className="rounded-full px-8" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="test-before-intake-form"
                            className="rounded-full px-10 bg-blue-600 hover:bg-blue-700"
                            disabled={operationLoading.create || operationLoading.update}
                        >
                            {mode === "edit" ? "Update Result Slip" : "Submit Results"}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Signature Modal */}
            <SignatureModal
                open={signatureOpen}
                onOpenChange={setSignatureOpen}
                onSave={(sig) => formHook.setValue("approver_signature", sig)}
            />
        </>
    )
}
