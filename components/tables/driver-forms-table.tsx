
"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchDriverForms, deleteDriverForm } from "@/lib/store/slices/driverFormSlice"
import { fetchUsers, selectUserById } from "@/lib/store/slices/usersSlice"
import { generateDriverFormId } from "@/lib/utils/form-id-generator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import type { DriverForm } from "@/lib/types"

interface DriverFormsTableProps {
  onEdit?: (form: DriverForm) => void
  onView?: (form: DriverForm) => void
}

export function DriverFormsTable({ onEdit, onView }: DriverFormsTableProps) {
  const dispatch = useAppDispatch()
  const { items: driverForms, operationLoading } = useAppSelector((state) => state.driverForm)
  const { items: users } = useAppSelector((state) => state.users)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchDriverForms({}))
    dispatch(fetchUsers({}))
  }, [dispatch])

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await dispatch(deleteDriverForm(id)).unwrap()
      toast.success("Driver form deleted successfully")
      dispatch(fetchDriverForms({}))
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete driver form")
    } finally {
      setDeletingId(null)
    }
  }

  const getDriverInfo = (driverForm: DriverForm) => {
    const driverId = typeof driverForm.driver === 'string' ? driverForm.driver : (driverForm as any).driver_id
    const driverUser = users.find(user => user.id === driverId)
    
    if (driverUser) {
      return {
        name: `${driverUser.first_name} ${driverUser.last_name}`,
        email: driverUser.email
      }
    }
    
    // Fallback to legacy data
    if ((driverForm as any).drivers_driver_fkey) {
      return {
        name: `${(driverForm as any).drivers_driver_fkey.first_name} ${(driverForm as any).drivers_driver_fkey.last_name}`,
        email: (driverForm as any).drivers_driver_fkey.email
      }
    }
    
    return {
      name: 'Unknown Driver',
      email: null
    }
  }

  if (operationLoading.fetch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Driver Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading driver forms...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Driver Forms ({driverForms.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {driverForms.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm text-gray-500">No driver forms found</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form ID</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driverForms.map((form) => {
                  const driverInfo = getDriverInfo(form)
                  const formId = generateDriverFormId(form.created_at)
                  const productsCount = (form as any).drivers_form_collected_products?.length || 0
                  
                  return (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{formId}</div>
                            <div className="text-xs text-gray-500">#{form.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{driverInfo.name}</div>
                          {driverInfo.email && (
                            <div className="text-xs text-gray-500">{driverInfo.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(form.start_date).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            to {new Date(form.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {productsCount} {productsCount === 1 ? 'Product' : 'Products'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {form.delivered ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <Badge className={form.delivered ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {form.delivered ? 'Delivered' : 'Pending'}
                            </Badge>
                          </div>
                          {form.rejected && (
                            <Badge className="bg-red-100 text-red-800">
                              Rejected
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(form.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(form.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onView && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onView(form)}
                              className="rounded-full"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(form)}
                              className="rounded-full"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          <LoadingButton
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(form.id)}
                            loading={deletingId === form.id}
                            className="rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </LoadingButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}