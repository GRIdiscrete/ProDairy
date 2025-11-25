"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Beaker, TrendingUp, FileText, Clock, Package, Truck, User, Download } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
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
import { useRouter, useSearchParams } from "next/navigation"

import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { BMTControlForm } from "@/lib/api/bmt-control-form"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { ToolsDashboardLayout } from "@/components/layout/tools-dashboard-layout"
import { generateFormId } from "@/lib/utils/form-id-generator"
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
      
      console.log('BMT Page - Starting to load initial data...')
      
      // Load silos
      const silosResponse = await siloApi.getSilos()
      setSilos(silosResponse.data || [])
      console.log('BMT Page - Loaded silos:', silosResponse.data?.length || 0)
      
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Failed to load data')
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

  // Helper to get user name by ID
  const getUserNameById = (userId: string) => {
    const user = getUserById(userId)
    return user ? user.name || user.email || user.id : userId || ""
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
 
    
    // Always try to load users if not already loaded
    if (!usersInitialized || users.length === 0) {
      console.log('BMT Page - Dispatching fetchUsers...')
      dispatch(fetchUsers({}))
        .then((result) => {
          console.log('BMT Page - fetchUsers success:', result)
        })
        .catch((error) => {
          console.error('BMT Page - fetchUsers error:', error)
        })
    }
  }, [dispatch, usersInitialized, users.length, usersLoading])

  // Force load users after a short delay if still empty
  useEffect(() => {
    const timer = setTimeout(() => {
      if (users.length === 0 && !usersLoading) {
        console.log('BMT Page - Force loading users after delay...')
        dispatch(fetchUsers({}))
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [dispatch, users.length, usersLoading])

  // Debug log when users change
  useEffect(() => {
    console.log('BMT Page - Users state changed:', {
      count: users.length,
      loading: usersLoading,  
      initialized: usersInitialized,
      userIds: users.map(u => u.id).slice(0, 5) // Show first 5 user IDs
    })
  }, [users, usersLoading, usersInitialized])
  
  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchBMTControlForms())
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
    // Debug: Log the form being passed to edit

    
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
    if (!forms || forms.length === 0) {
      toast.error("No forms to export")
      return
    }

    // CSV headers (removed Form ID column)
    const headers = [
      "Tag",
      "Product",
      "Volume (L)",
      "Movement Start",
      "Movement End",
      "Status",
      "Dispatch Operator",
      "Receiver Operator",
      "Source Silos",
      "Destination Silo",
      "Created At",
      "Updated At"
    ]

    // Build CSV rows
    const rows = forms.map((form: any) => {
      // Source silos: names, comma separated
      let sourceSilos = ""
      if (Array.isArray(form.bmt_control_form_source_silo) && form.bmt_control_form_source_silo.length > 0) {
        sourceSilos = form.bmt_control_form_source_silo.map((silo: any) => silo.name || silo.id).join(", ")
      } else if (form.source_silo_id) {
        sourceSilos = getSiloNameById(form.source_silo_id)
      }

      // Destination silo: name
      let destinationSilo = ""
      if (form.destination_silo && form.destination_silo.name) {
        destinationSilo = form.destination_silo.name
      } else if (form.destination_silo_id) {
        destinationSilo = getSiloNameById(form.destination_silo_id)
      }

      // Operator names
      const dispatchOperator = getUserNameById(form.dispatch_operator_id || form.llm_operator_id)
      const receiverOperator = getUserNameById(form.receiver_operator_id || form.dpp_operator_id)

      // Format dates
      const movementStart = form.movement_start ? new Date(form.movement_start).toLocaleString() : ""
      const movementEnd = form.movement_end ? new Date(form.movement_end).toLocaleString() : ""
      const createdAt = form.created_at ? new Date(form.created_at).toLocaleString() : ""
      const updatedAt = form.updated_at ? new Date(form.updated_at).toLocaleString() : ""

      return [
        form.tag,
        form.product,
        form.volume ?? "",
        movementStart,
        movementEnd,
        form.status,
        dispatchOperator,
        receiverOperator,
        sourceSilos,
        destinationSilo,
        createdAt,
        updatedAt
      ]
    })

    // CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\r\n")

    // Download CSV
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

  // Table columns with actions
  const columns = [
    {
      accessorKey: "form_id",
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
      accessorKey: "movement_details",
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
      accessorKey: "flow_readings",
      header: "Volume",
      cell: ({ row }: any) => {
        const form = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {form.volume != null ? `${form.volume} L` : "N/A"}
            </p>
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

        console.log('BMT Form Actions - Form ID:', form)
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
            {/* <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditForm(form)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton> */}
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

  // Get latest form for display
  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null

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

  return (
    <ToolsDashboardLayout title="BMT Control Forms" subtitle="Bulk Milk Transfer control and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">BMT Control Forms</h1>
            <p className="text-sm font-light text-muted-foreground">Manage bulk milk transfer control forms</p>
          </div>
          <div className="flex gap-2">
            <LoadingButton 
              onClick={handleExportCSV}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 rounded-full px-6 py-2 font-light"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </LoadingButton>
            <LoadingButton 
              onClick={handleAddForm}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add BMT Form
            </LoadingButton>
          </div>
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
                    <Beaker className="h-4 w-4 text-white" />
                  </div>
                  <span>Current BMT Control Form</span>
                  <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-light">Latest</Badge>
                  {(() => {
                    return (
                      <FormIdCopy 
                        displayId={latestForm.tag}
                        actualId={latestForm.id}
                        size="sm"
                      />
                    );
                  })()}
                </div>
                <LoadingButton 
                  variant="outline" 
                  onClick={() => handleViewForm(latestForm)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-4 py-2 font-light"
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
                    <p className="text-sm font-light text-gray-600">Product</p>
                  </div>
                  <p className="text-lg font-light text-blue-600">{latestForm.product}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-light text-gray-600">Volume</p>
                  </div>
                  <p className="text-lg font-light text-green-600">{latestForm.volume}L</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-light text-gray-600">Created</p>
                  </div>
                  <p className="text-lg font-light">{latestForm.created_at ? new Date(latestForm.created_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'N/A'}</p>
                </div>
              </div>
              
              {/* Remove source silos and destination silo snapshot section */}
              
              {/* Operators Information */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Dispatch Operator */}
                {(() => {
                  // Try dispatch_operator_id and llm_operator_id (cast to any for dynamic access)
                  const dispatchOperatorId = (latestForm as any).dispatch_operator_id || latestForm.llm_operator_id;
                  const dispatchUser = getUserById(dispatchOperatorId);
                  
                  console.log('Dispatch Operator Debug:', {
                    dispatch_operator_id: (latestForm as any).dispatch_operator_id,
                    llm_operator_id: latestForm.llm_operator_id,
                    selectedId: dispatchOperatorId,
                    foundUser: dispatchUser,
                    allUsers: users.length,
                    userIds: users.map(u => u.id)
                  });
                  
                  return (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <h4 className="text-sm font-light text-gray-900">Dispatch Operator</h4>
                      </div>
                      {dispatchUser ? (
                        <UserAvatar 
                          user={dispatchUser} 
                          size="md" 
                          showName={true} 
                          showEmail={true}
                          showDropdown={true}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">
                          {dispatchOperatorId ? `User not found (${dispatchOperatorId.slice(0, 8)}...)` : 'No operator assigned'}
                        </div>
                      )}
                    </div>
                  )
                })()}
                
                {/* Receiver Operator */}
                {(() => {
                  // Try receiver_operator_id and dpp_operator_id (cast to any for dynamic access)
                  const receiverOperatorId = (latestForm as any).receiver_operator_id || latestForm.dpp_operator_id;
                  const receiverUser = getUserById(receiverOperatorId);
                  
                  console.log('Receiver Operator Debug:', {
                    receiver_operator_id: (latestForm as any).receiver_operator_id,
                    dpp_operator_id: latestForm.dpp_operator_id,
                    selectedId: receiverOperatorId,
                    foundUser: receiverUser,
                    allUsers: users.length,
                    userIds: users.map(u => u.id)
                  });
                  
                  return (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <h4 className="text-sm font-light text-gray-900">Receiver Operator</h4>
                      </div>
                      {receiverUser ? (
                        <UserAvatar 
                          user={receiverUser} 
                          size="md" 
                          showName={true} 
                          showEmail={true}
                          showDropdown={true}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">
                          {receiverOperatorId ? `User not found (${receiverOperatorId.slice(0, 8)}...)` : 'No operator assigned'}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
              
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* ...existing code... */}
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                {/* ...existing code... */}
              </div>
            </div>
          </div>
        ) : null}

        {/* Data Table */}
        {!loading && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="text-lg font-light">BMT Control Forms</div>
            </div>
            <div className="p-6 space-y-4">
              <DataTableFilters
                filters={tableFilters}
                onFiltersChange={setTableFilters}
                onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                searchPlaceholder="Search BMT forms..."
                filterFields={filterFields}
              />
              
              {loading ? (
                <ContentSkeleton sections={1} cardsPerSection={4} />
              ) : (
                <DataTable 
                  columns={columns} 
                  data={forms} 
                  showSearch={false}
                  searchKey="product"
                />
              )}
            </div>
          </div>
        )}

        {/* Form Drawer */}
        <BMTControlFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          form={selectedForm}
          mode={formMode} 
        />

        {/* View Drawer */}
        <BMTControlFormViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
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
          title="Delete BMT Control Form"
          description={`Are you sure you want to delete this BMT control form? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </ToolsDashboardLayout>
  )
}
