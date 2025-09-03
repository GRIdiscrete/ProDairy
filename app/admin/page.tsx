"use client"

import { useEffect } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { ProductionOverview } from "@/components/dashboard/production-overview"
import { ProductionCostChart } from "@/components/dashboard/production-cost-chart"
import { DowntimeChart } from "@/components/dashboard/downtime-chart"
import { MachineSetup } from "@/components/dashboard/machine-setup"
import { MachineInspectionTable } from "@/components/dashboard/machine-inspection-table"
import { MachineOperatorTable } from "@/components/dashboard/machine-operator-table"
import { QualityEfficiency } from "@/components/dashboard/quality-efficiency"
import { useAppDispatch } from "@/lib/store"
import { fetchDashboardMetrics, fetchRecentBatches, fetchRecentInspections } from "@/lib/store/slices/dashboardSlice"

export default function AdminDashboard() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchDashboardMetrics())
    dispatch(fetchRecentBatches())
    dispatch(fetchRecentInspections())
  }, [dispatch])

  return (
    <AdminDashboardLayout title="Admin Dashboard" subtitle="System administration and management">
      <div className="space-y-6">
        {/* Production Overview Metrics */}
        <ProductionOverview />

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-6">
          <ProductionCostChart />
          <DowntimeChart />
        </div>

        {/* Machine Setup and Quality */}
        <div className="grid gap-6 md:grid-cols-12">
          <MachineSetup />
          <QualityEfficiency />
        </div>

        {/* Tables Section */}
        <div className="grid gap-6 md:grid-cols-1">
          <MachineInspectionTable />
          <MachineOperatorTable />
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
