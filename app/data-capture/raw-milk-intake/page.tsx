"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Droplets, TrendingUp, FileText, Clock, Truck, Package, User } from "lucide-react"
import { RawMilkIntakeFormDrawer } from "@/components/forms/raw-milk-intake-form-drawer"
import { RawMilkIntakeFormViewDrawer } from "@/components/forms/raw-milk-intake-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import type { RootState } from "@/lib/store"
import {
  fetchRawMilkIntakeForms,
  deleteRawMilkIntakeForm,
  clearError
} from "@/lib/store/slices/rawMilkIntakeSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchSilos } from "@/lib/store/slices/siloSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { RawMilkIntakeForm } from "@/lib/api/raw-milk-intake"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { useRouter, useSearchParams } from "next/navigation"

export default function RawMilkIntakePage() {
  const dispatch = useAppDispatch()
  const {
    rawMilkIntakeForms,
    operationLoading,
    error
  } = useAppSelector((state) => state.rawMilkIntake)
  const { items: users } = useAppSelector((state: RootState) => state.users)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null

  // Load raw milk intake forms and related data on initial mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchRawMilkIntakeForms())
      dispatch(fetchUsers({})) // Load users for operator information
      dispatch(fetchSilos({})) // Load silos for destination information
    }
  }, [dispatch])

  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Selected form and mode
  const [selectedForm, setSelectedForm] = useState<RawMilkIntakeForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Frontend Filtering Logic
  const filteredForms = useMemo(() => {
    if (!rawMilkIntakeForms) return []

    return rawMilkIntakeForms.filter((form: RawMilkIntakeForm) => {
      // 1. Search filter (Global search)
      if (tableFilters.search) {
        const searchLower = tableFilters.search.toLowerCase()
        const tag = (form.tag || "").toLowerCase()
        const truck = (form.truck || "").toLowerCase()
        const siloNames = form.details.map(d => (d.silo_name || "").toLowerCase()).join(" ")

        if (!tag.includes(searchLower) &&
          !truck.includes(searchLower) &&
          !siloNames.includes(searchLower)) return false
      }

      // 2. Specific filter fields
      if (tableFilters.truck) {
        const truckLower = tableFilters.truck.toLowerCase()
        if (!(form.truck || "").toLowerCase().includes(truckLower)) return false
      }

      if (tableFilters.tag) {
        const tagLower = tableFilters.tag.toLowerCase()
        if (!(form.tag || "").toLowerCase().includes(tagLower)) return false
      }

      // 3. Date Range filter
      if (tableFilters.dateRange && form.created_at) {
        const formDate = new Date(form.created_at)
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
  }, [rawMilkIntakeForms, tableFilters])

  // Filter fields configuration for Raw Milk Intake
  const filterFields = useMemo(() => [
    {
      key: "truck",
      label: "Truck",
      type: "text" as const,
      placeholder: "Filter by truck"
    },
    {
      key: "tag",
      label: "Intake Tag",
      type: "text" as const,
      placeholder: "Filter by intake tag"
    }
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: RawMilkIntakeForm) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: RawMilkIntakeForm) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: RawMilkIntakeForm) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return

    try {
      await dispatch(deleteRawMilkIntakeForm(selectedForm.id)).unwrap()
      toast.success('Raw Milk Intake Form deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete raw milk intake form')
    }
  }

  // Get latest form for display
  const latestForm = Array.isArray(rawMilkIntakeForms) && rawMilkIntakeForms.length > 0 ? rawMilkIntakeForms[0] : null

  // Get total quantity from details, null-safe
  // Quantity is derived from flow meter readings when not explicitly returned
  const getDetailQuantity = (detail: any): number | null => {
    if (detail.quantity != null) return detail.quantity
    if (detail.flow_meter_end_reading != null && detail.flow_meter_start_reading != null) {
      return detail.flow_meter_end_reading - detail.flow_meter_start_reading
    }
    return null
  }

  const getTotalQuantity = (form: RawMilkIntakeForm) =>
    (form.details ?? []).reduce((sum, detail) => sum + (getDetailQuantity(detail) ?? 0), 0)

  // Table columns with actions
  const columns = [
    {
      accessorKey: "form_info",
      header: "Form",
      cell: ({ row }: any) => {
        const form = row.original
        const totalQuantity = getTotalQuantity(form)

        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <FormIdCopy
                displayId={form.tag}
                actualId={form.id}
                size="sm"
              />
              <div className="flex items-center space-x-2 mt-1">
                <Badge className="bg-blue-100 text-blue-800 font-light">
                  {totalQuantity > 0 ? `${totalQuantity.toFixed(0)}L` : '—'}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {(form.details ?? []).length} compartment(s)
                </Badge>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "truck_info",
      header: "Truck",
      cell: ({ row }: any) => {
        const form = row.original

        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-light">{form.truck}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(form.details ?? []).map((detail: any, idx: number) => (
                <Badge key={idx} variant="outline" className="text-[10px] font-normal">
                  Comp #{detail.truck_compartment_number}
                </Badge>
              ))}
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
        // New API returns operator as { first_name, last_name }
        const operatorName = typeof form.operator === "string"
          ? null  // legacy: try to look up by ID
          : `${form.operator?.first_name ?? ""} ${form.operator?.last_name ?? ""}`.trim()

        if (operatorName) {
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs">
                {operatorName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-light">{operatorName}</span>
            </div>
          )
        }

        // Legacy: look up by ID
        const operatorUser = users.find((user: any) => user.id === form.operator)
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

        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <div className="text-sm font-light text-gray-400">Unknown Operator</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "destination",
      header: "Destination Silos",
      cell: ({ row }: any) => {
        const form = row.original
        const uniqueSilos = [...new Set((form.details ?? []).map((d: any) => d.silo_name))] as string[]

        return (
          <div className="space-y-2">
            {uniqueSilos.map((siloName, idx: number) => {
              const detailsForSilo = (form.details ?? []).filter((d: any) => d.silo_name === siloName)
              const totalForSilo = detailsForSilo.reduce((s: number, d: any) => s + (getDetailQuantity(d) ?? 0), 0)

              return (
                <div key={idx} className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Package className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-light">{siloName}</p>
                    <p className="text-xs text-gray-500">
                      {totalForSilo > 0 ? `${totalForSilo.toFixed(0)}L` : '—'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Flow Meter",
      cell: ({ row }: any) => {
        const form = row.original
        const details = form.details ?? []
        const allHaveEnd = details.length > 0 && details.every((d: any) => d.flow_meter_end != null)
        const anyHaveStart = details.some((d: any) => d.flow_meter_start != null)

        return (
          <div className="flex flex-col gap-1">
            {details.length === 0 ? (
              <Badge className="bg-gray-100 text-gray-500">No details</Badge>
            ) : allHaveEnd ? (
              <Badge className="bg-green-100 text-green-800">Complete</Badge>
            ) : anyHaveStart ? (
              <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-600">Pending</Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Tag / Date",
      cell: ({ row }: any) => {
        const form = row.original
        // Parse date from tag format RMI-N-DD-M-YYYY
        const tagParts = (form.tag ?? "").split("-")
        const tagDate = tagParts.length >= 5
          ? `${tagParts[2]}/${tagParts[3]}/${tagParts[4]}`
          : null
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-600">{form.tag ?? '—'}</p>
            <p className="text-xs text-gray-500">
              {form.created_at
                ? new Date(form.created_at).toLocaleDateString()
                : tagDate ?? '—'}
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

              size="sm"
              onClick={() => handleEditForm(form)}
              className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              className=" text-white rounded-full"
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteForm(form)}
              loading={operationLoading.delete}
              disabled={operationLoading.delete}
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
    if (formId && rawMilkIntakeForms && rawMilkIntakeForms.length > 0) {
      const foundForm = rawMilkIntakeForms.find((form: any) => String(form.id) === String(formId));
      if (foundForm) {
        setSelectedForm(foundForm);
        setViewDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMilkIntakeForms]);

  return (
    <DataCaptureDashboardLayout title="Raw Milk Intake" subtitle="Raw milk intake control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Raw Milk Intake</h1>
            <p className="text-sm font-light text-muted-foreground">Manage raw milk intake forms</p>
          </div>
          <LoadingButton
            onClick={handleAddForm}
            className="bg-[#006BC4] text-white px-6 py-2 rounded-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Intake Form
          </LoadingButton>
        </div>

        {/* Current Form Details */}
        {operationLoading.fetch ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestForm ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4]">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Droplets className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>Current Raw Milk Intake</span>
                  <Badge className=" from-blue-100 to-cyan-100 text-white font-light">Latest</Badge>
                </div>
                <LoadingButton
                  onClick={() => handleViewForm(latestForm)}
                  className="bg-[#006BC4] text-white rounded-full px-4 py-2 text-sm"
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
                    <p className="text-sm font-light text-gray-600">Form Tag</p>
                  </div>
                  <FormIdCopy
                    displayId={latestForm?.tag}
                    actualId={latestForm.id}
                    size="md"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Truck</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">
                    {latestForm.truck}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Total Quantity</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">
                    {getTotalQuantity(latestForm).toFixed(2)}L
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

              </div>

              {/* Operator and Compartments */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Operator Details */}
                {latestForm?.operator && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-light text-gray-900">Operator</h4>
                    </div>
                    <div className="space-y-2">
                      {(() => {
                        if (typeof latestForm.operator !== "string") {
                          const name = `${(latestForm.operator as any).first_name ?? ""} ${(latestForm.operator as any).last_name ?? ""}`.trim()
                          return (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-xs font-medium">
                                {name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium">{name}</span>
                            </div>
                          )
                        }
                        const operatorUser = users.find((user: any) => user.id === latestForm.operator)
                        return operatorUser ? (
                          <UserAvatar user={operatorUser} size="md" showName={true} showEmail={true} showDropdown={true} />
                        ) : (
                          <div className="text-xs text-gray-400">Unknown operator</div>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* Compartments Summary */}
                <div className="p-4 from-green-50 to-emerald-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="text-sm font-light text-gray-900">Compartments</h4>
                  </div>
                  <div className="space-y-2">
                    {(latestForm.details ?? []).map((detail, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Comp #{detail.truck_compartment_number}</span>
                        <span className="text-xs font-light">
                          {(() => { const q = getDetailQuantity(detail); return q != null ? `${q.toFixed(0)}L` : '—' })()} → {detail.silo_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : null}


        {/* Data Table */}
        {!operationLoading.fetch && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">Raw Milk Intake Forms</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search intake forms..."
                filterFields={filterFields}
              />

              {operationLoading.fetch ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable
                  columns={columns}
                  showSearch={false}
                  data={filteredForms}
                />
              )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <RawMilkIntakeFormDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          form={selectedForm}
          mode={formMode}
        />

        {/* View Drawer */}
        <RawMilkIntakeFormViewDrawer
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
          title="Delete Raw Milk Intake Form"
          description={`Are you sure you want to delete this raw milk intake form? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
