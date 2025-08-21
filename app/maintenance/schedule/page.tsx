"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { MaintenanceMetrics } from "@/components/maintenance/maintenance-metrics"
import { MaintenanceScheduleTable } from "@/components/maintenance/maintenance-schedule-table"
import { MaintenanceFilters } from "@/components/maintenance/maintenance-filters"
import { MaintenanceCalendar } from "@/components/maintenance/maintenance-calendar"

export default function MaintenanceSchedulePage() {
  return (
    <MainLayout title="Maintenance Schedule" subtitle="Plan and track equipment maintenance">
      <div className="space-y-6">
        {/* Maintenance Metrics */}
        <MaintenanceMetrics />

        {/* Calendar and Filters */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <MaintenanceFilters />
          </div>
          <MaintenanceCalendar />
        </div>

        {/* Maintenance Schedule Table */}
        <MaintenanceScheduleTable />
      </div>
    </MainLayout>
  )
}
