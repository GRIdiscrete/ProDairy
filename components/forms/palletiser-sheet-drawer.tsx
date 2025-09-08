"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  createPalletiserSheetAction, 
  updatePalletiserSheetAction,
  fetchPalletiserSheets
} from "@/lib/store/slices/palletiserSheetSlice"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"
import { PalletiserSheet, PalletiserSheetDetails } from "@/lib/api/data-capture-forms"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PalletiserSheetDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheet?: PalletiserSheet | null
  mode?: "create" | "edit"
}

// Step 1: Sheet Form Schema
const sheetSchema = yup.object({
  sheet_date: yup.string().required("Sheet date is required"),
  shift: yup.string().required("Shift is required"),
  operator_id: yup.string().required("Operator is required"),
  palletiser_id: yup.string().required("Palletiser is required"),
  total_pallets: yup.number().required("Total pallets is required").min(0, "Must be positive"),
  efficiency_rate: yup.number().required("Efficiency rate is required").min(0, "Must be positive").max(100, "Cannot exceed 100%"),
  downtime_minutes: yup.number().required("Downtime minutes is required").min(0, "Must be positive"),
  notes: yup.string().optional(),
})

// Step 2: Sheet Details Form Schema
const sheetDetailsSchema = yup.object({
  product_code: yup.string().required("Product code is required"),
  quantity_palletised: yup.number().required("Quantity palletised is required").min(0, "Must be positive"),
  pallet_pattern: yup.string().required("Pallet pattern is required"),
  quality_check: yup.boolean().required("Quality check is required"),
  timestamp: yup.string().required("Timestamp is required"),
})

type SheetFormData = yup.InferType<typeof sheetSchema>
type SheetDetailsFormData = yup.InferType<typeof sheetDetailsSchema>

export function PalletiserSheetDrawer({ 
  open, 
  onOpenChange, 
  sheet, 
  mode = "create" 
}: PalletiserSheetDrawerProps) {
  const dispatch = useAppDispatch()
  const palletiserSheetState = useAppSelector((state) => state.palletiserSheets)
  const { operationLoading } = palletiserSheetState || { 
    operationLoading: { create: false, update: false, delete: false, fetch: false }
  }
  
  const [currentStep, setCurrentStep] = useState(1)
  const [createdSheet, setCreatedSheet] = useState<PalletiserSheet | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Sheet form
  const sheetForm = useForm<SheetFormData>({
    resolver: yupResolver(sheetSchema),
    defaultValues: {
      sheet_date: "",
      shift: "",
      operator_id: "",
      palletiser_id: "",
      total_pallets: 0,
      efficiency_rate: 0,
      downtime_minutes: 0,
      notes: "",
    },
  })

  // Sheet details form
  const sheetDetailsForm = useForm<SheetDetailsFormData>({
    resolver: yupResolver(sheetDetailsSchema),
    defaultValues: {
      product_code: "",
      quantity_palletised: 0,
      pallet_pattern: "",
      quality_check: false,
      timestamp: "",
    },
  })

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true)
      try {
        const usersResponse = await usersApi.getUsers()
        setUsers(usersResponse.data || [])
      } catch (error) {
        console.error("Failed to load users:", error)
        toast.error("Failed to load users")
      } finally {
        setLoadingUsers(false)
      }
    }

    if (open) {
      loadUsers()
    }
  }, [open])

  // Reset forms when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && sheet) {
        sheetForm.reset({
          sheet_date: sheet.sheet_date,
          shift: sheet.shift,
          operator_id: sheet.operator_id,
          palletiser_id: sheet.palletiser_id,
          total_pallets: sheet.total_pallets,
          efficiency_rate: sheet.efficiency_rate,
          downtime_minutes: sheet.downtime_minutes,
          notes: sheet.notes || "",
        })
        setCreatedSheet(sheet)
        setCurrentStep(2) // Skip to details step for edit mode
      } else {
        sheetForm.reset()
        sheetDetailsForm.reset()
        setCreatedSheet(null)
        setCurrentStep(1)
      }
    }
  }, [open, mode, sheet, sheetForm, sheetDetailsForm])

  const handleSheetSubmit = async (data: SheetFormData) => {
    try {
      if (mode === "edit" && sheet) {
        await dispatch(updatePalletiserSheetAction({
          ...sheet,
          ...data,
        })).unwrap()
        toast.success("Sheet updated successfully")
        setCreatedSheet({ ...sheet, ...data })
      } else {
        const result = await dispatch(createPalletiserSheetAction(data)).unwrap()
        toast.success("Sheet created successfully")
        setCreatedSheet(result)
      }
      setCurrentStep(2)
    } catch (error: any) {
      toast.error(error || "Failed to save sheet")
    }
  }

  const handleSheetDetailsSubmit = async (data: SheetDetailsFormData) => {
    if (!createdSheet) {
      toast.error("No sheet found")
      return
    }

    try {
      const sheetDetailsData = {
        ...data,
        palletiser_sheet_id: createdSheet.id!,
      }

      if (mode === "edit" && sheet) {
        // For edit mode, update the existing sheet
        await dispatch(updatePalletiserSheetAction({
          ...sheet,
          ...sheetDetailsData
        })).unwrap()
        toast.success("Sheet updated successfully")
      } else {
        // For create mode, the sheet was already created above
        toast.success("Sheet created successfully")
      }

      // Refresh the sheets list
      setTimeout(() => {
        dispatch(fetchPalletiserSheets())
      }, 1000)

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to save sheet details")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep === 1) {
      sheetForm.handleSubmit(handleSheetSubmit)()
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

  const renderStep1 = () => (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Step 1: Sheet Information</h3>
          <p className="text-sm text-gray-600 mt-2">Enter the basic palletiser sheet details and operator information</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Controller
              name="sheet_date"
              control={sheetForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Sheet Date *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select sheet date"
                  error={!!sheetForm.formState.errors.sheet_date}
                />
              )}
            />
            {sheetForm.formState.errors.sheet_date && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.sheet_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Shift *</Label>
            <Controller
              name="shift"
              control={sheetForm.control}
              render={({ field }) => (
                <Input
                  id="shift"
                  placeholder="Enter shift (e.g., Morning, Afternoon, Night)"
                  {...field}
                />
              )}
            />
            {sheetForm.formState.errors.shift && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.shift.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="operator_id">Operator *</Label>
            <Controller
              name="operator_id"
              control={sheetForm.control}
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
                  placeholder="Search and select operator"
                  loading={loadingUsers}
                />
              )}
            />
            {sheetForm.formState.errors.operator_id && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.operator_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="palletiser_id">Palletiser ID *</Label>
            <Controller
              name="palletiser_id"
              control={sheetForm.control}
              render={({ field }) => (
                <Input
                  id="palletiser_id"
                  placeholder="Enter palletiser ID"
                  {...field}
                />
              )}
            />
            {sheetForm.formState.errors.palletiser_id && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.palletiser_id.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_pallets">Total Pallets *</Label>
            <Controller
              name="total_pallets"
              control={sheetForm.control}
              render={({ field }) => (
                <Input
                  id="total_pallets"
                  type="number"
                  placeholder="Enter total pallets"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {sheetForm.formState.errors.total_pallets && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.total_pallets.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="efficiency_rate">Efficiency Rate (%) *</Label>
            <Controller
              name="efficiency_rate"
              control={sheetForm.control}
              render={({ field }) => (
                <Input
                  id="efficiency_rate"
                  type="number"
                  step="0.1"
                  placeholder="Enter efficiency rate"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {sheetForm.formState.errors.efficiency_rate && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.efficiency_rate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="downtime_minutes">Downtime (Minutes) *</Label>
            <Controller
              name="downtime_minutes"
              control={sheetForm.control}
              render={({ field }) => (
                <Input
                  id="downtime_minutes"
                  type="number"
                  placeholder="Enter downtime minutes"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {sheetForm.formState.errors.downtime_minutes && (
              <p className="text-sm text-red-500">{sheetForm.formState.errors.downtime_minutes.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Controller
            name="notes"
            control={sheetForm.control}
            render={({ field }) => (
              <Input
                id="notes"
                placeholder="Enter any additional notes (optional)"
                {...field}
              />
            )}
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Step 2: Product Details</h3>
          <p className="text-sm text-gray-600 mt-2">Enter the specific product palletisation details and quality information</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product_code">Product Code *</Label>
            <Controller
              name="product_code"
              control={sheetDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="product_code"
                  placeholder="Enter product code"
                  {...field}
                />
              )}
            />
            {sheetDetailsForm.formState.errors.product_code && (
              <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.product_code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity_palletised">Quantity Palletised *</Label>
            <Controller
              name="quantity_palletised"
              control={sheetDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="quantity_palletised"
                  type="number"
                  placeholder="Enter quantity palletised"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {sheetDetailsForm.formState.errors.quantity_palletised && (
              <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.quantity_palletised.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pallet_pattern">Pallet Pattern *</Label>
            <Controller
              name="pallet_pattern"
              control={sheetDetailsForm.control}
              render={({ field }) => (
                <Input
                  id="pallet_pattern"
                  placeholder="Enter pallet pattern"
                  {...field}
                />
              )}
            />
            {sheetDetailsForm.formState.errors.pallet_pattern && (
              <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.pallet_pattern.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Controller
              name="timestamp"
              control={sheetDetailsForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Timestamp *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select timestamp"
                  showTime={true}
                  error={!!sheetDetailsForm.formState.errors.timestamp}
                />
              )}
            />
            {sheetDetailsForm.formState.errors.timestamp && (
              <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.timestamp.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quality_check">Quality Check *</Label>
          <Controller
            name="quality_check"
            control={sheetDetailsForm.control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <input
                  id="quality_check"
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="quality_check" className="text-sm">
                  Product passed quality check
                </Label>
              </div>
            )}
          />
          {sheetDetailsForm.formState.errors.quality_check && (
            <p className="text-sm text-red-500">{sheetDetailsForm.formState.errors.quality_check.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>
            {mode === "edit" ? "Edit Palletiser Sheet" : "Create Palletiser Sheet"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1 
              ? "Step 1: Enter sheet information and operator details"
              : "Step 2: Enter product details and quality information"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of 2
            </span>
          </div>

          {currentStep === 1 ? (
            <Button
              onClick={handleNext}
              disabled={operationLoading.create}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={sheetDetailsForm.handleSubmit(handleSheetDetailsSubmit)}
              disabled={operationLoading.create}
            >
              {mode === "edit" ? "Update Sheet" : "Create Sheet"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}