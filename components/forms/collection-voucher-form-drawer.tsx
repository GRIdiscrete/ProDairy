"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Truck, User, ClipboardList, Beaker, FileSignature } from "lucide-react"
import { Label } from "@/components/ui/label"
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
import type { CollectionVoucher } from "@/lib/types"

const collectionVoucherSchema = yup.object({
    driver: yup.string().required("Driver is required"),
    date: yup.string().required("Date is required"),
    route: yup.string().required("Route is required"),
    farmer: yup.string().required("Farmer is required"),
    truck_number: yup.string().required("Truck number is required"),
    time_in: yup.string().required("Time in is required"),
    time_out: yup.string().required("Time out is required"),
    details: yup.object({
        temperature: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
        dip_reading: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
        meter_start: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
        meter_finish: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
        volume: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
        dairy_total: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
        farmer_tank_number: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
        truck_compartment_number: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
        route_total: yup.number().transform((value, originalValue) => originalValue === '' ? undefined : value).nullable(),
    }),
    lab_test: yup.object({
        ot_result: yup.string(),
        cob_result: yup.boolean(),
        organoleptic: yup.string(),
        alcohol: yup.string(),
    }),
    remark: yup.string(),
    driver_signature: yup.string().required("Driver signature is required"),
})

type CollectionVoucherFormData = yup.InferType<typeof collectionVoucherSchema>

interface CollectionVoucherFormDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    collectionVoucher?: CollectionVoucher
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

    const { operationLoading } = useAppSelector((state) => state.collectionVoucher)
    const { items: users } = useAppSelector((state) => state.users)
    const { suppliers } = useAppSelector((state) => state.supplier)
    const { items: tankers } = useAppSelector((state) => state.tankers)
    const { user } = useAppSelector((state) => state.auth)

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
            farmer: "",
            truck_number: "",
            time_in: "",
            time_out: "",
            details: {
                temperature: "" as any,
                dip_reading: "" as any,
                meter_start: "" as any,
                meter_finish: "" as any,
                volume: "" as any,
                dairy_total: "" as any,
                farmer_tank_number: "" as any,
                truck_compartment_number: "" as any,
                route_total: "" as any,
            },
            lab_test: {
                ot_result: "",
                cob_result: false,
                organoleptic: "",
                alcohol: "",
            },
            remark: "",
            driver_signature: "",
        },
    })

    const selectedTruckNumber = watch("truck_number")
    const selectedTanker = tankers?.find((t: any) => t.reg_number === selectedTruckNumber)
    const compartmentCount = selectedTanker?.compartments || 0

    // Load required data
    useEffect(() => {
        if (open) {
            dispatch(fetchUsers({})).catch(() => { })
            dispatch(fetchSuppliers({})).catch(() => { })
            dispatch(fetchTankers({})).catch(() => { })
        }
    }, [dispatch, open])

    // Reset form when voucher changes
    useEffect(() => {
        if (open) {
            if (mode === "edit" && collectionVoucher) {
                setValue("driver", collectionVoucher.driver)
                setValue("date", collectionVoucher.date.split('T')[0])
                setValue("route", collectionVoucher.route)
                setValue("farmer", collectionVoucher.farmer)
                setValue("truck_number", collectionVoucher.truck_number)
                setValue("time_in", collectionVoucher.time_in)
                setValue("time_out", collectionVoucher.time_out)
                setValue("details", collectionVoucher.details)
                setValue("lab_test", collectionVoucher.lab_test)
                setValue("remark", collectionVoucher.remark)
                setValue("driver_signature", collectionVoucher.driver_signature)
            } else {
                reset({
                    driver: user?.id || "",
                    date: "",
                    route: "",
                    farmer: "",
                    truck_number: "",
                    time_in: "",
                    time_out: "",
                    details: {
                        temperature: "" as any,
                        dip_reading: "" as any,
                        meter_start: "" as any,
                        meter_finish: "" as any,
                        volume: "" as any,
                        dairy_total: "" as any,
                        farmer_tank_number: "" as any,
                        truck_compartment_number: "" as any,
                        route_total: "" as any,
                    },
                    lab_test: {
                        ot_result: "",
                        cob_result: false,
                        organoleptic: "",
                        alcohol: "",
                    },
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
                farmer: data.farmer,
                truck_number: data.truck_number,
                time_in: data.time_in,
                time_out: data.time_out,
                details: {
                    temperature: data.details.temperature == null || data.details.temperature === '' ? null : data.details.temperature,
                    dip_reading: data.details.dip_reading == null || data.details.dip_reading === '' ? null : data.details.dip_reading,
                    meter_start: data.details.meter_start == null || data.details.meter_start === '' ? null : data.details.meter_start,
                    meter_finish: data.details.meter_finish == null || data.details.meter_finish === '' ? null : data.details.meter_finish,
                    volume: data.details.volume == null || data.details.volume === '' ? null : data.details.volume,
                    dairy_total: data.details.dairy_total == null || data.details.dairy_total === '' ? null : data.details.dairy_total,
                    farmer_tank_number: data.details.farmer_tank_number == null || data.details.farmer_tank_number === '' ? null : data.details.farmer_tank_number,
                    truck_compartment_number: data.details.truck_compartment_number == null || data.details.truck_compartment_number === '' ? null : data.details.truck_compartment_number,
                    route_total: data.details.route_total == null || data.details.route_total === '' ? null : data.details.route_total,
                },
                lab_test: data.lab_test,
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
                        details: {
                            ...submitData.details,
                            id: collectionVoucher.details?.id,
                        },
                        lab_test: {
                            ...submitData.lab_test,
                            id: collectionVoucher.lab_test?.id,
                        },
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
                                                        {users.map((user) => (
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
                                                        {tankers.length === 0 ? (
                                                            <SelectItem value="no-tankers" disabled>No tankers available</SelectItem>
                                                        ) : (
                                                            tankers.map((tanker: any) => (
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
                                    <Label htmlFor="farmer" className="font-light">Farmer *</Label>
                                    <Controller
                                        name="farmer"
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                                <SelectTrigger className="w-full rounded-full border-gray-200">
                                                    <SelectValue placeholder="Select farmer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {suppliers.map((supplier) => (
                                                        <SelectItem key={supplier.id} value={supplier.id}>
                                                            {supplier.first_name} {supplier.last_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.farmer && <p className="text-sm text-red-500">{errors.farmer.message}</p>}
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

                        {/* Collection Details */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                            <div className="p-6 pb-0">
                                <div className="flex items-center space-x-2">
                                    <ClipboardList className="w-5 h-5 text-blue-600" />
                                    <div className="text-lg font-light">Collection Details (Optional)</div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-light">Temperature</Label>
                                        <Controller
                                            name="details.temperature"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} type="number" step="0.1" placeholder="Enter temperature" className="rounded-full" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                            )}
                                        />
                                        {errors.details?.temperature && <p className="text-sm text-red-500">{errors.details.temperature.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-light">Dip Reading</Label>
                                        <Controller
                                            name="details.dip_reading"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} type="number" step="0.1" placeholder="Enter dip reading" className="rounded-full" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                            )}
                                        />
                                        {errors.details?.dip_reading && <p className="text-sm text-red-500">{errors.details.dip_reading.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-light">Volume</Label>
                                        <Controller
                                            name="details.volume"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} type="number" step="0.1" placeholder="Enter volume" className="rounded-full" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                            )}
                                        />
                                        {errors.details?.volume && <p className="text-sm text-red-500">{errors.details.volume.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-light">Meter Start</Label>
                                        <Controller
                                            name="details.meter_start"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} type="number" step="0.1" placeholder="Enter meter start" className="rounded-full" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-light">Meter Finish</Label>
                                        <Controller
                                            name="details.meter_finish"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} type="number" step="0.1" placeholder="Enter meter finish" className="rounded-full" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-light">Dairy Total</Label>
                                        <Controller
                                            name="details.dairy_total"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} type="number" step="0.1" placeholder="Enter dairy total" className="rounded-full" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-light">Farmer Tank #</Label>
                                        <Controller
                                            name="details.farmer_tank_number"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} type="number" placeholder="Enter tank number" className="rounded-full" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value))} />
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-light">Truck Compartment #</Label>
                                        <Controller
                                            name="details.truck_compartment_number"
                                            control={control}
                                            render={({ field }) => {
                                                // Generate compartment options from count
                                                const compartmentOptions = Array.from(
                                                    { length: compartmentCount },
                                                    (_, i) => (i + 1).toString()
                                                )

                                                return (
                                                    <Select
                                                        value={field.value?.toString() || ""}
                                                        onValueChange={(val) => field.onChange(parseInt(val))}
                                                        disabled={isSubmitting || !selectedTruckNumber}
                                                    >
                                                        <SelectTrigger className="w-full rounded-full border-gray-200">
                                                            <SelectValue placeholder={selectedTruckNumber ? "Select compartment" : "Select tanker first"} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {!selectedTruckNumber ? (
                                                                <SelectItem value="no-tanker" disabled>Select a tanker first</SelectItem>
                                                            ) : compartmentOptions.length === 0 ? (
                                                                <SelectItem value="no-compartments" disabled>No compartments found ({compartmentCount})</SelectItem>
                                                            ) : (
                                                                compartmentOptions.map((num) => (
                                                                    <SelectItem key={num} value={num}>
                                                                        Compartment - {num}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-light">Route Total</Label>
                                    <Controller
                                        name="details.route_total"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" step="0.1" placeholder="Enter route total" className="rounded-full" disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lab Test (Optional) */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                            <div className="p-6 pb-0">
                                <div className="flex items-center space-x-2">
                                    <Beaker className="w-5 h-5 text-blue-600" />
                                    <div className="text-lg font-light">Lab Test (Optional)</div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-light">OT Result</Label>
                                        <Controller
                                            name="lab_test.ot_result"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} placeholder="Enter result" className="rounded-full" disabled={isSubmitting} />
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-light">Organoleptic</Label>
                                        <Controller
                                            name="lab_test.organoleptic"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} placeholder="Enter result" className="rounded-full" disabled={isSubmitting} />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-light">Alcohol</Label>
                                        <Controller
                                            name="lab_test.alcohol"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} placeholder="Enter result" className="rounded-full" disabled={isSubmitting} />
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2 flex items-center">
                                        <Controller
                                            name="lab_test.cob_result"
                                            control={control}
                                            render={({ field }) => (
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="rounded"
                                                        disabled={isSubmitting}
                                                    />
                                                    <span className="font-light">COB Result</span>
                                                </label>
                                            )}
                                        />
                                    </div>
                                </div>
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
