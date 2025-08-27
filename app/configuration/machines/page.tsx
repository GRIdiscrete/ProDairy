"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Eye, Edit, Trash2, Search, Cpu, Gauge, Wrench, Activity } from "lucide-react"
import { MachineFormDrawer } from "@/components/forms/machine-form-drawer"
import { MachineViewDrawer } from "@/components/forms/machine-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchMachines, deleteMachine, clearError } from "@/lib/store/slices/machineSlice"
import { toast } from "sonner"

export default function MachinesPage() {
  const dispatch = useAppDispatch()
  const { machines, loading, error, operationLoading } = useAppSelector((state) => state.machine)
  
  const [searchTerm, setSearchTerm] = useState("")
  const hasFetchedRef = useRef(false)
  
  // Load machines on component mount - prevent duplicate calls with ref
  useEffect(() => {
    if (!hasFetchedRef.current && !operationLoading.fetch) {
      hasFetchedRef.current = true
      dispatch(fetchMachines())
    }
  }, [dispatch, operationLoading.fetch])
  
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
  
  // Selected machine and mode
  const [selectedMachine, setSelectedMachine] = useState<any>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Filter machines
  const filteredMachines = machines.filter(machine => 
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Action handlers
  const handleAddMachine = () => {
    setSelectedMachine(null)
    setFormMode("create")
    setFormDrawerOpen(true)
  }

  const handleEditMachine = (machine: any) => {
    setSelectedMachine(machine)
    setFormMode("edit")
    setFormDrawerOpen(true)
  }

  const handleViewMachine = (machine: any) => {
    setSelectedMachine(machine)
    setViewDrawerOpen(true)
  }

  const handleDeleteMachine = (machine: any) => {
    setSelectedMachine(machine)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedMachine) return
    
    try {
      await dispatch(deleteMachine(selectedMachine.id)).unwrap()
      toast.success('Machine deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedMachine(null)
    } catch (error: any) {
      // Backend error message will be used from the thunk
      toast.error(error || 'Failed to delete machine')
    }
  }

  // Table columns with actions
  const columns = [
    {
      accessorKey: "name",
      header: "Machine",
      cell: ({ row }: any) => {
        const machine = row.original
        const getStatusColor = () => {
          switch (machine.status?.toLowerCase()) {
            case "active": return "bg-green-100 text-green-800"
            case "maintenance": return "bg-yellow-100 text-yellow-800"
            case "inactive": return "bg-red-100 text-red-800"
            case "offline": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
          }
        }
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{machine.name}</span>
                <Badge className={getStatusColor()}>{machine.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Serial: {machine.serial_number} • {machine.category}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }: any) => {
        const machine = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{machine.location}</p>
            <p className="text-xs text-gray-500">{machine.category}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const machine = row.original
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{new Date(machine.created_at).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">Updated: {new Date(machine.updated_at).toLocaleDateString()}</p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const machine = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton variant="outline" size="sm" onClick={() => handleViewMachine(machine)}>
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton variant="outline" size="sm" onClick={() => handleEditMachine(machine)}>
              <Settings className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteMachine(machine)}
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Machine Configuration</h1>
            <p className="text-muted-foreground">Manage and configure production machines</p>
          </div>
          <LoadingButton onClick={handleAddMachine}>
            <Plus className="mr-2 h-4 w-4" />
            Add Machine
          </LoadingButton>
        </div>

        {/* Counter Widgets with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Machines</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{machines.length}</div>
                  <p className="text-xs text-muted-foreground">Active in system</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {machines.filter((m) => m.status === "active").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-yellow-600">
                    {machines.filter((m) => m.status === "maintenance").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Under maintenance</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Gauge className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {operationLoading.fetch ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600">
                    {machines.filter((m) => m.status === "inactive" || m.status === "offline").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Not operational</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Machine Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Machines</CardTitle>
          </CardHeader>
          <CardContent>
            {operationLoading.fetch ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading machines...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredMachines}
                searchKey="name"
                searchPlaceholder="Search machines..."
              />
            )}
          </CardContent>
        </Card>

        {/* Form Drawer */}
        <MachineFormDrawer 
          open={formDrawerOpen} 
          onOpenChange={setFormDrawerOpen} 
          machine={selectedMachine}
          mode={formMode} 
        />

        {/* View Drawer */}
        <MachineViewDrawer
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          machine={selectedMachine}
          onEdit={() => {
            setViewDrawerOpen(false)
            handleEditMachine(selectedMachine)
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Machine"
          description={`Are you sure you want to delete ${selectedMachine?.name}? This action cannot be undone and may affect production processes.`}
          onConfirm={confirmDelete}
          loading={operationLoading.delete}
        />
      </div>
    </MainLayout>
  )
}
