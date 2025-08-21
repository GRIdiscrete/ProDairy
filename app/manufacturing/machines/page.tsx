"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { MachineMetrics } from "@/components/machines/machine-metrics"
import { MachineStatusGrid } from "@/components/machines/machine-status-grid"
import { MachineFilters } from "@/components/machines/machine-filters"
import { MachineListTable } from "@/components/machines/machine-list-table"
import { useAppDispatch } from "@/lib/store"
import { fetchMachines } from "@/lib/store/slices/machineSlice"

export default function MachineManagementPage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchMachines({}))
  }, [dispatch])

  return (
    <MainLayout title="Machine Management" subtitle="Monitor and manage manufacturing equipment">
      <div className="space-y-6">
        {/* Machine Metrics */}
        <MachineMetrics />

        {/* Machine Status Grid */}
        <MachineStatusGrid />

        {/* Machine Filters */}
        <MachineFilters />

        {/* Machine List Table */}
        <MachineListTable />
      </div>
    </MainLayout>
  )
}
