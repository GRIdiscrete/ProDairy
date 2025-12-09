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
  updateStandardizingForm,
  fetchStandardizingForms
} from "@/lib/store/slices/standardizingSlice"
import { 
  fetchBMTControlForms 
} from "@/lib/store/slices/bmtControlFormSlice"
import { StandardizingForm } from "@/lib/api/standardizing-form"
import { siloApi } from "@/lib/api/silo"
import { toast } from "sonner"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl, normalizeDataUrlToBase64 } from "@/lib/utils/signature"
import { generateBMTFormId } from "@/lib/utils/form-id-generator"

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6  from-orange-50 to-red-50 rounded-lg">
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
          <div className="  to-red-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
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

// Combined Form Schema for Standardizing Form
const standardizingFormSchema = yup.object({
  bmt_id: yup.string().required("BMT ID is required"),
  operator_signature: yup.string().required("Operator signature is required"),
  skim: yup.object({
    quantity: yup.number().required("Quantity is required").min(0.1, "Quantity must be greater than 0"),
    resulting_fat: yup.number().required("Resulting fat content is required").min(0, "Fat content must be 0 or greater"),
  }).required("Skim milk details are required"),
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
  const authState = useAppSelector((state) => state.auth)
  const { user, profile, isAuthenticated } = authState || { user: null, profile: null, isAuthenticated: false }

  const [loadingBmtForms, setLoadingBmtForms] = useState(false)
  
  // Single form for the standardizing form
  const formHook = useForm<StandardizingFormData>({
    resolver: yupResolver(standardizingFormSchema),
    defaultValues: {
      bmt_id: "",
      operator_signature: "",
      skim: {
        quantity: undefined,
        resulting_fat: undefined,
      },
    },
  })
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [signatureViewOpen, setSignatureViewOpen] = useState(false)

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingBmtForms(true)
      
      // Load BMT forms
      if (bmtForms.length === 0) {
        await dispatch(fetchBMTControlForms())
      }
    } catch (error) {
      console.error("Failed to load initial data:", error)
      console.error("Error details:", error)
      toast.error("Failed to load form data")
    } finally {
      setLoadingBmtForms(false)
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
          skim: {
            quantity: (form as any).standardizing_form_no_skim_skim_milk?.[0]?.quantity || 0,
            resulting_fat: (form as any).standardizing_form_no_skim_skim_milk?.[0]?.resulting_fat || 0,
          },
        })
      } else {
        formHook.reset({
          bmt_id: "",
          operator_signature: "",
          skim: {
            quantity: undefined,
            resulting_fat: undefined,
          },
        })
      }
    }
  }, [open, mode, form])

  const handleSubmit = async (data: StandardizingFormData) => {
    // Check if user is authenticated and has an ID
    if (!isAuthenticated || !user?.id) {
      toast.error("You must be logged in to submit this form")
      return
    }

    try {
      const formData: any = {
        id: mode === "edit" && form ? form.id : crypto.randomUUID(),
        operator_id: user.id, // Use actual user ID from auth state
        
        ...data,
        skim:{
          quantity: data.skim?.quantity,
          resulting_fat: data.skim?.resulting_fat,
          id:form?.skim_milk
        },
        operator_signature: normalizeDataUrlToBase64(data.operator_signature),
      }

      if (mode === "edit" && form) {
        await dispatch(updateStandardizingForm(formData)).unwrap()
        // refresh list after successful update
        await dispatch(fetchStandardizingForms()).unwrap()
        toast.success("Form updated successfully")
      } else {
        await dispatch(createStandardizingForm(formData)).unwrap()
        // refresh list after successful create
        await dispatch(fetchStandardizingForms()).unwrap()
        toast.success("Form created successfully")
      }

      onOpenChange(false)
    } catch (error: any) {
      const msg = typeof error === "string" ? error : (error?.message ?? "Failed to save form")
      toast.error(msg)
    }
  }

  const onInvalid = (errors: any) => {
    const errorMessages = Object.values(errors).map((err: any) => err.message).filter(Boolean)
    toast.error(`Please check the following fields: ${errorMessages.join(', ')}`, {
      style: { background: '#ef4444', color: 'white' }
    })
  }

  const renderForm = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      return (
        <div className="space-y-6 p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-light text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-sm font-light text-gray-600">
              You must be logged in to create or edit standardizing forms.
            </p>
          </div>
        </div>
      )
    }

    return (
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
                          label: bmtForm?.tag,
                          description: `${bmtForm.volume ?? 0}L • ${bmtForm.product} • ${bmtForm.created_at ? new Date(bmtForm.created_at).toLocaleDateString() : 'No date'}`
                        }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearch={(searchTerm) => {
                        // Check if user pasted an actual BMT ID (UUID format)
                        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                        if (uuidRegex.test(searchTerm)) {
                          // Find the BMT form with this actual ID
                          const foundForm = bmtForms.find(form => form.id === searchTerm)
                          if (foundForm) {
                            field.onChange(foundForm.id)
                            return
                          }
                        }
                        
                        // Check if user pasted a partial ID (first 8 chars)
                        if (searchTerm.length >= 8 && searchTerm.match(/^[0-9a-f-]+$/i)) {
                          const foundForm = bmtForms.find(form => form.id?.startsWith(searchTerm.replace(/-/g, '')))
                          if (foundForm) {
                            field.onChange(foundForm.id)
                            return
                          }
                        }
                      }}
                      placeholder="Search BMT forms or paste BMT ID"
                      searchPlaceholder="Search by generated ID or paste actual BMT ID..."
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
                        <Button type="button"  size="sm" className="rounded-full" onClick={() => setSignatureOpen(true)}>
                          Add Signature
                        </Button>
                        {field.value && (
                          <Button type="button"  size="sm" className="rounded-full" onClick={() => setSignatureViewOpen(true)}>
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

          {/* Skim Milk Section */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-gray-900">Skim Milk Details</h3>
              <p className="text-sm font-light text-gray-600 mt-2">Enter the skim milk quantity and resulting fat content</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4] p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skim.quantity">Quantity (L) *</Label>
                  <Controller
                    name="skim.quantity"
                    control={formHook.control}
                    render={({ field }) => (
                      <Input
                        id="skim.quantity"
                        type="number"
                        step="0.1"
                        placeholder="Enter quantity"
                        value={field.value === undefined ? "" : field.value.toString()}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || value === "-") {
                            field.onChange(undefined)
                          } else {
                            const numValue = parseFloat(value)
                            field.onChange(isNaN(numValue) ? undefined : numValue)
                          }
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    )}
                  />
                  {formHook.formState.errors.skim?.quantity && (
                    <p className="text-sm text-red-500">
                      {formHook.formState.errors.skim.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skim.resulting_fat">Resulting Fat Content (%) *</Label>
                  <Controller
                    name="skim.resulting_fat"
                    control={formHook.control}
                    render={({ field }) => (
                      <Input
                        id="skim.resulting_fat"
                        type="number"
                        step="0.1"
                        placeholder="Enter resulting fat content"
                        value={field.value === undefined ? "" : field.value.toString()}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || value === "-") {
                            field.onChange(undefined)
                          } else {
                            const numValue = parseFloat(value)
                            field.onChange(isNaN(numValue) ? undefined : numValue)
                          }
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    )}
                  />
                  {formHook.formState.errors.skim?.resulting_fat && (
                    <p className="text-sm text-red-500">
                      {formHook.formState.errors.skim.resulting_fat?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-lg font-light">
            {mode === "edit" ? "Edit Standardizing Form" : "Create Standardizing Form"}
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Enter the standardizing form details including BMT form, operator signature, and skim milk information
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={formHook.handleSubmit(handleSubmit, onInvalid)}>
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
