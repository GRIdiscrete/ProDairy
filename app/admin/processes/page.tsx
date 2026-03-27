"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchProcesses } from "@/lib/store/slices/processSlice"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, Settings, Package, Trash2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ProcessFormDrawer } from "@/components/forms/process-form-drawer"
import { ProcessViewDrawer } from "@/components/forms/process-view-drawer"
import { LoadingButton } from "@/components/ui/loading-button"
import type { Process } from "@/lib/types"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionButton } from "@/components/ui/permission-table-actions"
import { PermissionTableActions } from "@/components/ui/permission-table-actions"

export default function ProcessPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { processes, operationLoading } = useSelector((state: RootState) => state.process)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)
  const [viewingProcess, setViewingProcess] = useState<Process | null>(null)

  useEffect(() => {
    dispatch(fetchProcesses())
  }, [dispatch])

  const handleAddProcess = () => {
    setEditingProcess(null)
    setIsDrawerOpen(true)
  }

  const handleEditProcess = (process: Process) => {
    setEditingProcess(process)
    setIsDrawerOpen(true)
  }

  const handleViewProcess = (process: Process) => {
    setViewingProcess(process)
    setIsViewDrawerOpen(true)
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Process",
      cell: ({ row }: any) => {
        const process = row.original as Process
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">{process.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">ID: {process.id.slice(0, 8)}...</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "raw_material_ids",
      header: "Raw Materials",
      cell: ({ row }: any) => {
        const process = row.original as Process
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{process.raw_material_ids.length} materials</p>
            <p className="text-xs text-gray-500">Material assignments</p>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: any) => {
        const process = row.original as Process
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{new Date(process.created_at).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">Process created</p>
          </div>
        )
      },
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      cell: ({ row }: any) => {
        const process = row.original as Process
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">
              {process.updated_at ? new Date(process.updated_at).toLocaleDateString() : 'Never'}
            </p>
            <p className="text-xs text-gray-500">Last modified</p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const process = row.original as Process
        return (
          <PermissionTableActions
            feature="process"
            onView={() => handleViewProcess(process)}
            onEdit={() => handleEditProcess(process)}
            showDropdown={true}
          />
        )
      },
    },
  ]

  const isLoading = operationLoading.fetch

  return (
    <PermissionGuard requiredView="process_tab">
      <AdminDashboardLayout title="Manufacturing Processes" subtitle="Manage and configure manufacturing processes">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Manufacturing Processes</h1>
            <p className="text-sm font-light text-muted-foreground">Manage and configure manufacturing processes</p>
          </div>
          <PermissionButton
            feature="process"
            permission="create"
            onClick={handleAddProcess}
            className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Process
          </PermissionButton>
        </div>

        {/* Counter Widgets with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Total Processes</h3>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Settings className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl text-gray-900">{processes?.length || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Active in system</p>
              </>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">With Materials</h3>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl text-blue-600">
                  {processes?.filter(p => p.raw_material_ids.length > 0).length || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Have raw materials</p>
              </>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Total Materials</h3>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-green-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl text-green-600">
                  {processes?.reduce((total, p) => total + p.raw_material_ids.length, 0) || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Material assignments</p>
              </>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Recently Updated</h3>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Settings className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl text-purple-600">
                  {processes?.filter(p => p.updated_at && new Date(p.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="p-6 pb-0">
            <div className="text-lg font-light">Processes</div>
          </div>
          <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading processes...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={processes || []}
                searchKey="name"
                searchPlaceholder="Search processes by name..."
                showSearch={false}
              />
            )}
          </div>
        </div>

        <ProcessFormDrawer 
          open={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen} 
          process={editingProcess} 
          mode={editingProcess ? "edit" : "create"}
          onSuccess={() => {
            setIsDrawerOpen(false)
            setEditingProcess(null)
          }}
        />
        <ProcessViewDrawer
          open={isViewDrawerOpen}
          onOpenChange={setIsViewDrawerOpen}
          process={viewingProcess}
          onEdit={(process) => {
            setEditingProcess(process)
            setIsDrawerOpen(true)
            setIsViewDrawerOpen(false)
          }}
        />
      </div>
    </AdminDashboardLayout>
    </PermissionGuard>
  )
}