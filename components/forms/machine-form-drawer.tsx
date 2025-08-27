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
import { Textarea } from "@/components/ui/textarea"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createMachine, updateMachine } from "@/lib/store/slices/machineSlice"
import { toast } from "sonner"
import type { Machine } from "@/lib/types"

const machineSchema = yup.object({
  name: yup.string().required("Machine name is required"),
  serial_number: yup.string().required("Serial number is required"),
  status: yup.string().required("Status is required"),
  category: yup.string().required("Category is required"),
  location: yup.string().required("Location is required"),
})

type MachineFormData = yup.InferType<typeof machineSchema>

interface MachineFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  machine?: Machine | null
  mode: "create" | "edit"
}

export function MachineFormDrawer({ open, onOpenChange, machine, mode }: MachineFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.machine)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MachineFormData>({
    resolver: yupResolver(machineSchema),
    defaultValues: {
      name: "",
      serial_number: "",
      status: "",
      category: "",
      location: "",
    },
  })

  const onSubmit = async (data: MachineFormData) => {
    try {
      console.log('Form data submitted:', data)

      if (mode === "create") {
        const result = await dispatch(createMachine(data)).unwrap()
        toast.success('Machine created successfully')
      } else if (machine) {
        const result = await dispatch(updateMachine({
          ...data,
          id: machine.id,
          created_at: machine.created_at,
          updated_at: machine.updated_at,
        })).unwrap()
        toast.success('Machine updated successfully')
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      // Backend error message will be used from the thunk
      toast.error(error || (mode === "create" ? 'Failed to create machine' : 'Failed to update machine'))
    }
  }

  useEffect(() => {
    if (open && machine && mode === "edit") {
      reset({
        name: machine.name || "",
        serial_number: machine.serial_number || "",
        status: machine.status || "",
        category: machine.category || "",
        location: machine.location || "",
      })
    } else if (open && mode === "create") {
      reset({
        name: "",
        serial_number: "",
        status: "",
        category: "",
        location: "",
      })
    }
  }, [open, machine, mode, reset])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New Machine" : "Edit Machine"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new machine configuration" : "Update machine information"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Machine Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Machine Name *</Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="name"
                        {...field}
                        placeholder="Enter machine name"
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
                          <SelectItem value="Pasteurizing Machines">Pasteurizing Machines</SelectItem>
                          <SelectItem value="Separator Machines">Separator Machines</SelectItem>
                          <SelectItem value="Homogenizer Machines">Homogenizer Machines</SelectItem>
                          <SelectItem value="Packaging Machines">Packaging Machines</SelectItem>
                          <SelectItem value="Cooling Machines">Cooling Machines</SelectItem>
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



            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </LoadingButton>
              <LoadingButton 
                type="submit" 
                loading={mode === "create" ? operationLoading.create : operationLoading.update}
                loadingText={mode === "create" ? "Creating..." : "Updating..."}
              >
                {mode === "create" ? "Create Machine" : "Update Machine"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
