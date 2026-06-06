"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, FlaskConical, TrendingUp, FileText, Clock, Package, ArrowRight, User, LayoutList, Table2, Download } from "lucide-react"
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
import { SteriPastoTableRow, getSteriPastoTable } from "@/lib/api/data-capture-forms"
import { exportToExcel } from "@/lib/utils/export-excel"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useRouter, useSearchParams } from "next/navigation"
// import { watch } from "fs"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"

export default function PasteurizingPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.pasteurizing)
  const { machines } = useAppSelector((state) => state.machine)
  const { forms: bmtForms } = useAppSelector((state) => state.bmtControlForms)
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const [viewMode, setViewMode] = useState<"records" | "table">("records")
  const [pastoTableData, setPastoTableData] = useState<SteriPastoTableRow[]>([])
  const [pastoTableLoading, setPastoTableLoading] = useState(false)
  const hasFetchedRef = useRef(false)

  const PASTO_ROWS = [
    { label: "Time",                    unit: "—",   getVal: (r: SteriPastoTableRow) => r.temp_hot_water,                    isTime: true },
    { label: "Temp Hot Water",          unit: "°C",  getVal: (r: SteriPastoTableRow) => r.temp_hot_water,                    isTime: false },
    { label: "Temp Product Past.",      unit: "°C",  getVal: (r: SteriPastoTableRow) => r.temp_product_pasteurisation,       isTime: false },
    { label: "Homo. P Stage 1",         unit: "Bar", getVal: (r: SteriPastoTableRow) => r.homogenisation_pressure_stage_1,  isTime: false },
    { label: "Homo. P Stage 2",         unit: "Bar", getVal: (r: SteriPastoTableRow) => r.homogenisation_pressure_stage_2,  isTime: false },
    { label: "Total Homo. P",           unit: "Bar", getVal: (r: SteriPastoTableRow) => r.total_homogenisation_pressure,    isTime: false },
    { label: "Temp Product Out",        unit: "°C",  getVal: (r: SteriPastoTableRow) => r.temp_product_out,                 isTime: false },
  ]

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

  const pivotForms = useMemo(() => {
    if (!pastoTableData.length) return []
    const formMap = new Map<string, {
      meta: SteriPastoTableRow
      machineName: string
      cols: Map<number, { timeRow?: SteriPastoTableRow; tempRow?: SteriPastoTableRow }>
    }>()
    pastoTableData.forEach(row => {
      const key = `${row.date}__${row.production_start}__${row.production_end}`
      if (!formMap.has(key)) {
        // cross-reference machine name from the forms slice by date
        const matchedForm = forms.find((f: any) => f.date && row.date && String(f.date).startsWith(row.date))
        const machineName = matchedForm ? getMachineName(matchedForm) : "—"
        formMap.set(key, { meta: row, machineName, cols: new Map() })
      }
      const f = formMap.get(key)!
      const ro = row.row_order ?? 0
      if (!f.cols.has(ro)) f.cols.set(ro, {})
      const c = f.cols.get(ro)!
      const m = (row.metric ?? "").toLowerCase()
      if (m === "time") c.timeRow = row
      else c.tempRow = row
    })
    return Array.from(formMap.values()).map(f => ({
      meta: f.meta,
      machineName: f.machineName,
      cols: Array.from(f.cols.entries()).sort((a, b) => a[0] - b[0]).map(([, v]) => v),
    }))
  }, [pastoTableData, forms, machines])

  const getBMTFormById = (bmtId: string) => {
    return bmtForms.find((form: any) => form.id === bmtId)
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
  useEffect(() => {
    if (viewMode !== "table" || pastoTableData.length > 0) return
    setPastoTableLoading(true)
    getSteriPastoTable()
      .then(setPastoTableData)
      .catch(() => toast.error("Failed to load table data"))
      .finally(() => setPastoTableLoading(false))
  }, [viewMode])

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

  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Selected form and mode
  const [selectedForm, setSelectedForm] = useState<PasteurizingForm | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Frontend Filtering Logic
  const filteredForms = useMemo(() => {
    if (!forms) return []

    return forms.filter((form: any) => {
      // 1. Search filter (Global search)
      if (tableFilters.search) {
        const searchLower = tableFilters.search.toLowerCase()
        const tag = (form.tag || "").toLowerCase()
        const machineName = getMachineName(form).toLowerCase()
        const bmtInfo = getBMTFormInfo(form)
        const bmtTag = (getBMTFormById(form.bmt)?.tag || "").toLowerCase()

        if (!tag.includes(searchLower) &&
          !machineName.includes(searchLower) &&
          !bmtTag.includes(searchLower)) return false
      }

      // 2. Specific filter fields
      if (tableFilters.created_at) {
        const filterDate = new Date(tableFilters.created_at)
        const formDate = new Date(form.created_at)
        if (filterDate.toDateString() !== formDate.toDateString()) return false
      }

      if (tableFilters.machine) {
        const machineLower = tableFilters.machine.toLowerCase()
        if (!getMachineName(form).toLowerCase().includes(machineLower)) return false
      }

      // 3. Date Range filter
      if (tableFilters.dateRange) {
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
  }, [forms, tableFilters, machines, bmtForms])

  const machineOptions: SearchableSelectOption[] = machines.map(machine => ({
    value: machine.id,
    label: (machine.name as string) || "Unknown Machine",
    description: `${machine.category} - ${machine.location}`
  }))

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
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <FormIdCopy
                  displayId={form.tag!}
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
    // {
    //   accessorKey: "production",
    //   header: "Production",
    //   cell: ({ row }: any) => {
    //     const form = row.original
    //     const totalQuantity = form.steri_milk_pasteurizing_form_production?.reduce((sum: number, item: any) => sum + (item.output_target_value || 0), 0) || 0
    //     const avgFat = form.fat || 0
    //     return (
    //       <div className="space-y-2">
    //         <div className="flex items-center space-x-2">
    //           <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
    //             <FlaskConical className="w-3 h-3 text-blue-600" />
    //           </div>
    //           <p className="text-sm font-light">
    //             {form.steri_milk_pasteurizing_form_production?.length || 0} entries
    //           </p>
    //         </div>
    //         <div className="space-y-1">
    //           <div className="flex items-center justify-between">
    //             <span className="text-xs text-gray-500">Total Qty</span>
    //             <span className="text-xs font-light">{totalQuantity.toFixed(1)}L</span>
    //           </div>
    //           <div className="flex items-center justify-between">
    //             <span className="text-xs text-gray-500">Fat Content</span>
    //             <span className="text-xs font-light">{avgFat}%</span>
    //           </div>
    //         </div>
    //       </div>
    //     )
    //   },
    // },
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

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-0.5">
              <button
                onClick={() => setViewMode("records")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "records" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <LayoutList className="w-3.5 h-3.5" /> Records
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Table2 className="w-3.5 h-3.5" /> Table View
              </button>
            </div>
            {viewMode === "table" && (
              <LoadingButton
                onClick={() => {
                  if (!pivotForms.length) return
                  const maxCols = Math.max(...pivotForms.map(f => f.cols.length), 1)
                  const columns = [
                    { header: "Date", key: "date" },
                    { header: "Production Start", key: "prod_start" },
                    { header: "Production End", key: "prod_end" },
                    { header: "Preheating / Water Circ.", key: "preheating" },
                    { header: "Machine", key: "machine" },
                    { header: "Metric", key: "metric" },
                    { header: "Unit", key: "unit" },
                    ...Array.from({ length: maxCols }, (_, i) => ({ header: `T${i + 1}`, key: `t${i + 1}` })),
                  ]
                  const rows: any[] = []
                  pivotForms.forEach(form => {
                    PASTO_ROWS.forEach(prow => {
                      const rowData: any = {
                        date: form.meta.date ?? "—",
                        prod_start: form.meta.production_start ?? "—",
                        prod_end: form.meta.production_end ? new Date(form.meta.production_end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
                        preheating: `${form.meta.preheating_start ?? "—"} / ${form.meta.water_circulation ?? "—"}`,
                        machine: form.machineName,
                        metric: prow.label,
                        unit: prow.unit,
                      }
                      form.cols.forEach((col, ci) => {
                        const src = prow.isTime ? col.timeRow : col.tempRow
                        const val = src ? prow.getVal(src) : null
                        rowData[`t${ci + 1}`] = val != null && val !== "" ? String(val).substring(0, 5) : "—"
                      })
                      for (let i = form.cols.length; i < maxCols; i++) rowData[`t${i + 1}`] = "—"
                      rows.push(rowData)
                    })
                  })
                  exportToExcel(columns, rows, "steri-milk-pasteurizing-table")
                }}
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
              Add Pasteurizing Form
            </LoadingButton>
          </div>
        </div>

        {/* Current Form Details */}
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestForm ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4]">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <FlaskConical className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>Current Pasteurizing Process</span>
                  <Badge className="text-white font-light">Latest</Badge>
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
                    <p className="text-sm font-light text-gray-600">Form ID</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FormIdCopy
                      displayId={latestForm?.tag!}
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
                          displayId={getBMTFormById(latestForm.bmt)?.tag!}
                          actualId={latestForm.bmt}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Summary */}
                <div className="p-4 bg-blue-50 rounded-lg">
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
              <div className="text-lg font-light">
                {viewMode === "records" ? "Pasteurizing Forms" : "Table View"}
              </div>
            </div>
            <div className="p-6 space-y-4">
              {viewMode === "records" ? (
                <>
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
                    <DataTable
                      columns={columns}
                      data={filteredForms}
                      showSearch={false}
                      showExport={true}
                      exportFilename="pasteurizing-data"
                    />
                  )}
                </>
              ) : pastoTableLoading ? (
                <ContentSkeleton sections={1} cardsPerSection={5} />
              ) : pivotForms.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-8">No data</p>
              ) : (
                <div className="space-y-8">
                  {pivotForms.map((form, fi) => (
                    <div key={fi}>
                      {/* Form header */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 p-3 bg-gray-50 rounded-lg text-xs">
                        <div><span className="text-gray-400 uppercase tracking-wide">Date</span><p className="font-medium mt-0.5">{form.meta.date ?? "—"}</p></div>
                        <div><span className="text-gray-400 uppercase tracking-wide">Production Start</span><p className="font-medium mt-0.5">{form.meta.production_start ?? "—"}</p></div>
                        <div><span className="text-gray-400 uppercase tracking-wide">Production End</span><p className="font-medium mt-0.5">{form.meta.production_end ? new Date(form.meta.production_end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</p></div>
                        <div><span className="text-gray-400 uppercase tracking-wide">Preheating / Water Circ.</span><p className="font-medium mt-0.5">{form.meta.preheating_start ?? "—"} / {form.meta.water_circulation ?? "—"}</p></div>
                        <div><span className="text-gray-400 uppercase tracking-wide">Machine</span><p className="font-medium mt-0.5">{form.machineName}</p></div>
                      </div>

                      {/* Pivot table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 border-b border-r border-gray-200 text-[10px] font-semibold uppercase tracking-wider text-gray-500 sticky left-0 bg-gray-50 whitespace-nowrap min-w-[160px]">Metric</th>
                              <th className="px-2 py-2 border-b border-r border-gray-200 text-[10px] font-semibold uppercase text-gray-400 whitespace-nowrap">Unit</th>
                              {form.cols.map((col, ci) => (
                                <th key={ci} className="px-3 py-2 border-b border-r border-gray-200 text-[10px] font-semibold text-center text-gray-500 whitespace-nowrap tabular-nums">
                                  {col.timeRow?.temp_hot_water?.toString().substring(0, 5) ?? `#${ci + 1}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {PASTO_ROWS.map((row, ri) => (
                              <tr key={ri} className={
                                ri === 0 ? "bg-blue-50/40" :
                                ri % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                              }>
                                <td className="px-3 py-1.5 border-b border-r border-gray-100 font-medium whitespace-nowrap sticky left-0 bg-inherit">{row.label}</td>
                                <td className="px-2 py-1.5 border-b border-r border-gray-100 text-gray-400 whitespace-nowrap">{row.unit}</td>
                                {form.cols.map((col, ci) => {
                                  const src = row.isTime ? col.timeRow : col.tempRow
                                  const val = src ? row.getVal(src) : null
                                  return (
                                    <td key={ci} className="px-3 py-1.5 border-b border-r border-gray-100 text-center tabular-nums whitespace-nowrap">
                                      {val != null && val !== "" ? String(val).substring(0, 5) : "—"}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
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
