"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchDriverForms } from "@/lib/store/slices/driverFormSlice"
import { SharedLayout } from "@/components/layout/shared-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, Truck, Calendar, User, CheckCircle, XCircle, Settings, Trash2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { DriverFormDrawer } from "@/components/forms/driver-form-drawer"
import { DriverFormViewDrawer } from "@/components/forms/driver-form-view-drawer"
import { LoadingButton } from "@/components/ui/loading-button"
import type { DriverForm } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"

export default function DriverFormsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { driverForms, operationLoading } = useSelector((state: RootState) => state.driverForm)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<DriverForm | null>(null)
  const [viewingForm, setViewingForm] = useState<DriverForm | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    dispatch(fetchDriverForms({}))
  }, [dispatch])

  const handleAddForm = () => {
    setEditingForm(null)
    setIsDrawerOpen(true)
  }

  const handleEditForm = (form: DriverForm) => {
    setEditingForm(form)
    setIsDrawerOpen(true)
  }

  const handleViewForm = (form: DriverForm) => {
    setViewingForm(form)
    setIsViewDrawerOpen(true)
  }

  const getStatusBadge = (form: DriverForm) => {
    if (form.delivered) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Delivered
        </Badge>
      )
    } else if (form.rejected) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Pending
        </Badge>
      )
    }
  }

  const columns = [
    {
      accessorKey: "id",
      header: "Form ID",
      cell: ({ row }: any) => {
        const form = row.original as DriverForm
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">#{form.id.slice(0, 8)}</p>
              <p className="text-muted-foreground text-xs">Driver Form</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "driver",
      header: "Driver",
      cell: ({ row }: any) => {
        const form = row.original as DriverForm
        return (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {form.drivers_driver_fkey ? 
                `${form.drivers_driver_fkey.first_name} ${form.drivers_driver_fkey.last_name}` :
                'N/A'
              }
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "start_date",
      header: "Collection Period",
      cell: ({ row }: any) => {
        const form = row.original as DriverForm
        return (
          <div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {new Date(form.start_date).toLocaleDateString()}
            </div>
            <div className="text-muted-foreground text-sm">
              to {new Date(form.end_date).toLocaleDateString()}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "collected_products",
      header: "Products",
      cell: ({ row }: any) => {
        const form = row.original as DriverForm
        return (
          <span className="text-sm">{form.collected_products?.length || 0} products</span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const form = row.original as DriverForm
        return getStatusBadge(form)
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const form = row.original as DriverForm
        return (
          <span className="text-sm">
            {new Date(form.created_at).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const form = row.original as DriverForm
        return (
          <div className="flex space-x-2">
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewForm(form)}
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditForm(form)}
            >
              <Settings className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  const isLoading = operationLoading.fetch

  return (
    <SharedLayout title="Driver Forms" subtitle="Manage driver collection forms and deliveries">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Driver Forms</h1>
            <p className="text-muted-foreground">Manage driver collection forms and deliveries</p>
          </div>
          <LoadingButton onClick={handleAddForm} loading={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </LoadingButton>
        </div>

        <Card>
         
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading driver forms...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile: list view */}
                <div className="md:hidden">
                  <div className="space-y-3">
                    {(driverForms || []).map((form) => (
                      <div key={form.id} className="p-4 border rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Truck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">#{form.id.slice(0, 8)}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(form.start_date).toLocaleDateString()} — {new Date(form.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(form)}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-zinc-600">
                            <User className="h-4 w-4" />
                            <span>
                              {form.drivers_driver_fkey 
                                ? `${form.drivers_driver_fkey.first_name} ${form.drivers_driver_fkey.last_name}`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-600">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(form.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewForm(form)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditForm(form)}>
                            <Settings className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tablet: card grid */}
                <div className="hidden md:grid lg:hidden grid-cols-1 md:grid-cols-2 gap-4">
                  {(driverForms || []).map((form) => (
                    <div key={form.id} className="p-4 border rounded-xl shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">#{form.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(form.start_date).toLocaleDateString()} — {new Date(form.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(form)}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-zinc-600">
                          <User className="h-4 w-4" />
                          <span>
                            {form.drivers_driver_fkey 
                              ? `${form.drivers_driver_fkey.first_name} ${form.drivers_driver_fkey.last_name}`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(form.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewForm(form)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditForm(form)}>
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden lg:block">
                  <DataTable
                    columns={columns}
                    data={driverForms || []}
                    searchKey="id"
                    searchPlaceholder="Search driver forms by ID..."
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <DriverFormDrawer 
          open={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen} 
          driverForm={editingForm ?? undefined} 
          mode={editingForm ? "edit" : "create"}
          onSuccess={() => {
            setIsDrawerOpen(false)
            setEditingForm(null)
          }}
        />
        <DriverFormViewDrawer
          open={isViewDrawerOpen}
          onOpenChange={setIsViewDrawerOpen}
          driverForm={viewingForm}
          onEdit={(form) => {
            setEditingForm(form)
            setIsDrawerOpen(true)
            setIsViewDrawerOpen(false)
          }}
        />
      </div>
    </SharedLayout>
  )
}