"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { ProcessSelector } from "@/components/data-capture/process-selector"
import { ProcessKanban } from "@/components/data-capture/process-kanban"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardSkeleton } from "@/components/ui/kanban-skeleton"
import { 
  ClipboardList, 
  User, 
  FlaskConical, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  TrendingUp,
  Plus,
  Kanban,
  Settings
} from "lucide-react"

function DataCaptureDashboardContent() {
  const searchParams = useSearchParams()
  const [selectedProcess, setSelectedProcess] = useState<string>('steri-milk')
  const [showKanban, setShowKanban] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Get process from URL params
  useEffect(() => {
    const processParam = searchParams.get('process')
    if (processParam) {
      setSelectedProcess(processParam)
      setShowKanban(true)
    }
  }, [searchParams])

  const handleProcessSelect = (processId: string) => {
    console.log('Process selected:', processId)
    setIsLoading(true)
    setSelectedProcess(processId)
    setShowKanban(true)
    
    // Simulate loading time for skeleton effect
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <DataCaptureDashboardLayout title="Data Capture Dashboard" subtitle="Production process management and monitoring">
      <div className="space-y-6">
        {/* Process Selection */}
        <ProcessSelector onProcessSelect={handleProcessSelect} />

        {/* Kanban Board */}
        {showKanban && selectedProcess && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-light">Process Kanban Board</h2>
                <p className="text-sm text-gray-500 font-light">Click on stage headers to navigate to forms</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800 font-light">
                  <Kanban className="h-3 w-3 mr-1" />
                  Kanban View
                </Badge>
                {/* <Button
                  
                  size="sm"
                  onClick={() => setShowKanban(false)}
                  className="font-light"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button> */}
              </div>
            </div>

            <div className="h-full max-h-[calc(100vh-16rem)]">
              {isLoading ? (
                <DashboardSkeleton />
              ) : (
                <ProcessKanban processId={selectedProcess} />
              )}
            </div>
          </div>
        )}

        {/* Welcome Message when no process selected */}
        {!showKanban && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <FlaskConical className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-light text-gray-900 mb-2">Select a Process</h3>
            <p className="text-sm text-gray-500 font-light mb-6">
              Choose a production process above to view its kanban board and track forms across all stages.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>Real-time form tracking</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4" />
                <span>Process monitoring</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Performance analytics</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DataCaptureDashboardLayout>
  )
}

export default function DataCaptureDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DataCaptureDashboardContent />
    </Suspense>
  )
}
