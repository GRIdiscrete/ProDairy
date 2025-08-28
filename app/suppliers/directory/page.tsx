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
import { Plus } from "lucide-react"
import { TableFilters } from "@/lib/types"

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
      key: "company",
      label: "Company",
      type: "text" as const,
      placeholder: "Filter by company"
    },
    {
      key: "email",
      label: "Email",
      type: "text" as const,
      placeholder: "Filter by email"
    },
    {
      key: "phone",
      label: "Phone",
      type: "text" as const,
      placeholder: "Filter by phone"
    }
  ], [])

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

          <SupplierDirectoryTable suppliers={suppliers} loading={loading} />
        </div>
      </div>
    </MainLayout>
  )
}
