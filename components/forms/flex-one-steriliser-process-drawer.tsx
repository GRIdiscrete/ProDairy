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
  createFlexOneSteriliserProcessAction, 
  updateFlexOneSteriliserProcessAction,
  fetchFlexOneSteriliserProcesses,
  createFlexOneSteriliserProcessProductAction,
  createFlexOneSteriliserProcessWaterStreamAction
} from "@/lib/store/slices/flexOneSteriliserProcessSlice"
import { usersApi } from "@/lib/api/users"
import { machineApi } from "@/lib/api/machine"
import { toast } from "sonner"
import { FlexOneSteriliserProcess, FlexOneSteriliserProcessProduct, FlexOneSteriliserProcessWaterStream } from "@/lib/api/data-capture-forms"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface FlexOneSteriliserProcessDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process?: FlexOneSteriliserProcess | null
  mode?: "create" | "edit"
}

// Step 1: Process Form Schema
const processSchema = yup.object({
  approved_by: yup.string().required("Approved by is required"),
  product_being_processed: yup.string().required("Product being processed is required"),
  machine_id: yup.string().required("Machine is required"),
  production_date: yup.string().required("Production date is required"),
  process_operator: yup.string().required("Process operator is required"),
  preheating_start: yup.string().required("Preheating start is required"),
  sterile_water_circulation: yup.string().required("Sterile water circulation is required"),
  production_start: yup.string().required("Production start is required"),
  production_end: yup.string().required("Production end is required"),
})

// Step 2: Product Form Schema
const productSchema = yup.object({
  time: yup.string().required("Time is required"),
  temp_product_btd: yup.number().required("Temperature product BTD is required"),
  temp_after_homogenizer: yup.number().required("Temperature after homogenizer is required"),
  temp_before_deaerator: yup.number().required("Temperature before deaerator is required"),
  temp_before_holding_cell: yup.number().required("Temperature before holding cell is required"),
  temp_after_holding_cell: yup.number().required("Temperature after holding cell is required"),
  temp_guard_holding_cell: yup.number().required("Temperature guard holding cell is required"),
  temp_to_filling: yup.number().required("Temperature to filling is required"),
  temp_from_filling: yup.number().required("Temperature from filling is required"),
  homogenisation_pressure: yup.number().required("Homogenisation pressure is required"),
  holding_cell: yup.number().required("Holding cell is required"),
  flow_rate: yup.number().required("Flow rate is required"),
  product_level_balance_tank: yup.number().required("Product level balance tank is required"),
})

// Step 3: Water Stream Form Schema
const waterStreamSchema = yup.object({
  temp_after_steam_injection: yup.number().required("Temperature after steam injection is required"),
  temp_deaerator_cooling_circuit: yup.number().required("Temperature deaerator cooling circuit is required"),
  steam_injection_valve_position: yup.number().required("Steam injection valve position is required"),
})

type ProcessFormData = yup.InferType<typeof processSchema>
type ProductFormData = yup.InferType<typeof productSchema>
type WaterStreamFormData = yup.InferType<typeof waterStreamSchema>

export function FlexOneSteriliserProcessDrawer({ 
  open, 
  onOpenChange, 
  process, 
  mode = "create" 
}: FlexOneSteriliserProcessDrawerProps) {
  const dispatch = useAppDispatch()
  const flexOneSteriliserProcessState = useAppSelector((state) => state.flexOneSteriliserProcesses)
  const { operationLoading } = flexOneSteriliserProcessState || { 
    operationLoading: { create: false, update: false, delete: false, fetch: false }
  }
  
  const [currentStep, setCurrentStep] = useState(1)
  const [createdProcess, setCreatedProcess] = useState<FlexOneSteriliserProcess | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMachines, setLoadingMachines] = useState(false)

  // Process form
  const processForm = useForm<ProcessFormData>({
    resolver: yupResolver(processSchema),
    defaultValues: {
      approved_by: "",
      product_being_processed: "",
      machine_id: "",
      production_date: "",
      process_operator: "",
      preheating_start: "",
      sterile_water_circulation: "",
      production_start: "",
      production_end: "",
    },
  })

  // Product form
  const productForm = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      time: "",
      temp_product_btd: 0,
      temp_after_homogenizer: 0,
      temp_before_deaerator: 0,
      temp_before_holding_cell: 0,
      temp_after_holding_cell: 0,
      temp_guard_holding_cell: 0,
      temp_to_filling: 0,
      temp_from_filling: 0,
      homogenisation_pressure: 0,
      holding_cell: 0,
      flow_rate: 0,
      product_level_balance_tank: 0,
    },
  })

  // Water stream form
  const waterStreamForm = useForm<WaterStreamFormData>({
    resolver: yupResolver(waterStreamSchema),
    defaultValues: {
      temp_after_steam_injection: 0,
      temp_deaerator_cooling_circuit: 0,
      steam_injection_valve_position: 0,
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
        toast.error("Failed to load form data")
      } finally {
        setLoadingUsers(false)
        setLoadingMachines(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  // Reset forms when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && process) {
        processForm.reset({
          approved_by: process.approved_by,
          product_being_processed: process.product_being_processed,
          machine_id: process.machine_id,
          production_date: process.production_date,
          process_operator: process.process_operator,
          preheating_start: process.preheating_start,
          sterile_water_circulation: process.sterile_water_circulation,
          production_start: process.production_start,
          production_end: process.production_end,
        })
        setCreatedProcess(process)
        setCurrentStep(2) // Skip to next step for edit mode
      } else {
        processForm.reset()
        setCreatedProcess(null)
        setCurrentStep(1)
      }
    }
  }, [open, mode, process, processForm])

  const handleProcessSubmit = async (data: ProcessFormData) => {
    try {
      if (mode === "edit" && process) {
        await dispatch(updateFlexOneSteriliserProcessAction({
          ...process,
          ...data,
        })).unwrap()
        toast.success("Process updated successfully")
        setCreatedProcess({ ...process, ...data })
      } else {
        const result = await dispatch(createFlexOneSteriliserProcessAction(data)).unwrap()
        toast.success("Process created successfully")
        setCreatedProcess(result)
      }
      setCurrentStep(2)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || "Failed to save process"
      toast.error(errorMessage)
    }
  }

  const handleProductSubmit = async (data: ProductFormData) => {
    if (!createdProcess) {
      toast.error("No process found")
      return
    }

    try {
      const productData = {
        ...data,
        flex_one_steriliser_process_id: createdProcess.id!,
      }

      await dispatch(createFlexOneSteriliserProcessProductAction(productData)).unwrap()
      toast.success("Product measurements created successfully")
      setCurrentStep(3)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || "Failed to save product measurements"
      toast.error(errorMessage)
    }
  }

  const handleWaterStreamSubmit = async (data: WaterStreamFormData) => {
    if (!createdProcess) {
      toast.error("No process found")
      return
    }

    try {
      const waterStreamData = {
        ...data,
        flex_1_steriliser_process_id: createdProcess.id!,
      }

      await dispatch(createFlexOneSteriliserProcessWaterStreamAction(waterStreamData)).unwrap()
      toast.success("Water stream data created successfully")

      // Refresh the processes list
      setTimeout(() => {
        dispatch(fetchFlexOneSteriliserProcesses())
      }, 1000)

      onOpenChange(false)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || "Failed to save water stream data"
      toast.error(errorMessage)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep === 1) {
      processForm.handleSubmit(handleProcessSubmit)()
    } else if (currentStep === 2) {
      productForm.handleSubmit(handleProductSubmit)()
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

  const handleMachineSearch = async (query: string) => {
    if (!query.trim()) return []
    
    try {
      const machinesResponse = await machineApi.getMachines({
        filters: { search: query }
      })
      return (machinesResponse.data || [])
        .map(machine => ({
          value: machine.id,
          label: machine.name,
          description: `${machine.location} • ${machine.category}`
        }))
    } catch (error) {
      console.error("Failed to search machines:", error)
      return []
    }
  }

  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Step 2: Product Measurements</h3>
          <p className="text-sm text-gray-600 mt-2">Enter the product temperature and flow measurements</p>
        </div>
        
        <div className="space-y-2">
          <Controller
            name="time"
            control={productForm.control}
            render={({ field }) => (
              <DatePicker
                label="Measurement Time *"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select measurement time"
                showTime={true}
                error={!!productForm.formState.errors.time}
              />
            )}
          />
          {productForm.formState.errors.time && (
            <p className="text-sm text-red-500">{productForm.formState.errors.time.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="temp_product_btd">Temperature Product BTD *</Label>
            <Controller
              name="temp_product_btd"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="temp_product_btd"
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.temp_product_btd && (
              <p className="text-sm text-red-500">{productForm.formState.errors.temp_product_btd.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp_after_homogenizer">Temperature After Homogenizer *</Label>
            <Controller
              name="temp_after_homogenizer"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="temp_after_homogenizer"
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.temp_after_homogenizer && (
              <p className="text-sm text-red-500">{productForm.formState.errors.temp_after_homogenizer.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="temp_before_deaerator">Temperature Before Deaerator *</Label>
            <Controller
              name="temp_before_deaerator"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="temp_before_deaerator"
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.temp_before_deaerator && (
              <p className="text-sm text-red-500">{productForm.formState.errors.temp_before_deaerator.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp_before_holding_cell">Temperature Before Holding Cell *</Label>
            <Controller
              name="temp_before_holding_cell"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="temp_before_holding_cell"
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.temp_before_holding_cell && (
              <p className="text-sm text-red-500">{productForm.formState.errors.temp_before_holding_cell.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="temp_after_holding_cell">Temperature After Holding Cell *</Label>
            <Controller
              name="temp_after_holding_cell"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="temp_after_holding_cell"
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.temp_after_holding_cell && (
              <p className="text-sm text-red-500">{productForm.formState.errors.temp_after_holding_cell.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp_guard_holding_cell">Temperature Guard Holding Cell *</Label>
            <Controller
              name="temp_guard_holding_cell"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="temp_guard_holding_cell"
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.temp_guard_holding_cell && (
              <p className="text-sm text-red-500">{productForm.formState.errors.temp_guard_holding_cell.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="temp_to_filling">Temperature To Filling *</Label>
            <Controller
              name="temp_to_filling"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="temp_to_filling"
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.temp_to_filling && (
              <p className="text-sm text-red-500">{productForm.formState.errors.temp_to_filling.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp_from_filling">Temperature From Filling *</Label>
            <Controller
              name="temp_from_filling"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="temp_from_filling"
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.temp_from_filling && (
              <p className="text-sm text-red-500">{productForm.formState.errors.temp_from_filling.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homogenisation_pressure">Homogenisation Pressure *</Label>
            <Controller
              name="homogenisation_pressure"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="homogenisation_pressure"
                  type="number"
                  step="0.1"
                  placeholder="Enter pressure"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.homogenisation_pressure && (
              <p className="text-sm text-red-500">{productForm.formState.errors.homogenisation_pressure.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="holding_cell">Holding Cell *</Label>
            <Controller
              name="holding_cell"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="holding_cell"
                  type="number"
                  step="0.1"
                  placeholder="Enter holding cell value"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.holding_cell && (
              <p className="text-sm text-red-500">{productForm.formState.errors.holding_cell.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flow_rate">Flow Rate *</Label>
            <Controller
              name="flow_rate"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="flow_rate"
                  type="number"
                  step="0.1"
                  placeholder="Enter flow rate"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.flow_rate && (
              <p className="text-sm text-red-500">{productForm.formState.errors.flow_rate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_level_balance_tank">Product Level Balance Tank *</Label>
            <Controller
              name="product_level_balance_tank"
              control={productForm.control}
              render={({ field }) => (
                <Input
                  id="product_level_balance_tank"
                  type="number"
                  step="0.1"
                  placeholder="Enter product level"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {productForm.formState.errors.product_level_balance_tank && (
              <p className="text-sm text-red-500">{productForm.formState.errors.product_level_balance_tank.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Step 3: Water Stream Data</h3>
          <p className="text-sm text-gray-600 mt-2">Enter the water stream temperature and valve position measurements</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="temp_after_steam_injection">Temperature After Steam Injection *</Label>
          <Controller
            name="temp_after_steam_injection"
            control={waterStreamForm.control}
            render={({ field }) => (
              <Input
                id="temp_after_steam_injection"
                type="number"
                step="0.1"
                placeholder="Enter temperature"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
          {waterStreamForm.formState.errors.temp_after_steam_injection && (
            <p className="text-sm text-red-500">{waterStreamForm.formState.errors.temp_after_steam_injection.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="temp_deaerator_cooling_circuit">Temperature Deaerator Cooling Circuit *</Label>
          <Controller
            name="temp_deaerator_cooling_circuit"
            control={waterStreamForm.control}
            render={({ field }) => (
              <Input
                id="temp_deaerator_cooling_circuit"
                type="number"
                step="0.1"
                placeholder="Enter temperature"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
          {waterStreamForm.formState.errors.temp_deaerator_cooling_circuit && (
            <p className="text-sm text-red-500">{waterStreamForm.formState.errors.temp_deaerator_cooling_circuit.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="steam_injection_valve_position">Steam Injection Valve Position *</Label>
          <Controller
            name="steam_injection_valve_position"
            control={waterStreamForm.control}
            render={({ field }) => (
              <Input
                id="steam_injection_valve_position"
                type="number"
                step="0.1"
                placeholder="Enter valve position"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
          {waterStreamForm.formState.errors.steam_injection_valve_position && (
            <p className="text-sm text-red-500">{waterStreamForm.formState.errors.steam_injection_valve_position.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Step 1: Process Information</h3>
          <p className="text-sm text-gray-600 mt-2">Enter the basic process details, personnel, and machine information</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="approved_by">Approved By *</Label>
            <Controller
              name="approved_by"
              control={processForm.control}
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
                  placeholder="Search and select approver"
                  loading={loadingUsers}
                />
              )}
            />
            {processForm.formState.errors.approved_by && (
              <p className="text-sm text-red-500">{processForm.formState.errors.approved_by.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="process_operator">Process Operator *</Label>
            <Controller
              name="process_operator"
              control={processForm.control}
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
            {processForm.formState.errors.process_operator && (
              <p className="text-sm text-red-500">{processForm.formState.errors.process_operator.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="machine_id">Machine *</Label>
            <Controller
              name="machine_id"
              control={processForm.control}
              render={({ field }) => (
                <SearchableSelect
                  options={machines.map(machine => ({
                    value: machine.id,
                    label: machine.name,
                    description: `${machine.location} • ${machine.category}`
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearch={handleMachineSearch}
                  placeholder="Search and select machine"
                  loading={loadingMachines}
                />
              )}
            />
            {processForm.formState.errors.machine_id && (
              <p className="text-sm text-red-500">{processForm.formState.errors.machine_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_being_processed">Product Being Processed *</Label>
            <Controller
              name="product_being_processed"
              control={processForm.control}
              render={({ field }) => (
                <Input
                  id="product_being_processed"
                  placeholder="Enter product name"
                  {...field}
                />
              )}
            />
            {processForm.formState.errors.product_being_processed && (
              <p className="text-sm text-red-500">{processForm.formState.errors.product_being_processed.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Controller
            name="production_date"
            control={processForm.control}
            render={({ field }) => (
              <DatePicker
                label="Production Date *"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select production date"
                error={!!processForm.formState.errors.production_date}
              />
            )}
          />
          {processForm.formState.errors.production_date && (
            <p className="text-sm text-red-500">{processForm.formState.errors.production_date.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Controller
              name="preheating_start"
              control={processForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Preheating Start *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select preheating start time"
                  showTime={true}
                  error={!!processForm.formState.errors.preheating_start}
                />
              )}
            />
            {processForm.formState.errors.preheating_start && (
              <p className="text-sm text-red-500">{processForm.formState.errors.preheating_start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Controller
              name="sterile_water_circulation"
              control={processForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Sterile Water Circulation *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select sterile water circulation time"
                  showTime={true}
                  error={!!processForm.formState.errors.sterile_water_circulation}
                />
              )}
            />
            {processForm.formState.errors.sterile_water_circulation && (
              <p className="text-sm text-red-500">{processForm.formState.errors.sterile_water_circulation.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Controller
              name="production_start"
              control={processForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Production Start *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select production start time"
                  showTime={true}
                  error={!!processForm.formState.errors.production_start}
                />
              )}
            />
            {processForm.formState.errors.production_start && (
              <p className="text-sm text-red-500">{processForm.formState.errors.production_start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Controller
              name="production_end"
              control={processForm.control}
              render={({ field }) => (
                <DatePicker
                  label="Production End *"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select production end time"
                  showTime={true}
                  error={!!processForm.formState.errors.production_end}
                />
              )}
            />
            {processForm.formState.errors.production_end && (
              <p className="text-sm text-red-500">{processForm.formState.errors.production_end.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>
            {mode === "edit" ? "Edit Flex One Steriliser Process" : "Create Flex One Steriliser Process"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1 
              ? "Step 1: Enter process information and personnel details"
              : currentStep === 2
              ? "Step 2: Enter product measurements and temperature data"
              : "Step 3: Enter water stream data and valve positions"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {currentStep === 1 ? renderStep1() : currentStep === 2 ? renderStep2() : renderStep3()}
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t">
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
              Step {currentStep} of 3
            </span>
          </div>

          {currentStep < 3 ? (
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
              onClick={waterStreamForm.handleSubmit(handleWaterStreamSubmit)}
              disabled={operationLoading.create}
            >
              {mode === "edit" ? "Update Process" : "Create Process"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
