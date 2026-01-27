import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function MaterialsLoading() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>

        {/* Counter widgets skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters skeleton */}
        <Card>
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
          </CardContent>
        </Card>

        {/* Table skeleton */}
        <Card>
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
