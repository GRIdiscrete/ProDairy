"use client"

import { useState, useEffect, useRef } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TableSkeleton, DashboardSkeleton } from "@/components/ui/kanban-skeleton"
import { 
  fetchFillerLog2s,
  fetchFillerLog2PackageIntegrities,
  fetchFillerLog2PackageIntegrityParameters,
  fetchFillerLog2ProcessControls,
  fetchFillerLog2ProcessControlParameters,
  fetchFillerLog2PMSplices,
  fetchFillerLog2PrepAndSterilizations,
  fetchFillerLog2StoppagesLogs,
  fetchFillerLog2StripSplices,
  deleteFillerLog2Action,
  deleteFillerLog2PackageIntegrityAction,
  deleteFillerLog2PackageIntegrityParametersAction,
  deleteFillerLog2ProcessControlAction,
  deleteFillerLog2ProcessControlParametersAction,
  deleteFillerLog2PMSpliceAction,
  deleteFillerLog2PrepAndSterilizationAction,
  deleteFillerLog2StoppagesLogAction,
  deleteFillerLog2StripSpliceAction,
  clearError,
  setSelectedFillerLog2,
  setSelectedPackageIntegrity,
  setSelectedPackageIntegrityParameter,
  setSelectedProcessControl,
  setSelectedProcessControlParameter,
  setSelectedPMSplice,
  setSelectedPrepAndSterilization,
  setSelectedStoppagesLog,
  setSelectedStripSplice
} from "@/lib/store/slices/fillerLog2Slice"
import { FillerLog2, FillerLog2PackageIntegrity, FillerLog2PackageIntegrityParameters, FillerLog2ProcessControl, FillerLog2ProcessControlParameters, FillerLog2PMSplice, FillerLog2PrepAndSterilization, FillerLog2StoppagesLog, FillerLog2StripSplice } from "@/lib/api/data-capture-forms"
import { toast } from "sonner"
import { Plus, Search, Filter, Eye, Edit, Trash2, Package, Settings, Target, Wrench, Scissors, Clock, AlertTriangle, Layers } from "lucide-react"
import { FillerLog2Drawer } from "@/components/forms/filler-log-2-drawer"
import { FillerLog2ViewDrawer } from "@/components/forms/filler-log-2-view-drawer"
import { PackageIntegrityDrawer } from "@/components/forms/package-integrity-drawer"
import { PackageIntegrityViewDrawer } from "@/components/forms/package-integrity-view-drawer"
import { PackageIntegrityParametersDrawer } from "@/components/forms/package-integrity-parameters-drawer"
import { PackageIntegrityParametersViewDrawer } from "@/components/forms/package-integrity-parameters-view-drawer"
import { ProcessControlDrawer } from "@/components/forms/process-control-drawer"
import { ProcessControlViewDrawer } from "@/components/forms/process-control-view-drawer"
import { PMSpliceDrawer } from "@/components/forms/pm-splice-drawer"
import { PMSpliceViewDrawer } from "@/components/forms/pm-splice-view-drawer"
import { PrepSterilizationDrawer } from "@/components/forms/prep-sterilization-drawer"
import { PrepSterilizationViewDrawer } from "@/components/forms/prep-sterilization-view-drawer"
import { StoppagesLogDrawer } from "@/components/forms/stoppages-log-drawer"
import { StoppagesLogViewDrawer } from "@/components/forms/stoppages-log-view-drawer"
import { StripSpliceDrawer } from "@/components/forms/strip-splice-drawer"
import { StripSpliceViewDrawer } from "@/components/forms/strip-splice-view-drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function FillerLog2Page() {
  const dispatch = useAppDispatch()
  const { 
    fillerLog2s, 
    packageIntegrities, 
    packageIntegrityParameters,
    processControls,
    processControlParameters,
    pmSplices,
    prepAndSterilizations,
    stoppagesLogs,
    stripSplices,
    loading, 
    operationLoading, 
    error 
  } = useAppSelector((state) => state.fillerLog2s)


  // Initialize data fetching
  const [isInitialized, setIsInitialized] = useState(false)
  const hasFetchedRef = useRef(false)

  // Table filters
  const [tableFilters, setTableFilters] = useState({
    search: "",
    date: "",
    sku: "",
    machine: "",
    shift: ""
  })

  // Load data on component mount
  useEffect(() => {
    if (!isInitialized && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      setIsInitialized(true)
      dispatch(fetchFillerLog2s())
      dispatch(fetchFillerLog2PackageIntegrities())
      dispatch(fetchFillerLog2PackageIntegrityParameters())
      dispatch(fetchFillerLog2ProcessControls())
      dispatch(fetchFillerLog2ProcessControlParameters())
      dispatch(fetchFillerLog2PMSplices())
      dispatch(fetchFillerLog2PrepAndSterilizations())
      dispatch(fetchFillerLog2StoppagesLogs())
      dispatch(fetchFillerLog2StripSplices())
    }
  }, [dispatch, isInitialized])

  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || error?.error || 'An error occurred'
      toast.error(errorMessage)
      dispatch(clearError())
    }
  }, [error, dispatch])
  
  // Drawer states
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<FillerLog2 | null>(null)
  const [selectedPackageIntegrity, setSelectedPackageIntegrity] = useState<FillerLog2PackageIntegrity | null>(null)
  const [selectedPackageIntegrityParameter, setSelectedPackageIntegrityParameter] = useState<FillerLog2PackageIntegrityParameters | null>(null)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [activeTab, setActiveTab] = useState("integrity")

  // Package Integrity drawer states
  const [packageIntegrityDrawerOpen, setPackageIntegrityDrawerOpen] = useState(false)
  const [packageIntegrityViewDrawerOpen, setPackageIntegrityViewDrawerOpen] = useState(false)
  const [packageIntegrityMode, setPackageIntegrityMode] = useState<"create" | "edit">("create")
  
  // New drawer states
  const [processControlDrawerOpen, setProcessControlDrawerOpen] = useState(false)
  const [processControlViewDrawerOpen, setProcessControlViewDrawerOpen] = useState(false)
  const [pmSpliceDrawerOpen, setPMSpliceDrawerOpen] = useState(false)
  const [pmSpliceViewDrawerOpen, setPMSpliceViewDrawerOpen] = useState(false)
  const [prepSterilizationDrawerOpen, setPrepSterilizationDrawerOpen] = useState(false)
  const [prepSterilizationViewDrawerOpen, setPrepSterilizationViewDrawerOpen] = useState(false)
  const [stoppagesLogDrawerOpen, setStoppagesLogDrawerOpen] = useState(false)
  const [stoppagesLogViewDrawerOpen, setStoppagesLogViewDrawerOpen] = useState(false)
  const [stripSpliceDrawerOpen, setStripSpliceDrawerOpen] = useState(false)
  const [stripSpliceViewDrawerOpen, setStripSpliceViewDrawerOpen] = useState(false)

  // Package Integrity Parameters drawer states
  const [packageIntegrityParametersDrawerOpen, setPackageIntegrityParametersDrawerOpen] = useState(false)
  const [packageIntegrityParametersViewDrawerOpen, setPackageIntegrityParametersViewDrawerOpen] = useState(false)
  const [packageIntegrityParametersMode, setPackageIntegrityParametersMode] = useState<"create" | "edit">("create")

  const handleCreate = () => {
    setSelectedProcess(null)
    setMode("create")
    setFormDrawerOpen(true)
  }

  const handleEdit = (process: FillerLog2) => {
    setSelectedProcess(process)
    setMode("edit")
    setFormDrawerOpen(true)
  }

  const handleView = (process: FillerLog2) => {
    setSelectedProcess(process)
    setViewDrawerOpen(true)
  }

  const handleDelete = (process: FillerLog2) => {
    setSelectedProcess(process)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProcess) return

    try {
      await dispatch(deleteFillerLog2Action(selectedProcess.id!)).unwrap()
      toast.success('Filler Log 2 deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedProcess(null)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || 'Failed to delete filler log 2'
      toast.error(errorMessage)
    }
  }

  // Package Integrity handlers
  const handleCreatePackageIntegrity = () => {
    setSelectedPackageIntegrity(null)
    setPackageIntegrityMode("create")
    setPackageIntegrityDrawerOpen(true)
  }

  const handleEditPackageIntegrity = (integrity: FillerLog2PackageIntegrity) => {
    setSelectedPackageIntegrity(integrity)
    setPackageIntegrityMode("edit")
    setPackageIntegrityDrawerOpen(true)
  }

  const handleViewPackageIntegrity = (integrity: FillerLog2PackageIntegrity) => {
    setSelectedPackageIntegrity(integrity)
    setPackageIntegrityViewDrawerOpen(true)
  }

  const handleDeletePackageIntegrity = async (integrity: FillerLog2PackageIntegrity) => {
    try {
      await dispatch(deleteFillerLog2PackageIntegrityAction(integrity.id!)).unwrap()
      toast.success('Package Integrity deleted successfully')
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || 'Failed to delete package integrity'
      toast.error(errorMessage)
    }
  }

  // Package Integrity Parameters handlers
  const handleCreatePackageIntegrityParameters = () => {
    setSelectedPackageIntegrityParameter(null)
    setPackageIntegrityParametersMode("create")
    setPackageIntegrityParametersDrawerOpen(true)
  }

  // New handler functions
  const handleCreateProcessControl = () => {
    dispatch(setSelectedProcessControl(null))
    setProcessControlDrawerOpen(true)
  }

  const handleCreatePMSplice = () => {
    dispatch(setSelectedPMSplice(null))
    setPMSpliceDrawerOpen(true)
  }

  const handleCreatePrepSterilization = () => {
    dispatch(setSelectedPrepAndSterilization(null))
    setPrepSterilizationDrawerOpen(true)
  }

  const handleCreateStoppagesLog = () => {
    dispatch(setSelectedStoppagesLog(null))
    setStoppagesLogDrawerOpen(true)
  }

  const handleCreateStripSplice = () => {
    dispatch(setSelectedStripSplice(null))
    setStripSpliceDrawerOpen(true)
  }

  const handleEditPackageIntegrityParameters = (parameter: FillerLog2PackageIntegrityParameters) => {
    setSelectedPackageIntegrityParameter(parameter)
    setPackageIntegrityParametersMode("edit")
    setPackageIntegrityParametersDrawerOpen(true)
  }

  const handleViewPackageIntegrityParameters = (parameter: FillerLog2PackageIntegrityParameters) => {
    setSelectedPackageIntegrityParameter(parameter)
    setPackageIntegrityParametersViewDrawerOpen(true)
  }

  const handleDeletePackageIntegrityParameters = async (parameter: FillerLog2PackageIntegrityParameters) => {
    try {
      await dispatch(deleteFillerLog2PackageIntegrityParametersAction(parameter.id!)).unwrap()
      toast.success('Package Integrity Parameters deleted successfully')
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || error || 'Failed to delete package integrity parameters'
      toast.error(errorMessage)
    }
  }

  const getPersonName = (person: any) => {
    if (!person) return "Unknown"
    return `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email || "Unknown"
  }

  const getMachineName = (machine: any) => {
    if (!machine) return "Unknown"
    return machine.name || "Unknown"
  }

  // Filter data based on search and filters
  const filteredFillerLog2s = Array.isArray(fillerLog2s) ? fillerLog2s.filter((item) => {
    const matchesSearch = !tableFilters.search || 
      item.sku?.toLowerCase().includes(tableFilters.search.toLowerCase()) ||
      item.shift?.toLowerCase().includes(tableFilters.search.toLowerCase()) ||
      getPersonName(item.filler_log_2_operator_id_fkey)?.toLowerCase().includes(tableFilters.search.toLowerCase())
    
    const matchesDate = !tableFilters.date || item.date === tableFilters.date
    const matchesSku = !tableFilters.sku || item.sku?.toLowerCase().includes(tableFilters.sku.toLowerCase())
    const matchesMachine = !tableFilters.machine || getMachineName(item.filler_log_2_machine_id_fkey)?.toLowerCase().includes(tableFilters.machine.toLowerCase())
    const matchesShift = !tableFilters.shift || item.shift?.toLowerCase().includes(tableFilters.shift.toLowerCase())

    return matchesSearch && matchesDate && matchesSku && matchesMachine && matchesShift
  }) : []

  const filteredPackageIntegrities = Array.isArray(packageIntegrities) ? packageIntegrities.filter((item) => {
    const matchesSearch = !tableFilters.search || 
      item.filler_log_2_package_integrity_filler_log_2_id_fkey?.sku?.toLowerCase().includes(tableFilters.search.toLowerCase()) ||
      item.filler_log_2_package_integrity_filler_log_2_id_fkey?.shift?.toLowerCase().includes(tableFilters.search.toLowerCase())
    
    return matchesSearch
  }) : []

  const filteredPackageIntegrityParameters = Array.isArray(packageIntegrityParameters) ? packageIntegrityParameters.filter((item) => {
    const matchesSearch = !tableFilters.search || 
      item.category_name?.toLowerCase().includes(tableFilters.search.toLowerCase()) ||
      item.filler_log_2_package_integrit_filler_log_2_package_integri_fkey?.filler_log_2_package_integrity_filler_log_2_id_fkey?.sku?.toLowerCase().includes(tableFilters.search.toLowerCase())
    
    return matchesSearch
  }) : []

  // Define table columns for Filler Log 2
  const fillerLog2Columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => {
        const date = row.getValue("date")
        return date ? new Date(date).toLocaleDateString() : "N/A"
      }
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }: any) => {
        const sku = row.getValue("sku")
        return sku || "N/A"
      }
    },
    {
      accessorKey: "machine",
      header: "Machine",
      cell: ({ row }: any) => {
        const machine = row.original.filler_log_2_machine_id_fkey
        return getMachineName(machine)
      }
    },
    {
      accessorKey: "shift",
      header: "Shift",
      cell: ({ row }: any) => {
        const shift = row.getValue("shift")
        return shift || "N/A"
      }
    },
    {
      accessorKey: "operator",
      header: "Operator",
      cell: ({ row }: any) => {
        const operator = row.original.filler_log_2_operator_id_fkey
        return getPersonName(operator)
      }
    },
    {
      accessorKey: "packages_counter",
      header: "Packages",
      cell: ({ row }: any) => {
        const count = row.getValue("packages_counter")
        return count || 0
      }
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const process = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(process)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(process)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(process)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  // Define table columns for Package Integrity
  const packageIntegrityColumns = [
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ row }: any) => {
        const time = row.getValue("time")
        return time ? new Date(time).toLocaleString() : "N/A"
      }
    },
    {
      accessorKey: "target",
      header: "Target",
      cell: ({ row }: any) => {
        const target = row.getValue("target")
        return target || 0
      }
    },
    {
      accessorKey: "filler_log_2",
      header: "Filler Log 2",
      cell: ({ row }: any) => {
        const fillerLog2 = row.original.filler_log_2_package_integrity_filler_log_2_id_fkey
        return fillerLog2 ? `${fillerLog2.sku} - ${fillerLog2.shift}` : "N/A"
      }
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const integrity = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewPackageIntegrity(integrity)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditPackageIntegrity(integrity)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeletePackageIntegrity(integrity)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  // Define table columns for Package Integrity Parameters
  const packageIntegrityParametersColumns = [
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ row }: any) => {
        const time = row.getValue("time")
        return time ? new Date(time).toLocaleString() : "N/A"
      }
    },
    {
      accessorKey: "category_name",
      header: "Category",
      cell: ({ row }: any) => {
        const category = row.getValue("category_name")
        return category || "N/A"
      }
    },
    {
      accessorKey: "package_integrity",
      header: "Package Integrity",
      cell: ({ row }: any) => {
        const packageIntegrity = row.original.filler_log_2_package_integrit_filler_log_2_package_integri_fkey
        return packageIntegrity ? `Target: ${packageIntegrity.target}` : "N/A"
      }
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const parameter = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewPackageIntegrityParameters(parameter)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditPackageIntegrityParameters(parameter)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeletePackageIntegrityParameters(parameter)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  return (
    <DataCaptureDashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Filler Log 2</h1>
          <p className="text-muted-foreground">
            Manage filler log forms, package integrity, and parameters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Filler Log 2
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Filler Logs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(fillerLog2s) ? fillerLog2s.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Package Integrities</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(packageIntegrities) ? packageIntegrities.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Process Controls</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(processControls) ? processControls.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PM Splices</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(pmSplices) ? pmSplices.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prep & Sterilization</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(prepAndSterilizations) ? prepAndSterilizations.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stoppages Log</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(stoppagesLogs) ? stoppagesLogs.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strip Splices</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(stripSplices) ? stripSplices.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parameters</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(packageIntegrityParameters) ? packageIntegrityParameters.length : 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="border-b border-gray-200">
          <TabsList className="h-auto p-0 bg-transparent border-0">
            <TabsTrigger 
              value="integrity" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-700"
            >
              <Settings className="h-4 w-4" />
              Package Integrity
            </TabsTrigger>
            <TabsTrigger 
              value="process-control" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-700"
            >
              <Target className="h-4 w-4" />
              Process Control
            </TabsTrigger>
            <TabsTrigger 
              value="pm-splice" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-700"
            >
              <Scissors className="h-4 w-4" />
              PM Splice
            </TabsTrigger>
            <TabsTrigger 
              value="prep-sterilization" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-700"
            >
              <Clock className="h-4 w-4" />
              Prep & Sterilization
            </TabsTrigger>
            <TabsTrigger 
              value="stoppages" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-700"
            >
              <AlertTriangle className="h-4 w-4" />
              Stoppages Log
            </TabsTrigger>
            <TabsTrigger 
              value="strip-splice" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-700"
            >
              <Layers className="h-4 w-4" />
              Strip Splice
            </TabsTrigger>
            <TabsTrigger 
              value="parameters" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-700"
            >
              <Filter className="h-4 w-4" />
              Parameters
            </TabsTrigger>
            <TabsTrigger 
              value="logs" 
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-700"
            >
              <Package className="h-4 w-4" />
              Filler Logs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Package Integrity Tab */}
        <TabsContent value="integrity" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Package Integrity</h2>
            <Button onClick={handleCreatePackageIntegrity} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Package Integrity
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Package Integrity Records</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={tableFilters.search}
                      onChange={(e) => setTableFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : (
                <DataTable
                  columns={packageIntegrityColumns}
                  data={filteredPackageIntegrities}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Control Tab */}
        <TabsContent value="process-control" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Process Control</h2>
            <Button onClick={handleCreateProcessControl} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Process Control
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Process Control Records</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={tableFilters.search}
                      onChange={(e) => setTableFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[]} // TODO: Add process control columns
                data={[]} // TODO: Add process control data
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PM Splice Tab */}
        <TabsContent value="pm-splice" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">PM Splice</h2>
            <Button onClick={handleCreatePMSplice} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create PM Splice
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>PM Splice Records</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={tableFilters.search}
                      onChange={(e) => setTableFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[]} // TODO: Add PM splice columns
                data={[]} // TODO: Add PM splice data
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prep & Sterilization Tab */}
        <TabsContent value="prep-sterilization" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Prep & Sterilization</h2>
            <Button onClick={handleCreatePrepSterilization} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Prep & Sterilization
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prep & Sterilization Records</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={tableFilters.search}
                      onChange={(e) => setTableFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[]} // TODO: Add prep & sterilization columns
                data={[]} // TODO: Add prep & sterilization data
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stoppages Log Tab */}
        <TabsContent value="stoppages" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Stoppages Log</h2>
            <Button onClick={handleCreateStoppagesLog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Stoppages Log
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stoppages Log Records</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={tableFilters.search}
                      onChange={(e) => setTableFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[]} // TODO: Add stoppages log columns
                data={[]} // TODO: Add stoppages log data
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strip Splice Tab */}
        <TabsContent value="strip-splice" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Strip Splice</h2>
            <Button onClick={handleCreateStripSplice} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Strip Splice
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Strip Splice Records</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={tableFilters.search}
                      onChange={(e) => setTableFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[]} // TODO: Add strip splice columns
                data={[]} // TODO: Add strip splice data
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parameters Tab */}
        <TabsContent value="parameters" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Package Integrity Parameters</h2>
            <Button onClick={handleCreatePackageIntegrityParameters} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Parameters
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Package Integrity Parameters</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={tableFilters.search}
                      onChange={(e) => setTableFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={packageIntegrityParametersColumns}
                data={filteredPackageIntegrityParameters}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filler Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Filler Logs</h2>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filler Log 2 Records</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={tableFilters.search}
                      onChange={(e) => setTableFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : (
                <DataTable
                  columns={fillerLog2Columns}
                  data={filteredFillerLog2s}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drawers */}
      <FillerLog2Drawer
        open={formDrawerOpen}
        onOpenChange={setFormDrawerOpen}
        process={selectedProcess}
        mode={mode}
      />

      <FillerLog2ViewDrawer
        open={viewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
        process={selectedProcess}
        onEdit={() => {
          setViewDrawerOpen(false)
          setMode("edit")
          setFormDrawerOpen(true)
        }}
      />

      <PackageIntegrityDrawer
        open={packageIntegrityDrawerOpen}
        onOpenChange={setPackageIntegrityDrawerOpen}
        integrity={selectedPackageIntegrity}
        mode={packageIntegrityMode}
      />

      <PackageIntegrityViewDrawer
        open={packageIntegrityViewDrawerOpen}
        onOpenChange={setPackageIntegrityViewDrawerOpen}
        integrity={selectedPackageIntegrity}
        onEdit={() => {
          setPackageIntegrityViewDrawerOpen(false)
          setPackageIntegrityMode("edit")
          setPackageIntegrityDrawerOpen(true)
        }}
      />

      <PackageIntegrityParametersDrawer
        open={packageIntegrityParametersDrawerOpen}
        onOpenChange={setPackageIntegrityParametersDrawerOpen}
        parameter={selectedPackageIntegrityParameter}
        mode={packageIntegrityParametersMode}
      />

      <PackageIntegrityParametersViewDrawer
        open={packageIntegrityParametersViewDrawerOpen}
        onOpenChange={setPackageIntegrityParametersViewDrawerOpen}
        parameter={selectedPackageIntegrityParameter}
        onEdit={() => {
          setPackageIntegrityParametersViewDrawerOpen(false)
          setPackageIntegrityParametersMode("edit")
          setPackageIntegrityParametersDrawerOpen(true)
        }}
      />

      {/* New Drawer Components */}
      <ProcessControlDrawer
        isOpen={processControlDrawerOpen}
        onClose={() => setProcessControlDrawerOpen(false)}
        processControl={useAppSelector((state) => state.fillerLog2s.selectedProcessControl)}
      />

      <ProcessControlViewDrawer
        isOpen={processControlViewDrawerOpen}
        onClose={() => setProcessControlViewDrawerOpen(false)}
        processControl={useAppSelector((state) => state.fillerLog2s.selectedProcessControl)}
      />

      <PMSpliceDrawer
        isOpen={pmSpliceDrawerOpen}
        onClose={() => setPMSpliceDrawerOpen(false)}
        pmSplice={useAppSelector((state) => state.fillerLog2s.selectedPMSplice)}
      />

      <PMSpliceViewDrawer
        isOpen={pmSpliceViewDrawerOpen}
        onClose={() => setPMSpliceViewDrawerOpen(false)}
        pmSplice={useAppSelector((state) => state.fillerLog2s.selectedPMSplice)}
      />

      <PrepSterilizationDrawer
        isOpen={prepSterilizationDrawerOpen}
        onClose={() => setPrepSterilizationDrawerOpen(false)}
        prepSterilization={useAppSelector((state) => state.fillerLog2s.selectedPrepAndSterilization)}
      />

      <PrepSterilizationViewDrawer
        isOpen={prepSterilizationViewDrawerOpen}
        onClose={() => setPrepSterilizationViewDrawerOpen(false)}
        prepSterilization={useAppSelector((state) => state.fillerLog2s.selectedPrepAndSterilization)}
      />

      <StoppagesLogDrawer
        isOpen={stoppagesLogDrawerOpen}
        onClose={() => setStoppagesLogDrawerOpen(false)}
        stoppagesLog={useAppSelector((state) => state.fillerLog2s.selectedStoppagesLog)}
      />

      <StoppagesLogViewDrawer
        isOpen={stoppagesLogViewDrawerOpen}
        onClose={() => setStoppagesLogViewDrawerOpen(false)}
        stoppagesLog={useAppSelector((state) => state.fillerLog2s.selectedStoppagesLog)}
      />

      <StripSpliceDrawer
        isOpen={stripSpliceDrawerOpen}
        onClose={() => setStripSpliceDrawerOpen(false)}
        stripSplice={useAppSelector((state) => state.fillerLog2s.selectedStripSplice)}
      />

      <StripSpliceViewDrawer
        isOpen={stripSpliceViewDrawerOpen}
        onClose={() => setStripSpliceViewDrawerOpen(false)}
        stripSplice={useAppSelector((state) => state.fillerLog2s.selectedStripSplice)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the filler log 2 record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </DataCaptureDashboardLayout>
  )
}
