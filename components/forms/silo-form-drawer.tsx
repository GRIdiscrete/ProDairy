"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createSilo, updateSilo } from "@/lib/store/slices/siloSlice"
import { toast } from "sonner"
import type { Silo } from "@/lib/types"

const siloSchema = yup.object({
  name: yup.string().required("Silo name is required"),
  serial_number: yup.string().required("Serial number is required"),
  status: yup.string().required("Status is required"),
  category: yup.string().required("Category is required"),
  location: yup.string().required("Location is required"),
  milk_volume: yup.number().required("Milk volume is required").min(0, "Milk volume cannot be negative"),
  capacity: yup.number().required("Capacity is required").min(1, "Capacity must be greater than 0"),
})

type SiloFormData = yup.InferType<typeof siloSchema>

interface SiloFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  silo?: Silo | null
  mode: "create" | "edit"
}

export function SiloFormDrawer({ open, onOpenChange, silo, mode }: SiloFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.silo)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SiloFormData>({
    resolver: yupResolver(siloSchema),
    defaultValues: {
      name: "",
      serial_number: "",
      status: "",
      category: "",
      location: "",
      milk_volume: 0,
      capacity: 0,
    },
  })

  const onSubmit = async (data: SiloFormData) => {
    try {
      console.log('Form data submitted:', data)

      if (mode === "create") {
        const result = await dispatch(createSilo(data)).unwrap()
        toast.success('Silo created successfully')
      } else if (silo) {
        const result = await dispatch(updateSilo({
          ...data,
          id: silo.id,
          created_at: silo.created_at,
          updated_at: silo.updated_at,
        })).unwrap()
        toast.success('Silo updated successfully')
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      // Backend error message will be used from the thunk
      toast.error(error || (mode === "create" ? 'Failed to create silo' : 'Failed to update silo'))
    }
  }

  useEffect(() => {
    if (open && silo && mode === "edit") {
      reset({
        name: silo.name || "",
        serial_number: silo.serial_number || "",
        status: silo.status || "",
        category: silo.category || "",
        location: silo.location || "",
        milk_volume: silo.milk_volume || 0,
        capacity: silo.capacity || 0,
      })
    } else if (open && mode === "create") {
      reset({
        name: "",
        serial_number: "",
        status: "",
        category: "",
        location: "",
        milk_volume: 0,
        capacity: 0,
      })
    }
  }, [open, silo, mode, reset])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New Silo" : "Edit Silo"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new silo configuration" : "Update silo information"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Silo Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Silo Name *</Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="name"
                        {...field}
                        placeholder="Enter silo name"
                      />
                    )}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number *</Label>
                  <Controller
                    name="serial_number"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="serial_number"
                        {...field}
                        placeholder="Enter serial number"
                      />
                    )}
                  />
                  {errors.serial_number && <p className="text-sm text-red-500">{errors.serial_number.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Milk Storage Tanks">Milk Storage Tanks</SelectItem>
                          <SelectItem value="Cooling Silos">Cooling Silos</SelectItem>
                          <SelectItem value="Processing Tanks">Processing Tanks</SelectItem>
                          <SelectItem value="Buffer Tanks">Buffer Tanks</SelectItem>
                          <SelectItem value="Fermentation Tanks">Fermentation Tanks</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="location"
                        {...field}
                        placeholder="Enter location (e.g., PD2)"
                      />
                    )}
                  />
                  {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>
            </div>

            {/* Capacity Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Capacity & Volume</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Total Capacity (L) *</Label>
                  <Controller
                    name="capacity"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="capacity"
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="Enter total capacity in liters"
                      />
                    )}
                  />
                  {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="milk_volume">Current Milk Volume (L) *</Label>
                  <Controller
                    name="milk_volume"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="milk_volume"
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="Enter current milk volume"
                      />
                    )}
                  />
                  {errors.milk_volume && <p className="text-sm text-red-500">{errors.milk_volume.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </LoadingButton>
              <LoadingButton 
                type="submit" 
                loading={mode === "create" ? operationLoading.create : operationLoading.update}
                loadingText={mode === "create" ? "Creating..." : "Updating..."}
              >
                {mode === "create" ? "Create Silo" : "Update Silo"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}