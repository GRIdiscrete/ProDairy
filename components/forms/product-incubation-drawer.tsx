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
import { fetchProductionPlans } from "@/lib/store/slices/productionPlanSlice"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"

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

// New API schema (top-level production plan + batch item)
const incubationSchema = yup.object({
  production_plan_id: yup.string().required("Production plan is required"),
  status: yup.string().required("Status is required"),
  batch_number: yup.number().required("Batch number is required").min(1),
  basket: yup.string().nullable(),
  time_in: yup.string().nullable(),
  expected_time_out: yup.string().nullable(),
  actual_time_out: yup.string().nullable(),
  manufacture_date: yup.string().nullable(),
  best_before_date: yup.string().nullable(),
  days: yup.number().nullable(),
  event: yup.string().nullable(),
  defects: yup.string().nullable(),
  scientist_id: yup.string().nullable(),
  approver_id: yup.string().nullable(),
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

  const productionPlans = useAppSelector((s: any) => s.productionPlan?.productionPlans || [])
  const productionPlanLoading = useAppSelector((s: any) => s.productionPlan?.operationLoading || {})
  const usersList = useAppSelector((s: any) => s.users?.items || [])
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Form
  const form = useForm<IncubationFormData>({
    resolver: yupResolver(incubationSchema),
    defaultValues: {
      production_plan_id: processId || "",
      status: "In Progress",
      batch_number: undefined,
      basket: "",
      time_in: "",
      expected_time_out: "",
      actual_time_out: "",
      manufacture_date: "",
      best_before_date: "",
      days: undefined,
      event: "",
      defects: "",
      scientist_id: "",
      approver_id: "",
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
        // Load production plans (ensure list available for selector)
        await dispatch(fetchProductionPlans())
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
        // Prefer new API shape (incubation.batch). Fall back to legacy incubation_tracking_form_batch (array/object).
        const batch = (incubation as any).batch
          ?? (Array.isArray((incubation as any).incubation_tracking_form_batch)
            ? ((incubation as any).incubation_tracking_form_batch[0] || {})
            : ((incubation as any).incubation_tracking_form_batch || {}))

        // extract short "HH:mm" for time pickers
        form.reset({
          production_plan_id: incubation.production_plan_id || processId || "",
          status: incubation.status || "In Progress",
          batch_number: batch?.batch_number ?? undefined,
          basket: batch?.basket || "",
          time_in: extractTime(batch?.time_in),
          expected_time_out: extractTime(batch?.expected_time_out),
          actual_time_out: extractTime(batch?.actual_time_out),
          manufacture_date: batch?.manufacture_date || "",
          best_before_date: batch?.best_before_date || "",
          days: batch?.days ?? undefined,
          event: batch?.event || "",
          defects: batch?.defects || "",
          scientist_id: batch?.scientist_id || "",
          approver_id: batch?.approver_id || "",
        })
      } else {
        form.reset({
          production_plan_id: processId || "",
          status: "In Progress",
          batch_number: undefined,
          basket: "",
          time_in: "",
          expected_time_out: "",
          actual_time_out: "",
          manufacture_date: "",
          best_before_date: "",
          days: undefined,
          event: "",
          defects: "",
          scientist_id: "",
          approver_id: "",
        })
      }
    }
  }, [open, mode, incubation, form, processId])

  const handleSubmit = async (data: IncubationFormData) => {
    try {
      // Build payload for new API
      const payload: any = {
        production_plan_id: data.production_plan_id,
        status: data.status,
        incubation_tracking_form_batch: {
          batch_number: data.batch_number,
          basket: data.basket,
          // normalize HH:mm -> HH:mm:ss to match API expectation
          time_in: normalizeTimeForSubmit(data.time_in),
          expected_time_out: normalizeTimeForSubmit(data.expected_time_out),
          actual_time_out: normalizeTimeForSubmit(data.actual_time_out),
          manufacture_date: data.manufacture_date,
          best_before_date: data.best_before_date,
          days: data.days,
          event: data.event,
          defects: data.defects,
          scientist_id: data.scientist_id,
          approver_id: data.approver_id,
        }
      }

      if (mode === "edit" && incubation?.id) {
        console.log("Updating product incubation:", incubation.batch.id)
        await dispatch(updateProductIncubationAction({
          ...payload,
          id: incubation.id,
          incubation_tracking_form_batch: {...payload.incubation_tracking_form_batch, id: incubation.batch.id, },
          
        })).unwrap()
        toast.success("Product Incubation updated successfully")
      } else {
        await dispatch(createProductIncubationAction(payload)).unwrap()
        toast.success("Product Incubation created successfully")
      }

      // Refresh list immediately
      await dispatch(fetchProductIncubations()).unwrap()
      onOpenChange(false)
    } catch (err: any) {
      // Normalize error into a safe string to avoid passing objects to React as children
      let msg = "Failed to save product incubation"

      if (typeof err === "string") {
        msg = err
      } else if (err?.message) {
        msg = err.message
      } else if (err?.data) {
        // err.data might be an object with message/detail or other structure
        if (typeof err.data === "string") {
          msg = err.data
        } else if (err.data.message) {
          msg = err.data.message
        } else if (err.data.detail) {
          msg = err.data.detail
        } else {
          try {
            msg = JSON.stringify(err.data)
          } catch {
            /* leave default */
          }
        }
      } else if (err?.error) {
        if (typeof err.error === "string") {
          msg = err.error
        } else if (err.error.message) {
          msg = err.error.message
        } else {
          try {
            msg = String(err.error)
          } catch { /* leave default */ }
        }
      } else {
        try {
          const s = JSON.stringify(err)
          if (s && s !== "{}") msg = s
        } catch { /* leave default */ }
      }

      // ensure toast receives a string
      toast.error(String(msg))
      console.error("Product incubation save error:", err)
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
      <SheetContent className="tablet-sheet-full p-0 bg-white">
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
                  <Label htmlFor="production_plan_id">Production Plan *</Label>
                  <Controller
                    name="production_plan_id"
                    control={form.control}
                    render={({ field }) => (
                      <div className="w-full">
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full rounded-full border-gray-200 h-10 px-3">
                            <SelectValue placeholder="Select production plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {productionPlans.length === 0 ? (
                              <SelectItem value="">{productionPlanLoading.fetch ? "Loading..." : "No plans available"}</SelectItem>
                            ) : productionPlans.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.tag || p.name || p.id.slice(0, 8)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  {form.formState.errors.production_plan_id && (
                    <p className="text-sm text-red-500">{form.formState.errors.production_plan_id.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batch_number">Batch Number *</Label>
                    <Controller
                      name="batch_number"
                      control={form.control}
                      render={({ field }) => (
                        <Input id="batch_number" type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basket">Basket</Label>
                    <Controller name="basket" control={form.control} render={({ field }) => <Input id="basket" {...field} />} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Time In</Label>
                    <Controller
                      name="time_in"
                      control={form.control}
                      render={({ field }) => (
                        <ShadcnTimePicker value={field.value || ""} onChange={field.onChange} className="w-full" />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expected Time Out</Label>
                    <Controller
                      name="expected_time_out"
                      control={form.control}
                      render={({ field }) => (
                        <ShadcnTimePicker value={field.value || ""} onChange={field.onChange} className="w-full" />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Actual Time Out</Label>
                    <Controller
                      name="actual_time_out"
                      control={form.control}
                      render={({ field }) => (
                        <ShadcnTimePicker value={field.value || ""} onChange={field.onChange} className="w-full" />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Controller
                      name="manufacture_date"
                      control={form.control}
                      render={({ field }) => (
                        <DatePicker
                          label="Manufacture Date"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select manufacture date"
                          error={!!form.formState.errors.manufacture_date}
                        />
                      )}
                    />
                    {form.formState.errors.manufacture_date && (
                      <p className="text-sm text-red-500">{form.formState.errors.manufacture_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Controller
                      name="best_before_date"
                      control={form.control}
                      render={({ field }) => (
                        <DatePicker
                          label="Best Before Date"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select best before date"
                          error={!!form.formState.errors.best_before_date}
                          toDate={new Date(2099, 11, 31)} // Allow dates up to year 2099
                        />
                      )}
                    />
                    {form.formState.errors.best_before_date && (
                      <p className="text-sm text-red-500">{form.formState.errors.best_before_date.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="days">Days</Label>
                    <Controller
                      name="days"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="days"
                          type="number"
                          placeholder="Enter number of days"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      )}
                    />
                    {form.formState.errors.days && (
                      <p className="text-sm text-red-500">{form.formState.errors.days.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Controller
                      name="status"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger className="rounded-full border-gray-200 h-10 px-3">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.status && (
                      <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event">Event</Label>
                  <Controller
                    name="event"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="event"
                        placeholder="Enter event details"
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defects">Defects</Label>
                  <Controller
                    name="defects"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="defects"
                        placeholder="Enter defect details"
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scientist_id">Scientist</Label>
                    <Controller
                      name="scientist_id"
                      control={form.control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={users.map(user => ({
                            value: user.id,
                            label: `${user.first_name} ${user.last_name}`,
                            description: user.email
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          onSearch={handleUserSearch}
                          placeholder="Search and select scientist"
                          searchPlaceholder="Search scientists..."
                          emptyMessage="No scientists found"
                          loading={loadingUsers}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approver_id">Approver</Label>
                    <Controller
                      name="approver_id"
                      control={form.control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={users.map(user => ({
                            value: user.id,
                            label: `${user.first_name} ${user.last_name}`,
                            description: user.email
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          onSearch={handleUserSearch}
                          placeholder="Search and select approver"
                          searchPlaceholder="Search users..."
                          emptyMessage="No users found"
                          loading={loadingUsers}
                        />
                      )}
                    />
                  </div>
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

// Helpers for time handling:
const extractTime = (value: string | undefined | null) => {
  if (!value) return ""
  // backend time like "HH:mm:ss" -> return "HH:mm"
  const hhmmMatch = value.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/)
  if (hhmmMatch) return hhmmMatch[1]
  // backend datetime "YYYY-MM-DDTHH:mm:ss..." or "YYYY-MM-DD HH:mm:ss..."
  if (value.includes("T")) {
    const t = value.split("T")[1] || ""
    return t.substring(0, 5)
  }
  if (value.includes(" ") && /\d{4}-\d{2}-\d{2}/.test(value)) {
    const timePart = value.split(" ")[1] || ""
    return timePart.substring(0, 5)
  }
  return ""
}

const normalizeTimeForSubmit = (val: string | undefined | null) => {
  if (!val) return null
  // if already includes seconds, assume fine
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(val)) return val
  // if HH:mm produce HH:mm:ss
  const hhmm = val.match(/^(\d{1,2}:\d{2})$/)
  if (hhmm) return `${hhmm[1]}:00`
  return val
}
