import { cn } from "@/lib/utils"

interface PulseLoadingProps {
  className?: string
  rows?: number
  columns?: number
  showHeader?: boolean
  variant?: "table" | "card" | "list"
}

export function PulseLoading({ 
  className, 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  variant = "table" 
}: PulseLoadingProps) {
  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  // Default table variant
  return (
    <div className={cn("w-full", className)}>
      {showHeader && (
        <div className="animate-pulse mb-4">
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="animate-pulse flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Specialized loading components
export function TablePulseLoading({ rows = 8, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      {/* Header row */}
      <div className="animate-pulse mb-4">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      
      {/* Data rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4 py-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-20 h-6 bg-gray-200 rounded"></div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
            <div className="w-16 h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MetricsPulseLoading({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  )
}

export function ProfilePulseLoading({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header section */}
      <div className="animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
      
      {/* Activity section */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
