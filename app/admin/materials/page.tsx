"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/layout/main-layout"
// Removed Card wrappers in favor of simple bordered sections
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Layers, BookOpen, Eye, Edit, Trash2, Calendar } from "lucide-react"
import { RawMaterialFormDrawer } from "@/components/forms/raw-material-form-drawer"
import { RawMaterialViewDrawer } from "@/components/forms/raw-material-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchRawMaterials, deleteRawMaterial, clearError } from "@/lib/store/slices/rawMaterialSlice"
import { toast } from "sonner"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionButton } from "@/components/ui/permission-table-actions"
import { PermissionTableActions } from "@/components/ui/permission-table-actions"

export default function MaterialsPage() {
  const dispatch = useAppDispatch()
  const { rawMaterials, loading, error, operationLoading } = useAppSelector((state) => state.rawMaterial)
  
  const [searchTerm, setSearchTerm] = useState("")
  const hasFetchedRef = useRef(false)
  
  // Load raw materials on component mount - prevent duplicate calls with ref
  useEffect(() => {
    if (!hasFetchedRef.current && !operationLoading.fetch) {
      hasFetchedRef.current = true
      dispatch(fetchRawMaterials({}))
    }
  }, [dispatch, operationLoading.fetch])
  
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
  
  // Selected raw material and mode
  const [selectedRawMaterial, setSelectedRawMaterial] = useState<any>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter raw materials
  const filteredRawMaterials = rawMaterials.filter(rawMaterial => 
    rawMaterial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rawMaterial.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Action handlers
  const handleAddRawMaterial = () => {
    setSelectedRawMaterial(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditRawMaterial = (rawMaterial: any) => {
    setSelectedRawMaterial(rawMaterial)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewRawMaterial = (rawMaterial: any) => {
    setSelectedRawMaterial(rawMaterial)
    setViewDrawerOpen(true)
  }

  const handleDeleteRawMaterial = (rawMaterial: any) => {
    setSelectedRawMaterial(rawMaterial)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedRawMaterial) return
    
    try {
      await dispatch(deleteRawMaterial(selectedRawMaterial.id)).unwrap()
      toast.success('Raw material deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedRawMaterial(null)
    } catch (error: any) {
      // Backend error message will be used from the thunk
      toast.error(error || 'Failed to delete raw material')
    }
  }

  // Calculate metrics
  const totalMaterials = rawMaterials.length
  const recentlyAdded = rawMaterials.filter(rm => {
    const createdDate = new Date(rm.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return createdDate > sevenDaysAgo
  }).length

  // Table columns with actions
  const columns = [
    {
      accessorKey: "name",
      header: "Material",
      cell: ({ row }: any) => {
        const rawMaterial = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{rawMaterial.name}</span>
                <Badge variant="outline" className="text-xs">Material</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 truncate max-w-[200px]">
                {rawMaterial.description || "No description"}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => {
        const rawMaterial = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium truncate max-w-[250px]">
              {rawMaterial.description || "No description provided"}
            </p>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <BookOpen className="w-3 h-3" />
              <span>Raw Material</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const rawMaterial = row.original
        const isRecent = () => {
          const createdDate = new Date(rawMaterial.created_at)
          const threeDaysAgo = new Date()
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
          return createdDate > threeDaysAgo
        }
        
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">{new Date(rawMaterial.created_at).toLocaleDateString()}</p>
              {isRecent() && <Badge variant="outline" className="text-xs text-green-600">New</Badge>}
            </div>
            <p className="text-xs text-gray-500">Updated: {new Date(rawMaterial.updated_at).toLocaleDateString()}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "updated_at",
      header: "Last Modified",
      cell: ({ row }: any) => {
        const rawMaterial = row.original
        const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(rawMaterial.updated_at).getTime()) / (1000 * 3600 * 24))
        
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{new Date(rawMaterial.updated_at).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">
              {daysSinceUpdate === 0 ? 'Today' : 
               daysSinceUpdate === 1 ? 'Yesterday' : 
               `${daysSinceUpdate} days ago`}
            </p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const rawMaterial = row.original
        return (
          <PermissionTableActions
            feature="material"
            onView={() => handleViewRawMaterial(rawMaterial)}
            onEdit={() => handleEditRawMaterial(rawMaterial)}
            onDelete={() => handleDeleteRawMaterial(rawMaterial)}
            showDropdown={true}
          />
        )
      },
    },
  ]

  return (
    <PermissionGuard requiredView="material_tab">
      <AdminDashboardLayout title="Raw Materials" subtitle="Manage and configure raw materials">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Raw Materials</h1>
            <p className="text-sm font-light text-muted-foreground">Manage raw materials inventory and specifications</p>
          </div>
          <PermissionButton
            feature="material"
            permission="create"
            onClick={handleAddRawMaterial}
            className="bg-[#0068BD] hover:bg-[#005299] text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Raw Material
          </PermissionButton>
        </div>

        {/* Stats (no shadow, gray border, rounded) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-light">Total Materials</span>
              <Package className="h-4 w-4 text-gray-500" />
            </div>
            {operationLoading.fetch ? (
              <div className="animate-pulse space-y-1">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-light">{totalMaterials}</div>
                <p className="text-xs text-muted-foreground">Raw materials</p>
              </>
            )}
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-light">Recently Added</span>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            {operationLoading.fetch ? (
              <div className="animate-pulse space-y-1">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-light text-blue-600">{recentlyAdded}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </>
            )}
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-light">Categories</span>
              <Layers className="h-4 w-4 text-green-600" />
            </div>
            {operationLoading.fetch ? (
              <div className="animate-pulse space-y-1">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-light text-green-600">
                  {new Set(rawMaterials.map(rm => rm.name.split(' ')[0])).size}
                </div>
                <p className="text-xs text-muted-foreground">Material types</p>
              </>
            )}
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-light">Documentation</span>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            {operationLoading.fetch ? (
              <div className="animate-pulse space-y-1">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-light text-blue-600">
                  {rawMaterials.filter(rm => rm.description && rm.description.trim().length > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">With descriptions</p>
              </>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="p-6 pb-0">
            <div className="text-lg font-light">Raw Materials</div>
          </div>
          <div className="p-6">
            {operationLoading.fetch ? (
              <div className="space-y-3">
                <div className="h-10 bg-gray-100 rounded w-48" />
                <div className="h-64 bg-gray-50 border border-dashed border-gray-200 rounded" />
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredRawMaterials}
                searchKey="name"
                searchPlaceholder="Search raw materials..."
              />
            )}
          </div>
        </div>

        {/* Form Drawer */}
        <RawMaterialFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          rawMaterial={selectedRawMaterial}
          mode={formMode} 
        />

        {/* View Drawer */}
        <RawMaterialViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          rawMaterial={selectedRawMaterial}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditRawMaterial(selectedRawMaterial)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Raw Material"
          description={`Are you sure you want to delete "${selectedRawMaterial?.name}"? This action cannot be undone and may affect production processes.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </AdminDashboardLayout>
    </PermissionGuard>
  )
}
