"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Package, TrendingUp, FileText, Clock, ArrowRight, Calendar, Grid3X3, LayoutList, Table2 } from "lucide-react"
import { PalletiserSheetDrawer } from "@/components/forms/palletiser-sheet-drawer"
import { PalletiserSheetViewDrawer } from "@/components/forms/palletiser-sheet-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  fetchPalletiserSheets,
  deletePalletiserSheetAction,
  clearError
} from "@/lib/store/slices/palletiserSheetSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchMachines } from "@/lib/store/slices/machineSlice"
import { fetchRoles } from "@/lib/store/slices/rolesSlice"
import { apiRequest } from "@/lib/utils/api-request"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { PalletiserSheet } from "@/lib/api/data-capture-forms"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { UserAvatar } from "@/components/ui/user-avatar"
import type { RootState } from "@/lib/store"
import { useRouter, useSearchParams } from "next/navigation"

interface PalletiserSheetPageProps {
  processId?: string
}

export default function PalletiserSheetPage({ processId }: PalletiserSheetPageProps = {}) {
  const dispatch = useAppDispatch()
  const { sheets, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.palletiserSheets)

  // helper to format ISO date (YYYY-MM-DD) -> "25 Oct 2025"
  const formatDate = (iso?: string | null) => {
    if (!iso) return "N/A"
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
  }

  // resolve reference lists from Redux store (fetched on mount) — destructure like other pages
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const { machines } = useAppSelector((state: RootState) => state.machine)
  const { roles } = useAppSelector((state: RootState) => state.roles)

  const [flatRows, setFlatRows] = useState<any[]>([])
  const [flatLoading, setFlatLoading] = useState(false)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // Load palletiser sheets on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      // load sheets and related reference data so Machine / Counter / Approver info is available
      dispatch(fetchPalletiserSheets())
      dispatch(fetchUsers({}))
      dispatch(fetchMachines({}))
      dispatch(fetchRoles({}))
    }
  }, [dispatch, isInitialized])

  // Frontend Filtering Logic
  const filteredSheets = useMemo(() => {
    if (!Array.isArray(sheets)) return []

    return sheets.filter((sheet: any) => {
      // 1. Search filter (Global search)
      if (tableFilters.search) {
        const searchLower = tableFilters.search.toLowerCase()
        const tag = String(sheet.tag || "").toLowerCase()
        const batch = String(sheet.batch_number || "").toLowerCase()
        const product = String(sheet.product_type || "").toLowerCase()
        const machine = machines.find((m: any) => m.id === sheet.machine_id)?.name?.toLowerCase() || ""

        if (!tag.includes(searchLower) && !batch.includes(searchLower) && !product.includes(searchLower) && !machine.includes(searchLower)) return false
      }

      // 2. Specific filter fields
      if (tableFilters.created_at) {
        const filterDate = new Date(tableFilters.created_at)
        const sheetDate = new Date(sheet.created_at)
        if (filterDate.toDateString() !== sheetDate.toDateString()) return false
      }

      if (tableFilters.batch_number) {
        const batchLower = tableFilters.batch_number.toLowerCase()
        if (!String(sheet.batch_number || "").toLowerCase().includes(batchLower)) return false
      }

      if (tableFilters.product_type) {
        const productLower = tableFilters.product_type.toLowerCase()
        if (!String(sheet.product_type || "").toLowerCase().includes(productLower)) return false
      }

      // 3. Date Range filter
      if (tableFilters.dateRange) {
        const sheetDate = new Date(sheet.created_at)
        if (tableFilters.dateRange.from) {
          const from = new Date(tableFilters.dateRange.from)
          from.setHours(0, 0, 0, 0)
          if (sheetDate < from) return false
        }
        if (tableFilters.dateRange.to) {
          const to = new Date(tableFilters.dateRange.to)
          to.setHours(23, 59, 59, 999)
          if (sheetDate > to) return false
        }
      }

      return true
    })
  }, [sheets, tableFilters, machines])

  const [viewMode, setViewMode] = useState<"management" | "sheet">("management")

  // Fetch flat data from the reporting endpoint when sheet view is activated
  useEffect(() => {
    if (viewMode !== "sheet" || flatRows.length > 0) return
    setFlatLoading(true)
    apiRequest<{ statusCode: number; data: any[] }>('/palletiser-sheet/table')
      .then(res => setFlatRows(res?.data ?? []))
      .catch(() => toast.error("Failed to load sheet view data"))
      .finally(() => setFlatLoading(false))
  }, [viewMode])

  // Group flat rows by tag+pallet_number, combining start and end times
  const sheetRows = useMemo(() => {
    const map = new Map<string, any>()
    flatRows.forEach(row => {
      const key = `${row.tag}__${row.pallet_number}`
      if (!map.has(key)) {
        map.set(key, {
          date: row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : '—',
          tag: row.tag,
          batch: row.batch_number,
          product: row.product_type,
          mfg: row.manufacturing_date,
          exp: row.expiry_date,
          pallet: row.pallet_number,
          cases: row.cases_packed,
          serial: row.pallet_serial_number,
          counter: row.counter_name ?? '—',
          start_time: null,
          end_time: null,
        })
      }
      const entry = map.get(key)!
      if (row.time_type === 'start_time') entry.start_time = row.time
      if (row.time_type === 'end_time') entry.end_time = row.time
    })
    return Array.from(map.values())
  }, [flatRows])

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
  const [selectedSheet, setSelectedSheet] = useState<PalletiserSheet | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for Palletiser Sheet
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
      key: "product_type",
      label: "Product Type",
      type: "text" as const,
      placeholder: "Filter by product type"
    }
  ], [])

  // Action handlers
  const handleAddSheet = () => {
    setSelectedSheet(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditSheet = (sheet: PalletiserSheet) => {
    setSelectedSheet(sheet)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewSheet = (sheet: PalletiserSheet) => {
    setSelectedSheet(sheet)
    setViewDrawerOpen(true)
  }

  const handleDeleteSheet = (sheet: PalletiserSheet) => {
    setSelectedSheet(sheet)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedSheet) return

    try {
      await dispatch(deletePalletiserSheetAction(selectedSheet.id!)).unwrap()
      toast.success('Palletiser Sheet deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedSheet(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete palletiser sheet')
    }
  }

  // Get latest sheet for display
  const latestSheet = Array.isArray(sheets) && sheets.length > 0 ? sheets[0] : null

  // Table columns with actions
  const columns = useMemo(() => [
    {
      accessorKey: "sheet_info",
      header: "Sheet",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Grid3X3 className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <FormIdCopy
                  displayId={sheet.tag!}
                  actualId={sheet.id}
                  size="sm"
                />

              </div>
              <p className="text-sm text-gray-500 mt-1">
                <Badge className="bg-blue-100 text-blue-800 font-light">{sheet.batch_number || 'N/A'}</Badge>
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "machine_info",
      header: "Machine",
      cell: ({ row }: any) => {
        const sheet = row.original
        // prefer resolving from machines loaded on this page, fallback to embedded relation
        const machine = machines.find((m: any) => m.id === sheet.machine_id) || sheet.palletiser_sheet_machine_id_fkey
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm font-light">Machine</span>
            </div>
            {machine ? (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  {machine.name}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className="text-xs bg-green-100 text-green-800">
                    {machine.category}
                  </Badge>
                  <Badge className="text-xs bg-gray-100 text-gray-800">
                    {machine.location}
                  </Badge>
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
      accessorKey: "dates",
      header: "Dates",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-orange-600" />
              </div>
              <p className="text-sm font-light">Manufacturing</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Manufacturing Date</span>
                <span className="text-xs font-light">{formatDate(sheet.manufacturing_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Expiry Date</span>
                <span className="text-xs font-light">{formatDate(sheet.expiry_date)}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "approver",
      header: "Approver",
      cell: ({ row }: any) => {
        const sheet = row.original
        // resolve role name from roles loaded in store (use approved_by id only)
        const roleId = sheet.approved_by
        const roleObj = roles ? roles.find((r: any) => r.id === roleId) : undefined
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{roleObj ? (roleObj.role_name || roleObj.name) : 'Not assigned'}</p>
            <p className="text-xs text-gray-500">Supervisor</p>
          </div>
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const sheet = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton
              size="sm"
              onClick={() => handleViewSheet(sheet)}
              className="bg-[#006BC4] text-white rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              size="sm"
              onClick={() => handleEditSheet(sheet)}
              className="bg-[#A0CF06] text-[#211D1E] rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteSheet(sheet)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
              className="rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ], [operationLoading.delete, machines, roles])

  // --- Helper: open view drawer if form_id query param is present ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const formId = searchParams?.get("form_id");
    if (formId && sheets && sheets.length > 0) {
      const foundForm = sheets.find((form: any) => String(form.id) === String(formId));
      if (foundForm) {
        setSelectedSheet(foundForm);
        setViewDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheets]);

  return (
    <DataCaptureDashboardLayout title="Palletiser Sheet" subtitle="Palletising process control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Palletiser Sheet</h1>
            <p className="text-sm font-light text-muted-foreground">Manage palletising forms and process control</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-0.5">
              <button
                onClick={() => setViewMode("management")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "management" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <LayoutList className="w-3.5 h-3.5" /> Records
              </button>
              <button
                onClick={() => setViewMode("sheet")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "sheet" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Table2 className="w-3.5 h-3.5" /> Sheet View
              </button>
            </div>
            <LoadingButton
              onClick={handleAddSheet}
              className="bg-[#006BC4] text-white rounded-full px-6 font-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Palletiser Sheet
            </LoadingButton>
          </div>
        </div>

        {/* Current Sheet Details */}
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestSheet ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4]">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Grid3X3 className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>Current Palletising Sheet</span>
                  {/* show form tag / copy control for latest sheet */}
                  {latestSheet?.tag && (
                    <div className="ml-2">
                      <FormIdCopy displayId={latestSheet.tag!} actualId={latestSheet.id} size="sm" />
                    </div>
                  )}
                  <Badge className="bg-blue-100 text-blue-800 font-light">Latest</Badge>
                </div>
                <LoadingButton
                  onClick={() => handleViewSheet(latestSheet)}
                  className="bg-[#006BC4] text-white rounded-full px-4 py-2 font-light text-sm"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </LoadingButton>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Removed Product column as requested */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Manufacturing Date</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg font-light">
                      {formatDate(latestSheet.manufacturing_date)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Expiry Date </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg font-light">
                      {formatDate(latestSheet.expiry_date)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Batch</p>
                  </div>
                  <p className="text-lg font-light text-green-600">#{latestSheet.batch_number}</p>
                </div>
              </div>

              {/* Show palletiser_sheet_details summary and counter avatar */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Palletiser Details</h4>
                {Array.isArray(latestSheet.palletiser_sheet_details) && latestSheet.palletiser_sheet_details.length > 0 ? (
                  latestSheet.palletiser_sheet_details.map((d: any, idx: number) => {
                    const counterUser = users?.find((u: any) => u.id === d.counter_id)
                    return (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-gray-500">Cases Packed</div>
                            <div className="text-sm font-light">{d.cases_packed ?? 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Serial Number</div>
                            <div className="text-sm font-light">{d.serial_number ?? 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Counter</div>
                            <div className="mt-1">
                              {counterUser ? (
                                <UserAvatar
                                  user={counterUser}
                                  size="md"
                                  showName={true}
                                  showEmail={true}
                                  showDropdown={true}
                                />
                              ) : (
                                <div className="text-xs text-gray-500">No counter assigned</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-xs text-gray-500">No details available</div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Data Table */}
        {!loading && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Palletiser Sheets</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search palletiser sheets..."
                filterFields={filterFields}
              />

              {loading ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : viewMode === "management" ? (
                <DataTable
                  columns={columns}
                  data={filteredSheets}
                  showSearch={false}
                  showExport={true}
                  exportFilename="palletiser-sheet-data"
                />
              ) : flatLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                  Loading sheet data…
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-gray-50">
                        {["Date","Tag","Batch","Product","Mfg Date","Exp Date","Pallet #","Start Time","End Time","Cases Packed","Serial No.","Counter"].map(h => (
                          <th key={h} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetRows.length === 0 ? (
                        <tr><td colSpan={12} className="px-4 py-8 text-center text-gray-400 italic">No data</td></tr>
                      ) : sheetRows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 even:bg-gray-50/20">
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap">{row.date}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap font-mono text-[10px]">{row.tag}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.batch}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100">{row.product}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap">{row.mfg}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap">{row.exp}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center font-medium">{row.pallet}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap tabular-nums">{row.start_time ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap tabular-nums">{row.end_time ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center font-medium text-blue-700">{row.cases}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap font-mono text-[10px]">{row.serial}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100">{row.counter}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <PalletiserSheetDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          sheet={selectedSheet}
          mode={formMode}
          productType={processId}
        />

        {/* View Drawer */}
        <PalletiserSheetViewDrawer
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
          title="Delete Palletiser Sheet"
          description={`Are you sure you want to delete this palletiser sheet? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}