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
import { PermissionGuard } from "@/components/auth/permission-guard"

export default function SilosPage() {
  const dispatch = useAppDispatch()
  const { silos, loading, error, operationLoading } = useAppSelector((state) => state.silo)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)

  // Load silos once on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchSilos({}))
    }
  }, [dispatch])

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
        { label: "Raw Milk", value: "Raw Milk" },
        { label: "Standardized", value: "Standardized" },
        { label: "Pasteurized", value: "Pasteurized" },
        { label: "Holding", value: "Holding" }
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

  // Client-side filtering
  const filteredSilos = useMemo(() => {
    return (silos || []).filter(silo => {
      // Search filter
      if (tableFilters.search) {
        const search = tableFilters.search.toLowerCase()
        const name = (silo.name || "").toLowerCase()
        const serialNumber = (silo.serial_number || "").toLowerCase()
        if (!name.includes(search) && !serialNumber.includes(search)) return false
      }
      // Name filter
      if (tableFilters.name && !silo.name?.toLowerCase().includes(tableFilters.name.toLowerCase())) return false
      // Serial number filter
      if (tableFilters.serial_number && !silo.serial_number?.toLowerCase().includes(tableFilters.serial_number.toLowerCase())) return false
      // Category filter
      if (tableFilters.category && silo.category !== tableFilters.category) return false
      // Location filter
      if (tableFilters.location && !silo.location?.toLowerCase().includes(tableFilters.location.toLowerCase())) return false
      // Status filter
      if (tableFilters.status && silo.status !== tableFilters.status) return false
      return true
    })
  }, [silos, tableFilters])

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
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">{silo.name}</span>
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
            <p className="text-sm font-light">{silo.location}</p>
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
              <span className="text-sm font-light">{silo.capacity.toLocaleString()}L</span>
              <Badge className={fillPercentage > 80 ? "text-white" : fillPercentage > 60 ? "text-white" : "text-white"}>
                {fillPercentage.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-xs text-gray-500">Current: {silo?.milk_volume?.toLocaleString()}L</p>
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
            <p className="text-sm font-light">{new Date(silo.created_at).toLocaleDateString()}</p>
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
            <LoadingButton

              size="sm"
              onClick={() => handleViewSilo(silo)}
              className="bg-[#006BC4] text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton

              size="sm"
              onClick={() => handleEditSilo(silo)}
              className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteSilo(silo)}
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
    <PermissionGuard requiredView="silo_tab">
      <AdminDashboardLayout title="Silo Configuration" subtitle="Manage and configure storage silos">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-foreground">Silo Configuration</h1>
              <p className="text-sm font-light text-muted-foreground">Manage and configure storage silos</p>
            </div>
            <LoadingButton
              onClick={handleAddSilo}
              className="bg-[#006BC4] text-white border-0 rounded-full px-6 py-2 font-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Silo
            </LoadingButton>
          </div>

          {/* Counter Widgets with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <h3 className="text-sm text-gray-600">Total Silos</h3>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Database className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl text-gray-900">{silos.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Active in system</p>
                </>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <h3 className="text-sm text-gray-600">Active</h3>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
              </div>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl text-green-600">
                    {silos.filter((s) => s.status === "active").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Currently active</p>
                </>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <h3 className="text-sm text-gray-600">Total Capacity</h3>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Gauge className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl text-blue-600">
                    {silos.reduce((total, s) => total + s.capacity, 0).toLocaleString()}L
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Storage capacity</p>
                </>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <h3 className="text-sm text-gray-600">Current Volume</h3>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl text-blue-600">
                    {silos.reduce((total, s) => total + s.milk_volume, 0).toLocaleString()}L
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Milk stored</p>
                </>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Silos</div>
            </div>
            <div className="p-6 space-y-4">
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
                  data={filteredSilos}
                  showSearch={false}
                />
              )}
            </div>
          </div>

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
    </PermissionGuard>
  )
}