"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createRole, updateRole } from "@/lib/store/slices/rolesSlice"
import { toast } from "sonner"
import { UserRole } from "@/lib/types/roles"

const roleSchema = yup.object({
  role_name: yup.string().required("Role name is required"),
  features: yup.object({
    // Original permissions
    user: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    role: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    machine_item: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    silo_item: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    supplier: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    process: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    devices: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    
    // New permissions - direct arrays, not nested under operations
    raw_product_collection: yup.array().of(yup.string()).default([]),
    raw_milk_intake: yup.array().of(yup.string()).default([]),
    raw_milk_lab_test: yup.array().of(yup.string()).default([]),
    before_and_after_autoclave_lab_test: yup.array().of(yup.string()).default([]),
    pasteurizing: yup.array().of(yup.string()).default([]),
    filmatic_operation: yup.array().of(yup.string()).default([]),
    steri_process_operation: yup.array().of(yup.string()).default([]),
    incubation: yup.array().of(yup.string()).default([]),
    incubation_lab_test: yup.array().of(yup.string()).default([]),
    dispatch: yup.array().of(yup.string()).default([]),
    production_plan: yup.array().of(yup.string()).default([]),
  }).default({
    // Original permissions
    user: { operations: [] },
    role: { operations: [] },
    machine_item: { operations: [] },
    silo_item: { operations: [] },
    supplier: { operations: [] },
    process: { operations: [] },
    devices: { operations: [] },
    
    // New permissions - direct arrays
    raw_product_collection: [],
    raw_milk_intake: [],
    raw_milk_lab_test: [],
    before_and_after_autoclave_lab_test: [],
    pasteurizing: [],
    filmatic_operation: [],
    steri_process_operation: [],
    incubation: [],
    incubation_lab_test: [],
    dispatch: [],
    production_plan: [],
  }),
  views: yup.array().of(yup.string()).default([]),
})

type RoleFormData = yup.InferType<typeof roleSchema>

interface RoleFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: UserRole | null
  mode: "create" | "edit"
}

const featureOptions = [
  // Original permissions
  { key: "user", label: "User Management" },
  { key: "role", label: "Role Management" },
  { key: "machine_item", label: "Machine Management" },
  { key: "silo_item", label: "Silo Management" },
  { key: "supplier", label: "Supplier Management" },
  { key: "process", label: "Process Management" },
  { key: "devices", label: "Device Management" },
  
  // New permissions
  { key: "raw_product_collection", label: "Raw Product Collection" },
  { key: "raw_milk_intake", label: "Raw Milk Intake" },
  { key: "raw_milk_lab_test", label: "Raw Milk Lab Test" },
  { key: "before_and_after_autoclave_lab_test", label: "Before & After Autoclave Lab Test" },
  { key: "pasteurizing", label: "Pasteurizing" },
  { key: "filmatic_operation", label: "Filmatic Operation" },
  { key: "steri_process_operation", label: "Steri Process Operation" },
  { key: "incubation", label: "Incubation" },
  { key: "incubation_lab_test", label: "Incubation Lab Test" },
  { key: "dispatch", label: "Dispatch" },
  { key: "production_plan", label: "Production Plan" },
]

const actionOptions = ["create", "read", "update", "delete", "approve"]

const viewOptions = [
  // Original views
  { key: "dashboard", label: "Dashboard" },
  { key: "settings", label: "Settings" },
  { key: "user_tab", label: "User Tab" },
  { key: "role_tab", label: "Role Tab" },
  { key: "machine_tab", label: "Machine Tab" },
  { key: "silo_tab", label: "Silo Tab" },
  { key: "supplier_tab", label: "Supplier Tab" },
  { key: "process_tab", label: "Process Tab" },
  { key: "devices_tab", label: "Devices Tab" },
  
  // New views
  { key: "driver_ui", label: "Driver UI" },
  { key: "data_capture_module", label: "Data Capture Module" },
  { key: "lab_tests", label: "Lab Tests" },
  { key: "operations", label: "Operations" },
]

export function RoleFormDrawer({ open, onOpenChange, role, mode }: RoleFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.roles)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RoleFormData>({
    resolver: yupResolver(roleSchema),
    defaultValues: {
      role_name: "",
      features: {
        // Original permissions
        user: { operations: [] },
        role: { operations: [] },
        machine_item: { operations: [] },
        silo_item: { operations: [] },
        supplier: { operations: [] },
        process: { operations: [] },
        devices: { operations: [] },
        
        // New permissions - direct arrays
        raw_product_collection: [],
        raw_milk_intake: [],
        raw_milk_lab_test: [],
        before_and_after_autoclave_lab_test: [],
        pasteurizing: [],
        filmatic_operation: [],
        steri_process_operation: [],
        incubation: [],
        incubation_lab_test: [],
        dispatch: [],
        production_plan: [],
      },
      views: [],
    },
  })

  const onSubmit = async (data: RoleFormData) => {
    try {
      console.log('Form data submitted:', data)
      console.log('Raw features data:', data.features)
      console.log('New features check:', {
        raw_product_collection: data.features?.raw_product_collection,
        raw_milk_intake: data.features?.raw_milk_intake,
        pasteurizing: data.features?.pasteurizing,
        filmatic_operation: data.features?.filmatic_operation,
        dispatch: data.features?.dispatch,
        production_plan: data.features?.production_plan,
      })
      
      // Debug: Check if new features have operations (now direct arrays)
      console.log('New features operations:', {
        raw_product_collection_ops: data.features?.raw_product_collection,
        raw_milk_intake_ops: data.features?.raw_milk_intake,
        pasteurizing_ops: data.features?.pasteurizing,
      })
      
      // Clean and transform the data to ensure proper types
      const cleanedData = {
        role_name: data.role_name?.trim() || '',
        // Original permissions - flattened to top level
        user_operations: (data.features?.user?.operations?.filter(Boolean) || []) as string[],
        role_operations: (data.features?.role?.operations?.filter(Boolean) || []) as string[],
        machine_item_operations: (data.features?.machine_item?.operations?.filter(Boolean) || []) as string[],
        silo_item_operations: (data.features?.silo_item?.operations?.filter(Boolean) || []) as string[],
        supplier_operations: (data.features?.supplier?.operations?.filter(Boolean) || []) as string[],
        process_operations: (data.features?.process?.operations?.filter(Boolean) || []) as string[],
        devices_operations: (data.features?.devices?.operations?.filter(Boolean) || []) as string[],
        
        // New permissions - direct arrays (no nested operations)
        raw_product_collection: Array.isArray(data.features?.raw_product_collection) 
          ? data.features.raw_product_collection.filter(Boolean) 
          : [],
        raw_milk_intake: Array.isArray(data.features?.raw_milk_intake) 
          ? data.features.raw_milk_intake.filter(Boolean) 
          : [],
        raw_milk_lab_test: Array.isArray(data.features?.raw_milk_lab_test) 
          ? data.features.raw_milk_lab_test.filter(Boolean) 
          : [],
        before_and_after_autoclave_lab_test: Array.isArray(data.features?.before_and_after_autoclave_lab_test) 
          ? data.features.before_and_after_autoclave_lab_test.filter(Boolean) 
          : [],
        pasteurizing: Array.isArray(data.features?.pasteurizing) 
          ? data.features.pasteurizing.filter(Boolean) 
          : [],
        filmatic_operation: Array.isArray(data.features?.filmatic_operation) 
          ? data.features.filmatic_operation.filter(Boolean) 
          : [],
        steri_process_operation: Array.isArray(data.features?.steri_process_operation) 
          ? data.features.steri_process_operation.filter(Boolean) 
          : [],
        incubation: Array.isArray(data.features?.incubation) 
          ? data.features.incubation.filter(Boolean) 
          : [],
        incubation_lab_test: Array.isArray(data.features?.incubation_lab_test) 
          ? data.features.incubation_lab_test.filter(Boolean) 
          : [],
        dispatch: Array.isArray(data.features?.dispatch) 
          ? data.features.dispatch.filter(Boolean) 
          : [],
        production_plan: Array.isArray(data.features?.production_plan) 
          ? data.features.production_plan.filter(Boolean) 
          : [],
        
        views: (data.views?.filter(Boolean) || []) as string[],
      }

      console.log('Cleaned data:', cleanedData)
      console.log('New features in cleaned data:', {
        raw_product_collection: cleanedData.raw_product_collection,
        raw_milk_intake: cleanedData.raw_milk_intake,
        raw_milk_lab_test: cleanedData.raw_milk_lab_test,
        pasteurizing: cleanedData.pasteurizing,
        filmatic_operation: cleanedData.filmatic_operation,
        dispatch: cleanedData.dispatch,
        production_plan: cleanedData.production_plan,
      })

      if (mode === "create") {
        await dispatch(createRole(cleanedData)).unwrap()
        toast.success('Role created successfully')
      } else if (role) {
        await dispatch(updateRole({
          ...cleanedData,
          id: role.id,
          updated_at: role.updated_at,
        })).unwrap()
        toast.success('Role updated successfully')
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      // Backend error message will be used from the thunk
      toast.error(error || (mode === "create" ? 'Failed to create role' : 'Failed to update role'))
    }
  }


  useEffect(() => {
    console.log('Form useEffect triggered:', { open, role: !!role, mode })
    if (open && role && mode === "edit") {
      reset({
        role_name: role.role_name || "",
        features: {
          // Original permissions
          user: { operations: role.user_operations || [] },
          role: { operations: role.role_operations || [] },
          machine_item: { operations: role.machine_item_operations || [] },
          silo_item: { operations: role.silo_item_operations || [] },
          supplier: { operations: role.supplier_operations || [] },
          process: { operations: role.process_operations || [] },
          devices: { operations: role.devices_operations || [] },
          
          // New permissions - direct arrays
          raw_product_collection: role.raw_product_collection || [],
          raw_milk_intake: role.raw_milk_intake || [],
          raw_milk_lab_test: role.raw_milk_lab_test || [],
          before_and_after_autoclave_lab_test: role.before_and_after_autoclave_lab_test || [],
          pasteurizing: role.pasteurizing || [],
          filmatic_operation: role.filmatic_operation || [],
          steri_process_operation: role.steri_process_operation || [],
          incubation: role.incubation || [],
          incubation_lab_test: role.incubation_lab_test || [],
          dispatch: role.dispatch || [],
          production_plan: role.production_plan || [],
        },
        views: role.views || [],
      })
      console.log('Form reset with role data:', {
        role_name: role.role_name,
        raw_product_collection: role.raw_product_collection,
        raw_milk_intake: role.raw_milk_intake,
        pasteurizing: role.pasteurizing,
        filmatic_operation: role.filmatic_operation,
        dispatch: role.dispatch,
        production_plan: role.production_plan,
      })
      console.log('All role properties:', Object.keys(role))
    } else if (open && mode === "create") {
      reset({
        role_name: "",
        features: {
          // Original permissions
          user: { operations: [] },
          role: { operations: [] },
          machine_item: { operations: [] },
          silo_item: { operations: [] },
          supplier: { operations: [] },
          process: { operations: [] },
          devices: { operations: [] },
          
          // New permissions - direct arrays
          raw_product_collection: [],
          raw_milk_intake: [],
          raw_milk_lab_test: [],
          before_and_after_autoclave_lab_test: [],
          pasteurizing: [],
          filmatic_operation: [],
          steri_process_operation: [],
          incubation: [],
          incubation_lab_test: [],
          dispatch: [],
          production_plan: [],
        },
        views: [],
      })
    }
  }, [open, role, mode, reset])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto bg-white">
        <div className="p-6 bg-white">
          <SheetHeader className="bg-white">
            <SheetTitle className="text-2xl text-gray-900">{mode === "create" ? "Add New Role" : "Edit Role"}</SheetTitle>
            <SheetDescription className="text-gray-600">
              {mode === "create" ? "Create a new user role with permissions" : "Update role permissions"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xl text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
              <div className="space-y-2">
                <Label htmlFor="role_name" className="text-base text-gray-700">Role Name</Label>
                <Controller
                  name="role_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="role_name"
                      {...field}
                      placeholder="Enter role name"
                      className="border border-gray-200 rounded-lg"
                    />
                  )}
                />
                {errors.role_name && (
                  <p className="text-sm text-red-500">{errors.role_name.message}</p>
                )}
              </div>
            </div>

            {/* Permission Matrix */}
            <div className="space-y-4">
              <h3 className="text-xl text-gray-900 border-b border-gray-200 pb-2">Permission Matrix</h3>
              <div className="border border-gray-200 rounded-lg bg-white">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-lg text-gray-900">Feature Permissions</h4>
                  <p className="text-sm text-gray-500">Configure feature permissions</p>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-3 text-base text-gray-700">Feature</th>
                          {actionOptions.map((action) => (
                            <th key={action} className="text-center p-3 text-base text-gray-700 min-w-[80px] capitalize">
                              {action}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {featureOptions.map((feature, index) => (
                          <tr key={feature.key} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="p-3 text-base text-gray-700">{feature.label}</td>
                            {actionOptions.map((action) => {
                              const allFeatures = watch('features')
                              // For new features, they are direct arrays, not nested under operations
                              const isNewFeature = ['raw_product_collection', 'raw_milk_intake', 'raw_milk_lab_test', 'before_and_after_autoclave_lab_test', 'pasteurizing', 'filmatic_operation', 'steri_process_operation', 'incubation', 'incubation_lab_test', 'dispatch', 'production_plan'].includes(feature.key)
                              const currentFeatures = isNewFeature 
                                ? (allFeatures?.[feature.key as keyof typeof allFeatures] as string[] || [])
                                : (allFeatures?.[feature.key as keyof typeof allFeatures]?.operations || [])
                              const isChecked = currentFeatures.includes(action)
                              
                              return (
                                <td key={action} className="text-center p-3">
                                  <div className="flex items-center justify-center">
                                    <Checkbox
                                      id={`${feature.key}-${action}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        console.log(`Feature ${feature.key} - Action ${action} - Checked: ${checked}`)
                                        const updatedFeatures = { ...allFeatures }
                                        
                                        if (isNewFeature) {
                                          // For new features, work directly with arrays
                                          const current = updatedFeatures[feature.key as keyof typeof updatedFeatures] as string[] || []
                                          if (checked) {
                                            updatedFeatures[feature.key as keyof typeof updatedFeatures] = [...current, action]
                                          } else {
                                            updatedFeatures[feature.key as keyof typeof updatedFeatures] = current.filter(a => a !== action)
                                          }
                                        } else {
                                          // For original features, work with nested operations
                                          if (!updatedFeatures[feature.key as keyof typeof updatedFeatures]) {
                                            updatedFeatures[feature.key as keyof typeof updatedFeatures] = { operations: [] }
                                          }
                                          const current = updatedFeatures[feature.key as keyof typeof updatedFeatures].operations
                                          if (checked) {
                                            updatedFeatures[feature.key as keyof typeof updatedFeatures].operations = [...current, action]
                                          } else {
                                            updatedFeatures[feature.key as keyof typeof updatedFeatures].operations = current.filter(a => a !== action)
                                          }
                                        }
                                        
                                        console.log(`Updated features for ${feature.key}:`, updatedFeatures[feature.key as keyof typeof updatedFeatures])
                                        setValue('features', updatedFeatures)
                                      }}
                                    />
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* View Permissions */}
            <div className="space-y-4">
              <h3 className="text-xl text-gray-900 border-b border-gray-200 pb-2">View Permissions</h3>
              <div className="border border-gray-200 rounded-lg bg-white">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-lg text-gray-900">Accessible Views</h4>
                  <p className="text-sm text-gray-500">Configure view permissions</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {viewOptions.map((view) => {
                      const currentViews = watch('views') as string[]
                      const isChecked = currentViews?.includes(view.key)
                      
                      return (
                        <div key={view.key} className="flex items-center space-x-3">
                          <Checkbox
                            id={`view-${view.key}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const current = currentViews || []
                              if (checked) {
                                setValue('views', [...current, view.key])
                              } else {
                                setValue('views', current.filter(v => v !== view.key))
                              }
                            }}
                          />
                          <Label htmlFor={`view-${view.key}`} className="text-base text-gray-700">
                            {view.label}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <LoadingButton 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border border-gray-200 rounded-full px-6 py-2"
              >
                Cancel
              </LoadingButton>
              <LoadingButton 
                type="submit" 
                loading={mode === "create" ? operationLoading.create : operationLoading.update}
                loadingText={mode === "create" ? "Creating..." : "Updating..."}
                className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white border-0 rounded-full px-6 py-2 font-light"
              >
                {mode === "create" ? "Create Role" : "Update Role"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
