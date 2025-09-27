"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createRawMilkIntakeLabTest, updateRawMilkIntakeLabTest } from "@/lib/store/slices/rawMilkIntakeLabTestSlice"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"

const schema = yup.object({
  date: yup.string().required("Date is required"),
  organol_eptic: yup.string().required("Organoleptic is required"),
  no_water: yup.string().required("No water result is required"),
  no_starch: yup.string().required("No starch result is required"),
  milk_freshness: yup.string().required("Milk freshness is required"),
  bacteria_load: yup.string().required("Bacteria load is required"),
  accepted: yup.boolean().required(),
  scientist_id: yup.string().required("Scientist is required"),
})

export type LabTestFormData = yup.InferType<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  rawMilkIntakeFormId: string
  mode: "create" | "edit"
  existingId?: string
}

export function RawMilkIntakeLabTestDrawer({ open, onOpenChange, rawMilkIntakeFormId, mode, existingId }: Props) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((s) => (s as any).rawMilkIntakeLabTests)
  const [users, setUsers] = useState<SearchableSelectOption[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const form = useForm<LabTestFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      organol_eptic: "",
      no_water: "",
      no_starch: "",
      milk_freshness: "",
      bacteria_load: "",
      accepted: true,
      scientist_id: "",
    },
  })

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          setLoadingUsers(true)
          const res = await usersApi.getUsers()
          const opts = (res.data || []).map((u: any) => ({
            value: u.id,
            label: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
            description: `${u.email} • ${u.department || '-'}`,
          }))
          setUsers(opts)
        } catch (e) {
          toast.error("Failed to load users")
        } finally { setLoadingUsers(false) }
      })()
    }
  }, [open])

  const onSubmit = async (data: LabTestFormData) => {
    try {
      if (mode === "edit" && existingId) {
        await dispatch(updateRawMilkIntakeLabTest({ id: existingId, raw_milk_intake_id: rawMilkIntakeFormId, ...data })).unwrap()
        toast.success("Lab test updated")
      } else {
        await dispatch(createRawMilkIntakeLabTest({ raw_milk_intake_id: rawMilkIntakeFormId, ...data })).unwrap()
        toast.success("Lab test created")
      }
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e || "Failed to save lab test")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[60vw] sm:max-w-[60vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-lg font-light">{mode === "edit" ? "Update Lab Test" : "Create Lab Test"}</SheetTitle>
          <SheetDescription className="text-sm font-light">Capture or update laboratory results for this intake form</SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Controller name="date" control={form.control} render={({ field }) => (
                <DatePicker label=" " value={field.value} onChange={field.onChange} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Scientist</Label>
              <Controller name="scientist_id" control={form.control} render={({ field }) => (
                <SearchableSelect options={users} value={field.value} onValueChange={field.onChange} placeholder="Select scientist" loading={loadingUsers} />
              )} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organoleptic</Label>
              <Controller name="organol_eptic" control={form.control} render={({ field }) => (
                <Input placeholder="e.g., Normal" {...field} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>No Water</Label>
              <Controller name="no_water" control={form.control} render={({ field }) => (
                <Input placeholder="e.g., No water detected" {...field} />
              )} />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>No Starch</Label>
              <Controller name="no_starch" control={form.control} render={({ field }) => (
                <Input placeholder="e.g., No starch detected" {...field} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Milk Freshness</Label>
              <Controller name="milk_freshness" control={form.control} render={({ field }) => (
                <Input placeholder="e.g., Fresh" {...field} />
              )} />
            </div>
          </div>

          {/* Row 4 (full width) */}
          <div className="space-y-2">
            <Label>Bacteria Load</Label>
            <Controller name="bacteria_load" control={form.control} render={({ field }) => (
              <Textarea rows={3} placeholder="e.g., Within acceptable limits" {...field} />
            )} />
          </div>

          {/* Row 5 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Controller name="accepted" control={form.control} render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
              )} />
              <Label>Accepted</Label>
            </div>
            <Button type="submit" disabled={operationLoading.create || operationLoading.update} className="rounded-full">
              {mode === "edit" ? "Update Test" : "Create Test"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


