"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, UserCheck, TrendingUp, Eye, Edit, Trash2, Phone, Mail, MapPin, Truck } from "lucide-react"
import { SupplierFormDrawer } from "@/components/forms/supplier-form-drawer"
import { SupplierViewDrawer } from "@/components/forms/supplier-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchSuppliers, deleteSupplier, clearError } from "@/lib/store/slices/supplierSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"

export default function SuppliersPage() {
  const dispatch = useAppDispatch()
  const { suppliers, loading, error, operationLoading } = useAppSelector((state) => state.supplier)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load suppliers on component mount and when filters change
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
    }
    dispatch(fetchSuppliers({ filters: tableFilters }))
  }, [dispatch, tableFilters])
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])
  
  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Selected supplier and mode
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for suppliers
  const filterFields = useMemo(() => [
    {
      key: "first_name",
      label: "First Name",
      type: "text" as const,
      placeholder: "Filter by first name"
    },
    {
      key: "last_name",
      label: "Last Name",
      type: "text" as const,
      placeholder: "Filter by last name"
    },
    {
      key: "email",
      label: "Email",
      type: "text" as const,
      placeholder: "Filter by email"
    },
    {
      key: "phone_number",
      label: "Phone Number",
      type: "text" as const,
      placeholder: "Filter by phone number"
    }
  ], [])

  // Action handlers
  const handleAddSupplier = () => {
    setSelectedSupplier(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditSupplier = (supplier: any) => {
    setSelectedSupplier(supplier)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewSupplier = (supplier: any) => {
    setSelectedSupplier(supplier)
    setViewDrawerOpen(true)
  }

  const handleDeleteSupplier = (supplier: any) => {
    setSelectedSupplier(supplier)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedSupplier) return
    
    try {
      await dispatch(deleteSupplier(selectedSupplier.id)).unwrap()
      toast.success('Supplier deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedSupplier(null)
    } catch (error: any) {
      // Backend error message will be used from the thunk
      toast.error(error || 'Failed to delete supplier')
    }
  }

  // Calculate metrics
  const totalVolumeSupplied = suppliers.reduce((total, s) => total + (s.volume_supplied || 0), 0)
  const totalVolumeRejected = suppliers.reduce((total, s) => total + (s.volume_rejected || 0), 0)
  const acceptanceRate = totalVolumeSupplied > 0 ? ((totalVolumeSupplied - totalVolumeRejected) / totalVolumeSupplied) * 100 : 0

  // Table columns with actions
  const columns = [
    {
      accessorKey: "name",
      header: "Supplier",
      cell: ({ row }: any) => {
        const supplier = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{supplier.first_name} {supplier.last_name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Product: {supplier.raw_product || 'N/A'}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }: any) => {
        const supplier = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-sm">
              <Phone className="w-3 h-3 text-gray-400" />
              <span>{supplier.phone_number}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <Mail className="w-3 h-3 text-gray-400" />
              <span className="truncate max-w-[150px]">{supplier.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }: any) => {
        const supplier = row.original
        return (
          <div className="flex items-center space-x-1 text-sm">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="truncate max-w-[120px]">{supplier.physical_address}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "volume",
      header: "Volume Stats",
      cell: ({ row }: any) => {
        const supplier = row.original
        const volumeSupplied = supplier.volume_supplied || 0
        const volumeRejected = supplier.volume_rejected || 0
        const rejectionRate = volumeSupplied > 0 ? (volumeRejected / volumeSupplied) * 100 : 0
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{volumeSupplied.toLocaleString()}L</span>
              <Badge  className={rejectionRate > 10 ? "text-white" : rejectionRate > 5 ? "text-white" : "text-white"}>
                {rejectionRate.toFixed(1)}% rejected
              </Badge>
            </div>
            <p className="text-xs text-gray-500">Rejected: {volumeRejected.toLocaleString()}L</p>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Added",
      cell: ({ row }: any) => {
        const supplier = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{new Date(supplier.created_at).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">Updated: {new Date(supplier.updated_at).toLocaleDateString()}</p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const supplier = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton 
               
              size="sm" 
              onClick={() => handleViewSupplier(supplier)}
              className="bg-[#006BC4] text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
               
              size="sm" 
              onClick={() => handleEditSupplier(supplier)}
              className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteSupplier(supplier)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
              className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  return (
    <AdminDashboardLayout title="Supplier Configuration" subtitle="Manage and configure suppliers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Supplier Management</h1>
            <p className="text-muted-foreground">Manage supplier relationships and track performance</p>
          </div>
          <LoadingButton onClick={handleAddSupplier}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </LoadingButton>
        </div>

        {/* Counter Widgets with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{suppliers.length}</div>
                  <p className="text-xs text-muted-foreground">Registered suppliers</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(suppliers.map(s => s.raw_product).filter(Boolean)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">Product types</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {totalVolumeSupplied.toLocaleString()}L
                  </div>
                  <p className="text-xs text-muted-foreground">Total supplied</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    {acceptanceRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Quality acceptance</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search suppliers..."
              filterFields={filterFields}
            />
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading suppliers...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={suppliers}
                showSearch={false}
              />
            )}
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <SupplierFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          supplier={selectedSupplier}
          mode={formMode} 
        />

        {/* View Drawer */}
        <SupplierViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          supplier={selectedSupplier}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditSupplier(selectedSupplier)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Supplier"
          description={`Are you sure you want to delete ${selectedSupplier?.first_name} ${selectedSupplier?.last_name}? This action cannot be undone and will remove all related data.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
   </AdminDashboardLayout>
  )
}