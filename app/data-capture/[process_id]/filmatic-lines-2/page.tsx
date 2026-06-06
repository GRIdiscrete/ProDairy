"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Factory, TrendingUp, FileText, Clock, Package, ArrowRight, Beaker, Sun, Moon, LayoutList, Table2, Download } from "lucide-react"
import { exportToExcel } from "@/lib/utils/export-excel"
import { FilmaticLinesForm2Drawer } from "@/components/forms/filmatic-lines-form-2-drawer"
import { FilmaticLinesForm2ViewDrawer } from "@/components/forms/filmatic-lines-form-2-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { useAppDispatch, useAppSelector, RootState } from "@/lib/store"
import {
  fetchFilmaticLinesForm2s,
  deleteFilmaticLinesForm2,
  clearError
} from "@/lib/store/slices/filmaticLinesForm2Slice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchBMTControlForms } from "@/lib/store/slices/bmtControlFormSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { FilmaticLinesForm2 } from "@/lib/api/filmatic-lines-form-2"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"

export default function FilmaticLines2Page() {
  const params = useParams()
  const processId = params.process_id as string

  const dispatch = useAppDispatch()
  const { forms, loading, error, isInitialized } = useAppSelector((state) => state.filmaticLinesForm2)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)

  // Load Filmatic lines form 2 data on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchFilmaticLinesForm2s())
      // load users and bmt forms for display
      dispatch(fetchUsers({}))
      dispatch(fetchBMTControlForms())
    }
  }, [dispatch, isInitialized])

  // Frontend Filtering Logic
  const filteredForms = useMemo(() => {
    if (!forms) return []

    return forms.filter((form: FilmaticLinesForm2) => {
      // 1. Search filter (Global search)
      if (tableFilters.search) {
        const searchLower = tableFilters.search.toLowerCase()
        const tag = String(form.tag || "").toLowerCase()
        const date = form.date ? new Date(form.date).toLocaleDateString().toLowerCase() : ""

        if (!tag.includes(searchLower) && !date.includes(searchLower)) return false
      }

      // 2. Specific filter fields
      if (tableFilters.created_at) {
        const filterDate = new Date(tableFilters.created_at)
        const formDate = new Date(form.date || form.created_at!)
        if (filterDate.toDateString() !== formDate.toDateString()) return false
      }

      if (tableFilters.holding_tank_bmt) {
        // Holding tank BMT is complex to filter on client side if not in main object,
        // but let's assume it's a searchable string if provided.
        // If it's intended to filter by the BMT form tag, we'd need a map or joined data.
        // For now, simpler filtering.
      }

      if (tableFilters.approved !== undefined) {
        const isApproved = tableFilters.approved === "true"
        if (form.approved !== isApproved) return false
      }

      // 3. Date Range filter
      if (tableFilters.dateRange) {
        const formDate = new Date(form.date || form.created_at!)
        if (tableFilters.dateRange.from) {
          const from = new Date(tableFilters.dateRange.from)
          from.setHours(0, 0, 0, 0)
          if (formDate < from) return false
        }
        if (tableFilters.dateRange.to) {
          const to = new Date(tableFilters.dateRange.to)
          to.setHours(23, 59, 59, 999)
          if (formDate > to) return false
        }
      }

      return true
    })
  }, [forms, tableFilters])

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

  // Selected form and mode
  const [selectedForm, setSelectedForm] = useState<FilmaticLinesForm2 | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for Steri After Autoclave
  const filterFields = useMemo(() => [
    {
      key: "created_at",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "holding_tank_bmt",
      label: "Holding Tank",
      type: "text" as const,
      placeholder: "Filter by holding tank"
    },
    {
      key: "approved",
      label: "Status",
      type: "select" as const,
      placeholder: "Filter by approval status",
      options: [
        { value: "true", label: "Approved" },
        { value: "false", label: "Pending" }
      ]
    }
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: FilmaticLinesForm2) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: FilmaticLinesForm2) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: FilmaticLinesForm2) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return

    try {
      await dispatch(deleteFilmaticLinesForm2(selectedForm.id!)).unwrap()
      toast.success('Steri After Autoclave deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete Steri After Autoclave')
    }
  }

  const [viewMode, setViewMode] = useState<"management" | "sheet">("management")

  const sheetRows = useMemo(() => {
    const rows: any[] = []
    filteredForms.forEach(form => {
      form.day_shift_id?.shift_details?.forEach((detail: any, i: number) => {
        const st = detail.stoppage_time?.[0]
        rows.push({
          date: form.date ? new Date(form.date).toLocaleDateString('en-GB') : '—',
          tag: form.tag,
          shift: "Day",
          time: detail.time ?? '—',
          pallets: detail.pallets,
          target: detail.target,
          variance: detail.pallets != null && detail.target != null ? detail.pallets - detail.target : null,
          setbacks: detail.setbacks,
          capper_1: st?.capper_1,
          capper_2: st?.capper_2,
          sleever_1: st?.sleever_1,
          sleever_2: st?.sleever_2,
          shrink_1: st?.shrink_1,
          shrink_2: st?.shrink_2,
          opening: i === 0 ? form.day_shift_opening_bottles : null,
          closing: i === 0 ? form.day_shift_closing_bottles : null,
          waste: i === 0 ? form.day_shift_waste_bottles : null,
          shiftType: "day",
        })
      })
      form.night_shift_id?.shift_details?.forEach((detail: any, i: number) => {
        const st = detail.stoppage_time?.[0]
        rows.push({
          date: form.date ? new Date(form.date).toLocaleDateString('en-GB') : '—',
          tag: form.tag,
          shift: "Night",
          time: detail.time ?? '—',
          pallets: detail.pallets,
          target: detail.target,
          variance: detail.pallets != null && detail.target != null ? detail.pallets - detail.target : null,
          setbacks: detail.setbacks,
          capper_1: st?.capper_1,
          capper_2: st?.capper_2,
          sleever_1: st?.sleever_1,
          sleever_2: st?.sleever_2,
          shrink_1: st?.shrink_1,
          shrink_2: st?.shrink_2,
          opening: i === 0 ? form.night_shift_opening_bottles : null,
          closing: i === 0 ? form.night_shift_closing_bottles : null,
          waste: i === 0 ? form.night_shift_waste_bottles : null,
          shiftType: "night",
        })
      })
    })
    return rows
  }, [filteredForms])

  // Get latest form for display
  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null
  // selectors for users and BMT forms
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const { forms: bmtForms } = useAppSelector((state: RootState) => state.bmtControlForms)

  // --- Query param handling ---
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // --- Helper: open view drawer if form_id query param is present ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const formId = searchParams?.get("form_id");
    if (formId && forms && forms.length > 0) {
      const foundForm = forms.find((form: any) => String(form.id) === String(formId));
      if (foundForm) {
        setSelectedForm(foundForm);
        setViewDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forms]);

  if (loading.fetch) {
    return (
      <DataCaptureDashboardLayout title="Steri After Autoclave" subtitle="Steri after autoclave production control and monitoring">
        <ContentSkeleton sections={1} cardsPerSection={4} />
      </DataCaptureDashboardLayout>
    )
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "form_info",
      header: "Form",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Factory className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <FormIdCopy
                  displayId={form.tag!}
                  actualId={form.id}
                  size="sm"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(form.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "shifts_present",
      header: "Shifts",
      cell: ({ row }: any) => {
        const form = row.original
        const hasDay = !!form.day_shift_id
        const hasNight = !!form.night_shift_id
        return (
          <div className="flex space-x-1">
            {hasDay && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Sun className="w-3 h-3 mr-1" /> Day
              </Badge>
            )}
            {hasNight && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Moon className="w-3 h-3 mr-1" /> Night
              </Badge>
            )}
            {!hasDay && !hasNight && <span className="text-gray-400">None</span>}
          </div>
        )
      }
    },
    {
      accessorKey: "production_info",
      header: "Production Info",
      cell: ({ row }: any) => {
        const form = row.original as FilmaticLinesForm2
        const dayPallets = form.day_shift_id?.shift_details?.reduce((acc, detail) => acc + (detail.pallets || 0), 0) || 0
        const nightPallets = form.night_shift_id?.shift_details?.reduce((acc, detail) => acc + (detail.pallets || 0), 0) || 0
        const totalPallets = dayPallets + nightPallets
        return (
          <div className="flex flex-col text-xs font-light">
            <span className="text-gray-500">Total: {totalPallets} pallets</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-yellow-600 font-medium">{dayPallets}d</span>
              <span className="text-gray-300">|</span>
              <span className="text-blue-600 font-medium">{nightPallets}n</span>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "approved",
      header: "Status",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <Badge className={form.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
            {form.approved ? "Approved" : "Pending"}
          </Badge>
        )
      }
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton

              size="sm"
              onClick={() => handleViewForm(form)}
              className="bg-[#006BC4] text-white rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton

              size="sm"
              onClick={() => handleEditForm(form)}
              className="bg-[#A0CF06] text-[#211D1E] rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteForm(form)}
              loading={loading.delete}
              disabled={loading.delete}
              className="rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  return (
    <DataCaptureDashboardLayout title="Steri After Autoclave" subtitle="Steri after autoclave production control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Steri After Autoclave</h1>
            <p className="text-sm font-light text-muted-foreground">Manage Filmatic lines form 2 production data and process control</p>
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
            {viewMode === "sheet" && (
              <LoadingButton
                onClick={() => exportToExcel(
                  ["date","tag","shift","time","pallets","target","variance","setbacks","capper_1","capper_2","sleever_1","sleever_2","shrink_1","shrink_2","opening","closing","waste"]
                    .map(k => ({ header: k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()), key: k, getValue: (row: any) => row[k] ?? "—" })),
                  sheetRows,
                  "steri-after-autoclave"
                )}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-full px-4 py-2 font-light"
              >
                <Download className="mr-2 h-4 w-4" /> Export Excel
              </LoadingButton>
            )}
            <LoadingButton
              onClick={handleAddForm}
              className="bg-[#006BC4] text-white rounded-full px-6 py-2 font-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Steri After Autoclave
            </LoadingButton>
          </div>
        </div>

        {/* Current Form Details */}
        {loading.fetch ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4]">
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
        ) : latestForm ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4]">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Factory className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>Current Steri After Autoclave</span>
                  <Badge className="bg-blue-100 text-blue-800 font-light">Latest</Badge>
                </div>
                <LoadingButton
                  onClick={() => handleViewForm(latestForm)}
                  className="bg-[#006BC4] text-white rounded-full px-4 py-2 font-light text-sm"
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
                    <p className="text-sm font-light text-gray-600">Form</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FormIdCopy displayId={latestForm.tag!} actualId={latestForm.id!} size="sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Date</p>
                  </div>
                  <p className="text-lg font-light">{latestForm.date ? new Date(latestForm.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Status</p>
                  </div>
                  <Badge className={`${latestForm.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} font-light`}>
                    {latestForm.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Bottles (Day / Night)</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-light">Opening</span>
                      <span className="font-medium">{latestForm.day_shift_opening_bottles ?? '—'} / {latestForm.night_shift_opening_bottles ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-light">Closing</span>
                      <span className="font-medium">{latestForm.day_shift_closing_bottles ?? '—'} / {latestForm.night_shift_closing_bottles ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-light">Waste</span>
                      <span className="font-medium">{latestForm.day_shift_waste_bottles ?? '—'} / {latestForm.night_shift_waste_bottles ?? '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Flow Information */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Production Summary */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Production Summary</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Day Shift Details</span>
                      <span className="text-xs font-light text-blue-600">{latestForm.day_shift_id?.shift_details?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Night Shift Details</span>
                      <span className="text-xs font-light text-blue-600">{latestForm.night_shift_id?.shift_details?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Total Detailed Entries</span>
                      <span className="text-xs font-light text-green-600">
                        {(latestForm.day_shift_id?.shift_details?.length || 0) +
                          (latestForm.night_shift_id?.shift_details?.length || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Groups & Approval Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Groups & Status</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Groups Assigned</span>
                      <span className="text-xs font-light text-green-600">{latestForm.groups ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Manager</span>
                      <div>
                        {(() => {
                          const managerId = latestForm.groups?.manager_id
                          const managerUser = users.find((u: any) => u.id === managerId)
                          return managerUser ? (
                            <UserAvatar user={managerUser} size="md" showName={true} showEmail={true} showDropdown={true} />
                          ) : (
                            <span className="text-xs font-light text-blue-600">{managerId ? managerId.slice(0, 8) : 'N/A'}</span>
                          )
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Approval</span>
                      <span className="text-xs font-light text-blue-600">{latestForm.approved ? 'Approved' : 'Pending'}</span>
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
              <div className="text-lg font-light">Steri After Autoclave Records</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search Filmatic lines form 2 records..."
                filterFields={filterFields}
              />

              {loading.fetch ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : viewMode === "management" ? (
                <DataTable
                  columns={columns}
                  data={filteredForms}
                  showSearch={false}
                  showExport={true}
                  exportFilename="filmatic-lines-form-2-data"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-gray-50">
                        {["Date","Tag","Shift","Time","Pallets","Target","Var","Reason","Capper 1","Capper 2","Sleever 1","Sleever 2","Shrink 1","Shrink 2","Opening","Closing","Waste"].map(h => (
                          <th key={h} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetRows.length === 0 ? (
                        <tr><td colSpan={17} className="px-4 py-8 text-center text-gray-400 italic">No data</td></tr>
                      ) : sheetRows.map((row, i) => (
                        <tr key={i} className={row.shiftType === "day" ? "bg-yellow-50/40 hover:bg-yellow-50/70" : "bg-blue-50/40 hover:bg-blue-50/70"}>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap">{row.date}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap font-mono text-[10px]">{row.tag}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${row.shiftType === "day" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>{row.shift}</span>
                          </td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap">{row.time}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.pallets ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.target ?? '—'}</td>
                          <td className={`px-2 py-1.5 border-b border-r border-gray-100 text-center font-medium ${row.variance != null && row.variance < 0 ? 'text-red-600' : row.variance != null && row.variance > 0 ? 'text-green-600' : ''}`}>{row.variance ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 max-w-[160px] truncate" title={row.setbacks}>{row.setbacks || '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.capper_1 ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.capper_2 ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.sleever_1 ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.sleever_2 ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.shrink_1 ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.shrink_2 ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-right tabular-nums">{row.opening?.toLocaleString() ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-right tabular-nums">{row.closing?.toLocaleString() ?? '—'}</td>
                          <td className="px-2 py-1.5 border-b border-r border-gray-100 text-right tabular-nums text-red-600">{row.waste?.toLocaleString() ?? '—'}</td>
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
        <FilmaticLinesForm2Drawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          form={selectedForm}
          mode={formMode}
          processId={processId}
        />

        {/* View Drawer */}
        <FilmaticLinesForm2ViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          form={selectedForm}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Steri After Autoclave"
          description={`Are you sure you want to delete this Filmatic lines form 2 record? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={loading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}