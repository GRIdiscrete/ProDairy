"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Beaker, TrendingUp, FileText, Clock, Package, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"
import { StandardizingFormDrawer } from "@/components/forms/standardizing-form-drawer"
import { StandardizingFormViewDrawer } from "@/components/forms/standardizing-form-view-drawer"
import { SkimmingFormDrawer } from "@/components/forms/skimming-form-drawer"
import { SkimmingFormViewDrawer } from "@/components/forms/skimming-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  fetchStandardizingForms,
  deleteStandardizingForm,
  clearError
} from "@/lib/store/slices/standardizingSlice"
import { fetchSkimmingForms, deleteSkimmingForm } from "@/lib/store/slices/skimmingSlice"
import { fetchBMTControlForms } from "@/lib/store/slices/bmtControlFormSlice"
import { TableFilters } from "@/lib/types"
import { toast } from "sonner"
import { StandardizingForm as OldStandardizingForm } from "@/lib/api/standardizing"
import { StandardizingForm } from "@/lib/api/standardizing-form"
import { SkimmingForm } from "@/lib/api/skimming-form"
import ContentSkeleton from "@/components/ui/content-skeleton"

export default function StandardizingPage() {
  const dispatch = useAppDispatch()
  const { forms: standardizingForms, loading: standardizingLoading, error: standardizingError, operationLoading: standardizingOperationLoading, isInitialized: standardizingInitialized } = useAppSelector((state) => state.standardizing)
  const { forms: skimmingForms, loading: skimmingLoading, error: skimmingError, operationLoading: skimmingOperationLoading, isInitialized: skimmingInitialized } = useAppSelector((state) => state.skimming)
  
  const [activeTab, setActiveTab] = useState("standardizing")
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load forms on initial mount and tab change
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchStandardizingForms())
      dispatch(fetchSkimmingForms())
      dispatch(fetchBMTControlForms()) // Load BMT forms for the form drawer
    }
  }, [dispatch])
  
  // Handle filter changes
  useEffect(() => {
    if (activeTab === "standardizing" && standardizingInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchStandardizingForms())
    } else if (activeTab === "skimming" && skimmingInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchSkimmingForms())
    }
  }, [dispatch, tableFilters, activeTab, standardizingInitialized, skimmingInitialized])
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (standardizingError) {
      toast.error(standardizingError)
      dispatch(clearError())
    }
    if (skimmingError) {
      toast.error(skimmingError)
      // Note: skimming slice should have its own clearError action
    }
  }, [standardizingError, skimmingError, dispatch])
  
  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Selected form and mode
  const [selectedForm, setSelectedForm] = useState<StandardizingForm | SkimmingForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for forms
  const filterFields = useMemo(() => [
    {
      key: "created_at",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "bmt_id",
      label: "BMT ID",
      type: "text" as const,
      placeholder: "Filter by BMT ID"
    },
    {
      key: "operator_signature",
      label: "Operator",
      type: "text" as const,
      placeholder: "Filter by operator"
    }
  ], [])

  // Table columns for standardizing forms
  const standardizingColumns = useMemo(() => [
    {
      accessorKey: "id",
      header: "Form ID",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex items-center space-x-2">
            <span className="font-light">#{form.id.slice(0, 8)}</span>
            <CopyButton text={form.id} />
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <span className="text-sm font-light">
            {new Date(form.created_at).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      accessorKey: "bmt_id",
      header: "BMT Form",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-light">#{form.bmt_id.slice(0, 8)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "skim_entries",
      header: "Skim Milk",
      cell: ({ row }: any) => {
        const form = row.original
        const skimEntries = (form as any).standardizing_form_no_skim_skim_milk?.length || 0
        const totalQuantity = (form as any).standardizing_form_no_skim_skim_milk?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-light">{skimEntries} entries</span>
            </div>
            <span className="text-xs text-gray-500">{totalQuantity.toFixed(1)}L total</span>
          </div>
        )
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const form = row.original
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
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteForm(form)}
              loading={standardizingOperationLoading.delete}
              disabled={standardizingOperationLoading.delete}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ], [])

  // Table columns for skimming forms
  const skimmingColumns = useMemo(() => [
    {
      accessorKey: "id",
      header: "Form ID",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex items-center space-x-2">
            <span className="font-light">#{form.id.slice(0, 8)}</span>
            <CopyButton text={form.id} />
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <span className="text-sm font-light">
            {new Date(form.created_at).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      accessorKey: "bmt_id",
      header: "BMT Form",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-light">#{form.bmt_id.slice(0, 8)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "raw_milk",
      header: "Raw Milk",
      cell: ({ row }: any) => {
        const form = row.original
        const rawMilkEntries = (form as any).standardizing_form_raw_milk?.length || 0
        const totalQuantity = (form as any).standardizing_form_raw_milk?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Beaker className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-light">{rawMilkEntries} entries</span>
            </div>
            <span className="text-xs text-gray-500">{totalQuantity.toFixed(1)}L total</span>
          </div>
        )
      },
    },
    {
      accessorKey: "products",
      header: "Products",
      cell: ({ row }: any) => {
        const form = row.original
        const skimMilkEntries = (form as any).standardizing_form_skim_milk?.length || 0
        const creamEntries = (form as any).standardizing_form_cream?.length || 0
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-light">{skimMilkEntries + creamEntries} products</span>
            </div>
            <span className="text-xs text-gray-500">{skimMilkEntries} skim • {creamEntries} cream</span>
          </div>
        )
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const form = row.original
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
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteForm(form)}
              loading={skimmingOperationLoading.delete}
              disabled={skimmingOperationLoading.delete}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: StandardizingForm | SkimmingForm) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: StandardizingForm | SkimmingForm) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: StandardizingForm | SkimmingForm) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return
    
    try {
      if (activeTab === "standardizing") {
        await dispatch(deleteStandardizingForm(selectedForm.id)).unwrap()
        toast.success('Standardizing Form deleted successfully')
      } else {
        await dispatch(deleteSkimmingForm(selectedForm.id)).unwrap()
        toast.success('Skimming Form deleted successfully')
      }
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete form')
    }
  }

  // Get latest form for display
  const latestStandardizingForm = Array.isArray(standardizingForms) && standardizingForms.length > 0 ? standardizingForms[0] : null
  const latestSkimmingForm = Array.isArray(skimmingForms) && skimmingForms.length > 0 ? skimmingForms[0] : null

  return (
    <DataCaptureDashboardLayout title="Standardizing" subtitle="Milk standardizing and skimming process control">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Standardizing & Skimming</h1>
            <p className="text-sm font-light text-muted-foreground">Manage milk standardizing and skimming forms</p>
          </div>
          <LoadingButton 
            onClick={handleAddForm}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Form
          </LoadingButton>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standardizing">Standardizing</TabsTrigger>
            <TabsTrigger value="skimming">Skimming</TabsTrigger>
          </TabsList>

          <TabsContent value="standardizing" className="space-y-6">
            {/* Current Standardizing Form Details */}
            {latestStandardizingForm && (
              <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-orange-500">
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-lg font-light">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Beaker className="h-4 w-4 text-white" />
                      </div>
                      <span>Current Standardizing Process</span>
                      <span className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 font-light px-2 py-1 rounded-full text-xs">
                        Latest
                      </span>
                    </div>
                    <LoadingButton 
                      variant="outline" 
                      onClick={() => handleViewForm(latestStandardizingForm as any)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </LoadingButton>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-light text-gray-600">Form ID</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-light">#{latestStandardizingForm.id.slice(0, 8)}</p>
                        <CopyButton text={latestStandardizingForm.id} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-light text-gray-600">BMT Form</p>
                      </div>
                      <p className="text-lg font-light">#{latestStandardizingForm.bmt_id.slice(0, 8)}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-light text-gray-600">Created</p>
                      </div>
                      <p className="text-lg font-light">{new Date(latestStandardizingForm.created_at).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standardizing Forms Data Table */}
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="p-6 pb-0">
                <div className="text-lg font-light">Standardizing Forms</div>
                <p className="text-sm text-gray-500 mt-1">Forms for standardizing milk fat content</p>
              </div>
              <div className="p-6 space-y-4">
                <DataTableFilters
                  filters={tableFilters}
                  onFiltersChange={setTableFilters}
                  onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                  searchPlaceholder="Search standardizing forms..."
                  filterFields={filterFields}
                />
                
                {standardizingLoading ? (
                  <ContentSkeleton sections={1} cardsPerSection={4} />
                ) : (
                  <DataTable columns={standardizingColumns} data={standardizingForms} showSearch={false} />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skimming" className="space-y-6">
            {/* Current Skimming Form Details */}
            {latestSkimmingForm && (
              <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-purple-500">
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-lg font-light">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-white" />
                      </div>
                      <span>Current Skimming Process</span>
                      <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 font-light px-2 py-1 rounded-full text-xs">
                        Latest
                      </span>
                    </div>
                    <LoadingButton 
                      variant="outline" 
                      onClick={() => handleViewForm(latestSkimmingForm as any)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </LoadingButton>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-light text-gray-600">Form ID</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-light">#{latestSkimmingForm.id.slice(0, 8)}</p>
                        <CopyButton text={latestSkimmingForm.id} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-light text-gray-600">BMT Form</p>
                      </div>
                      <p className="text-lg font-light">#{latestSkimmingForm.bmt_id.slice(0, 8)}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-light text-gray-600">Created</p>
                      </div>
                      <p className="text-lg font-light">{new Date(latestSkimmingForm.created_at).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skimming Forms Data Table */}
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="p-6 pb-0">
                <div className="text-lg font-light">Skimming Forms</div>
                <p className="text-sm text-gray-500 mt-1">Forms for milk skimming process with raw milk, skim milk, and cream outputs</p>
              </div>
              <div className="p-6 space-y-4">
                <DataTableFilters
                  filters={tableFilters}
                  onFiltersChange={setTableFilters}
                  onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                  searchPlaceholder="Search skimming forms..."
                  filterFields={filterFields}
                />
                
                {skimmingLoading ? (
                  <ContentSkeleton sections={1} cardsPerSection={4} />
                ) : (
                  <DataTable columns={skimmingColumns} data={skimmingForms} showSearch={false} />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Standardizing Form Drawer */}
        {activeTab === "standardizing" && (
          <StandardizingFormDrawer 
            open={formDrawerOpen} 
            onOpenChange={setFormDrawerOpen} 
            form={selectedForm as StandardizingForm}
            mode={formMode} 
          />
        )}

        {/* Skimming Form Drawer */}
        {activeTab === "skimming" && (
          <SkimmingFormDrawer 
            open={formDrawerOpen} 
            onOpenChange={setFormDrawerOpen} 
            form={selectedForm as SkimmingForm}
            mode={formMode} 
          />
        )}

        {/* Standardizing View Drawer */}
        {activeTab === "standardizing" && (
          <StandardizingFormViewDrawer
            open={viewDrawerOpen}
            onOpenChange={setViewDrawerOpen}
            form={selectedForm as any}
            onEdit={() => {
              setViewDrawerOpen(false)
              handleEditForm(selectedForm!)
            }}
          />
        )}

        {/* Skimming View Drawer */}
        {activeTab === "skimming" && (
          <SkimmingFormViewDrawer
            open={viewDrawerOpen}
            onOpenChange={setViewDrawerOpen}
            form={selectedForm as SkimmingForm}
            onEdit={() => {
              setViewDrawerOpen(false)
              handleEditForm(selectedForm!)
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={`Delete ${activeTab === "standardizing" ? "Standardizing" : "Skimming"} Form`}
          description={`Are you sure you want to delete this ${activeTab} form? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={activeTab === "standardizing" ? standardizingOperationLoading.delete : skimmingOperationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
