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
import { 
  Plus, 
  Trash2, 
  Beaker, 
  Package, 
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Droplets,
  TrendingUp
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createStandardizingForm, 
  updateStandardizingForm
} from "@/lib/store/slices/standardizingSlice"
import { 
  fetchBMTControlForms 
} from "@/lib/store/slices/bmtControlFormSlice"
import { StandardizingForm, CreateStandardizingFormRequest, RawMilk, SkimMilk, Cream } from "@/lib/api/standardizing"
import { siloApi } from "@/lib/api/silo"
import { toast } from "sonner"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl, normalizeDataUrlToBase64 } from "@/lib/utils/signature"

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <Droplets className="w-4 h-4 text-green-600" />
        </div>
        <span className="text-sm font-light">Raw Milk Intake</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Beaker className="w-4 h-4 text-orange-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-orange-600">Standardizing</span>
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
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
const rawMilkSchema = yup.object({
  quantity: yup.number().required("Quantity is required").min(0.1, "Quantity must be greater than 0"),
  fat: yup.number().required("Fat content is required").min(0, "Fat content must be 0 or greater"),
  unit_of_measure: yup.string().required("Unit of measure is required"),
  source_silo_id: yup.string().required("Source silo is required"),
})

const skimMilkSchema = yup.object({
  quantity: yup.number().required("Quantity is required").min(0.1, "Quantity must be greater than 0"),
  fat: yup.number().required("Fat content is required").min(0, "Fat content must be 0 or greater"),
  destination_silo_id: yup.string().required("Destination silo is required"),
  bmt_id: yup.string().required("BMT ID is required"),
})

const creamSchema = yup.object({
  quantity: yup.number().required("Quantity is required").min(0.1, "Quantity must be greater than 0"),
  fat: yup.number().required("Fat content is required").min(0, "Fat content must be 0 or greater"),
  destination_silo_id: yup.string().required("Destination silo is required"),
  transfer_start: yup.string().required("Transfer start time is required"),
  transfer_end: yup.string().required("Transfer end time is required"),
})

const standardizingFormSchema = yup.object({
  bmt_id: yup.string().required("BMT ID is required"),
  operator_signature: yup.string().required("Operator signature is required"),
  raw_milk: yup.array(rawMilkSchema).min(1, "At least one raw milk entry is required"),
  skim_milk: yup.array(skimMilkSchema).min(1, "At least one skim milk entry is required"),
  cream: yup.array(creamSchema).min(1, "At least one cream entry is required"),
})

type StandardizingFormData = yup.InferType<typeof standardizingFormSchema>

interface StandardizingFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: StandardizingForm | null
  mode: "create" | "edit"
}

export function StandardizingFormDrawer({ 
  open, 
  onOpenChange, 
  form, 
  mode = "create" 
}: StandardizingFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.standardizing)
  const { forms: bmtForms } = useAppSelector((state) => state.bmtControlForms)

  const [loadingBmtForms, setLoadingBmtForms] = useState(false)
  
  // State for searchable silos
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)

  // Single form for all data
  const formHook = useForm<StandardizingFormData>({
    resolver: yupResolver(standardizingFormSchema),
    defaultValues: {
      bmt_id: "",
      operator_signature: "",
      raw_milk: [
        {
          quantity: 0,
          fat: 0,
          unit_of_measure: "L",
          source_silo_id: "",
        }
      ],
      skim_milk: [
        {
          quantity: 0,
          fat: 0,
          destination_silo_id: "",
          bmt_id: "",
        }
      ],
      cream: [
        {
          quantity: 0,
          fat: 0,
          destination_silo_id: "",
          transfer_start: "",
          transfer_end: "",
        }
      ],
    },
  })
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [signatureViewOpen, setSignatureViewOpen] = useState(false)

  const { fields: rawMilkFields, append: appendRawMilk, remove: removeRawMilk } = useFieldArray({
    control: formHook.control,
    name: "raw_milk",
  })

  const { fields: skimMilkFields, append: appendSkimMilk, remove: removeSkimMilk } = useFieldArray({
    control: formHook.control,
    name: "skim_milk",
  })

  const { fields: creamFields, append: appendCream, remove: removeCream } = useFieldArray({
    control: formHook.control,
    name: "cream",
  })

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingBmtForms(true)
      setLoadingSilos(true)
      
      // Load BMT forms
      if (bmtForms.length === 0) {
        await dispatch(fetchBMTControlForms())
      }
      
      // Load silos
      const silosResponse = await siloApi.getSilos()
      
      const silosData = silosResponse.data?.map(silo => ({
        value: silo.id,
        label: silo.name,
        description: `${silo.location} • ${silo.category} • ${silo.capacity}L capacity`
      })) || []
      setSilos(silosData)
    } catch (error) {
      console.error("Failed to load initial data:", error)
      console.error("Error details:", error)
      toast.error("Failed to load form data")
    } finally {
      setLoadingBmtForms(false)
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
  }, [open, dispatch, bmtForms.length])

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && form) {
        formHook.reset({
          bmt_id: form.bmt_id,
          operator_signature: form.operator_signature,
          raw_milk: form.raw_milk || [
            {
              quantity: 0,
              fat: 0,
              unit_of_measure: "L",
              source_silo_id: "",
            }
          ],
          skim_milk: form.skim_milk || [
            {
              quantity: 0,
              fat: 0,
              destination_silo_id: "",
              bmt_id: "",
            }
          ],
          cream: form.cream || [
            {
              quantity: 0,
              fat: 0,
              destination_silo_id: "",
              transfer_start: "",
              transfer_end: "",
            }
          ],
        })
      } else {
        formHook.reset({
          bmt_id: "",
          operator_signature: "",
          raw_milk: [
            {
              quantity: 0,
              fat: 0,
              unit_of_measure: "L",
              source_silo_id: "",
            }
          ],
          skim_milk: [
            {
              quantity: 0,
              fat: 0,
              destination_silo_id: "",
              bmt_id: "",
            }
          ],
          cream: [
            {
              quantity: 0,
              fat: 0,
              destination_silo_id: "",
              transfer_start: "",
              transfer_end: "",
            }
          ],
        })
      }
    }
  }, [open, mode, form])

  const handleSubmit = async (data: StandardizingFormData) => {
    try {
      const formData: CreateStandardizingFormRequest = {
        id: mode === "edit" && form ? form.id : crypto.randomUUID(),
        ...data,
        operator_signature: normalizeDataUrlToBase64(data.operator_signature),
      }

      if (mode === "edit" && form) {
        await dispatch(updateStandardizingForm({
          id: form.id,
          formData
        })).unwrap()
        toast.success("Form updated successfully")
      } else {
        await dispatch(createStandardizingForm(formData)).unwrap()
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
            <p className="text-sm font-light text-gray-600 mt-2">Enter the basic standardizing form details and operator information</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bmt_id">BMT Form *</Label>
              <Controller
                name="bmt_id"
                control={formHook.control}
                render={({ field }) => (
                  <SearchableSelect
                    options={bmtForms
                      .filter(bmtForm => bmtForm.id) // Filter out forms without ID
                      .map(bmtForm => ({
                        value: bmtForm.id!,
                        label: `#${bmtForm.id!.slice(0, 8)}`,
                        description: `${bmtForm.volume}L • ${bmtForm.product} • ${bmtForm.created_at ? new Date(bmtForm.created_at).toLocaleDateString() : 'No date'}`
                      }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Search and select BMT form"
                    loading={loadingBmtForms}
                  />
                )}
              />
              {formHook.formState.errors.bmt_id && (
                <p className="text-sm text-red-500">{formHook.formState.errors.bmt_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="operator_signature">Operator Signature *</Label>
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

        {/* Raw Milk Section */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Raw Milk</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Enter the raw milk details and source silo information</p>
          </div>
          
          <div className="space-y-4">
            {rawMilkFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-orange-500">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Raw Milk {index + 1}
                      </div>
                      <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>
                    {rawMilkFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRawMilk(index)}
                        className="rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`quantity_${index}`}>Quantity *</Label>
                      <Controller
                        name={`raw_milk.${index}.quantity`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`quantity_${index}`}
                            type="number"
                            step="0.1"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.raw_milk?.[index]?.quantity && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.raw_milk[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`fat_${index}`}>Fat Content (%) *</Label>
                      <Controller
                        name={`raw_milk.${index}.fat`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`fat_${index}`}
                            type="number"
                            step="0.1"
                            placeholder="Enter fat content"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.raw_milk?.[index]?.fat && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.raw_milk[index]?.fat?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`unit_of_measure_${index}`}>Unit of Measure *</Label>
                      <Controller
                        name={`raw_milk.${index}.unit_of_measure`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border border-gray-300 hover:border-gray-400 focus:border-orange-500 shadow-none hover:shadow-none focus:shadow-none rounded-full">
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
                      {formHook.formState.errors.raw_milk?.[index]?.unit_of_measure && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.raw_milk[index]?.unit_of_measure?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`source_silo_id_${index}`}>Source Silo *</Label>
                      <Controller
                        name={`raw_milk.${index}.source_silo_id`}
                        control={formHook.control}
                        render={({ field }) => (
                          <SearchableSelect
                            options={silos}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select source silo"
                            searchPlaceholder="Search silos..."
                            emptyMessage="No silos found"
                            loading={loadingSilos}
                            onSearch={handleSiloSearch}
                          />
                        )}
                      />
                      {formHook.formState.errors.raw_milk?.[index]?.source_silo_id && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.raw_milk[index]?.source_silo_id?.message}
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
                onClick={() => appendRawMilk({
                  quantity: 0,
                  fat: 0,
                  unit_of_measure: "L",
                  source_silo_id: "",
                })}
                className="rounded-full px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Raw Milk Entry
              </Button>
            </div>
          </div>
        </div>

        {/* Skim Milk Section */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Skim Milk</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Enter the skim milk details and destination silo information</p>
          </div>
          
          <div className="space-y-4">
            {skimMilkFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Skim Milk {index + 1}
                      </div>
                      <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>
                    {skimMilkFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSkimMilk(index)}
                        className="rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`quantity_${index}`}>Quantity *</Label>
                      <Controller
                        name={`skim_milk.${index}.quantity`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`quantity_${index}`}
                            type="number"
                            step="0.1"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.skim_milk?.[index]?.quantity && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.skim_milk[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`fat_${index}`}>Fat Content (%) *</Label>
                      <Controller
                        name={`skim_milk.${index}.fat`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`fat_${index}`}
                            type="number"
                            step="0.1"
                            placeholder="Enter fat content"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.skim_milk?.[index]?.fat && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.skim_milk[index]?.fat?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`destination_silo_id_${index}`}>Destination Silo *</Label>
                      <Controller
                        name={`skim_milk.${index}.destination_silo_id`}
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
                      {formHook.formState.errors.skim_milk?.[index]?.destination_silo_id && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.skim_milk[index]?.destination_silo_id?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`bmt_id_${index}`}>BMT ID *</Label>
                      <Controller
                        name={`skim_milk.${index}.bmt_id`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`bmt_id_${index}`}
                            placeholder="Enter BMT ID"
                            {...field}
                          />
                        )}
                      />
                      {formHook.formState.errors.skim_milk?.[index]?.bmt_id && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.skim_milk[index]?.bmt_id?.message}
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
                onClick={() => appendSkimMilk({
                  quantity: 0,
                  fat: 0,
                  destination_silo_id: "",
                  bmt_id: "",
                })}
                className="rounded-full px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Skim Milk Entry
              </Button>
            </div>
          </div>
        </div>

        {/* Cream Section */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-gray-900">Cream</h3>
            <p className="text-sm font-light text-gray-600 mt-2">Enter the cream details and transfer timing information</p>
          </div>
          
          <div className="space-y-4">
            {creamFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-yellow-500">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Cream {index + 1}
                      </div>
                      <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>
                    {creamFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCream(index)}
                        className="rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`quantity_${index}`}>Quantity *</Label>
                      <Controller
                        name={`cream.${index}.quantity`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`quantity_${index}`}
                            type="number"
                            step="0.1"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.cream?.[index]?.quantity && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.cream[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`fat_${index}`}>Fat Content (%) *</Label>
                      <Controller
                        name={`cream.${index}.fat`}
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id={`fat_${index}`}
                            type="number"
                            step="0.1"
                            placeholder="Enter fat content"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {formHook.formState.errors.cream?.[index]?.fat && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.cream[index]?.fat?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`destination_silo_id_${index}`}>Destination Silo *</Label>
                      <Controller
                        name={`cream.${index}.destination_silo_id`}
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
                      {formHook.formState.errors.cream?.[index]?.destination_silo_id && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.cream[index]?.destination_silo_id?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Controller
                        name={`cream.${index}.transfer_start`}
                        control={formHook.control}
                        render={({ field }) => (
                          <DatePicker
                            label="Transfer Start *"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select transfer start date and time"
                            showTime={true}
                            error={!!formHook.formState.errors.cream?.[index]?.transfer_start}
                          />
                        )}
                      />
                      {formHook.formState.errors.cream?.[index]?.transfer_start && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.cream[index]?.transfer_start?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Controller
                        name={`cream.${index}.transfer_end`}
                        control={formHook.control}
                        render={({ field }) => (
                          <DatePicker
                            label="Transfer End *"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select transfer end date and time"
                            showTime={true}
                            error={!!formHook.formState.errors.cream?.[index]?.transfer_end}
                          />
                        )}
                      />
                      {formHook.formState.errors.cream?.[index]?.transfer_end && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.cream[index]?.transfer_end?.message}
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
                onClick={() => appendCream({
                  quantity: 0,
                  fat: 0,
                  destination_silo_id: "",
                  transfer_start: "",
                  transfer_end: "",
                })}
                className="rounded-full px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Cream Entry
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
            {mode === "edit" ? "Edit Standardizing Form" : "Create Standardizing Form"}
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Enter all standardizing form details including raw milk, skim milk, and cream information
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
