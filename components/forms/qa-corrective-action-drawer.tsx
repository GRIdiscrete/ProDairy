"use client"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  fetchQACorrectiveActions
} from "@/lib/store/slices/qaCorrectiveActionSlice"
import { usersApi } from "@/lib/api/users"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import { QACorrectiveAction } from "@/lib/api/data-capture-forms"
import { ChevronRight, ChevronLeft, ArrowRight, AlertTriangle, Beaker, FileText } from "lucide-react"
import { createQACorrectiveActionAction, updateQACorrectiveActionAction } from "@/lib/store/slices/qaCorrectiveActionSlice"

interface QACorrectiveActionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action?: QACorrectiveAction | null
  mode?: "create" | "edit"
  processId?: string
}

// Combined schema: action fields + a single details object (in array)
const combinedSchema = yup.object({
  date_of_production: yup.string().required("Production date is required"),
  date_analysed: yup.string().required("Analysis date is required"),
  batch_number: yup.number().required("Batch number is required").min(1),
  product: yup.string().required("Product is required"),
  checked_by: yup.string().required("Checked by is required"),
  issue: yup.string().required("Issue description is required"),
  analyst: yup.string().required("Analyst is required"),
  qa_decision: yup.string().required("QA decision is required"),
  details: yup.array().of(yup.object({
    ph_after_7_days_at_30_degrees: yup.number().required("pH level is required"),
    packaging_integrity: yup.string().required("Packaging integrity is required"),
    defects: yup.string().required("Defects description is required")
  })).min(1)
})

type CombinedFormData = yup.InferType<typeof combinedSchema>

export function QACorrectiveActionDrawer({
  open,
  onOpenChange,
  action,
  mode = "create",
  processId
}: QACorrectiveActionDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.qaCorrectiveActions)

  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  const form = useForm<CombinedFormData>({
    resolver: yupResolver(combinedSchema),
    defaultValues: {
      date_of_production: "",
      date_analysed: "",
      batch_number: undefined,
      product: processId || "",
      checked_by: "",
      issue: "",
      analyst: "",
      qa_decision: "",
      details: [{
        ph_after_7_days_at_30_degrees: undefined,
        packaging_integrity: "",
        defects: ""
      }]
    }
  })

  // load users/roles when drawer opens
  useEffect(() => {
    const load = async () => {
      setDataLoading(true)
      try {
        const [uRes, rRes] = await Promise.all([usersApi.getUsers(), rolesApi.getRoles()])
        setUsers(uRes.data || [])
        setRoles(rRes.data || [])
      } catch (e) {
        console.error("Load users/roles failed", e)
      } finally {
        setDataLoading(false)
      }
    }
    if (open) load()
  }, [open])

  // populate when editing
  useEffect(() => {
    if (!open) return
    if (mode === "edit" && action) {
      const details = (action.details && Array.isArray(action.details) && action.details.length > 0) ? action.details[0] : (action.qa_corrective_action_details || {})
      form.reset({
        date_of_production: action.date_of_production || "",
        date_analysed: action.date_analysed || "",
        batch_number: action.batch_number ?? undefined,
        product: action.product || processId || "",
        checked_by: action.checked_by || "",
        issue: action.issue || "",
        analyst: action.analyst || "",
        qa_decision: action.qa_decision || "",
        details: [{
          ph_after_7_days_at_30_degrees: details.ph_after_7_days_at_30_degrees ?? undefined,
          packaging_integrity: details.packaging_integrity || "",
          defects: details.defects || ""
        }]
      })
    } else {
      form.reset({
        date_of_production: "",
        date_analysed: "",
        batch_number: undefined,
        product: processId || "",
        checked_by: "",
        issue: "",
        analyst: "",
        qa_decision: "",
        details: [{
          ph_after_7_days_at_30_degrees: undefined,
          packaging_integrity: "",
          defects: ""
        }]
      })
    }
  }, [open, mode, action, form, processId])

  const handleSubmit = async (data: CombinedFormData) => {
    try {
      const payload: any = {
        date_of_production: data.date_of_production,
        date_analysed: data.date_analysed,
        batch_number: String(data.batch_number),
        product: data.product,
        checked_by: data.checked_by,
        issue: data.issue,
        analyst: data.analyst,
        qa_decision: data.qa_decision,
        details: data.details // details is already an array
      }

      if (mode === "edit" && action?.id) {
        console.log('Yes Yes' + action?.qa_corrective_action_details?.id)
        await dispatch(updateQACorrectiveActionAction({
          ...payload,
          id: action.id,
          details: {
            ...payload.details,
            id: action?.qa_corrective_action_details?.id
          }
        })).unwrap()
        toast.success("QA Corrective Action updated successfully")
      } else {
        await dispatch(createQACorrectiveActionAction(payload)).unwrap()
        toast.success("QA Corrective Action created successfully")
      }

      // refresh list
      await dispatch(fetchQACorrectiveActions()).unwrap()
      onOpenChange(false)
    } catch (err: any) {
      const msg = err?.message || String(err) || "Failed to save"
      toast.error(msg)
    }
  }

  return (
    <Sheet open={open} onOpenChange={() => onOpenChange(false)}>
      <SheetContent className="tablet-sheet-full overflow-y-auto p-6 bg-white">
        <SheetHeader>
          <SheetTitle className="text-xl font-light">
            {mode === "create" ? "Add QA Corrective Action" : "Edit QA Corrective Action"}
          </SheetTitle>
          <SheetDescription>
            Enter corrective action and test details
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="mb-4">
            <div className="text-sm font-light">Enter full action details and associated test results below.</div>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Production Date *</Label>
                <Controller name="date_of_production" control={form.control} render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />} />
                {form.formState.errors.date_of_production && <p className="text-sm text-red-600">{form.formState.errors.date_of_production.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Analysis Date *</Label>
                <Controller name="date_analysed" control={form.control} render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />} />
                {form.formState.errors.date_analysed && <p className="text-sm text-red-600">{form.formState.errors.date_analysed.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Batch Number *</Label>
                <Controller name="batch_number" control={form.control} render={({ field }) => <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />} />
                {form.formState.errors.batch_number && <p className="text-sm text-red-600">{form.formState.errors.batch_number.message}</p>}
              </div>

              {/* <div className="space-y-2">
                <Label>Product *</Label>
                <Controller name="product" control={form.control} render={({ field }) => <Input {...field} />} />
                {form.formState.errors.product && <p className="text-sm text-red-600">{form.formState.errors.product.message}</p>}
              </div> */}

              <div className="space-y-2">
                <Label>Checked By *</Label>
                <Controller name="checked_by" control={form.control} render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    options={(users || []).map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` }))}
                    placeholder={dataLoading ? "Loading users..." : "Select checker"}
                    loading={dataLoading}
                  />
                )} />
                {form.formState.errors.checked_by && <p className="text-sm text-red-600">{form.formState.errors.checked_by.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Analyst *</Label>
                <Controller name="analyst" control={form.control} render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    options={(users || []).map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` }))}
                    placeholder={dataLoading ? "Loading users..." : "Select analyst"}
                    loading={dataLoading}
                  />
                )} />
                {form.formState.errors.analyst && <p className="text-sm text-red-600">{form.formState.errors.analyst.message}</p>}
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Issue Description *</Label>
                <Controller name="issue" control={form.control} render={({ field }) => <Textarea {...field} rows={3} />} />
                {form.formState.errors.issue && <p className="text-sm text-red-600">{form.formState.errors.issue.message}</p>}
              </div>

              <div className="col-span-2 space-y-2">
                <Label>QA Decision *</Label>
                <Controller name="qa_decision" control={form.control} render={({ field }) => <Textarea {...field} rows={3} />} />
                {form.formState.errors.qa_decision && <p className="text-sm text-red-600">{form.formState.errors.qa_decision.message}</p>}
              </div>

              {/* Details object (single entry in details array) */}
              <div className="col-span-2 grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>pH After 7 days at 30°C *</Label>
                  <Controller name="details" control={form.control} render={({ field }) => {
                    const val = (field.value && field.value[0] && field.value[0].ph_after_7_days_at_30_degrees) ?? ""
                    return <Input type="number" step="0.1" value={val} onChange={(e) => {
                      const v = e.target.value ? Number(e.target.value) : undefined
                      const newDetails = [{ ...(field.value?.[0] || {}), ph_after_7_days_at_30_degrees: v }]
                      field.onChange(newDetails)
                    }} />
                  }} />
                </div>

                <div className="space-y-2">
                  <Label>Packaging Integrity *</Label>
                  <Controller name="details" control={form.control} render={({ field }) => {
                    const val = (field.value && field.value[0] && field.value[0].packaging_integrity) || ""
                    return <Input value={val} onChange={(e) => {
                      const newDetails = [{ ...(field.value?.[0] || {}), packaging_integrity: e.target.value }]
                      field.onChange(newDetails)
                    }} />
                  }} />
                </div>

                <div className="space-y-2">
                  <Label>Defects *</Label>
                  <Controller name="details" control={form.control} render={({ field }) => {
                    const val = (field.value && field.value[0] && field.value[0].defects) || ""
                    return <Input value={val} onChange={(e) => {
                      const newDetails = [{ ...(field.value?.[0] || {}), defects: e.target.value }]
                      field.onChange(newDetails)
                    }} />
                  }} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-red-500 to-orange-500 text-white" disabled={operationLoading.create || operationLoading.update}>
                {mode === "create" ? "Create QA Action" : "Save Changes"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
