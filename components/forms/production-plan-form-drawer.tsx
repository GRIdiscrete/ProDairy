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
import { fetchProcesses } from "@/lib/store/slices/processSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import type { ProductionPlan, ProductionPlanRawProduct } from "@/lib/types"
import type { CreateProductionPlanRequest, UpdateProductionPlanRequest } from "@/lib/api/production-plan"

const productionPlanSchema = yup.object({
  name: yup.string().required("Production plan name is required"),
  description: yup.string(),
  start_date: yup.string().required("Start date is required"),
  end_date: yup.string().required("End date is required"),
  supervisor: yup.string().required("Supervisor is required"),
  status: yup.string().required("Status is required"),
  process_id: yup.string().required("Process is required"),
  output: yup.object({
    value: yup.number().positive("Output value must be positive").required("Output value is required"),
    unit_of_measure: yup.string().required("Output unit of measure is required"),
  }).required("Output information is required"),
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
  process_id: string
  output: {
    value: number
    unit_of_measure: string
  }
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
  const { processes, operationLoading: processLoading } = useAppSelector((state) => state.process)

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
      process_id: "",
      output: {
        value: 0,
        unit_of_measure: "litres",
      },
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
      dispatch(fetchRawMaterials({}))
      dispatch(fetchUsers({}))
      dispatch(fetchProcesses({}))
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
        setValue("process_id", productionPlan.process_id || "")
        setValue("output", productionPlan.output || { value: 0, unit_of_measure: "litres" })

        // Ensure raw_material_name is populated for each raw product
        const rawProductsWithNames = productionPlan.raw_products.map(product => {
          const material = rawMaterials.find(m => m.id === product.raw_material_id)
          return {
            ...product,
            raw_material_name: product.raw_material_name || material?.name || ""
          }
        })
        setValue("raw_products", rawProductsWithNames)
      } else {
        reset({
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          supervisor: "",
          status: "planned",
          process_id: "",
          output: {
            value: 0,
            unit_of_measure: "litres",
          },
          raw_products: [],
        })
      }
    }
  }, [open, mode, productionPlan, rawMaterials, setValue, reset])

  const onSubmit: SubmitHandler<ProductionPlanFormData> = async (data) => {
    try {
      setLoading(true)

      console.log('Production Plan Form Submit - Mode:', mode)
      console.log('Production Plan Form Submit - Data:', data)
      console.log('Production Plan Form Submit - Existing Plan:', productionPlan)

      // Transform data for API request
      const baseData = {
        name: data.name,
        description: data.description,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        supervisor: data.supervisor,
        status: data.status,
        process_id: data.process_id,
        output_value: data.output.value,
        output_units: data.output.unit_of_measure,
      }

      const rawProductsData = data.raw_products.map(item => ({
        raw_material_id: item.raw_material_id,
        requested_amount: item.requested_amount,
        units: item.unit_of_measure
      }))

      if (mode === "create") {
        const createData: CreateProductionPlanRequest = {
          ...baseData,
          raw_products_object: rawProductsData
        }
        console.log('Creating production plan with data:', createData)
        await dispatch(createProductionPlan(createData)).unwrap()
        toast.success("Production plan created successfully")
      } else if (productionPlan) {
        const updateData: UpdateProductionPlanRequest = {
          ...baseData,
          id: productionPlan.id,
          created_at: productionPlan.created_at,
          updated_at: new Date().toISOString(),
          raw_products: rawProductsData
        }
        console.log('Updating production plan with data:', updateData)
        await dispatch(updateProductionPlan(updateData)).unwrap()
        toast.success("Production plan updated successfully")
      }

      // Refresh the production plans list
      dispatch(fetchProductionPlans({}))
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Production Plan Submit Error:', error)
      const message = error?.message || error || "An error occurred"
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
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">
            {mode === "create" ? "Add New Production Plan" : "Edit Production Plan"}
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            {mode === "create" ? "Create a new production plan with raw materials and quantities" : "Update production plan information and materials"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto bg-white p-6">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Debug: Show validation errors */}


            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Plan Name *</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
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
                <Label>Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Enter plan description"
                      disabled={isSubmitting}
                      rows={3}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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
                  <Label>Supervisor *</Label>
                  <Controller
                    name="supervisor"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                        <SelectTrigger className="w-full rounded-full">
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
                  <Label>Status *</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                        <SelectTrigger className="w-full rounded-full">
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

              <div className="space-y-2">
                <Label>Process *</Label>
                <Controller
                  name="process_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                      <SelectTrigger className="w-full rounded-full">
                        <SelectValue placeholder="Select process" />
                      </SelectTrigger>
                      <SelectContent>
                        {processLoading.fetch ? (
                          <SelectItem value="loading" disabled>Loading processes...</SelectItem>
                        ) : (
                          processes.map((process) => (
                            <SelectItem key={process.id} value={process.id}>
                              {process.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.process_id && (
                  <p className="text-sm text-red-500">{errors.process_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Output Value *</Label>
                  <Controller
                    name="output.value"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="Enter output value"
                        disabled={isSubmitting}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      />
                    )}
                  />
                  {errors.output?.value && (
                    <p className="text-sm text-red-500">{errors.output.value.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Output Unit *</Label>
                  <Controller
                    name="output.unit_of_measure"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                        <SelectTrigger className="w-full rounded-full">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="litres">Litres</SelectItem>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="ML">ML</SelectItem>
                          <SelectItem value="G">G</SelectItem>
                          <SelectItem value="PCS">PCS</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.output?.unit_of_measure && (
                    <p className="text-sm text-red-500">{errors.output.unit_of_measure.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Raw Materials *</Label>
                <Button
                  type="button"
                  onClick={addRawMaterial}
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </div>
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-gray-200 rounded-lg">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No raw materials added yet</p>
                  <p className="text-sm">Click "Add Material" to get started</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4">
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
                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
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
                                <SelectTrigger className="w-full rounded-full">
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
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                                  <SelectTrigger className="w-full rounded-full">
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
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white border-0 rounded-full px-6 py-2 font-light"
              >
                {mode === "create" ? "Create Plan" : "Update Plan"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}