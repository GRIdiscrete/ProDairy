"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

const machineSchema = yup.object({
  serialNumber: yup.string().required("Serial number is required"),
  name: yup.string().required("Machine name is required"),
  category: yup.string().required("Category is required"),
  location: yup.string().required("Location is required"),
  status: yup.string().required("Status is required"),
  manufacturer: yup.string().required("Manufacturer is required"),
  model: yup.string().required("Model is required"),
  installationDate: yup.date().required("Installation date is required"),
  lastMaintenanceDate: yup.date().nullable(),
  nextMaintenanceDate: yup.date().nullable(),
  specifications: yup.string(),
  notes: yup.string(),
})

interface MachineFormDrawerProps {
  open: boolean
  onClose: () => void
  machine?: any
}

export function MachineFormDrawer({ open, onClose, machine }: MachineFormDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(machineSchema),
  })

  const watchedStatus = watch("status")

  useEffect(() => {
    if (machine) {
      Object.keys(machine).forEach((key) => {
        setValue(key as any, machine[key])
      })
    } else {
      reset()
    }
  }, [machine, setValue, reset])

  const onSubmit = async (data: any) => {
    try {
      console.log("[v0] Machine form data:", data)
      // Here you would dispatch an action to save the machine
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      onClose()
      reset()
    } catch (error) {
      console.error("[v0] Error saving machine:", error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>{machine ? "Edit Machine" : "Add New Machine"}</SheetTitle>
                <SheetDescription>
                  {machine ? "Update machine information" : "Enter machine details to add to the system"}
                </SheetDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number *</Label>
                  <Input id="serialNumber" {...register("serialNumber")} placeholder="Enter serial number" />
                  {errors.serialNumber && <p className="text-sm text-red-500">{errors.serialNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Machine Name *</Label>
                  <Input id="name" {...register("name")} placeholder="Enter machine name" />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" {...register("location")} placeholder="Enter location (e.g., Floor 1, Section A)" />
                {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
              </div>
            </div>

            {/* Category & Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Category & Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pasteurizer">Pasteurizer</SelectItem>
                      <SelectItem value="separator">Separator</SelectItem>
                      <SelectItem value="homogenizer">Homogenizer</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                      <SelectItem value="cooling">Cooling</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value) => setValue("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="idle">Idle</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                </div>
              </div>
            </div>

            {/* Manufacturer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Manufacturer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer *</Label>
                  <Input id="manufacturer" {...register("manufacturer")} placeholder="Enter manufacturer" />
                  {errors.manufacturer && <p className="text-sm text-red-500">{errors.manufacturer.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input id="model" {...register("model")} placeholder="Enter model" />
                  {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
                </div>
              </div>
            </div>

            {/* Maintenance Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Maintenance Schedule</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installationDate">Installation Date *</Label>
                  <Input id="installationDate" type="date" {...register("installationDate")} />
                  {errors.installationDate && <p className="text-sm text-red-500">{errors.installationDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastMaintenanceDate">Last Maintenance</Label>
                  <Input id="lastMaintenanceDate" type="date" {...register("lastMaintenanceDate")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextMaintenanceDate">Next Maintenance</Label>
                  <Input id="nextMaintenanceDate" type="date" {...register("nextMaintenanceDate")} />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specifications">Technical Specifications</Label>
                  <Textarea
                    id="specifications"
                    {...register("specifications")}
                    placeholder="Enter technical specifications, capacity, power requirements, etc."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" {...register("notes")} placeholder="Additional notes, special instructions, etc." rows={2} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : machine ? "Update Machine" : "Add Machine"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
