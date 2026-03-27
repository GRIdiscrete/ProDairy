"use client"

import { ToolsDashboardLayout } from "@/components/layout/tools-dashboard-layout"

export default function ToolsDashboard() {
  return (
    <ToolsDashboardLayout title="Tools" subtitle="Utilities and process tools">
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg bg-white p-6">
          <h2 className="text-lg font-light">Welcome to Tools</h2>
          <p className="text-sm text-gray-600 mt-2">Use the sidebar to access Bulk Milk Transfer, CIP Control, and IST Control tools.</p>
        </div>
      </div>
    </ToolsDashboardLayout>
  )
}


