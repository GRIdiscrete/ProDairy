"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Truck, User, ClipboardList, Beaker, FileSignature, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { SignatureModal } from "@/components/ui/signature-modal"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createCollectionVoucher, updateCollectionVoucher, fetchCollectionVouchers } from "@/lib/store/slices/collectionVoucherSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchSuppliers } from "@/lib/store/slices/supplierSlice"
import { fetchTankers } from "@/lib/store/slices/tankerSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import { LocalStorageService } from "@/lib/offline/local-storage-service"
import { useNetworkStatus } from "@/hooks/use-network-status"
import type { CollectionVoucher2, SupplierTank } from "@/lib/types"

const collectionVoucherSchema = yup.object({
    driver: yup.string().required("Driver is required"),
    date: yup.string().required("Date is required"),
    route: yup.string().required("Route is required"),
    supplier: yup.string().required("Supplier is required"),
    truck_number: yup.string().required("Truck number is required"),
    time_in: yup.string().required("Time in is required"),
    time_out: yup.string().required("Time out is required"),
    details: yup.array().of(
        yup.object({
            id: yup.string().optional(),
            supplier_tanks: yup.array().of(
                yup.object({
                    id: yup.string().optional(),
                    supplier_tank_id: yup.string().required("Tank is required"),
                    truck_compartment_number: yup.number().required("Compartment is required"),
                    temperature: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
                    dip_reading: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
                    meter_start: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
                    meter_finish: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
                    volume: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
                    dairy_total: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
                    lab_test: yup.object({
                        id: yup.string().optional(),
                        ot_result: yup.string().optional(),
                        cob_result: yup.boolean().default(false),
                        organoleptic: yup.string().optional(),
                        alcohol: yup.string().optional(),
                    })
                })
            ).min(1, "At least one tank is required")
        })
    ).min(1, "At least one detail is required"),
    remark: yup.string(),
    driver_signature: yup.string().required("Driver signature is required"),
})

type CollectionVoucherFormData = yup.InferType<typeof collectionVoucherSchema>

interface CollectionVoucherFormDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    collectionVoucher?: CollectionVoucher2
    mode: "create" | "edit"
    onSuccess?: () => void
}

export function CollectionVoucherFormDrawer({
    open,
    onOpenChange,
    collectionVoucher,
    mode,
    onSuccess
}: CollectionVoucherFormDrawerProps) {
    const [loading, setLoading] = useState(false)
    const [signatureOpen, setSignatureOpen] = useState(false)
    const dispatch = useAppDispatch()
    const isMobile = useIsMobile()
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024
    const { isOnline } = useNetworkStatus()

    const { operationLoading } = useAppSelector((state) => state.collectionVoucher)
    const { items: users } = useAppSelector((state) => state.users)
    const { suppliers } = useAppSelector((state) => state.supplier)
    const { items: tankers } = useAppSelector((state) => state.tankers)
    const { user } = useAppSelector((state) => state.auth)

    // Offline data state
    const [offlineData, setOfflineData] = useState(() => {
        if (typeof window === 'undefined') {
            return { drivers: [], suppliers: [], tankers: [] }
        }
        return {
            drivers: LocalStorageService.getDrivers() || [],
            suppliers: LocalStorageService.getSuppliers() || [],
            tankers: LocalStorageService.getTankers() || []
        }
    })

    // Use online data if available, fallback to offline
    const displayUsers = (isOnline && users && users.length > 0) ? users : offlineData.drivers
    const displaySuppliers = (isOnline && suppliers && suppliers.length > 0) ? suppliers : offlineData.suppliers
    const displayTankers = (isOnline && tankers && tankers.length > 0) ? tankers : offlineData.tankers

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
        reset,
    } = useForm<CollectionVoucherFormData>({
        resolver: yupResolver(collectionVoucherSchema) as any,
        defaultValues: {
            driver: user?.id || "",
            date: "",
            route: "",
            supplier: "",
            truck_number: "",
            time_in: "",
            time_out: "",
            details: [
                {
                    supplier_tanks: []
                }
            ],
            remark: "",
            driver_signature: "",
        },
    })

    const { fields: detailsFields, append: appendDetail, remove: removeDetail, replace: replaceDetails } = useFieldArray({
        control,
        name: "details"
    })

    const { fields: labTestFields } = useFieldArray({
        control,
        name: "lab_test"
    })

    const selectedTruckNumber = watch("truck_number")
    const selectedTanker = displayTankers?.find((t: any) => t.reg_number === selectedTruckNumber)
    const compartmentCount = selectedTanker?.compartments || 0
    const selectedSupplierId = watch("supplier")
    const selectedSupplier = displaySuppliers?.find(s => s.id === selectedSupplierId)
    const supplierTankCount = selectedSupplier?.number_of_tanks || 0

    // Auto-sync tanks when supplier changes
    useEffect(() => {
        if (selectedSupplier && mode === "create") {
            const tanks = selectedSupplier.suppliers_tanks || []

            // Assuming one detail group for now
            const currentTanks = watch("details.0.supplier_tanks") || []
            if (currentTanks.length === 0 && tanks.length > 0) {
                const newTanks = tanks.map((tank: any, i: number) => ({
                    supplier_tank_id: tank.id,
                    truck_compartment_number: (i + 1) <= compartmentCount ? (i + 1) : 1,
                    temperature: "" as any,
                    dip_reading: "" as any,
                    meter_start: "" as any,
                    meter_finish: "" as any,
                    volume: "" as any,
                    dairy_total: "" as any,
                    lab_test: {
                        ot_result: "",
                        cob_result: false,
                        organoleptic: "",
                        alcohol: "",
                    }
                }))
                setValue("details.0.supplier_tanks", newTanks)
            }
        }
    }, [selectedSupplier, setValue, mode, watch, compartmentCount])

    // Load required data
    useEffect(() => {
        if (open) {
            // Load offline data first as fallback
            if (typeof window !== 'undefined') {
                setOfflineData({
                    drivers: LocalStorageService.getDrivers() || [],
                    suppliers: LocalStorageService.getSuppliers() || [],
                    tankers: LocalStorageService.getTankers() || []
                })
            }

            // Try to fetch online data if online
            if (isOnline) {
                dispatch(fetchUsers({})).then((result: any) => {
                    if (result.payload && typeof window !== 'undefined') {
                        LocalStorageService.saveDrivers(result.payload)
                        setOfflineData(prev => ({ ...prev, drivers: result.payload }))
                    }
                }).catch(() => { })

                dispatch(fetchSuppliers({})).then((result: any) => {
                    if (result.payload && typeof window !== 'undefined') {
                        LocalStorageService.saveSuppliers(result.payload)
                        setOfflineData(prev => ({ ...prev, suppliers: result.payload }))
                    }
                }).catch(() => { })

                dispatch(fetchTankers({})).then((result: any) => {
                    if (result.payload && typeof window !== 'undefined') {
                        LocalStorageService.saveTankers(result.payload)
                        setOfflineData(prev => ({ ...prev, tankers: result.payload }))
                    }
                }).catch(() => { })
            }
        }
    }, [dispatch, open, isOnline])

    // Reset form when voucher changes
    useEffect(() => {
        if (open) {
            if (mode === "edit" && collectionVoucher) {
                setValue("driver", collectionVoucher.driver)
                setValue("date", collectionVoucher.date.split('T')[0])
                setValue("route", collectionVoucher.route)
                setValue("supplier", typeof collectionVoucher.supplier === "object" ? (collectionVoucher.supplier as any).id : collectionVoucher.supplier)
                setValue("truck_number", collectionVoucher.truck_number)
                setValue("time_in", collectionVoucher.time_in)
                setValue("time_out", collectionVoucher.time_out)

                const details = Array.isArray(collectionVoucher.raw_milk_collection_voucher_2_details)
                    ? collectionVoucher.raw_milk_collection_voucher_2_details
                    : []

                setValue("details", details.map(d => ({
                    id: d.id,
                    supplier_tanks: (d.raw_milk_collection_voucher_2_details_farmer_tank || []).map(ft => ({
                        id: ft.id,
                        supplier_tank_id: ft.supplier_tank_id || "",
                        truck_compartment_number: ft.truck_compartment_number || 0,
                        temperature: ft.temperature ?? "" as any,
                        dip_reading: ft.dip_reading ?? "" as any,
                        meter_start: ft.meter_start ?? "" as any,
                        meter_finish: ft.meter_finish ?? "" as any,
                        volume: ft.volume ?? "" as any,
                        dairy_total: ft.dairy_total ?? "" as any,
                        lab_test: {
                            id: ft.lab_test?.id,
                            ot_result: ft.lab_test?.ot_result || "",
                            cob_result: ft.lab_test?.cob_result || false,
                            organoleptic: ft.lab_test?.organoleptic || "",
                            alcohol: ft.lab_test?.alcohol || "",
                        }
                    }))
                })))

                setValue("remark", collectionVoucher.remark)
                setValue("driver_signature", collectionVoucher.driver_signature)
            } else if (mode === "create") {
                reset({
                    driver: user?.id || "",
                    date: new Date().toISOString().split('T')[0],
                    route: "",
                    supplier: "",
                    truck_number: "",
                    time_in: "",
                    time_out: "",
                    details: [
                        {
                            supplier_tanks: []
                        }
                    ],
                    remark: "",
                    driver_signature: "",
                })
            }
        }
    }, [open, mode, collectionVoucher, setValue, reset, user?.id])

    const onSubmit: SubmitHandler<CollectionVoucherFormData> = async (data) => {
        try {
            setLoading(true)

            const submitData: any = {
                driver: data.driver,
                date: data.date,
                route: data.route,
                supplier: data.supplier,
                truck_number: data.truck_number,
                time_in: data.time_in,
                time_out: data.time_out,
                details: data.details.map(d => ({
                    id: d.id,
                    supplier_tanks: (d.supplier_tanks || []).map(st => ({
                        id: st.id,
                        supplier_tank_id: st.supplier_tank_id,
                        truck_compartment_number: st.truck_compartment_number,
                        temperature: st.temperature == null || (st.temperature as any) === '' ? null : st.temperature,
                        dip_reading: st.dip_reading == null || (st.dip_reading as any) === '' ? null : st.dip_reading,
                        meter_start: st.meter_start == null || (st.meter_start as any) === '' ? null : st.meter_start,
                        meter_finish: st.meter_finish == null || (st.meter_finish as any) === '' ? null : st.meter_finish,
                        volume: st.volume == null || (st.volume as any) === '' ? null : st.volume,
                        dairy_total: st.dairy_total == null || (st.dairy_total as any) === '' ? null : st.dairy_total,
                        lab_test: {
                            id: st.lab_test?.id,
                            ot_result: st.lab_test?.ot_result,
                            cob_result: st.lab_test?.cob_result,
                            organoleptic: st.lab_test?.organoleptic,
                            alcohol: st.lab_test?.alcohol,
                        }
                    }))
                })),
                remark: data.remark || "",
                driver_signature: data.driver_signature,
            }

            console.log('Submitting collection voucher:', submitData)

            try {
                if (mode === "create") {
                    await dispatch(createCollectionVoucher(submitData)).unwrap()
                    toast.success("Collection voucher created successfully")
                } else if (collectionVoucher) {
                    await dispatch(updateCollectionVoucher({
                        ...submitData,
                        id: collectionVoucher.id,
                    })).unwrap()
                    toast.success("Collection voucher updated successfully")
                }

                dispatch(fetchCollectionVouchers({}))
                onOpenChange(false)
                onSuccess?.()
            } catch (apiError: any) {
                console.error('API submission failed:', apiError)

                // Extract error message from response
                let errorMessage = "Failed to save collection voucher"
                if (apiError?.message) {
                    errorMessage = apiError.message
                } else if (apiError?.error) {
                    errorMessage = apiError.error
                } else if (apiError?.data?.message) {
                    errorMessage = apiError.data.message
                } else if (typeof apiError === 'string') {
                    errorMessage = apiError
                }

                toast.error(`❌ ${errorMessage}`)

                // Fallback to offline storage
                if (mode === "create") {
                    LocalStorageService.saveCollectionVoucher(submitData)
                    toast.info("💾 Data saved offline - will sync when issue is resolved")
                } else if (collectionVoucher) {
                    LocalStorageService.updateCollectionVoucher({
                        ...submitData,
                        id: collectionVoucher.id,
                    })
                    toast.info("💾 Changes saved offline - will sync when issue is resolved")
                }

                // Don't close the form so user can see the error and fix it
                // onOpenChange(false)
            }
        } catch (error: any) {
            console.error('Form submission error:', error)
            const message = error?.message || "An unexpected error occurred"
            toast.error(`❌ ${message}`)
        } finally {
            setLoading(false)
        }
    }

    const isLoading = loading || !!operationLoading.create || !!operationLoading.update

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isMobile || isTablet ? "bottom" : "right"}
                className="tablet-sheet-full p-0 bg-white overflow-y-auto"
            >
                <div className="h-full flex flex-col">
                    <SheetHeader className={isMobile || isTablet ? "p-6 pb-0 bg-white" : "mb-6"}>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Truck className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <SheetTitle className="text-lg font-light m-0">
                                    {mode === "create" ? "Add New Collection Voucher" : "Edit Collection Voucher"}
                                </SheetTitle>
                                <SheetDescription className="text-sm font-light">
                                    {mode === "create" ? "Create a new milk collection voucher" : "Update voucher information"}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className={isMobile || isTablet ? "space-y-6 p-6" : "space-y-6 p-6"}>
                        {/* Basic Information */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                            <div className="p-6 pb-0">
                                <div className="flex items-center space-x-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <div className="text-lg font-light">Basic Information</div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="driver" className="font-light">Driver *</Label>
                                        <Controller
                                            name="driver"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                                    <SelectTrigger className="w-full rounded-full border-gray-200">
                                                        <SelectValue placeholder="Select driver" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {displayUsers.map((user) => (
                                                            <SelectItem key={user.id} value={user.id}>
                                                                {user.first_name} {user.last_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.driver && <p className="text-sm text-red-500">{errors.driver.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Controller
                                            name="date"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    label="Date *"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Select date"
                                                    disabled={isSubmitting}
                                                    error={!!errors.date}
                                                />
                                            )}
                                        />
                                        {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="route" className="font-light">Route *</Label>
                                        <Controller
                                            name="route"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} placeholder="Enter route" className="rounded-full" disabled={isSubmitting} />
                                            )}
                                        />
                                        {errors.route && <p className="text-sm text-red-500">{errors.route.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="truck_number" className="font-light">Tanker *</Label>
                                        <Controller
                                            name="truck_number"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                                    <SelectTrigger className="w-full rounded-full border-gray-200">
                                                        <SelectValue placeholder="Select tanker" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {displayTankers.length === 0 ? (
                                                            <SelectItem value="no-tankers" disabled>No tankers available</SelectItem>
                                                        ) : (
                                                            displayTankers.map((tanker: any) => (
                                                                <SelectItem key={tanker.id} value={tanker.reg_number}>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-light">{tanker.reg_number}</span>
                                                                        {tanker.compartments && (
                                                                            <span className="text-xs text-gray-500 font-light">
                                                                                {tanker.compartments} compartments
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.truck_number && <p className="text-sm text-red-500">{errors.truck_number.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="supplier" className="font-light">Supplier *</Label>
                                    <Controller
                                        name="supplier"
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                                <SelectTrigger className="w-full rounded-full border-gray-200">
                                                    <SelectValue placeholder="Select supplier" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {displaySuppliers.map((supplier) => (
                                                        <SelectItem key={supplier.id} value={supplier.id}>
                                                            {supplier.first_name} {supplier.last_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.supplier && <p className="text-sm text-red-500">{errors.supplier.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="time_in" className="font-light">Time In *</Label>
                                        <Controller
                                            name="time_in"
                                            control={control}
                                            render={({ field }) => (
                                                <ShadcnTimePicker value={field.value} onChange={field.onChange} />
                                            )}
                                        />
                                        {errors.time_in && <p className="text-sm text-red-500">{errors.time_in.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time_out" className="font-light">Time Out *</Label>
                                        <Controller
                                            name="time_out"
                                            control={control}
                                            render={({ field }) => (
                                                <ShadcnTimePicker value={field.value} onChange={field.onChange} />
                                            )}
                                        />
                                        {errors.time_out && <p className="text-sm text-red-500">{errors.time_out.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Collected Milk */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                            <div className="p-6 pb-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <ClipboardList className="w-5 h-5 text-blue-600" />
                                        <div className="text-lg font-light">Collected Milk</div>
                                    </div>
                                    {(mode === "edit" || (mode === "create" && selectedSupplier)) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const currentDetails = watch("details") || []
                                                const tanks = currentDetails[0]?.supplier_tanks || []
                                                const nextCompartment = (tanks.length % (compartmentCount || 1)) + 1

                                                const newTank = {
                                                    supplier_tank_id: "",
                                                    truck_compartment_number: nextCompartment,
                                                    temperature: "" as any,
                                                    dip_reading: "" as any,
                                                    meter_start: "" as any,
                                                    meter_finish: "" as any,
                                                    volume: "" as any,
                                                    dairy_total: "" as any,
                                                    lab_test: {
                                                        ot_result: "",
                                                        cob_result: false,
                                                        organoleptic: "",
                                                        alcohol: "",
                                                    }
                                                }

                                                if (currentDetails.length === 0) {
                                                    setValue("details", [{ supplier_tanks: [newTank] }])
                                                } else {
                                                    const updatedDetails = [...currentDetails]
                                                    updatedDetails[0] = {
                                                        ...updatedDetails[0],
                                                        supplier_tanks: [...(updatedDetails[0].supplier_tanks || []), newTank]
                                                    }
                                                    setValue("details", updatedDetails)
                                                }
                                            }}
                                            className="rounded-full"
                                        >
                                            Add Collection
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 space-y-8">
                                {watch("details")?.map((detail: any, detailIndex: number) => (
                                    <div key={detailIndex} className="space-y-6">
                                        {detail.supplier_tanks?.map((tank: any, tankIndex: number) => (
                                            <div key={tankIndex} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4 relative">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-light rounded-full">
                                                            Compartment {tank.truck_compartment_number}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500 font-light">Collection Entry {tankIndex + 1}</span>
                                                    </div>
                                                    {mode === "edit" && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const currentDetails = watch("details") || []
                                                                const updatedDetails = [...currentDetails]
                                                                updatedDetails[detailIndex] = {
                                                                    ...updatedDetails[detailIndex],
                                                                    supplier_tanks: (updatedDetails[detailIndex].supplier_tanks || []).filter((_: any, i: number) => i !== tankIndex)
                                                                }
                                                                setValue("details", updatedDetails)
                                                            }}
                                                            className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">Supplier Tank *</Label>
                                                        <Controller
                                                            name={`details.${detailIndex}.supplier_tanks.${tankIndex}.supplier_tank_id`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                                                    <SelectTrigger className="w-full rounded-full border-gray-200 bg-white">
                                                                        <SelectValue placeholder="Select tank" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {selectedSupplier?.suppliers_tanks?.map((t: any) => (
                                                                            <SelectItem key={t.id} value={t.id}>
                                                                                {t.name} ({t.code})
                                                                            </SelectItem>
                                                                        )) || (
                                                                                <SelectItem value="empty" disabled>No tanks for this supplier</SelectItem>
                                                                            )}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">Truck Compartment *</Label>
                                                        <Controller
                                                            name={`details.${detailIndex}.supplier_tanks.${tankIndex}.truck_compartment_number`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    value={field.value?.toString()}
                                                                    onValueChange={(val) => field.onChange(parseInt(val))}
                                                                    disabled={isSubmitting}
                                                                >
                                                                    <SelectTrigger className="w-full rounded-full border-gray-200 bg-white">
                                                                        <SelectValue placeholder="Select compartment" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from({ length: compartmentCount }, (_, i) => i + 1).map(num => (
                                                                            <SelectItem key={num} value={num.toString()}>
                                                                                Compartment {num}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">Temp (°C)</Label>
                                                        <Controller
                                                            name={`details.${detailIndex}.supplier_tanks.${tankIndex}.temperature`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" step="0.1" placeholder="0.0" className="rounded-full h-9 bg-white" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">Dip</Label>
                                                        <Controller
                                                            name={`details.${detailIndex}.supplier_tanks.${tankIndex}.dip_reading`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" step="0.1" placeholder="0.0" className="rounded-full h-9 bg-white" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">Volume (L)</Label>
                                                        <Controller
                                                            name={`details.${detailIndex}.supplier_tanks.${tankIndex}.volume`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" step="0.1" placeholder="0.0" className="rounded-full h-9 bg-white" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">Meter Start</Label>
                                                        <Controller
                                                            name={`details.${detailIndex}.supplier_tanks.${tankIndex}.meter_start`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" step="0.1" placeholder="0.0" className="rounded-full h-9 bg-white" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">Meter Finish</Label>
                                                        <Controller
                                                            name={`details.${detailIndex}.supplier_tanks.${tankIndex}.meter_finish`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" step="0.1" placeholder="0.0" className="rounded-full h-9 bg-white" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">Dairy Total</Label>
                                                        <Controller
                                                            name={`details.${detailIndex}.supplier_tanks.${tankIndex}.dairy_total`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" step="0.1" placeholder="0.0" className="rounded-full h-9 bg-white" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Nested Lab Test inside each tank */}
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Beaker className="w-3.5 h-3.5 text-blue-500" />
                                                        <span className="text-xs font-medium text-gray-600">Lab Test for this Tank</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">OT Result</Label>
                                                            <Controller
                                                                name={`details.${detailIndex}.supplier_tanks.${tankIndex}.lab_test.ot_result`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Input {...field} placeholder="Enter result" className="rounded-full h-9 bg-white" disabled={isSubmitting} />
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">Organoleptic</Label>
                                                            <Controller
                                                                name={`details.${detailIndex}.supplier_tanks.${tankIndex}.lab_test.organoleptic`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Input {...field} placeholder="Enter result" className="rounded-full h-9 bg-white" disabled={isSubmitting} />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                                        <div className="space-y-2">
                                                            <Label className="font-light text-xs text-gray-500 uppercase tracking-wider">Alcohol</Label>
                                                            <Controller
                                                                name={`details.${detailIndex}.supplier_tanks.${tankIndex}.lab_test.alcohol`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Input {...field} placeholder="Enter result" className="rounded-full h-9 bg-white" disabled={isSubmitting} />
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="space-y-2 flex items-center pt-4">
                                                            <Controller
                                                                name={`details.${detailIndex}.supplier_tanks.${tankIndex}.lab_test.cob_result`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                                                        <div className={cn(
                                                                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                                                            field.value ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200 group-hover:border-blue-400"
                                                                        )} onClick={() => field.onChange(!field.value)}>
                                                                            {field.value && <div className="w-2 h-2 bg-white rounded-full" />}
                                                                        </div>
                                                                        <span className="font-light text-sm text-gray-600">COB Result</span>
                                                                    </label>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                {(!watch("details") || watch("details")[0]?.supplier_tanks?.length === 0) && (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
                                        <p className="text-sm text-gray-400 font-light">Select a supplier to generate collection entries</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remarks & Signature */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                            <div className="p-6 pb-0">
                                <div className="flex items-center space-x-2">
                                    <FileSignature className="w-5 h-5 text-blue-600" />
                                    <div className="text-lg font-light">Remarks & Signature</div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-light">Remark</Label>
                                    <Controller
                                        name="remark"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea {...field} placeholder="Enter remarks" className="rounded-lg" disabled={isSubmitting} rows={3} />
                                        )}
                                    />
                                    {errors.remark && <p className="text-sm text-red-500">{errors.remark.message}</p>}
                                </div>


                                <div className="space-y-2">
                                    <Label className="font-light">Driver Signature *</Label>
                                    <Controller
                                        name="driver_signature"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                {field.value ? (
                                                    <img
                                                        src={base64ToPngDataUrl(field.value)}
                                                        alt="Driver signature"
                                                        className="h-32 w-full border border-gray-200 rounded-md bg-white object-contain"
                                                    />
                                                ) : (
                                                    <div className="h-32 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                                                        No signature captured
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => setSignatureOpen(true)}
                                                        className="rounded-full"
                                                        disabled={isSubmitting}
                                                    >
                                                        {field.value ? "Edit Signature" : "Add Signature"}
                                                    </Button>
                                                    {field.value && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="rounded-full text-red-600"
                                                            onClick={() => field.onChange("")}
                                                            disabled={isSubmitting}
                                                        >
                                                            Clear
                                                        </Button>
                                                    )}
                                                </div>
                                                {errors.driver_signature && <p className="text-sm text-red-500">{errors.driver_signature.message}</p>}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                                className="rounded-full"
                            >
                                Cancel
                            </Button>
                            <LoadingButton
                                type="submit"
                                loading={isLoading}
                                className="bg-[#006BC4] text-white rounded-full"
                            >
                                {mode === "create" ? "Create Voucher" : "Update Voucher"}
                            </LoadingButton>
                        </div>
                    </form>
                </div>

                <SignatureModal
                    open={signatureOpen}
                    onOpenChange={setSignatureOpen}
                    onSave={(signature) => {
                        setValue("driver_signature", signature)
                        setSignatureOpen(false)
                    }}
                    title="Driver Signature"
                />
            </SheetContent>
        </Sheet>
    )
}
