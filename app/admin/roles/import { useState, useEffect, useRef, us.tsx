import { useState, useEffect, useRef, useMemo } from "react"
import { ToolsDashboardLayout } from "@/components/layout/tools-dashboard-layout"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Beaker, TrendingUp, FileText, Clock, Package, User } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"

import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"

import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { siloApi } from "@/lib/api/silo"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { TableFilters } from "@/lib/types"
import { GeneralLabTestDrawer } from "@/components/forms/general-lab-test-drawer"
import { GeneralLabTestViewDrawer } from "@/components/forms/general-lab-test-view-drawer"
import { 
  fetchGeneralLabTests, 
  deleteGeneralLabTestAction,
  clearError
} from "@/lib/store/slices/generalLabTestSlice"

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

  // Helper function to get silo by ID
  const getSiloById = (siloId: string) => {
    return silos.find((silo: any) => silo.id === siloId)
  }

  // Helper function to get user by ID
  const getUserById = (userId: string) => {
    return users.find((user: any) => user.id === userId)
  }

  // Helper function to generate Lab Test ID
  const generateLabTestId = (createdAt: string) => {
    if (!createdAt) return 'lab-000-00-00-0000'
    try {
      const date = new Date(createdAt)
      const dayNumber = Math.floor(Math.random() * 999) + 1
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear()
      return `lab-${dayNumber.toString().padStart(3, '0')}-${month}-${day}-${year}`
    } catch (error) {
      return 'lab-000-00-00-0000'
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
    if (!usersInitialized || users.length === 0) {
      dispatch(fetchUsers({}))
    }
  }, [dispatch, usersInitialized, users.length, usersLoading])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (users.length === 0 && !usersLoading) {
        dispatch(fetchUsers({}))
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [dispatch, users.length, usersLoading])

  useEffect(() => {
    if (error) {
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
      placeholder: "Filter by source silo"
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
      setDeleteDialogOpen(false)
      setSelectedTest(null)
    } catch (error: any) {}
  }

  const columns = [
    {
      accessorKey: "id",
      header: "Test ID",
      cell: ({ row }: any) => {
        const test = row.original
        return (
          <FormIdCopy 
            displayId={generateLabTestId(test.created_at)}
            actualId={test.id}
            size="sm"
          />
        )
      },
    },
    {
      accessorKey: "source_silo",
      header: "Source Silo",
      cell: ({ row }: any) => {
        const test = row.original
        const silo = getSiloById(test.source_silo)
        return (
          <span className="text-sm font-light">{silo?.name || test.source_silo || "N/A"}</span>
        )
      },
    },
    {
      accessorKey: "analyst",
      header: "Analyst",
      cell: ({ row }: any) => {
        const test = row.original
        const analyst = getUserById(test.analyst)
        return analyst ? (
          <UserAvatar user={analyst} size="sm" showName={true} showEmail={false} />
        ) : (
          <span className="text-sm font-light">{test.analyst || "N/A"}</span>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const test = row.original
        return (
          <span className="text-sm font-light">
            {test.created_at ? new Date(test.created_at).toLocaleDateString() : 'N/A'}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const test = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton 
               
              size="sm" 
              onClick={() => handleViewTest(test)}
              className=" text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
               
              size="sm" 
              onClick={() => handleEditTest(test)}
              className="bg-[#A0D001] hover:bg-[#8AB801] text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteTest(test)}
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

  const latestTest = Array.isArray(tests) && tests.length > 0 ? tests[0] : null

  return (
    <ToolsDashboardLayout title="General Lab Tests" subtitle="Milk Quality Lab Test Records">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">General Lab Tests</h1>
            <p className="text-sm font-light text-muted-foreground">Manage general milk lab test records</p>
          </div>
          <LoadingButton 
            onClick={handleAddTest}
            className=" text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Lab Test
          </LoadingButton>
        </div>

        {/* Current Test Details */}
        {loading ? (
          <ContentSkeleton sections={1} cardsPerSection={4} />
        ) : latestTest ? (
          <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4]">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-light">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Beaker className="h-4 w-4 text-white" />
                  </div>
                  <span>Current Lab Test</span>
                  <Badge className=" from-blue-100 to-cyan-100 text-white font-light">Latest</Badge>
                  <FormIdCopy 
                    displayId={generateLabTestId(latestTest.created_at)}
                    actualId={latestTest.id}
                    size="sm"
                  />
                </div>
                <LoadingButton 
                   
                  onClick={() => handleViewTest(latestTest)}
                  className=" text-white border-0 rounded-full px-4 py-2 font-light text-sm"
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
                    <Beaker className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-light text-gray-600">Source Silo</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">{getSiloById(latestTest.source_silo)?.name || latestTest.source_silo || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Analyst</p>
                  </div>
                  <p className="text-lg font-light text-green-600">{getUserById(latestTest.analyst)?.first_name || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Created</p>
                  </div>
                  <p className="text-lg font-light">{latestTest.created_at ? new Date(latestTest.created_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Data Table */}
        {!loading && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">General Lab Tests</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search lab tests..."
                filterFields={filterFields}
              />
              {loading ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable 
                  columns={columns} 
                  data={tests} 
                  showSearch={false}
                  searchKey="source_silo"
                />
              )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <GeneralLabTestDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          test={selectedTest}
          mode={formMode} 
        />

        {/* View Drawer */}
        <GeneralLabTestViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          test={selectedTest}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditTest(selectedTest!)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Lab Test"
          description={`Are you sure you want to delete this lab test? This action cannot be undone.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </ToolsDashboardLayout>
  )
}