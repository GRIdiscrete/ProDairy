"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, TestTube, TrendingUp, FileText, Clock, ArrowRight, Package } from "lucide-react"
import { ProductIncubationDrawer } from "@/components/forms/product-incubation-drawer"
import { ProductIncubationViewDrawer } from "@/components/forms/product-incubation-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { RootState } from "@/lib/store"
import {
  fetchProductIncubations,
  deleteProductIncubationAction,
  clearError
} from "@/lib/store/slices/productIncubationSlice"
import { fetchProductionPlans } from "@/lib/store/slices/productionPlanSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { ProductIncubation } from "@/lib/api/data-capture-forms"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { fetchUsers } from "@/lib/store/slices/usersSlice"

interface ProductIncubationPageProps {
  params: {
    process_id: string
  }
}

export default function ProductIncubationPage({ params }: ProductIncubationPageProps) {
  const dispatch = useAppDispatch()
  const { incubations, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.productIncubations)
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const productionPlans = useAppSelector((s: any) => s.productionPlan?.productionPlans || [])

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)

  // Load product incubations on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchProductIncubations())
      // ensure production plans are available for the drawer selector
      dispatch(fetchProductionPlans())
      //fetch users
      dispatch(fetchUsers({}))
    }
  }, [dispatch, isInitialized])

  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchProductIncubations())
    }
  }, [dispatch, tableFilters, isInitialized])

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

  // Selected incubation and mode
  const [selectedIncubation, setSelectedIncubation] = useState<ProductIncubation | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for Product Incubation
  const filterFields = useMemo(() => [
    {
      key: "created_at",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "bn",
      label: "Batch Number",
      type: "text" as const,
      placeholder: "Filter by batch number"
    },
    {
      key: "product_description",
      label: "Product Description",
      type: "text" as const,
      placeholder: "Filter by product description"
    }
  ], [])

  // Action handlers
  const handleAddIncubation = () => {
    setSelectedIncubation(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditIncubation = (incubation: ProductIncubation) => {
    setSelectedIncubation(incubation)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewIncubation = (incubation: ProductIncubation) => {
    setSelectedIncubation(incubation)
    setViewDrawerOpen(true)
  }

  const handleDeleteIncubation = (incubation: ProductIncubation) => {
    setSelectedIncubation(incubation)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedIncubation) return

    try {
      await dispatch(deleteProductIncubationAction(selectedIncubation.id!)).unwrap()
      toast.success('Product Incubation deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedIncubation(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete product incubation')
    }
  }

  // Get latest incubation for display (batch is now a single object)
  const latestIncubation = Array.isArray(incubations) && incubations.length > 0 ? incubations[0] : null
  const latestBatch = latestIncubation ? latestIncubation.batch : null

  // Helpers to format times/dates coming from batch which may be "HH:mm:ss" or "YYYY-MM-DD" or full ISO
  const formatTimeValue = (val: string | undefined | null) => {
    if (!val) return "N/A"
    // time-only like "HH:mm:ss" or "HH:mm"
    const timeOnlyMatch = val.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/)
    if (timeOnlyMatch) return timeOnlyMatch[1]
    const parsed = new Date(val)
    if (!isNaN(parsed.getTime())) return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return "N/A"
  }

  const formatDateValue = (val: string | undefined | null) => {
    if (!val) return "N/A"
    // date-only YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const d = new Date(val + "T00:00:00Z")
      return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString()
    }
    const parsed = new Date(val)
    return isNaN(parsed.getTime()) ? "N/A" : parsed.toLocaleDateString()
  }

  // Table columns with actions
  const columns = useMemo(() => [
    {
      accessorKey: "incubation_info",
      header: "Incubation",
      cell: ({ row }: any) => {
        const incubation = row.original
        const batch = incubation.batch // new single-object shape
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <TestTube className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Batch</span>
                <Badge className="bg-purple-100 text-purple-800 font-light">#{batch?.batch_number ?? 'N/A'}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {incubation.created_at ? new Date(incubation.created_at).toLocaleDateString() : 'N/A'} • {batch?.days ?? 'N/A'} days
              </p>

              {/* show tag/id copy control in each row */}
              <div className="mt-2">
                <FormIdCopy displayId={incubation.tag} actualId={incubation.id} size="sm" />
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "dates",
      header: "Dates",
      cell: ({ row }: any) => {
        const incubation = row.original
        const batch = incubation.batch
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-orange-600" />
              </div>
              <p className="text-sm font-light">Incubation Period</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Time In</span>
                <span className="text-xs font-light">{formatTimeValue(batch?.time_in)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Expected Out</span>
                <span className="text-xs font-light">{formatTimeValue(batch?.expected_time_out)}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "manufacturing",
      header: "Manufacturing",
      cell: ({ row }: any) => {
        const incubation = row.original
        const batch = incubation.batch
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="h-3 w-3 text-green-600" />
              </div>
              <p className="text-sm font-light">Manufacturing</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">MNF</span>
                <span className="text-xs font-light">{formatDateValue(batch?.manufacture_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">BB</span>
                <span className="text-xs font-light">{formatDateValue(batch?.best_before_date)}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "approval",
      header: "Approved By",
      cell: ({ row }: any) => {
        const incubation = row.original
        const batch = incubation.batch
        // look up users by approver_id / scientist_id on the batch object
        const approverUser = batch?.approver_id ? users.find((u: any) => u.id === batch.approver_id) : null
        const scientistUser = batch?.scientist_id ? users.find((u: any) => u.id === batch.scientist_id) : null
        return (
          <div className="space-y-2">
            
            {approverUser ? (
              <div className="flex items-center space-x-2">
                <UserAvatar user={approverUser} size="sm" showName={true} showEmail={false} showDropdown={true} />
              </div>
            ) : scientistUser ? (
              <div className="flex items-center space-x-2">
                <UserAvatar user={scientistUser} size="sm" showName={true} showEmail={true} showDropdown={true} />
              </div>
            ) : (
              <p className="text-xs text-gray-400">No details</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const incubation = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {incubation.created_at ? new Date(incubation.created_at).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {incubation.updated_at ? `Updated: ${new Date(incubation.updated_at).toLocaleDateString()}` : 'Never updated'}
            </p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const incubation = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => handleViewIncubation(incubation)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => handleEditIncubation(incubation)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteIncubation(incubation)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ], [operationLoading.delete, users])

  return (
    <DataCaptureDashboardLayout title="Product Incubation" subtitle="Product incubation process control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Product Incubation</h1>
            <p className="text-sm font-light text-muted-foreground">Manage product incubation forms and process control</p>

          </div>
          <LoadingButton
            onClick={handleAddIncubation}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product Incubation
          </LoadingButton>
        </div>

        {/* Current Incubation Details */}
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestIncubation ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-purple-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <TestTube className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Incubation Process</span>
                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 font-light">Latest</Badge>
                </div>
                <LoadingButton
                  variant="outline"
                  onClick={() => handleViewIncubation(latestIncubation)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </LoadingButton>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TestTube className="h-4 w-4 text-purple-500" />
                    <p className="text-sm font-light text-gray-600">Tag / Plan</p>
                  </div>
                  <div className="text-lg font-light text-purple-600">
                    {latestIncubation?.tag ? (
                      <FormIdCopy displayId={latestIncubation.tag} actualId={latestIncubation.id} size="sm" />
                    ) : latestIncubation?.production_plan_id ? (
                      <span>{`Plan ${latestIncubation.production_plan_id.slice(0, 8)}`}</span>
                    ) : (
                      <span>N/A</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Date In</p>
                  </div>
                  <p className="text-lg font-light">{latestBatch?.time_in ? latestBatch.time_in : (latestIncubation?.created_at ? new Date(latestIncubation.created_at).toLocaleDateString('en-GB') : 'N/A')}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Batch</p>
                  </div>
                  <p className="text-lg font-light text-green-600">
                    #{latestBatch?.batch_number ?? 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Days</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">
                    {latestBatch?.days ?? 'N/A'} days
                  </p>
                </div>
              </div>


            </div>
          </div>
        ) : null}

        {/* Data Table */}
        {!loading && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Product Incubations</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search product incubations..."
                filterFields={filterFields}
              />

              {loading ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable columns={columns} data={incubations} showSearch={false} />
              )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <ProductIncubationDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          incubation={selectedIncubation}
          mode={formMode}
          processId={params.process_id}
        />

        {/* View Drawer */}
        <ProductIncubationViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          incubation={selectedIncubation}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditIncubation(selectedIncubation!)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Product Incubation"
          description={`Are you sure you want to delete this product incubation? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
