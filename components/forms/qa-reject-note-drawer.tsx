"use client"
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { rolesApi } from "@/lib/api/roles"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createQaRejectNoteAction, updateQaRejectNoteAction, fetchQaRejectNotes } from "@/lib/store/slices/qaRejectNoteSlice"
import { toast } from "sonner"

const schema = yup.object({
    approved_by: yup.string().nullable(),
    approver_signature: yup.string().nullable(),
    details: yup.object({
        reject_date: yup.string().required(),
        mnf_date: yup.string().required(),
        batch_no: yup.string().required(),
        pack_size: yup.number().required(),
        product: yup.string().required(),
        status: yup.string().required(),
        pallets_rejected: yup.number().nullable(),
        reason: yup.string().nullable()
    })
})

type FormData = yup.InferType<typeof schema>

interface Props {
    open: boolean
    onOpenChange: (b: boolean) => void
    note?: any | null
    mode?: "create" | "edit"
    processId?: string
}

export function QaRejectNoteDrawer({ open, onOpenChange, note, mode = "create", processId }: Props) {
    const dispatch = useAppDispatch()
    const { operationLoading } = useAppSelector((s: any) => s.qaRejectNotes || {})
    const [roles, setRoles] = useState<any[]>([])
    const [loadingRoles, setLoadingRoles] = useState(false)
    const [sigModalOpen, setSigModalOpen] = useState(false)
    const [sigViewOpen, setSigViewOpen] = useState(false)

    const form = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            approved_by: "",
            approver_signature: "",
            details: {
                reject_date: "",
                mnf_date: "",
                batch_no: "",
                pack_size: 1000,
                product: processId || "",
                status: "Rejected",
                pallets_rejected: 0,
                reason: ""
            }
        }
    })

    useEffect(() => {
        if (!open) return
        setLoadingRoles(true)
        rolesApi.getRoles().then(r => setRoles(r.data || [])).catch(() => { }).finally(() => setLoadingRoles(false))
    }, [open])

    useEffect(() => {
        if (open && mode === "edit" && note) {
            const d = note.qa_reject_note_details && note.qa_reject_note_details[0] ? note.qa_reject_note_details[0] : (note.details_id || {})
            form.reset({
                approved_by: note.approved_by || "",
                approver_signature: note.approver_signature || "",
                details: {
                    reject_date: d.reject_date || "",
                    mnf_date: d.mnf_date || "",
                    batch_no: d.batch_no || "",
                    pack_size: d.pack_size || 1000,
                    product: d.product || processId || "",
                    status: d.status || "Rejected",
                    pallets_rejected: d.pallets_rejected ?? 0,
                    reason: d.reason || ""
                }
            })
        } else if (!open && mode === "create") {
            form.reset({
                approved_by: "",
                approver_signature: "",
                details: {
                    reject_date: "",
                    mnf_date: "",
                    batch_no: "",
                    pack_size: 1000,
                    product: processId || "",
                    status: "Rejected",
                    pallets_rejected: 0,
                    reason: ""
                }
            })
        }
    }, [open, mode, note, form, processId])

    const onSubmit = async (data: FormData) => {
        try {
            const payload: any = {
                approved_by: data.approved_by,
                approver_signature: data.approver_signature,
                details: data.details
            }
            if (mode === "edit" && note?.id) {


                await dispatch(updateQaRejectNoteAction({
                    ...payload, id: note.id, details: {
                        ...payload.details,
                        id: note.details_id?.id
                    }
                })).unwrap()
                toast.success("QA Reject Note updated")
            } else {
                await dispatch(createQaRejectNoteAction(payload)).unwrap()
                toast.success("QA Reject Note created")
            }
            await dispatch(fetchQaRejectNotes()).unwrap()
            onOpenChange(false)
        } catch (err: any) {
            toast.error(err?.message || String(err) || "Failed to save")
        }
    }

    const handleSearchRoles = async (q: string) => {
        if (!q.trim()) return []
        try {
            const res = await rolesApi.getRoles({ filters: { search: q } })
            return (res.data || []).map((r: any) => ({ value: r.id, label: r.role_name }))
        } catch {
            return []
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="tablet-sheet-full p-0 bg-white">
                <SheetHeader className="p-6 pb-0 bg-white">
                    <SheetTitle>{mode === "edit" ? "Edit QA Reject Note" : "Create QA Reject Note"}</SheetTitle>
                    <SheetDescription>Enter QA reject note details</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label className="mb-2">Approved By (Role)</Label>
                            <Controller name="approved_by" control={form.control} render={({ field }) => (
                                <SearchableSelect
                                    options={roles.map(r => ({ value: r.id, label: r.role_name }))}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    onSearch={handleSearchRoles}
                                    placeholder="Search approver role"
                                    loading={loadingRoles}
                                />
                            )} />
                        </div>

                        <div>
                            <Label className="mb-2">Approver Signature</Label>
                            <Controller name="approver_signature" control={form.control} render={({ field }) => (
                                <div className="space-y-2">
                                    {field.value ? <img src={base64ToPngDataUrl(field.value)} className="h-24 border rounded-md" alt="sig" /> : <div className="h-24 border border-dashed rounded-md flex items-center justify-center text-xs text-gray-500">No signature</div>}
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm"  onClick={() => setSigModalOpen(true)}>Add Signature</Button>
                                        {field.value && <Button type="button" size="sm"  onClick={() => setSigViewOpen(true)}>View</Button>}
                                        {field.value && <Button type="button" size="sm" variant="ghost" onClick={() => field.onChange("")}>Clear</Button>}
                                    </div>
                                </div>
                            )} />
                        </div>

                        <div className="border p-4 rounded-md bg-gray-50">
                            <h4 className="text-sm font-medium mb-2">Detail</h4>
                            <Controller name="details" control={form.control} render={({ field }) => {
                                const d = field.value || {}
                                return (
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* <div>
                                            <Label className="mb-2">Product</Label>
                                            <input type="hidden" value={d.product || ""} />
                                            <div className="text-sm font-light">{d.product || processId || "N/A"}</div>
                                        </div> */}

                                        <div>
                                            <Label className="mb-2">Batch No</Label>
                                            <Input value={d.batch_no || ""} onChange={(e) => { const nv = { ...(field.value || {}), batch_no: e.target.value }; field.onChange(nv) }} />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Manufacture Date</Label>
                                            <DatePicker value={d.mnf_date || ""} onChange={(v) => { const nv = { ...(field.value || {}), mnf_date: v }; field.onChange(nv) }} />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Reject Date</Label>
                                            <DatePicker value={d.reject_date || ""} onChange={(v) => { const nv = { ...(field.value || {}), reject_date: v }; field.onChange(nv) }} />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Pack Size</Label>
                                            <Input type="number" value={d.pack_size || 1000} onChange={(e) => { const nv = { ...(field.value || {}), pack_size: Number(e.target.value) }; field.onChange(nv) }} />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Status</Label>
                                            <Select value={d.status || "Rejected"} onValueChange={(val) => { const nv = { ...(field.value || {}), status: val }; field.onChange(nv) }}>
                                                <SelectTrigger className="rounded-full border-gray-200 h-10 px-3"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="mb-2">Pallets Rejected</Label>
                                            <Input type="number" value={d.pallets_rejected || 0} onChange={(e) => { const nv = { ...(field.value || {}), pallets_rejected: Number(e.target.value) }; field.onChange(nv) }} />
                                        </div>

                                        <div className="col-span-2">
                                            <Label className="mb-2">Reason</Label>
                                            <Input value={d.reason || ""} onChange={(e) => { const nv = { ...(field.value || {}), reason: e.target.value }; field.onChange(nv) }} />
                                        </div>
                                    </div>
                                )
                            }} />
                        </div>
                    </form>
                </div>

                <div className="flex items-center justify-end p-6 pt-0 border-t bg-white">
                    <div className="flex items-center gap-2">
                        <Button  onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={operationLoading?.create || operationLoading?.update}>{mode === "edit" ? "Update" : "Create"}</Button>
                    </div>
                </div>
            </SheetContent>

            <SignatureModal open={sigModalOpen} onOpenChange={setSigModalOpen} onSave={(sig) => { form.setValue("approver_signature", sig); setSigModalOpen(false) }} title="Approver Signature" />
            <SignatureViewer open={sigViewOpen} onOpenChange={setSigViewOpen} value={form.getValues("approver_signature") || ""} title="Approver Signature" />
        </Sheet>
    )
}
