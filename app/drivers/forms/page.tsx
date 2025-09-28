"use client"

import { useState, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchDriverForms } from "@/lib/store/slices/driverFormSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchRawMaterials } from "@/lib/store/slices/rawMaterialSlice"
import { fetchSuppliers } from "@/lib/store/slices/supplierSlice"
import { DriversDashboardLayout } from "@/components/layout/drivers-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Eye, Truck, Calendar, User, CheckCircle, XCircle, Settings, Trash2, Search, Filter, ChevronLeft, ChevronRight, Download, Wifi, WifiOff } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { DriverFormDrawer } from "@/components/forms/driver-form-drawer"
import { DriverFormViewDrawer } from "@/components/forms/driver-form-view-drawer"
import { LoadingButton } from "@/components/ui/loading-button"
import { useOfflineData } from "@/hooks/use-offline-data"
import { DataSyncService } from "@/lib/offline/data-sync"
import { OfflineDataService } from "@/lib/offline/database"
import { LocalStorageService } from "@/lib/offline/local-storage-service"
import { toast } from "sonner"
import type { DriverForm } from "@/lib/types"
import type { OfflineDriverForm } from "@/lib/offline/database"
import { useIsMobile } from "@/hooks/use-mobile"

// Unified form type for display
type UnifiedForm = DriverForm | OfflineDriverForm

export default function DriverFormsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { driverForms, operationLoading } = useSelector((state: RootState) => state.driverForm)
  const { items: users } = useSelector((state: RootState) => state.users)
  const { rawMaterials } = useSelector((state: RootState) => state.rawMaterial)
  const { suppliers } = useSelector((state: RootState) => state.supplier)
  
  // Offline data hook
  const { 
    isOnline, 
    drivers: offlineDrivers, 
    rawMaterials: offlineRawMaterials, 
    suppliers: offlineSuppliers, 
    driverForms: offlineDriverForms,
    loading: offlineLoading,
    refreshData 
  } = useOfflineData()
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<UnifiedForm | null>(null)
  const [viewingForm, setViewingForm] = useState<UnifiedForm | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const itemsPerPage = 10
  const isMobile = useIsMobile()

  // Helper function to get driver name from form
  const getDriverName = (form: any) => {
    if (isOnline) {
      return form.drivers_driver_fkey ? 
        `${form.drivers_driver_fkey.first_name} ${form.drivers_driver_fkey.last_name}` : 
        'N/A'
    } else {
      return form.driver ? 
        `${form.driver.first_name} ${form.driver.last_name}` : 
        'N/A'
    }
  }

  // Get offline data from localStorage (SSR-safe)
  const [offlineData, setOfflineData] = useState({
    drivers: typeof window !== 'undefined' ? LocalStorageService.getDrivers() : [],
    rawMaterials: typeof window !== 'undefined' ? LocalStorageService.getRawMaterials() : [],
    suppliers: typeof window !== 'undefined' ? LocalStorageService.getSuppliers() : [],
    driverForms: typeof window !== 'undefined' ? LocalStorageService.getDriverForms() : []
  })

  // Use offline data when offline, online data when online
  const displayDriverForms = isOnline ? driverForms : offlineData.driverForms
  const displayUsers = isOnline ? users : offlineData.drivers
  const displayRawMaterials = isOnline ? rawMaterials : offlineData.rawMaterials
  const displaySuppliers = isOnline ? suppliers : offlineData.suppliers

  useEffect(() => {
    if (isOnline) {
      dispatch(fetchDriverForms({}))
    } else {
      // When going offline, refresh offline data from localStorage (SSR-safe)
      if (typeof window !== 'undefined') {
        setOfflineData({
          drivers: LocalStorageService.getDrivers(),
          rawMaterials: LocalStorageService.getRawMaterials(),
          suppliers: LocalStorageService.getSuppliers(),
          driverForms: LocalStorageService.getDriverForms()
        })
      }
    }
  }, [dispatch, isOnline])

  // Load all data for offline use
  const handleLoadData = async () => {
    if (!isOnline) {
      toast.error("You need to be online to load data")
      return
    }

    setIsLoadingData(true)
    try {
      // Fetch all data from API
      const [usersResult, materialsResult, suppliersResult, formsResult] = await Promise.all([
        dispatch(fetchUsers({})),
        dispatch(fetchRawMaterials({})),
        dispatch(fetchSuppliers({})),
        dispatch(fetchDriverForms({}))
      ])

      // Save data to localStorage (SSR-safe)
      if (typeof window !== 'undefined') {
        LocalStorageService.saveDrivers(Array.isArray(usersResult.payload) ? usersResult.payload : [])
        LocalStorageService.saveRawMaterials(Array.isArray(materialsResult.payload) ? materialsResult.payload : [])
        LocalStorageService.saveSuppliers(Array.isArray(suppliersResult.payload) ? suppliersResult.payload : [])
        LocalStorageService.saveDriverForms(Array.isArray(formsResult.payload) ? formsResult.payload : [])
      }

      // Update local state (SSR-safe)
      if (typeof window !== 'undefined') {
        setOfflineData({
          drivers: LocalStorageService.getDrivers(),
          rawMaterials: LocalStorageService.getRawMaterials(),
          suppliers: LocalStorageService.getSuppliers(),
          driverForms: LocalStorageService.getDriverForms()
        })
      }

      toast.success("All data loaded and stored offline successfully!")
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error("Failed to load data. Please try again.")
    } finally {
      setIsLoadingData(false)
    }
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const handleAddForm = () => {
    setEditingForm(null)
    setIsDrawerOpen(true)
  }

  const handleEditForm = (form: UnifiedForm) => {
    setEditingForm(form)
    setIsDrawerOpen(true)
  }

  const handleViewForm = (form: UnifiedForm) => {
    setViewingForm(form)
    setIsViewDrawerOpen(true)
  }

  const getStatusBadge = (form: UnifiedForm) => {
    if (form.delivered) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Delivered
        </Badge>
      )
    } else if (form.rejected) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Pending
        </Badge>
      )
    }
  }

  // Filter and paginate data
  const filteredForms = useMemo(() => {
    if (!displayDriverForms) return []
    
    return displayDriverForms.filter((form) => {
      const driverName = getDriverName(form)
      const matchesSearch = form.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driverName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "delivered" && form.delivered) ||
        (statusFilter === "rejected" && form.rejected) ||
        (statusFilter === "pending" && !form.delivered && !form.rejected)
      
      return matchesSearch && matchesStatus
    })
  }, [displayDriverForms, searchTerm, statusFilter])

  const paginatedForms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredForms.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredForms, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredForms.length / itemsPerPage)

  const columns = [
    {
      accessorKey: "id",
      header: "Form ID",
      cell: ({ row }: any) => {
        const form = row.original as UnifiedForm
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-light text-sm">#{form.id.slice(0, 8)}</p>
              <p className="text-gray-500 text-xs font-light">Driver Form</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "driver",
      header: "Driver",
      cell: ({ row }: any) => {
        const form = row.original as UnifiedForm
        return (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-light">
              {getDriverName(form)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "start_date",
      header: "Collection Period",
      cell: ({ row }: any) => {
        const form = row.original as UnifiedForm
        return (
          <div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-light">{new Date(form.start_date).toLocaleDateString()}</span>
            </div>
            <div className="text-gray-500 text-sm font-light">
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
        const form = row.original as UnifiedForm
        return (
          <span className="text-sm font-light">{form.collected_products?.length || 0} products</span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const form = row.original as UnifiedForm
        return getStatusBadge(form)
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const form = row.original as UnifiedForm
        return (
          <span className="text-sm font-light">
            {new Date(form.created_at).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const form = row.original as UnifiedForm
        return (
          <div className="flex space-x-2">
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewForm(form)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditForm(form)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              <Settings className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  const isLoading = operationLoading.fetch || offlineLoading

  return (
    <DriversDashboardLayout title="Driver Forms" subtitle="Manage driver collection forms and deliveries">
      <div className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {isLoading ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="h-10 w-full sm:w-64 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-10 w-full sm:w-40 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ) : (
            <>
              {/* Mobile/Tablet Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search forms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 rounded-full font-light"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-white border-gray-200 rounded-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Online/Offline Status */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white">
                  {isOnline ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-light text-green-600">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-light text-orange-600">Offline</span>
                    </>
                  )}
                </div>

                {/* Debug Info - Remove in production */}
                {!isOnline && (
                  <div className="text-xs text-gray-500">
                    Offline Data: {offlineData.drivers.length} drivers, {offlineData.rawMaterials.length} materials, {offlineData.suppliers.length} suppliers, {offlineData.driverForms.length} forms
                  </div>
                )}

                {/* Load Data Button */}
                <LoadingButton
                  onClick={handleLoadData}
                  loading={isLoadingData}
                  disabled={!isOnline}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-0 rounded-full px-6 py-2 font-light disabled:opacity-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Load Data
                </LoadingButton>

                {/* Create Form Button */}
                <LoadingButton 
                  onClick={handleAddForm} 
                  loading={isLoading}
                  className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white border-0 rounded-full px-6 py-2 font-light"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Form
                </LoadingButton>
              </div>
            </>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-6">
                {/* Mobile Skeleton */}
                <div className="md:hidden space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg bg-white animate-pulse">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                          <div>
                            <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-32 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet Skeleton */}
                <div className="hidden md:grid lg:hidden grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg bg-white animate-pulse">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                          <div>
                            <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-32 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Skeleton */}
                <div className="hidden lg:block">
                  <div className="space-y-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                    {/* Table Rows */}
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                          <div>
                            <div className="h-4 w-20 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded"></div>
                          </div>
                          <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile: list view */}
                <div className="md:hidden">
                  <div className="space-y-4">
                    {paginatedForms.map((form: UnifiedForm) => (
                      <div key={form.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                              <Truck className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-light">#{form.id.slice(0, 8)}</p>
                              <p className="text-xs text-gray-500 font-light">
                                {new Date(form.start_date).toLocaleDateString()} — {new Date(form.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(form)}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span className="font-light">
                              {getDriverName(form)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="font-light">{new Date(form.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewForm(form)}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditForm(form)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
                          >
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
                  {paginatedForms.map((form: UnifiedForm) => (
                    <div key={form.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-light">#{form.id.slice(0, 8)}</p>
                            <p className="text-xs text-gray-500 font-light">
                              {new Date(form.start_date).toLocaleDateString()} — {new Date(form.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(form)}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span className="font-light">
                            {getDriverName(form)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="font-light">{new Date(form.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewForm(form)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditForm(form)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
                        >
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
                    data={filteredForms}
                    searchKey="id"
                    searchPlaceholder="Search driver forms by ID..."
                  />
                </div>

                {/* Mobile/Tablet Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500 font-light">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredForms.length)} of {filteredForms.length} forms
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="bg-white border-gray-200 rounded-full"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-light px-3">
                        {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="bg-white border-gray-200 rounded-full"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

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
    </DriversDashboardLayout>
  )
}