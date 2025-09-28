"use client"

// Removed Card imports - using divs instead

// Individual card skeleton
const CardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex flex-row items-center justify-between mb-4">
      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
)

// Chart skeleton
const ChartSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="mb-4">
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="h-64 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  </div>
)

// Table skeleton
const TableSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="mb-4">
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="space-y-3">
      {/* Search bar skeleton */}
      <div className="h-10 bg-gray-100 rounded w-full animate-pulse"></div>
      
      {/* Table rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Main dashboard skeleton
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Charts section skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Tables section skeleton */}
      <div className="space-y-6">
        <TableSkeleton />
        <TableSkeleton />
      </div>
    </div>
  )
}

export { CardSkeleton, ChartSkeleton, TableSkeleton }
