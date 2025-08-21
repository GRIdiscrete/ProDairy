"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SampleManagementTable } from "@/components/laboratory/sample-management-table"
import { SampleMetrics } from "@/components/laboratory/sample-metrics"
import { SampleFilters } from "@/components/laboratory/sample-filters"

export default function SampleManagementPage() {
  return (
    <MainLayout title="Sample Management" subtitle="Track and manage laboratory samples">
      <div className="space-y-6">
        {/* Sample Metrics */}
        <SampleMetrics />

        {/* Sample Filters */}
        <SampleFilters />

        {/* Sample Management Table */}
        <SampleManagementTable />
      </div>
    </MainLayout>
  )
}
