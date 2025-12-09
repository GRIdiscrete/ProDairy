"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Package } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createProcess, updateProcess, fetchProcesses } from "@/lib/store/slices/processSlice"
import { fetchRawMaterials } from "@/lib/store/slices/rawMaterialSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import type { Process, RawMaterial } from "@/lib/types"

const processSchema = yup.object({
  name: yup.string().required("Process name is required"),
  raw_material_ids: yup.array().min(1, "At least one raw material must be selected").required("Raw materials are required"),
})

type ProcessFormData = {
  name: string
  raw_material_ids: string[]
}

interface ProcessFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process?: Process
  mode: "create" | "edit"
  onSuccess?: () => void
}

export function ProcessFormDrawer({ open, onOpenChange, process, mode, onSuccess }: ProcessFormDrawerProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const { operationLoading } = useAppSelector((state) => state.process)
  const { rawMaterials, operationLoading: rawMaterialLoading } = useAppSelector((state) => state.rawMaterial)
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ProcessFormData>({
    resolver: yupResolver(processSchema) as any,
    defaultValues: {
      name: "",
      raw_material_ids: [],
    },
  })

  const selectedRawMaterials = watch("raw_material_ids") || []

  // Load raw materials on component mount
  useEffect(() => {
    if (open) {
      dispatch(fetchRawMaterials())
    }
  }, [dispatch, open])

  // Reset form when process changes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && process) {
        setValue("name", process.name)
        setValue("raw_material_ids", process.raw_material_ids)
      } else {
        reset({
          name: "",
          raw_material_ids: [],
        })
      }
    }
  }, [open, mode, process, setValue, reset])

  const onSubmit: SubmitHandler<ProcessFormData> = async (data) => {
    try {
      setLoading(true)
      
      if (mode === "create") {
        await dispatch(createProcess(data)).unwrap()
        toast.success("Process created successfully")
      } else if (process) {
        await dispatch(updateProcess({
          ...data,
          id: process.id,
          created_at: process.created_at,
          updated_at: new Date().toISOString(),
        })).unwrap()
        toast.success("Process updated successfully")
      }

      // Refresh the processes list
      dispatch(fetchProcesses())
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      const message = error?.message || "An error occurred"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleRawMaterialChange = (materialId: string, checked: boolean) => {
    const currentIds = selectedRawMaterials
    if (checked) {
      setValue("raw_material_ids", [...currentIds, materialId])
    } else {
      setValue("raw_material_ids", currentIds.filter(id => id !== materialId))
    }
  }

  const isLoading = loading || operationLoading.create || operationLoading.update

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">
            {mode === "create" ? "Add New Process" : "Edit Process"}
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            {mode === "create" ? "Create a new manufacturing process" : "Update process information"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Process Name *</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter process name"
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Raw Materials *</Label>
                {rawMaterialLoading.fetch ? (
                  <div className="text-center py-4 text-muted-foreground">Loading raw materials...</div>
                ) : rawMaterials.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No raw materials available</div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {rawMaterials.map((material) => (
                      <div key={material.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`material-${material.id}`}
                          checked={selectedRawMaterials.includes(material.id)}
                          onCheckedChange={(checked) => handleRawMaterialChange(material.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`material-${material.id}`} 
                            className="font-medium cursor-pointer"
                          >
                            {material.name}
                          </Label>
                          {material.description && (
                            <p className="text-muted-foreground text-sm">{material.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.raw_material_ids && (
                  <p className="text-sm text-red-500">{errors.raw_material_ids.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton
                type="button"
                
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className=" bg-[#006BC4] text-white rounded-full px-6 py-2 font-light"
              >
                {mode === "create" ? "Create Process" : "Update Process"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}