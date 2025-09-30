"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createCIPControlFormAction, updateCIPControlFormAction, fetchCIPControlForms } from "@/lib/store/slices/cipControlFormSlice"
import { machineApi } from "@/lib/api/machine"
import { usersApi } from "@/lib/api/users"
import { rolesApi } from "@/lib/api/roles"
import { toast } from "sonner"
import type { CIPControlForm } from "@/lib/api/data-capture-forms"

const cipControlFormSchema = yup.object({
  status: yup.string().required("Status is required"),
  machine_id: yup.string().required("Machine is required"),
  operator_id: yup.string().required("Operator is required"),
  date: yup.string().required("Date is required"),
  caustic_solution_strength: yup.number().required("Caustic solution strength is required").min(0, "Must be positive"),
  acid_solution_strength: yup.number().required("Acid solution strength is required").min(0, "Must be positive"),
  rinse_water_test: yup.string().required("Rinse water test result is required"),
  approver: yup.string().required("Approver is required"),
  analyzer: yup.string().required("Analyzer is required"),
  checked_by: yup.string().required("Checked by is required"),
})

type CIPControlFormData = yup.InferType<typeof cipControlFormSchema>

interface CIPControlFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: CIPControlForm | null
  mode: "create" | "edit"
}

export function CIPControlFormDrawer({ open, onOpenChange, form, mode }: CIPControlFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.cipControlForms)

  // State for searchable selects
  const [machines, setMachines] = useState<SearchableSelectOption[]>([])
  const [users, setUsers] = useState<SearchableSelectOption[]>([])
  const [roles, setRoles] = useState<SearchableSelectOption[]>([])
  const [loadingMachines, setLoadingMachines] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingMachines(true)
      setLoadingUsers(true)
      setLoadingRoles(true)
      
      const [machinesResponse, usersResponse, rolesResponse] = await Promise.all([
        machineApi.getMachines(),
        usersApi.getUsers(),
        rolesApi.getRoles()
      ])
      
      setMachines(machinesResponse.data?.map(machine => ({
        value: machine.id,
        label: machine.name,
        description: `${machine.location} • ${machine.category} • ${machine.serial_number}`
      })) || [])
      
      setUsers(usersResponse.data?.map(user => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
        description: `${user.department} • ${user.email}`
      })) || [])
      
      setRoles(rolesResponse.data?.map(role => ({
        value: role.id,
        label: role.role_name,
        description: role.role_operations?.join(', ') || 'No operations'
      })) || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Failed to load form data')
    } finally {
      setLoadingMachines(false)
      setLoadingUsers(false)
      setLoadingRoles(false)
    }
  }

  // Handle machine search
  const handleMachineSearch = async (searchTerm: string) => {
    try {
      setLoadingMachines(true)
      const response = await machineApi.getMachines({
        filters: { search: searchTerm }
      })
      setMachines(response.data?.map(machine => ({
        value: machine.id,
        label: machine.name,
        description: `${machine.location} • ${machine.category} • ${machine.serial_number}`
      })) || [])
    } catch (error) {
      console.error('Error searching machines:', error)
    } finally {
      setLoadingMachines(false)
    }
  }

  // Handle user search
  const handleUserSearch = async (searchTerm: string) => {
    try {
      setLoadingUsers(true)
      const response = await usersApi.getUsers({
        filters: { search: searchTerm }
      })
      setUsers(response.data?.map(user => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
        description: `${user.department} • ${user.email}`
      })) || [])
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Handle role search
  const handleRoleSearch = async (searchTerm: string) => {
    try {
      setLoadingRoles(true)
      const response = await rolesApi.getRoles({
        filters: { search: searchTerm }
      })
      setRoles(response.data?.map(role => ({
        value: role.id,
        label: role.role_name,
        description: role.role_operations?.join(', ') || 'No operations'
      })) || [])
    } catch (error) {
      console.error('Error searching roles:', error)
    } finally {
      setLoadingRoles(false)
    }
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CIPControlFormData>({
    resolver: yupResolver(cipControlFormSchema),
    defaultValues: {
      status: "",
      machine_id: "",
      operator_id: "",
      date: "",
      caustic_solution_strength: 0,
      acid_solution_strength: 0,
      rinse_water_test: "",
      approver: "",
      analyzer: "",
      checked_by: "",
    },
  })

  const onSubmit = async (data: CIPControlFormData) => {
    try {
      console.log('Form data submitted:', data)
      console.log('Form object:', form)
      console.log('Mode:', mode)

      if (mode === "create") {
        await dispatch(createCIPControlFormAction(data)).unwrap()
        toast.success('CIP Control Form created successfully')
        // Refresh the data to get complete relationship information
        setTimeout(() => {
          dispatch(fetchCIPControlForms())
        }, 100)
      } else if (form && form.id) {
        const updatePayload = {
          ...data,
          id: form.id,
          created_at: form.created_at,
          updated_at: form.updated_at,
        }
        console.log('Update payload:', updatePayload)
        await dispatch(updateCIPControlFormAction(updatePayload)).unwrap()
        toast.success('CIP Control Form updated successfully')
        // Refresh the data to get complete relationship information
        setTimeout(() => {
          dispatch(fetchCIPControlForms())
        }, 100)
      } else {
        console.error('Form ID is missing for update operation')
        toast.error('Form ID is missing. Cannot update form.')
        return
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast.error(error || (mode === "create" ? 'Failed to create CIP control form' : 'Failed to update CIP control form'))
    }
  }

  useEffect(() => {
    if (open && form && mode === "edit") {
      reset({
        status: form.status || "",
        machine_id: form.machine_id || "",
        operator_id: form.operator_id || "",
        date: form.date || "",
        caustic_solution_strength: form.caustic_solution_strength || 0,
        acid_solution_strength: form.acid_solution_strength || 0,
        rinse_water_test: form.rinse_water_test || "",
        approver: form.approver || "",
        analyzer: form.analyzer || "",
        checked_by: form.checked_by || "",
      })
    } else if (open && mode === "create") {
      reset({
        status: "",
        machine_id: "",
        operator_id: "",
        date: "",
        caustic_solution_strength: 0,
        acid_solution_strength: 0,
        rinse_water_test: "",
        approver: "",
        analyzer: "",
        checked_by: "",
      })
    }
  }, [open, form, mode, reset])

  // Load initial data when drawer opens
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto bg-white">
        <div className="p-6 bg-white">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New CIP Control Form" : "Edit CIP Control Form"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new cleaning in place control form" : "Update cleaning in place control form"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-light text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full rounded-full border-gray-200">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="machine_id">Machine/System *</Label>
                  <Controller
                    name="machine_id"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={machines}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select machine"
                        searchPlaceholder="Search machines..."
                        emptyMessage="No machines found"
                        loading={loadingMachines}
                        onSearch={handleMachineSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
                  />
                  {errors.machine_id && <p className="text-sm text-red-500">{errors.machine_id.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operator_id">Operator *</Label>
                  <Controller
                    name="operator_id"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={users}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select operator"
                        searchPlaceholder="Search users..."
                        emptyMessage="No users found"
                        loading={loadingUsers}
                        onSearch={handleUserSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
                  />
                  {errors.operator_id && <p className="text-sm text-red-500">{errors.operator_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Date *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select date"
                        error={!!errors.date}
                      />
                    )}
                  />
                  {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                </div>
              </div>
            </div>

            {/* Solution Concentrations */}
            <div className="space-y-4">
              <h3 className="text-lg font-light text-gray-900 border-b pb-2">Solution Concentrations</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="caustic_solution_strength">Caustic Solution Strength (%) *</Label>
                  <Controller
                    name="caustic_solution_strength"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="caustic_solution_strength"
                        type="number"
                        step="0.1"
                        placeholder="Enter caustic strength"
                        className="rounded-full border-gray-200"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  {errors.caustic_solution_strength && <p className="text-sm text-red-500">{errors.caustic_solution_strength.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acid_solution_strength">Acid Solution Strength (%) *</Label>
                  <Controller
                    name="acid_solution_strength"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="acid_solution_strength"
                        type="number"
                        step="0.1"
                        placeholder="Enter acid strength"
                        className="rounded-full border-gray-200"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  {errors.acid_solution_strength && <p className="text-sm text-red-500">{errors.acid_solution_strength.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rinse_water_test">Rinse Water Test Result *</Label>
                <Controller
                  name="rinse_water_test"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="rinse_water_test"
                      placeholder="Enter water test result"
                      className="rounded-full border-gray-200"
                      {...field}
                    />
                  )}
                />
                {errors.rinse_water_test && <p className="text-sm text-red-500">{errors.rinse_water_test.message}</p>}
              </div>
            </div>

            {/* Approval & Verification */}
            <div className="space-y-4">
              <h3 className="text-lg font-light text-gray-900 border-b pb-2">Approval & Verification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="approver">Approver *</Label>
                  <Controller
                    name="approver"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={roles}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select approver role"
                        searchPlaceholder="Search roles..."
                        emptyMessage="No roles found"
                        loading={loadingRoles}
                        onSearch={handleRoleSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
                  />
                  {errors.approver && <p className="text-sm text-red-500">{errors.approver.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="analyzer">Analyzer *</Label>
                  <Controller
                    name="analyzer"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={users}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select analyzer"
                        searchPlaceholder="Search users..."
                        emptyMessage="No users found"
                        loading={loadingUsers}
                        onSearch={handleUserSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
                  />
                  {errors.analyzer && <p className="text-sm text-red-500">{errors.analyzer.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="checked_by">Checked By *</Label>
                <Controller
                  name="checked_by"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={users}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select checker"
                      searchPlaceholder="Search users..."
                      emptyMessage="No users found"
                      loading={loadingUsers}
                      onSearch={handleUserSearch}
                      className="w-full rounded-full border-gray-200"
                    />
                  )}
                />
                {errors.checked_by && <p className="text-sm text-red-500">{errors.checked_by.message}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </LoadingButton>
              <LoadingButton 
                type="submit" 
                loading={mode === "create" ? operationLoading.create : operationLoading.update}
                loadingText={mode === "create" ? "Creating..." : "Updating..."}
              >
                {mode === "create" ? "Create CIP Form" : "Update CIP Form"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
