"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchSuppliers, setSupplierFilters } from "@/lib/store/slices/supplierSlice"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Edit, Trash2, Phone, Mail, Eye } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { SupplierFormDrawer } from "@/components/forms/supplier-form-drawer"
import { SupplierViewDrawer } from "@/components/forms/supplier-view-drawer"

export default function SuppliersPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { suppliers, loading, filters } = useSelector((state: RootState) => state.supplier)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [viewingSupplier, setViewingSupplier] = useState(null)

  useEffect(() => {
    dispatch(fetchSuppliers())
  }, [dispatch])

  const handleAddSupplier = () => {
    setEditingSupplier(null)
    setIsDrawerOpen(true)
  }

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier)
    setIsDrawerOpen(true)
  }

  const handleViewSupplier = (supplier: any) => {
    setViewingSupplier(supplier)
    setIsViewDrawerOpen(true)
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Supplier Name",
    },
    {
      accessorKey: "contactPerson",
      header: "Contact Person",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {row.original.phone}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3" />
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{row.original.rating}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleViewSupplier(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditSupplier(row.original)}>
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
    <MainLayout title="Supplier Management" subtitle="Manage supplier relationships and contracts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Supplier Management</h1>
          <Button onClick={handleAddSupplier}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suppliers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {suppliers.filter((s) => s.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {suppliers.filter((s) => s.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {suppliers.length > 0
                  ? (suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length).toFixed(1)
                  : "0.0"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Suppliers</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers..."
                    className="pl-8 w-64"
                    value={filters.search}
                    onChange={(e) => dispatch(setSupplierFilters({ search: e.target.value }))}
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
            <DataTable columns={columns} data={suppliers} loading={loading} />
          </CardContent>
        </Card>

        <SupplierFormDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} supplier={editingSupplier} />
        <SupplierViewDrawer
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          supplier={viewingSupplier}
        />
      </div>
    </MainLayout>
  )
}
