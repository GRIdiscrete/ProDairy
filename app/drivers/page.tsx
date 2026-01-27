"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { cn } from "@/lib/utils"
import { fetchCollectionVouchers } from "@/lib/store/slices/collectionVoucherSlice"
import { DriversDashboardLayout } from "@/components/layout/drivers-dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Truck, FileText, Wrench, Clock, Activity, CheckCircle, ClipboardList, Droplets } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { LocalStorageService } from "@/lib/offline/local-storage-service"
import { useNetworkStatus } from "@/hooks/use-network-status"
import type { CollectionVoucher2 } from "@/lib/types"
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
  const { collectionVouchers, loading } = useSelector((state: RootState) => state.collectionVoucher)
  const { isOnline } = useNetworkStatus()
  const [isLoading, setIsLoading] = useState(true)
  const [displayVouchers, setDisplayVouchers] = useState<CollectionVoucher2[]>([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        if (isOnline) {
          await dispatch(fetchCollectionVouchers({})).unwrap()
        }
      } catch (error) {
        console.error('Failed to fetch collection vouchers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [dispatch, isOnline])

  useEffect(() => {
    if (isOnline && collectionVouchers && collectionVouchers.length > 0) {
      setDisplayVouchers(collectionVouchers)
    } else {
      const offlineVouchers = LocalStorageService.getCollectionVouchers()
      setDisplayVouchers(offlineVouchers as any)
    }
  }, [isOnline, collectionVouchers])

  // Calculate stats
  const todayStr = new Date().toISOString().split('T')[0]

  const vouchersToday = displayVouchers.filter(v => v.date.startsWith(todayStr))

  const totalVolumeToday = vouchersToday.reduce((total, v) => {
    const details = v.raw_milk_collection_voucher_2_details || []
    return total + details.reduce((dTotal, d) => {
      const tanks = d.raw_milk_collection_voucher_2_details_farmer_tank || []
      return dTotal + tanks.reduce((tTotal, t) => tTotal + (Number(t.volume) || 0), 0)
    }, 0)
  }, 0)

  const recentVouchers = [...displayVouchers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const handleVoucherClick = (voucherId: string) => {
    router.push(`/drivers/collection-vouchers?voucher_id=${voucherId}`)
  }

  const handleNavigateToVouchers = () => {
    router.push('/drivers/collection-vouchers')
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
              <h3 className="text-sm text-gray-600">Vouchers Today</h3>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-blue-600">{vouchersToday.length}</div>
            <p className="text-xs text-gray-500 mt-1">Collections</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Volume Today</h3>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-green-600">{totalVolumeToday.toLocaleString()} L</div>
            <p className="text-xs text-gray-500 mt-1">Total milk volume</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Total Vouchers</h3>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-light text-purple-600">{displayVouchers.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Network Status</h3>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Activity className={cn("h-4 w-4", isOnline ? "text-green-600" : "text-red-600")} />
              </div>
            </div>
            <div className={cn("text-2xl font-light", isOnline ? "text-green-600" : "text-red-600")}>
              {isOnline ? "Online" : "Offline"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Connection state</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-light">Recent Collection Vouchers</h2>
              </div>
            </div>
            <div className="p-6">
              {recentVouchers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No collection vouchers yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentVouchers.map((voucher) => {
                    const voucherDate = new Date(voucher.created_at)
                    const timeAgo = formatTimeAgo(voucherDate)

                    // Simple logic to count tanks as products for display
                    const tankCount = (voucher.raw_milk_collection_voucher_2_details || []).reduce(
                      (count, d) => count + (d.raw_milk_collection_voucher_2_details_farmer_tank?.length || 0), 0
                    )

                    return (
                      <div
                        key={voucher.id}
                        onClick={() => handleVoucherClick(voucher.id)}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-light">{voucher.tag || 'Voucher'}</p>
                            <p className="text-sm text-gray-500">{tankCount} tanks • {timeAgo}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          collected
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
                  onClick={handleNavigateToVouchers}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A0CF06] to-[#8eb805] flex items-center justify-center mb-3">
                    <ClipboardList className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-light mb-1">Collection Vouchers</h3>
                  <p className="text-sm text-gray-500">Log milk collections</p>
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
