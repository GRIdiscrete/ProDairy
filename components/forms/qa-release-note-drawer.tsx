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
import { fetchProductIncubations } from "@/lib/store/slices/productIncubationSlice"
import { rolesApi } from "@/lib/api/roles"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, Clock, TrendingUp, FileText, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const detailSchema = yup.object({
  release_date: yup.string().required("Release date required"),
  mnf_date: yup.string().required("Manufacture date required"),
  batch_no: yup.string().required("Batch number required"),
  pack_size_ml: yup.number().nullable(),
  product: yup.string().nullable().transform((value) => value || null),
  status: yup.string().required(),
  pallets_on_hold: yup.number().nullable(),
  hold_times: yup.number().nullable()
})

const schema = yup.object({
  approved_by: yup.string().nullable(),
  approver_signature: yup.string().nullable(),
  incubation_tracking_form_tag: yup.string().nullable(),
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
  const { user } = useAuth()
  const { operationLoading } = useAppSelector((s:any) => s.qaReleaseNotes || {})
  const { incubations } = useAppSelector((state) => state.productIncubations)
  const [roles, setRoles] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [signatureViewerOpen, setSignatureViewerOpen] = useState(false)
  const [selectedIncubation, setSelectedIncubation] = useState<any>(null)

  const form = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      approved_by: user?.id || "",
      approver_signature: "",
      incubation_tracking_form_tag: "",
      details: [{
        release_date: "",
        mnf_date: "",
        batch_no: "",
        pack_size_ml: undefined,
        product: processId ? String(processId) : "",
        status: "Pending",
        pallets_on_hold: undefined,
        hold_times: undefined
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
        // Load incubation forms
        dispatch(fetchProductIncubations())
      } catch (err) {
        console.error(err)
      } finally { setLoadingRoles(false) }
    }
    loadLookups()
  }, [open, dispatch])

  useEffect(() => {
    if (open && mode === "edit" && note) {
      // Extract the tag from incubation_tracking_form_tag (can be object or null)
      const incubationTag = note.incubation_tracking_form_tag?.tag || ""
      
      form.reset({
        approved_by: note.approved_by || "",
        approver_signature: note.approver_signature || "",
        incubation_tracking_form_tag: incubationTag,
        details: (note.qa_release_note_details && note.qa_release_note_details.length > 0) ? note.qa_release_note_details.map((d:any) => ({
          id: d.id,
          release_date: d.release_date,
          mnf_date: d.mnf_date,
          batch_no: d.batch_no,
          pack_size_ml: d.pack_size_ml,
          product: d.product?.id ? String(d.product.id) : (d.product ? String(d.product) : ""),
          status: d.status,
          pallets_on_hold: d.pallets_on_hold,
          hold_times: d.hold_times
        })) : [{
          release_date: "",
          mnf_date: "",
          batch_no: "",
          pack_size_ml: undefined,
          product: processId ? String(processId) : "",
          status: "Pending",
          pallets_on_hold: undefined,
          hold_times: undefined
        }]
      })
      // Set selected incubation if tag exists
      if (incubationTag) {
        const foundIncubation = incubations.find((inc: any) => inc.tag === incubationTag)
        if (foundIncubation) {
          setSelectedIncubation(foundIncubation)
        }
      }
    }
    if (!open && mode === "create") {
      form.reset({
        approved_by: user?.id || "",
        approver_signature: "",
        incubation_tracking_form_tag: "",
        details: [{
          release_date: "",
          mnf_date: "",
          batch_no: "",
          pack_size_ml: undefined,
          product: processId ? String(processId) : "",
          status: "Pending",
          pallets_on_hold: undefined,
          hold_times: undefined
        }]
      })
      setSelectedIncubation(null)
    }
  }, [open, mode, note, form, processId, incubations, user])

  const onSubmit = async (data: FormData) => {
    try {
      const payload: any = {
        approved_by: data.approved_by || null,
        approver_signature: data.approver_signature || null,
        incubation_tracking_form_tag: data.incubation_tracking_form_tag || null,
        details: (data.details || []).map(detail => ({
          ...(detail as any).id ? { id: (detail as any).id } : {},
          release_date: detail.release_date,
          mnf_date: detail.mnf_date,
          batch_no: detail.batch_no,
          pack_size_ml: detail.pack_size_ml ?? null,
          product: detail.product,
          status: detail.status,
          pallets_on_hold: detail.pallets_on_hold ?? null,
          hold_times: detail.hold_times ?? null
        }))
      }
      
      if (mode === "edit" && note?.id) {
        await dispatch(updateQaReleaseNoteAction({ id: note.id, tag: note.tag, ...payload })).unwrap()
        toast.success("QA Release Note updated successfully", {
          style: {
            background: '#10b981',
            color: 'white'
          }
        })
      } else {
        await dispatch(createQaReleaseNoteAction(payload)).unwrap()
        toast.success("QA Release Note created successfully", {
          style: {
            background: '#10b981',
            color: 'white'
          }
        })
      }
      await dispatch(fetchQaReleaseNotes()).unwrap()
      onOpenChange(false)
    } catch (err:any) {
      console.error("❌ Submit Error:", err)
      toast.error(err?.message || String(err) || "Failed to save", {
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626'
        }
      })
    }
  }

  const handleFormSubmit = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    
    // Trigger form validation
    const isValid = await form.trigger()
    
    if (!isValid) {
      const errors = form.formState.errors
      const errorMessages: string[] = []
      
      // Collect all error messages
      if (errors.incubation_tracking_form_tag?.message) {
        errorMessages.push(errors.incubation_tracking_form_tag.message)
      }
      if (errors.approved_by?.message) {
        errorMessages.push(errors.approved_by.message)
      }
      if (errors.details) {
        const detailsErrors = errors.details as any
        if (Array.isArray(detailsErrors) && detailsErrors[0]) {
          const firstDetail = detailsErrors[0]
          if (firstDetail.batch_no?.message) errorMessages.push(firstDetail.batch_no.message)
          if (firstDetail.mnf_date?.message) errorMessages.push(firstDetail.mnf_date.message)
          if (firstDetail.release_date?.message) errorMessages.push(firstDetail.release_date.message)
          if (firstDetail.product?.message) errorMessages.push(firstDetail.product.message)
          if (firstDetail.status?.message) errorMessages.push(firstDetail.status.message)
        }
      }
      
      // Show each error in a red toast
      if (errorMessages.length > 0) {
        errorMessages.forEach(error => {
          toast.error(error, {
            style: {
              background: '#ef4444',
              color: 'white',
              border: '1px solid #dc2626'
            }
          })
        })
      } else {
        toast.error("Please fill all required fields", {
          style: {
            background: '#ef4444',
            color: 'white',
            border: '1px solid #dc2626'
          }
        })
      }
      return
    }
    
    // Call submit
    form.handleSubmit(onSubmit)()
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Select Incubation Form *</Label>
                  <Controller
                    name="incubation_tracking_form_tag"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Select 
                          value={field.value || undefined} 
                          onValueChange={(val) => {
                            field.onChange(val)
                            const foundIncubation = incubations.find((inc: any) => inc.tag === val)
                            setSelectedIncubation(foundIncubation || null)
                            
                            // Auto-populate batch number and dates from selected incubation
                            if (foundIncubation?.batch) {
                              const currentDetails = form.getValues("details") || []
                              const updatedDetails = [...currentDetails]
                              updatedDetails[0] = {
                                ...updatedDetails[0],
                                batch_no: String(foundIncubation.batch.batch_number || ""),
                                mnf_date: foundIncubation.batch.manufacture_date || "",
                              }
                              form.setValue("details", updatedDetails)
                            }
                          }}
                        >
                          <SelectTrigger className="rounded-full border-gray-200 h-10 px-3">
                            <SelectValue placeholder="Select incubation form" />
                          </SelectTrigger>
                          <SelectContent>
                            {incubations.map((inc: any) => (
                              <SelectItem key={inc.id} value={inc.tag}>
                                {inc.tag} - Batch #{inc.batch?.batch_number || 'N/A'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div>
                  <Label className="mb-2">Approved By (User) *</Label>
                  <Controller
                    name="approved_by"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <SearchableSelect
                          options={roles.map(r => ({ value: r.id, label: r.role_name }))}
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          onSearch={handleUserSearch}
                          placeholder="Search approver"
                          loading={loadingRoles}
                        />
                        {fieldState.error && (
                          <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Incubation Data Display */}
              {selectedIncubation && (
                <Card className="border-l-4 border-l-[#006BC4]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-light flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-blue-600" />
                      Incubation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">Batch Number</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 font-light">
                          #{selectedIncubation.batch?.batch_number || 'N/A'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">Days</span>
                        </div>
                        <p className="text-sm font-medium">{selectedIncubation.batch?.days || 'N/A'} days</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">MNF Date</span>
                        </div>
                        <p className="text-sm font-medium">
                          {selectedIncubation.batch?.manufacture_date 
                            ? new Date(selectedIncubation.batch.manufacture_date).toLocaleDateString() 
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">Best Before</span>
                        </div>
                        <p className="text-sm font-medium">
                          {selectedIncubation.batch?.best_before_date 
                            ? new Date(selectedIncubation.batch.best_before_date).toLocaleDateString() 
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500">Time In</span>
                        <p className="text-sm font-medium">{selectedIncubation.batch?.time_in || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500">Expected Out</span>
                        <p className="text-sm font-medium">{selectedIncubation.batch?.expected_time_out || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* single detail entry UI (supporting array but render first element) */}
              <div className="border p-4 rounded-md bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Detail</h4>
                <Controller name="details" control={form.control} render={({ field, fieldState }) => {
                  const ds = field.value || []
                  const d = ds[0] || {}
                  const detailErrors = (fieldState.error as any)?.[0]
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      {/* keep product value but hide the editable input; show read-only text */}
                      {/* <div>
                        <Label className="mb-2">Product</Label>
                        <input type="hidden" value={d.product || ""} />
                        <div className="text-sm font-light text-gray-700">{d.product || processId || "N/A"}</div>
                      </div> */}

                      <div>
                        <Label className="mb-2">Batch No *</Label>
                        <Input 
                          value={d.batch_no || ""} 
                          onChange={(e) => {
                            const nv = [...ds]; nv[0] = { ...(nv[0]||{}), batch_no: e.target.value }; field.onChange(nv)
                          }}
                          className={detailErrors?.batch_no ? "border-red-500" : ""}
                        />
                        {detailErrors?.batch_no && (
                          <p className="text-xs text-red-500 mt-1">{detailErrors.batch_no.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="mb-2">Manufacture Date *</Label>
                        <DatePicker 
                          value={d.mnf_date || ""} 
                          onChange={(v) => {
                            const nv = [...ds]; nv[0] = { ...(nv[0]||{}), mnf_date: v }; field.onChange(nv)
                          }}
                        />
                        {detailErrors?.mnf_date && (
                          <p className="text-xs text-red-500 mt-1">{detailErrors.mnf_date.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="mb-2">Release Date *</Label>
                        <DatePicker 
                          value={d.release_date || ""} 
                          onChange={(v) => {
                            const nv = [...ds]; nv[0] = { ...(nv[0]||{}), release_date: v }; field.onChange(nv)
                          }}
                        />
                        {detailErrors?.release_date && (
                          <p className="text-xs text-red-500 mt-1">{detailErrors.release_date.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="mb-2">Pack Size (ml)</Label>
                        <Input type="number" value={d.pack_size_ml ?? ""} onChange={(e) => {
                          const val = e.target.value;
                          const num = val === "" ? undefined : Number(val);
                          const nv = [...ds]; nv[0] = { ...(nv[0]||{}), pack_size_ml: num }; field.onChange(nv)
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
                        <Input type="number" value={d.pallets_on_hold ?? ""} onChange={(e) => {
                          const val = e.target.value;
                          const num = val === "" ? undefined : Number(val);
                          const nv = [...ds]; nv[0] = { ...(nv[0]||{}), pallets_on_hold: num }; field.onChange(nv)
                        }} />
                      </div>
                      <div>
                        <Label className="mb-2">Hold Batches</Label>
                        <Input type="number" value={d.hold_times ?? ""} onChange={(e) => {
                          const val = e.target.value;
                          const num = val === "" ? undefined : Number(val);
                          const nv = [...ds]; nv[0] = { ...(nv[0]||{}), hold_times: num }; field.onChange(nv)
                        }} />
                      </div>
                    </div>
                  )
                }} />
              </div>

              <div>
                <Label className="mb-2">Release Signature</Label>
                <Controller name="approver_signature" control={form.control} render={({ field }) => (
                  <div className="space-y-2">
                    {field.value ? (
                      <img src={base64ToPngDataUrl(field.value)} alt="Release Signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                    ) : (
                      <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                        No signature captured
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm"  onClick={() => setSignatureModalOpen(true)}>Add Signature</Button>
                      {field.value && <Button type="button" size="sm"  onClick={() => setSignatureViewerOpen(true)}>View Signature</Button>}
                      {field.value && <Button type="button" size="sm" variant="ghost" onClick={() => field.onChange("")}>Clear</Button>}
                    </div>
                  </div>
                )} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end p-6 pt-0 border-t bg-white">
          <div className="flex items-center gap-2">
            <Button  onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleFormSubmit} disabled={operationLoading?.create || operationLoading?.update}>
              {mode === "edit" ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Signature modal & viewer */}
      <SignatureModal open={signatureModalOpen} onOpenChange={setSignatureModalOpen} onSave={(sig) => {
        form.setValue("approver_signature", sig)
        setSignatureModalOpen(false)
      }} title="Release Signature" />

      <SignatureViewer open={signatureViewerOpen} onOpenChange={setSignatureViewerOpen} value={form.getValues("approver_signature") || ""} title="Release Signature" />
    </Sheet>
  )
}
