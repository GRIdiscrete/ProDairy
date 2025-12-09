"use client"

import { useState, useEffect } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Clock } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createCIPControlFormAction, updateCIPControlFormAction, fetchCIPControlForms } from "@/lib/store/slices/cipControlFormSlice"
import { machineApi } from "@/lib/api/machine"
import { usersApi } from "@/lib/api/users"
import { rolesApi } from "@/lib/api/roles"
import { siloApi } from "@/lib/api/silo"
import { toast } from "sonner"
import type { CIPControlForm, CIPControlFormStages } from "@/lib/api/data-capture-forms"

const cipControlFormSchema = yup.object({
  status: yup.string().required("Status is required"),
  machine_or_silo: yup.string().required("Machine or Silo type is required"),
  machine_id: yup.string().nullable(),
  silo_id: yup.string().nullable(),
  operator_id: yup.string().required("Operator is required"),
  date: yup.string().required("Date is required"),
  caustic_solution_strength: yup.number().required("Caustic solution strength is required").min(0, "Must be positive"),
  acid_solution_strength: yup.number().required("Acid solution strength is required").min(0, "Must be positive"),
  rinse_water_test: yup.string().required("Rinse water test result is required"),
  approver: yup.string().required("Approver is required"),
  analyzer: yup.string().required("Analyzer is required"),
  checked_by: yup.string().required("Checked by is required"),
  stages: yup.array().of(
    yup.object({
      id: yup.string().optional(),
      stage: yup.string().required("Stage name is required"),
      start_time: yup.string().required("Start time is required"),
      stop_time: yup.string().required("Stop time is required"),
    })
  ).optional().default([]),
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
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])
  const [users, setUsers] = useState<SearchableSelectOption[]>([])
  const [roles, setRoles] = useState<SearchableSelectOption[]>([])
  const [loadingMachines, setLoadingMachines] = useState(false)
  const [loadingSilos, setLoadingSilos] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [cipType, setCipType] = useState<'machine' | 'silo'>('machine')

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingMachines(true)
      setLoadingSilos(true)
      setLoadingUsers(true)
      setLoadingRoles(true)
      
      const [machinesResponse, silosResponse, usersResponse, rolesResponse] = await Promise.all([
        machineApi.getMachines(),
        siloApi.getSilos(),
        usersApi.getUsers(),
        rolesApi.getRoles()
      ])
      
      setMachines(machinesResponse.data?.map(machine => ({
        value: machine.id,
        label: machine.name,
        description: `${machine.location} • ${machine.category} • ${machine.serial_number}`
      })) || [])
      
      setSilos(silosResponse.data?.map(silo => ({
        value: silo.id,
        label: silo.name,
        description: `${silo.location} • ${silo.category} • ${silo.capacity}L capacity`
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
      setLoadingSilos(false)
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
      console.error('Error searching silos:', error)
    } finally {
      setLoadingSilos(false)
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
    setValue,
  } = useForm<CIPControlFormData>({
    resolver: yupResolver(cipControlFormSchema),
    defaultValues: {
      status: "",
      machine_or_silo: "",
      machine_id: null as any,
      silo_id: null as any,
      operator_id: "",
      date: "",
      caustic_solution_strength: undefined,
      acid_solution_strength: undefined,
      rinse_water_test: "",
      approver: "",
      analyzer: "",
      checked_by: "",
      stages: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stages",
  })

  const onSubmit = async (data: CIPControlFormData) => {
    try {
      console.log('Form data submitted:', data)
      console.log('Form object:', form)
      console.log('Mode:', mode)

      const payload = {
        ...data,
        machine_id: cipType === 'machine' ? data.machine_id : null,
        silo_id: cipType === 'silo' ? data.silo_id : null,
        stages: data.stages?.map((stage) => ({
          ...(mode === "edit" && stage.id ? { id: stage.id } : {}),
          ...(mode === "edit" && form?.id ? { cip_control_form_id: form.id } : {}),
          stage: stage.stage,
          start_time: stage.start_time,
          stop_time: stage.stop_time,
        })) || [],
      }

      if (mode === "create") {
        await dispatch(createCIPControlFormAction(payload)).unwrap()
        toast.success('CIP Control Form created successfully')
        // Refresh the data to get complete relationship information
        setTimeout(() => {
          dispatch(fetchCIPControlForms())
        }, 100)
      } else if (form && form.id) {
        const updatePayload = {
          ...payload,
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

  const onInvalid = (errors: any) => {
    const errorMessages = Object.values(errors).map((err: any) => err.message).filter(Boolean)
    toast.error(`Please check the following fields: ${errorMessages.join(', ')}`, {
      style: { background: '#ef4444', color: 'white' }
    })
  }

  useEffect(() => {
    if (open && form && mode === "edit") {
      const formData = form as any
      const machineOrSilo = formData.machine_or_silo || ""
      
      // Determine CIP type from form data
      if (formData.machine_id) {
        setCipType('machine')
      } else if (formData.silo_id) {
        setCipType('silo')
      }
      
      reset({
        status: form.status || "",
        machine_or_silo: machineOrSilo,
        machine_id: form.machine_id || null as any,
        silo_id: formData.silo_id || null as any,
        operator_id: form.operator_id || "",
        date: form.date || "",
        caustic_solution_strength: form.caustic_solution_strength || undefined,
        acid_solution_strength: form.acid_solution_strength || undefined,
        rinse_water_test: form.rinse_water_test || "",
        approver: form.approver || "",
        analyzer: form.analyzer || "",
        checked_by: form.checked_by || "",
        stages: form.cip_control_form_stages?.map((stage) => ({
          id: stage.id,
          stage: stage.stage,
          start_time: stage.start_time,
          stop_time: stage.stop_time,
        })) || [],
      })
    } else if (open && mode === "create") {
      setCipType('machine')
      reset({
        status: "",
        machine_or_silo: "",
        machine_id: null as any,
        silo_id: null as any,
        operator_id: "",
        date: "",
        caustic_solution_strength: undefined,
        acid_solution_strength: undefined,
        rinse_water_test: "",
        approver: "",
        analyzer: "",
        checked_by: "",
        stages: [],
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
      <SheetContent className="tablet-sheet-full p-0 bg-white overflow-hidden flex flex-col">
        <div className="flex-shrink-0 p-6 bg-white border-b">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New CIP Control Form" : "Edit CIP Control Form"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new cleaning in place control form" : "Update cleaning in place control form"}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 p-6">
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
                  <Label htmlFor="cip_type">CIP Type *</Label>
                  <Select 
                    onValueChange={(val) => {
                      setCipType(val as 'machine' | 'silo')
                      // Clear the other field when switching
                      if (val === 'machine') {
                        setValue('silo_id', null as any)
                      } else {
                        setValue('machine_id', null as any)
                      }
                    }} 
                    value={cipType}
                  >
                    <SelectTrigger className="w-full rounded-full border-gray-200">
                      <SelectValue placeholder="Select CIP type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="machine">Machine</SelectItem>
                      <SelectItem value="silo">Silo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {cipType === 'machine' ? (
                  <div className="space-y-2">
                    <Label htmlFor="machine_id">Machine/System *</Label>
                    <Controller
                      name="machine_id"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={machines}
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val)
                            const machine = machines.find(m => m.value === val)
                            if (machine) {
                              setValue('machine_or_silo', machine.label)
                            }
                          }}
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
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="silo_id">Silo *</Label>
                    <Controller
                      name="silo_id"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={silos}
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val)
                            const silo = silos.find(s => s.value === val)
                            if (silo) {
                              setValue('machine_or_silo', silo.label)
                            }
                          }}
                          placeholder="Select silo"
                          searchPlaceholder="Search silos..."
                          emptyMessage="No silos found"
                          loading={loadingSilos}
                          onSearch={handleSiloSearch}
                          className="w-full rounded-full border-gray-200"
                        />
                      )}
                    />
                    {errors.silo_id && <p className="text-sm text-red-500">{errors.silo_id.message}</p>}
                  </div>
                )}
                
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

            {/* CIP Stages */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-light text-gray-900">CIP Stages</h3>
                <Button
                  type="button"
                  
                  size="sm"
                  onClick={() => append({ stage: "", start_time: "", stop_time: "" })}
                  className=" bg-[#006BC4] text-white rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stage
                </Button>
              </div>
              
              {fields.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Clock className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No stages added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Add Stage" to add a CIP stage</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-light text-gray-700">Stage {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`stages.${index}.stage`}>Stage Name *</Label>
                          <Controller
                            name={`stages.${index}.stage`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                id={`stages.${index}.stage`}
                                placeholder="e.g., cold water rinse"
                                className="rounded-full border-gray-200"
                                {...field}
                              />
                            )}
                          />
                          {errors.stages?.[index]?.stage && (
                            <p className="text-sm text-red-500">{errors.stages[index]?.stage?.message}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Controller
                              name={`stages.${index}.start_time`}
                              control={control}
                              render={({ field }) => (
                                <TimePicker
                                  label="Start Time *"
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Select start time"
                                  error={!!errors.stages?.[index]?.start_time}
                                />
                              )}
                            />
                            {errors.stages?.[index]?.start_time && (
                              <p className="text-sm text-red-500">{errors.stages[index]?.start_time?.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Controller
                              name={`stages.${index}.stop_time`}
                              control={control}
                              render={({ field }) => (
                                <TimePicker
                                  label="Stop Time *"
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Select stop time"
                                  error={!!errors.stages?.[index]?.stop_time}
                                />
                              )}
                            />
                            {errors.stages?.[index]?.stop_time && (
                              <p className="text-sm text-red-500">{errors.stages[index]?.stop_time?.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t bg-white sticky bottom-0 pb-6">
              <LoadingButton type="button"  onClick={() => onOpenChange(false)}>
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
