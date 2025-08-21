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

const processSchema = yup.object({
  processName: yup.string().required("Process name is required"),
  productType: yup.string().required("Product type is required"),
  batchSize: yup.number().positive("Batch size must be positive").required("Batch size is required"),
  expectedDuration: yup.number().positive("Duration must be positive").required("Expected duration is required"),
  temperature: yup.number().required("Temperature is required"),
  pressure: yup.number().required("Pressure is required"),
  assignedOperator: yup.string().required("Assigned operator is required"),
  machineId: yup.string().required("Machine selection is required"),
  priority: yup.string().required("Priority is required"),
  notes: yup.string(),
})

interface ProcessFormDrawerProps {
  open: boolean
  onClose: () => void
  process?: any
}

export function ProcessFormDrawer({ open, onClose, process }: ProcessFormDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(processSchema),
  })

  useEffect(() => {
    if (process) {
      Object.keys(process).forEach((key) => {
        setValue(key as any, process[key])
      })
    } else {
      reset()
    }
  }, [process, setValue, reset])

  const onSubmit = async (data: any) => {
    try {
      console.log("[v0] Process form data:", data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onClose()
      reset()
    } catch (error) {
      console.error("[v0] Error saving process:", error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>{process ? "Edit Process" : "Start New Process"}</SheetTitle>
                <SheetDescription>
                  {process ? "Update process parameters" : "Configure new production process"}
                </SheetDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processName">Process Name *</Label>
                <Input id="processName" {...register("processName")} placeholder="Enter process name" />
                {errors.processName && <p className="text-sm text-red-500">{errors.processName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="productType">Product Type *</Label>
                <Select onValueChange={(value) => setValue("productType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whole_milk">Whole Milk</SelectItem>
                    <SelectItem value="skim_milk">Skim Milk</SelectItem>
                    <SelectItem value="cream">Cream</SelectItem>
                    <SelectItem value="butter">Butter</SelectItem>
                    <SelectItem value="cheese">Cheese</SelectItem>
                    <SelectItem value="yogurt">Yogurt</SelectItem>
                  </SelectContent>
                </Select>
                {errors.productType && <p className="text-sm text-red-500">{errors.productType.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchSize">Batch Size (L) *</Label>
                <Input
                  id="batchSize"
                  type="number"
                  {...register("batchSize")}
                  placeholder="Enter batch size in liters"
                />
                {errors.batchSize && <p className="text-sm text-red-500">{errors.batchSize.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDuration">Duration (hours) *</Label>
                <Input
                  id="expectedDuration"
                  type="number"
                  step="0.5"
                  {...register("expectedDuration")}
                  placeholder="Expected duration"
                />
                {errors.expectedDuration && <p className="text-sm text-red-500">{errors.expectedDuration.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C) *</Label>
                <Input id="temperature" type="number" {...register("temperature")} placeholder="Process temperature" />
                {errors.temperature && <p className="text-sm text-red-500">{errors.temperature.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pressure">Pressure (bar) *</Label>
                <Input
                  id="pressure"
                  type="number"
                  step="0.1"
                  {...register("pressure")}
                  placeholder="Process pressure"
                />
                {errors.pressure && <p className="text-sm text-red-500">{errors.pressure.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedOperator">Assigned Operator *</Label>
                <Select onValueChange={(value) => setValue("assignedOperator", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john_doe">John Doe</SelectItem>
                    <SelectItem value="jane_smith">Jane Smith</SelectItem>
                    <SelectItem value="mike_johnson">Mike Johnson</SelectItem>
                    <SelectItem value="sarah_wilson">Sarah Wilson</SelectItem>
                  </SelectContent>
                </Select>
                {errors.assignedOperator && <p className="text-sm text-red-500">{errors.assignedOperator.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="machineId">Machine *</Label>
                <Select onValueChange={(value) => setValue("machineId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M001">Pasteurizer M001</SelectItem>
                    <SelectItem value="M002">Separator M002</SelectItem>
                    <SelectItem value="M003">Homogenizer M003</SelectItem>
                    <SelectItem value="M004">Packaging M004</SelectItem>
                  </SelectContent>
                </Select>
                {errors.machineId && <p className="text-sm text-red-500">{errors.machineId.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select onValueChange={(value) => setValue("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Process Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Additional process notes or special instructions..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Starting..." : process ? "Update Process" : "Start Process"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
