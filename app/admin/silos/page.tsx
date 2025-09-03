"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Eye, Edit, Trash2, Search, Database, Gauge, Wrench, Activity } from "lucide-react"
import { SiloFormDrawer } from "@/components/forms/silo-form-drawer"
import { SiloViewDrawer } from "@/components/forms/silo-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchSilos, deleteSilo, clearError } from "@/lib/store/slices/siloSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"

export default function SilosPage() {
  const dispatch = useAppDispatch()
  const { silos, loading, error, operationLoading } = useAppSelector((state) => state.silo)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load silos on component mount and when filters change
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
    }
    dispatch(fetchSilos({ filters: tableFilters }))
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
  
  // Selected silo and mode
  const [selectedSilo, setSelectedSilo] = useState<any>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for silos
  const filterFields = useMemo(() => [
    {
      key: "name",
      label: "Name",
      type: "text" as const,
      placeholder: "Filter by silo name"
    },
    {
      key: "serial_number",
      label: "Serial Number",
      type: "text" as const,
      placeholder: "Filter by serial number"
    },
    // <SelectItem value="Milk Storage Tanks">Milk Storage Tanks</SelectItem>
    // <SelectItem value="Cooling Silos">Cooling Silos</SelectItem>
    // <SelectItem value="Processing Tanks">Processing Tanks</SelectItem>
    // <SelectItem value="Buffer Tanks">Buffer Tanks</SelectItem>
    // <SelectItem value="Fermentation Tanks">Fermentation Tanks</SelectItem>
    {
      key: "category",
      label: "Category",
      type: "select" as const,
      placeholder: "Select category",
      options: [
        { label: "Milk Storage Tanks", value: "Milk Storage Tanks" },
        { label: "Cooling Silos", value: "Cooling Silos" },
        { label: "Processing Tanks", value: "Processing Tanks" },
        { label: "Buffer Tanks", value: "Buffer Tanks" },
        { label: "Fermentation Tanks", value: "Fermentation Tanks" }
      ]
    },
    {
      key: "location",
      label: "Location",
      type: "text" as const,
      placeholder: "Filter by location"
    },
    // <SelectItem value="active">Active</SelectItem>
    // <SelectItem value="inactive">Inactive</SelectItem>
    // <SelectItem value="maintenance">Maintenance</SelectItem>
    // <SelectItem value="offline">Offline</SelectItem>
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      placeholder: "Filter by status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Maintenance", value: "maintenance" },
        { label: "Offline", value: "offline" }
      ]
    },
    {
      key: "capacity",
      label: "Capacity",
      type: "text" as const,
      placeholder: "Filter by capacity"
    }
  ], [])

  // Action handlers
  const handleAddSilo = () => {
    setSelectedSilo(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditSilo = (silo: any) => {
    setSelectedSilo(silo)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewSilo = (silo: any) => {
    setSelectedSilo(silo)
    setViewDrawerOpen(true)
  }

  const handleDeleteSilo = (silo: any) => {
    setSelectedSilo(silo)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedSilo) return
    
    try {
      await dispatch(deleteSilo(selectedSilo.id)).unwrap()
      toast.success('Silo deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedSilo(null)
    } catch (error: any) {
      // Backend error message will be used from the thunk
      toast.error(error || 'Failed to delete silo')
    }
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "name",
      header: "Silo",
      cell: ({ row }: any) => {
        const silo = row.original
        const getStatusColor = () => {
          switch (silo.status?.toLowerCase()) {
            case "active": return "bg-green-100 text-green-800"
            case "maintenance": return "bg-yellow-100 text-yellow-800"
            case "inactive": return "bg-red-100 text-red-800"
            case "offline": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
          }
        }
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{silo.name}</span>
                <Badge className={getStatusColor()}>{silo.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Serial: {silo.serial_number} • {silo.category}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }: any) => {
        const silo = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{silo.location}</p>
            <p className="text-xs text-gray-500">{silo.category}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }: any) => {
        const silo = row.original
        const fillPercentage = silo.capacity > 0 ? (silo.milk_volume / silo.capacity) * 100 : 0
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{silo.capacity.toLocaleString()}L</span>
              <Badge variant="outline" className={fillPercentage > 80 ? "text-red-600" : fillPercentage > 60 ? "text-yellow-600" : "text-green-600"}>
                {fillPercentage.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-xs text-gray-500">Current: {silo.milk_volume.toLocaleString()}L</p>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const silo = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{new Date(silo.created_at).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">Updated: {new Date(silo.updated_at).toLocaleDateString()}</p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const silo = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton variant="outline" size="sm" onClick={() => handleViewSilo(silo)}>
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton variant="outline" size="sm" onClick={() => handleEditSilo(silo)}>
              <Settings className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteSilo(silo)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  return (
    <AdminDashboardLayout title="Silo Configuration" subtitle="Manage and configure storage silos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Silo Configuration</h1>
            <p className="text-muted-foreground">Manage and configure storage silos</p>
          </div>
          <LoadingButton onClick={handleAddSilo}>
            <Plus className="mr-2 h-4 w-4" />
            Add Silo
          </LoadingButton>
        </div>

        {/* Counter Widgets with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Silos</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{silos.length}</div>
                  <p className="text-xs text-muted-foreground">Storage units</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
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
                    {silos.filter((s) => s.status === "active").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Gauge className="h-4 w-4 text-blue-600" />
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
                    {silos.reduce((total, s) => total + s.capacity, 0).toLocaleString()}L
                  </div>
                  <p className="text-xs text-muted-foreground">Storage capacity</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Volume</CardTitle>
              <Wrench className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-purple-600">
                    {silos.reduce((total, s) => total + s.milk_volume, 0).toLocaleString()}L
                  </div>
                  <p className="text-xs text-muted-foreground">Milk stored</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Silos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search silos..."
              filterFields={filterFields}
            />
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading silos...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={silos}
                showSearch={false}
              />
            )}
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <SiloFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          silo={selectedSilo}
          mode={formMode} 
        />

        {/* View Drawer */}
        <SiloViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          silo={selectedSilo}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditSilo(selectedSilo)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Silo"
          description={`Are you sure you want to delete ${selectedSilo?.name}? This action cannot be undone and may affect milk storage capacity.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </AdminDashboardLayout>
  )
}