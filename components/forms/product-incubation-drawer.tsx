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
  createProductIncubationAction, 
  updateProductIncubationAction,
  fetchProductIncubations
} from "@/lib/store/slices/productIncubationSlice"
import { usersApi } from "@/lib/api/users"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import { ProductIncubation } from "@/lib/api/data-capture-forms"
import { ChevronLeft, ChevronRight, ArrowRight, TestTube, FileText, Package } from "lucide-react"

interface ProductIncubationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incubation?: ProductIncubation | null
  mode?: "create" | "edit"
  processId?: string
}

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
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
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <TestTube className="w-4 h-4 text-purple-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-purple-600">Incubation</span>
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <TestTube className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Test</span>
      </div>
    </div>
  </div>
)

// Form Schema
const incubationSchema = yup.object({
  approved_by: yup.string().required("Approved by is required"),
  product_description: yup.string().required("Product description is required"),
  mnf: yup.string().required("Manufacturing date is required"),
  bb: yup.string().required("Best before date is required"),
  bn: yup.number().required("Batch number is required").min(1, "Must be positive"),
  incubation_days: yup.number().required("Incubation days is required").min(1, "Must be positive"),
  date_in: yup.string().required("Date in is required"),
  expected_date_out: yup.string().required("Expected date out is required"),
  actual_date_out: yup.string().required("Actual date out is required"),
})

type IncubationFormData = yup.InferType<typeof incubationSchema>

export function ProductIncubationDrawer({ 
  open, 
  onOpenChange, 
  incubation, 
  mode = "create",
  processId
}: ProductIncubationDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.productIncubations)
  
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Form
  const form = useForm<IncubationFormData>({
    resolver: yupResolver(incubationSchema),
    defaultValues: {
      approved_by: "",
      product_description: "",
      mnf: "",
      bb: "",
      bn: 0,
      incubation_days: 0,
      date_in: "",
      expected_date_out: "",
      actual_date_out: "",
    },
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

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && incubation) {
        form.reset({
          approved_by: incubation.approved_by || "",
          product_description: incubation.product_description || "",
          mnf: incubation.mnf || "",
          bb: incubation.bb || "",
          bn: incubation.bn || 0,
          incubation_days: incubation.incubation_days || 0,
          date_in: incubation.date_in || "",
          expected_date_out: incubation.expected_date_out || "",
          actual_date_out: incubation.actual_date_out || "",
        })
      } else {
        form.reset({
          approved_by: "",
          product_description: processId || "",
          mnf: "",
          bb: "",
          bn: 0,
          incubation_days: 0,
          date_in: "",
          expected_date_out: "",
          actual_date_out: "",
        })
      }
    }
  }, [open, mode, incubation, form, processId])

  const handleSubmit = async (data: IncubationFormData) => {
    try {
      if (mode === "edit" && incubation) {
        await dispatch(updateProductIncubationAction({
          ...incubation,
          ...data,
        })).unwrap()
        toast.success("Product Incubation updated successfully")
      } else {
        await dispatch(createProductIncubationAction(data)).unwrap()
        toast.success("Product Incubation created successfully")
      }

      // Refresh the incubations list
      setTimeout(() => {
        dispatch(fetchProductIncubations())
      }, 1000)

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error || "Failed to save product incubation")
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>
            {mode === "edit" ? "Edit Product Incubation" : "Create Product Incubation"}
          </SheetTitle>
          <SheetDescription>
            {mode === "edit" ? "Update product incubation information" : "Enter product incubation details and process information"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          <ProcessOverview />
          
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-light text-gray-900">Incubation Information</h3>
                <p className="text-sm font-light text-gray-600 mt-2">Enter the product incubation details and process information</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bn">Batch Number *</Label>
                  <Controller
                    name="bn"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="bn"
                        type="number"
                        placeholder="Enter batch number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  {form.formState.errors.bn && (
                    <p className="text-sm text-red-500">{form.formState.errors.bn.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="mnf"
                    control={form.control}
                    render={({ field }) => (
                      <DatePicker
                        label="Manufacturing Date (MNF) *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select manufacturing date"
                        error={!!form.formState.errors.mnf}
                      />
                    )}
                  />
                  {form.formState.errors.mnf && (
                    <p className="text-sm text-red-500">{form.formState.errors.mnf.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Controller
                    name="bb"
                    control={form.control}
                    render={({ field }) => (
                      <DatePicker
                        label="Best Before (BB) *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select best before date"
                        error={!!form.formState.errors.bb}
                      />
                    )}
                  />
                  {form.formState.errors.bb && (
                    <p className="text-sm text-red-500">{form.formState.errors.bb.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incubation_days">Incubation Days *</Label>
                  <Controller
                    name="incubation_days"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="incubation_days"
                        type="number"
                        placeholder="Enter incubation days"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  {form.formState.errors.incubation_days && (
                    <p className="text-sm text-red-500">{form.formState.errors.incubation_days.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approved_by">Approved By (Role) *</Label>
                  <Controller
                    name="approved_by"
                    control={form.control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={roles.map(role => ({
                          value: role.id,
                          label: role.role_name,
                          description: `${role.views?.length || 0} views • ${role.user_operations?.length || 0} user operations`
                        }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        onSearch={handleRoleSearch}
                        placeholder="Search and select role"
                        searchPlaceholder="Search roles..."
                        emptyMessage="No roles found"
                        loading={loadingRoles}
                      />
                    )}
                  />
                  {form.formState.errors.approved_by && (
                    <p className="text-sm text-red-500">{form.formState.errors.approved_by.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="date_in"
                    control={form.control}
                    render={({ field }) => (
                      <DatePicker
                        label="Date In *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select date in"
                        error={!!form.formState.errors.date_in}
                      />
                    )}
                  />
                  {form.formState.errors.date_in && (
                    <p className="text-sm text-red-500">{form.formState.errors.date_in.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Controller
                    name="expected_date_out"
                    control={form.control}
                    render={({ field }) => (
                      <DatePicker
                        label="Expected Date Out *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select expected date out"
                        error={!!form.formState.errors.expected_date_out}
                      />
                    )}
                  />
                  {form.formState.errors.expected_date_out && (
                    <p className="text-sm text-red-500">{form.formState.errors.expected_date_out.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Controller
                    name="actual_date_out"
                    control={form.control}
                    render={({ field }) => (
                      <DatePicker
                        label="Actual Date Out *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select actual date out"
                        error={!!form.formState.errors.actual_date_out}
                      />
                    )}
                  />
                  {form.formState.errors.actual_date_out && (
                    <p className="text-sm text-red-500">{form.formState.errors.actual_date_out.message}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end p-6 pt-0 border-t bg-white">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2"
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              disabled={operationLoading.create || operationLoading.update}
              className="flex items-center gap-2"
            >
              {mode === "edit" ? "Update Incubation" : "Create Incubation"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
