"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  createUHTQualityCheckAction,
  updateUHTQualityCheckAction,
  createUHTQualityCheckDetailsAction,
  updateUHTQualityCheckDetailsAction,
  fetchUHTQualityChecks
} from "@/lib/store/slices/uhtQualityCheckSlice"
import { usersApi } from "@/lib/api/users"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import { UHTQualityCheckAfterIncubation, UHTQualityCheckAfterIncubationDetails } from "@/lib/api/data-capture-forms"
import { ChevronLeft, ChevronRight, ArrowRight, TestTube, FileText, Package, Beaker } from "lucide-react"

interface UHTQualityCheckDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qualityCheck?: UHTQualityCheckAfterIncubation | null
  mode?: "create" | "edit"
  processId?: string
}

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6  from-green-50 to-emerald-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-sm font-light">Palletizer</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Beaker className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-sm font-light">Incubation</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <TestTube className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-green-600">Test</span>
          <div className=" bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Step 1: Quality Check Form Schema
const qualityCheckSchema = yup.object({
  date_of_production: yup.string().required("Date of production is required"),
  date_analysed: yup.string().required("Date analysed is required"),
  batch_number: yup.string()
    .required("Batch number is required")
    .matches(/^\d+-\d+$/, "Batch number must be a range (e.g., 1-15, 1-25)"),
  product: yup.string().required("Product is required"),
  checked_by: yup.string().required("Checked by is required"),
  ph_0_days: yup.number()
    .transform((value, originalValue) => originalValue === "" ? undefined : value)
    .required("pH 0 days is required"),
})

// Step 2: Quality Check Details Form Schema
const qualityCheckDetailsSchema = yup.object({
  time: yup.string(),
  ph_30_degrees: yup.number()
    .transform((value, originalValue) => originalValue === "" ? undefined : value),
  ph_55_degrees: yup.number()
    .transform((value, originalValue) => originalValue === "" ? undefined : value),
  defects: yup.string(),
  // event: yup.string().required("Event is required"),
  analyst: yup.string(),
  verified_by: yup.string(),
})

type QualityCheckFormData = yup.InferType<typeof qualityCheckSchema>
type QualityCheckDetailsFormData = yup.InferType<typeof qualityCheckDetailsSchema>

export function UHTQualityCheckDrawer({
  open,
  onOpenChange,
  qualityCheck,
  mode = "create",
  processId
}: UHTQualityCheckDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.uhtQualityChecks)

  const [currentStep, setCurrentStep] = useState(1)
  const [createdQualityCheck, setCreatedQualityCheck] = useState<UHTQualityCheckAfterIncubation | null>(null)
  const [step1Data, setStep1Data] = useState<QualityCheckFormData | null>(null) // store step1 until final submit
  const [incubationDetailsList, setIncubationDetailsList] = useState<QualityCheckDetailsFormData[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Quality check form
  const qualityCheckForm = useForm<QualityCheckFormData>({
    resolver: yupResolver(qualityCheckSchema),
    defaultValues: {
      date_of_production: "",
      date_analysed: "",
      batch_number: "",
      product: "",
      checked_by: "",
      ph_0_days: "" as any,
    },
  })

  // Quality check details form
  const qualityCheckDetailsForm = useForm<QualityCheckDetailsFormData>({
    resolver: yupResolver(qualityCheckDetailsSchema),
    defaultValues: {
      time: "",
      ph_30_degrees: "" as any,
      ph_55_degrees: "" as any,
      defects: "",
      // event: "",
      analyst: "",
      verified_by: "",
    },
    mode: "onChange"
  })

  // Load users and roles on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingUsers(true)
      setLoadingRoles(true)
      try {
        // Load users
        const usersResponse = await usersApi.getUsers()
        setUsers(usersResponse.data || [])

        // Load roles
        const rolesResponse = await rolesApi.getRoles()
        setRoles(rolesResponse.data || [])
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load form data")
      } finally {
        setLoadingUsers(false)
        setLoadingRoles(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  // Reset forms when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && qualityCheck) {
        // populate step1 with qualityCheck top-level fields
        qualityCheckForm.reset({
          date_of_production: qualityCheck.date_of_production || "",
          date_analysed: qualityCheck.date_analysed || "",
          batch_number: qualityCheck.batch_number || "",
          product: typeof qualityCheck.product === 'object' ? qualityCheck.product.id : (qualityCheck.product || ""),
          checked_by: qualityCheck.checked_by || "",
          ph_0_days: qualityCheck.ph_0_days ?? "" as any,
        })

        // Load existing incubation_details array from API response
        const detailsArray = (qualityCheck as any).uht_quality_check_after_incubation_details || []
        if (detailsArray.length > 0) {
          // Map the array to our form data format
          const mappedDetails = detailsArray.map((detail: any) => ({
            time: detail.time || "",
            ph_30_degrees: detail.ph_30_degrees ?? "" as any,
            ph_55_degrees: detail.ph_55_degrees ?? "" as any,
            defects: detail.defects || "",
            analyst: detail.analyst || "",
            verified_by: detail.verified_by || "",
            id: detail.id // Keep track of existing IDs for updates
          }))
          setIncubationDetailsList(mappedDetails)
          // Reset form to empty for adding new ones
          qualityCheckDetailsForm.reset({
            time: "",
            ph_30_degrees: "" as any,
            ph_55_degrees: "" as any,
            defects: "",
            analyst: "",
            verified_by: "",
          })
        } else {
          setIncubationDetailsList([])
          qualityCheckDetailsForm.reset({
            time: "",
            ph_30_degrees: "" as any,
            ph_55_degrees: "" as any,
            defects: "",
            analyst: "",
            verified_by: "",
          })
        }
        
        setStep1Data({
          date_of_production: qualityCheck.date_of_production || "",
          date_analysed: qualityCheck.date_analysed || "",
          batch_number: qualityCheck.batch_number || "",
          product: typeof qualityCheck.product === 'object' ? qualityCheck.product.id : (qualityCheck.product || ""),
          checked_by: qualityCheck.checked_by || "",
          ph_0_days: qualityCheck.ph_0_days ?? 0,
        })
        setCreatedQualityCheck(qualityCheck)
        setCurrentStep(1)
      } else {
        // Reset both forms to clean defaults for create
        qualityCheckForm.reset({
          date_of_production: "",
          date_analysed: "",
          batch_number: "",
          product: processId || "",
          checked_by: "",
          ph_0_days: "" as any,
        })
        qualityCheckDetailsForm.reset({
          time: "",
          ph_30_degrees: "" as any,
          ph_55_degrees: "" as any,
          defects: "",
          // event: "",
          analyst: "",
          verified_by: "",
        })
        setStep1Data(null)
        setCreatedQualityCheck(null)
        setIncubationDetailsList([])
        setCurrentStep(1)
      }
    }
  }, [open, mode, qualityCheck, qualityCheckForm, qualityCheckDetailsForm, processId])

  // When user clicks Next on step 1, validate and store step1 data locally (no API call)
  const handleQualityCheckSubmit = async (data: QualityCheckFormData) => {
    try {
      // persist step1 data locally
      setStep1Data({
        ...data,
        product: processId || data.product,
      })
      setCurrentStep(2)
    } catch (error: any) {
      toast.error(error || "Failed to validate quality check")
    }
  }

  // Final submit: combine step1 + step2 into single object and dispatch create/update
  const handleQualityCheckDetailsSubmit = async (data: QualityCheckDetailsFormData) => {
    const s1 = step1Data ?? qualityCheckForm.getValues()
    if (!s1) {
      toast.error("Please complete the quality check information first")
      setCurrentStep(1)
      return
    }

    // Add current form data to the list
    const allDetails = [...incubationDetailsList, data]

    const payload = {
      date_of_production: s1.date_of_production,
      date_analysed: s1.date_analysed,
      batch_number: s1.batch_number,
      product: processId || s1.product,
      checked_by: s1.checked_by,
      ph_0_days: s1.ph_0_days,
      incubation_details: allDetails.map(detail => {
        const mappedDetail: any = {
          time: detail.time?.trim() || null,
          ph_30_degrees: null,
          ph_55_degrees: null,
          defects: null,
          analyst: null,
          verified_by: null,
        }

        // Handle ph_30_degrees
        if (detail.ph_30_degrees !== "" && detail.ph_30_degrees !== undefined && detail.ph_30_degrees !== null) {
          mappedDetail.ph_30_degrees = detail.ph_30_degrees
        }

        // Handle ph_55_degrees
        if (detail.ph_55_degrees !== "" && detail.ph_55_degrees !== undefined && detail.ph_55_degrees !== null) {
          mappedDetail.ph_55_degrees = detail.ph_55_degrees
        }

        // Handle defects
        const trimmedDefects = detail.defects?.trim()
        if (trimmedDefects) {
          mappedDetail.defects = trimmedDefects
        }

        // Handle analyst
        const trimmedAnalyst = detail.analyst?.trim()
        if (trimmedAnalyst) {
          mappedDetail.analyst = trimmedAnalyst
        }

        // Handle verified_by
        const trimmedVerifiedBy = detail.verified_by?.trim()
        if (trimmedVerifiedBy) {
          mappedDetail.verified_by = trimmedVerifiedBy
        }

        // Add id if exists
        if ((detail as any).id) {
          mappedDetail.id = (detail as any).id
        }

        return mappedDetail
      }),
    }

    console.log("Payload to send:", JSON.stringify(payload, null, 2))

    try {
      if (mode === "edit" && qualityCheck) {
        // include id for update
        console.log("Updating Quality Check with details:", payload.incubation_details)
        await dispatch(updateUHTQualityCheckAction({
          ...payload,
          id: qualityCheck.id,
        } as any)).unwrap()
        toast.success("Quality Check updated successfully")
      } else {
        const result = await dispatch(createUHTQualityCheckAction(payload as any)).unwrap()
        toast.success("Quality Check created successfully")
        setCreatedQualityCheck(result)
      }

      // Refresh list & close
      setTimeout(() => {
        dispatch(fetchUHTQualityChecks())
      }, 500)

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to save quality check")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleNext = () => {
    if (currentStep === 1) {
      qualityCheckForm.handleSubmit(handleQualityCheckSubmit)()
    }
  }

  const handleUserSearch = async (query: string) => {
    if (!query.trim()) return []

    try {
      const usersResponse = await usersApi.getUsers({
        filters: { search: query }
      })
      return (usersResponse.data || [])
        .map(user => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name}`.trim() || user.email,
          description: `${user.department} • ${user.email}`
        }))
    } catch (error) {
      console.error("Failed to search users:", error)
      return []
    }
  }

  const handleRoleSearch = async (query: string) => {
    if (!query.trim()) return []

    try {
      const rolesResponse = await rolesApi.getRoles({
        filters: { search: query }
      })
      return (rolesResponse.data || [])
        .map(role => ({
          value: role.id,
          label: role.role_name,
          description: `${role.views?.length || 0} views • ${role.user_operations?.length || 0} user operations`
        }))
    } catch (error) {
      console.error("Failed to search roles:", error)
      return []
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />

      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Quality Check Information</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the basic quality check details and analysis information</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Controller
              name="date_of_production"
              control={qualityCheckForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Date of Production *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select production date"
                  error={!!qualityCheckForm.formState.errors.date_of_production}
                />
              )}
            />
            {qualityCheckForm.formState.errors.date_of_production && (
              <p className="text-sm text-red-500">{qualityCheckForm.formState.errors.date_of_production.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Controller
              name="date_analysed"
              control={qualityCheckForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Date Analysed *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select analysis date"
                  error={!!qualityCheckForm.formState.errors.date_analysed}
                />
              )}
            />
            {qualityCheckForm.formState.errors.date_analysed && (
              <p className="text-sm text-red-500">{qualityCheckForm.formState.errors.date_analysed.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batch_number">Batch Number Range *</Label>
            <Controller
              name="batch_number"
              control={qualityCheckForm.control}
              render={({ field }) => (
                <Input
                  id="batch_number"
                  placeholder="Enter range (e.g., 1-15, 1-25)"
                  {...field}
                />
              )}
            />
            {qualityCheckForm.formState.errors.batch_number && (
              <p className="text-sm text-red-500">{qualityCheckForm.formState.errors.batch_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ph_0_days">pH 0 Days *</Label>
            <Controller
              name="ph_0_days"
              control={qualityCheckForm.control}
              render={({ field }) => (
                <Input
                  id="ph_0_days"
                  type="number"
                  step="0.1"
                  placeholder="Enter pH value"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                />
              )}
            />
            {qualityCheckForm.formState.errors.ph_0_days && (
              <p className="text-sm text-red-500">{qualityCheckForm.formState.errors.ph_0_days.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="checked_by">Checked By (User) *</Label>
          <Controller
            name="checked_by"
            control={qualityCheckForm.control}
            render={({ field }) => (
              <SearchableSelect
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                  description: `${user.department} • ${user.email}`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleUserSearch}
                placeholder="Search and select user"
                searchPlaceholder="Search users..."
                emptyMessage="No users found"
                loading={loadingUsers}
              />
            )}
          />
          {qualityCheckForm.formState.errors.checked_by && (
            <p className="text-sm text-red-500">{qualityCheckForm.formState.errors.checked_by.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />

      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Test Details</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the specific test details and analysis results</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time">Time (from batch range)</Label>
            <Controller
              name="time"
              control={qualityCheckDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="time"
                  placeholder="Enter time from batch range"
                  {...field}
                />
              )}
            />
            {qualityCheckDetailsForm.formState.errors.time && (
              <p className="text-sm text-red-500">{qualityCheckDetailsForm.formState.errors.time.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ph_30_degrees">pH 30°C</Label>
            <Controller
              name="ph_30_degrees"
              control={qualityCheckDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="ph_30_degrees"
                  type="number"
                  step="0.1"
                  placeholder="Enter pH value"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                />
              )}
            />
            {qualityCheckDetailsForm.formState.errors.ph_30_degrees && (
              <p className="text-sm text-red-500">{qualityCheckDetailsForm.formState.errors.ph_30_degrees.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ph_55_degrees">pH 55°C</Label>
            <Controller
              name="ph_55_degrees"
              control={qualityCheckDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="ph_55_degrees"
                  type="number"
                  step="0.1"
                  placeholder="Enter pH value"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                />
              )}
            />
            {qualityCheckDetailsForm.formState.errors.ph_55_degrees && (
              <p className="text-sm text-red-500">{qualityCheckDetailsForm.formState.errors.ph_55_degrees.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="analyst">Analyst</Label>
            <Controller
              name="analyst"
              control={qualityCheckDetailsForm.control}
              render={({ field }) => (
                <SearchableSelect
                  options={users.map(user => ({
                    value: user.id,
                    label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                    description: `${user.department} • ${user.email}`
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearch={handleUserSearch}
                  placeholder="Search and select analyst"
                  searchPlaceholder="Search users..."
                  emptyMessage="No users found"
                  loading={loadingUsers}
                />
              )}
            />
            {qualityCheckDetailsForm.formState.errors.analyst && (
              <p className="text-sm text-red-500">{qualityCheckDetailsForm.formState.errors.analyst.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defects">Defects</Label>
          <Controller
            name="defects"
            control={qualityCheckDetailsForm.control}
            render={({ field }) => (
              <Textarea
                id="defects"
                placeholder="Describe any defects observed"
                {...field}
              />
            )}
          />
          {qualityCheckDetailsForm.formState.errors.defects && (
            <p className="text-sm text-red-500">{qualityCheckDetailsForm.formState.errors.defects.message}</p>
          )}
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="event">Event *</Label>
          <Controller
            name="event"
            control={qualityCheckDetailsForm.control}
            render={({ field }) => (
              <Textarea
                id="event"
                placeholder="Describe any events that occurred"
                {...field}
              />
            )}
          />
          {qualityCheckDetailsForm.formState.errors.event && (
            <p className="text-sm text-red-500">{qualityCheckDetailsForm.formState.errors.event.message}</p>
          )}
        </div> */}

        <div className="space-y-2">
          <Label htmlFor="verified_by">Verified By</Label>
          <Controller
            name="verified_by"
            control={qualityCheckDetailsForm.control}
            render={({ field }) => (
              <SearchableSelect
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                  description: `${user.department} • ${user.email}`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleUserSearch}
                placeholder="Search and select verifier"
                searchPlaceholder="Search users..."
                emptyMessage="No users found"
                loading={loadingUsers}
              />
            )}
          />
          {qualityCheckDetailsForm.formState.errors.verified_by && (
            <p className="text-sm text-red-500">{qualityCheckDetailsForm.formState.errors.verified_by.message}</p>
          )}
        </div>

        {incubationDetailsList.length > 0 && (
          <div className="space-y-2 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">Added Incubation Details</Label>
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                {incubationDetailsList.length} {incubationDetailsList.length === 1 ? 'Detail' : 'Details'}
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {incubationDetailsList.map((detail, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                          #{index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          Time: {detail.time || 'Not specified'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>pH 30°C: <span className="font-medium">{detail.ph_30_degrees || 'N/A'}</span></div>
                        <div>pH 55°C: <span className="font-medium">{detail.ph_55_degrees || 'N/A'}</span></div>
                      </div>
                      {detail.defects && (
                        <div className="text-xs text-gray-600 mt-1">
                          Defects: <span className="font-medium">{detail.defects}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Load this detail into the form for editing
                          qualityCheckDetailsForm.reset(detail)
                          // Remove from list temporarily
                          const newList = incubationDetailsList.filter((_, i) => i !== index)
                          setIncubationDetailsList(newList)
                          toast.info("Detail loaded for editing")
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          const newList = incubationDetailsList.filter((_, i) => i !== index)
                          setIncubationDetailsList(newList)
                          toast.success("Detail removed")
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <Button
            type="button"
            
            className="flex-1"
            onClick={() => {
              const formData = qualityCheckDetailsForm.getValues()
              if (!formData.time) {
                toast.error("Please enter a time value before adding")
                return
              }
              setIncubationDetailsList([...incubationDetailsList, formData])
              qualityCheckDetailsForm.reset({
                time: "",
                ph_30_degrees: "" as any,
                ph_55_degrees: "" as any,
                defects: "",
                analyst: "",
                verified_by: "",
              })
              toast.success("Incubation detail added")
            }}
          >
            + Add Another Incubation Detail
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>
            {mode === "edit" ? "Edit Incubation Test" : "Create Incubation Test"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1
              ? "Quality Check Information: Enter basic quality check details and analysis information"
              : "Test Details: Enter specific test details and analysis results"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white" key={`form-${open}-${currentStep}`}>
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t bg-white">
          <Button
            
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentStep === 1 ? "Quality Check Information" : "Test Details"} • Step {currentStep} of 2
            </span>
          </div>

          {currentStep === 1 ? (
            <Button
              onClick={handleNext}
              disabled={operationLoading?.create}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={qualityCheckDetailsForm.handleSubmit(handleQualityCheckDetailsSubmit)}
              disabled={operationLoading?.create || operationLoading?.update}
            >
              {mode === "edit" ? "Update Quality Check" : "Create Quality Check"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
