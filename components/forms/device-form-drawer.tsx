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

const deviceSchema = yup.object({
  name: yup.string().required("Device name is required"),
  device_id: yup.string().required("Device ID is required"),
  type: yup.string().required("Device type is required"),
  location: yup.string().required("Location is required"),
  status: yup.string().required("Status is required"),
  description: yup.string().optional(),
  configuration: yup.string().optional(),
})

type DeviceFormData = yup.InferType<typeof deviceSchema>

interface DeviceFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device?: any
  mode: "create" | "edit"
}

export function DeviceFormDrawer({ open, onOpenChange, device, mode }: DeviceFormDrawerProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DeviceFormData>({
    resolver: yupResolver(deviceSchema),
    defaultValues: device || {},
  })

  const onSubmit = async (data: DeviceFormData) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(`${mode === "create" ? "Creating" : "Updating"} device:`, data)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Error saving device:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-[50vw] !max-w-[50vw] overflow-y-auto" style={{ width: '50vw', maxWidth: '50vw' }}>
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New Device" : "Edit Device"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Register a new IoT device" : "Update device information"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Device Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device_id">Device ID</Label>
                  <Input id="device_id" {...register("device_id")} />
                  {errors.device_id && <p className="text-sm text-red-500">{errors.device_id.message}</p>}
                </div>
              </div>
            </div>

            {/* Device Type & Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b pb-2">Device Type & Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Device Type</Label>
                  <Select onValueChange={(value) => setValue("type", value)} defaultValue={watch("type")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Temperature Sensor">Temperature Sensor</SelectItem>
                      <SelectItem value="Flow Meter">Flow Meter</SelectItem>
                      <SelectItem value="Pressure Gauge">Pressure Gauge</SelectItem>
                      <SelectItem value="pH Sensor">pH Sensor</SelectItem>
                      <SelectItem value="Level Sensor">Level Sensor</SelectItem>
                      <SelectItem value="Humidity Sensor">Humidity Sensor</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...register("location")} />
                  {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
                </div>
              </div>
            </div>

            {/* Status & Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b pb-2">Status & Configuration</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setValue("status", value)} defaultValue={watch("status")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Offline">Offline</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="configuration">Configuration (JSON)</Label>
                  <Textarea
                    id="configuration"
                    {...register("configuration")}
                    placeholder='{"interval": 30, "threshold": 25}'
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b pb-2">Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" {...register("description")} />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : mode === "create" ? "Create Device" : "Update Device"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
