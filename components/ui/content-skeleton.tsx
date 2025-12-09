"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ContentSkeletonProps {
  sections?: number
  cardsPerSection?: number
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({ sections = 1, cardsPerSection = 4 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4]">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
          </div>
          <div className="p-6">
            <div className={`grid grid-cols-1 md:grid-cols-${cardsPerSection} gap-6`}>
              {Array.from({ length: cardsPerSection }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContentSkeleton


