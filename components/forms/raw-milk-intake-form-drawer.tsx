"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
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
  Beaker,
  User
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  createRawMilkIntakeForm,
  updateRawMilkIntakeForm
} from "@/lib/store/slices/rawMilkIntakeSlice"
import {
  fetchDriverForms
} from "@/lib/store/slices/driverFormSlice"
import {
  fetchSuppliers
} from "@/lib/store/slices/supplierSlice"
import { RawMilkIntakeForm, CreateRawMilkIntakeFormRequest } from "@/lib/api/raw-milk-intake"
import { siloApi } from "@/lib/api/silo"
import { toast } from "sonner"
import { normalizeDataUrlToBase64, base64ToPngDataUrl } from "@/lib/utils/signature"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { generateDriverFormId } from "@/lib/utils/form-id-generator"

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
const rawMilkIntakeFormSchema = yup.object({
  date: yup.string().required("Date is required"),
  drivers_form_id: yup.string().required("Driver form ID is required"),
  destination_silo_name: yup.string().required("Destination silo name is required"),
  operator_id: yup.string().required("Operator ID is required"),
  operator_signature: yup.string().required("Operator signature is required"),
  status: yup.string().oneOf(["draft", "pending", "final"]).required("Status is required"),
  raw_milk_intake_form_samples: yup.array().of(
    yup.object({
      supplier_id: yup.string().required("Supplier is required"),
      unit_of_measure: yup.string().required("Unit of measure is required"),
      amount_collected: yup.number().required("Amount is required").min(0.1, "Amount must be greater than 0"),
    })
  ).optional().default([]),
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
  const { suppliers } = useAppSelector((state) => state.supplier)
  const { user, profile } = useAppSelector((state) => state.auth)

  const [loadingDriverForms, setLoadingDriverForms] = useState(false)

  // State for searchable silos
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)


  // Single form for all data
  const formHook = useForm<RawMilkIntakeFormData>({
    resolver: yupResolver(rawMilkIntakeFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      drivers_form_id: "",
      destination_silo_name: "",
      operator_id: user?.id || "",
      operator_signature: "",
      status: "draft",
      raw_milk_intake_form_samples: [],
    },
  })

  const [signatureOpen, setSignatureOpen] = useState(false)
  const [signatureViewOpen, setSignatureViewOpen] = useState(false)


  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingDriverForms(true)
      setLoadingSilos(true)

      // Load driver forms
      if (driverForms.length === 0) {
        await dispatch(fetchDriverForms({}))
      }

      // Load suppliers
      if (suppliers.length === 0) {
        await dispatch(fetchSuppliers({}))
      }

      // Load silos
      const silosResponse = await siloApi.getSilos()

      console.log('Silos response:', silosResponse)
      const silosData = silosResponse.data?.map(silo => ({
        value: silo.id,
        label: silo.name,
        description: `${silo.location} • ${silo.category} • ${silo.capacity}L capacity`
      })) || []
      console.log('Mapped silos:', silosData)
      setSilos(silosData)
    } catch (error) {
      console.error("Failed to load initial data:", error)
      console.error("Error details:", error)
      toast.error("Failed to load form data")
    } finally {
      setLoadingDriverForms(false)
      setLoadingSilos(false)
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


  // Load data when drawer opens
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open, dispatch, driverForms.length])

  // Auto-populate operator fields when user changes
  useEffect(() => {
    if (user?.id) {
      formHook.setValue("operator_id", user.id)
      // If user has a saved signature, auto-populate it
      // For now, we'll leave signature empty for manual entry
      // In the future, this could be retrieved from user profile
    }
  }, [user, formHook])

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && form) {
        formHook.reset({
          date: form.date,
          drivers_form_id: form.drivers_form_id,
          destination_silo_name: form.destination_silo_name || "",
          operator_id: form.operator_id || user?.id || "",
          operator_signature: form.operator_signature,
          status: form.status || "draft",
          raw_milk_intake_form_samples: (form as any).raw_milk_intake_form_samples || [],
        })
      } else {
        formHook.reset({
          date: new Date().toISOString().split('T')[0],
          drivers_form_id: "",
          destination_silo_name: "",
          operator_id: user?.id || "",
          operator_signature: "",
          status: "draft",
          raw_milk_intake_form_samples: [],
        })
      }
    }
  }, [open, mode, form])

  const handleSubmit = async (data: RawMilkIntakeFormData) => {
    try {
      const normalizedSignature = normalizeDataUrlToBase64(data.operator_signature)

      let samplesWithAllFields = (data.raw_milk_intake_form_samples || []);
      if (mode === "edit" && form && Array.isArray((form as any).raw_milk_intake_form_samples)) {
        samplesWithAllFields = samplesWithAllFields.map((sample, idx) => {
          const existing = (form as any).raw_milk_intake_form_samples[idx];
          return {
            // ...sample,
            id: sample.id,
            supplier_id: sample.supplier_id,
            unit_of_measure: sample.unit_of_measure,
            amount_collected: sample.amount_collected,
            raw_milk_intake_form_id: form.id,
            // lab_test_id: existing?.lab_test_id || sample.lab_test_id,
          };
        });
      }

      const formData = mode === "edit" && form ? {
        id: form.id,
        operator_id: data.operator_id,
        operator_signature: normalizedSignature,
        date: data.date,
        destination_silo_name: data.destination_silo_name,
        drivers_form_id: data.drivers_form_id,
        status: data.status,
        raw_milk_intake_form_samples: Array.isArray(samplesWithAllFields) ? samplesWithAllFields : [],
      } : {
        operator_id: data.operator_id,
        operator_signature: normalizedSignature,
        date: data.date,
        drivers_form_id: data.drivers_form_id,
        destination_silo_name: data.destination_silo_name,
        status: data.status,
        raw_milk_intake_form_samples: samplesWithAllFields,
      };

      console.log("Form Data:", formData);

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
            <p className="text-sm font-light text-gray-600 mt-2">Enter the basic raw milk intake details</p>
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
                    disabled={false}
                  />
                )}
              />
              {formHook.formState.errors.date && (
                <p className="text-sm text-red-500">{formHook.formState.errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Controller
                name="status"
                control={formHook.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full rounded-full py-2 px-4">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {formHook.formState.errors.status && (
                <p className="text-sm text-red-500">{formHook.formState.errors.status.message}</p>
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
                      label: driverForm?.tag ?? 'N/A',
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
              <Label htmlFor="destination_silo_name">Destination Silo *</Label>
              <Controller
                name="destination_silo_name"
                control={formHook.control}
                render={({ field }) => (
                  <SearchableSelect
                    options={silos.map(silo => ({
                      value: silo.label, // Use silo name as value
                      label: silo.label,
                      description: silo.description
                    }))}
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
              {formHook.formState.errors.destination_silo_name && (
                <p className="text-sm text-red-500">{formHook.formState.errors.destination_silo_name.message}</p>
              )}
            </div>
          </div>

          {/* Hidden operator_id field - auto-populated but not visible */}
          <Controller
            name="operator_id"
            control={formHook.control}
            render={({ field }) => (
              <input type="hidden" {...field} />
            )}
          />
        </div>


        {/* Samples Section */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Sample Collection</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Add samples collected during raw milk intake</p>
          </div>

          <div className="space-y-3">
            {formHook.watch("raw_milk_intake_form_samples")?.map((sample, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Supplier *</Label>
                    <Controller
                      name={`raw_milk_intake_form_samples.${index}.supplier_id`}
                      control={formHook.control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={suppliers.map(supplier => ({
                            value: supplier.id,
                            label: `${supplier.first_name} ${supplier.last_name}`,
                            description: `${supplier.email} • ${supplier.raw_product}`
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select supplier"
                          searchPlaceholder="Search suppliers..."
                          emptyMessage="No suppliers found"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit of Measure *</Label>
                    <Controller
                      name={`raw_milk_intake_form_samples.${index}.unit_of_measure`}
                      control={formHook.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="liters">Liters</SelectItem>
                            <SelectItem value="milliliters">Milliliters</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <div className="flex gap-2">
                      <Controller
                        name={`raw_milk_intake_form_samples.${index}.amount_collected`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const samples = formHook.getValues("raw_milk_intake_form_samples") || []
                          formHook.setValue("raw_milk_intake_form_samples", samples.filter((_, i) => i !== index))
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const samples = formHook.getValues("raw_milk_intake_form_samples") || []
                formHook.setValue("raw_milk_intake_form_samples", [
                  ...samples,
                  { supplier_id: "", unit_of_measure: "liters", amount_collected: 0 }
                ])
              }}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sample
            </Button>
          </div>
        </div>

        {/* Operator Signature Section */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Operator Signature</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Provide your signature to authorize this intake</p>
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
      </div>
    </div>
  )

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="tablet-sheet-full p-0 bg-white">
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
