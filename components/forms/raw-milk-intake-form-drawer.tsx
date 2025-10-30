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
  updateRawMilkIntakeForm,
  fetchRawMilkIntakeForms
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
  status: yup.string().oneOf(["Draft", "Pending", "Final"]).required("Status is required"),
  quantity_received: yup.number().required("Quantity is required").min(0.1, "Quantity must be greater than 0"),
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
      status: "Draft",
      quantity_received: undefined, // Remove default 0
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
          status: form.status || "Draft",
          quantity_received: form.quantity_received || undefined, // Update this line
        })
      } else {
        formHook.reset({
          date: new Date().toISOString().split('T')[0],
          drivers_form_id: "",
          destination_silo_name: "",
          operator_id: user?.id || "",
          operator_signature: "",
          status: "Draft",
          quantity_received: undefined, // Update this line
        })
      }
    }
  }, [open, mode, form])

  const handleSubmit = async (data: RawMilkIntakeFormData) => {
    try {
      const normalizedSignature = normalizeDataUrlToBase64(data.operator_signature)

      const formData = {
        operator_id: data.operator_id,
        operator_signature: normalizedSignature,
        date: data.date,
        quantity_received: Number(data.quantity_received),
        drivers_form_id: data.drivers_form_id,
        destination_silo_name: data.destination_silo_name,
        status: data.status,
      }

      console.log('Submitting form data:', formData)

      if (mode === "edit" && form) {
        const result = await dispatch(updateRawMilkIntakeForm({
          ...formData,
          id: form.id
        })).unwrap()
        console.log('Update response:', result)
        toast.success("Form updated successfully")
      } else {
        const result = await dispatch(createRawMilkIntakeForm(formData)).unwrap()
        console.log('Create response:', result)
        toast.success("Form created successfully")
      }

      // Fetch updated forms list
      await dispatch(fetchRawMilkIntakeForms())
      
      onOpenChange(false)
    } catch (error: any) {
      console.error("Form submission error:", error)
      toast.error(error?.message || "Failed to save form")
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
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
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

        {/* Quantity Section */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Quantity Information</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Enter the total quantity of raw milk received</p>
          </div>

          <div className="space-y-2">
            <Label>Quantity Received (L) *</Label>
            <Controller
              name="quantity_received"
              control={formHook.control}
              render={({ field: { onChange, value } }) => (
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter quantity"
                  value={value || ''} // Use empty string when value is undefined
                  onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              )}
            />
            {formHook.formState.errors.quantity_received && (
              <p className="text-sm text-red-500">{formHook.formState.errors.quantity_received.message}</p>
            )}
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
