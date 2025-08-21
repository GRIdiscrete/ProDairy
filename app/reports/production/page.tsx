"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ProductionReportTable } from "@/components/reports/production-report-table"
import { ProductionReportFilters } from "@/components/reports/production-report-filters"
import { ProductionReportMetrics } from "@/components/reports/production-report-metrics"

export default function ProductionReportPage() {
  return (
    <MainLayout title="Production Report" subtitle="Detailed production analysis and reporting">
      <div className="space-y-6">
        {/* Report Metrics */}
        <ProductionReportMetrics />

        {/* Report Filters */}
        <ProductionReportFilters />

        {/* Production Report Table */}
        <ProductionReportTable />
      </div>
    </MainLayout>
  )
}
