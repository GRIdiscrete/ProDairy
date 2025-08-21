"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ProductionBatchesTable } from "@/components/production/production-batches-table"
import { ProductionMetrics } from "@/components/production/production-metrics"
import { ProductionFilters } from "@/components/production/production-filters"
import { useAppDispatch } from "@/lib/store"
import { fetchProductionBatches } from "@/lib/store/slices/productionSlice"

export default function ProductionPage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchProductionBatches({}))
  }, [dispatch])

  return (
    <MainLayout title="Production Management" subtitle="Monitor and manage production batches">
      <div className="space-y-6">
        {/* Production Metrics */}
        <ProductionMetrics />

        {/* Filters */}
        <ProductionFilters />

        {/* Production Batches Table */}
        <ProductionBatchesTable />
      </div>
    </MainLayout>
  )
}
