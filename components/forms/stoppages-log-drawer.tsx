"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createFillerLog2StoppagesLogAction, 
  updateFillerLog2StoppagesLogAction,
  fetchFillerLog2s,
  setSelectedStoppagesLog
} from "@/lib/store/slices/fillerLog2Slice"
import { FillerLog2StoppagesLog } from "@/lib/api/data-capture-forms"

const schema = yup.object({
  filler_log_2_id: yup.string().required("Filler Log 2 is required"),
  start: yup.string().required("Start time is required"),
  stop: yup.string().required("Stop time is required"),
  reason_for_stoppage: yup.string().required("Reason for stoppage is required"),
})

interface StoppagesLogDrawerProps {
  isOpen: boolean
  onClose: () => void
  stoppagesLog?: FillerLog2StoppagesLog | null
}

export function StoppagesLogDrawer({ isOpen, onClose, stoppagesLog }: StoppagesLogDrawerProps) {
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
      start: "",
      stop: "",
      reason_for_stoppage: "",
    },
  })

  useEffect(() => {
    if (stoppagesLog) {
      reset({
        filler_log_2_id: stoppagesLog.filler_log_2_id || "",
        start: stoppagesLog.start || "",
        stop: stoppagesLog.stop || "",
        reason_for_stoppage: stoppagesLog.reason_for_stoppage || "",
      })
    } else {
      reset({
        filler_log_2_id: "",
        start: "",
        stop: "",
        reason_for_stoppage: "",
      })
    }
  }, [stoppagesLog, reset])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (stoppagesLog?.id) {
        await dispatch(updateFillerLog2StoppagesLogAction({
          ...stoppagesLog,
          ...data,
        })).unwrap()
        toast.success("Stoppages Log updated successfully")
      } else {
        await dispatch(createFillerLog2StoppagesLogAction(data)).unwrap()
        toast.success("Stoppages Log created successfully")
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
    dispatch(setSelectedStoppagesLog(null))
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {stoppagesLog ? "Edit Stoppages Log" : "Create Stoppages Log"}
          </SheetTitle>
          <SheetDescription>
            {stoppagesLog ? "Update stoppages log information" : "Add new stoppages log record"}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Time</Label>
                <Controller
                  name="start"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      showTime={true}
                      placeholder="Select start time"
                    />
                  )}
                />
                {errors.start && (
                  <p className="text-sm text-red-500">{errors.start.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stop">Stop Time</Label>
                <Controller
                  name="stop"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      showTime={true}
                      placeholder="Select stop time"
                    />
                  )}
                />
                {errors.stop && (
                  <p className="text-sm text-red-500">{errors.stop.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason_for_stoppage">Reason for Stoppage</Label>
              <Controller
                name="reason_for_stoppage"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Enter reason for stoppage"
                    rows={3}
                  />
                )}
              />
              {errors.reason_for_stoppage && (
                <p className="text-sm text-red-500">{errors.reason_for_stoppage.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || operationLoading.create || operationLoading.update}>
              {isSubmitting ? "Saving..." : stoppagesLog ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
