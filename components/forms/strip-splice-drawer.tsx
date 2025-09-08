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
  createFillerLog2StripSpliceAction, 
  updateFillerLog2StripSpliceAction,
  fetchFillerLog2s,
  setSelectedStripSplice
} from "@/lib/store/slices/fillerLog2Slice"
import { FillerLog2StripSplice } from "@/lib/api/data-capture-forms"

const schema = yup.object({
  filler_log_2_id: yup.string().required("Filler Log 2 is required"),
  time: yup.string().required("Time is required"),
  p_order: yup.string().required("P Order is required"),
  packs_rejected: yup.number().required("Packs Rejected is required").min(0, "Packs Rejected must be positive"),
  lane_number: yup.number().required("Lane Number is required").min(1, "Lane Number must be positive"),
})

interface StripSpliceDrawerProps {
  isOpen: boolean
  onClose: () => void
  stripSplice?: FillerLog2StripSplice | null
}

export function StripSpliceDrawer({ isOpen, onClose, stripSplice }: StripSpliceDrawerProps) {
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
      p_order: "",
      packs_rejected: 0,
      lane_number: 1,
    },
  })

  useEffect(() => {
    if (stripSplice) {
      reset({
        filler_log_2_id: stripSplice.filler_log_2_id || "",
        time: stripSplice.time || "",
        p_order: stripSplice.p_order || "",
        packs_rejected: stripSplice.packs_rejected || 0,
        lane_number: stripSplice.lane_number || 1,
      })
    } else {
      reset({
        filler_log_2_id: "",
        time: "",
        p_order: "",
        packs_rejected: 0,
        lane_number: 1,
      })
    }
  }, [stripSplice, reset])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (stripSplice?.id) {
        await dispatch(updateFillerLog2StripSpliceAction({
          ...stripSplice,
          ...data,
        })).unwrap()
        toast.success("Strip Splice updated successfully")
      } else {
        await dispatch(createFillerLog2StripSpliceAction(data)).unwrap()
        toast.success("Strip Splice created successfully")
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
    dispatch(setSelectedStripSplice(null))
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {stripSplice ? "Edit Strip Splice" : "Create Strip Splice"}
          </SheetTitle>
          <SheetDescription>
            {stripSplice ? "Update strip splice information" : "Add new strip splice record"}
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
              <Label htmlFor="p_order">P Order</Label>
              <Controller
                name="p_order"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter P Order"
                  />
                )}
              />
              {errors.p_order && (
                <p className="text-sm text-red-500">{errors.p_order.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packs_rejected">Packs Rejected</Label>
                <Controller
                  name="packs_rejected"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter packs rejected"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {errors.packs_rejected && (
                  <p className="text-sm text-red-500">{errors.packs_rejected.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lane_number">Lane Number</Label>
                <Controller
                  name="lane_number"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter lane number"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  )}
                />
                {errors.lane_number && (
                  <p className="text-sm text-red-500">{errors.lane_number.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || operationLoading.create || operationLoading.update}>
              {isSubmitting ? "Saving..." : stripSplice ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
