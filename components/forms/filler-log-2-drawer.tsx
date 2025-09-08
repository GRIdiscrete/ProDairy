"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useAppDispatch } from "@/lib/store"
import {
  createFillerLog2Action,
  updateFillerLog2Action,
  fetchFillerLog2s
} from "@/lib/store/slices/fillerLog2Slice"
import { usersApi } from "@/lib/api/users"
import { machineApi } from "@/lib/api/machine"
import { toast } from "sonner"
import { FillerLog2 } from "@/lib/api/data-capture-forms"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface FillerLog2DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process: FillerLog2 | null
  mode: "create" | "edit"
}

// Form Schema
const schema = yup.object({
  date: yup.string().required("Date is required"),
  sku: yup.string().required("SKU is required"),
  machine_id: yup.string().required("Machine is required"),
  shift: yup.string().required("Shift is required"),
  packages_counter: yup.number().required("Packages counter is required").min(0, "Must be a positive number"),
  product_counter: yup.number().required("Product counter is required").min(0, "Must be a positive number"),
  filler_waste: yup.number().required("Filler waste is required").min(0, "Must be a positive number"),
  operator_id: yup.string().required("Operator is required"),
  operator_id_signature: yup.string().required("Operator signature is required"),
  flat_packs: yup.number().required("Flat packs is required").min(0, "Must be a positive number"),
  shift_handling_waste: yup.string().required("Shift handling waste is required"),
  inline_damages: yup.string().required("Inline damages is required"),
  counted_waste: yup.string().required("Counted waste is required"),
  supervisor_id: yup.string().required("Supervisor is required"),
  supervisor_id_signature: yup.string().required("Supervisor signature is required"),
  shift_comment: yup.string().required("Shift comment is required"),
  shift_technician_id: yup.string().required("Shift technician is required"),
  shift_technician_id_signature: yup.string().required("Shift technician signature is required"),
})

type FormData = yup.InferType<typeof schema>

export function FillerLog2Drawer({ 
  open, 
  onOpenChange, 
  process, 
  mode 
}: FillerLog2DrawerProps) {
  const dispatch = useAppDispatch()
  const [currentStep, setCurrentStep] = useState(1)
  const [users, setUsers] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMachines, setLoadingMachines] = useState(false)

  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: "",
      sku: "",
      machine_id: "",
      shift: "",
      packages_counter: 0,
      product_counter: 0,
      filler_waste: 0,
      operator_id: "",
      operator_id_signature: "",
      flat_packs: 0,
      shift_handling_waste: "",
      inline_damages: "",
      counted_waste: "",
      supervisor_id: "",
      supervisor_id_signature: "",
      shift_comment: "",
      shift_technician_id: "",
      shift_technician_id_signature: "",
    },
  })

  // Load users and machines on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingUsers(true)
      setLoadingMachines(true)

      try {
        const [usersResponse, machinesResponse] = await Promise.all([
          usersApi.getUsers(),
          machineApi.getMachines()
        ])

        setUsers(usersResponse.data || [])
        setMachines(machinesResponse.data || [])
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoadingUsers(false)
        setLoadingMachines(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  // Populate form when editing
  useEffect(() => {
    if (open && mode === "edit" && process) {
      form.reset({
        date: process.date || "",
        sku: process.sku || "",
        machine_id: process.machine_id || "",
        shift: process.shift || "",
        packages_counter: process.packages_counter || 0,
        product_counter: process.product_counter || 0,
        filler_waste: process.filler_waste || 0,
        operator_id: process.operator_id || "",
        operator_id_signature: process.operator_id_signature || "",
        flat_packs: process.flat_packs || 0,
        shift_handling_waste: process.shift_handling_waste || "",
        inline_damages: process.inline_damages || "",
        counted_waste: process.counted_waste || "",
        supervisor_id: process.supervisor_id || "",
        supervisor_id_signature: process.supervisor_id_signature || "",
        shift_comment: process.shift_comment || "",
        shift_technician_id: process.shift_technician_id || "",
        shift_technician_id_signature: process.shift_technician_id_signature || "",
      })
      setCurrentStep(1)
    } else if (open && mode === "create") {
      form.reset()
      setCurrentStep(1)
    }
  }, [open, mode, process, form])

  const handleSubmit = async (data: FormData) => {
    try {
      if (mode === "edit" && process) {
        await dispatch(updateFillerLog2Action({
          ...process,
          ...data,
        })).unwrap()
        toast.success("Filler Log 2 updated successfully")
      } else {
        await dispatch(createFillerLog2Action(data)).unwrap()
        toast.success("Filler Log 2 created successfully")
      }

      // Refresh the list
      setTimeout(() => {
        dispatch(fetchFillerLog2s())
      }, 1000)

      onOpenChange(false)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || "Failed to save filler log 2"
      toast.error(errorMessage)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleUserSearch = async (query: string) => {
    if (!query.trim()) return []
    
    try {
      const response = await usersApi.getUsers({ search: query })
      return (response.data || []).map((user: any) => ({
        value: user.id,
        label: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
        user
      }))
    } catch (error) {
      console.error("Failed to search users:", error)
      return []
    }
  }

  const handleMachineSearch = async (query: string) => {
    if (!query.trim()) return []
    
    try {
      const response = await machineApi.getMachines({ search: query })
      return (response.data || []).map((machine: any) => ({
        value: machine.id,
        label: machine.name,
        machine
      }))
    } catch (error) {
      console.error("Failed to search machines:", error)
      return []
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Step 1: Basic Information</h3>
          <p className="text-sm text-gray-600 mt-2">Enter the basic filler log information</p>
        </div>
        
        <div className="space-y-2">
          <Controller
            name="date"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                label="Date *"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select date"
                error={!!form.formState.errors.date}
              />
            )}
          />
          {form.formState.errors.date && (
            <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Controller
              name="sku"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="sku"
                  placeholder="Enter SKU"
                  {...field}
                />
              )}
            />
            {form.formState.errors.sku && (
              <p className="text-sm text-red-500">{form.formState.errors.sku.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Shift *</Label>
            <Controller
              name="shift"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="shift"
                  placeholder="Enter shift (e.g., 08:00-16:00)"
                  {...field}
                />
              )}
            />
            {form.formState.errors.shift && (
              <p className="text-sm text-red-500">{form.formState.errors.shift.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Controller
            name="machine_id"
            control={form.control}
            render={({ field }) => (
              <SearchableSelect
                label="Machine *"
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleMachineSearch}
                placeholder="Search and select machine"
                loading={loadingMachines}
                error={!!form.formState.errors.machine_id}
              />
            )}
          />
          {form.formState.errors.machine_id && (
            <p className="text-sm text-red-500">{form.formState.errors.machine_id.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Step 2: Counters & Waste</h3>
          <p className="text-sm text-gray-600 mt-2">Enter package counters and waste information</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="packages_counter">Packages Counter *</Label>
            <Controller
              name="packages_counter"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="packages_counter"
                  type="number"
                  placeholder="Enter packages counter"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {form.formState.errors.packages_counter && (
              <p className="text-sm text-red-500">{form.formState.errors.packages_counter.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_counter">Product Counter *</Label>
            <Controller
              name="product_counter"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="product_counter"
                  type="number"
                  placeholder="Enter product counter"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {form.formState.errors.product_counter && (
              <p className="text-sm text-red-500">{form.formState.errors.product_counter.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filler_waste">Filler Waste *</Label>
            <Controller
              name="filler_waste"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="filler_waste"
                  type="number"
                  placeholder="Enter filler waste"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {form.formState.errors.filler_waste && (
              <p className="text-sm text-red-500">{form.formState.errors.filler_waste.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="flat_packs">Flat Packs *</Label>
            <Controller
              name="flat_packs"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="flat_packs"
                  type="number"
                  placeholder="Enter flat packs"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {form.formState.errors.flat_packs && (
              <p className="text-sm text-red-500">{form.formState.errors.flat_packs.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift_handling_waste">Shift Handling Waste *</Label>
          <Controller
            name="shift_handling_waste"
            control={form.control}
            render={({ field }) => (
              <Input
                id="shift_handling_waste"
                placeholder="Enter shift handling waste"
                {...field}
              />
            )}
          />
          {form.formState.errors.shift_handling_waste && (
            <p className="text-sm text-red-500">{form.formState.errors.shift_handling_waste.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="inline_damages">Inline Damages *</Label>
          <Controller
            name="inline_damages"
            control={form.control}
            render={({ field }) => (
              <Input
                id="inline_damages"
                placeholder="Enter inline damages"
                {...field}
              />
            )}
          />
          {form.formState.errors.inline_damages && (
            <p className="text-sm text-red-500">{form.formState.errors.inline_damages.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="counted_waste">Counted Waste *</Label>
          <Controller
            name="counted_waste"
            control={form.control}
            render={({ field }) => (
              <Input
                id="counted_waste"
                placeholder="Enter counted waste"
                {...field}
              />
            )}
          />
          {form.formState.errors.counted_waste && (
            <p className="text-sm text-red-500">{form.formState.errors.counted_waste.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Step 3: Personnel & Comments</h3>
          <p className="text-sm text-gray-600 mt-2">Enter personnel information and shift comments</p>
        </div>
        
        <div className="space-y-2">
          <Controller
            name="operator_id"
            control={form.control}
            render={({ field }) => (
              <SearchableSelect
                label="Operator *"
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleUserSearch}
                placeholder="Search and select operator"
                loading={loadingUsers}
                error={!!form.formState.errors.operator_id}
              />
            )}
          />
          {form.formState.errors.operator_id && (
            <p className="text-sm text-red-500">{form.formState.errors.operator_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="operator_id_signature">Operator Signature *</Label>
          <Controller
            name="operator_id_signature"
            control={form.control}
            render={({ field }) => (
              <Input
                id="operator_id_signature"
                placeholder="Enter operator signature"
                {...field}
              />
            )}
          />
          {form.formState.errors.operator_id_signature && (
            <p className="text-sm text-red-500">{form.formState.errors.operator_id_signature.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Controller
            name="supervisor_id"
            control={form.control}
            render={({ field }) => (
              <SearchableSelect
                label="Supervisor *"
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleUserSearch}
                placeholder="Search and select supervisor"
                loading={loadingUsers}
                error={!!form.formState.errors.supervisor_id}
              />
            )}
          />
          {form.formState.errors.supervisor_id && (
            <p className="text-sm text-red-500">{form.formState.errors.supervisor_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supervisor_id_signature">Supervisor Signature *</Label>
          <Controller
            name="supervisor_id_signature"
            control={form.control}
            render={({ field }) => (
              <Input
                id="supervisor_id_signature"
                placeholder="Enter supervisor signature"
                {...field}
              />
            )}
          />
          {form.formState.errors.supervisor_id_signature && (
            <p className="text-sm text-red-500">{form.formState.errors.supervisor_id_signature.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Controller
            name="shift_technician_id"
            control={form.control}
            render={({ field }) => (
              <SearchableSelect
                label="Shift Technician *"
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleUserSearch}
                placeholder="Search and select shift technician"
                loading={loadingUsers}
                error={!!form.formState.errors.shift_technician_id}
              />
            )}
          />
          {form.formState.errors.shift_technician_id && (
            <p className="text-sm text-red-500">{form.formState.errors.shift_technician_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift_technician_id_signature">Shift Technician Signature *</Label>
          <Controller
            name="shift_technician_id_signature"
            control={form.control}
            render={({ field }) => (
              <Input
                id="shift_technician_id_signature"
                placeholder="Enter shift technician signature"
                {...field}
              />
            )}
          />
          {form.formState.errors.shift_technician_id_signature && (
            <p className="text-sm text-red-500">{form.formState.errors.shift_technician_id_signature.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift_comment">Shift Comment *</Label>
          <Controller
            name="shift_comment"
            control={form.control}
            render={({ field }) => (
              <Textarea
                id="shift_comment"
                placeholder="Enter shift comment"
                rows={3}
                {...field}
              />
            )}
          />
          {form.formState.errors.shift_comment && (
            <p className="text-sm text-red-500">{form.formState.errors.shift_comment.message}</p>
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
            {mode === "edit" ? "Edit Filler Log 2" : "Create Filler Log 2"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1 
              ? "Step 1: Enter basic information"
              : currentStep === 2
              ? "Step 2: Enter counters and waste information"
              : "Step 3: Enter personnel and comments"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {currentStep === 1 ? renderStep1() : currentStep === 2 ? renderStep2() : renderStep3()}
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
              Step {currentStep} of 3
            </span>
          </div>

          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              className="flex items-center gap-2"
            >
              {mode === "edit" ? "Update Filler Log 2" : "Create Filler Log 2"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
