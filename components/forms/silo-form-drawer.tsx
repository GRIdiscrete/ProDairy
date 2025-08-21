"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const siloSchema = yup.object({
  name: yup.string().required("Silo name is required"),
  serial_no: yup.string().required("Serial number is required"),
  category: yup.string().required("Category is required"),
  location: yup.string().required("Location is required"),
  capacity: yup.number().positive("Capacity must be positive").required("Capacity is required"),
  milk_volume: yup.number().min(0, "Volume cannot be negative").required("Current volume is required"),
  status: yup.string().required("Status is required"),
  description: yup.string(),
})

type SiloFormData = yup.InferType<typeof siloSchema>

interface SiloFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  silo?: any
  mode: "create" | "edit"
}

export function SiloFormDrawer({ open, onOpenChange, silo, mode }: SiloFormDrawerProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SiloFormData>({
    resolver: yupResolver(siloSchema),
    defaultValues: silo || { milk_volume: 0 },
  })

  const onSubmit = async (data: SiloFormData) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(`${mode === "create" ? "Creating" : "Updating"} silo:`, data)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Error saving silo:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New Silo" : "Edit Silo"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new storage silo" : "Update silo information"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Silo Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial_no">Serial Number</Label>
              <Input id="serial_no" {...register("serial_no")} />
              {errors.serial_no && <p className="text-sm text-red-500">{errors.serial_no.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue={watch("category")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pasteurizing Silos">Pasteurizing Silos</SelectItem>
                  <SelectItem value="Storage Silos">Storage Silos</SelectItem>
                  <SelectItem value="Cooling Silos">Cooling Silos</SelectItem>
                  <SelectItem value="Processing Silos">Processing Silos</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select onValueChange={(value) => setValue("location", value)} defaultValue={watch("location")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PD1">Production Department 1</SelectItem>
                  <SelectItem value="PD2">Production Department 2</SelectItem>
                  <SelectItem value="PD3">Production Department 3</SelectItem>
                  <SelectItem value="WH1">Warehouse 1</SelectItem>
                  <SelectItem value="WH2">Warehouse 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Liters)</Label>
              <Input id="capacity" type="number" step="0.01" {...register("capacity", { valueAsNumber: true })} />
              {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="milk_volume">Current Volume (Liters)</Label>
              <Input id="milk_volume" type="number" step="0.01" {...register("milk_volume", { valueAsNumber: true })} />
              {errors.milk_volume && <p className="text-sm text-red-500">{errors.milk_volume.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue("status", value)} defaultValue={watch("status")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" {...register("description")} />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : mode === "create" ? "Create Silo" : "Update Silo"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
