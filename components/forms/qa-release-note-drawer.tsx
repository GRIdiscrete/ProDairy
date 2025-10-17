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
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createQaReleaseNoteAction, updateQaReleaseNoteAction, fetchQaReleaseNotes } from "@/lib/store/slices/qaReleaseNoteSlice"
import { rolesApi } from "@/lib/api/roles"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl } from "@/lib/utils/signature"

const detailSchema = yup.object({
  release_date: yup.string().required("Release date required"),
  mnf_date: yup.string().required("Manufacture date required"),
  batch_no: yup.string().required("Batch number required"),
  pack_size_ml: yup.number().required().min(1),
  product: yup.string().required("Product required"),
  status: yup.string().required(),
  pallets_on_hold: yup.number().nullable(),
  hold_times: yup.number().nullable()
})

const schema = yup.object({
  approved_by: yup.string().nullable(),
  approver_signature: yup.string().nullable(),
  details: yup.array().of(detailSchema).min(1)
})

type FormData = yup.InferType<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (b: boolean) => void
  note?: any | null
  mode?: "create" | "edit"
  processId?: string
}

export function QaReleaseNoteDrawer({ open, onOpenChange, note, mode = "create", processId }: Props) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((s:any) => s.qaReleaseNotes || {})
  const [roles, setRoles] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [signatureViewerOpen, setSignatureViewerOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      approved_by: "",
      approver_signature: "",
      details: [{
        release_date: "",
        mnf_date: "",
        batch_no: "",
        pack_size_ml: 1000,
        product: processId || "",
        status: "Pending",
        pallets_on_hold: 0,
        hold_times: 0
      }]
    }
  })

  useEffect(() => {
    if (!open) return
    const loadLookups = async () => {
      setLoadingRoles(true)
      try {
        const r = await rolesApi.getRoles()
        setRoles(r.data || [])
      } catch (err) {
        console.error(err)
      } finally { setLoadingRoles(false) }
    }
    loadLookups()
  }, [open])

  useEffect(() => {
    if (open && mode === "edit" && note) {
      form.reset({
        approved_by: note.approved_by || "",
        approver_signature: note.approver_signature || "",
        details: (note.qa_release_note_details && note.qa_release_note_details.length > 0) ? note.qa_release_note_details.map((d:any) => ({
          id: d.id,
          release_date: d.release_date,
          mnf_date: d.mnf_date,
          batch_no: d.batch_no,
          pack_size_ml: d.pack_size_ml,
          product: d.product,
          status: d.status,
          pallets_on_hold: d.pallets_on_hold,
          hold_times: d.hold_times
        })) : [{
          release_date: "",
          mnf_date: "",
          batch_no: "",
          pack_size_ml: 1000,
          product: processId || "",
          status: "Pending",
          pallets_on_hold: 0,
          hold_times: 0
        }]
      })
    }
    if (!open && mode === "create") {
      form.reset({
        approved_by: "",
        approver_signature: "",
        details: [{
          release_date: "",
          mnf_date: "",
          batch_no: "",
          pack_size_ml: 1000,
          product: processId || "",
          status: "Pending",
          pallets_on_hold: 0,
          hold_times: 0
        }]
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
        await dispatch(updateQaReleaseNoteAction({ id: note.id, ...payload })).unwrap()
        toast.success("QA Release Note updated")
      } else {
        await dispatch(createQaReleaseNoteAction(payload)).unwrap()
        toast.success("QA Release Note created")
      }
      await dispatch(fetchQaReleaseNotes()).unwrap()
      onOpenChange(false)
    } catch (err:any) {
      console.error(err)
      toast.error(err?.message || String(err) || "Failed to save")
    }
  }

  const handleUserSearch = async (q: string) => {
    if (!q.trim()) return []
    try {
      const res = await rolesApi.getRoles({ filters: { search: q }})
      return (res.data || []).map((r:any) => ({ value: r.id, label: r.role_name }))
    } catch (err) {
      return []
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>{mode === "edit" ? "Edit QA Release Note" : "Create QA Release Note"}</SheetTitle>
          <SheetDescription>Enter QA release note details</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="mb-2">Approved By (Role)</Label>
                <Controller
                  name="approved_by"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={roles.map(r => ({ value: r.id, label: r.role_name }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearch={handleUserSearch}
                      placeholder="Search approver role"
                      loading={loadingRoles}
                    />
                  )}
                />
              </div>

              <div>
                <Label className="mb-2">Approver Signature</Label>
                <Controller name="approver_signature" control={form.control} render={({ field }) => (
                  <div className="space-y-2">
                    {field.value ? (
                      <img src={base64ToPngDataUrl(field.value)} alt="Approver signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                    ) : (
                      <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                        No signature captured
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => setSignatureModalOpen(true)}>Add Signature</Button>
                      {field.value && <Button type="button" size="sm" variant="outline" onClick={() => setSignatureViewerOpen(true)}>View Signature</Button>}
                      {field.value && <Button type="button" size="sm" variant="ghost" onClick={() => field.onChange("")}>Clear</Button>}
                    </div>
                  </div>
                )} />
              </div>

              {/* single detail entry UI (supporting array but render first element) */}
              <div className="border p-4 rounded-md bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Detail</h4>
                <Controller name="details" control={form.control} render={({ field }) => {
                  const ds = field.value || []
                  const d = ds[0] || {}
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      {/* keep product value but hide the editable input; show read-only text */}
                      {/* <div>
                        <Label className="mb-2">Product</Label>
                        <input type="hidden" value={d.product || ""} />
                        <div className="text-sm font-light text-gray-700">{d.product || processId || "N/A"}</div>
                      </div> */}

                      <div>
                        <Label className="mb-2">Batch No</Label>
                        <Input value={d.batch_no || ""} onChange={(e) => {
                          const nv = [...ds]; nv[0] = { ...(nv[0]||{}), batch_no: e.target.value }; field.onChange(nv)
                        }} />
                      </div>
                      <div>
                        <Label className="mb-2">Manufacture Date</Label>
                        <DatePicker value={d.mnf_date || ""} onChange={(v) => {
                          const nv = [...ds]; nv[0] = { ...(nv[0]||{}), mnf_date: v }; field.onChange(nv)
                        }} />
                      </div>
                      <div>
                        <Label className="mb-2">Release Date</Label>
                        <DatePicker value={d.release_date || ""} onChange={(v) => {
                          const nv = [...ds]; nv[0] = { ...(nv[0]||{}), release_date: v }; field.onChange(nv)
                        }} />
                      </div>
                      <div>
                        <Label className="mb-2">Pack Size (ml)</Label>
                        <Input type="number" value={d.pack_size_ml || 1000} onChange={(e) => {
                          const nv = [...ds]; nv[0] = { ...(nv[0]||{}), pack_size_ml: Number(e.target.value) }; field.onChange(nv)
                        }} />
                      </div>
                      <div>
                        <Label className="mb-2">Status</Label>
                        {/* use shadcn Select to match incubation UI */}
                        <div>
                          <Select value={d.status || "Pending"} onValueChange={(val) => {
                            const nv = [...ds]; nv[0] = { ...(nv[0]||{}), status: val }; field.onChange(nv)
                          }}>
                            <SelectTrigger className="rounded-full border-gray-200 h-10 px-3">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2">Pallets On Hold</Label>
                        <Input type="number" value={d.pallets_on_hold ?? 0} onChange={(e) => {
                          const nv = [...ds]; nv[0] = { ...(nv[0]||{}), pallets_on_hold: Number(e.target.value) }; field.onChange(nv)
                        }} />
                      </div>
                      <div>
                        <Label className="mb-2">Hold Times</Label>
                        <Input type="number" value={d.hold_times ?? 0} onChange={(e) => {
                          const nv = [...ds]; nv[0] = { ...(nv[0]||{}), hold_times: Number(e.target.value) }; field.onChange(nv)
                        }} />
                      </div>
                    </div>
                  )
                }} />
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end p-6 pt-0 border-t bg-white">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={operationLoading?.create || operationLoading?.update}>
              {mode === "edit" ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Signature modal & viewer */}
      <SignatureModal open={signatureModalOpen} onOpenChange={setSignatureModalOpen} onSave={(sig) => {
        form.setValue("approver_signature", sig)
        setSignatureModalOpen(false)
      }} title="Approver Signature" />

      <SignatureViewer open={signatureViewerOpen} onOpenChange={setSignatureViewerOpen} value={form.getValues("approver_signature") || ""} title="Approver Signature" />
    </Sheet>
  )
}
