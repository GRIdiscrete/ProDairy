"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, ClipboardList, Package, User, Plus, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createProductionPlan, updateProductionPlan, fetchProductionPlans } from "@/lib/store/slices/productionPlanSlice"
import { fetchRawMaterials } from "@/lib/store/slices/rawMaterialSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import type { ProductionPlan, ProductionPlanRawProduct } from "@/lib/types"

const productionPlanSchema = yup.object({
  name: yup.string().required("Production plan name is required"),
  description: yup.string(),
  start_date: yup.string().required("Start date is required"),
  end_date: yup.string().required("End date is required"),
  supervisor: yup.string().required("Supervisor is required"),
  status: yup.string().required("Status is required"),
  raw_products: yup.array().of(
    yup.object({
      raw_material_id: yup.string().required("Raw material is required"),
      raw_material_name: yup.string().required("Raw material name is required"),
      requested_amount: yup.number().positive("Amount must be positive").required("Amount is required"),
      unit_of_measure: yup.string().required("Unit of measure is required"),
    })
  ).min(1, "At least one raw material must be added").required("Raw materials are required"),
})

type ProductionPlanFormData = {
  name: string
  description?: string
  start_date: string
  end_date: string
  supervisor: string
  status: "planned" | "ongoing" | "completed" | "cancelled"
  raw_products: ProductionPlanRawProduct[]
}

interface ProductionPlanFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productionPlan?: ProductionPlan
  mode: "create" | "edit"
  onSuccess?: () => void
}

export function ProductionPlanFormDrawer({ 
  open, 
  onOpenChange, 
  productionPlan, 
  mode, 
  onSuccess 
}: ProductionPlanFormDrawerProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const { operationLoading } = useAppSelector((state) => state.productionPlan)
  const { rawMaterials, operationLoading: rawMaterialLoading } = useAppSelector((state) => state.rawMaterial)
  const { items: users, loading: usersLoading } = useAppSelector((state) => state.users)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ProductionPlanFormData>({
    resolver: yupResolver(productionPlanSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      supervisor: "",
      status: "planned",
      raw_products: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "raw_products",
  })

  // Load required data on component mount
  useEffect(() => {
    if (open) {
      dispatch(fetchRawMaterials())
      dispatch(fetchUsers())
    }
  }, [dispatch, open])

  // Reset form when production plan changes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && productionPlan) {
        setValue("name", productionPlan.name)
        setValue("description", productionPlan.description || "")
        setValue("start_date", productionPlan.start_date.split('T')[0])
        setValue("end_date", productionPlan.end_date.split('T')[0])
        setValue("supervisor", productionPlan.supervisor)
        setValue("status", productionPlan.status)
        setValue("raw_products", productionPlan.raw_products)
      } else {
        reset({
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          supervisor: "",
          status: "planned",
          raw_products: [],
        })
      }
    }
  }, [open, mode, productionPlan, setValue, reset])

  const onSubmit: SubmitHandler<ProductionPlanFormData> = async (data) => {
    try {
      setLoading(true)
      
      const submitData = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      }

      if (mode === "create") {
        await dispatch(createProductionPlan(submitData)).unwrap()
        toast.success("Production plan created successfully")
      } else if (productionPlan) {
        await dispatch(updateProductionPlan({
          ...submitData,
          id: productionPlan.id,
          created_at: productionPlan.created_at,
          updated_at: new Date().toISOString(),
        })).unwrap()
        toast.success("Production plan updated successfully")
      }

      // Refresh the production plans list
      dispatch(fetchProductionPlans())
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      const message = error?.message || "An error occurred"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const addRawMaterial = () => {
    append({
      raw_material_id: "",
      raw_material_name: "",
      requested_amount: 0,
      unit_of_measure: "KG",
    })
  }

  const handleRawMaterialSelect = (index: number, materialId: string) => {
    const selectedMaterial = rawMaterials.find(m => m.id === materialId)
    if (selectedMaterial) {
      setValue(`raw_products.${index}.raw_material_id`, materialId)
      setValue(`raw_products.${index}.raw_material_name`, selectedMaterial.name)
    }
  }

  const isLoading = loading || operationLoading.create || operationLoading.update

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            {mode === "create" ? "Add New Production Plan" : `Edit Production Plan: ${productionPlan?.name}`}
          </SheetTitle>
            <SheetDescription>
            {mode === "create" 
              ? "Create a new production plan with raw materials and quantities" 
              : "Update production plan information and materials"}
            </SheetDescription>
          </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Plan Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder="Enter production plan name"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Enter plan description"
                        disabled={isSubmitting}
                        rows={3}
                      />
                    )}
                  />
                </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                        <Controller
                          name="start_date"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              label="Start Date *"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select start date"
                              disabled={isSubmitting}
                              error={!!errors.start_date}
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
                            <DatePicker
                              label="End Date *"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select end date"
                              disabled={isSubmitting}
                              error={!!errors.end_date}
                            />
                          )}
                        />
                    {errors.end_date && (
                      <p className="text-sm text-red-500">{errors.end_date.message}</p>
                    )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                    <Label htmlFor="supervisor">Supervisor</Label>
                    <Controller
                      name="supervisor"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supervisor" />
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
                    {errors.supervisor && (
                      <p className="text-sm text-red-500">{errors.supervisor.message}</p>
                    )}
              </div>

              <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                      )}
                    />
                    {errors.status && (
                      <p className="text-sm text-red-500">{errors.status.message}</p>
                    )}
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
                  Raw Materials
                </CardTitle>
                <Button
                  type="button"
                  onClick={addRawMaterial}
                  size="sm"
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No raw materials added yet</p>
                  <p className="text-sm">Click "Add Material" to get started</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Material #{index + 1}</h4>
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
            <div className="space-y-2">
                          <Label>Raw Material</Label>
                          <Controller
                            name={`raw_products.${index}.raw_material_id`}
                            control={control}
                            render={({ field }) => (
                              <Select 
                                value={field.value} 
                                onValueChange={(value) => handleRawMaterialSelect(index, value)}
                                disabled={isSubmitting}
                              >
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
                          {errors.raw_products?.[index]?.raw_material_id && (
                            <p className="text-sm text-red-500">
                              {errors.raw_products[index]?.raw_material_id?.message}
                            </p>
                          )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                            <Label>Requested Amount</Label>
                            <Controller
                              name={`raw_products.${index}.requested_amount`}
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
                            {errors.raw_products?.[index]?.requested_amount && (
                              <p className="text-sm text-red-500">
                                {errors.raw_products[index]?.requested_amount?.message}
                              </p>
                            )}
              </div>

              <div className="space-y-2">
                            <Label>Unit of Measure</Label>
                            <Controller
                              name={`raw_products.${index}.unit_of_measure`}
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
                            {errors.raw_products?.[index]?.unit_of_measure && (
                              <p className="text-sm text-red-500">
                                {errors.raw_products[index]?.unit_of_measure?.message}
                              </p>
                            )}
                          </div>
                        </div>
              </div>
            </div>
                  ))}
            </div>
              )}
              {errors.raw_products && (
                <p className="text-sm text-red-500">{errors.raw_products.message}</p>
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
              {mode === "create" ? "Create Plan" : "Save Changes"}
            </LoadingButton>
            </div>
          </form>
      </SheetContent>
    </Sheet>
  )
}