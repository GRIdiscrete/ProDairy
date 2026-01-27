"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface KanbanSkeletonProps {
  columns?: number
  cardsPerColumn?: number
  className?: string
}

export function KanbanSkeleton({ 
  columns = 4, 
  cardsPerColumn = 3, 
  className 
}: KanbanSkeletonProps) {
  return (
    <div className={`flex space-x-4 overflow-x-auto pb-4 h-full ${className}`}>
      {Array.from({ length: columns }).map((_, columnIndex) => (
        <div key={columnIndex} className="flex-shrink-0 w-80">
          <div className="h-full border border-gray-200 rounded-lg">
            <CardHeader className="pb-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-3">
                {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
                  <Card key={cardIndex} className="p-3 border rounded-lg">
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-4 rounded-full" />
                      </div>

                      {/* Card Description */}
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />

                      {/* Status and Priority Badges */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </div>

                      {/* Card Metadata */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-4 h-4 rounded-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-4 h-4 rounded-full" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </div>
        </div>
      ))}
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className 
}: TableSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center space-x-4 p-4 border rounded-lg">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

interface CardSkeletonProps {
  className?: string
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

interface DashboardSkeletonProps {
  className?: string
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
