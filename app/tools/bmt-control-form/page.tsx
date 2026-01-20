"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Trash2, Beaker, TrendingUp, Clock, User, Download } from "lucide-react"
import { BMTControlFormDrawer } from "@/components/forms/bmt-control-form-drawer"
import { BMTControlFormViewDrawer } from "@/components/forms/bmt-control-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  fetchBMTControlForms,
  deleteBMTControlFormAction,
  clearError
} from "@/lib/store/slices/bmtControlFormSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { BMTControlForm } from "@/lib/api/bmt-control-form"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { ToolsDashboardLayout } from "@/components/layout/tools-dashboard-layout"
import { siloApi } from "@/lib/api/silo"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"

export default function BMTControlFormPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.bmtControlForms)
  const { items: users, loading: usersLoading, isInitialized: usersInitialized } = useAppSelector((state) => state.users)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)

  // State for silos
  const [silos, setSilos] = useState<any[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingSilos(true)
      const silosResponse = await siloApi.getSilos()
      setSilos(silosResponse.data || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoadingSilos(false)
    }
  }

  // Helper function to get user by ID
  const getUserById = (userId: string) => {
    return users.find((user: any) => user.id === userId)
  }

  // Helper to get user name by ID
  const getUserNameById = (userId: string) => {
    const user = getUserById(userId)
    return user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || user.id : userId || ""
  }

  // Helper to get silo name by ID
  const getSiloNameById = (siloId: string) => {
    const silo = silos.find((s: any) => s.id === siloId)
    return silo ? silo.name : siloId || ""
  }

  // Load BMT control forms on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchBMTControlForms())
      loadInitialData()
    }
  }, [dispatch, isInitialized])

  // Initialize users on component mount
  useEffect(() => {
    if (!usersInitialized || users.length === 0) {
      dispatch(fetchUsers({}))
    }
  }, [dispatch, usersInitialized, users.length])

  // Frontend Filtering Logic
  const filteredForms = useMemo(() => {
    if (!forms) return [];

    return forms.filter((form: BMTControlForm) => {
      // 1. Search filter (by tag)
      if (tableFilters.search) {
        const searchLower = tableFilters.search.toLowerCase();
        const tag = (form.tag || "").toLowerCase();
        if (!tag.includes(searchLower)) return false;
      }

      // 2. Product filter
      if (tableFilters.product && tableFilters.product !== "all") {
        if (form.product !== tableFilters.product) return false;
      }

      // 3. Source Silo filter
      if (tableFilters.source_silo_id) {
        const sourceSiloMatch = (form as any).bmt_control_form_source_silo?.some(
          (s: any) => (s.name || "").toLowerCase().includes(tableFilters.source_silo_id.toLowerCase())
        );
        if (!sourceSiloMatch) return false;
      }

      // 4. Destination Silo filter
      if (tableFilters.destination_silo_id) {
        const destSiloMatch = (form as any).bmt_control_form_destination_silo?.some(
          (s: any) => (s.name || "").toLowerCase().includes(tableFilters.destination_silo_id.toLowerCase())
        );
        if (!destSiloMatch) return false;
      }

      // 5. Date Range filter
      if (tableFilters.dateRange) {
        const formDate = form.created_at ? new Date(form.created_at) : null;
        if (formDate) {
          if (tableFilters.dateRange.from) {
            const from = new Date(tableFilters.dateRange.from);
            from.setHours(0, 0, 0, 0);
            if (formDate < from) return false;
          }
          if (tableFilters.dateRange.to) {
            const to = new Date(tableFilters.dateRange.to);
            to.setHours(23, 59, 59, 999);
            if (formDate > to) return false;
          }
        } else if (tableFilters.dateRange.from || tableFilters.dateRange.to) {
          return false;
        }
      }

      return true;
    });
  }, [forms, tableFilters]);

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
  const [selectedForm, setSelectedForm] = useState<BMTControlForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter fields configuration for BMT control forms
  const filterFields = useMemo(() => [
    {
      key: "product",
      label: "Product",
      type: "select" as const,
      placeholder: "Select Product",
      options: [
        { label: "Raw Milk", value: "Raw Milk" },
        { label: "Skim Milk", value: "Skim Milk" },
        { label: "Standardized Milk", value: "Standardized Milk" },
        { label: "Pasteurized Milk", value: "Pasteurized Milk" }
      ]
    },
    {
      key: "source_silo_id",
      label: "Source Silo",
      type: "text" as const,
      placeholder: "Filter by source silo"
    },
    {
      key: "destination_silo_id",
      label: "Destination Silo",
      type: "text" as const,
      placeholder: "Filter by destination silo"
    },
    {
      key: "llm_operator_id",
      label: "LLM Operator",
      type: "text" as const,
      placeholder: "Filter by LLM operator"
    }
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: BMTControlForm) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: BMTControlForm) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: BMTControlForm) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return

    try {
      await dispatch(deleteBMTControlFormAction(selectedForm.id!)).unwrap()
      toast.success('BMT Control Form deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete BMT control form')
    }
  }

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!filteredForms || filteredForms.length === 0) {
      toast.error("No forms to export")
      return
    }

    const headers = [
      "Tag", "Product", "Volume (L)", "Movement Start", "Movement End",
      "Status", "Dispatch Operator", "Receiver Operator", "Created At"
    ]

    const rows = filteredForms.map((form: any) => [
      form.tag,
      form.product,
      form.volume ?? "",
      form.movement_start ? new Date(form.movement_start).toLocaleString() : "",
      form.movement_end ? new Date(form.movement_end).toLocaleString() : "",
      form.status,
      getUserNameById(form.dispatch_operator_id || form.llm_operator_id),
      getUserNameById(form.receiver_operator_id || form.dpp_operator_id),
      form.created_at ? new Date(form.created_at).toLocaleString() : ""
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\r\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "bmt_control_forms.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Table columns
  const columns = [
    {
      accessorKey: "tag",
      header: "Form ID",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <FormIdCopy
            displayId={form.tag}
            actualId={form.id}
            size="sm"
          />
        )
      },
    },
    {
      accessorKey: "volume",
      header: "Movement",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">Vol: {form.volume}L</p>
            <p className="text-xs text-gray-500">
              {form.movement_start ? new Date(form.movement_start).toLocaleTimeString() : 'N/A'} -
              {form.movement_end ? new Date(form.movement_end).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }: any) => <span className="text-sm font-light">{row.original.product}</span>,
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
            <p className="text-xs text-gray-500 italic">
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
              size="sm"
              onClick={() => handleViewForm(form)}
              className="bg-[#006BC4] text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteForm(form)}
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
  ]

  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null

  return (
    <ToolsDashboardLayout title="BMT Control Forms" subtitle="Bulk Milk Transfer control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">BMT Control Forms</h1>
            <p className="text-sm font-light text-muted-foreground transition-all">Manage bulk milk transfer control forms</p>
          </div>
          <div className="flex gap-2">
            <LoadingButton
              onClick={handleExportCSV}
              className="bg-[#A0D001] hover:bg-[#8AB801] text-white border-0 rounded-full px-6 py-2 font-light"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </LoadingButton>
            <LoadingButton
              onClick={handleAddForm}
              className="bg-[#006BC4] text-white border-0 rounded-full px-6 py-2 font-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add BMT Form
            </LoadingButton>
          </div>
        </div>

        {/* Current Form Details */}
        {!loading && latestForm && (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4] shadow-none overflow-hidden transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Beaker className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium">Latest BMT Form</span>
                      <Badge variant="secondary" className="font-light bg-blue-50 text-blue-700 border-blue-100">Live</Badge>
                    </div>
                    <FormIdCopy displayId={latestForm.tag} actualId={latestForm.tag} size="sm" />
                  </div>
                </div>
                <LoadingButton
                  onClick={() => handleViewForm(latestForm)}
                  variant="outline"
                  className="rounded-full px-4 h-10"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Detailed View
                </LoadingButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                  <p className="text-xs font-medium uppercase text-gray-500">Product</p>
                  <p className="text-xl font-light text-blue-600">{latestForm.product}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                  <p className="text-xs font-medium uppercase text-gray-500">Total Volume</p>
                  <p className="text-xl font-light text-green-600">{latestForm.volume} L</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                  <p className="text-xs font-medium uppercase text-gray-500">Date Captured</p>
                  <p className="text-xl font-light">{latestForm.created_at ? new Date(latestForm.created_at).toLocaleDateString('en-GB') : 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Dispatch */}
                <div className="p-4 border rounded-xl bg-white shadow-none flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400">Dispatch Operator</p>
                      <p className="text-sm font-medium">{getUserNameById((latestForm as any).dispatch_operator_id || latestForm.llm_operator_id) || "Unassigned"}</p>
                    </div>
                  </div>
                </div>
                {/* Receiver */}
                <div className="p-4 border rounded-xl bg-white shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400">Receiver Operator</p>
                      <p className="text-sm font-medium">{getUserNameById((latestForm as any).receiver_operator_id || latestForm.dpp_operator_id) || "Unassigned"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List Section */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-none">
          <div className="p-6 border-b bg-gray-50/30">
            <h2 className="text-lg font-medium text-gray-800">History & Records</h2>
          </div>
          <div className="p-6 space-y-4">
            <DataTableFilters
              filters={tableFilters}
              onFiltersChange={setTableFilters}
              searchPlaceholder="Search by tag (e.g. BMT-001)..."
              filterFields={filterFields}
            />

            {loading ? (
              <ContentSkeleton sections={1} cardsPerSection={5} />
            ) : (
              <DataTable
                columns={columns}
                data={filteredForms}
                showSearch={false}
                searchKey="tag"
              />
            )}
          </div>
        </div>

        {/* Drawers */}
        <BMTControlFormDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          form={selectedForm}
          mode={formMode}
        />

        <BMTControlFormViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          form={selectedForm}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditForm(selectedForm!)
          }}
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete BMT Control Form"
          description="Are you sure you want to delete this form? This action cannot be undone."
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </ToolsDashboardLayout>
  )
}
