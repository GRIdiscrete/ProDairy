"use client"

import React, { useState, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { fetchSuppliers } from "@/lib/store/slices/supplierSlice"
import { MainLayout } from "@/components/layout/main-layout"
import { SupplierMetrics } from "@/components/suppliers/supplier-metrics"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import { Plus, Eye, Edit, Trash2, Building2 } from "lucide-react"
import { TableFilters } from "@/lib/types"
import { ColumnDef } from "@tanstack/react-table"
import { Supplier } from "@/lib/types"

export default function SupplierDirectoryPage() {
  const dispatch = useDispatch()
  const { suppliers, loading } = useSelector((state: RootState) => state.supplier)
  const [tableFilters, setTableFilters] = useState<TableFilters>({})

  React.useEffect(() => {
    dispatch(fetchSuppliers({ filters: tableFilters }) as any)
  }, [dispatch, tableFilters])

  // Filter fields configuration for suppliers
  const filterFields = useMemo(() => [
    {
      key: "first_name",
      label: "First Name",
      type: "text" as const,
      placeholder: "Filter by first name"
    },
    {
      key: "last_name",
      label: "Last Name",
      type: "text" as const,
      placeholder: "Filter by last name"
    },
    {
      key: "email",
      label: "Email",
      type: "text" as const,
      placeholder: "Filter by email"
    },
    {
      key: "phone_number",
      label: "Phone Number",
      type: "text" as const,
      placeholder: "Filter by phone number"
    }
  ], [])

  // Action handlers
  const handleViewSupplier = (supplier: Supplier) => {
    console.log('View supplier:', supplier)
    // TODO: Implement view supplier functionality
  }

  const handleEditSupplier = (supplier: Supplier) => {
    console.log('Edit supplier:', supplier)
    // TODO: Implement edit supplier functionality
  }

  const handleDeleteSupplier = (supplier: Supplier) => {
    console.log('Delete supplier:', supplier)
    // TODO: Implement delete supplier functionality
  }

  // Define columns for DataTable
  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Supplier",
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{`${supplier.first_name} ${supplier.last_name}`.trim() || 'Unknown Supplier'}</p>
              <p className="text-muted-foreground text-xs">{supplier.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => {
        const company = row.original.company || 'N/A'
        return <span className="text-sm">{company}</span>
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.phone_number || 'N/A'
        return <span className="text-sm">{phone}</span>
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : 'N/A'
        return <span className="text-sm">{date}</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        // All suppliers are considered active in this implementation
        return (
          <Badge variant="default">
            Active
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <div className="flex space-x-2">
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewSupplier(supplier)}
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditSupplier(supplier)}
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteSupplier(supplier)}
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
            <h1 className="text-2xl font-semibold text-white">Supplier Directory</h1>
            <p className="text-gray-400 mt-1">Manage suppliers and vendor relationships</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        <SupplierMetrics />

        <div className="bg-gray-800 rounded-lg p-6">
          <DataTableFilters
            filters={tableFilters}
            onFiltersChange={setTableFilters}
            onSearch={(searchTerm) => setTableFilters(prev => ({ ...prev, search: searchTerm }))}
            searchPlaceholder="Search suppliers..."
            filterFields={filterFields}
          />

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading suppliers...</p>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={suppliers}
              showSearch={false}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
}
