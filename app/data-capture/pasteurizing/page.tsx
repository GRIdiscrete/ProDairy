"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, FlaskConical, TrendingUp, FileText, Clock, Package, ArrowRight, User } from "lucide-react"
import { PasteurizingFormDrawer } from "@/components/forms/pasteurizing-form-drawer"
import { PasteurizingFormViewDrawer } from "@/components/forms/pasteurizing-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { RootState, useAppDispatch, useAppSelector } from "@/lib/store"
import {
  fetchPasteurizingForms,
  deletePasteurizingForm,
  clearError
} from "@/lib/store/slices/pasteurizingSlice"
import { fetchStandardizingForms } from "@/lib/store/slices/standardizingSlice"
import { fetchMachines } from "@/lib/store/slices/machineSlice"
import { fetchBMTControlForms } from "@/lib/store/slices/bmtControlFormSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { PasteurizingForm } from "@/lib/api/pasteurizing"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useRouter, useSearchParams } from "next/navigation"

export default function PasteurizingPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.pasteurizing)
  const { machines } = useAppSelector((state) => state.machine)
  const { forms: bmtForms } = useAppSelector((state) => state.bmtControlForms)
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)

  const getBMTFormById = (bmtId: string) => {
    return bmtForms.find((form: any) => form.id === bmtId)
  }
  // Load pasteurizing forms and related data on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchPasteurizingForms())
      dispatch(fetchStandardizingForms()) // Load standardizing forms for the form drawer
      dispatch(fetchMachines({})) // Load machines for display
      dispatch(fetchBMTControlForms()) // Load BMT forms for display
      dispatch(fetchUsers({})) // Load users for operator information

    }
  }, [dispatch, isInitialized])

  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchPasteurizingForms())
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

  // Selected form and mode
  const [selectedForm, setSelectedForm] = useState<PasteurizingForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for Pasteurizing
  const filterFields = useMemo(() => [
    {
      key: "created_at",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "machine",
      label: "Machine",
      type: "text" as const,
      placeholder: "Filter by machine"
    },
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: PasteurizingForm) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: PasteurizingForm) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: PasteurizingForm) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return

    try {
      await dispatch(deletePasteurizingForm(selectedForm.id)).unwrap()
      toast.success('Pasteurizing Form deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete pasteurizing form')
    }
  }

  // Get latest form for display
  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null

  // Helper functions to get names from IDs
  const getMachineName = (form: any) => {
    if (!form) return 'Unknown Machine'

    if (form.steri_milk_pasteurizing_form_machine_fkey) {
      return form.steri_milk_pasteurizing_form_machine_fkey.name
    }
    if (form.machine) {
      const machine = machines.find(m => m.id === form.machine)
      return machine ? machine.name : `Machine #${form.machine.slice(0, 8)}`
    }
    return 'Unknown Machine'
  }


  const getBMTFormInfo = (form: any) => {
    if (!form) return { name: 'Unknown BMT Form', product: 'Unknown', volume: 0 }

    if (form.steri_milk_pasteurizing_form_bmt_fkey) {
      return {
        name: `BMT Form #${form.bmt?.slice(0, 8) || 'Unknown'}`,
        product: form.steri_milk_pasteurizing_form_bmt_fkey.product || 'Unknown',
        volume: form.steri_milk_pasteurizing_form_bmt_fkey.volume
      }
    }
    if (form.bmt) {
      const bmtForm = bmtForms.find(b => b.id === form.bmt)
      return bmtForm ? {
        name: `BMT Form #${form.bmt.slice(0, 8)}`,
        product: bmtForm.product,
        volume: bmtForm.volume
      } : {
        name: `BMT #${form.bmt.slice(0, 8)}`,
        product: 'Unknown',
        volume: 0
      }
    }
    return {
      name: 'Unknown BMT',
      product: 'Unknown',
      volume: 0
    }
  }

  // helper: format possible backend time value which may be "HH:mm:ss" or full ISO/backend datetime
  const formatTimeValue = (val: string | undefined | null) => {
    // falsy
    if (!val) return "N/A"

    // time-only like "23:00:00" or "23:00"
    const timeOnlyMatch = val.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/)
    if (timeOnlyMatch) {
      // return HH:MM
      return timeOnlyMatch[1]
    }

    // try Date parsing for ISO or backend datetime with date part
    const parsed = new Date(val)
    if (!isNaN(parsed.getTime())) {
      // format to locale time (hours:minutes)
      return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // fallback
    return "N/A"
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "form_info",
      header: "Form",
      cell: ({ row }: any) => {
        const form = row.original
        const totalProduction = form.steri_milk_pasteurizing_form_production?.reduce((sum: number, item: any) => sum + (item.output_target_value || 0), 0) || 0
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <FormIdCopy
                  displayId={form.tag}
                  actualId={form.id}
                  size="sm"
                />
                <Badge className="bg-blue-100 text-blue-800 font-light">{totalProduction}L</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(form.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "operator_info",
      header: "Operator",
      cell: ({ row }: any) => {
        const form = row.original
        const operatorId = form.operator
        const operatorUser = users.find((user: any) => user.id === operatorId)

        if (operatorUser) {
          return (
            <UserAvatar
              user={operatorUser}
              size="md"
              showName={true}
              showEmail={true}
              showDropdown={true}
            />
          )
        }

        // Show unknown operator when no user match found
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <div className="text-sm font-light text-gray-400">Unknown Operator</div>
              <div className="text-xs text-gray-500">No user data</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "machine_info",
      header: "Machine",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-light">Machine</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                {getMachineName(form)}
              </p>
              <div className="flex items-center space-x-2">
                <Badge className="text-xs bg-blue-100 text-blue-800">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "production",
      header: "Production",
      cell: ({ row }: any) => {
        const form = row.original
        const totalQuantity = form.steri_milk_pasteurizing_form_production?.reduce((sum: number, item: any) => sum + (item.output_target_value || 0), 0) || 0
        const avgFat = form.fat || 0
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <FlaskConical className="w-3 h-3 text-blue-600" />
              </div>
              <p className="text-sm font-light">
                {form.steri_milk_pasteurizing_form_production?.length || 0} entries
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Qty</span>
                <span className="text-xs font-light">{totalQuantity.toFixed(1)}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Fat Content</span>
                <span className="text-xs font-light">{avgFat}%</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "timing",
      header: "Timing",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-orange-600" />
              </div>
              <p className="text-sm font-light">
                Process Times
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Start</span>
                <span className="text-xs font-light">
                  {formatTimeValue(form.production_start)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">End</span>
                <span className="text-xs font-light">
                  {formatTimeValue(form.production_end)}
                </span>
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
        const form = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {form.updated_at ? `Updated: ${new Date(form.updated_at).toLocaleDateString()}` : 'Never updated'}
            </p>
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
  ]

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

  return (
    <DataCaptureDashboardLayout title="Pasteurizing" subtitle="Milk pasteurizing process control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Pasteurizing</h1>
            <p className="text-sm font-light text-muted-foreground">Manage milk pasteurizing forms and process control</p>
          </div>
          <LoadingButton
            onClick={handleAddForm}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Pasteurizing Form
          </LoadingButton>
        </div>

        {/* Current Form Details */}
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestForm ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <FlaskConical className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Pasteurizing Process</span>
                  <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-light">Latest</Badge>
                </div>
                <LoadingButton
                  variant="outline"
                  onClick={() => handleViewForm(latestForm)}
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
                    <p className="text-sm font-light text-gray-600">Form ID</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FormIdCopy
                      displayId={latestForm?.tag}
                      actualId={latestForm.id}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FlaskConical className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Production</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">
                    {latestForm.steri_milk_pasteurizing_form_production?.reduce((sum: number, item: any) => sum + (item.output_target_value || 0), 0).toFixed(1)}L
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Created</p>
                  </div>
                  <p className="text-lg font-light">{new Date(latestForm.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Fat Content</p>
                  </div>
                  <p className="text-lg font-light text-green-600">
                    {latestForm.fat}%
                  </p>
                </div>
              </div>

              {/* Machine and Process Details in Row */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Machine Details */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Machine & Equipment</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Machine</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-light">{getMachineName(latestForm)}</span>
                        <CopyButton text={latestForm.machine} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">BMT Form</span>
                      <div className="flex items-center space-x-2">
                        <FormIdCopy
                          displayId={getBMTFormById(latestForm.bmt)?.tag}
                          actualId={latestForm.bmt}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Summary */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <FlaskConical className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Process Summary</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Production Entries</span>
                      <span className="text-xs font-light text-blue-600">{latestForm.steri_milk_pasteurizing_form_production?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Total Volume</span>
                      <span className="text-xs font-light text-blue-600">
                        {latestForm.steri_milk_pasteurizing_form_production?.reduce((sum: number, item: any) => sum + (item.output_target_value || 0), 0).toFixed(1)}L
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-light text-gray-600">Fat Content</span>
                      <span className="text-xs font-light text-green-600">{latestForm.fat}%</span>
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
              <div className="text-lg font-light">Pasteurizing Forms</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search pasteurizing forms..."
                filterFields={filterFields}
              />

              {loading ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable columns={columns} data={forms} showSearch={false} />
              )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <PasteurizingFormDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          form={selectedForm}
          mode={formMode}
        />

        {/* View Drawer */}
        <PasteurizingFormViewDrawer
          open={viewDrawerOpen}
          onOpenChange={setViewDrawerOpen}
          form={selectedForm}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditForm(selectedForm!)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Pasteurizing Form"
          description={`Are you sure you want to delete this pasteurizing form? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
