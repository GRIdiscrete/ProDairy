"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { ToolsDashboardLayout } from "@/components/layout/tools-dashboard-layout"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Beaker, TrendingUp, Clock, User, Download, Thermometer, Droplet } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  fetchGeneralLabTests,
  deleteGeneralLabTestAction,
  clearError
} from "@/lib/store/slices/generalLabTestSlice"
import { siloApi } from "@/lib/api/silo"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { TableFilters } from "@/lib/types"
import { GeneralLabTestDrawer } from "@/components/forms/general-lab-test-drawer"
import { GeneralLabTestViewDrawer } from "@/components/forms/general-lab-test-view-drawer"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { toast } from "sonner"

export default function GeneralLabTestPage() {
  const dispatch = useAppDispatch()
  const { tests, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.generalLabTests)
  const { items: users, loading: usersLoading, isInitialized: usersInitialized } = useAppSelector((state) => state.users)

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  const [silos, setSilos] = useState<any[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoadingSilos(true)
      const silosResponse = await siloApi.getSilos()
      setSilos(silosResponse.data || [])
    } catch (error) {
      setSilos([])
    } finally {
      setLoadingSilos(false)
    }
  }

  // Helper function to get user by ID
  const getUserById = (userId: string) => {
    return users.find((user: any) => user.id === userId)
  }

  // Helper function to generate Lab Test ID (Pure function for useMemo)
  const generateLabTestId = (createdAt: string, id: string = "") => {
    if (!createdAt) return 'lab-000-00-00-0000'
    try {
      const date = new Date(createdAt)
      const shortId = id.slice(-4);
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear()
      return `LAB-${shortId || '0000'}-${month}${day}${year}`
    } catch (error) {
      return 'LAB-0000-000000'
    }
  }

  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchGeneralLabTests())
      loadInitialData()
    }
  }, [dispatch, isInitialized])

  useEffect(() => {
    if (!usersInitialized) {
      dispatch(fetchUsers({}))
    }
  }, [dispatch, usersInitialized])

  // Frontend Filtering Logic
  const filteredTests = useMemo(() => {
    if (!tests) return [];

    return tests.filter((test: any) => {
      // 1. Search filter (by ID, siloname, analyst)
      if (tableFilters.search) {
        const searchLower = tableFilters.search.toLowerCase();
        const testId = generateLabTestId(test.created_at, test.id).toLowerCase();
        const siloName = (test.source_silo?.name || "").toLowerCase();
        const analystName = getUserById(test.analyst)?.first_name?.toLowerCase() || "";

        if (!testId.includes(searchLower) && !siloName.includes(searchLower) && !analystName.includes(searchLower)) return false;
      }

      // 2. Source Silo filter
      if (tableFilters.source_silo) {
        const siloName = (test.source_silo?.name || "").toLowerCase();
        if (!siloName.includes(tableFilters.source_silo.toLowerCase())) return false;
      }

      // 3. Analyst filter
      if (tableFilters.analyst) {
        const analystName = getUserById(test.analyst)?.first_name?.toLowerCase() || "";
        if (!analystName.includes(tableFilters.analyst.toLowerCase())) return false;
      }

      // 4. Date Range filter
      if (tableFilters.dateRange) {
        const formDate = test.created_at ? new Date(test.created_at) : null;
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
  }, [tests, tableFilters, users]);

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<any | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  const filterFields = useMemo(() => [
    {
      key: "source_silo",
      label: "Source Silo",
      type: "text" as const,
      placeholder: "Filter by silo"
    },
    {
      key: "analyst",
      label: "Analyst",
      type: "text" as const,
      placeholder: "Filter by analyst"
    }
  ], [])

  const handleAddTest = () => {
    setSelectedTest(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditTest = (test: any) => {
    setSelectedTest(test)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewTest = (test: any) => {
    setSelectedTest(test)
    setViewDrawerOpen(true)
  }

  const handleDeleteTest = (test: any) => {
    setSelectedTest(test)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedTest) return
    try {
      await dispatch(deleteGeneralLabTestAction(selectedTest.id)).unwrap()
      toast.success("Lab test deleted")
      setDeleteDialogOpen(false)
      setSelectedTest(null)
    } catch (error: any) { }
  }

  const handleExportCSV = () => {
    if (!filteredTests.length) return
    const formatData = filteredTests.map(test => ({
      "Test ID": generateLabTestId(test.created_at || "", test.id || ""),
      "Source Silo": test.source_silo?.name || 'N/A',
      "Analyst": getUserById(test.analyst)?.first_name || test.analyst,
      "Temp (°C)": test.temperature || '0',
      "Fat (%)": test.fat || '0',
      "Protein (%)": test.protein || '0',
      "pH": test.ph || '0',
      "Date": test.created_at ? new Date(test.created_at).toLocaleDateString() : ''
    }))

    const headers = Object.keys(formatData[0])
    const csvContent = [headers.join(','), ...formatData.map(row => headers.map(h => `"${(row as any)[h]}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lab-tests-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const columns = [
    {
      accessorKey: "created_at",
      header: "Test ID",
      cell: ({ row }: any) => (
        <FormIdCopy
          displayId={generateLabTestId(row.original.created_at || "", row.original.id || "")}
          actualId={generateLabTestId(row.original.created_at || "", row.original.id || "")}
          size="sm"
        />
      ),
    },
    {
      accessorKey: "source_silo.name",
      header: "Source Silo",
      cell: ({ row }: any) => {
        const silo = row.original.source_silo
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Beaker className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{silo?.name || "N/A"}</p>
              <p className="text-[10px] text-gray-500 uppercase">{silo?.location || "Internal"}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "analyst",
      header: "Analyst",
      cell: ({ row }: any) => {
        const analyst = getUserById(row.original.analyst)
        return analyst ? (
          <UserAvatar user={analyst} size="sm" showName={true} />
        ) : (
          <span className="text-xs font-light text-gray-500">{row.original.analyst?.slice(0, 8)}...</span>
        )
      },
    },
    {
      accessorKey: "fat",
      header: "Fat (%)",
      cell: ({ row }: any) => <div className="flex items-center gap-1"><Droplet className="w-3 h-3 text-yellow-600" /> <span className="text-sm">{row.original.fat || '0'}%</span></div>,
    },
    {
      accessorKey: "temperature",
      header: "Temp (°C)",
      cell: ({ row }: any) => <div className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-500" /> <span className="text-sm">{row.original.temperature || '0'}°C</span></div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <LoadingButton size="sm" onClick={() => handleViewTest(row.original)} className="bg-[#006BC4] text-white border-0 rounded-full h-8 w-8 p-0"><Eye className="w-4 h-4" /></LoadingButton>
          <LoadingButton size="sm" onClick={() => handleEditTest(row.original)} className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full h-8 w-8 p-0"><Edit className="w-4 h-4" /></LoadingButton>
          <LoadingButton variant="destructive" size="sm" onClick={() => handleDeleteTest(row.original)} className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></LoadingButton>
        </div>
      ),
    },
  ]

  const latestTest = Array.isArray(tests) && tests.length > 0 ? tests[0] : null

  return (
    <ToolsDashboardLayout title="General Lab Tests" subtitle="Milk Quality Lab Test Records">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">General Lab Tests</h1>
            <p className="text-sm font-light text-muted-foreground">Manage general milk lab test records</p>
          </div>
          <div className="flex items-center gap-2">
            <LoadingButton onClick={handleExportCSV} className="bg-[#A0D001] hover:bg-[#8AB801] text-white border-0 rounded-full px-6 py-2 font-light">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </LoadingButton>
            <LoadingButton onClick={handleAddTest} className="bg-[#006BC4] text-white border-0 rounded-full px-6 py-2 font-light">
              <Plus className="mr-2 h-4 w-4" /> Add Lab Test
            </LoadingButton>
          </div>
        </div>

        {/* Latest Test Spotlight */}
        {!loading && latestTest && (
          <div className="border border-gray-200 rounded-xl bg-white border-l-4 border-l-[#006BC4] shadow-none overflow-hidden flex flex-col md:flex-row">
            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Beaker className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Most Recent Analysis</h3>
                  <FormIdCopy displayId={generateLabTestId(latestTest.created_at || "", latestTest.id || "")} actualId={generateLabTestId(latestTest.created_at || "", latestTest.id || "")} size="sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-gray-400 uppercase">Fat</p><p className="text-lg font-light text-blue-600">{latestTest.fat}%</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-gray-400 uppercase">Protein</p><p className="text-lg font-light text-green-600">{latestTest.protein}%</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-gray-400 uppercase">Temp</p><p className="text-lg font-light">{latestTest.temperature}°C</p></div>
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-gray-400 uppercase">pH</p><p className="text-lg font-light">{latestTest.ph}</p></div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-l border-gray-100 flex flex-col justify-center gap-2">
              <p className="text-xs text-gray-500">Captured by</p>
              {getUserById(latestTest.analyst) ? <UserAvatar user={getUserById(latestTest.analyst)!} size="sm" showName={true} /> : <p className="text-sm font-medium">{latestTest.analyst?.slice(0, 8)}...</p>}
              <p className="text-[10px] text-gray-400">{latestTest.created_at ? new Date(latestTest.created_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        )}

        <div className="border border-gray-200 rounded-xl bg-white shadow-none overflow-hidden">
          <div className="p-6 space-y-4">
            <DataTableFilters filters={tableFilters} onFiltersChange={setTableFilters} searchPlaceholder="Search by ID, silo or analyst..." filterFields={filterFields} />
            {loading ? <ContentSkeleton sections={1} cardsPerSection={5} /> : <DataTable columns={columns} data={filteredTests} showSearch={false} />}
          </div>
        </div>

        <GeneralLabTestDrawer open={formDrawerOpen} onOpenChange={setFormDrawerOpen} test={selectedTest} mode={formMode} />
        <GeneralLabTestViewDrawer open={viewDrawerOpen} onClose={() => setViewDrawerOpen(false)} test={selectedTest} onEdit={() => { setViewDrawerOpen(false); handleEditTest(selectedTest!); }} />
        <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Lab Test" description="Are you sure you want to delete this lab record?" onConfirm={confirmDelete} loading={operationLoading.delete} />
      </div>
    </ToolsDashboardLayout>
  )
}
