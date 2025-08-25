"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createRawMaterial, updateRawMaterial } from "@/lib/store/slices/rawMaterialSlice"
import { toast } from "sonner"
import type { RawMaterial } from "@/lib/types"

const rawMaterialSchema = yup.object({
  name: yup.string().required("Material name is required"),
  description: yup.string().required("Description is required"),
})

type RawMaterialFormData = yup.InferType<typeof rawMaterialSchema>

interface RawMaterialFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rawMaterial?: RawMaterial | null
  mode: "create" | "edit"
}

export function RawMaterialFormDrawer({ open, onOpenChange, rawMaterial, mode }: RawMaterialFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.rawMaterial)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RawMaterialFormData>({
    resolver: yupResolver(rawMaterialSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const onSubmit = async (data: RawMaterialFormData) => {
    try {
      console.log('Form data submitted:', data)

      if (mode === "create") {
        const result = await dispatch(createRawMaterial(data)).unwrap()
        toast.success('Raw material created successfully')
      } else if (rawMaterial) {
        const result = await dispatch(updateRawMaterial({
          ...data,
          id: rawMaterial.id,
          created_at: rawMaterial.created_at,
          updated_at: rawMaterial.updated_at,
        })).unwrap()
        toast.success('Raw material updated successfully')
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      // Backend error message will be used from the thunk
      toast.error(error || (mode === "create" ? 'Failed to create raw material' : 'Failed to update raw material'))
    }
  }

  useEffect(() => {
    if (open && rawMaterial && mode === "edit") {
      reset({
        name: rawMaterial.name || "",
        description: rawMaterial.description || "",
      })
    } else if (open && mode === "create") {
      reset({
        name: "",
        description: "",
      })
    }
  }, [open, rawMaterial, mode, reset])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New Raw Material" : "Edit Raw Material"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new raw material entry" : "Update raw material information"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Material Information</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Material Name *</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="name"
                      {...field}
                      placeholder="Enter material name (e.g., Cream, Milk Powder)"
                    />
                  )}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      {...field}
                      placeholder="Describe the raw material, its properties, usage, or specifications..."
                      rows={4}
                      className="resize-none"
                    />
                  )}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </div>
            </div>

            {/* Examples and Guidelines */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Guidelines</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-gray-700">Material Name Examples:</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Whole Milk</li>
                  <li>• Heavy Cream</li>
                  <li>• Skim Milk Powder</li>
                  <li>• Butter Fat</li>
                  <li>• Lactose</li>
                </ul>
                
                <h4 className="font-medium text-gray-700 mt-3">Description Guidelines:</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Include fat content, protein levels, or other specifications</li>
                  <li>• Mention storage requirements or handling instructions</li>
                  <li>• Note any quality standards or certifications</li>
                  <li>• Describe typical usage in production processes</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </LoadingButton>
              <LoadingButton 
                type="submit" 
                loading={mode === "create" ? operationLoading.create : operationLoading.update}
                loadingText={mode === "create" ? "Creating..." : "Updating..."}
              >
                {mode === "create" ? "Create Raw Material" : "Update Raw Material"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
