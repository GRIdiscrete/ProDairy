"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchProductionBatches } from "@/lib/store/slices/productionSlice"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Edit, Play, Pause, CircleStopIcon as Stop, Eye } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ProcessFormDrawer } from "@/components/forms/process-form-drawer"
import { ProcessViewDrawer } from "@/components/forms/process-view-drawer"

export default function ProcessPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { batches, loading } = useSelector((state: RootState) => state.production)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [editingProcess, setEditingProcess] = useState(null)
  const [viewingProcess, setViewingProcess] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    dispatch(fetchProductionBatches({}))
  }, [dispatch])

  const handleAddProcess = () => {
    setEditingProcess(null)
    setIsDrawerOpen(true)
  }

  const handleEditProcess = (process: any) => {
    setEditingProcess(process)
    setIsDrawerOpen(true)
  }

  const handleViewProcess = (process: any) => {
    setViewingProcess(process)
    setIsViewDrawerOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "default"
      case "paused":
        return "secondary"
      case "completed":
        return "outline"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const columns = [
    {
      accessorKey: "batchId",
      header: "Process ID",
    },
    {
      accessorKey: "productType",
      header: "Product Type",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <Badge variant={getStatusColor(row.original.status)}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "startTime",
      header: "Start Time",
      cell: ({ row }: any) => new Date(row.original.startTime).toLocaleString(),
    },
    {
      accessorKey: "expectedEndTime",
      header: "Expected End",
      cell: ({ row }: any) => new Date(row.original.expectedEndTime).toLocaleString(),
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${row.original.progress}%` }} />
          </div>
          <span className="text-sm">{row.original.progress}%</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewProcess(row.original)}>
            <Eye className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm">
            <Play className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm">
            <Pause className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm">
            <Stop className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditProcess(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <MainLayout title="Process Management" subtitle="Monitor and control production processes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Process Management</h1>
          <Button onClick={handleAddProcess}>
            <Plus className="h-4 w-4 mr-2" />
            Start New Process
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Processes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {batches.filter((b) => b.status === "running").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Paused</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {batches.filter((b) => b.status === "paused").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {batches.filter((b) => b.status === "completed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {batches.filter((b) => b.status === "failed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Production Processes</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search processes..."
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={batches} loading={loading} />
          </CardContent>
        </Card>

        <ProcessFormDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} process={editingProcess} />
        <ProcessViewDrawer
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          process={viewingProcess}
        />
      </div>
    </MainLayout>
  )
}
