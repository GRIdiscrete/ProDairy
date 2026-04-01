import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export function RawMilkTestBeforeIntakeFormDrawer({ open, onOpenChange, form }) {
    // Printable Lab Sheet Layout
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="tablet-sheet-full p-0 bg-white min-w-[70vw]">
                <div className="print:bg-white print:p-8 p-6">
                    {/* HEADER SECTION */}
                    <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-6">
                        <div className="text-lg font-bold text-blue-900">PRO dairy</div>
                        <div className="text-xl font-semibold text-center text-gray-800">RAW MILK RESULT SLIP</div>
                        <div className="space-y-1 text-right text-xs">
                            <div>Document Number: <span className="font-medium">{form?.tag || "-"}</span></div>
                            <div>Issue Date: <span className="font-medium">{form?.date || "-"}</span></div>
                            <div>Approved By: <span className="font-medium">{form?.approved_by || "-"}</span></div>
                            <div>Form Number: <span className="font-medium">{form?.id || "-"}</span></div>
                        </div>
                    </div>

                    {/* Metadata Fields */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div><Label>DATE</Label><div className="font-medium">{form?.date || "-"}</div></div>
                        <div><Label>SOURCE</Label><div className="font-medium">{form?.route || "-"}</div></div>
                        <div><Label>TIME IN</Label><div className="font-medium">{form?.time_in || "-"}</div></div>
                        <div><Label>TIME OUT</Label><div className="font-medium">{form?.time_out || "-"}</div></div>
                        <div><Label>ANALYST</Label><div className="font-medium">{form?.analyst || "-"}</div></div>
                        <div><Label>RESULTS COLLECTED BY</Label><div className="font-medium">{form?.results_collected_by || "-"}</div></div>
                    </div>

                    {/* MAIN TABLE */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-400 print:border-black">
                            <thead>
                                <tr className="bg-gray-100 print:bg-white">
                                    <th className="border border-gray-400 print:border-black px-2 py-1 text-xs">Parameter</th>
                                    {form?.lab_test && Array.isArray(form.lab_test)
                                        ? form.lab_test.map((lt, idx) => (
                                                <th key={idx} className="border border-gray-400 print:border-black px-2 py-1 text-xs">
                                                    Result {idx + 1}<br />Compartment {lt.truck_compartment_number ?? idx + 1}
                                                </th>
                                            ))
                                        : <th className="border border-gray-400 print:border-black px-2 py-1 text-xs">Result 1</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Parameter Rows */}
                                {[
                                    { label: "Temperature", key: "temperature" },
                                    { label: "Time", key: "time" },
                                    { label: "OT", key: "ot" },
                                    { label: "Clot On Boil", key: "cob" },
                                    { label: "Alcohol", key: "alcohol" },
                                    { label: "Titrable Acidity", key: "titratable_acidity" },
                                    { label: "pH", key: "ph" },
                                    { label: "Resazurin", key: "resazurin" },
                                    { label: "Fat", key: "fat" },
                                    { label: "Protein", key: "protein" },
                                    { label: "LR/SNF", key: "lr_snf" },
                                    { label: "Total Solids", key: "total_solids" },
                                    { label: "FPD", key: "fpd" },
                                    { label: "SCC", key: "scc" },
                                    { label: "Density", key: "density" },
                                    { label: "Antibiotics", key: "antibiotics" },
                                    { label: "Remark", key: "remark" },
                                    { label: "Silo", key: "silo_name" },
                                ].map((param, i) => (
                                    <tr key={param.key} className="print:bg-white">
                                        <td className="border border-gray-400 print:border-black px-2 py-1 text-xs font-medium">{param.label}</td>
                                        {form?.lab_test && Array.isArray(form.lab_test)
                                            ? form.lab_test.map((lt, idx) => (
                                                    <td key={idx} className="border border-gray-400 print:border-black px-2 py-1 text-xs">
                                                        {lt[param.key] != null ? String(lt[param.key]) : ""}
                                                    </td>
                                                ))
                                            : <td className="border border-gray-400 print:border-black px-2 py-1 text-xs">{form?.lab_test?.[param.key] != null ? String(form.lab_test[param.key]) : ""}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Space for sample info and compartment numbers */}
                    <div className="mt-8 mb-4">
                        <div className="text-xs font-medium mb-2">Sample Information / Compartment Numbers:</div>
                        <div className="border border-gray-400 print:border-black min-h-[40px] p-2 bg-gray-50 print:bg-white"></div>
                    </div>

                    {/* Print Button */}
                    <div className="flex justify-end mt-6">
                        <Button type="button" className="print:hidden" onClick={() => window.print()}>
                            Print Sheet
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
