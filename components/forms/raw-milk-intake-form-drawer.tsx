"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { SignatureModal } from "@/components/ui/signature-modal"
import { 
  Plus, 
  Trash2, 
  Droplets, 
  Truck, 
  Package,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Beaker
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createRawMilkIntakeForm, 
  updateRawMilkIntakeForm
} from "@/lib/store/slices/rawMilkIntakeSlice"
import { 
  fetchDriverForms 
} from "@/lib/store/slices/driverFormSlice"
import { RawMilkIntakeForm, CreateRawMilkIntakeFormRequest } from "@/lib/api/raw-milk-intake"
import { siloApi } from "@/lib/api/silo"
import { supplierApi } from "@/lib/api/supplier"
import { toast } from "sonner"
import { normalizeDataUrlToBase64, base64ToPngDataUrl } from "@/lib/utils/signature"
import { SignatureViewer } from "@/components/ui/signature-viewer"

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Truck className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-sm font-light">Drivers Form</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <Droplets className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-green-600">Raw Milk Intake</span>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Beaker className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Standardizing</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Package className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Pasteurizing</span>
      </div>
    </div>
  </div>
)

// Combined Form Schema
const sampleSchema = yup.object({
  supplier_id: yup.string().required("Supplier ID is required"),
  amount_collected: yup.number().required("Amount is required").min(0.1, "Amount must be greater than 0"),
  unit_of_measure: yup.string().required("Unit of measure is required"),
  serial_no: yup.string().required("Serial number is required"),
})

const rawMilkIntakeFormSchema = yup.object({
  date: yup.string().required("Date is required"),
  quantity_received: yup.number().required("Quantity is required").min(0.1, "Quantity must be greater than 0"),
  drivers_form_id: yup.string().required("Driver form ID is required"),
  destination_silo_id: yup.string().required("Destination silo ID is required"),
  operator_signature: yup.string().required("Operator signature is required"),
  samples_collected: yup.array(sampleSchema).optional().default([]),
})

type RawMilkIntakeFormData = yup.InferType<typeof rawMilkIntakeFormSchema>

interface RawMilkIntakeFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: RawMilkIntakeForm | null
  mode: "create" | "edit"
}

export function RawMilkIntakeFormDrawer({ 
  open, 
  onOpenChange, 
  form, 
  mode = "create" 
}: RawMilkIntakeFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.rawMilkIntake)
  const { driverForms } = useAppSelector((state) => state.driverForm)

  const [loadingDriverForms, setLoadingDriverForms] = useState(false)
  
  // State for searchable silos
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)
  
  // State for searchable suppliers
  const [suppliers, setSuppliers] = useState<SearchableSelectOption[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)

  // Single form for all data
  const formHook = useForm<RawMilkIntakeFormData>({
    resolver: yupResolver(rawMilkIntakeFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      quantity_received: 0,
      drivers_form_id: "",
      destination_silo_id: "",
      operator_signature: "",
      samples_collected: [
        {
          supplier_id: "",
          amount_collected: 0,
          unit_of_measure: "L",
          serial_no: "",
        }
      ],
    },
  })

  const [signatureOpen, setSignatureOpen] = useState(false)
  const [signatureViewOpen, setSignatureViewOpen] = useState(false)

  const { fields, append, remove } = useFieldArray({
    control: formHook.control,
    name: "samples_collected",
  })

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingDriverForms(true)
      setLoadingSilos(true)
      setLoadingSuppliers(true)
      
      // Load driver forms
      if (driverForms.length === 0) {
        await dispatch(fetchDriverForms({}))
      }
      
      // Load silos and suppliers in parallel
      const [silosResponse, suppliersResponse] = await Promise.all([
        siloApi.getSilos(),
        supplierApi.getSuppliers()
      ])
      
      console.log('Silos response:', silosResponse)
      const silosData = silosResponse.data?.map(silo => ({
        value: silo.id,
        label: silo.name,
        description: `${silo.location} • ${silo.category} • ${silo.capacity}L capacity`
      })) || []
      console.log('Mapped silos:', silosData)
      setSilos(silosData)
      
      console.log('Suppliers response:', suppliersResponse)
      const suppliersData = suppliersResponse.data?.map(supplier => ({
        value: supplier.id,
        label: `${supplier.first_name} ${supplier.last_name}`,
        description: `${supplier.email} • ${supplier.phone_number} • ${supplier.raw_product}`
      })) || []
      console.log('Mapped suppliers:', suppliersData)
      setSuppliers(suppliersData)
    } catch (error) {
      console.error("Failed to load initial data:", error)
      console.error("Error details:", error)
      toast.error("Failed to load form data")
    } finally {
      setLoadingDriverForms(false)
      setLoadingSilos(false)
      setLoadingSuppliers(false)
    }
  }

  // Handle silo search
  const handleSiloSearch = async (searchTerm: string) => {
    try {
      setLoadingSilos(true)
      const response = await siloApi.getSilos({
        filters: { search: searchTerm }
      })
      setSilos(response.data?.map(silo => ({
        value: silo.id,
        label: silo.name,
        description: `${silo.location} • ${silo.category} • ${silo.capacity}L capacity`
      })) || [])
    } catch (error) {
      console.error("Error searching silos:", error)
    } finally {
      setLoadingSilos(false)
    }
  }

  // Handle supplier search
  const handleSupplierSearch = async (searchTerm: string) => {
    try {
      setLoadingSuppliers(true)
      const response = await supplierApi.getSuppliers({
        filters: { search: searchTerm }
      })
      setSuppliers(response.data?.map(supplier => ({
        value: supplier.id,
        label: `${supplier.first_name} ${supplier.last_name}`,
        description: `${supplier.email} • ${supplier.phone_number} • ${supplier.raw_product}`
      })) || [])
    } catch (error) {
      console.error("Error searching suppliers:", error)
    } finally {
      setLoadingSuppliers(false)
    }
  }

  // Load data when drawer opens
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open, dispatch, driverForms.length])

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && form) {
        formHook.reset({
          date: form.date,
          quantity_received: form.quantity_received,
          drivers_form_id: form.drivers_form_id,
          destination_silo_id: form.destination_silo_id,
          operator_signature: form.operator_signature,
          samples_collected: form.samples_collected || [
            {
              supplier_id: "",
              amount_collected: 0,
              unit_of_measure: "L",
              serial_no: "",
            }
          ],
        })
      } else {
        formHook.reset({
          date: new Date().toISOString().split('T')[0],
          quantity_received: 0,
          drivers_form_id: "",
          destination_silo_id: "",
          operator_signature: "",
          samples_collected: [
            {
              supplier_id: "",
              amount_collected: 0,
              unit_of_measure: "L",
              serial_no: "",
            }
          ],
        })
      }
    }
  }, [open, mode, form])

  const handleSubmit = async (data: RawMilkIntakeFormData) => {
    try {
      const normalizedSignature = normalizeDataUrlToBase64(data.operator_signature)

      const formData: CreateRawMilkIntakeFormRequest = {
        id: mode === "edit" && form ? form.id : crypto.randomUUID(),
        created_at: mode === "edit" && form ? form.created_at : new Date().toISOString(),
        ...data,
        operator_signature: normalizedSignature,
      }

      if (mode === "edit" && form) {
        await dispatch(updateRawMilkIntakeForm({
          id: form.id,
          formData
        })).unwrap()
        toast.success("Form updated successfully")
      } else {
        await dispatch(createRawMilkIntakeForm(formData)).unwrap()
        toast.success("Form created successfully")
      }

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to save form")
    }
  }

  const renderForm = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />

      <div className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Basic Information</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Enter the basic raw milk intake details and operator information</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Controller
                name="date"
                control={formHook.control}
                render={({ field }) => (
                  <DatePicker
                    label="Date *"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select date"
                    error={!!formHook.formState.errors.date}
                    disabled={true}
                  />
                )}
              />
              {formHook.formState.errors.date && (
                <p className="text-sm text-red-500">{formHook.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity_received">Quantity Received (Liters) *</Label>
              <Controller
                name="quantity_received"
                control={formHook.control}
                render={({ field }) => (
                  <Input
                    id="quantity_received"
                    type="number"
                    step="0.1"
                    placeholder="Enter quantity"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              {formHook.formState.errors.quantity_received && (
                <p className="text-sm text-red-500">{formHook.formState.errors.quantity_received.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drivers_form_id">Driver Form *</Label>
              <Controller
                name="drivers_form_id"
                control={formHook.control}
                render={({ field }) => (
                  <SearchableSelect
                    options={driverForms.map(driverForm => ({
                      value: driverForm.id,
                      label: `#${driverForm.id.slice(0, 8)}`,
                      description: `${new Date(driverForm.start_date).toLocaleDateString()} • ${driverForm.delivered ? 'Delivered' : 'Pending'}`
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Search and select driver form"
                    loading={loadingDriverForms}
                  />
                )}
              />
              {formHook.formState.errors.drivers_form_id && (
                <p className="text-sm text-red-500">{formHook.formState.errors.drivers_form_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination_silo_id">Destination Silo *</Label>
              <Controller
                name="destination_silo_id"
                control={formHook.control}
                render={({ field }) => (
                  <SearchableSelect
                    options={silos}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select destination silo"
                    searchPlaceholder="Search silos..."
                    emptyMessage="No silos found"
                    loading={loadingSilos}
                    onSearch={handleSiloSearch}
                  />
                )}
              />
              {formHook.formState.errors.destination_silo_id && (
                <p className="text-sm text-red-500">{formHook.formState.errors.destination_silo_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="operator_signature">Operator Signature *</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Controller
                  name="operator_signature"
                  control={formHook.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {field.value ? (
                        <img src={base64ToPngDataUrl(field.value)} alt="Operator signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                      ) : (
                        <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                          No signature captured
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSignatureOpen(true)}>
                          Add Signature
                        </Button>
                        {field.value && (
                          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSignatureViewOpen(true)}>
                            View Signature
                          </Button>
                        )}
                        {field.value && (
                          <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => field.onChange("")}>Clear</Button>
                        )}
                      </div>
                    </div>
                  )}
                />
                {formHook.formState.errors.operator_signature && (
                  <p className="text-sm text-red-500">{formHook.formState.errors.operator_signature.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Samples Section */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Samples Collected</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Enter the sample collection details and quality information</p>
          </div>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Sample {index + 1}
                      </div>
                      <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`supplier_id_${index}`}>Supplier *</Label>
                      <Controller
                        name={`samples_collected.${index}.supplier_id`}
                        control={formHook.control}
                        render={({ field }) => (
                          <SearchableSelect
                            options={suppliers}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select supplier"
                            searchPlaceholder="Search suppliers..."
                            emptyMessage="No suppliers found"
                            loading={loadingSuppliers}
                            onSearch={handleSupplierSearch}
                          />
                        )}
                      />
                      {formHook.formState.errors.samples_collected?.[index]?.supplier_id && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.samples_collected[index]?.supplier_id?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`serial_no_${index}`}>Serial Number *</Label>
                      <Controller
                        name={`samples_collected.${index}.serial_no`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`serial_no_${index}`}
                            placeholder="Enter serial number"
                            {...field}
                          />
                        )}
                      />
                      {formHook.formState.errors.samples_collected?.[index]?.serial_no && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.samples_collected[index]?.serial_no?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`amount_collected_${index}`}>Amount Collected *</Label>
                      <Controller
                        name={`samples_collected.${index}.amount_collected`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`amount_collected_${index}`}
                            type="number"
                            step="0.1"
                            placeholder="Enter amount"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.samples_collected?.[index]?.amount_collected && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.samples_collected[index]?.amount_collected?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`unit_of_measure_${index}`}>Unit of Measure *</Label>
                      <Controller
                        name={`samples_collected.${index}.unit_of_measure`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border border-gray-300 hover:border-gray-400 focus:border-blue-500 shadow-none hover:shadow-none focus:shadow-none rounded-full">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="L">Liters (L)</SelectItem>
                              <SelectItem value="ml">Milliliters (ml)</SelectItem>
                              <SelectItem value="kg">Kilograms (kg)</SelectItem>
                              <SelectItem value="g">Grams (g)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {formHook.formState.errors.samples_collected?.[index]?.unit_of_measure && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.samples_collected[index]?.unit_of_measure?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({
                  supplier_id: "",
                  amount_collected: 0,
                  unit_of_measure: "L",
                  serial_no: "",
                })}
                className="rounded-full px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sample
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-lg font-light">
            {mode === "edit" ? "Edit Raw Milk Intake Form" : "Create Raw Milk Intake Form"}
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Enter all raw milk intake details including basic information and sample collection
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={formHook.handleSubmit(handleSubmit)}>
            {renderForm()}
            
            <div className="flex items-center justify-end p-6 border-t">
              <Button
                type="submit"
                disabled={operationLoading.create || operationLoading.update}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {mode === "edit" ? "Update Form" : "Create Form"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>

    <SignatureModal
      open={signatureOpen}
      onOpenChange={setSignatureOpen}
      title="Capture Operator Signature"
      onSave={(dataUrl) => {
        formHook.setValue("operator_signature", dataUrl, { shouldValidate: true })
      }}
    />
    <SignatureViewer
      open={signatureViewOpen}
      onOpenChange={setSignatureViewOpen}
      title="Operator Signature"
      value={formHook.getValues("operator_signature")}
    />
  </>
  )
}
