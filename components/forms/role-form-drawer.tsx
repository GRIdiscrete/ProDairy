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
  }).default({
    user: { operations: [] },
    role: { operations: [] },
    machine_item: { operations: [] },
    silo_item: { operations: [] },
    supplier: { operations: [] },
    process: { operations: [] },
    devices: { operations: [] },
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
  { key: "user", label: "User Management" },
  { key: "role", label: "Role Management" },
  { key: "machine_item", label: "Machine Management" },
  { key: "silo_item", label: "Silo Management" },
  { key: "supplier", label: "Supplier Management" },
  { key: "process", label: "Process Management" },
  { key: "devices", label: "Device Management" },
]

const actionOptions = ["create", "read", "update", "delete"]

const viewOptions = [
  { key: "dashboard", label: "Dashboard" },
  { key: "settings", label: "Settings" },
  { key: "user_tab", label: "User Tab" },
  { key: "role_tab", label: "Role Tab" },
  { key: "machine_tab", label: "Machine Tab" },
  { key: "silo_tab", label: "Silo Tab" },
  { key: "supplier_tab", label: "Supplier Tab" },
  { key: "process_tab", label: "Process Tab" },
  { key: "devices_tab", label: "Devices Tab" },
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
        user: { operations: [] },
        role: { operations: [] },
        machine_item: { operations: [] },
        silo_item: { operations: [] },
        supplier: { operations: [] },
        process: { operations: [] },
        devices: { operations: [] },
      },
      views: [],
    },
  })

  const onSubmit = async (data: RoleFormData) => {
    try {
      console.log('Form data submitted:', data)
      
      // Clean and transform the data to ensure proper types
      const cleanedData = {
        role_name: data.role_name?.trim() || '',
        features: {
          user: { operations: (data.features?.user?.operations?.filter(Boolean) || []) as string[] },
          role: { operations: (data.features?.role?.operations?.filter(Boolean) || []) as string[] },
          machine_item: { operations: (data.features?.machine_item?.operations?.filter(Boolean) || []) as string[] },
          silo_item: { operations: (data.features?.silo_item?.operations?.filter(Boolean) || []) as string[] },
          supplier: { operations: (data.features?.supplier?.operations?.filter(Boolean) || []) as string[] },
          process: { operations: (data.features?.process?.operations?.filter(Boolean) || []) as string[] },
          devices: { operations: (data.features?.devices?.operations?.filter(Boolean) || []) as string[] },
        },
        views: (data.views?.filter(Boolean) || []) as string[],
      }

      console.log('Cleaned data:', cleanedData)

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
    if (open && role && mode === "edit") {
      reset({
        role_name: role.role_name || "",
        features: {
          user: { operations: role.user_operations || [] },
          role: { operations: role.role_operations || [] },
          machine_item: { operations: role.machine_item_operations || [] },
          silo_item: { operations: role.silo_item_operations || [] },
          supplier: { operations: role.supplier_operations || [] },
          process: { operations: role.process_operations || [] },
          devices: { operations: role.devices_operations || [] },
        },
        views: role.views || [],
      })
    } else if (open && mode === "create") {
      reset({
        role_name: "",
        features: {
          user: { operations: [] },
          role: { operations: [] },
          machine_item: { operations: [] },
          silo_item: { operations: [] },
          supplier: { operations: [] },
          process: { operations: [] },
          devices: { operations: [] },
        },
        views: [],
      })
    }
  }, [open, role, mode, reset])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New Role" : "Edit Role"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new user role with permissions" : "Update role permissions"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="space-y-2">
                <Label htmlFor="role_name">Role Name</Label>
                <Controller
                  name="role_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="role_name"
                      {...field}
                      placeholder="Enter role name"
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
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Permission Matrix</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <span>Feature Permissions</span>
                    <span className="ml-2 text-sm text-gray-500">(Feature permissions)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Feature</th>
                          {actionOptions.map((action) => (
                            <th key={action} className="text-center p-2 font-medium min-w-[80px] capitalize">
                              {action}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {featureOptions.map((feature, index) => (
                          <tr key={feature.key} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="p-2 font-medium">{feature.label}</td>
                            {actionOptions.map((action) => {
                              const allFeatures = watch('features')
                              const currentFeatures = allFeatures?.[feature.key as keyof typeof allFeatures]?.operations || []
                              const isChecked = currentFeatures.includes(action)
                              
                              return (
                                <td key={action} className="text-center p-2">
                                  <div className="flex items-center justify-center">
                                    <Checkbox
                                      id={`${feature.key}-${action}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        const updatedFeatures = { ...allFeatures }
                                        if (!updatedFeatures[feature.key as keyof typeof updatedFeatures]) {
                                          updatedFeatures[feature.key as keyof typeof updatedFeatures] = { operations: [] }
                                        }
                                        const current = updatedFeatures[feature.key as keyof typeof updatedFeatures].operations
                                        if (checked) {
                                          updatedFeatures[feature.key as keyof typeof updatedFeatures].operations = [...current, action]
                                        } else {
                                          updatedFeatures[feature.key as keyof typeof updatedFeatures].operations = current.filter(a => a !== action)
                                        }
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
                </CardContent>
              </Card>
            </div>

            {/* View Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">View Permissions</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <span>Accessible Views</span>
                    <span className="ml-2 text-sm text-gray-500">(View permissions)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {viewOptions.map((view) => {
                      const currentViews = watch('views') as string[]
                      const isChecked = currentViews?.includes(view.key)
                      
                      return (
                        <div key={view.key} className="flex items-center space-x-2">
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
                          <Label htmlFor={`view-${view.key}`} className="text-sm">
                            {view.label}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
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
                {mode === "create" ? "Create Role" : "Update Role"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
