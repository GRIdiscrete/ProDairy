"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { setFilters } from "@/lib/store/slices/rawMaterialSlice"
import { MainLayout } from "@/components/layout/main-layout"
import { RawMaterialMetrics } from "@/components/inventory/raw-material-metrics"
import { RawMaterialFilters } from "@/components/inventory/raw-material-filters"
import { RawMaterialTable } from "@/components/inventory/raw-material-table"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

export default function RawMaterialsPage() {
  const dispatch = useDispatch()
  const { rawMaterials, filters, loading } = useSelector((state: RootState) => state.rawMaterial)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Raw Materials Inventory</h1>
            <p className="text-gray-400 mt-1">Track and manage raw material stock levels</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </div>
        </div>

        <RawMaterialMetrics />

        <div className="bg-gray-800 rounded-lg p-6">
          <RawMaterialFilters
            filters={filters}
            onFiltersChange={(newFilters) => dispatch(setFilters(newFilters))}
          />

          <RawMaterialTable materials={rawMaterials} loading={loading} />
        </div>
      </div>
    </MainLayout>
  )
}
