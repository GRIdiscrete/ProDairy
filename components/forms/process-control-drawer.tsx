"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createFillerLog2ProcessControlAction, 
  updateFillerLog2ProcessControlAction,
  fetchFillerLog2s,
  setSelectedProcessControl
} from "@/lib/store/slices/fillerLog2Slice"
import { FillerLog2ProcessControl } from "@/lib/api/data-capture-forms"

const schema = yup.object({
  filler_log_2_id: yup.string().required("Filler Log 2 is required"),
  time: yup.string().required("Time is required"),
  target: yup.number().required("Target is required").min(0, "Target must be positive"),
})

interface ProcessControlDrawerProps {
  isOpen: boolean
  onClose: () => void
  processControl?: FillerLog2ProcessControl | null
}

export function ProcessControlDrawer({ isOpen, onClose, processControl }: ProcessControlDrawerProps) {
  const dispatch = useAppDispatch()
  const { fillerLog2s, operationLoading } = useAppSelector((state) => state.fillerLog2s)
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      filler_log_2_id: "",
      time: "",
      target: 0,
    },
  })

  useEffect(() => {
    if (processControl) {
      reset({
        filler_log_2_id: processControl.filler_log_2_id || "",
        time: processControl.time || "",
        target: processControl.target || 0,
      })
    } else {
      reset({
        filler_log_2_id: "",
        time: "",
        target: 0,
      })
    }
  }, [processControl, reset])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (processControl?.id) {
        await dispatch(updateFillerLog2ProcessControlAction({
          ...processControl,
          ...data,
        })).unwrap()
        toast.success("Process Control updated successfully")
      } else {
        await dispatch(createFillerLog2ProcessControlAction(data)).unwrap()
        toast.success("Process Control created successfully")
      }
      
      dispatch(fetchFillerLog2s())
      onClose()
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || "An error occurred"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    dispatch(setSelectedProcessControl(null))
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {processControl ? "Edit Process Control" : "Create Process Control"}
          </SheetTitle>
          <SheetDescription>
            {processControl ? "Update process control information" : "Add new process control record"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filler_log_2_id">Filler Log 2</Label>
              <Controller
                name="filler_log_2_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select Filler Log 2"
                    options={fillerLog2s.map((log) => ({
                      value: log.id || "",
                      label: `${log.sku} - ${log.shift} (${log.date})`,
                    }))}
                    searchPlaceholder="Search filler logs..."
                  />
                )}
              />
              {errors.filler_log_2_id && (
                <p className="text-sm text-red-500">{errors.filler_log_2_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    showTime={true}
                    placeholder="Select time"
                  />
                )}
              />
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Controller
                name="target"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter target value"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {errors.target && (
                <p className="text-sm text-red-500">{errors.target.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || operationLoading.create || operationLoading.update}>
              {isSubmitting ? "Saving..." : processControl ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
