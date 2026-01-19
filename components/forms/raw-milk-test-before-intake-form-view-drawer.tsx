"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
    FlaskConical,
    Calendar,
    Clock,
    Truck,
    User,
    Droplets,
    CheckCircle2,
    XCircle,
    Edit,
    FileText
} from "lucide-react"
import { RawMilkResultSlipBeforeIntake } from "@/lib/types"
import { useAppSelector } from "@/lib/store"
import { base64ToPngDataUrl } from "@/lib/utils/signature"

interface RawMilkTestBeforeIntakeFormViewDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    form?: RawMilkResultSlipBeforeIntake | null
    onEdit?: () => void
}

export function RawMilkTestBeforeIntakeFormViewDrawer({
    open,
    onOpenChange,
    form,
    onEdit
}: RawMilkTestBeforeIntakeFormViewDrawerProps) {
    const { items: users } = useAppSelector((state) => state.users)
    const { collectionVouchers } = useAppSelector((state) => state.collectionVoucher)

    if (!form) return null

    const analyst = users.find(u => u.id === form.analyst)
    const approver = users.find(u => u.id === form.approved_by)
    const collector = users.find(u => u.id === form.results_collected_by)
    const voucher = collectionVouchers.find(v => v.id === form.voucher_id)

    const labTest = form.lab_test

    const DataRow = ({ label, value, unit = "" }: { label: string, value: any, unit?: string }) => (
        <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm font-light text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}{unit}</span>
        </div>
    )

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="tablet-sheet-full p-0 bg-white min-w-[50vw]">
                <SheetHeader className="p-6 border-b bg-gray-50 flex-row justify-between items-center space-y-0">
                    <div>
                        <div className="flex items-center space-x-2">
                            <SheetTitle className="text-xl font-light">Test Result Details</SheetTitle>
                            <Badge className={form.lab_test?.pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                {form.lab_test ? (form.lab_test.pass ? "PASSED" : "FAILED") : "PENDING"}
                            </Badge>
                        </div>
                        <SheetDescription className="text-xs font-light mt-1">
                            Voucher Ref: {form.tag}
                        </SheetDescription>
                    </div>
                    <Button onClick={onEdit} variant="outline" size="sm" className="rounded-full mr-12">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 h-[calc(100vh-80px)]">

                    {/* Header Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-blue-600 font-medium">Compartment</div>
                            <div className="text-2xl font-light">#{form.truck_compartment_number}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Temperature</div>
                            <div className="text-2xl font-light">{labTest?.temperature ?? "-"}°C</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">PH</div>
                            <div className="text-2xl font-light">{labTest?.ph ?? "-"}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Density</div>
                            <div className="text-2xl font-light">{labTest?.density ?? "-"}</div>
                        </div>
                    </div>

                    {/* Detailed Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-blue-600 border-b pb-2">
                                <FlaskConical className="w-4 h-4" />
                                <span className="text-sm font-medium">Chemical & Physical Tests</span>
                            </div>
                            <div className="space-y-1">
                                <DataRow label="Fat Content" value={labTest?.fat} unit="%" />
                                <DataRow label="Protein Content" value={labTest?.protein} unit="%" />
                                <DataRow label="Alcohol Test" value={labTest?.alcohol} unit="%" />
                                <DataRow label="Total Solids" value={labTest?.total_solids} unit="%" />
                                <DataRow label="LR/SNF" value={labTest?.lr_snf} />
                                <DataRow label="FPD" value={labTest?.fpd} />
                                <DataRow label="SCC" value={labTest?.scc} />
                                <DataRow label="Titratable Acidity" value={labTest?.titratable_acidity} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-purple-600 border-b pb-2">
                                <Droplets className="w-4 h-4" />
                                <span className="text-sm font-medium">Quality & Adulteration</span>
                            </div>
                            <div className="space-y-1">
                                <DataRow label="Organoleptic (OT)" value={labTest?.ot || "-"} />
                                <DataRow label="Resazurin" value={labTest?.resazurin || "-"} />
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm font-light text-gray-500">COB Positive</span>
                                    {labTest?.cob ? <CheckCircle2 className="w-4 h-4 text-red-500" /> : <XCircle className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm font-light text-gray-500">Antibiotics Detect</span>
                                    {labTest?.antibiotics ? <CheckCircle2 className="w-4 h-4 text-red-500" /> : <XCircle className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm font-light text-gray-500">Starch Detect</span>
                                    {labTest?.starch ? <CheckCircle2 className="w-4 h-4 text-red-500" /> : <XCircle className="w-4 h-4 text-green-500" />}
                                </div>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <div className="text-[10px] uppercase font-medium text-orange-600 mb-1">Remarks</div>
                                <p className="text-sm font-light text-gray-700 italic">"{labTest?.remark || "No remarks"}"</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Admin & Context */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Context</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Collection Voucher</div>
                                        <div className="text-sm font-light">{voucher?.tag || form.voucher_id}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Truck className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Truck Registration</div>
                                        <div className="text-sm font-light">{voucher?.truck_number || "Unknown"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <User className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Personnel</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] w-16 text-gray-400 uppercase">Analyst:</span>
                                    <span className="text-sm font-light">{analyst ? `${analyst.first_name} ${analyst.last_name}` : "Unknown"}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] w-16 text-gray-400 uppercase">Collector:</span>
                                    <span className="text-sm font-light">{collector ? `${collector.first_name} ${collector.last_name}` : "Unknown"}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] w-16 text-gray-400 uppercase">Approver:</span>
                                    <span className="text-sm font-light">{approver ? `${approver.first_name} ${approver.last_name}` : "Unknown"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Approval Signature</span>
                            </div>
                            <div className="border border-dashed border-gray-200 rounded-lg p-2 h-20 flex items-center justify-center bg-white">
                                {form.approver_signature ? (
                                    <img src={base64ToPngDataUrl(form.approver_signature)} alt="Signature" className="max-h-full" />
                                ) : (
                                    <span className="text-[10px] text-gray-300 italic">No signature available</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Time and Dates */}
                    <div className="flex items-center space-x-6 pt-4 text-gray-400 border-t">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">{new Date(form.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">In: {form.time_in}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">Out: {form.time_out}</span>
                        </div>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    )
}
