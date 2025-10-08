"use client"

import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { AdminOverviewCards } from "@/components/dashboard/admin-overview-cards"
import { AdminDashboardSkeleton } from "@/components/ui/admin-dashboard-skeleton"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useState, useEffect } from "react"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading time for skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <PermissionGuard requiredView="dashboard">
      <AdminDashboardLayout title="Admin Dashboard" subtitle="System administration and management">
        <div className="space-y-6">
          {isLoading ? (
            <AdminDashboardSkeleton />
          ) : (
            <>
              {/* Overview Cards */}
              <div>
                <h2 className="text-2xl font-light text-foreground mb-4">System Overview</h2>
                <AdminOverviewCards />
              </div>
            </>
          )}
        </div>
      </AdminDashboardLayout>
    </PermissionGuard>
  )
}
