"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Shield } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { rolesApi } from "@/lib/api/roles"
import { usersApi, type CreateUserRequest, type UpdateUserRequest } from "@/lib/api/users"
import type { UserRole } from "@/lib/types/roles"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createUser as createUserThunk, updateUser as updateUserThunk, fetchUsers } from "@/lib/store/slices/usersSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import { User as UserType } from "@/lib/types"

const userSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string()
    .min(6, "Password must be at least 6 characters")
    .when('mode', {
      is: 'create',
      then: (schema) => schema.required("Password is required"),
      otherwise: (schema) => schema.notRequired()
    }),
  role_id: yup.string().required("Role is required"),
  department: yup.string().required("Department is required"),
})

type UserFormData = {
  first_name: string
  last_name: string
  email: string
  password?: string
  role_id: string
  department: string
  mode?: 'create' | 'edit'
}

interface UserFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: UserType
  mode: "create" | "edit"
  onSuccess?: () => void
}

export function UserFormDrawer({ open, onOpenChange, user, mode, onSuccess }: UserFormDrawerProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<UserRole[]>([])
  const dispatch = useAppDispatch()

  const { loading: usersLoading } = useAppSelector((state) => state.users)
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema) as any,
    defaultValues: {
      ...(user || {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role_id: "",
        department: "",
        is_active: true,
      }),
      mode: mode
    },
  })

  // Reset form when user or mode changes
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        role_id: user.role_id || "",
        department: user.department || "",
        password: "",
        mode
      })
    } else if (open) {
      reset({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role_id: "",
        department: "",
        mode
      })
    }
  }, [user, open, reset, mode])

  // Fetch roles when drawer opens
  useEffect(() => {
    const run = async () => {
      if (!open) return
      try {
        const res = await rolesApi.getRoles()
        setRoles(res.data)
      } catch (err: any) {
        toast.error("Failed to load roles")
      }
    }
    run()
  }, [open])

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      setLoading(true)
      
      if (mode === 'create') {
        const createData: CreateUserRequest = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password!,
          role_id: data.role_id,
          department: data.department,
        }
        
        await dispatch(createUserThunk(createData)).unwrap()
        toast.success('User created successfully')
      } else if (user) {
        const updateData: UpdateUserRequest = {
          id: user.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          role_id: data.role_id,
          department: data.department,
        }
        
        // Only include password if it was provided
        if (data.password) {
          updateData.password = data.password
        }
        
        await dispatch(updateUserThunk(updateData)).unwrap()
        toast.success('User updated successfully')
      }
      
      onOpenChange(false)
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error saving user:', error)
      
      // Backend error message will be used from the thunk
      const message = error || (mode === "create" ? "Failed to create user" : "Failed to update user")
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            {mode === "create" ? "Add New User" : `Edit User: ${user?.first_name} ${user?.last_name}`}
          </SheetTitle>
          <SheetDescription>
            {mode === "create" 
              ? "Create a new user account with the required permissions" 
              : "Update user information and permissions"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Controller
                    name="first_name"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="first_name" 
                        placeholder="Enter first name"
                        {...field}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500">{errors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Controller
                    name="last_name"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="last_name" 
                        placeholder="Enter last name"
                        {...field}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-500">{errors.last_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter email address"
                        {...field}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                {mode === "create" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password
                      <span className="text-muted-foreground text-xs ml-1">(min 6 characters)</span>
                    </Label>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="Enter password"
                          {...field}
                          disabled={isSubmitting}
                          autoComplete="new-password"
                        />
                      )}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>
                )}
                {mode === "edit" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Change Password
                      <span className="text-muted-foreground text-xs ml-1">(leave blank to keep current)</span>
                    </Label>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="Enter new password"
                          {...field}
                          disabled={isSubmitting}
                          autoComplete="new-password"
                        />
                      )}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role & Department */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role & Department
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Controller
                    name="role_id"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.role_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role_id && (
                    <p className="text-sm text-red-500">{errors.role_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Production">Production</SelectItem>
                          <SelectItem value="Quality">Quality</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.department && (
                    <p className="text-sm text-red-500">{errors.department.message}</p>
                  )}
                </div>
              </div>
              
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <LoadingButton 
              type="submit" 
              loading={isSubmitting}
            >
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </LoadingButton>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
