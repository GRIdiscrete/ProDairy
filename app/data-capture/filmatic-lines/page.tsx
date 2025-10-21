"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Factory, TrendingUp, FileText, Clock, Package, ArrowRight, Beaker } from "lucide-react"
import { FilmaticLinesProductionSheetDrawer } from "@/components/forms/filmatic-lines-production-sheet-drawer"
import { FilmaticLinesProductionSheetViewDrawer } from "@/components/forms/filmatic-lines-production-sheet-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  fetchFilmaticLinesProductionSheets,
  deleteFilmaticLinesProductionSheet,
  clearError
} from "@/lib/store/slices/filmaticLinesProductionSheetSlice"
import { fetchStandardizingForms } from "@/lib/store/slices/standardizingSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { FilmaticLinesProductionSheet } from "@/lib/api/filmatic-lines"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { useRouter, useSearchParams } from "next/navigation"

export default function FilmaticLinesPage() {
  const dispatch = useAppDispatch()
  const { sheets, loading, error, isInitialized } = useAppSelector((state) => state.filmaticLinesProductionSheets)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // Load Filmatic lines sheets and standardizing forms on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchFilmaticLinesProductionSheets())
      dispatch(fetchStandardizingForms()) // Load standardizing forms for the form drawer
    }
  }, [dispatch, isInitialized])

  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchFilmaticLinesProductionSheets())
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

  // Selected sheet and mode
  const [selectedSheet, setSelectedSheet] = useState<FilmaticLinesProductionSheet | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for Filmatic Lines
  const filterFields = useMemo(() => [
    {
      key: "created_at",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "shift",
      label: "Shift",
      type: "text" as const,
      placeholder: "Filter by shift"
    },
    {
      key: "product",
      label: "Product",
      type: "text" as const,
      placeholder: "Filter by product"
    }
  ], [])

  // Action handlers
  const handleAddSheet = () => {
    setSelectedSheet(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditSheet = (sheet: FilmaticLinesProductionSheet) => {
    setSelectedSheet(sheet)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewSheet = (sheet: FilmaticLinesProductionSheet) => {
    setSelectedSheet(sheet)
    setViewDrawerOpen(true)
  }

  const handleDeleteSheet = (sheet: FilmaticLinesProductionSheet) => {
    setSelectedSheet(sheet)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedSheet) return

    try {
      await dispatch(deleteFilmaticLinesProductionSheet(selectedSheet.id)).unwrap()
      toast.success('Filmatic Lines Production Sheet deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedSheet(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete Filmatic lines production sheet')
    }
  }

  // Get latest sheet for display
  const latestSheet = Array.isArray(sheets) && sheets.length > 0 ? sheets[0] : null

  if (loading.fetch) {
    return (
      <DataCaptureDashboardLayout title="Filmatic Lines" subtitle="Filmatic lines production control and monitoring">
        <ContentSkeleton sections={1} cardsPerSection={4} />
      </DataCaptureDashboardLayout>
    )
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "sheet_info",
      header: "Sheet",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Factory className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">#{sheet.id.slice(0, 8)}</span>
                <Badge className="bg-blue-100 text-blue-800 font-light">{sheet.product}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(sheet.created_at).toLocaleDateString()} • {sheet.shift}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "production_info",
      header: "Production",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm font-light">Production</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <Badge className="text-xs bg-green-100 text-green-800">Completed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Efficiency</span>
                <span className="text-xs font-light">94.5%</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "reconciliation_info",
      header: "Reconciliation",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-purple-600" />
              </div>
              <span className="text-sm font-light">Reconciliation</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Bottles</span>
                <span className="text-xs font-light">18,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Milk</span>
                <span className="text-xs font-light">9,500L</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "quality_info",
      header: "Quality",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-yellow-600" />
              </div>
              <span className="text-sm font-light">Quality</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Score</span>
                <span className="text-xs font-light text-green-600">98.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Downtime</span>
                <span className="text-xs font-light text-orange-600">15 min</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {sheet.created_at ? new Date(sheet.created_at).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {sheet.updated_at ? `Updated: ${new Date(sheet.updated_at).toLocaleDateString()}` : 'Never updated'}
            </p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => handleViewSheet(sheet)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => handleEditSheet(sheet)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteSheet(sheet)}
              loading={loading.delete}
              disabled={loading.delete}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  // --- Helper: open view drawer if form_id query param is present ---
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   if (!isInitialized || !sheets || sheets.length === 0) return;
  //   const formId = searchParams?.get("form_id");
  //   if (formId) {
  //     const foundSheet = sheets.find((sheet: any) => String(sheet.id) === String(formId));

  //     console.log("Found sheet:", foundSheet);
  //     if (foundSheet) {
  //       setSelectedSheet(foundSheet);
  //       setViewDrawerOpen(true);
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isInitialized, sheets]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isInitialized || !sheets || sheets.length === 0) return;
    const formId = searchParams?.get("form_id");
    // Debug logs to verify effect is reached
    console.log("FilmaticLines useEffect reached");
    console.log("formId:", formId);
    if (formId) {
      const foundSheet = sheets.find((sheet: any) => String(sheet.id) === String(formId));
      console.log("foundSheet:", foundSheet);
      if (foundSheet) {
        setSelectedSheet(foundSheet);
        setViewDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, sheets]);

  return (
    <DataCaptureDashboardLayout title="Filmatic Lines" subtitle="Filmatic lines production control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Filmatic Lines</h1>
            <p className="text-sm font-light text-muted-foreground">Manage Filmatic lines production sheets and process control</p>
          </div>
          <LoadingButton
            onClick={handleAddSheet}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Filmatic Lines Sheet
          </LoadingButton>
        </div>

        {/* Current Sheet Details */}
        {loading.fetch ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="mt-4 flex justify-end">
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          </div>
        ) : latestSheet ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Factory className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Filmatic Lines Process</span>
                  <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-light">Latest</Badge>
                </div>
                <LoadingButton
                  variant="outline"
                  onClick={() => handleViewSheet(latestSheet)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
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
                    <FileText className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Sheet ID</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-light">#{latestSheet.id.slice(0, 8)}</p>
                    <CopyButton text={latestSheet.id} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Factory className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Product</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">{latestSheet.product}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Created</p>
                  </div>
                  <p className="text-lg font-light">{new Date(latestSheet.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Shift</p>
                  </div>
                  <p className="text-lg font-light text-green-600">{latestSheet.shift}</p>
                </div>
              </div>

              {/* Process Flow Information */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Process Summary */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Factory className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Process Summary</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Status</span>
                      <span className="text-xs font-light text-green-600">Completed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Efficiency</span>
                      <span className="text-xs font-light text-blue-600">94.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Quality Score</span>
                      <span className="text-xs font-light text-purple-600">98.2%</span>
                    </div>
                  </div>
                </div>

                {/* Next Step */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-gray-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Next Step</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Process</span>
                      <span className="text-xs font-light text-gray-600">Palletizer</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Status</span>
                      <span className="text-xs font-light text-gray-400">Pending</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Ready</span>
                      <span className="text-xs font-light text-green-600">Yes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Data Table */}
        {!loading.fetch && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Filmatic Lines Production Sheets</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search Filmatic lines sheets..."
                filterFields={filterFields}
              />

              {loading.fetch ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable columns={columns} data={sheets} showSearch={false} />
              )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <FilmaticLinesProductionSheetDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          sheet={selectedSheet}
          mode={formMode}
        />

        {/* View Drawer */}
        <FilmaticLinesProductionSheetViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          sheet={selectedSheet}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditSheet(selectedSheet!)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Filmatic Lines Production Sheet"
          description={`Are you sure you want to delete this Filmatic lines production sheet? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={loading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
