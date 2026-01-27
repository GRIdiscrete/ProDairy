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
  createFillerLog2PackageIntegrityParametersAction,
  updateFillerLog2PackageIntegrityParametersAction,
  fetchFillerLog2PackageIntegrityParameters,
  fetchFillerLog2PackageIntegrities
} from "@/lib/store/slices/fillerLog2Slice"
import { toast } from "sonner"
import { FillerLog2PackageIntegrityParameters } from "@/lib/api/data-capture-forms"

interface PackageIntegrityParametersDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parameter: FillerLog2PackageIntegrityParameters | null
  mode: "create" | "edit"
}

// Form Schema
const schema = yup.object({
  filler_log_2_package_integrity_id: yup.string().required("Package Integrity is required"),
  time: yup.string().required("Time is required"),
  category_name: yup.string().required("Category name is required"),
})

type FormData = yup.InferType<typeof schema>

export function PackageIntegrityParametersDrawer({ 
  open, 
  onOpenChange, 
  parameter, 
  mode 
}: PackageIntegrityParametersDrawerProps) {
  const dispatch = useAppDispatch()
  const [packageIntegrities, setPackageIntegrities] = useState<any[]>([])

  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      filler_log_2_package_integrity_id: "",
      time: "",
      category_name: "",
    },
  })

  // Load package integrities on component mount
  useEffect(() => {
    const loadPackageIntegrities = async () => {
      try {
        const result = await dispatch(fetchFillerLog2PackageIntegrities()).unwrap()
        setPackageIntegrities(result || [])
      } catch (error) {
        console.error("Failed to load package integrities:", error)
      }
    }

    if (open) {
      loadPackageIntegrities()
    }
  }, [open, dispatch])

  // Populate form when editing
  useEffect(() => {
    if (open && mode === "edit" && parameter) {
      form.reset({
        filler_log_2_package_integrity_id: parameter.filler_log_2_package_integrity_id || "",
        time: parameter.time || "",
        category_name: parameter.category_name || "",
      })
    } else if (open && mode === "create") {
      form.reset()
    }
  }, [open, mode, parameter, form])

  const handleSubmit = async (data: FormData) => {
    try {
      if (mode === "edit" && parameter) {
        await dispatch(updateFillerLog2PackageIntegrityParametersAction({
          ...parameter,
          ...data,
        })).unwrap()
        toast.success("Package Integrity Parameters updated successfully")
      } else {
        await dispatch(createFillerLog2PackageIntegrityParametersAction(data)).unwrap()
        toast.success("Package Integrity Parameters created successfully")
      }

      // Refresh the list
      setTimeout(() => {
        dispatch(fetchFillerLog2PackageIntegrityParameters())
      }, 1000)

      onOpenChange(false)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || "Failed to save package integrity parameters"
      toast.error(errorMessage)
    }
  }

  const handlePackageIntegritySearch = async (query: string) => {
    if (!query.trim()) {
      return packageIntegrities.map((integrity) => ({
        value: integrity.id,
        label: `Target: ${integrity.target} - ${integrity.time ? new Date(integrity.time).toLocaleString() : "N/A"}`,
        integrity
      }))
    }
    
    return packageIntegrities
      .filter((integrity) => 
        integrity.target?.toString().includes(query) ||
        integrity.time?.toLowerCase().includes(query.toLowerCase()) ||
        integrity.filler_log_2_package_integrity_filler_log_2_id_fkey?.sku?.toLowerCase().includes(query.toLowerCase())
      )
      .map((integrity) => ({
        value: integrity.id,
        label: `Target: ${integrity.target} - ${integrity.time ? new Date(integrity.time).toLocaleString() : "N/A"}`,
        integrity
      }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>
            {mode === "edit" ? "Edit Package Integrity Parameters" : "Create Package Integrity Parameters"}
          </SheetTitle>
          <SheetDescription>
            Enter package integrity parameters and category information
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Controller
                  name="filler_log_2_package_integrity_id"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Package Integrity *"
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearch={handlePackageIntegritySearch}
                      placeholder="Search and select package integrity"
                      error={!!form.formState.errors.filler_log_2_package_integrity_id}
                    />
                  )}
                />
                {form.formState.errors.filler_log_2_package_integrity_id && (
                  <p className="text-sm text-red-500">{form.formState.errors.filler_log_2_package_integrity_id.message}</p>
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
                <Label htmlFor="category_name">Category Name *</Label>
                <Controller
                  name="category_name"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="category_name"
                      placeholder="Enter category name"
                      {...field}
                    />
                  )}
                />
                {form.formState.errors.category_name && (
                  <p className="text-sm text-red-500">{form.formState.errors.category_name.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 p-6 pt-0 border-t">
          <Button  onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)}>
            {mode === "edit" ? "Update Parameters" : "Create Parameters"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
