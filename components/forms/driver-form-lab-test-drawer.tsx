"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createDriverFormLabTest, updateDriverFormLabTest } from "@/lib/store/slices/driverFormLabTestSlice"
import { toast } from "sonner"

const schema = yup.object({
  date: yup.string().required("Date is required"),
  organol_eptic: yup.string().required("Organoleptic is required"),
  alcohol: yup.number().nullable(),
  cob: yup.boolean().nullable(),
  accepted: yup.boolean().required(),
  remarks: yup.string(),
})

export type DriverFormLabTestFormData = yup.InferType<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectedProductId: string
  collectedProduct?: any,
  mode: "create" | "edit"
  existingId?: string
  existingData?: any
}

export function DriverFormLabTestDrawer({ open, onOpenChange, collectedProductId, mode, existingId, existingData, collectedProduct }: Props) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((s) => (s as any).driverFormLabTests)


  const form = useForm<DriverFormLabTestFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      organol_eptic: "",
      alcohol: null,
      cob: null,
      accepted: true,
      remarks: "",
    },
  })

  useEffect(() => {
    if (open) {
      // Load existing data if in edit mode
      if (mode === "edit" && existingData) {
        form.reset({
          date: existingData.date || new Date().toISOString().split("T")[0],
          organol_eptic: existingData.organol_eptic || "",
          alcohol: existingData.alcohol || null,
          cob: existingData.cob || null,
          accepted: existingData.accepted ?? true,
          remarks: existingData.remarks || "",
        })
      } else {
        form.reset({
          date: new Date().toISOString().split("T")[0],
          organol_eptic: "",
          alcohol: null,
          cob: null,
          accepted: true,
          remarks: "",
        })
      }


    }
  }, [open, mode, existingData, form])

  const onSubmit = async (data: DriverFormLabTestFormData) => {
    try {
      if (mode === "edit" && existingId) {
        await dispatch(updateDriverFormLabTest({
          id: existingId,
          collected_product_id: collectedProductId,
          ...data
        })).unwrap()
        toast.success("Milk Test updated")
      } else {
        await dispatch(createDriverFormLabTest({
          collected_product_id: collectedProductId,
          ...data
        })).unwrap()
        toast.success("Milk Test created")
      }
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e || "Failed to save Milk Test")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-lg font-light">{mode === "edit" ? "Update Milk Test" : "Create Milk Test"}</SheetTitle>
          <SheetDescription className="text-sm font-light">Capture or update laboratory results for this driver form</SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Row 1 - Date and Organoleptic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Controller name="date" control={form.control} render={({ field }) => (
                <DatePicker label=" " value={field.value} onChange={field.onChange} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Organoleptic</Label>
              <Controller name="organol_eptic" control={form.control} render={({ field }) => (
                <Input placeholder="e.g., Normal" {...field} />
              )} />
            </div>
          </div>

          {/* Row 2 - Alcohol (single column) */}
          <div className="space-y-2">
            <Label>Alcohol</Label>
            <Controller name="alcohol" control={form.control} render={({ field }) => (
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 22"
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
              />
            )} />
          </div>

          {/* Row 3 - Remarks (single column) */}
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Controller name="remarks" control={form.control} render={({ field }) => (
              <Textarea rows={2} placeholder="Additional remarks..." {...field} />
            )} />
          </div>

          {/* Row 4 - COB and Accepted */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>COB</Label>
              <Controller name="cob" control={form.control} render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                  <Label>COB Detected</Label>
                </div>
              )} />
            </div>
            <div className="space-y-2">
              <Label>Accepted</Label>
              <Controller name="accepted" control={form.control} render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                  <Label>Sample Accepted</Label>
                </div>
              )} />
            </div>
          </div>

          {/* Row 5 - Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={operationLoading.create || operationLoading.update} className="rounded-full">
              {mode === "edit" ? "Update Test" : "Create Test"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
