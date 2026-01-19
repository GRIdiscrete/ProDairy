"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { SignatureModal } from "@/components/ui/signature-modal"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Plus,
    Truck,
    Save,
    Beaker,
    User,
    FlaskConical,
    ClipboardList,
    Calendar,
    Clock,
    CheckCircle2
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
    createResultSlip,
    updateResultSlip
} from "@/lib/store/slices/rawMilkTestBeforeIntakeSlice"
import { fetchCollectionVouchers } from "@/lib/store/slices/collectionVoucherSlice"
import { fetchTankers } from "@/lib/store/slices/tankerSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { RawMilkResultSlipBeforeIntake } from "@/lib/types"
import { toast } from "sonner"
import { normalizeDataUrlToBase64, base64ToPngDataUrl } from "@/lib/utils/signature"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { rolesApi } from "@/lib/api/roles"
import { UserRole, UserRoleResponse } from "@/lib/types/roles"

// Validation Schema
const rawMilkTestBeforeIntakeSchema = yup.object({
    voucher_id: yup.string().required("Collection voucher is required"),
    truck_compartment_number: yup.number().required("Compartment number is required").min(1, "Must be at least 1"),
    date: yup.string().required("Date is required"),
    time_in: yup.string().required("Time in is required"),
    time_out: yup.string().required("Time out is required"),
    approved_by: yup.string().required("Approved by is required"),
    approver_signature: yup.string().required("Approver signature is required"),
    analyst: yup.string().required("Analyst is required"),
    results_collected_by: yup.string().required("Results collected by is required"),
    tag: yup.string().required("Tag is required"),
    lab_test: yup.object({
        temperature: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
        time: yup.string().required("Lab test time is required"),
        ot: yup.string().nullable().default("OK"),
        cob: yup.boolean().nullable().default(false),
        alcohol: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
        titratable_acidity: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
        ph: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
        resazurin: yup.string().nullable().default("OK"),
        fat: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
        protein: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
        lr_snf: yup.string().nullable(),
        total_solids: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
        fpd: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
        scc: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
        density: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
        antibiotics: yup.boolean().nullable().default(false),
        starch: yup.boolean().nullable().default(false),
        remark: yup.string().nullable(),
        pass: yup.boolean().required("Pass result is required"),
    })
})

type RawMilkTestBeforeIntakeFormData = yup.InferType<typeof rawMilkTestBeforeIntakeSchema>

interface RawMilkTestBeforeIntakeFormDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    form?: RawMilkResultSlipBeforeIntake | null
    mode: "create" | "edit"
}

export function RawMilkTestBeforeIntakeFormDrawer({
    open,
    onOpenChange,
    form,
    mode = "create"
}: RawMilkTestBeforeIntakeFormDrawerProps) {
    const dispatch = useAppDispatch()
    const { operationLoading } = useAppSelector((state) => state.rawMilkTestBeforeIntake)
    const { collectionVouchers } = useAppSelector((state) => state.collectionVoucher)
    const { items: tankers } = useAppSelector((state) => state.tankers)
    const { items: users } = useAppSelector((state) => state.users)
    const { user, profile } = useAppSelector((state) => state.auth)

    const [signatureOpen, setSignatureOpen] = useState(false)
    const [signatureViewOpen, setSignatureViewOpen] = useState(false)
    const [roles, setRoles] = useState<UserRoleResponse[]>([])
    const [rolesLoading, setRolesLoading] = useState(false)

    const formHook = useForm<RawMilkTestBeforeIntakeFormData>({
        resolver: yupResolver(rawMilkTestBeforeIntakeSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            time_in: "08:00:00",
            time_out: "12:00:00",
            lab_test: {
                temperature: null as any,
                ph: null as any,
                density: null as any,
                ot: "",
                alcohol: null as any,
                fat: null as any,
                protein: null as any,
                resazurin: "",
                lr_snf: "",
                total_solids: null as any,
                fpd: null as any,
                scc: null as any,
                titratable_acidity: null as any,
                time: new Date().toISOString(),
                cob: false,
                antibiotics: false,
                starch: false,
                pass: true,
                remark: ""
            }
        },
    })

    const selectedVoucherId = formHook.watch("voucher_id")
    const selectedVoucher = collectionVouchers.find(v => v.id === selectedVoucherId)
    const associatedTanker = tankers.find((t: any) => t.reg_number === selectedVoucher?.truck_number)
    const compartmentsCount = associatedTanker?.compartments || 0

    useEffect(() => {
        if (open) {
            dispatch(fetchCollectionVouchers({}))
            dispatch(fetchTankers())
            dispatch(fetchUsers({}))

            const loadRoles = async () => {
                try {
                    setRolesLoading(true)
                    const res = await rolesApi.getRoles()
                    setRoles(res.data)
                } catch (err) {
                    toast.error("Failed to load roles")
                } finally {
                    setRolesLoading(false)
                }
            }
            loadRoles()
        }
    }, [open, dispatch])

    useEffect(() => {
        if (open) {
            if (mode === "edit" && form) {
                formHook.reset({
                    voucher_id: form.voucher_id,
                    truck_compartment_number: form.truck_compartment_number,
                    date: form.date,
                    time_in: form.time_in,
                    time_out: form.time_out,
                    approved_by: form.approved_by,
                    approver_signature: form.approver_signature,
                    analyst: form.analyst,
                    results_collected_by: form.results_collected_by,
                    tag: form.tag,
                    lab_test: {
                        temperature: form.lab_test?.temperature ?? null,
                        time: form.lab_test?.time || new Date().toISOString(),
                        ot: form.lab_test?.ot ?? null,
                        cob: form.lab_test?.cob ?? null,
                        alcohol: form.lab_test?.alcohol ?? null,
                        titratable_acidity: form.lab_test?.titratable_acidity ?? null,
                        ph: form.lab_test?.ph ?? null,
                        resazurin: form.lab_test?.resazurin ?? null,
                        fat: form.lab_test?.fat ?? null,
                        protein: form.lab_test?.protein ?? null,
                        lr_snf: form.lab_test?.lr_snf ?? null,
                        total_solids: form.lab_test?.total_solids ?? null,
                        fpd: form.lab_test?.fpd ?? null,
                        scc: form.lab_test?.scc ?? null,
                        density: form.lab_test?.density ?? null,
                        antibiotics: form.lab_test?.antibiotics ?? null,
                        starch: form.lab_test?.starch ?? null,
                        remark: form.lab_test?.remark ?? null,
                        pass: form.lab_test?.pass ?? true,
                    }
                })
            } else {
                formHook.reset({
                    date: new Date().toISOString().split('T')[0],
                    time_in: "08:00:00",
                    time_out: "12:00:00",
                    approved_by: profile?.role_id || "",
                    approver_signature: "",
                    analyst: user?.id || "",
                    results_collected_by: user?.id || "",
                    tag: `RMCVBI-${Math.floor(Math.random() * 1000)}-${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
                    lab_test: {
                        temperature: null as any,
                        ph: null as any,
                        density: null as any,
                        ot: "",
                        alcohol: null as any,
                        fat: null as any,
                        protein: null as any,
                        resazurin: "",
                        lr_snf: "",
                        total_solids: null as any,
                        fpd: null as any,
                        scc: null as any,
                        titratable_acidity: null as any,
                        time: new Date().toISOString(),
                        cob: false,
                        antibiotics: false,
                        starch: false,
                        pass: true,
                        remark: ""
                    }
                })
            }
        }
    }, [open, mode, form, user, profile])

    const onSubmit = async (data: RawMilkTestBeforeIntakeFormData) => {
        try {
            // Helper function to format time to HH:MM:SS.000000+00
            const formatTime = (timeInput: string | null | undefined): string => {
                if (!timeInput) return "00:00:00.000000+00"

                // Extract HH, MM, and optionally SS using regex to ignore offsets or extra precision in input
                const match = String(timeInput).match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/)
                if (match) {
                    const hh = match[1].padStart(2, '0')
                    const mm = match[2].padStart(2, '0')
                    const ss = (match[3] || "00").padStart(2, '0')
                    return `${hh}:${mm}:${ss}.000000+00`
                }

                return "00:00:00.000000+00"
            }

            const payload = {
                ...data,
                time_in: formatTime(data.time_in),
                time_out: formatTime(data.time_out),
                approver_signature: normalizeDataUrlToBase64(data.approver_signature),
                lab_test: {
                    ...data.lab_test,
                    time: formatTime(data.lab_test.time),
                    temperature: data.lab_test.temperature ?? null,
                    ph: data.lab_test.ph ?? null,
                    density: data.lab_test.density ?? null,
                    alcohol: data.lab_test.alcohol ?? null,
                    fat: data.lab_test.fat ?? null,
                    protein: data.lab_test.protein ?? null,
                    total_solids: data.lab_test.total_solids ?? null,
                    fpd: data.lab_test.fpd ?? null,
                    scc: data.lab_test.scc ?? null,
                    titratable_acidity: data.lab_test.titratable_acidity ?? null,
                    ot: data.lab_test.ot ?? null,
                    resazurin: data.lab_test.resazurin ?? null,
                    lr_snf: data.lab_test.lr_snf ?? null,
                    remark: data.lab_test.remark ?? null,
                    cob: data.lab_test.cob ?? false,
                    antibiotics: data.lab_test.antibiotics ?? false,
                    starch: data.lab_test.starch ?? false,
                }
            }

            if (mode === "edit" && form) {
                await dispatch(updateResultSlip({ ...payload, id: form.id, lab_test: { ...payload.lab_test, id: form.lab_test.id } })).unwrap()
                toast.success("Result slip updated successfully")
            } else {
                await dispatch(createResultSlip(payload)).unwrap()
                toast.success("Result slip created successfully")
            }
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error || "Failed to save result slip")
        }
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="tablet-sheet-full p-0 bg-white min-w-[70vw]">
                    <SheetHeader className="p-6 pb-0">
                        <SheetTitle className="text-2xl font-light">
                            {mode === "edit" ? "Edit Test Before Intake" : "New Test Before Intake"}
                        </SheetTitle>
                        <SheetDescription className="text-sm font-light text-gray-500">
                            Conduct a laboratory test on a tanker compartment before milk intake.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 h-[calc(100vh-140px)]">
                        <form id="test-before-intake-form" onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-8 pb-10">

                            {/* Reference Information */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 text-blue-600">
                                    <ClipboardList className="w-5 h-5" />
                                    <h3 className="text-lg font-light">Voucher & Compartment</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Collection Voucher</Label>
                                        <Controller
                                            name="voucher_id"
                                            control={formHook.control}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    options={collectionVouchers.map(v => ({
                                                        value: v.id,
                                                        label: v.tag ?? v.id,
                                                        description: `Truck: ${v.truck_number} • Date: ${new Date(v.date).toLocaleDateString()}`
                                                    }))}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder="Select voucher"
                                                />
                                            )}
                                        />
                                        {formHook.formState.errors.voucher_id && (
                                            <p className="text-xs text-red-500">{formHook.formState.errors.voucher_id.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Truck Compartment</Label>
                                        <Controller
                                            name="truck_compartment_number"
                                            control={formHook.control}
                                            render={({ field }) => (
                                                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                                    <SelectTrigger className="rounded-full">
                                                        <SelectValue placeholder="Select compartment" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: compartmentsCount || 1 }).map((_, i) => (
                                                            <SelectItem key={i + 1} value={String(i + 1)}>Compartment {i + 1}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {formHook.formState.errors.truck_compartment_number && (
                                            <p className="text-xs text-red-500">{formHook.formState.errors.truck_compartment_number.message}</p>
                                        )}
                                        {!selectedVoucherId && <p className="text-[10px] text-orange-500">Select a voucher first</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tag / Reference</Label>
                                        <Controller
                                            name="tag"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} placeholder="e.g. RMRSBI-1-15-1-2026" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.tag && (
                                            <p className="text-xs text-red-500">{formHook.formState.errors.tag.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Lab Test Results */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 text-green-600">
                                    <FlaskConical className="w-5 h-5" />
                                    <h3 className="text-lg font-light">Laboratory Test Results</h3>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>Temperature (°C)</Label>
                                        <Controller
                                            name="lab_test.temperature"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} type="number" step="0.1" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.temperature && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.temperature.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>PH</Label>
                                        <Controller
                                            name="lab_test.ph"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} type="number" step="0.01" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.ph && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.ph.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Density</Label>
                                        <Controller
                                            name="lab_test.density"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} type="number" step="0.001" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.density && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.density.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Organoleptic (OT)</Label>
                                        <Controller
                                            name="lab_test.ot"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder="OK" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.ot && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.ot.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>Alcohol (%)</Label>
                                        <Controller
                                            name="lab_test.alcohol"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} type="number" step="0.01" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.alcohol && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.alcohol.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fat Content (%)</Label>
                                        <Controller
                                            name="lab_test.fat"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} type="number" step="0.01" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.fat && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.fat.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Protein Content (%)</Label>
                                        <Controller
                                            name="lab_test.protein"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} type="number" step="0.01" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.protein && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.protein.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Resazurin</Label>
                                        <Controller
                                            name="lab_test.resazurin"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder="OK" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.resazurin && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.resazurin.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>LR/SNF</Label>
                                        <Controller
                                            name="lab_test.lr_snf"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder="Enter LR/SNF" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.lr_snf && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.lr_snf.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total Solids (%)</Label>
                                        <Controller
                                            name="lab_test.total_solids"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} type="number" step="0.01" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.total_solids && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.total_solids.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>FPD</Label>
                                        <Controller
                                            name="lab_test.fpd"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} type="number" step="0.0001" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.fpd && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.fpd.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SCC</Label>
                                        <Controller
                                            name="lab_test.scc"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} type="number" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.scc && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.scc.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>Titratable Acidity</Label>
                                        <Controller
                                            name="lab_test.titratable_acidity"
                                            control={formHook.control}
                                            render={({ field }) => <Input {...field} value={field.value ?? ""} type="number" step="0.01" className="rounded-full" />}
                                        />
                                        {formHook.formState.errors.lab_test?.titratable_acidity && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.titratable_acidity.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                    <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <Controller
                                            name="lab_test.cob"
                                            control={formHook.control}
                                            render={({ field }) => <Checkbox id="cob" checked={field.value || false} onCheckedChange={field.onChange} />}
                                        />
                                        <Label htmlFor="cob" className="cursor-pointer">COB Positive</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <Controller
                                            name="lab_test.antibiotics"
                                            control={formHook.control}
                                            render={({ field }) => <Checkbox id="antibiotics" checked={field.value || false} onCheckedChange={field.onChange} />}
                                        />
                                        <Label htmlFor="antibiotics" className="cursor-pointer">Antibiotics Detect</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <Controller
                                            name="lab_test.starch"
                                            control={formHook.control}
                                            render={({ field }) => <Checkbox id="starch" checked={field.value || false} onCheckedChange={field.onChange} />}
                                        />
                                        <Label htmlFor="starch" className="cursor-pointer">Starch Detect</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                        <Controller
                                            name="lab_test.pass"
                                            control={formHook.control}
                                            render={({ field }) => <Checkbox id="pass" checked={field.value} onCheckedChange={field.onChange} />}
                                        />
                                        <Label htmlFor="pass" className="cursor-pointer text-blue-700 font-medium">Result PASS</Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Analyst Remarks</Label>
                                    <Controller
                                        name="lab_test.remark"
                                        control={formHook.control}
                                        render={({ field }) => <Textarea {...field} value={field.value ?? ""} className="min-h-[80px]" />}
                                    />
                                    {formHook.formState.errors.lab_test?.remark && <p className="text-xs text-red-500">{formHook.formState.errors.lab_test.remark.message}</p>}
                                </div>
                            </div>

                            <Separator />

                            {/* Administrative Information */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 text-purple-600">
                                    <User className="w-5 h-5" />
                                    <h3 className="text-lg font-light">Administration & Personnel</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label><Calendar className="inline w-3 h-3 mr-1" /> Date</Label>
                                            <Controller
                                                name="date"
                                                control={formHook.control}
                                                render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
                                            />
                                            {formHook.formState.errors.date && <p className="text-xs text-red-500">{formHook.formState.errors.date.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label><Clock className="inline w-3 h-3 mr-1" /> Time In</Label>
                                            <Controller
                                                name="time_in"
                                                control={formHook.control}
                                                render={({ field }) => <Input type="time" {...field} className="rounded-full" />}
                                            />
                                            {formHook.formState.errors.time_in && <p className="text-xs text-red-500">{formHook.formState.errors.time_in.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label><Clock className="inline w-3 h-3 mr-1" /> Time Out</Label>
                                            <Controller
                                                name="time_out"
                                                control={formHook.control}
                                                render={({ field }) => <Input type="time" {...field} className="rounded-full" />}
                                            />
                                            {formHook.formState.errors.time_out && <p className="text-xs text-red-500">{formHook.formState.errors.time_out.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-4 col-span-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Analyst</Label>
                                                <Controller
                                                    name="analyst"
                                                    control={formHook.control}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger className="rounded-full">
                                                                <SelectValue placeholder="Select analyst" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {users.map(u => (
                                                                    <SelectItem key={u.id} value={u.id}>{u.first_name} {u.last_name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {formHook.formState.errors.analyst && <p className="text-xs text-red-500">{formHook.formState.errors.analyst.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Results Collected By</Label>
                                                <Controller
                                                    name="results_collected_by"
                                                    control={formHook.control}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger className="rounded-full">
                                                                <SelectValue placeholder="Select person" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {users.map(u => (
                                                                    <SelectItem key={u.id} value={u.id}>{u.first_name} {u.last_name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {formHook.formState.errors.results_collected_by && <p className="text-xs text-red-500">{formHook.formState.errors.results_collected_by.message}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Approved By (Role)</Label>
                                                <Controller
                                                    name="approved_by"
                                                    control={formHook.control}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onValueChange={field.onChange} disabled={rolesLoading}>
                                                            <SelectTrigger className="rounded-full">
                                                                <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select approver role"} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {roles.map(r => (
                                                                    <SelectItem key={r.id} value={r.id}>{r.role_name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {formHook.formState.errors.approved_by && <p className="text-xs text-red-500">{formHook.formState.errors.approved_by.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Approver Signature</Label>
                                                <Controller
                                                    name="approver_signature"
                                                    control={formHook.control}
                                                    render={({ field }) => (
                                                        <div className="flex items-center space-x-2">
                                                            {field.value ? (
                                                                <img src={base64ToPngDataUrl(field.value)} alt="Signature" className="h-10 border rounded bg-white" />
                                                            ) : (
                                                                <div className="h-10 w-full border border-dashed rounded flex items-center justify-center text-[10px] text-gray-400">Capture needed</div>
                                                            )}
                                                            <Button type="button" size="sm" variant="outline" className="rounded-full shrink-0" onClick={() => setSignatureOpen(true)}>
                                                                {field.value ? "Change" : "Capture"}
                                                            </Button>
                                                        </div>
                                                    )}
                                                />
                                                {formHook.formState.errors.approver_signature && (
                                                    <p className="text-xs text-red-500">{formHook.formState.errors.approver_signature.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t flex justify-end space-x-3 bg-gray-50">
                        <Button type="button" variant="outline" className="rounded-full px-8" onClick={() => onOpenChange(false)}>Cancel</Button>
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

            <SignatureModal
                open={signatureOpen}
                onOpenChange={setSignatureOpen}
                title="Approver Signature"
                onSave={(dataUrl) => formHook.setValue("approver_signature", dataUrl, { shouldValidate: true })}
            />
        </>
    )
}
