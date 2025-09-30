"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createISTControlFormAction, updateISTControlFormAction, fetchISTControlForms } from "@/lib/store/slices/istControlFormSlice"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"
import type { ISTControlForm } from "@/lib/api/data-capture-forms"

interface ISTControlFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form?: ISTControlForm | null
  mode: "create" | "edit"
}

interface ISTControlFormData {
  item_code: string
  item_description: string
  issued_by: string
  received_by: string
  approver: string
  item_trans: string
  from_warehouse: string
  to_warehouse: string
}

const schema = yup.object({
  item_code: yup.string().required("Item code is required"),
  item_description: yup.string().required("Item description is required"),
  issued_by: yup.string().required("Issued by is required"),
  received_by: yup.string().required("Received by is required"),
  approver: yup.string().required("Approver is required"),
  item_trans: yup.string().required("Item transaction is required"),
  from_warehouse: yup.string().required("From warehouse is required"),
  to_warehouse: yup.string().required("To warehouse is required"),
})

export function ISTControlFormDrawer({ open, onOpenChange, form, mode }: ISTControlFormDrawerProps) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.istControlForms)
  
  // State for searchable select options
  const [users, setUsers] = useState<SearchableSelectOption[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ISTControlFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      item_code: "",
      item_description: "",
      issued_by: "",
      received_by: "",
      approver: "",
      item_trans: "",
      from_warehouse: "",
      to_warehouse: "",
    },
  })

  const onSubmit = async (data: ISTControlFormData) => {
    try {
      console.log('Form data submitted:', data)

      if (mode === "create") {
        await dispatch(createISTControlFormAction(data)).unwrap()
        toast.success('IST Control Form created successfully')
        // Refresh the data to get complete relationship information
        setTimeout(() => {
          dispatch(fetchISTControlForms())
        }, 100)
      } else if (form) {
        await dispatch(updateISTControlFormAction({
          ...data,
          id: form.id,
          created_at: form.created_at,
          updated_at: form.updated_at,
        })).unwrap()
        toast.success('IST Control Form updated successfully')
        // Refresh the data to get complete relationship information
        setTimeout(() => {
          dispatch(fetchISTControlForms())
        }, 100)
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast.error(error || (mode === "create" ? 'Failed to create IST control form' : 'Failed to update IST control form'))
    }
  }

  useEffect(() => {
    if (open && form && mode === "edit") {
      reset({
        item_code: form.item_code || "",
        item_description: form.item_description || "",
        issued_by: form.issued_by || "",
        received_by: form.received_by || "",
        approver: form.approver || "",
        item_trans: form.item_trans || "",
        from_warehouse: form.from_warehouse || "",
        to_warehouse: form.to_warehouse || "",
      })
    } else if (open && mode === "create") {
      reset({
        item_code: "",
        item_description: "",
        issued_by: "",
        received_by: "",
        approver: "",
        item_trans: "",
        from_warehouse: "",
        to_warehouse: "",
      })
    }
  }, [open, form, mode, reset])

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingUsers(true)
      const response = await usersApi.getUsers()
      
      const userOptions: SearchableSelectOption[] = response.data?.map((user) => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
        description: `${user.department} • ${user.email}`,
        metadata: {
          department: user.department,
          role: user.role_id
        }
      })) || []
      
      setUsers(userOptions)
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Failed to load form data')
    } finally {
      setLoadingUsers(false)
    }
  }

  // Handle user search
  const handleUserSearch = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      return
    }

    setLoadingUsers(true)
    try {
      const response = await usersApi.getUsers({
        filters: { search: searchTerm },
        pagination: { page: 1, limit: 20 }
      })
      
      const userOptions: SearchableSelectOption[] = response.data?.map((user) => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
        description: `${user.department} • ${user.email}`,
        metadata: {
          department: user.department,
          role: user.role_id
        }
      })) || []
      
      setUsers(userOptions)
    } catch (error) {
      console.error('Error searching users:', error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  // Load initial data when drawer opens
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create IST Control Form" : "Edit IST Control Form"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create" 
              ? "Create a new Item Stock Transfer control form to track item movements between warehouses."
              : "Update the existing IST control form with new information."
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 p-6 bg-white">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Item Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-light text-gray-900 border-b pb-2">Item Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_code">Item Code *</Label>
                  <Controller
                    name="item_code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="item_code"
                        placeholder="Enter item code"
                        className={`rounded-full border-gray-200 ${errors.item_code ? "border-red-500" : ""}`}
                      />
                    )}
                  />
                  {errors.item_code && <p className="text-sm text-red-500">{errors.item_code.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item_trans">Item Transaction *</Label>
                  <Controller
                    name="item_trans"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="item_trans"
                        placeholder="Enter item transaction"
                        className={`rounded-full border-gray-200 ${errors.item_trans ? "border-red-500" : ""}`}
                      />
                    )}
                  />
                  {errors.item_trans && <p className="text-sm text-red-500">{errors.item_trans.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item_description">Item Description *</Label>
                <Controller
                  name="item_description"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="item_description"
                      placeholder="Enter item description"
                      className={`rounded-full border-gray-200 ${errors.item_description ? "border-red-500" : ""}`}
                    />
                  )}
                />
                {errors.item_description && <p className="text-sm text-red-500">{errors.item_description.message}</p>}
              </div>
            </div>

            {/* Warehouse Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-light text-gray-900 border-b pb-2">Warehouse Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from_warehouse">From Warehouse *</Label>
                  <Controller
                    name="from_warehouse"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="from_warehouse"
                        placeholder="Enter source warehouse"
                        className={`rounded-full border-gray-200 ${errors.from_warehouse ? "border-red-500" : ""}`}
                      />
                    )}
                  />
                  {errors.from_warehouse && <p className="text-sm text-red-500">{errors.from_warehouse.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to_warehouse">To Warehouse *</Label>
                  <Controller
                    name="to_warehouse"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="to_warehouse"
                        placeholder="Enter destination warehouse"
                        className={`rounded-full border-gray-200 ${errors.to_warehouse ? "border-red-500" : ""}`}
                      />
                    )}
                  />
                  {errors.to_warehouse && <p className="text-sm text-red-500">{errors.to_warehouse.message}</p>}
                </div>
              </div>
            </div>

            {/* Personnel Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-light text-gray-900 border-b pb-2">Personnel Information</h3>
              
              <div className="space-y-4">
                {/* Issued By and Received By in a row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issued_by">Issued By *</Label>
                    <Controller
                      name="issued_by"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={users}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select user who issued the item"
                          searchPlaceholder="Search users..."
                          emptyMessage="No users found"
                          loading={loadingUsers}
                          onSearch={handleUserSearch}
                          className="w-full rounded-full border-gray-200"
                        />
                      )}
                    />
                    {errors.issued_by && <p className="text-sm text-red-500">{errors.issued_by.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="received_by">Received By *</Label>
                    <Controller
                      name="received_by"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={users}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select user who received the item"
                          searchPlaceholder="Search users..."
                          emptyMessage="No users found"
                          loading={loadingUsers}
                          onSearch={handleUserSearch}
                          className="w-full rounded-full border-gray-200"
                        />
                      )}
                    />
                    {errors.received_by && <p className="text-sm text-red-500">{errors.received_by.message}</p>}
                  </div>
                </div>

                {/* Approver in full width */}
                <div className="space-y-2">
                  <Label htmlFor="approver">Approver *</Label>
                  <Controller
                    name="approver"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={users}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select approver"
                        searchPlaceholder="Search users..."
                        emptyMessage="No users found"
                        loading={loadingUsers}
                        onSearch={handleUserSearch}
                        className="w-full rounded-full border-gray-200"
                      />
                    )}
                  />
                  {errors.approver && <p className="text-sm text-red-500">{errors.approver.message}</p>}
                </div>
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
                {mode === "create" ? "Create IST Form" : "Update IST Form"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
