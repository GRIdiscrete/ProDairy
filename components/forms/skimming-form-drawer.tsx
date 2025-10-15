import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
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
  createSkimmingForm,
  updateSkimmingForm
} from "@/lib/store/slices/skimmingSlice"
import { fetchSkimmingForms } from "@/lib/store/slices/skimmingSlice"
import {
  fetchBMTControlForms
} from "@/lib/store/slices/bmtControlFormSlice"
import { SkimmingForm, CreateSkimmingFormRequest } from "@/lib/api/skimming-form"
import { siloApi } from "@/lib/api/silo"
import { toast } from "sonner"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
import { base64ToPngDataUrl, normalizeDataUrlToBase64 } from "@/lib/utils/signature"
import { fetchRawMilkIntakeForms } from "@/lib/store/slices/rawMilkIntakeSlice"
const ProcessOverview = () => (
  <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
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
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-purple-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-purple-600">Skimming</span>
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-sm font-light text-blue-600">Skim Milk</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
          <Package className="w-4 h-4 text-yellow-600" />
        </div>
        <span className="text-sm font-light text-yellow-600">Cream</span>
      </div>
    </div>
  </div>
)

// Form Schema
const rawMilkSchema = yup.object({
  quantity: yup.number().required("Quantity is required").min(0.1, "Quantity must be greater than 0"),
  fat: yup.number().required("Fat content is required").min(0, "Fat content must be 0 or greater"),
  source_silo_id: yup.string().required("Source silo is required"),
  unit_of_measure: yup.string().required("Unit of measure is required"),
  raw_milk_form_id: yup.string().optional(), // moved inside raw_milk
})

const skimMilkSchema = yup.object({
  quantity: yup.number().required("Quantity is required").min(0.1, "Quantity must be greater than 0"),
  fat: yup.number().required("Fat content is required").min(0, "Fat content must be 0 or greater"),
  destination_silo_id: yup.string().required("Destination silo is required"),
  filmatic_form_id: yup.string().optional(),
})

const creamSchema = yup.object({
  quantity: yup.number().required("Quantity is required").min(0.1, "Quantity must be greater than 0"),
  fat: yup.number().required("Fat content is required").min(0, "Fat content must be 0 or greater"),
})

// add raw_milk_form_id at top-level (optional)
const skimmingFormSchema = yup.object({
  bmt_id: yup.string().required("BMT ID is required"),
  operator_signature: yup.string().required("Operator signature is required"),
  raw_milk: rawMilkSchema.required("Raw milk details are required"),
  skim_milk: skimMilkSchema.required("Skim milk details are required"),
  cream: creamSchema.required("Cream details are required"),
})

type SkimmingFormData = yup.InferType<typeof skimmingFormSchema>

interface SkimmingFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: SkimmingForm | null
  mode: "create" | "edit"
}

export function SkimmingFormDrawer({
  open,
  onOpenChange,
  form,
  mode = "create"
}: SkimmingFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.skimming)
  const { forms: bmtForms } = useAppSelector((state) => state.bmtControlForms)
  const authState = useAppSelector((state) => state.auth)
  const { user, profile, isAuthenticated } = authState || { user: null, profile: null, isAuthenticated: false }

  const [loadingBmtForms, setLoadingBmtForms] = useState(false)

  // State for searchable selects
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)

  // raw milk intake forms for selector (loaded on open)
  const [rawMilkForms, setRawMilkForms] = useState<SearchableSelectOption[]>([])
  const [loadingRawMilkForms, setLoadingRawMilkForms] = useState(false)
  // read raw milk intake slice from store
  const { forms: rawIntakeForms, loading: rawIntakeLoading, isInitialized: rawIntakeInitialized } = useAppSelector((s: any) => s.rawMilkIntake || { forms: [], loading: false, isInitialized: false })

  // Form setup
  const formHook = useForm<SkimmingFormData>({
    resolver: yupResolver(skimmingFormSchema),
    defaultValues: {
      bmt_id: "",
      operator_signature: "",
      raw_milk: {
        quantity: 0,
        fat: 0,
        source_silo_id: "",
        unit_of_measure: "liters",
        raw_milk_form_id: "", // moved into raw_milk default
      },
      skim_milk: {
        quantity: 0,
        fat: 0,
        destination_silo_id: "",
        filmatic_form_id: "",
      },
      cream: {
        quantity: 0,
        fat: 0,
      },
    },
  })

  const [signatureOpen, setSignatureOpen] = useState(false)
  const [signatureViewOpen, setSignatureViewOpen] = useState(false)

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingBmtForms(true)
      setLoadingSilos(true)
      setLoadingRawMilkForms(true)

      // Load BMT forms
      if (bmtForms.length === 0) {
        await dispatch(fetchBMTControlForms())
      }

      // Ensure raw milk intake forms are loaded in the store and sync to local options.
      if (!rawIntakeInitialized || (Array.isArray(rawIntakeForms) && rawIntakeForms.length === 0)) {
        await dispatch(fetchRawMilkIntakeForms())
      }
      // mapping to options will be handled by the effect below

      // Load silos
      const silosResponse = await siloApi.getSilos()
      const silosData = silosResponse.data?.map(silo => ({
        value: silo.id,
        label: `${silo.name} (${silo.location})`,
        description: `${silo.location} • ${silo.category} • ${silo.capacity}L capacity`
      })) || []
      setSilos(silosData)
    } catch (error) {
      console.error("Failed to load initial data:", error)
      toast.error("Failed to load form data")
    } finally {
      setLoadingBmtForms(false)
      setLoadingSilos(false)
      setLoadingRawMilkForms(false)
    }
  }

  // Sync rawIntakeForms from store into local SearchableSelect options
  useEffect(() => {
    if (Array.isArray(rawIntakeForms)) {
      setRawMilkForms(rawIntakeForms.map((f: any) => ({
        value: f.id,
        label: f.tag || f.id,
        description: f.created_at ? new Date(f.created_at).toLocaleDateString() : "",
      })))
    }
  }, [rawIntakeForms])

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
          // prefer nested raw_milk_form_id (if backend stores it under raw_milk), fallback to top-level
          raw_milk: form.standardizing_form_raw_milk?.[0] ? {
            quantity: form.standardizing_form_raw_milk[0].quantity,
            fat: form.standardizing_form_raw_milk[0].fat,
            source_silo_id: form.standardizing_form_raw_milk[0].source_silo_id,
            unit_of_measure: form.standardizing_form_raw_milk[0].unit_of_measure,
            raw_milk_form_id: (form.standardizing_form_raw_milk?.[0] as any)?.raw_milk_form_id ?? (form as any).raw_milk_form_id ?? "",
          } : {
            quantity: 0,
            fat: 0,
            source_silo_id: "",
            unit_of_measure: "liters",
            raw_milk_form_id: "",
          },
          skim_milk: form.standardizing_form_skim_milk?.[0] ? {
            quantity: form.standardizing_form_skim_milk[0].quantity,
            fat: form.standardizing_form_skim_milk[0].fat,
            destination_silo_id: form.standardizing_form_skim_milk[0].destination_silo_id,
            filmatic_form_id: (form.standardizing_form_skim_milk?.[0] as any)?.filmatic_form_id ?? "",
          } : {
            quantity: 0,
            fat: 0,
            destination_silo_id: "",
            filmatic_form_id: "",
          },
          cream: form.standardizing_form_cream?.[0] ? {
            quantity: form.standardizing_form_cream[0].quantity,
            fat: form.standardizing_form_cream[0].fat,
          } : {
            quantity: 0,
            fat: 0,
          },
        })
      } else {
        formHook.reset({
          bmt_id: "",
          operator_signature: "",
          raw_milk: {
            quantity: 0,
            fat: 0,
            source_silo_id: "",
            unit_of_measure: "liters",
            raw_milk_form_id: "",
          },
          skim_milk: {
            quantity: 0,
            fat: 0,
            destination_silo_id: "",
            filmatic_form_id: "",
          },
          cream: {
            quantity: 0,
            fat: 0,
          },
        })
      }
    }
  }, [open, mode, form])

  const handleSubmit = async (data: SkimmingFormData) => {
    // Check if user is authenticated and has an ID
    if (!isAuthenticated || !user?.id) {
      toast.error("You must be logged in to submit this form")
      return
    }

    try {
      const formData: CreateSkimmingFormRequest = {
        operator_id: user.id, // Use actual user ID from auth state
        operator_signature: normalizeDataUrlToBase64(data.operator_signature),
        bmt_id: data.bmt_id,
        raw_milk: {
          ...data.raw_milk,
          unit_of_measure: data.raw_milk.unit_of_measure ?? "liters",
          // include relation to selected raw milk intake form if provided (nested under raw_milk)
          ...(data.raw_milk as any).raw_milk_form_id ? { raw_milk_form_id: (data.raw_milk as any).raw_milk_form_id } : {},
        },
        skim_milk: {
          quantity: data.skim_milk.quantity,
          fat: data.skim_milk.fat,
          destination_silo_id: data.skim_milk.destination_silo_id,
          ...(data.skim_milk as any).filmatic_form_id ? { filmatic_form_id: (data.skim_milk as any).filmatic_form_id } : {},
        },
        cream: {
          quantity: data.cream.quantity,
          fat: data.cream.fat,
        },
      }

      if (mode === "edit" && form) {
        // include id for update if backend expects it
        const updatePayload = { id: form.id, ...formData }
        await dispatch(updateSkimmingForm(updatePayload as any)).unwrap()
        // refresh skimming list after update
        await dispatch(fetchSkimmingForms()).unwrap()
        toast.success("Skimming form updated successfully")
      } else {
        await dispatch(createSkimmingForm(formData)).unwrap()
        // refresh skimming list after create
        await dispatch(fetchSkimmingForms()).unwrap()
        toast.success("Skimming form created successfully")
      }

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to save skimming form")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* make SheetContent a column flex so we can keep header fixed and allow the body to scroll */}
      <SheetContent className="tablet-sheet-full p-0 bg-white flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create Skimming Form" : "Edit Skimming Form"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Create a new skimming form with raw milk, skim milk, and cream details"
              : "Edit the selected skimming form"
            }
          </SheetDescription>
        </SheetHeader>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="space-y-6 p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-light text-gray-900 mb-2">Authentication Required</h3>
                <p className="text-sm font-light text-gray-600">
                  You must be logged in to create or edit skimming forms.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={formHook.handleSubmit(handleSubmit)} className="space-y-6 p-6">
              <ProcessOverview />

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-light text-gray-900">Basic Information</h3>
                  <p className="text-sm font-light text-gray-600 mt-2">Enter the basic skimming form details</p>
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
                            .filter(bmtForm => bmtForm.id)
                            .map(bmtForm => ({
                              value: bmtForm.id!,
                              label: bmtForm?.tag ?? 'N/A',
                              description: `${bmtForm.volume ?? 0}L • ${bmtForm.product} • ${bmtForm.created_at ? new Date(bmtForm.created_at).toLocaleDateString() : 'No date'}`
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
                  <h3 className="text-xl font-light text-gray-900">Raw Milk Input</h3>
                  <p className="text-sm font-light text-gray-600 mt-2">Enter the raw milk source information</p>
                </div>

                <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-green-500 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="raw_milk_quantity">Quantity *</Label>
                      <Controller
                        name="raw_milk.quantity"
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id="raw_milk_quantity"
                            type="number"
                            step="0.1"
                            placeholder="Enter quantity"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        )}
                      />
                      {formHook.formState.errors.raw_milk?.quantity && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.raw_milk.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="raw_milk_fat">Fat Content (%) *</Label>
                      <Controller
                        name="raw_milk.fat"
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id="raw_milk_fat"
                            type="number"
                            step="0.1"
                            placeholder="Enter fat content"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        )}
                      />
                      {formHook.formState.errors.raw_milk?.fat && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.raw_milk.fat?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="source_silo">Source Silo *</Label>
                      <Controller
                        name="raw_milk.source_silo_id"
                        control={formHook.control}
                        render={({ field }) => (
                          <SearchableSelect
                            options={silos}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select source silo"
                            loading={loadingSilos}
                          />
                        )}
                      />
                      {formHook.formState.errors.raw_milk?.source_silo_id && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.raw_milk.source_silo_id?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="raw_milk_form_id">Raw Milk Intake Form (optional)</Label>
                      <Controller
                        name="raw_milk.raw_milk_form_id"
                        control={formHook.control}
                        render={({ field }) => (
                          <SearchableSelect
                            options={rawMilkForms}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select raw milk intake form (optional)"
                            loading={loadingRawMilkForms}
                            onSearch={async (term) => {
                              // simple client-side filter; replace with server search if needed
                              if (!term) return
                              setRawMilkForms(prev => prev.filter(r => r.label.toLowerCase().includes(term.toLowerCase()) || (r.description || "").toLowerCase().includes(term.toLowerCase())))
                            }}
                          />
                        )}
                      />
                      {formHook.formState.errors.raw_milk_form_id && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.raw_milk_form_id?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skim Milk Section */}
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-light text-gray-900">Skim Milk Output</h3>
                  <p className="text-sm font-light text-gray-600 mt-2">Enter the skim milk production details</p>
                </div>

                <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="skim_quantity">Quantity *</Label>
                      <Controller
                        name="skim_milk.quantity"
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id="skim_quantity"
                            type="number"
                            step="0.1"
                            placeholder="Enter quantity"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        )}
                      />
                      {formHook.formState.errors.skim_milk?.quantity && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.skim_milk.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skim_fat">Fat Content (%) *</Label>
                      <Controller
                        name="skim_milk.fat"
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id="skim_fat"
                            type="number"
                            step="0.1"
                            placeholder="Enter fat content"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        )}
                      />
                      {formHook.formState.errors.skim_milk?.fat && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.skim_milk.fat?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skim_destination">Destination Silo *</Label>
                      <Controller
                        name="skim_milk.destination_silo_id"
                        control={formHook.control}
                        render={({ field }) => (
                          <SearchableSelect
                            options={silos}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select destination silo"
                            loading={loadingSilos}
                          />
                        )}
                      />
                      {formHook.formState.errors.skim_milk?.destination_silo_id && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.skim_milk.destination_silo_id?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filmatic_form_id">Filmatic Form ID</Label>
                      <Controller
                        name="skim_milk.filmatic_form_id"
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id="filmatic_form_id"
                            type="text"
                            placeholder="Enter Filmatic form ID (optional)"
                            {...field}
                          />
                        )}
                      />
                      {formHook.formState.errors.skim_milk?.filmatic_form_id && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.skim_milk.filmatic_form_id?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cream Section */}
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-light text-gray-900">Cream Output</h3>
                  <p className="text-sm font-light text-gray-600 mt-2">Enter the cream production details</p>
                </div>

                <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-yellow-500 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cream_quantity">Quantity *</Label>
                      <Controller
                        name="cream.quantity"
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id="cream_quantity"
                            type="number"
                            step="0.1"
                            placeholder="Enter quantity"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        )}
                      />
                      {formHook.formState.errors.cream?.quantity && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.cream.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cream_fat">Fat Content (%) *</Label>
                      <Controller
                        name="cream.fat"
                        control={formHook.control}
                        render={({ field }) => (
                          <Input
                            id="cream_fat"
                            type="number"
                            step="0.1"
                            placeholder="Enter fat content"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        )}
                      />
                      {formHook.formState.errors.cream?.fat && (
                        <p className="text-sm text-red-500">
                          {formHook.formState.errors.cream.fat?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={operationLoading.create || operationLoading.update}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {mode === "create" ? "Create Skimming Form" : "Update Skimming Form"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* keep modals outside the scrollable container */}
      </SheetContent>
      <SignatureModal
        open={signatureOpen}
        onOpenChange={setSignatureOpen}
        onSave={(signature) => {
          formHook.setValue("operator_signature", signature)
          setSignatureOpen(false)
        }}
      />

      {signatureViewOpen && formHook.watch("operator_signature") && (
        <SignatureViewer
          open={signatureViewOpen}
          onOpenChange={setSignatureViewOpen}
          signature={formHook.watch("operator_signature")}
        />
      )}
    </Sheet>
  )
}
