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
      header: "Process Name",
      cell: ({ row }: any) => {
        const process = row.original as Process
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{process.name}</p>
              <p className="text-muted-foreground text-xs">ID: {process.id.slice(0, 8)}...</p>
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
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{process.raw_material_ids.length} materials</span>
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
          <span className="text-sm">
            {new Date(process.created_at).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      cell: ({ row }: any) => {
        const process = row.original as Process
        return (
          <span className="text-sm">
            {process.updated_at ? new Date(process.updated_at).toLocaleDateString() : 'Never'}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const process = row.original as Process
        return (
          <div className="flex space-x-2">
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewProcess(process)}
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditProcess(process)}
            >
              <Settings className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  const isLoading = operationLoading.fetch

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manufacturing Processes</h1>
            <p className="text-muted-foreground">Manage and configure manufacturing processes</p>
          </div>
          <LoadingButton onClick={handleAddProcess} loading={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Process
          </LoadingButton>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Processes</CardTitle>
          </CardHeader>
          <CardContent>
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
              />
            )}
          </CardContent>
        </Card>

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
    </MainLayout>
  )
}