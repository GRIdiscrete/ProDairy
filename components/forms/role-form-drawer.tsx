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
import { UserRole, UserRoleResponse, convertApiResponseToUserRole } from "@/lib/types/roles"

const roleSchema = yup.object({
  role_name: yup.string().required("Role name is required"),
  features: yup.object({
    // All permissions now use nested operations structure
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
    
    // New permissions - now also use nested operations structure
    raw_product_collection: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    raw_milk_intake: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    raw_milk_lab_test: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    before_and_after_autoclave_lab_test: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    pasteurizing: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    filmatic_operation: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    steri_process_operation: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    incubation: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    incubation_lab_test: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    dispatch: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
    production_plan: yup.object({
      operations: yup.array().of(yup.string()).default([]),
    }).default({ operations: [] }),
  }).default({
    // All permissions use nested operations structure
    user: { operations: [] },
    role: { operations: [] },
    machine_item: { operations: [] },
    silo_item: { operations: [] },
    supplier: { operations: [] },
    process: { operations: [] },
    devices: { operations: [] },
    raw_product_collection: { operations: [] },
    raw_milk_intake: { operations: [] },
    raw_milk_lab_test: { operations: [] },
    before_and_after_autoclave_lab_test: { operations: [] },
    pasteurizing: { operations: [] },
    filmatic_operation: { operations: [] },
    steri_process_operation: { operations: [] },
    incubation: { operations: [] },
    incubation_lab_test: { operations: [] },
    dispatch: { operations: [] },
    production_plan: { operations: [] },
  }),
  views: yup.array().of(yup.string()).default([]),
})

type RoleFormData = yup.InferType<typeof roleSchema>

interface RoleFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: UserRole | UserRoleResponse | null
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

// Helper function to check if all operations are selected for a feature
const areAllOperationsSelected = (featureKey: string, allFeatures: any) => {
  const featureOperations = allFeatures?.[featureKey]?.operations || []
  return actionOptions.every(action => featureOperations.includes(action))
}

// Helper function to check if any operations are selected for a feature
const areAnyOperationsSelected = (featureKey: string, allFeatures: any) => {
  const featureOperations = allFeatures?.[featureKey]?.operations || []
  return featureOperations.length > 0
}

// Helper function to toggle all operations for a feature
const toggleAllOperations = (featureKey: string, allFeatures: any, setValue: any) => {
  const featureOperations = allFeatures?.[featureKey]?.operations || []
  const allSelected = areAllOperationsSelected(featureKey, allFeatures)
  
  const updatedFeatures = { ...allFeatures }
  if (!updatedFeatures[featureKey]) {
    updatedFeatures[featureKey] = { operations: [] }
  }
  
  if (allSelected) {
    // Unselect all operations
    updatedFeatures[featureKey].operations = []
  } else {
    // Select all operations
    updatedFeatures[featureKey].operations = [...actionOptions]
  }
  
  setValue('features', updatedFeatures)
}

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

  // Helper function to detect if role is in API response format (flat) or internal format (nested)
  const isApiResponseFormat = (role: UserRole | UserRoleResponse): role is UserRoleResponse => {
    return 'user_operations' in role && !('features' in role)
  }

  // Convert API response to internal format if needed
  const normalizedRole = role && isApiResponseFormat(role) ? convertApiResponseToUserRole(role) : role

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
        // All permissions now use nested operations structure
        user: { operations: [] },
        role: { operations: [] },
        machine_item: { operations: [] },
        silo_item: { operations: [] },
        supplier: { operations: [] },
        process: { operations: [] },
        devices: { operations: [] },
        raw_product_collection: { operations: [] },
        raw_milk_intake: { operations: [] },
        raw_milk_lab_test: { operations: [] },
        before_and_after_autoclave_lab_test: { operations: [] },
        pasteurizing: { operations: [] },
        filmatic_operation: { operations: [] },
        steri_process_operation: { operations: [] },
        incubation: { operations: [] },
        incubation_lab_test: { operations: [] },
        dispatch: { operations: [] },
        production_plan: { operations: [] },
      },
      views: [],
    },
  })

  const onSubmit = async (data: RoleFormData) => {
    try {
      
      // Clean and transform the data to ensure proper types with nested features structure
      const cleanedData = {
        role_name: data.role_name?.trim() || '',
        features: {
          // Original permissions
          user: {
            operations: (data.features?.user?.operations?.filter(Boolean) || []) as string[]
          },
          role: {
            operations: (data.features?.role?.operations?.filter(Boolean) || []) as string[]
          },
          machine_item: {
            operations: (data.features?.machine_item?.operations?.filter(Boolean) || []) as string[]
          },
          silo_item: {
            operations: (data.features?.silo_item?.operations?.filter(Boolean) || []) as string[]
          },
          supplier: {
            operations: (data.features?.supplier?.operations?.filter(Boolean) || []) as string[]
          },
          process: {
            operations: (data.features?.process?.operations?.filter(Boolean) || []) as string[]
          },
          devices: {
            operations: (data.features?.devices?.operations?.filter(Boolean) || []) as string[]
          },
          
          // New permissions - now properly nested under operations
          raw_product_collection: {
            operations: (data.features?.raw_product_collection?.operations?.filter(Boolean) || []) as string[]
          },
          raw_milk_intake: {
            operations: (data.features?.raw_milk_intake?.operations?.filter(Boolean) || []) as string[]
          },
          raw_milk_lab_test: {
            operations: (data.features?.raw_milk_lab_test?.operations?.filter(Boolean) || []) as string[]
          },
          before_and_after_autoclave_lab_test: {
            operations: (data.features?.before_and_after_autoclave_lab_test?.operations?.filter(Boolean) || []) as string[]
          },
          pasteurizing: {
            operations: (data.features?.pasteurizing?.operations?.filter(Boolean) || []) as string[]
          },
          filmatic_operation: {
            operations: (data.features?.filmatic_operation?.operations?.filter(Boolean) || []) as string[]
          },
          steri_process_operation: {
            operations: (data.features?.steri_process_operation?.operations?.filter(Boolean) || []) as string[]
          },
          incubation: {
            operations: (data.features?.incubation?.operations?.filter(Boolean) || []) as string[]
          },
          incubation_lab_test: {
            operations: (data.features?.incubation_lab_test?.operations?.filter(Boolean) || []) as string[]
          },
          dispatch: {
            operations: (data.features?.dispatch?.operations?.filter(Boolean) || []) as string[]
          },
          production_plan: {
            operations: (data.features?.production_plan?.operations?.filter(Boolean) || []) as string[]
          }
        },
        views: (data.views?.filter(Boolean) || []) as string[],
      }


      if (mode === "create") {
        await dispatch(createRole(cleanedData)).unwrap()
        toast.success('Role created successfully')
      } else if (normalizedRole) {
        await dispatch(updateRole({
          ...cleanedData,
          id: normalizedRole.id,
          updated_at: normalizedRole.updated_at,
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
    if (open && normalizedRole && mode === "edit") {
      reset({
        role_name: normalizedRole.role_name || "",
        features: {
          // All permissions now use nested operations structure
          user: { operations: normalizedRole.features?.user?.operations || [] },
          role: { operations: normalizedRole.features?.role?.operations || [] },
          machine_item: { operations: normalizedRole.features?.machine_item?.operations || [] },
          silo_item: { operations: normalizedRole.features?.silo_item?.operations || [] },
          supplier: { operations: normalizedRole.features?.supplier?.operations || [] },
          process: { operations: normalizedRole.features?.process?.operations || [] },
          devices: { operations: normalizedRole.features?.devices?.operations || [] },
          raw_product_collection: { operations: normalizedRole.features?.raw_product_collection?.operations || [] },
          raw_milk_intake: { operations: normalizedRole.features?.raw_milk_intake?.operations || [] },
          raw_milk_lab_test: { operations: normalizedRole.features?.raw_milk_lab_test?.operations || [] },
          before_and_after_autoclave_lab_test: { operations: normalizedRole.features?.before_and_after_autoclave_lab_test?.operations || [] },
          pasteurizing: { operations: normalizedRole.features?.pasteurizing?.operations || [] },
          filmatic_operation: { operations: normalizedRole.features?.filmatic_operation?.operations || [] },
          steri_process_operation: { operations: normalizedRole.features?.steri_process_operation?.operations || [] },
          incubation: { operations: normalizedRole.features?.incubation?.operations || [] },
          incubation_lab_test: { operations: normalizedRole.features?.incubation_lab_test?.operations || [] },
          dispatch: { operations: normalizedRole.features?.dispatch?.operations || [] },
          production_plan: { operations: normalizedRole.features?.production_plan?.operations || [] },
        },
        views: normalizedRole.views || [],
      })
    } else if (open && mode === "create") {
      reset({
        role_name: "",
        features: {
          // All permissions now use nested operations structure
          user: { operations: [] },
          role: { operations: [] },
          machine_item: { operations: [] },
          silo_item: { operations: [] },
          supplier: { operations: [] },
          process: { operations: [] },
          devices: { operations: [] },
          raw_product_collection: { operations: [] },
          raw_milk_intake: { operations: [] },
          raw_milk_lab_test: { operations: [] },
          before_and_after_autoclave_lab_test: { operations: [] },
          pasteurizing: { operations: [] },
          filmatic_operation: { operations: [] },
          steri_process_operation: { operations: [] },
          incubation: { operations: [] },
          incubation_lab_test: { operations: [] },
          dispatch: { operations: [] },
          production_plan: { operations: [] },
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
                          <th className="text-left p-3 text-base text-gray-700">
                            <div className="flex items-center space-x-2">
                              <span>Feature</span>
                              <Checkbox
                                id="select-all-features"
                                checked={(() => {
                                  const allFeatureKeys = [
                                    'user', 'role', 'machine_item', 'silo_item', 'supplier', 'process', 'devices',
                                    'raw_product_collection', 'raw_milk_intake', 'raw_milk_lab_test', 
                                    'before_and_after_autoclave_lab_test', 'pasteurizing', 'filmatic_operation', 
                                    'steri_process_operation', 'incubation', 'incubation_lab_test', 'dispatch', 'production_plan'
                                  ]
                                  return allFeatureKeys.every(featureKey => areAllOperationsSelected(featureKey, watch('features')))
                                })()}
                                onCheckedChange={(checked) => {
                                  const updatedFeatures = { ...watch('features') }
                                  // Include ALL features in the select all functionality
                                  const allFeatureKeys = [
                                    'user', 'role', 'machine_item', 'silo_item', 'supplier', 'process', 'devices',
                                    'raw_product_collection', 'raw_milk_intake', 'raw_milk_lab_test', 
                                    'before_and_after_autoclave_lab_test', 'pasteurizing', 'filmatic_operation', 
                                    'steri_process_operation', 'incubation', 'incubation_lab_test', 'dispatch', 'production_plan'
                                  ]
                                  
                                  allFeatureKeys.forEach(featureKey => {
                                    if (!updatedFeatures[featureKey]) {
                                      updatedFeatures[featureKey] = { operations: [] }
                                    }
                                    updatedFeatures[featureKey].operations = checked ? [...actionOptions] : []
                                  })
                                  setValue('features', updatedFeatures)
                                }}
                              />
                              <Label htmlFor="select-all-features" className="text-xs text-gray-500">
                                Select All
                              </Label>
                            </div>
                          </th>
                          {actionOptions.map((action) => (
                            <th key={action} className="text-center p-3 text-base text-gray-700 min-w-[80px] capitalize">
                              <div className="flex flex-col items-center space-y-1">
                                <span>{action}</span>
                                <Checkbox
                                  id={`select-all-${action}`}
                                  checked={(() => {
                                    const allFeatureKeys = [
                                      'user', 'role', 'machine_item', 'silo_item', 'supplier', 'process', 'devices',
                                      'raw_product_collection', 'raw_milk_intake', 'raw_milk_lab_test', 
                                      'before_and_after_autoclave_lab_test', 'pasteurizing', 'filmatic_operation', 
                                      'steri_process_operation', 'incubation', 'incubation_lab_test', 'dispatch', 'production_plan'
                                    ]
                                    return allFeatureKeys.every(featureKey => {
                                      const featureOperations = watch('features')?.[featureKey]?.operations || []
                                      return featureOperations.includes(action)
                                    })
                                  })()}
                                  onCheckedChange={(checked) => {
                                    const updatedFeatures = { ...watch('features') }
                                    const allFeatureKeys = [
                                      'user', 'role', 'machine_item', 'silo_item', 'supplier', 'process', 'devices',
                                      'raw_product_collection', 'raw_milk_intake', 'raw_milk_lab_test', 
                                      'before_and_after_autoclave_lab_test', 'pasteurizing', 'filmatic_operation', 
                                      'steri_process_operation', 'incubation', 'incubation_lab_test', 'dispatch', 'production_plan'
                                    ]
                                    
                                    allFeatureKeys.forEach(featureKey => {
                                      if (!updatedFeatures[featureKey]) {
                                        updatedFeatures[featureKey] = { operations: [] }
                                      }
                                      const currentOperations = updatedFeatures[featureKey].operations
                                      if (checked) {
                                        if (!currentOperations.includes(action)) {
                                          updatedFeatures[featureKey].operations = [...currentOperations, action]
                                        }
                                      } else {
                                        updatedFeatures[featureKey].operations = currentOperations.filter(op => op !== action)
                                      }
                                    })
                                    setValue('features', updatedFeatures)
                                  }}
                                />
                                <Label htmlFor={`select-all-${action}`} className="text-xs text-gray-500">
                                  All
                                </Label>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {featureOptions.map((feature, index) => (
                          <tr key={feature.key} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="p-3 text-base text-gray-700">
                              <div className="flex items-center space-x-2">
                                <span>{feature.label}</span>
                                <Checkbox
                                  id={`select-all-${feature.key}`}
                                  checked={areAllOperationsSelected(feature.key, watch('features'))}
                                  onCheckedChange={() => toggleAllOperations(feature.key, watch('features'), setValue)}
                                />
                                <Label htmlFor={`select-all-${feature.key}`} className="text-xs text-gray-500">
                                  All
                                </Label>
                              </div>
                            </td>
                            {actionOptions.map((action) => {
                              const allFeatures = watch('features')
                              // All features now use nested operations structure
                              const currentFeatures = allFeatures?.[feature.key as keyof typeof allFeatures]?.operations || []
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
                                        
                                        // All features now use nested operations structure
                                        if (!updatedFeatures[feature.key as keyof typeof updatedFeatures]) {
                                          updatedFeatures[feature.key as keyof typeof updatedFeatures] = { operations: [] }
                                        }
                                        const current = updatedFeatures[feature.key as keyof typeof updatedFeatures].operations
                                        if (checked) {
                                          updatedFeatures[feature.key as keyof typeof updatedFeatures].operations = [...current, action]
                                        } else {
                                          updatedFeatures[feature.key as keyof typeof updatedFeatures].operations = current.filter(a => a !== action)
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
