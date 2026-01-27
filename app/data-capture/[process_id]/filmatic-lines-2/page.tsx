"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Factory, TrendingUp, FileText, Clock, Package, ArrowRight, Beaker, Sun, Moon } from "lucide-react"
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

  // Filter fields configuration for Filmatic Lines Form 2
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
      toast.success('Filmatic Lines Form 2 deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete Filmatic Lines Form 2')
    }
  }

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
      <DataCaptureDashboardLayout title="Filmatic Lines Form 2" subtitle="Filmatic lines form 2 production control and monitoring">
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
                {form.date ? new Date(form.date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "production_info",
      header: "Production Info",
      cell: ({ row }: any) => {
        const form = row.original
        const dayShiftCount = form.filmatic_line_form_2_day_shift?.length || 0
        const nightShiftCount = form.filmatic_line_form_2_night_shift?.length || 0
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-light">Production</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Day Shift</span>
                <span className="text-xs font-light">{dayShiftCount} entries</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Night Shift</span>
                <span className="text-xs font-light">{nightShiftCount} entries</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "groups_info",
      header: "Groups",
      cell: ({ row }: any) => {
        const form = row.original
        const groups = form.groups
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-light">Groups</span>
            </div>
            <div className="space-y-1">
              {groups ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Group A</span>
                    <span className="text-xs font-light">{groups.group_a?.length || 0} members</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Group B</span>
                    <span className="text-xs font-light">{groups.group_b?.length || 0} members</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Group C</span>
                    <span className="text-xs font-light">{groups.group_c?.length || 0} members</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400">No groups assigned</div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "shifts_info",
      header: "Shifts",
      cell: ({ row }: any) => {
        const form = row.original
        const dayShiftHasData = form.filmatic_line_form_2_day_shift?.length > 0
        const nightShiftHasData = form.filmatic_line_form_2_night_shift?.length > 0
        const dayShiftApproved = dayShiftHasData && form.filmatic_line_form_2_day_shift.some((shift: any) => shift.supervisor_approve)
        const nightShiftApproved = nightShiftHasData && form.filmatic_line_form_2_night_shift.some((shift: any) => shift.supervisor_approve)

        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                <Sun className="h-3 w-3 text-yellow-600" />
              </div>
              <span className="text-sm font-light">Shifts</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Day</span>
                <span className={`text-xs font-light ${dayShiftApproved ? 'text-green-600' :
                  dayShiftHasData ? 'text-yellow-600' : 'text-gray-400'
                  }`}>
                  {dayShiftApproved ? 'Approved' : dayShiftHasData ? 'Pending' : 'No Data'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Night</span>
                <span className={`text-xs font-light ${nightShiftApproved ? 'text-green-600' :
                  nightShiftHasData ? 'text-yellow-600' : 'text-gray-400'
                  }`}>
                  {nightShiftApproved ? 'Approved' : nightShiftHasData ? 'Pending' : 'No Data'}
                </span>
              </div>
            </div>
          </div>
        )
      },
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
    <DataCaptureDashboardLayout title="Filmatic Lines Form 2" subtitle="Filmatic lines form 2 production control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Filmatic Lines Form 2</h1>
            <p className="text-sm font-light text-muted-foreground">Manage Filmatic lines form 2 production data and process control</p>
          </div>
          <LoadingButton
            onClick={handleAddForm}
            className="bg-[#006BC4] text-white rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Filmatic Lines Form 2
          </LoadingButton>
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
                  <span>Current Filmatic Lines Form 2</span>
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
                      <span className="text-xs font-light text-gray-600">Day Shift Entries</span>
                      <span className="text-xs font-light text-blue-600">{latestForm.filmatic_line_form_2_day_shift?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Night Shift Entries</span>
                      <span className="text-xs font-light text-blue-600">{latestForm.filmatic_line_form_2_night_shift?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Total Details</span>
                      <span className="text-xs font-light text-green-600">
                        {(latestForm.filmatic_line_form_2_day_shift?.reduce((acc: number, shift: any) => acc + (shift.filmatic_line_form_2_day_shift_details?.length || 0), 0) || 0) +
                          (latestForm.filmatic_line_form_2_night_shift?.reduce((acc: number, shift: any) => acc + (shift.filmatic_line_form_2_night_shift_details?.length || 0), 0) || 0)}
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
              <div className="text-lg font-light">Filmatic Lines Form 2 Records</div>
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
              ) : (
                <DataTable columns={columns} data={filteredForms} showSearch={false} />
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
          title="Delete Filmatic Lines Form 2"
          description={`Are you sure you want to delete this Filmatic lines form 2 record? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={loading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}