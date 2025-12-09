"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createFillerLog2PrepAndSterilizationAction, 
  updateFillerLog2PrepAndSterilizationAction,
  fetchFillerLog2s,
  setSelectedPrepAndSterilization
} from "@/lib/store/slices/fillerLog2Slice"
import { FillerLog2PrepAndSterilization } from "@/lib/api/data-capture-forms"

const schema = yup.object({
  filler_log_2_id: yup.string().required("Filler Log 2 is required"),
  preparation_start: yup.string().required("Preparation Start is required"),
  preparation_end: yup.string().required("Preparation End is required"),
  sterilization_start: yup.string().required("Sterilization Start is required"),
  sterilization_end: yup.string().required("Sterilization End is required"),
})

interface PrepSterilizationDrawerProps {
  isOpen: boolean
  onClose: () => void
  prepSterilization?: FillerLog2PrepAndSterilization | null
}

export function PrepSterilizationDrawer({ isOpen, onClose, prepSterilization }: PrepSterilizationDrawerProps) {
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
      preparation_start: "",
      preparation_end: "",
      sterilization_start: "",
      sterilization_end: "",
    },
  })

  useEffect(() => {
    if (prepSterilization) {
      reset({
        filler_log_2_id: prepSterilization.filler_log_2_id || "",
        preparation_start: prepSterilization.preparation_start || "",
        preparation_end: prepSterilization.preparation_end || "",
        sterilization_start: prepSterilization.sterilization_start || "",
        sterilization_end: prepSterilization.sterilization_end || "",
      })
    } else {
      reset({
        filler_log_2_id: "",
        preparation_start: "",
        preparation_end: "",
        sterilization_start: "",
        sterilization_end: "",
      })
    }
  }, [prepSterilization, reset])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (prepSterilization?.id) {
        await dispatch(updateFillerLog2PrepAndSterilizationAction({
          ...prepSterilization,
          ...data,
        })).unwrap()
        toast.success("Prep & Sterilization updated successfully")
      } else {
        await dispatch(createFillerLog2PrepAndSterilizationAction(data)).unwrap()
        toast.success("Prep & Sterilization created successfully")
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
    dispatch(setSelectedPrepAndSterilization(null))
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {prepSterilization ? "Edit Prep & Sterilization" : "Create Prep & Sterilization"}
          </SheetTitle>
          <SheetDescription>
            {prepSterilization ? "Update prep and sterilization information" : "Add new prep and sterilization record"}
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

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preparation Times</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preparation_start">Preparation Start</Label>
                  <Controller
                    name="preparation_start"
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
                  {errors.preparation_start && (
                    <p className="text-sm text-red-500">{errors.preparation_start.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preparation_end">Preparation End</Label>
                  <Controller
                    name="preparation_end"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        showTime={true}
                        placeholder="Select end time"
                      />
                    )}
                  />
                  {errors.preparation_end && (
                    <p className="text-sm text-red-500">{errors.preparation_end.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sterilization Times</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sterilization_start">Sterilization Start</Label>
                  <Controller
                    name="sterilization_start"
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
                  {errors.sterilization_start && (
                    <p className="text-sm text-red-500">{errors.sterilization_start.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sterilization_end">Sterilization End</Label>
                  <Controller
                    name="sterilization_end"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        showTime={true}
                        placeholder="Select end time"
                      />
                    )}
                  />
                  {errors.sterilization_end && (
                    <p className="text-sm text-red-500">{errors.sterilization_end.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button"  onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || operationLoading.create || operationLoading.update}>
              {isSubmitting ? "Saving..." : prepSterilization ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
