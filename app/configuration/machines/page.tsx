"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchMachines, setFilters } from "@/lib/store/slices/machineSlice"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { MachineFormDrawer } from "@/components/forms/machine-form-drawer"
import { MachineViewDrawer } from "@/components/forms/machine-view-drawer"

export default function MachinesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { machines, loading, filters } = useSelector((state: RootState) => state.machine)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [editingMachine, setEditingMachine] = useState(null)
  const [viewingMachine, setViewingMachine] = useState(null)

  useEffect(() => {
    dispatch(fetchMachines())
  }, [dispatch])

  const handleAddMachine = () => {
    setEditingMachine(null)
    setIsDrawerOpen(true)
  }

  const handleEditMachine = (machine: any) => {
    setEditingMachine(machine)
    setIsDrawerOpen(true)
  }

  const handleViewMachine = (machine: any) => {
    setViewingMachine(machine)
    setIsViewDrawerOpen(true)
  }

  const columns = [
    {
      accessorKey: "serialNumber",
      header: "Serial Number",
    },
    {
      accessorKey: "name",
      header: "Machine Name",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === "running" ? "default" : "secondary"}>{row.original.status}</Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleViewMachine(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditMachine(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <MainLayout title="Machine Configuration" subtitle="Manage and configure production machines">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Machine Configuration</h1>
          <Button onClick={handleAddMachine}>
            <Plus className="h-4 w-4 mr-2" />
            Add Machine
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Machines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{machines.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {machines.filter((m) => m.status === "running").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {machines.filter((m) => m.status === "maintenance").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {machines.filter((m) => m.status === "offline").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Machines</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search machines..."
                    className="pl-8 w-64"
                    value={filters.search}
                    onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
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
            <DataTable columns={columns} data={machines} loading={loading} />
          </CardContent>
        </Card>

        <MachineFormDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} machine={editingMachine} />
        <MachineViewDrawer
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          machine={viewingMachine}
        />
      </div>
    </MainLayout>
  )
}
