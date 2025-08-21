"use client"

import React from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { setSupplierFilters, fetchSuppliers } from "@/lib/store/slices/supplierSlice"
import { MainLayout } from "@/components/layout/main-layout"
import { SupplierMetrics } from "@/components/suppliers/supplier-metrics"
import { SupplierFilters } from "@/components/suppliers/supplier-filters"
import { SupplierDirectoryTable } from "@/components/suppliers/supplier-directory-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function SupplierDirectoryPage() {
  const dispatch = useDispatch()
  const { suppliers, filters, loading } = useSelector((state: RootState) => state.supplier)

  React.useEffect(() => {
    dispatch(fetchSuppliers() as any)
  }, [dispatch])

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
          <SupplierFilters
            filters={filters}
            onFiltersChange={(newFilters) => dispatch(setSupplierFilters(newFilters))}
          />

          <SupplierDirectoryTable suppliers={suppliers} loading={loading} />
        </div>
      </div>
    </MainLayout>
  )
}
