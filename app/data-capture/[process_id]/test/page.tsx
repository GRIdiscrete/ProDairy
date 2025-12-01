"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, TestTube, TrendingUp, FileText, Clock, ArrowRight, Package, Beaker } from "lucide-react"
import { UHTQualityCheckDrawer } from "@/components/forms/uht-quality-check-drawer"
import { UHTQualityCheckViewDrawer } from "@/components/forms/uht-quality-check-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchUHTQualityChecks, 
  deleteUHTQualityCheckAction,
  clearError
} from "@/lib/store/slices/uhtQualityCheckSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { UHTQualityCheckAfterIncubation } from "@/lib/api/data-capture-forms"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { useRouter, useSearchParams } from "next/navigation"

interface UHTQualityCheckPageProps {
  params: {
    process_id: string
  }
}

export default function UHTQualityCheckPage({ params }: UHTQualityCheckPageProps) {
  const dispatch = useAppDispatch()
  const { qualityChecks, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.uhtQualityChecks)
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load Incubation quality  checks on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchUHTQualityChecks())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchUHTQualityChecks())
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
  
  // Selected quality check and mode
  const [selectedQualityCheck, setSelectedQualityCheck] = useState<UHTQualityCheckAfterIncubation | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for Incubation Test
  const filterFields = useMemo(() => [
    {
      key: "created_at",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "batch_number",
      label: "Batch Number",
      type: "text" as const,
      placeholder: "Filter by batch number"
    },
    {
      key: "product",
      label: "Product",
      type: "text" as const,
      placeholder: "Filter by product"
    }
  ], [])

  // Action handlers
  const handleAddQualityCheck = () => {
    setSelectedQualityCheck(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditQualityCheck = (qualityCheck: UHTQualityCheckAfterIncubation) => {
    setSelectedQualityCheck(qualityCheck)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewQualityCheck = (qualityCheck: UHTQualityCheckAfterIncubation) => {
    setSelectedQualityCheck(qualityCheck)
    setViewDrawerOpen(true)
  }

  const handleDeleteQualityCheck = (qualityCheck: UHTQualityCheckAfterIncubation) => {
    setSelectedQualityCheck(qualityCheck)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedQualityCheck) return
    
    try {
      await dispatch(deleteUHTQualityCheckAction(selectedQualityCheck.id!)).unwrap()
      toast.success('Incubation Test deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedQualityCheck(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete Incubation quality  check')
    }
  }

  // Get latest quality check for display
  const latestQualityCheck = Array.isArray(qualityChecks) && qualityChecks.length > 0 ? qualityChecks[0] : null

  // Table columns with actions
  const columns = useMemo(() => [
    {
      accessorKey: "quality_check_info",
      header: "Quality Check",
      cell: ({ row }: any) => {
        const qualityCheck = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <TestTube className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800 font-light">Batch #{qualityCheck.batch_number || 'N/A'}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {qualityCheck.created_at ? new Date(qualityCheck.created_at).toLocaleDateString() : 'N/A'} • pH: {qualityCheck.ph_0_days}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "product_info",
      header: "Product",
      cell: ({ row }: any) => {
        const qualityCheck = row.original
        const productName = typeof qualityCheck.product === 'object' && qualityCheck.product?.name 
          ? qualityCheck.product.name 
          : (typeof qualityCheck.product === 'string' ? qualityCheck.product : 'N/A')
        
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <TestTube className="w-3 h-3 text-blue-600" />
              </div>
              <p className="text-sm font-light">
                Product Details
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Product</span>
                <span className="text-xs font-light">
                  {productName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Batch</span>
                <span className="text-xs font-light">{qualityCheck.batch_number}</span>
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
        const qualityCheck = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-orange-600" />
              </div>
              <p className="text-sm font-light">
                Analysis Period
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Production</span>
                <span className="text-xs font-light">{new Date(qualityCheck.date_of_production).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Analysed</span>
                <span className="text-xs font-light">{new Date(qualityCheck.date_analysed).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "ph_analysis",
      header: "pH Analysis",
      cell: ({ row }: any) => {
        const qualityCheck = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <TestTube className="h-3 w-3 text-blue-600" />
              </div>
              <p className="text-sm font-light">
                pH Values
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">0 Days</span>
                <span className="text-xs font-light">{qualityCheck.ph_0_days}</span>
              </div>
              {qualityCheck.uht_qa_check_after_incubation_details_fkey && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">30°C</span>
                    <span className="text-xs font-light">{qualityCheck.uht_qa_check_after_incubation_details_fkey.ph_30_degrees}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">55°C</span>
                    <span className="text-xs font-light">{qualityCheck.uht_qa_check_after_incubation_details_fkey.ph_55_degrees}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }: any) => {
        const qualityCheck = row.original
        const details = qualityCheck.uht_qa_check_after_incubation_details_fkey
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-3 w-3 text-blue-600" />
              </div>
              <p className="text-sm font-light">
                Test Details
              </p>
            </div>
            {details ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Defects</span>
                  <span className="text-xs font-light truncate max-w-[100px]" title={details.defects}>
                    {details.defects}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Event</span>
                  <span className="text-xs font-light truncate max-w-[100px]" title={details.event}>
                    {details.event}
                  </span>
                </div>
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
        const qualityCheck = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {qualityCheck.created_at ? new Date(qualityCheck.created_at).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {qualityCheck.updated_at ? `Updated: ${new Date(qualityCheck.updated_at).toLocaleDateString()}` : 'Never updated'}
            </p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const qualityCheck = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewQualityCheck(qualityCheck)}
              className="bg-[#0068BD] hover:bg-[#005299] text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditQualityCheck(qualityCheck)}
              className="bg-[#A0D001] hover:bg-[#8AB801] text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteQualityCheck(qualityCheck)}
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
  ], [operationLoading.delete])

  // --- Helper: open view drawer if form_id query param is present ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isInitialized || !qualityChecks || qualityChecks.length === 0) return;
    const formId = searchParams?.get("form_id");
    if (formId) {
      const foundQualityCheck = qualityChecks.find((qc: any) => String(qc.id) === String(formId));
      if (foundQualityCheck) {
        setSelectedQualityCheck(foundQualityCheck);
        setViewDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, qualityChecks]);

  return (
    <DataCaptureDashboardLayout title="Incubation Test" subtitle="Incubation quality  check after incubation process control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Incubation Test</h1>
            <p className="text-sm font-light text-muted-foreground">Manage Incubation quality  check forms and process control</p>
            {/* <p className="text-xs text-gray-500 mt-1">Process ID: {params.process_id}</p> */}
          </div>
          <LoadingButton 
            onClick={handleAddQualityCheck}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Quality Check
          </LoadingButton>
        </div>

        {/* Current Quality Check Details */}
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestQualityCheck ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-green-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <TestTube className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Quality Check Process</span>
                  <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-light">Latest</Badge>
                </div>
                <LoadingButton 
                  variant="outline" 
                  onClick={() => handleViewQualityCheck(latestQualityCheck)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
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
                    <TestTube className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Product</p>
                  </div>
                  <p className="text-lg font-light text-green-600">
                    {typeof latestQualityCheck.product === 'object' && latestQualityCheck.product?.name 
                      ? latestQualityCheck.product.name 
                      : (typeof latestQualityCheck.product === 'string' ? latestQualityCheck.product : 'N/A')}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Production</p>
                  </div>
                  <p className="text-lg font-light">{new Date(latestQualityCheck.date_of_production).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Batch</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">
                    #{latestQualityCheck.batch_number}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TestTube className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">pH (0 days)</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">
                    {latestQualityCheck.ph_0_days}
                  </p>
                </div>
              </div>
              
              {/* Process Overview */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <TestTube className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="text-sm font-light text-gray-900">Process Overview</h4>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-light">Palletizer</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Beaker className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-light">Incubation</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <TestTube className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-green-600">Test</span>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                        Current Step
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Data Table */}
        {!loading && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Incubation Tests</div>
            </div>
            <div className="p-6 space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search Incubation quality  checks..."
              filterFields={filterFields}
            />
            
            {loading ? (
              <ContentSkeleton sections={1} cardsPerSection={4} />
            ) : (
              <DataTable columns={columns} data={qualityChecks} showSearch={false} />
            )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <UHTQualityCheckDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          qualityCheck={selectedQualityCheck}
          mode={formMode}
          processId={params.process_id}
        />

        {/* View Drawer */}
        <UHTQualityCheckViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          qualityCheck={selectedQualityCheck}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditQualityCheck(selectedQualityCheck!)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Incubation Test"
          description={`Are you sure you want to delete this Incubation quality  check? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
