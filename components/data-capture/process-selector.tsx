"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FlaskConical,
  CheckCircle,
  Loader2
} from "lucide-react"
import { processApi } from "@/lib/api/process"

interface Process {
  id: string
  name: string
  description?: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
}

interface ProcessSelectorProps {
  onProcessSelect?: (processId: string) => void
}

export function ProcessSelector({ onProcessSelect }: ProcessSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const selectedProcessId = searchParams.get('process')

  useEffect(() => {
    const loadProcesses = async () => {
      try {
        setLoading(true)
        const response = await processApi.getProcesses()
        const processList = response.data || []
        
        // Transform API data to our format
        const transformedProcesses = processList.map((process: any) => ({
          id: process.id,
          name: process.name || `Process #${String(process.id).slice(0, 8)}`,
          description: process.description || 'Production process',
          icon: FlaskConical,
          color: "bg-blue-500",
          bgColor: "bg-blue-50"
        }))
        
        setProcesses(transformedProcesses)
      } catch (error) {
        console.error('Failed to load processes:', error)
        // Fallback to default process
        setProcesses([{
          id: "steri-milk",
          name: "Steri Milk Process",
          description: "Complete sterilization process for milk products",
          icon: FlaskConical,
          color: "bg-blue-500",
          bgColor: "bg-blue-50"
        }])
      } finally {
        setLoading(false)
      }
    }

    loadProcesses()
  }, [])

  const handleProcessSelect = (processId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('process', processId)
    router.push(`/data-capture?${params.toString()}`)
    onProcessSelect?.(processId)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-light">Select Process</h2>
              <p className="text-sm text-gray-500 font-light">Loading available processes...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Process Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-light">Select Process</h2>
            <p className="text-sm text-gray-500 font-light">Choose a production process to view its kanban board</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processes.map((process) => (
            <Card 
              key={process.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedProcessId === process.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:border-blue-300'
              }`}
              onClick={() => handleProcessSelect(process.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${process.color} flex items-center justify-center`}>
                    <process.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-light">{process.name}</CardTitle>
                    <p className="text-xs text-gray-500 font-light">{process.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800 font-light">
                    Available
                  </Badge>
                  {selectedProcessId === process.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
