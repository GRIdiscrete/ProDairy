"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { QualityMetrics } from "@/components/laboratory/quality-metrics"
import { QualityTestsTable } from "@/components/laboratory/quality-tests-table"
import { QualityFilters } from "@/components/laboratory/quality-filters"
import { PendingTestsCard } from "@/components/laboratory/pending-tests-card"
import { useAppDispatch } from "@/lib/store"
import { fetchQualityTests } from "@/lib/store/slices/laboratorySlice"

export default function QualityControlPage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchQualityTests({}))
  }, [dispatch])

  return (
    <MainLayout title="Quality Control" subtitle="Laboratory testing and quality management">
      <div className="space-y-6">
        {/* Quality Metrics */}
        <QualityMetrics />

        {/* Pending Tests and Filters */}
        <div className="grid gap-6 md:grid-cols-4">
          <PendingTestsCard />
          <div className="md:col-span-3">
            <QualityFilters />
          </div>
        </div>

        {/* Quality Tests Table */}
        <QualityTestsTable />
      </div>
    </MainLayout>
  )
}
