"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, AlertTriangle, TrendingUp, FileText, Clock, ArrowRight } from "lucide-react"
import { QACorrectiveActionDrawer } from "@/components/forms/qa-corrective-action-drawer"
import { QACorrectiveActionViewDrawer } from "@/components/forms/qa-corrective-action-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { 
  fetchQACorrectiveActions, 
  deleteQACorrectiveActionAction,
  clearError
} from "@/lib/store/slices/qaCorrectiveActionSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { QACorrectiveAction } from "@/lib/api/data-capture-forms"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { useRouter, useSearchParams } from "next/navigation"

interface QACorrectiveMeasuresPageProps {
  params: {
    process_id: string
  }
}

export default function QACorrectiveMeasuresPage({ params }: QACorrectiveMeasuresPageProps) {
  const dispatch = useAppDispatch()
  const { actions, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.qaCorrectiveActions)
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  
  // Load QA corrective actions on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchQACorrectiveActions())
    }
  }, [dispatch, isInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchQACorrectiveActions())
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Selected action and mode
  const [selectedAction, setSelectedAction] = useState<QACorrectiveAction | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [forms, setForms] = useState<any[]>([])
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // --- Helper: open view drawer if form_id query param is present ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isInitialized || !actions || actions.length === 0) return;
    const formId = searchParams?.get("form_id");
    if (formId) {
      const foundAction = actions.find((action: any) => String(action.id) === String(formId));
      if (foundAction) {
        setSelectedAction(foundAction);
        setViewDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, actions]);

  // Filter fields configuration for QA Corrective Actions
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
      key: "qa_decision",
      label: "QA Decision",
      type: "text" as const,
      placeholder: "Filter by QA decision"
    }
  ], [])

  // Action handlers
  const handleAddAction = () => {
    setSelectedAction(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditAction = (action: QACorrectiveAction) => {
    setSelectedAction(action)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewAction = (action: QACorrectiveAction) => {
    setSelectedAction(action)
    setViewDrawerOpen(true)
  }

  const handleDeleteAction = (action: QACorrectiveAction) => {
    setSelectedAction(action)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedAction) return
    
    try {
      await dispatch(deleteQACorrectiveActionAction(selectedAction.id!)).unwrap()
      toast.success('QA Corrective Action deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedAction(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete QA corrective action')
    }
  }

  // Get latest action for display
  const latestAction = Array.isArray(actions) && actions.length > 0 ? actions[0] : null

  // Table columns with actions
  const columns = useMemo(() => [
    {
      accessorKey: "action_info",
      header: "Action",
      cell: ({ row }: any) => {
        const action = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-100 text-red-800 font-light">Batch #{action.batch_number || 'N/A'}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {action.created_at ? new Date(action.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "issue_info",
      header: "Issue",
      cell: ({ row }: any) => {
        const action = row.original
        const issueText = action.issue || 'No issue description'
        const truncatedIssue = issueText.length > 30 ? issueText.substring(0, 30) + '...' : issueText
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-red-600" />
              </div>
              <span className="text-sm font-light">Issue</span>
            </div>
            <p className="text-xs text-gray-600 max-w-xs" title={issueText}>
              {truncatedIssue}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "qa_decision",
      header: "QA Decision",
      cell: ({ row }: any) => {
        const action = row.original
        const decisionText = action.qa_decision || 'No decision recorded'
        const truncatedDecision = decisionText.length > 30 ? decisionText.substring(0, 30) + '...' : decisionText
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-blue-600" />
              </div>
              <p className="text-sm font-light">
                Decision
              </p>
            </div>
            <p className="text-xs text-gray-600 max-w-xs" title={decisionText}>
              {truncatedDecision}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "dates",
      header: "Dates",
      cell: ({ row }: any) => {
        const action = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-orange-600" />
              </div>
              <p className="text-sm font-light">
                Timeline
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Production</span>
                <span className="text-xs font-light">{new Date(action.date_of_production).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Analysed</span>
                <span className="text-xs font-light">{new Date(action.date_analysed).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }: any) => {
        const action = row.original
        const details = action.qa_corrective_action_details_fkey
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-3 w-3 text-blue-600" />
              </div>
              <p className="text-sm font-light">
                Test Results
              </p>
            </div>
            {details ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">pH Level</span>
                  <span className="text-xs font-light">{details.ph_after_7_days_at_30_degrees}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Packaging</span>
                  <span className="text-xs font-light truncate max-w-20">
                    {details.packaging_integrity?.substring(0, 15)}...
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
        const action = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {action.created_at ? new Date(action.created_at).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {action.updated_at ? `Updated: ${new Date(action.updated_at).toLocaleDateString()}` : 'Never updated'}
            </p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const action = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewAction(action)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditAction(action)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteAction(action)}
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
  ], [operationLoading.delete])

  return (
    <DataCaptureDashboardLayout title="QA Corrective Measures" subtitle="Quality assurance corrective actions and measures">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">QA Corrective Measures</h1>
            <p className="text-sm font-light text-muted-foreground">Manage quality assurance corrective actions and measures</p>
          </div>
          <LoadingButton 
            onClick={handleAddAction}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add QA Corrective Action
          </LoadingButton>
        </div>

        {/* Current Action Details */}
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestAction ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-red-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <span>Latest QA Corrective Action</span>
                  <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-800 font-light">Latest</Badge>
                </div>
                <LoadingButton 
                  variant="outline" 
                  onClick={() => handleViewAction(latestAction)}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
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
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-light text-gray-600">Issue</p>
                  </div>
                  <p className="text-lg font-light text-red-600 max-w-xs truncate">
                    {latestAction.issue || 'No issue description'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">QA Decision</p>
                  </div>
                  <p className="text-lg font-light text-blue-600 max-w-xs truncate">
                    {latestAction.qa_decision || 'No decision recorded'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Batch</p>
                  </div>
                  <p className="text-lg font-light text-gray-600">
                    #{latestAction.batch_number}
                  </p>
                </div>
              </div>
              
              {/* Timeline and Details in Row */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Timeline Details */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Timeline</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Production Date</span>
                      <span className="text-xs font-light">{new Date(latestAction.date_of_production).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Analysis Date</span>
                      <span className="text-xs font-light">{new Date(latestAction.date_analysed).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Created</span>
                      <span className="text-xs font-light">{latestAction.created_at ? new Date(latestAction.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Test Results Summary */}
                {latestAction.qa_corrective_action_details_fkey && (
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-red-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Test Results</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">pH Level (7 days @ 30°C)</span>
                        <span className="text-xs font-light text-red-600">{latestAction.qa_corrective_action_details_fkey.ph_after_7_days_at_30_degrees}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Packaging Integrity</span>
                        <span className="text-xs font-light text-red-600 truncate max-w-32">
                          {latestAction.qa_corrective_action_details_fkey.packaging_integrity?.substring(0, 20)}...
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-light text-gray-600">Defects</span>
                        <span className="text-xs font-light text-red-600 truncate max-w-32">
                          {latestAction.qa_corrective_action_details_fkey.defects?.substring(0, 20)}...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Data Table */}
        {!loading && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">QA Corrective Actions</div>
            </div>
            <div className="p-6 space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
              searchPlaceholder="Search QA corrective actions..."
              filterFields={filterFields}
            />
            
            {loading ? (
              <ContentSkeleton sections={1} cardsPerSection={4} />
            ) : (
              <DataTable columns={columns} data={actions} showSearch={false} />
            )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <QACorrectiveActionDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          action={selectedAction}
          mode={formMode}
          processId={params.process_id}
        />

        {/* View Drawer */}
        <QACorrectiveActionViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          action={selectedAction}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditAction(selectedAction!)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete QA Corrective Action"
          description={`Are you sure you want to delete this QA corrective action? This action cannot be undone and may affect quality tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
