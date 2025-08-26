"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
          <div className="flex space-x-2">
            <LoadingButton variant="outline" size="sm" onClick={() => handleViewRawMaterial(rawMaterial)}>
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton variant="outline" size="sm" onClick={() => handleEditRawMaterial(rawMaterial)}>
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteRawMaterial(rawMaterial)}
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
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Raw Materials</h1>
            <p className="text-muted-foreground">Manage raw materials inventory and specifications</p>
          </div>
          <LoadingButton onClick={handleAddRawMaterial}>
            <Plus className="mr-2 h-4 w-4" />
            Add Raw Material
          </LoadingButton>
        </div>

        {/* Counter Widgets with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalMaterials}</div>
                  <p className="text-xs text-muted-foreground">Raw materials</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recently Added</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-600">{recentlyAdded}</div>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Layers className="h-4 w-4 text-green-600" />
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
                    {new Set(rawMaterials.map(rm => rm.name.split(' ')[0])).size}
                  </div>
                  <p className="text-xs text-muted-foreground">Material types</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentation</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
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
                    {rawMaterials.filter(rm => rm.description && rm.description.trim().length > 0).length}
                  </div>
                  <p className="text-xs text-muted-foreground">With descriptions</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Material Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search raw materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Raw Materials</CardTitle>
          </CardHeader>
          <CardContent>
            {operationLoading.fetch ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading raw materials...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredRawMaterials}
                searchKey="name"
                searchPlaceholder="Search raw materials..."
              />
            )}
          </CardContent>
        </Card>

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
    </MainLayout>
  )
}
