"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { LoadingButton } from "@/components/ui/loading-button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Beaker, TrendingUp, FileText, Clock, Package, User, Droplets, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StandardizingFormDrawer } from "@/components/forms/standardizing-form-drawer"
import { StandardizingFormViewDrawer } from "@/components/forms/standardizing-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { UserAvatar } from "@/components/ui/user-avatar"
import { generateStandardizingFormId, generateBMTFormId } from "@/lib/utils/form-id-generator"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import type { RootState } from "@/lib/store"
import {
  fetchStandardizingForms,
  deleteStandardizingForm,
  clearError
} from "@/lib/store/slices/standardizingSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchBMTControlForms } from "@/lib/store/slices/bmtControlFormSlice"
import { toast } from "sonner"
import { TableFilters } from "@/lib/types"
import { StandardizingForm } from "@/lib/api/standardizing"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { generateSkimmingFormId } from "@/lib/utils/form-id-generator"
import { SkimmingFormDrawer } from "@/components/forms/skimming-form-drawer"
import { SkimmingFormViewDrawer } from "@/components/forms/skimming-form-view-drawer"
import { fetchSkimmingForms } from "@/lib/store/slices/skimmingSlice"
import { useRouter, useSearchParams } from "next/navigation"

export default function StandardizingPage() {
  const dispatch = useAppDispatch()
  const { forms, loading, error, operationLoading, isInitialized } = useAppSelector((state) => state.standardizing)
  const { items: users } = useAppSelector((state: RootState) => state.users)
  const { forms: bmtForms } = useAppSelector((state: RootState) => state.bmtControlForms)
  // Use skimming slice from store
  const { forms: skimmingForms, loading: skimmingLoading } = useAppSelector((state: any) => state.skimming || { forms: [], loading: false })

  const [tableFilters, setTableFilters] = useState<TableFilters>({})
  const hasFetchedRef = useRef(false)
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  // Helper function to get user by ID
  const getUserById = (userId: string) => {
    return users.find((user: any) => user.id === userId)
  }

  // Helper function to get BMT form by ID
  const getBMTFormById = (bmtId: string) => {
    return bmtForms.find((form: any) => form.id === bmtId)
  }

  // Load standardizing forms and related data on initial mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchStandardizingForms())
      dispatch(fetchUsers({})) // Load users for operator information
      dispatch(fetchBMTControlForms()) // Load BMT forms for reference
      // load skimming forms too
      dispatch(fetchSkimmingForms())
    }
  }, [dispatch, isInitialized])

  // Handle filter changes
  useEffect(() => {
    if (isInitialized && Object.keys(tableFilters).length > 0) {
      dispatch(fetchStandardizingForms())
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

  // Skimming form drawer states
  const [skimmingFormDrawerOpen, setSkimmingFormDrawerOpen] = useState(false)
  const [skimmingViewDrawerOpen, setSkimmingViewDrawerOpen] = useState(false)
  const [skimmingDeleteDialogOpen, setSkimmingDeleteDialogOpen] = useState(false)

  // Selected form and mode
  const [selectedForm, setSelectedForm] = useState<StandardizingForm | null>(null)
  const [selectedSkimmingForm, setSelectedSkimmingForm] = useState<any | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [skimmingFormMode, setSkimmingFormMode] = useState<"create" | "edit">("create")
  const [activeTab, setActiveTab] = useState("standardizing")

  // Filter fields configuration for Standardizing Forms
  const filterFields = useMemo(() => [
    {
      key: "created_at",
      label: "Date",
      type: "date" as const,
      placeholder: "Filter by date"
    },
    {
      key: "bmt_id",
      label: "BMT Form ID",
      type: "text" as const,
      placeholder: "Filter by BMT form"
    },
    {
      key: "operator_id",
      label: "Operator",
      type: "text" as const,
      placeholder: "Filter by operator"
    }
  ], [])

  // Action handlers
  const handleAddForm = () => {
    setSelectedForm(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditForm = (form: StandardizingForm) => {
    setSelectedForm(form)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewForm = (form: StandardizingForm) => {
    setSelectedForm(form)
    setViewDrawerOpen(true)
  }

  const handleDeleteForm = (form: StandardizingForm) => {
    setSelectedForm(form)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedForm) return

    try {
      await dispatch(deleteStandardizingForm(selectedForm.id)).unwrap()
      toast.success('Standardizing Form deleted successfully')
      // refresh list after delete
      await dispatch(fetchStandardizingForms()).unwrap()
      setDeleteDialogOpen(false)
      setSelectedForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete standardizing form')
    }
  }

  // Get latest form for display
  const latestForm = Array.isArray(forms) && forms.length > 0 ? forms[0] : null
  const latestSkimmingForm = Array.isArray(skimmingForms) && skimmingForms.length > 0 ? skimmingForms[0] : null



  // Skimming form handlers
  const handleAddSkimmingForm = () => {
    setSelectedSkimmingForm(null)
    setSkimmingFormMode("create")
    setSkimmingFormDrawerOpen(true)
  }

  const handleEditSkimmingForm = (form: any) => {
    setSelectedSkimmingForm(form)
    setSkimmingFormMode("edit")
    setSkimmingFormDrawerOpen(true)
  }

  const handleViewSkimmingForm = (form: any) => {
    setSelectedSkimmingForm(form)
    setSkimmingViewDrawerOpen(true)
  }

  const handleDeleteSkimmingForm = (form: any) => {
    setSelectedSkimmingForm(form)
    setSkimmingDeleteDialogOpen(true)
  }

  const confirmSkimmingDelete = async () => {
    if (!selectedSkimmingForm) return

    try {
      // If you have a delete action in skimmingSlice, call it here.
      // For now keep local removal (if still needed) and re-fetch authoritative list:
      toast.success('Skimming Form deleted successfully')
      // refresh skimming list from backend/store
      await dispatch(fetchSkimmingForms()).unwrap()
      // also refresh standardizing forms in case relationships changed
      await dispatch(fetchStandardizingForms()).unwrap()
      setSkimmingDeleteDialogOpen(false)
      setSelectedSkimmingForm(null)
    } catch (error: any) {
      toast.error(error || 'Failed to delete skimming form')
    }
  }

  // Skimming Forms Table columns
  const skimmingColumns = [
    {
      accessorKey: "product",
      header: "Skimming Form",
      cell: ({ row }: any) => {
        const form = row.original
        const formId = generateSkimmingFormId(form.created_at)
        const rawMilk = Array.isArray(form.standardizing_form_raw_milk) && form.standardizing_form_raw_milk.length > 0
          ? form.standardizing_form_raw_milk[0]
          : null
        const skimMilk = Array.isArray(form.standardizing_form_skim_milk) && form.standardizing_form_skim_milk.length > 0
          ? form.standardizing_form_skim_milk[0]
          : null

        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <div>
              <FormIdCopy
                displayId={form.tag}
                actualId={form.id}
                size="sm"
              />
              <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                <div>
                  <div className="text-xs text-gray-500">Raw Milk</div>
                  <div className="text-sm text-gray-700">
                    {rawMilk ? `${Number(rawMilk.quantity || 0).toFixed(1)}L • ${rawMilk.fat ?? ""}%` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Skim Milk</div>
                  <div className="text-sm text-gray-700">
                    {skimMilk ? `${Number(skimMilk.quantity || 0).toFixed(1)}L • ${skimMilk.fat ?? ""}%` : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "bmt_form",
      header: "BMT Form",
      cell: ({ row }: any) => {
        const form = row.original
        const bmtForm = getBMTFormById(form.bmt_id)

        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-light">BMT Form</span>
            </div>
            {bmtForm ? (
              <div className="space-y-1">
                <FormIdCopy
                  displayId={bmtForm.tag}
                  actualId={form.bmt_id}
                  size="sm"
                />
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800 font-light text-xs">
                    {bmtForm.volume}L
                  </Badge>
                </div>
              </div>
            ) : form.bmt_id ? (
              <div className="text-xs text-gray-400">
                BMT form not found
              </div>
            ) : (
              <p className="text-xs text-gray-400">No BMT form</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "operator_info",
      header: "Operator",
      cell: ({ row }: any) => {
        const form = row.original
        const operatorId = form.operator_id
        const operatorUser = getUserById(operatorId)

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
              <div className="text-xs text-gray-500">No user data</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "raw_milk_info",
      header: "Raw Milk",
      cell: ({ row }: any) => {
        const form = row.original
        const raw = Array.isArray(form.standardizing_form_raw_milk) && form.standardizing_form_raw_milk.length > 0
          ? form.standardizing_form_raw_milk[0]
          : null

        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 font-light text-xs">
                {raw ? '1' : '0'}
              </Badge>
            </div>
            <p className="text-sm font-light">{raw ? `${Number(raw.quantity || 0).toFixed(1)}L` : '0.0L'}</p>
            <p className="text-xs text-gray-500">{raw ? `${raw.fat ?? ''}%` : 'N/A'}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "skim_milk_info",
      header: "Skim Milk",
      cell: ({ row }: any) => {
        const form = row.original
        const skim = Array.isArray(form.standardizing_form_skim_milk) && form.standardizing_form_skim_milk.length > 0
          ? form.standardizing_form_skim_milk[0]
          : null

        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800 font-light text-xs">
                {skim ? '1' : '0'}
              </Badge>
            </div>
            <p className="text-sm font-light">{skim ? `${Number(skim.quantity || 0).toFixed(1)}L` : '0.0L'}</p>
            <p className="text-xs text-gray-500">{skim ? `${skim.fat ?? ''}%` : 'N/A'}</p>
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
              onClick={() => handleViewSkimmingForm(form)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => handleEditSkimmingForm(form)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteSkimmingForm(form)}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  // Table columns with actions
  const columns = [
    {
      accessorKey: "product",
      header: "Standardizing Form",
      cell: ({ row }: any) => {
        const form = row.original


        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Beaker className="w-4 h-4 text-white" />
            </div>
            <div>
              <FormIdCopy
                displayId={form.tag}
                actualId={form.id}
                size="sm"
              />
              {/* <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500">{skimMilkCount} skim milk entries</span>
              </div> */}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "bmt_form",
      header: "BMT Form",
      cell: ({ row }: any) => {
        const form = row.original
        const bmtForm = getBMTFormById(form.bmt_id)

        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-light">BMT Form</span>
            </div>
            {bmtForm ? (
              <div className="space-y-1">
                <FormIdCopy
                  displayId={bmtForm.tag}
                  actualId={form.bmt_id}
                  size="sm"
                />
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800 font-light text-xs">
                    Volume:{bmtForm.volume ?? 0}L
                  </Badge>
                  {/* <span className="text-xs text-gray-500">{bmtForm.product}</span> */}
                </div>
              </div>
            ) : form.bmt_id ? (
              <div className="text-xs text-gray-400">
                BMT form not found
              </div>
            ) : (
              <p className="text-xs text-gray-400">No BMT form</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "operator_info",
      header: "Operator",
      cell: ({ row }: any) => {
        const form = row.original
        const operatorId = form.operator_id
        const operatorUser = getUserById(operatorId)

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
      accessorKey: "skim_milk_info",
      header: "Skim Milk",
      cell: ({ row }: any) => {
        const form = row.original
        const skimMilk = form?.standardizing_form_no_skim_skim_milk?.length > 0 ? form.standardizing_form_no_skim_skim_milk[0] : {}
        // const skimMilkEntries = (form as any).standardizing_form_no_skim_skim_milk || []
        // const totalQuantity = skimMilkEntries.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
        // const avgFat = skimMilkEntries.length > 0
        //   ? (skimMilkEntries.reduce((sum: number, item: any) => sum + (item.resulting_fat || 0), 0) / skimMilkEntries.length).toFixed(1)
        //   : '0.0'

        return (
          <div className="space-y-1">
            {/* <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800 font-light text-xs">
                
              </Badge>
            </div> */}
            <p className="text-sm font-light">{skimMilk?.quantity?.toFixed(1)}L</p>
            <p className="text-xs text-gray-500">{skimMilk?.resulting_fat}% avg fat</p>
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
    if (formId) {
      // Search in standardizing forms
      const foundStandard = forms.find((form: any) => String(form.id) === String(formId));
      if (foundStandard) {
        setSelectedForm(foundStandard);
        setViewDrawerOpen(true);
        setActiveTab("standardizing");
        return;
      }
      // Search in skimming forms
      const foundSkimming = skimmingForms.find((form: any) => String(form.id) === String(formId));
      if (foundSkimming) {
        setSelectedSkimmingForm(foundSkimming);
        setSkimmingViewDrawerOpen(true);
        setActiveTab("skimming");
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forms, skimmingForms]);

  return (
    <DataCaptureDashboardLayout title="Standardizing Forms" subtitle="Forms for standardizing milk fat content">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">
              {activeTab === "standardizing" ? "Standardizing Forms" : "Skimming Forms"}
            </h1>
            <p className="text-sm font-light text-muted-foreground">
              {activeTab === "standardizing"
                ? "Forms for standardizing milk fat content"
                : "Forms for milk skimming processes"
              }
            </p>
          </div>
          <LoadingButton
            onClick={activeTab === "standardizing" ? handleAddForm : handleAddSkimmingForm}
            className={activeTab === "standardizing"
              ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-full px-6 py-2 font-light"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2 font-light"
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "standardizing" ? "Add Standardizing Form" : "Add Skimming Form"}
          </LoadingButton>
        </div>

        {/* Tabs for Standardizing and Skimming Forms */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standardizing" className="flex items-center gap-2">
              <Beaker className="w-4 h-4" />
              Standardizing Forms
            </TabsTrigger>
            <TabsTrigger value="skimming" className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Skimming Forms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standardizing" className="space-y-6">
            {/* Current Standardizing Process */}
            {loading ? (
              <ContentSkeleton sections={1} cardsPerSection={4} />
            ) : latestForm ? (
              <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-orange-500">
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-lg font-light">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Beaker className="h-4 w-4 text-white" />
                      </div>
                      <span>Current Standardizing Process</span>
                      <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 font-light">Latest</Badge>
                      <FormIdCopy
                        displayId={latestForm.tag}
                        actualId={latestForm.id}
                        size="sm"
                      />
                    </div>
                    <LoadingButton
                      variant="outline"
                      onClick={() => handleViewForm(latestForm)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-full px-4 py-2 font-light text-sm"
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
                      <FormIdCopy
                        displayId={latestForm.tag}
                        actualId={latestForm.id}
                        size="md"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-light text-gray-600">Skim Milk Entries</p>
                      </div>
                      <p className="text-lg font-light text-blue-600">
                        {((latestForm as any).standardizing_form_no_skim_skim_milk && Array.isArray((latestForm as any).standardizing_form_no_skim_skim_milk))
                          ? (latestForm as any).standardizing_form_no_skim_skim_milk.length : 0}
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
                        <Package className="h-4 w-4 text-orange-500" />
                        <p className="text-sm font-light text-gray-600">Total Quantity</p>
                      </div>
                      <p className="text-lg font-light text-orange-600">
                        {((latestForm as any).standardizing_form_no_skim_skim_milk && Array.isArray((latestForm as any).standardizing_form_no_skim_skim_milk))
                          ? ((latestForm as any).standardizing_form_no_skim_skim_milk).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0).toFixed(1) + 'L'
                          : '0.0L'}
                      </p>
                    </div>
                  </div>

                  {/* BMT Form and Operator Details */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* BMT Form Details */}
                    {latestForm.bmt_id && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <h4 className="text-sm font-light text-gray-900">BMT Form</h4>
                        </div>
                        <div className="space-y-2">
                          {(() => {
                            const bmtForm = getBMTFormById(latestForm.bmt_id)

                            return bmtForm ? (
                              <>
                                <FormIdCopy
                                  displayId={bmtForm.tag}
                                  actualId={latestForm.bmt_id}
                                  size="sm"
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">Volume</span>
                                  <span className="text-xs font-light">{bmtForm.volume}L</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-light">#{latestForm.bmt_id.slice(0, 8)}</span>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Operator Details */}
                    {latestForm.operator_id && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-purple-600" />
                          </div>
                          <h4 className="text-sm font-light text-gray-900">Operator</h4>
                        </div>
                        <div className="space-y-2">
                          {(() => {
                            const operatorUser = getUserById(latestForm.operator_id)

                            return operatorUser ? (
                              <UserAvatar
                                user={operatorUser}
                                size="md"
                                showName={true}
                                showEmail={true}
                                showDropdown={true}
                              />
                            ) : (
                              <div className="text-xs text-gray-400">Unknown operator</div>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Standardizing Forms Data Table */}
            {!loading && (
              <div className="border border-gray-200 rounded-lg bg-white">
                <div className="p-6 pb-0">
                  <div className="text-lg font-light">Standardizing Forms</div>
                </div>
                <div className="p-6 space-y-4">
                  <DataTableFilters
                    filters={tableFilters}
                    onFiltersChange={setTableFilters}
                    onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                    searchPlaceholder="Search standardizing forms..."
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
          </TabsContent>

          <TabsContent value="skimming" className="space-y-6">
            {/* Current Skimming Process */}
            {skimmingLoading ? (
              <ContentSkeleton sections={1} cardsPerSection={4} />
            ) : latestSkimmingForm ? (
              <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-lg font-light">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Droplets className="h-4 w-4 text-white" />
                      </div>
                      <span>Current Skimming Process</span>
                      <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 font-light">Latest</Badge>
                      <FormIdCopy
                        displayId={latestSkimmingForm.tag}
                        actualId={latestSkimmingForm.id}
                        size="sm"
                      />
                    </div>
                    <LoadingButton
                      variant="outline"
                      onClick={() => handleViewSkimmingForm(latestSkimmingForm)}
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
                      <FormIdCopy
                        displayId={latestSkimmingForm.tag}
                        actualId={latestSkimmingForm.id}
                        size="md"
                      />
                    </div>

                    {/* Raw milk (first record) */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-4 w-4 text-green-500" />
                        <p className="text-sm font-light text-gray-600">Raw Milk</p>
                      </div>
                      {(() => {
                        const rm = latestSkimmingForm?.standardizing_form_raw_milk?.[0]
                        return (
                          <p className="text-lg font-light text-green-600">
                            {rm ? `${Number(rm.quantity || 0).toFixed(1)}L • ${rm.fat ?? ""}%` : "N/A"}
                          </p>
                        )
                      })()}
                    </div>

                    {/* Created */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-light text-gray-600">Created</p>
                      </div>
                      <p className="text-lg font-light">{latestSkimmingForm.created_at ? new Date(latestSkimmingForm.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'N/A'}</p>
                    </div>

                    {/* Cream (first record) */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                        <p className="text-sm font-light text-gray-600">Cream</p>
                      </div>
                      {(() => {
                        const cr = latestSkimmingForm?.standardizing_form_cream?.[0]
                        return (
                          <p className="text-lg font-light text-yellow-600">
                            {cr ? `${Number(cr.quantity || 0).toFixed(1)}L • ${cr.fat ?? ""}%` : "N/A"}
                          </p>
                        )
                      })()}
                    </div>
                  </div>

                  {/* BMT Form and Operator Details */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* BMT Form Details */}
                    {latestSkimmingForm.bmt_id && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <h4 className="text-sm font-light text-gray-900">BMT Form</h4>
                        </div>
                        <div className="space-y-2">
                          {(() => {
                            const bmtForm = getBMTFormById(latestSkimmingForm.bmt_id)

                            return bmtForm ? (
                              <>
                                <FormIdCopy
                                  displayId={bmtForm.tag}
                                  actualId={latestSkimmingForm.bmt_id}
                                  size="sm"
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">Volume</span>
                                  <span className="text-xs font-light">{bmtForm.volume}L</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-light">#{latestSkimmingForm.bmt_id.slice(0, 8)}</span>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Operator Details */}
                    {latestSkimmingForm.operator_id && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-purple-600" />
                          </div>
                          <h4 className="text-sm font-light text-gray-900">Operator</h4>
                        </div>
                        <div className="space-y-2">
                          {(() => {
                            const operatorUser = getUserById(latestSkimmingForm.operator_id)

                            return operatorUser ? (
                              <UserAvatar
                                user={operatorUser}
                                size="md"
                                showName={true}
                                showEmail={true}
                                showDropdown={true}
                              />
                            ) : (
                              <div className="text-xs text-gray-400">Unknown operator</div>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-blue-500">
                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Droplets className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-light text-gray-900 mb-2">No Skimming Forms</h3>
                    <p className="text-sm font-light text-gray-600 mb-4">
                      No skimming forms found. Create your first form to get started.
                    </p>
                    <LoadingButton
                      onClick={handleAddSkimmingForm}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Skimming Form
                    </LoadingButton>
                  </div>
                </div>
              </div>
            )}

            {/* Skimming Forms Data Table */}
            {!skimmingLoading && (
              <div className="border border-gray-200 rounded-lg bg-white">
                <div className="p-6 pb-0">
                  <div className="text-lg font-light">Skimming Forms</div>
                </div>
                <div className="p-6 space-y-4">
                  <DataTableFilters
                    filters={tableFilters}
                    onFiltersChange={setTableFilters}
                    onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
                    searchPlaceholder="Search skimming forms..."
                    filterFields={filterFields}
                  />

                  {skimmingLoading ? (
                    <ContentSkeleton sections={1} cardsPerSection={4} />
                  ) : (
                    <DataTable columns={skimmingColumns} data={skimmingForms} showSearch={false} />
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Form Drawer */}
        <StandardizingFormDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          form={selectedForm}
          mode={formMode}
        />

        {/* View Drawer */}
        <StandardizingFormViewDrawer
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
          title="Delete Standardizing Form"
          description={`Are you sure you want to delete this standardizing form? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />

        {/* Skimming Form Drawers */}
        <SkimmingFormDrawer
          open={skimmingFormDrawerOpen}
          onOpenChange={setSkimmingFormDrawerOpen}
          form={selectedSkimmingForm}
          mode={skimmingFormMode}
        />

        <SkimmingFormViewDrawer
          open={skimmingViewDrawerOpen}
          onOpenChange={setSkimmingViewDrawerOpen}
          form={selectedSkimmingForm}
          onEdit={() => {
            setSkimmingViewDrawerOpen(false)
            handleEditSkimmingForm(selectedSkimmingForm!)
          }}
        />

        {/* Skimming Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={skimmingDeleteDialogOpen}
          onOpenChange={setSkimmingDeleteDialogOpen}
          title="Delete Skimming Form"
          description={`Are you sure you want to delete this skimming form? This action cannot be undone and may affect production tracking.`}
          onConfirm={confirmSkimmingDelete}
          loading={false}
        />
      </div>
    </DataCaptureDashboardLayout>
  )
}
