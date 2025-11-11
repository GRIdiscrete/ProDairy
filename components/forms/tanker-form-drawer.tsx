"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createTankerAction, updateTankerAction } from "@/lib/store/slices/tankerSlice"
import { Tanker } from "@/lib/api/tanker"
import { usersApi } from "@/lib/api/users"
import { SearchableSelect } from "@/components/ui/searchable-select"

const schema = yup.object({
  driver_id: yup.string().required("Driver is required"),
  reg_number: yup.string().required("Reg number is required"),
  capacity: yup.number().typeError("Capacity must be a number").required("Capacity is required"),
  condition: yup.string().required("Condition is required"),
  age: yup.number().typeError("Age must be a number").required("Age is required"),
  mileage: yup.number().typeError("Mileage must be a number").required("Mileage is required"),
  compartments: yup.number().typeError("Compartments must be a number").required("Compartments is required"),
})

type FormData = yup.InferType<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  tanker?: Tanker | null
  mode: "create" | "edit"
}

export function TankerFormDrawer({ open, onOpenChange, tanker, mode }: Props) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((s) => (s as any).tankers)

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { driver_id: "", reg_number: "", capacity: undefined, condition: "", age: undefined, mileage: undefined, compartments: undefined }
  })

  const [loadingUsers, setLoadingUsers] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true)
      try {
        const res = await usersApi.getUsers()
        setUsers(Array.isArray(res?.data) ? res.data : [])
      } catch (_) { setUsers([]) } finally { setLoadingUsers(false) }
    }
    if (open) loadUsers()
  }, [open])

  useEffect(() => {
    if (open) {
      if (mode === "edit" && tanker) {
        reset({
          driver_id: tanker.driver_id,
          reg_number: tanker.reg_number,
          capacity: tanker.capacity,
          condition: tanker.condition,
          age: tanker.age,
          mileage: tanker.mileage,
          compartments: tanker.compartments,
        })
      } else {
        reset({ driver_id: "", reg_number: "", capacity: undefined, condition: "", age: undefined, mileage: undefined, compartments: undefined })
      }
    }
  }, [open, mode, tanker, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "edit" && tanker) {
        await dispatch(updateTankerAction({ id: tanker.id, ...data })).unwrap()
      } else {
        await dispatch(createTankerAction(data)).unwrap()
      }
      onOpenChange(false)
    } catch (_) {}
  }

  const handleUserSearch = async (query: string) => {
    if (!query.trim()) return []
    try {
      const res = await usersApi.getUsers({ filters: { search: query } })
      return (res?.data || []).map((u: any) => ({
        value: u.id,
        label: `${u.first_name} ${u.last_name}`.trim() || u.email,
        description: `${u.department} • ${u.email}`,
      }))
    } catch (_) { return [] }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">{mode === "edit" ? "Edit Tanker" : "Create Tanker"}</SheetTitle>
          <SheetDescription className="text-sm font-light">Enter tanker details and assign driver</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Number *</Label>
                <Controller name="reg_number" control={control} render={({ field }) => (
                  <Input placeholder="e.g., ABC123XYZ" {...field} />
                )} />
                {errors.reg_number && <p className="text-sm text-red-500">{errors.reg_number.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Capacity (L) *</Label>
                <Controller name="capacity" control={control} render={({ field }) => (
                  <Input type="number" step="0.1" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                )} />
                {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Condition *</Label>
                <Controller name="condition" control={control} render={({ field }) => (
                  <Input placeholder="e.g., Good" {...field} />
                )} />
                {errors.condition && <p className="text-sm text-red-500">{errors.condition.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Age (years) *</Label>
                <Controller name="age" control={control} render={({ field }) => (
                  <Input type="number" step="0.1" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                )} />
                {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Mileage (km) *</Label>
                <Controller name="mileage" control={control} render={({ field }) => (
                  <Input type="number" step="0.1" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                )} />
                {errors.mileage && <p className="text-sm text-red-500">{errors.mileage.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Compartments *</Label>
                <Controller name="compartments" control={control} render={({ field }) => (
                  <Input type="number" step="1" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                )} />
                {errors.compartments && <p className="text-sm text-red-500">{errors.compartments.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Driver *</Label>
                <Controller name="driver_id" control={control} render={({ field }) => (
                  <SearchableSelect
                    options={users.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}`.trim() || u.email, description: `${u.department} • ${u.email}` }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    onSearch={handleUserSearch}
                    placeholder="Search and select driver"
                    loading={loadingUsers}
                  />
                )} />
                {errors.driver_id && <p className="text-sm text-red-500">{errors.driver_id.message}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <LoadingButton type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</LoadingButton>
              <LoadingButton type="submit" loading={mode === "create" ? operationLoading.create : operationLoading.update} className="rounded-full">
                {mode === "create" ? "Create Tanker" : "Update Tanker"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}


