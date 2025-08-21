"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const roleSchema = yup.object({
  name: yup.string().required("Role name is required"),
  features: yup.object({
    user: yup.array().of(yup.string()),
    role: yup.array().of(yup.string()),
    machine_item: yup.array().of(yup.string()),
    silo_item: yup.array().of(yup.string()),
    supplier: yup.array().of(yup.string()),
    process: yup.array().of(yup.string()),
    devices: yup.array().of(yup.string()),
  }),
  views: yup.array().of(yup.string()),
})

type RoleFormData = yup.InferType<typeof roleSchema>

interface RoleFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: any
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

const actionOptions = ["Create", "Update", "Delete", "View"]

const viewOptions = [
  { key: "admin_panel", label: "Admin Panel" },
  { key: "user_tab", label: "User Tab" },
  { key: "role_tab", label: "Role Tab" },
  { key: "machine_tab", label: "Machine Tab" },
  { key: "silo_tab", label: "Silo Tab" },
  { key: "supplier_tab", label: "Supplier Tab" },
  { key: "process_tab", label: "Process Tab" },
  { key: "devices_tab", label: "Devices Tab" },
]

export function RoleFormDrawer({ open, onOpenChange, role, mode }: RoleFormDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>(role?.features || {})
  const [selectedViews, setSelectedViews] = useState<string[]>(role?.views || [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormData>({
    resolver: yupResolver(roleSchema),
    defaultValues: role || { features: {}, views: [] },
  })

  const onSubmit = async (data: RoleFormData) => {
    setLoading(true)
    try {
      const formData = {
        ...data,
        features: selectedFeatures,
        views: selectedViews,
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(`${mode === "create" ? "Creating" : "Updating"} role:`, formData)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Error saving role:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFeatureChange = (feature: string, action: string, checked: boolean) => {
    setSelectedFeatures((prev) => {
      const current = prev[feature] || []
      if (checked) {
        return { ...prev, [feature]: [...current, action] }
      } else {
        return { ...prev, [feature]: current.filter((a) => a !== action) }
      }
    })
  }

  const handleViewChange = (view: string, checked: boolean) => {
    setSelectedViews((prev) => {
      if (checked) {
        return [...prev, view]
      } else {
        return prev.filter((v) => v !== view)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add New Role" : "Edit Role"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new user role with permissions" : "Update role permissions"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feature Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {featureOptions.map((feature) => (
                  <div key={feature.key} className="space-y-2">
                    <Label className="text-sm font-medium">{feature.label}</Label>
                    <div className="flex flex-wrap gap-4">
                      {actionOptions.map((action) => (
                        <div key={action} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${feature.key}-${action}`}
                            checked={selectedFeatures[feature.key]?.includes(action) || false}
                            onCheckedChange={(checked) => handleFeatureChange(feature.key, action, checked as boolean)}
                          />
                          <Label htmlFor={`${feature.key}-${action}`} className="text-sm">
                            {action}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">View Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {viewOptions.map((view) => (
                    <div key={view.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={view.key}
                        checked={selectedViews.includes(view.key)}
                        onCheckedChange={(checked) => handleViewChange(view.key, checked as boolean)}
                      />
                      <Label htmlFor={view.key} className="text-sm">
                        {view.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : mode === "create" ? "Create Role" : "Update Role"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
