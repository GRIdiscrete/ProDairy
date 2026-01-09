"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, User, Edit, Trash2, Calendar, ClipboardList, Beaker, FileText, MapPin, Phone, Mail, Building2 } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { deleteCollectionVoucher, fetchCollectionVouchers } from "@/lib/store/slices/collectionVoucherSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchSuppliers } from "@/lib/store/slices/supplierSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { UserAvatar } from "@/components/ui/user-avatar"
import { SupplierAvatar } from "@/components/ui/supplier-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import type { CollectionVoucher } from "@/lib/types"

interface SignatureViewerProps {
    signature: string
    title: string
}

function SignatureViewer({ signature, title }: SignatureViewerProps) {
    if (!signature || signature.trim() === '') {
        return (
            <div className="space-y-1">
                <div className="text-xs text-gray-500">{title}</div>
                <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                    No signature available
                </div>
            </div>
        )
    }

    const signatureImage = base64ToPngDataUrl(signature)

    return (
        <div className="space-y-1">
            <div className="text-xs text-gray-500">{title}</div>
            <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                <img
                    src={signatureImage}
                    alt={`${title} signature`}
                    className="w-full h-24 object-contain bg-white rounded border"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>
        </div>
    )
}

interface CollectionVoucherViewDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    collectionVoucher: CollectionVoucher | null
    onEdit?: (voucher: CollectionVoucher) => void
}

export function CollectionVoucherViewDrawer({
    open,
    onOpenChange,
    collectionVoucher,
    onEdit
}: CollectionVoucherViewDrawerProps) {
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()
    const isMobile = useIsMobile()
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024

    const { operationLoading } = useAppSelector((state) => state.collectionVoucher)
    const { items: users } = useAppSelector((state) => state.users)
    const { suppliers } = useAppSelector((state) => state.supplier)

    useEffect(() => {
        if (open && users.length === 0) {
            dispatch(fetchUsers({}))
        }
        if (open && suppliers.length === 0) {
            dispatch(fetchSuppliers({}))
        }
    }, [open, users.length, suppliers.length, dispatch])

    const handleDelete = async () => {
        if (!collectionVoucher) return

        try {
            setLoading(true)
            await dispatch(deleteCollectionVoucher(collectionVoucher.id)).unwrap()
            toast.success("Collection voucher deleted successfully")
            dispatch(fetchCollectionVouchers({}))
            onOpenChange(false)
        } catch (error: any) {
            const message = error?.message || "Failed to delete collection voucher"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = () => {
        if (collectionVoucher && onEdit) {
            onEdit(collectionVoucher)
            onOpenChange(false)
        }
    }

    const isLoading = loading || operationLoading.delete

    if (!collectionVoucher) return <></>

    // Get driver information
    const driverUser = users.find(user => user.id === collectionVoucher.driver)
    const supplierData = suppliers.find(s => s.id === (typeof collectionVoucher.farmer === 'string' ? collectionVoucher.farmer : (collectionVoucher.farmer as any)?.id))

    const details = Array.isArray(collectionVoucher.raw_milk_collection_voucher_details)
        ? collectionVoucher.raw_milk_collection_voucher_details
        : (Array.isArray(collectionVoucher.details) ? collectionVoucher.details : [])

    const labTests = Array.isArray(collectionVoucher.raw_milk_collection_voucher_lab_test)
        ? collectionVoucher.raw_milk_collection_voucher_lab_test
        : (Array.isArray(collectionVoucher.lab_test) ? collectionVoucher.lab_test : [])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isMobile || isTablet ? "bottom" : "right"}
                className="tablet-sheet-full p-0 bg-white"
            >
                <div className="h-full flex flex-col">
                    <SheetHeader className={isMobile || isTablet ? "p-6 pb-0 bg-white" : "p-6 mb-0"}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Truck className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <SheetTitle className="text-lg font-light m-0">Collection Voucher Details</SheetTitle>
                                    <SheetDescription className="text-sm font-light">
                                        <FormIdCopy
                                            displayId={collectionVoucher.tag || "N/A"}
                                            actualId={collectionVoucher.id}
                                            size="sm"
                                        />
                                    </SheetDescription>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {onEdit && (
                                    <Button
                                        size="sm"
                                        onClick={handleEdit}
                                        disabled={isLoading}
                                        className="bg-[#A0CF06] text-[#211D1E] rounded-full"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                )}
                                <LoadingButton
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                    loading={isLoading}
                                    className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </LoadingButton>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                            <div className="p-6 pb-0">
                                <div className="flex items-center space-x-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <div className="text-lg font-light">Basic Information</div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {driverUser && (
                                    <UserAvatar
                                        user={driverUser}
                                        size="lg"
                                        showName={true}
                                        showEmail={true}
                                        showDropdown={true}
                                    />
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />Date
                                        </div>
                                        <div className="text-sm font-light">
                                            {new Date(collectionVoucher.date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500">Route</div>
                                        <div className="text-sm font-light">{collectionVoucher.route}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Truck className="h-3 w-3" />Truck Number
                                        </div>
                                        <div className="text-sm font-light">{collectionVoucher.truck_number}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500">Compartments</div>
                                        <div className="text-sm font-light">{collectionVoucher.number_of_compartments}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500">Time In</div>
                                        <div className="text-sm font-light">{collectionVoucher.time_in}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500">Time Out</div>
                                        <div className="text-sm font-light">{collectionVoucher.time_out}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Farmer Information */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                            <div className="p-6 pb-0">
                                <div className="flex items-center space-x-2">
                                    <Building2 className="w-5 h-5 text-[#A0CF06]" />
                                    <div className="text-lg font-light">Farmer Information</div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {typeof collectionVoucher.farmer === 'object' && collectionVoucher.farmer ? (
                                    <div className="space-y-4">
                                        <SupplierAvatar
                                            supplier={collectionVoucher.farmer as any}
                                            size="lg"
                                            showName={true}
                                            showEmail={true}
                                            showDropdown={false}
                                        />

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> Phone
                                                </div>
                                                <div className="font-light">{(collectionVoucher.farmer as any).phone_number || 'N/A'}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> Address
                                                </div>
                                                <div className="font-light">{(collectionVoucher.farmer as any).physical_address || 'N/A'}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <ClipboardList className="h-3 w-3" /> Raw Product
                                                </div>
                                                <div className="font-light capitalize">{(collectionVoucher.farmer as any).raw_product || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : supplierData ? (
                                    <div className="space-y-4">
                                        <SupplierAvatar
                                            supplier={supplierData as any}
                                            size="lg"
                                            showName={true}
                                            showEmail={true}
                                            showDropdown={false}
                                        />
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> Phone
                                                </div>
                                                <div className="font-light">{supplierData.phone_number || 'N/A'}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> Address
                                                </div>
                                                <div className="font-light">{supplierData.physical_address || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm font-light text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                                        Farmer information not available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Collection Details */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                            <div className="p-6 pb-0">
                                <div className="flex items-center space-x-2">
                                    <ClipboardList className="w-5 h-5 text-blue-600" />
                                    <div className="text-lg font-light">Collection Details</div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {details.map((detail, index) => (
                                    <div key={index} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-light rounded-full">
                                                Compartment {detail.truck_compartment_number}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-xs">
                                            <div className="space-y-1">
                                                <div className="text-gray-500">Temp</div>
                                                <div className="font-light">{detail.temperature}°C</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-gray-500">Dip</div>
                                                <div className="font-light">{detail.dip_reading}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-gray-500">Volume</div>
                                                <div className="font-light">{detail.volume} L</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-1">
                                                <div className="text-gray-500">Meter Start</div>
                                                <div className="font-light">{detail.meter_start}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-gray-500">Meter Finish</div>
                                                <div className="font-light">{detail.meter_finish}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-1">
                                                <div className="text-gray-500">Dairy Total</div>
                                                <div className="font-light">{detail.dairy_total}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-gray-500">Farmer Tank(s)</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.isArray(detail.farmer_tank_number) ? detail.farmer_tank_number.map(tn => (
                                                        <Badge key={tn} variant="outline" className="text-[10px] font-light h-5">Tank {tn}</Badge>
                                                    )) : <span className="font-light text-gray-400">N/A</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-xs">
                                            <div className="text-gray-500">Route Total</div>
                                            <div className="font-light">{detail.route_total}</div>
                                        </div>
                                    </div>
                                ))}
                                {details.length === 0 && (
                                    <div className="text-center py-4 text-gray-400 text-sm font-light italic">
                                        No collection details available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lab Test Results */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                            <div className="p-6 pb-0">
                                <div className="flex items-center space-x-2">
                                    <Beaker className="w-5 h-5 text-blue-600" />
                                    <div className="text-lg font-light">Lab Test Results</div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {labTests.map((test, index) => (
                                    <div key={index} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500">OT Result</div>
                                                <div className="font-light">{test.ot_result || 'N/A'}</div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500">Organoleptic</div>
                                                <div className="font-light">{test.organoleptic || 'N/A'}</div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500">Alcohol</div>
                                                <div className="font-light">{test.alcohol || 'N/A'}</div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500">COB Result</div>
                                                <Badge className={test.cob_result ? "bg-green-100 text-green-800 border-0" : "bg-gray-100 text-gray-800 border-0"}>
                                                    {test.cob_result ? 'Positive' : 'Negative'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {labTests.length === 0 && (
                                    <div className="text-center py-4 text-gray-400 text-sm font-light italic">
                                        No lab tests available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remarks & Signature */}
                        <div className="border border-gray-200 rounded-lg bg-white">
                            <div className="p-6 pb-0">
                                <div className="flex items-center space-x-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <div className="text-lg font-light">Remarks & Signature</div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <div className="text-xs text-gray-500">Remark</div>
                                    <div className="text-sm font-light p-3 bg-gray-50 rounded-lg">
                                        {collectionVoucher.remark}
                                    </div>
                                </div>

                                <SignatureViewer
                                    signature={collectionVoucher.driver_signature}
                                    title="Driver Signature"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                                className="bg-gray-100 text-gray-600 rounded-full px-6 py-2 font-light"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
