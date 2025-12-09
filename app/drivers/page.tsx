"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchDriverForms } from "@/lib/store/slices/driverFormSlice"
import { DriversDashboardLayout } from "@/components/layout/drivers-dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Truck, FileText, Wrench, Clock, MapPin, Package, Activity, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { LocalStorageService } from "@/lib/offline/local-storage-service"
import { useNetworkStatus } from "@/hooks/use-network-status"
import type { DriverForm } from "@/lib/types"
import { format } from "date-fns"

// Skeleton Loader Component
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <Skeleton className="h-8 w-8 rounded-lg mb-3" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DriversDashboard() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { driverForms, loading } = useSelector((state: RootState) => state.driverForm)
  const { isOnline } = useNetworkStatus()
  const [isLoading, setIsLoading] = useState(true)
  const [displayForms, setDisplayForms] = useState<DriverForm[]>([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Try to fetch online data if online
        if (isOnline) {
          await dispatch(fetchDriverForms({})).unwrap()
        }
      } catch (error) {
        console.error('Failed to fetch driver forms:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [dispatch, isOnline])

  useEffect(() => {
    // Use online data when available, fallback to offline data
    if (isOnline && driverForms && driverForms.length > 0) {
      setDisplayForms(driverForms)
    } else {
      const offlineForms = LocalStorageService.getDriverForms()
      setDisplayForms(offlineForms)
    }
  }, [isOnline, driverForms])

  // Calculate stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pendingForms = displayForms.filter(f => !f.delivered && !f.rejected)
  const deliveredToday = displayForms.filter(f => {
    if (!f.delivered) return false
    const formDate = new Date(f.created_at)
    formDate.setHours(0, 0, 0, 0)
    return formDate.getTime() === today.getTime()
  })
  const activeDeliveries = displayForms.filter(f => !f.delivered && !f.rejected)

  // Calculate total distance (sum of collected amounts as a proxy)
  const totalDistance = displayForms
    .filter(f => f.delivered)
    .reduce((sum, form) => {
      const products = form.drivers_form_collected_products || []
      return sum + products.reduce((pSum, p) => pSum + (p.collected_amount || 0), 0)
    }, 0)

  // Get recent 5 forms
  const recentForms = [...displayForms]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const handleFormClick = (formId: string) => {
    router.push(`/drivers/forms?form_id=${formId}`)
  }

  const handleNavigateToForms = () => {
    router.push('/drivers/forms')
  }

  if (isLoading) {
    return (
      <DriversDashboardLayout title="Drivers Dashboard" subtitle="Driver management and tools">
        <DashboardSkeleton />
      </DriversDashboardLayout>
    )
  }

  return (
    <DriversDashboardLayout title="Drivers Dashboard" subtitle="Driver management and tools">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Active Deliveries</h3>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-blue-600">{activeDeliveries.length}</div>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Completed Today</h3>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-green-600">{deliveredToday.length}</div>
            <p className="text-xs text-gray-500 mt-1">Deliveries</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Pending Forms</h3>
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-yellow-600">{pendingForms.length}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Total Forms</h3>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-purple-600">{displayForms.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-light">Recent Driver Forms</h2>
              </div>
            </div>
            <div className="p-6">
              {recentForms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No driver forms yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentForms.map((form) => {
                    const status = form.delivered ? "completed" : form.rejected ? "rejected" : "pending"
                    const productsCount = form.drivers_form_collected_products?.length || 0
                    const formDate = new Date(form.created_at)
                    const timeAgo = formatTimeAgo(formDate)

                    return (
                      <div 
                        key={form.id} 
                        onClick={() => handleFormClick(form.id)}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-light">{form.tag || 'Form'}</p>
                            <p className="text-sm text-gray-500">{productsCount} products • {timeAgo}</p>
                          </div>
                        </div>
                        <Badge
                          className={
                            status === "completed"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : status === "rejected"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-light">Quick Actions</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={handleNavigateToForms}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-light mb-1">Driver Forms</h3>
                  <p className="text-sm text-gray-500">Submit delivery forms</p>
                </div>

               
              </div>
            </div>
          </div>
        </div>
      </div>
    </DriversDashboardLayout>
  )
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return format(date, 'MMM d, yyyy')
}
