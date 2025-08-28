"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Truck, User, Package, Plus, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createDriverForm, updateDriverForm, fetchDriverForms } from "@/lib/store/slices/driverFormSlice"
import { fetchRawMaterials } from "@/lib/store/slices/rawMaterialSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchSuppliers } from "@/lib/store/slices/supplierSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import type { DriverForm, DriverFormCollectedProduct } from "@/lib/types"

const driverFormSchema = yup.object({
  driver: yup.string().required("Driver is required"),
  start_date: yup.string().required("Start date is required"),
  end_date: yup.string().required("End date is required"),
  delivered: yup.boolean(),
  rejected: yup.boolean(),
  collected_products: yup.array().of(
    yup.object({
      raw_material_id: yup.string().required("Raw material is required"),
      supplier_id: yup.string().required("Supplier is required"),
      collected_amount: yup.number().positive("Amount must be positive").required("Amount is required"),
      unit_of_measure: yup.string().required("Unit of measure is required"),
      "e-sign-supplier": yup.string().required("Supplier signature is required"),
      "e-sign-driver": yup.string().required("Driver signature is required"),
    })
  ),
})

type DriverFormFormData = {
  driver: string
  start_date: string
  end_date: string
  delivered: boolean
  rejected: boolean
  collected_products: DriverFormCollectedProduct[]
}

interface DriverFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverForm?: DriverForm
  mode: "create" | "edit"
  onSuccess?: () => void
}

export function DriverFormDrawer({ 
  open, 
  onOpenChange, 
  driverForm, 
  mode, 
  onSuccess 
}: DriverFormDrawerProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const { operationLoading } = useAppSelector((state) => state.driverForm)
  const { rawMaterials, operationLoading: rawMaterialLoading } = useAppSelector((state) => state.rawMaterial)
  const { items: users, loading: usersLoading } = useAppSelector((state) => state.users)
  const { suppliers, operationLoading: suppliersLoading } = useAppSelector((state) => state.supplier)
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<DriverFormFormData>({
    resolver: yupResolver(driverFormSchema) as any,
    defaultValues: {
      driver: "",
      start_date: "",
      end_date: "",
      delivered: false,
      rejected: false,
      collected_products: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "collected_products",
  })

  // Load required data on component mount
  useEffect(() => {
    if (open) {
      dispatch(fetchRawMaterials())
      dispatch(fetchUsers())
      dispatch(fetchSuppliers())
    }
  }, [dispatch, open])

  // Reset form when driver form changes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && driverForm) {
        setValue("driver", driverForm.driver)
        setValue("start_date", driverForm.start_date.split('T')[0])
        setValue("end_date", driverForm.end_date.split('T')[0])
        setValue("delivered", driverForm.delivered)
        setValue("rejected", driverForm.rejected)
        setValue("collected_products", driverForm.collected_products || [])
      } else {
        reset({
          driver: "",
          start_date: "",
          end_date: "",
          delivered: false,
          rejected: false,
          collected_products: [],
        })
      }
    }
  }, [open, mode, driverForm, setValue, reset])

  const onSubmit: SubmitHandler<DriverFormFormData> = async (data) => {
    try {
      setLoading(true)
      
      const submitData = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      }

      if (mode === "create") {
        await dispatch(createDriverForm(submitData)).unwrap()
        toast.success("Driver form created successfully")
      } else if (driverForm) {
        await dispatch(updateDriverForm({
          ...submitData,
          id: driverForm.id,
          created_at: driverForm.created_at,
          updated_at: new Date().toISOString(),
        })).unwrap()
        toast.success("Driver form updated successfully")
      }

      // Refresh the driver forms list
      dispatch(fetchDriverForms())
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      const message = error?.message || "An error occurred"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const addCollectedProduct = () => {
    append({
      raw_material_id: "",
      supplier_id: "",
      collected_amount: 0,
      unit_of_measure: "KG",
      "e-sign-supplier": "",
      "e-sign-driver": "",
    })
  }

  const isLoading = loading || operationLoading.create || operationLoading.update

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            {mode === "create" ? "Add New Driver Form" : `Edit Driver Form: #${driverForm?.id.slice(0, 8)}`}
          </SheetTitle>
          <SheetDescription>
            {mode === "create" 
              ? "Create a new driver collection form" 
              : "Update driver form information"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Driver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driver">Driver</Label>
                  <Controller
                    name="driver"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                        <SelectContent>
                          {usersLoading ? (
                            <SelectItem value="loading" disabled>Loading users...</SelectItem>
                          ) : (
                            users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.driver && (
                    <p className="text-sm text-red-500">{errors.driver.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="start_date"
                          type="date"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-500">{errors.start_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Controller
                      name="end_date"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="end_date"
                          type="date"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-500">{errors.end_date.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="delivered"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="delivered"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    <Label htmlFor="delivered">Delivered</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="rejected"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="rejected"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    <Label htmlFor="rejected">Rejected</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Collected Products
                </CardTitle>
                <Button
                  type="button"
                  onClick={addCollectedProduct}
                  size="sm"
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No collected products added yet</p>
                  <p className="text-sm">Click "Add Product" to get started</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Product #{index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          size="sm"
                          variant="destructive"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Raw Material</Label>
                            <Controller
                              name={`collected_products.${index}.raw_material_id`}
                              control={control}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select raw material" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {rawMaterialLoading.fetch ? (
                                      <SelectItem value="loading" disabled>Loading materials...</SelectItem>
                                    ) : (
                                      rawMaterials.map((material) => (
                                        <SelectItem key={material.id} value={material.id}>
                                          {material.name}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.collected_products?.[index]?.raw_material_id && (
                              <p className="text-sm text-red-500">
                                {errors.collected_products[index]?.raw_material_id?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Supplier</Label>
                            <Controller
                              name={`collected_products.${index}.supplier_id`}
                              control={control}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select supplier" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {suppliersLoading.fetch ? (
                                      <SelectItem value="loading" disabled>Loading suppliers...</SelectItem>
                                    ) : (
                                      suppliers.map((supplier) => (
                                        <SelectItem key={supplier.id} value={supplier.id}>
                                          {supplier.first_name} {supplier.last_name}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.collected_products?.[index]?.supplier_id && (
                              <p className="text-sm text-red-500">
                                {errors.collected_products[index]?.supplier_id?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Collected Amount</Label>
                            <Controller
                              name={`collected_products.${index}.collected_amount`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  disabled={isSubmitting}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              )}
                            />
                            {errors.collected_products?.[index]?.collected_amount && (
                              <p className="text-sm text-red-500">
                                {errors.collected_products[index]?.collected_amount?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Unit of Measure</Label>
                            <Controller
                              name={`collected_products.${index}.unit_of_measure`}
                              control={control}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="KG">KG</SelectItem>
                                    <SelectItem value="L">L</SelectItem>
                                    <SelectItem value="ML">ML</SelectItem>
                                    <SelectItem value="G">G</SelectItem>
                                    <SelectItem value="PCS">PCS</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.collected_products?.[index]?.unit_of_measure && (
                              <p className="text-sm text-red-500">
                                {errors.collected_products[index]?.unit_of_measure?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Supplier E-Signature</Label>
                            <Controller
                              name={`collected_products.${index}.e-sign-supplier`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="Supplier signature"
                                  disabled={isSubmitting}
                                />
                              )}
                            />
                            {errors.collected_products?.[index]?.["e-sign-supplier"] && (
                              <p className="text-sm text-red-500">
                                {errors.collected_products[index]?.["e-sign-supplier"]?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Driver E-Signature</Label>
                            <Controller
                              name={`collected_products.${index}.e-sign-driver`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="Driver signature"
                                  disabled={isSubmitting}
                                />
                              )}
                            />
                            {errors.collected_products?.[index]?.["e-sign-driver"] && (
                              <p className="text-sm text-red-500">
                                {errors.collected_products[index]?.["e-sign-driver"]?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.collected_products && (
                <p className="text-sm text-red-500">{errors.collected_products.message}</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={isLoading}
            >
              {mode === "create" ? "Create Form" : "Save Changes"}
            </LoadingButton>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}