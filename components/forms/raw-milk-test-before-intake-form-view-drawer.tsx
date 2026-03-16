"use client"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RawMilkResultSlipBeforeIntake } from "@/lib/types"
import { useAppSelector } from "@/lib/store"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { Printer, Edit, X, FlaskConical } from "lucide-react"

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
    const { roles } = useAppSelector((state) => state.roles)
    const { items: tankers } = useAppSelector((state) => state.tankers)

    if (!form) return null

    const analyst = users.find(u => u.id === form.analyst)
    const approver = roles.find(r => r.id === form.approved_by)
    const collector = users.find(u => u.id === form.results_collected_by)
    const tanker = tankers.find(t => t.id === form.truck_number)
    const truckDisplay = tanker?.reg_number || form.truck_number || "N/A"

    const labTests = Array.isArray(form.lab_test) ? form.lab_test : []
    const columns = Array.from({ length: 6 })

    const parameters = [
        { label: "Temperature (°C)", key: "temperature" },
        { label: "Time of Test", key: "time" },
        { label: "OT", key: "ot" },
        { label: "Clot On Boil", key: "cob", type: "boolean" },
        { label: "Alcohol (%)", key: "alcohol" },
        { label: "Titrable Acidity", key: "titratable_acidity" },
        { label: "pH", key: "ph" },
        { label: "Resazurin", key: "resazurin" },
        { label: "Fat (%)", key: "fat" },
        { label: "Protein (%)", key: "protein" },
        { label: "LR/SNF", key: "lr_snf" },
        { label: "Total Solids (%)", key: "total_solids" },
        { label: "FPD", key: "fpd" },
        { label: "SCC", key: "scc" },
        { label: "Density", key: "density" },
        { label: "Antibiotics", key: "antibiotics", type: "boolean" },
        { label: "Starch", key: "starch", type: "boolean" },
        { label: "Result PASS", key: "pass", type: "boolean" },
    ]

    const handlePrint = () => {
        window.print()
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="tablet-sheet-full p-0 bg-white min-w-[95vw] overflow-y-auto">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50/50 print:hidden sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" className="rounded-full shadow-none border-gray-200" onClick={() => onOpenChange(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Close
                        </Button>
                        <div className="flex items-center space-x-2">
                            <FlaskConical className="w-5 h-5 text-[#006BC4]" />
                            <span className="font-semibold text-sm tracking-tight text-gray-900 leading-none">Viewing Result Slip</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" size="sm" className="rounded-full border-[#A0CF06] text-[#211D1E] hover:bg-[#A0CF06]/10 shadow-none" onClick={onEdit}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modify Data
                        </Button>
                        <Button className="rounded-full bg-[#006BC4] hover:bg-[#006BC4]/90 px-8 shadow-none" size="sm" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print Sheet
                        </Button>
                    </div>
                </div>

                {/* LABORATORY SHEET LAYOUT */}
                <div className="p-0 border-none bg-white min-h-screen">
                    <div className="mx-auto p-12 max-w-[1300px]">

                        {/* HEADER SECTION - 2 ROW LAYOUT */}
                        <div className="border-b-2 border-black pb-8 mb-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex flex-col">
                                    <span className="text-4xl font-bold text-[#006BC4] leading-none">PRO dairy</span>
                                    <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest text-center">Laboratory Administration</span>
                                </div>
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold tracking-tighter text-gray-900 mb-1">RAW MILK RESULT SLIP</h1>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Quality Control validation</p>
                                </div>
                                <div className="text-right tabular-nums">
                                    <span className="text-gray-400 uppercase text-[10px] block mb-1">Reference Tag</span>
                                    <span className="font-bold text-gray-900 text-xl">{form.tag || "N/A"}</span>
                                </div>
                            </div>

                            {/* ROW 1: DATA, TRUCK, ROUTE */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-gray-500 font-bold tracking-tight">Data / Date of Acceptance</Label>
                                    <div className="h-11 rounded-full border border-gray-100 bg-gray-50/50 flex items-center px-6 font-bold text-gray-900">
                                        {new Date(form.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-gray-500 font-bold tracking-tight">Truck Number / ID (Voucher)</Label>
                                    <div className="h-11 rounded-full border border-gray-100 bg-gray-50/50 flex items-center px-6 font-bold text-gray-900 truncate">
                                        {truckDisplay}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-gray-500 font-bold tracking-tight">Route Source</Label>
                                    <div className="h-11 rounded-full border border-gray-100 bg-gray-50/50 flex items-center px-6 font-bold text-gray-900">
                                        {form.route || "N/A"}
                                    </div>
                                </div>
                            </div>

                            {/* ROW 2: TIMES, ANALYST, COLLECTOR */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-gray-500 font-bold tracking-tight">Arrival / Dispatch Times</Label>
                                    <div className="h-11 rounded-full border border-gray-100 bg-gray-50/50 flex items-center px-6 font-bold text-gray-900 tabular-nums">
                                        {form.time_in ? (form.time_in.includes('T') ? form.time_in.split('T')[1].substring(0, 5) : form.time_in.substring(0, 5)) : "--:--"}
                                        {" - "}
                                        {form.time_out ? (form.time_out.includes('T') ? form.time_out.split('T')[1].substring(0, 5) : form.time_out.substring(0, 5)) : "--:--"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-gray-500 font-bold tracking-tight">Lead Analyst</Label>
                                    <div className="h-11 rounded-full border border-gray-100 bg-gray-50/50 flex items-center px-6 font-bold text-gray-900 truncate">
                                        {analyst ? `${analyst.first_name} ${analyst.last_name}` : "N/A"}
                                    </div>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <Label className="text-[10px] uppercase text-gray-500 font-bold tracking-tight">Results Collected By</Label>
                                    <div className="h-11 rounded-full border border-gray-100 bg-gray-50/50 flex items-center px-6 font-bold text-gray-900 truncate">
                                        {collector ? `${collector.first_name} ${collector.last_name}` : "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MAIN DATA TABLE */}
                        <div className="mb-12 overflow-hidden outline outline-1 outline-black bg-white">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-black">
                                        <th className="p-5 text-left text-[11px] font-bold border-r border-black w-64 uppercase tracking-widest text-gray-600">Laboratory Parameter</th>
                                        {columns.map((_, i) => (
                                            <th key={i} className="p-2 text-center text-[11px] font-bold border-r border-black last:border-r-0">
                                                <div className="text-gray-900">RESULT {i + 1}</div>
                                                <div className="text-[9px] font-medium text-[#006BC4] mt-0.5 uppercase">
                                                    {labTests[i] ? `COMPARTMENT ${labTests[i].truck_compartment_number}` : "-"}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parameters.map((param, pIdx) => (
                                        <tr key={param.key} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 px-5 text-[13px] font-bold border-r border-black bg-gray-50/20 text-gray-800">
                                                {param.label}
                                            </td>
                                            {columns.map((_, cIdx) => {
                                                const lt = labTests[cIdx]
                                                let value: any = lt ? lt[param.key as keyof typeof lt] : ""

                                                if (param.type === "boolean" && lt) {
                                                    value = value ? "POSITIVE" : "NEGATIVE"
                                                }

                                                if (param.key === "time" && value && (value.includes('T') || value.includes(' '))) {
                                                    value = value.includes('T') ? value.split('T')[1].substring(0, 5) : value.split(' ')[1].substring(0, 5)
                                                }

                                                return (
                                                    <td key={cIdx} className={`p-2 text-center text-[13px] font-bold border-r border-black last:border-r-0 h-14 ${!lt ? 'bg-gray-50/30' : ''}`}>
                                                        {value || (lt ? "-" : "")}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* BOTTOM SECTION */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-16 pb-12">
                            <div className="space-y-10">
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block">Authorized QA/QC Approver</Label>
                                    <div className="h-14 rounded-full border-2 border-black bg-white flex items-center px-8 text-xl font-bold text-gray-900 tracking-tight">
                                        {approver ? approver.role_name : "SIGNATURE VALIDATION REQUIRED"}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block">Analytical Observations</Label>
                                    <div className="text-[14px] min-h-[160px] rounded-[2rem] p-8 bg-gray-50/30 italic text-gray-600 leading-relaxed border border-gray-100">
                                        {labTests[0]?.remark || "No specific deviations recorded for this intake batch. Product meets standard sensory and analytical requirements."}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 block">Validation Signature Matrix</Label>
                                <div className="space-y-4">
                                    <div
                                        className="h-56 w-full border-2 border-gray-100 rounded-[2.5rem] bg-gray-50/20 flex items-center justify-center overflow-hidden grayscale"
                                    >
                                        {form.approver_signature ? (
                                            <img src={base64ToPngDataUrl(form.approver_signature)} alt="Signature" className="max-h-full p-8" />
                                        ) : (
                                            <div className="text-center">
                                                <span className="text-xs text-gray-300 font-bold uppercase tracking-widest block">WAITING FOR ANALYST AUTHENTICATION</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center space-x-3 text-[11px] font-black tracking-widest">
                                        <div className={`w-3 h-3 rounded-full ${form.approver_signature ? 'bg-[#A0CF06]' : 'bg-gray-200'}`} />
                                        <span className={form.approver_signature ? 'text-[#211D1E]' : 'text-gray-300'}>
                                            {form.approver_signature ? 'DOCUMENT LEGALLY AUTHENTICATED' : 'SIGNATURE_VALIDATION_PENDING'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-end opacity-40">
                            <p className="text-[10px] text-gray-400 max-w-lg leading-relaxed font-medium italic">
                                This document is a certified extract from the PRO Dairy Quality Information System. All sensory and analytical results are binding and immutable.
                            </p>
                            <div className="text-right">
                                <div className="text-xs font-black text-gray-900 mb-1 uppercase tracking-tighter">QA_SYSTEM_v2.4.1</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Process Engineering Department</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Combined Styles */}
                <style jsx global>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .sheet-content, .sheet-content * {
                            visibility: visible !important;
                        }
                        .sheet-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 0 !important;
                        }
                        .sticky {
                            position: static !important;
                        }
                        .print-hidden {
                            display: none !important;
                        }
                        @page {
                            size: A4;
                            margin: 10mm;
                        }
                    }
                    .tablet-sheet-full {
                        animation: slide-up 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    }
                    @keyframes slide-up {
                        from { transform: translateY(15%); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}</style>
            </SheetContent>
        </Sheet>
    )
}
