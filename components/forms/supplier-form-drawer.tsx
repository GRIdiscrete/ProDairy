"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createSupplier, updateSupplier } from "@/lib/store/slices/supplierSlice"
import { toast } from "sonner"
import type { Supplier } from "@/lib/types"

const supplierSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone_number: yup.string().required("Phone number is required"),
  physical_address: yup.string().required("Physical address is required"),
  raw_product: yup.string().required("Raw product is required"),
  volume_supplied: yup.number().required("Volume supplied is required").min(0, "Volume supplied cannot be negative"),
  volume_rejected: yup.number().required("Volume rejected is required").min(0, "Volume rejected cannot be negative"),
})

type SupplierFormData = yup.InferType<typeof supplierSchema>

interface SupplierFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
  mode: "create" | "edit"
}

export function SupplierFormDrawer({ open, onOpenChange, supplier, mode }: SupplierFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.supplier)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SupplierFormData>({
    resolver: yupResolver(supplierSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      physical_address: "",
      raw_product: "",
      volume_supplied: 0,
      volume_rejected: 0,
    },
  })

  const onSubmit = async (data: SupplierFormData) => {
    try {
      console.log('Form data submitted:', data)

      if (mode === "create") {
        const result = await dispatch(createSupplier(data)).unwrap()
        toast.success('Supplier created successfully')
      } else if (supplier) {
        const result = await dispatch(updateSupplier({
          ...data,
          id: supplier.id,
          created_at: supplier.created_at,
          updated_at: supplier.updated_at,
        })).unwrap()
        toast.success('Supplier updated successfully')
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      // Backend error message will be used from the thunk
      toast.error(error || (mode === "create" ? 'Failed to create supplier' : 'Failed to update supplier'))
    }
  }

  useEffect(() => {
    if (open && supplier && mode === "edit") {
      reset({
        first_name: supplier.first_name || "",
        last_name: supplier.last_name || "",
        email: supplier.email || "",
        phone_number: supplier.phone_number || "",
        physical_address: supplier.physical_address || "",
        raw_product: supplier.raw_product || "",
        volume_supplied: supplier.volume_supplied || 0,
        volume_rejected: supplier.volume_rejected || 0,
      })
    } else if (open && mode === "create") {
      reset({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        physical_address: "",
        raw_product: "",
        volume_supplied: 0,
        volume_rejected: 0,
      })
    }
  }, [open, supplier, mode, reset])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New Supplier" : "Edit Supplier"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new supplier profile" : "Update supplier information"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Controller
                    name="first_name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="first_name"
                        {...field}
                        placeholder="Enter first name"
                      />
                    )}
                  />
                  {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Controller
                    name="last_name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="last_name"
                        {...field}
                        placeholder="Enter last name"
                      />
                    )}
                  />
                  {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="email"
                        type="email"
                        {...field}
                        placeholder="Enter email address"
                      />
                    )}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Controller
                    name="phone_number"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="phone_number"
                        {...field}
                        placeholder="Enter phone number (e.g., +263770000000)"
                      />
                    )}
                  />
                  {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="physical_address">Physical Address *</Label>
                <Controller
                  name="physical_address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="physical_address"
                      {...field}
                      placeholder="Enter physical address"
                    />
                  )}
                />
                {errors.physical_address && <p className="text-sm text-red-500">{errors.physical_address.message}</p>}
              </div>
            </div>

            {/* Supply Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Supply Information</h3>
              <div className="space-y-2">
                <Label htmlFor="raw_product">Raw Product *</Label>
                <Controller
                  name="raw_product"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select raw product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milk">Milk</SelectItem>
                        <SelectItem value="cream">Cream</SelectItem>
                        <SelectItem value="yogurt">Yogurt</SelectItem>
                        <SelectItem value="cheese">Cheese</SelectItem>
                        <SelectItem value="butter">Butter</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.raw_product && <p className="text-sm text-red-500">{errors.raw_product.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume_supplied">Volume Supplied (L) *</Label>
                  <Controller
                    name="volume_supplied"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="volume_supplied"
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="Enter volume supplied in liters"
                      />
                    )}
                  />
                  {errors.volume_supplied && <p className="text-sm text-red-500">{errors.volume_supplied.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume_rejected">Volume Rejected (L) *</Label>
                  <Controller
                    name="volume_rejected"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="volume_rejected"
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="Enter volume rejected"
                      />
                    )}
                  />
                  {errors.volume_rejected && <p className="text-sm text-red-500">{errors.volume_rejected.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton type="button"  onClick={() => onOpenChange(false)}>
                Cancel
              </LoadingButton>
              <LoadingButton 
                type="submit" 
                loading={mode === "create" ? operationLoading.create : operationLoading.update}
                loadingText={mode === "create" ? "Creating..." : "Updating..."}
              >
                {mode === "create" ? "Create Supplier" : "Update Supplier"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}