"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useAppDispatch } from "@/lib/store"
import {
  createFillerLog2PackageIntegrityAction,
  updateFillerLog2PackageIntegrityAction,
  fetchFillerLog2PackageIntegrities,
  fetchFillerLog2s
} from "@/lib/store/slices/fillerLog2Slice"
import { toast } from "sonner"
import { FillerLog2PackageIntegrity } from "@/lib/api/data-capture-forms"

interface PackageIntegrityDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrity: FillerLog2PackageIntegrity | null
  mode: "create" | "edit"
}

// Form Schema
const schema = yup.object({
  filler_log_2_id: yup.string().required("Filler Log 2 is required"),
  time: yup.string().required("Time is required"),
  target: yup.number().required("Target is required").min(0, "Must be a positive number"),
})

type FormData = yup.InferType<typeof schema>

export function PackageIntegrityDrawer({ 
  open, 
  onOpenChange, 
  integrity, 
  mode 
}: PackageIntegrityDrawerProps) {
  const dispatch = useAppDispatch()
  const [fillerLog2s, setFillerLog2s] = useState<any[]>([])

  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      filler_log_2_id: "",
      time: "",
      target: 0,
    },
  })

  // Load filler log 2s on component mount
  useEffect(() => {
    const loadFillerLog2s = async () => {
      try {
        const result = await dispatch(fetchFillerLog2s()).unwrap()
        setFillerLog2s(result || [])
      } catch (error) {
        console.error("Failed to load filler log 2s:", error)
      }
    }

    if (open) {
      loadFillerLog2s()
    }
  }, [open, dispatch])

  // Populate form when editing
  useEffect(() => {
    if (open && mode === "edit" && integrity) {
      form.reset({
        filler_log_2_id: integrity.filler_log_2_id || "",
        time: integrity.time || "",
        target: integrity.target || 0,
      })
    } else if (open && mode === "create") {
      form.reset()
    }
  }, [open, mode, integrity, form])

  const handleSubmit = async (data: FormData) => {
    try {
      if (mode === "edit" && integrity) {
        await dispatch(updateFillerLog2PackageIntegrityAction({
          ...integrity,
          ...data,
        })).unwrap()
        toast.success("Package Integrity updated successfully")
      } else {
        await dispatch(createFillerLog2PackageIntegrityAction(data)).unwrap()
        toast.success("Package Integrity created successfully")
      }

      // Refresh the list
      setTimeout(() => {
        dispatch(fetchFillerLog2PackageIntegrities())
      }, 1000)

      onOpenChange(false)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || "Failed to save package integrity"
      toast.error(errorMessage)
    }
  }

  const handleFillerLog2Search = async (query: string) => {
    if (!query.trim()) {
      return fillerLog2s.map((log) => ({
        value: log.id,
        label: `${log.sku} - ${log.shift} (${log.date})`,
        log
      }))
    }
    
    return fillerLog2s
      .filter((log) => 
        log.sku?.toLowerCase().includes(query.toLowerCase()) ||
        log.shift?.toLowerCase().includes(query.toLowerCase()) ||
        log.date?.toLowerCase().includes(query.toLowerCase())
      )
      .map((log) => ({
        value: log.id,
        label: `${log.sku} - ${log.shift} (${log.date})`,
        log
      }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>
            {mode === "edit" ? "Edit Package Integrity" : "Create Package Integrity"}
          </SheetTitle>
          <SheetDescription>
            Enter package integrity information and target values
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Controller
                  name="filler_log_2_id"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Filler Log 2 *"
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearch={handleFillerLog2Search}
                      placeholder="Search and select filler log 2"
                      error={!!form.formState.errors.filler_log_2_id}
                    />
                  )}
                />
                {form.formState.errors.filler_log_2_id && (
                  <p className="text-sm text-red-500">{form.formState.errors.filler_log_2_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  name="time"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      label="Time *"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                      showTime={true}
                      error={!!form.formState.errors.time}
                    />
                  )}
                />
                {form.formState.errors.time && (
                  <p className="text-sm text-red-500">{form.formState.errors.time.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target *</Label>
                <Controller
                  name="target"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="target"
                      type="number"
                      placeholder="Enter target value"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
                {form.formState.errors.target && (
                  <p className="text-sm text-red-500">{form.formState.errors.target.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 p-6 pt-0 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)}>
            {mode === "edit" ? "Update Package Integrity" : "Create Package Integrity"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
