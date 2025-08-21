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

const supplierSchema = yup.object({
  name: yup.string().required("Supplier name is required"),
  contactPerson: yup.string().required("Contact person is required"),
  phone: yup.string().required("Phone number is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  zipCode: yup.string().required("ZIP code is required"),
  country: yup.string().required("Country is required"),
  status: yup.string().required("Status is required"),
  supplierType: yup.string().required("Supplier type is required"),
  paymentTerms: yup.string().required("Payment terms are required"),
  notes: yup.string(),
})

interface SupplierFormDrawerProps {
  open: boolean
  onClose: () => void
  supplier?: any
}

export function SupplierFormDrawer({ open, onClose, supplier }: SupplierFormDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(supplierSchema),
  })

  useEffect(() => {
    if (supplier) {
      Object.keys(supplier).forEach((key) => {
        setValue(key as any, supplier[key])
      })
    } else {
      reset()
    }
  }, [supplier, setValue, reset])

  const onSubmit = async (data: any) => {
    try {
      console.log("[v0] Supplier form data:", data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onClose()
      reset()
    } catch (error) {
      console.error("[v0] Error saving supplier:", error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>{supplier ? "Edit Supplier" : "Add New Supplier"}</SheetTitle>
                <SheetDescription>
                  {supplier ? "Update supplier information" : "Enter supplier details to add to the system"}
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
                <Label htmlFor="name">Supplier Name *</Label>
                <Input id="name" {...register("name")} placeholder="Enter supplier name" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input id="contactPerson" {...register("contactPerson")} placeholder="Enter contact person name" />
                {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" {...register("phone")} placeholder="Enter phone number" />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} placeholder="Enter email address" />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" {...register("address")} placeholder="Enter street address" />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" {...register("city")} placeholder="Enter city" />
                {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input id="state" {...register("state")} placeholder="Enter state" />
                {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input id="zipCode" {...register("zipCode")} placeholder="Enter ZIP code" />
                {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input id="country" {...register("country")} placeholder="Enter country" />
                {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select onValueChange={(value) => setValue("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierType">Supplier Type *</Label>
                <Select onValueChange={(value) => setValue("supplierType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw_milk">Raw Milk</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="chemicals">Chemicals</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
                {errors.supplierType && <p className="text-sm text-red-500">{errors.supplierType.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms *</Label>
              <Select onValueChange={(value) => setValue("paymentTerms", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="net_30">Net 30</SelectItem>
                  <SelectItem value="net_60">Net 60</SelectItem>
                  <SelectItem value="net_90">Net 90</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="prepaid">Prepaid</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentTerms && <p className="text-sm text-red-500">{errors.paymentTerms.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Additional notes about the supplier..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : supplier ? "Update Supplier" : "Add Supplier"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
