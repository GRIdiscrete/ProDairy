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

// Update featureOptions and actionOptions to match backend API keys
const featureOptions = [
  { key: "user_operations", label: "User Management" },
  { key: "role_operations", label: "Role Management" },
  { key: "machine_item_operations", label: "Machine Management" },
  { key: "silo_item_operations", label: "Silo Management" },
  { key: "supplier_operations", label: "Supplier Management" },
  { key: "process_operations", label: "Process Management" },
  { key: "devices_operations", label: "Device Management" },
  { key: "raw_product_collection_operations", label: "Raw Product Collection" },
  { key: "raw_milk_intake_operations", label: "Raw Milk Intake" },
  { key: "raw_milk_lab_test_operations", label: "Raw Milk Lab Test" },
  { key: "before_and_after_autoclave_lab_test_operations", label: "Before & After Autoclave Lab Test" },
  { key: "pasteurizing_operations", label: "Pasteurizing" },
  { key: "filmatic_operation_operations", label: "Filmatic Operation" },
  { key: "steri_process_operation_operations", label: "Steri Process Operation" },
  { key: "incubation_operations", label: "Incubation" },
  { key: "incubation_lab_test_operations", label: "Incubation Lab Test" },
  { key: "dispatch_operations", label: "Dispatch" },
  { key: "production_plan_operations", label: "Production Plan" },
  { key: "bmt_operations", label: "BMT" },
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
  { key: "admin_panel", label: "Admin Panel" },
  { key: "production_dashboard", label: "Production Dashboard" },
  { key: "user_tab", label: "Users Tab" },
  { key: "machine_tab", label: "Machine Tab" },
  { key: "supplier_tab", label: "Supplier Tab" },
  { key: "devices_tab", label: "Devices Tab" },
  { key: "data_capture_module", label: "Data Capture Module" },
  { key: "settings", label: "Settings" },
  { key: "role_tab", label: "Role Tab" },
  { key: "silo_tab", label: "Silo Tab" },
  { key: "process_tab", label: "Process Tab" },
  { key: "driver_ui", label: "Driver UI" },
  { key: "lab_tests", label: "Lab Tests" },
  { key: "bmt", label: "BMT" },
  { key: "general_lab_test", label: "General Lab Test" },
  { key: "cip", label: "CIP" },
  { key: "ist", label: "IST" },
]

const roleSchema = yup.object({
  role_name: yup.string().required("Role name is required"),
  // Each feature is now a flat array of strings (operations)
  ...featureOptions.reduce((acc, feature) => {
    acc[feature.key] = yup.array().of(yup.string()).default([])
    return acc
  }, {} as any),
  views: yup.array().of(yup.string()).default([]),
})

type RoleFormData = yup.InferType<typeof roleSchema>

interface RoleFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: UserRole | UserRoleResponse | null
  mode: "create" | "edit"
}

export function RoleFormDrawer({ open, onOpenChange, role, mode }: RoleFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.roles)

  // Convert API response to flat structure if needed
  const normalizedRole = role
    ? {
        role_name: (role as any).role_name || "",
        ...featureOptions.reduce((acc, feature) => {
          acc[feature.key] = (role as any)[feature.key] || []
          return acc
        }, {} as any),
        views: (role as any).views || [],
      }
    : undefined

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
      ...featureOptions.reduce((acc, feature) => {
        acc[feature.key] = []
        return acc
      }, {} as any),
      views: [],
    },
  })

  // Helper functions for matrix
  const areAllOperationsSelected = (featureKey: string, allFeatures: any) => {
    const ops = allFeatures?.[featureKey] || []
    return actionOptions.every(action => ops.includes(action))
  }
  const toggleAllOperations = (featureKey: string, allFeatures: any, setValue: any) => {
    const ops = allFeatures?.[featureKey] || []
    const allSelected = areAllOperationsSelected(featureKey, allFeatures)
    setValue(featureKey, allSelected ? [] : [...actionOptions])
  }

  const onSubmit = async (data: RoleFormData) => {
    try {
      // Prepare payload for backend
      const payload = {
        role_name: data.role_name?.trim() || "",
        ...featureOptions.reduce((acc, feature) => {
          acc[feature.key] = (data as any)[feature.key]?.filter(Boolean) || []
          return acc
        }, {} as any),
        views: (data.views?.filter(Boolean) || []) as string[],
      }

      if (mode === "create") {
        await dispatch(createRole(payload)).unwrap()
        toast.success('Role created successfully')
      } else if (role) {
        await dispatch(updateRole({
          ...payload,
          id: (role as any).id,
          updated_at: (role as any).updated_at,
        })).unwrap()
        toast.success('Role updated successfully')
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast.error(error || (mode === "create" ? 'Failed to create role' : 'Failed to update role'))
    }
  }

  useEffect(() => {
    if (open && normalizedRole && mode === "edit") {
      reset(normalizedRole)
    } else if (open && mode === "create") {
      reset({
        role_name: "",
        ...featureOptions.reduce((acc, feature) => {
          acc[feature.key] = []
          return acc
        }, {} as any),
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
                            </div>
                          </th>
                          {actionOptions.map((action) => (
                            <th key={action} className="text-center p-3 text-base text-gray-700 min-w-[80px] capitalize">
                              <div className="flex flex-col items-center space-y-1">
                                <span>{action}</span>
                              </div>
                            </th>
                          ))}
                          <th className="text-center p-3 text-base text-gray-700 min-w-[80px]">All</th>
                        </tr>
                      </thead>
                      <tbody>
                        {featureOptions.map((feature, index) => (
                          <tr key={feature.key} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="p-3 text-base text-gray-700">
                              <span>{feature.label}</span>
                            </td>
                            {actionOptions.map((action) => {
                              const ops = watch(feature.key) || []
                              const isChecked = ops.includes(action)
                              return (
                                <td key={action} className="text-center p-3">
                                  <div className="flex items-center justify-center">
                                    <Checkbox
                                      id={`${feature.key}-${action}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        const current = watch(feature.key) || []
                                        if (checked) {
                                          setValue(feature.key, [...current, action])
                                        } else {
                                          setValue(feature.key, current.filter((a: string) => a !== action))
                                        }
                                      }}
                                    />
                                  </div>
                                </td>
                              )
                            })}
                            <td className="text-center p-3">
                              <Checkbox
                                id={`select-all-${feature.key}`}
                                checked={areAllOperationsSelected(feature.key, watch())}
                                onCheckedChange={() => toggleAllOperations(feature.key, watch(), setValue)}
                              />
                            </td>
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
                 
                onClick={() => onOpenChange(false)}
                className="border border-gray-200 rounded-full px-6 py-2"
              >
                Cancel
              </LoadingButton>
              <LoadingButton 
                type="submit" 
                loading={mode === "create" ? operationLoading.create : operationLoading.update}
                loadingText={mode === "create" ? "Creating..." : "Updating..."}
                className=" bg-[#006BC4] text-white rounded-full px-6 py-2 font-light"
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
