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
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">
            {mode === "create" ? "Add New Silo" : "Edit Silo"}
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            {mode === "create" ? "Create a new silo configuration" : "Update silo information"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto bg-white p-6">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Silo Name *</Label>
                  <Controller name="name" control={control} render={({ field }) => (
                    <Input placeholder="e.g., Silo-001" {...field} />
                  )} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Serial Number *</Label>
                  <Controller name="serial_number" control={control} render={({ field }) => (
                    <Input placeholder="e.g., SN123456789" {...field} />
                  )} />
                  {errors.serial_number && <p className="text-sm text-red-500">{errors.serial_number.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Location *</Label>
                <Controller name="location" control={control} render={({ field }) => (
                  <Input placeholder="e.g., PD2" {...field} />
                )} />
                {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Controller name="category" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full rounded-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Raw Milk">Raw Milk</SelectItem>
                        <SelectItem value="Standardized">Standardized</SelectItem>
                        <SelectItem value="Pasteurized">Pasteurized</SelectItem>
                        <SelectItem value="Holding">Holding</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Controller name="status" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full rounded-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Capacity (L) *</Label>
                  <Controller name="capacity" control={control} render={({ field }) => (
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      placeholder="Enter total capacity"
                    />
                  )} />
                  {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Current Volume (L) *</Label>
                  <Controller name="milk_volume" control={control} render={({ field }) => (
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      placeholder="Enter current volume"
                    />
                  )} />
                  {errors.milk_volume && <p className="text-sm text-red-500">{errors.milk_volume.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={operationLoading.create || operationLoading.update}
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                type="submit"
                loading={operationLoading.create || operationLoading.update}
                disabled={operationLoading.create || operationLoading.update}
                className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white border-0 rounded-full px-6 py-2 font-light"
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