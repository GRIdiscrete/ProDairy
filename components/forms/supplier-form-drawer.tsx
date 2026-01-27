"use client"

import { useState, useEffect } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, PlusCircle, Package } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createSupplier, updateSupplier } from "@/lib/store/slices/supplierSlice"
import { toast } from "sonner"
import type { Supplier } from "@/lib/types"

const supplierSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  company_name: yup.string().nullable(),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone_number: yup.string().required("Phone number is required"),
  physical_address: yup.string().required("Physical address is required"),
  raw_product: yup.string().required("Raw product is required"),
  number_of_tanks: yup.number().nullable().transform((v) => (v === "" || isNaN(v) ? null : v)),
  volume_supplied: yup.number().nullable().transform((v) => (v === "" || isNaN(v) ? null : v)),
  volume_rejected: yup.number().nullable().transform((v) => (v === "" || isNaN(v) ? null : v)),
  tanks: yup.array().of(
    yup.object({
      id: yup.string().optional(),
      code: yup.string().required("Tank code is required"),
      name: yup.string().required("Tank name is required"),
      capacity: yup.number().required("Capacity is required").min(0),
      quantity: yup.number().nullable().transform((v) => (v === "" || isNaN(v) ? null : v)),
    })
  ).optional(),
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
      company_name: "",
      email: "",
      phone_number: "",
      physical_address: "",
      raw_product: "",
      number_of_tanks: 0,
      volume_supplied: 0,
      volume_rejected: 0,
      tanks: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tanks",
  })

  const onSubmit = async (data: SupplierFormData) => {
    try {
      console.log('Form data submitted:', data)

      if (mode === "create") {
        const { tanks, ...createData } = data
        const result = await dispatch(createSupplier(createData)).unwrap()
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
        company_name: supplier.company_name || "",
        email: supplier.email || "",
        phone_number: supplier.phone_number || "",
        physical_address: supplier.physical_address || "",
        raw_product: supplier.raw_product || "",
        number_of_tanks: supplier.number_of_tanks || 0,
        volume_supplied: supplier.volume_supplied || 0,
        volume_rejected: supplier.volume_rejected || 0,
        tanks: supplier.suppliers_tanks?.map(t => ({
          id: t.id,
          code: t.code,
          name: t.name,
          capacity: t.capacity,
          quantity: t.quantity,
        })) || [],
      })
    } else if (open && mode === "create") {
      reset({
        first_name: "",
        last_name: "",
        company_name: "",
        email: "",
        phone_number: "",
        physical_address: "",
        raw_product: "",
        number_of_tanks: 0,
        volume_supplied: 0,
        volume_rejected: 0,
        tanks: [],
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
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Controller
                  name="company_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="company_name"
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter company name"
                    />
                  )}
                />
                {errors.company_name && <p className="text-sm text-red-500">{errors.company_name.message}</p>}
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
              <div className="space-y-2">
                <Label htmlFor="number_of_tanks">Number of Tanks</Label>
                <Controller
                  name="number_of_tanks"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="number_of_tanks"
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      placeholder="Enter number of tanks"
                    />
                  )}
                />
                {errors.number_of_tanks && <p className="text-sm text-red-500">{errors.number_of_tanks.message}</p>}
              </div>
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
              </div>
            </div>

            {/* Tanks Management - Only shown in Edit Mode */}
            {mode === "edit" && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Supplier Tanks
                  </h3>
                  <LoadingButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ code: "", name: "", capacity: 0, quantity: 0 })}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Tank
                  </LoadingButton>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg bg-gray-50 space-y-4 relative">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label>Tank Code *</Label>
                          <Controller
                            name={`tanks.${index}.code`}
                            control={control}
                            render={({ field }) => (
                              <Input {...field} placeholder="e.g. TANK-001" />
                            )}
                          />
                          {errors.tanks?.[index]?.code && (
                            <p className="text-sm text-red-500">{errors.tanks[index].code.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Tank Name *</Label>
                          <Controller
                            name={`tanks.${index}.name`}
                            control={control}
                            render={({ field }) => (
                              <Input {...field} placeholder="e.g. Main Milk Tank" />
                            )}
                          />
                          {errors.tanks?.[index]?.name && (
                            <p className="text-sm text-red-500">{errors.tanks[index].name.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Capacity (L) *</Label>
                          <Controller
                            name={`tanks.${index}.capacity`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                placeholder="20000"
                              />
                            )}
                          />
                          {errors.tanks?.[index]?.capacity && (
                            <p className="text-sm text-red-500">{errors.tanks[index].capacity.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity (L)</Label>
                          <Controller
                            name={`tanks.${index}.quantity`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                placeholder="0"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4 border-2 border-dashed rounded-lg">
                      No tanks added yet. Click "Add Tank" to manage supplier tanks.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton type="button" onClick={() => onOpenChange(false)}>
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