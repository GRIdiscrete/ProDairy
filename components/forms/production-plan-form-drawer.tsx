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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

const productionPlanSchema = yup.object({
  batch_id: yup.string().required("Batch ID is required"),
  product_type: yup.string().required("Product type is required"),
  quantity: yup.number().positive("Quantity must be positive").required("Quantity is required"),
  unit: yup.string().required("Unit is required"),
  priority: yup.string().required("Priority is required"),
  machine_id: yup.string().required("Machine is required"),
  operator_id: yup.string().required("Operator is required"),
  estimated_duration: yup.number().positive("Duration must be positive").required("Estimated duration is required"),
  notes: yup.string(),
})

type ProductionPlanFormData = yup.InferType<typeof productionPlanSchema>

interface ProductionPlanFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: any
  mode: "create" | "edit"
}

export function ProductionPlanFormDrawer({ open, onOpenChange, plan, mode }: ProductionPlanFormDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductionPlanFormData>({
    resolver: yupResolver(productionPlanSchema),
    defaultValues: plan || {},
  })

  const onSubmit = async (data: ProductionPlanFormData) => {
    setLoading(true)
    try {
      const formData = {
        ...data,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(`${mode === "create" ? "Creating" : "Updating"} production plan:`, formData)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Error saving production plan:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "New Production Batch" : "Edit Production Batch"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new production batch plan" : "Update production batch information"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch_id">Batch ID</Label>
                <Input id="batch_id" {...register("batch_id")} />
                {errors.batch_id && <p className="text-sm text-red-500">{errors.batch_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type</Label>
                <Select onValueChange={(value) => setValue("product_type", value)} defaultValue={watch("product_type")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_jersey">Single Jersey</SelectItem>
                    <SelectItem value="rib">Rib</SelectItem>
                    <SelectItem value="interlock">Interlock</SelectItem>
                    <SelectItem value="pique">Pique</SelectItem>
                  </SelectContent>
                </Select>
                {errors.product_type && <p className="text-sm text-red-500">{errors.product_type.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" {...register("quantity", { valueAsNumber: true })} />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select onValueChange={(value) => setValue("unit", value)} defaultValue={watch("unit")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="meters">Meters</SelectItem>
                  </SelectContent>
                </Select>
                {errors.unit && <p className="text-sm text-red-500">{errors.unit.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={(value) => setValue("priority", value)} defaultValue={watch("priority")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="machine_id">Machine</Label>
                <Select onValueChange={(value) => setValue("machine_id", value)} defaultValue={watch("machine_id")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M/C 01">M/C 01</SelectItem>
                    <SelectItem value="M/C 02">M/C 02</SelectItem>
                    <SelectItem value="M/C 03">M/C 03</SelectItem>
                    <SelectItem value="M/C 04">M/C 04</SelectItem>
                  </SelectContent>
                </Select>
                {errors.machine_id && <p className="text-sm text-red-500">{errors.machine_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="operator_id">Operator</Label>
                <Select onValueChange={(value) => setValue("operator_id", value)} defaultValue={watch("operator_id")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brooklyn_simmons">Brooklyn Simmons</SelectItem>
                    <SelectItem value="dianne_russell">Dianne Russell</SelectItem>
                    <SelectItem value="marvin_mckinney">Marvin McKinney</SelectItem>
                    <SelectItem value="cameron_williamson">Cameron Williamson</SelectItem>
                  </SelectContent>
                </Select>
                {errors.operator_id && <p className="text-sm text-red-500">{errors.operator_id.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_duration">Estimated Duration (Hours)</Label>
              <Input
                id="estimated_duration"
                type="number"
                {...register("estimated_duration", { valueAsNumber: true })}
              />
              {errors.estimated_duration && <p className="text-sm text-red-500">{errors.estimated_duration.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" {...register("notes")} />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : mode === "create" ? "Create Batch" : "Update Batch"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
