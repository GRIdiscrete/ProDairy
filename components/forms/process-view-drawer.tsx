"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProcessViewDrawerProps {
  open: boolean
  onClose: () => void
  process: any
}

export function ProcessViewDrawer({ open, onClose, process }: ProcessViewDrawerProps) {
  if (!process) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "default"
      case "paused":
        return "secondary"
      case "completed":
        return "outline"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[600px] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Process Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Process ID</label>
                  <p className="text-sm font-mono">{process.batchId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusColor(process.status)}>{process.status}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product Type</label>
                  <p className="text-sm">{process.productType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Progress</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${process.progress}%` }} />
                    </div>
                    <span className="text-sm">{process.progress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Time</label>
                <p className="text-sm">{new Date(process.startTime).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Expected End Time</label>
                <p className="text-sm">{new Date(process.expectedEndTime).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="text-sm">
                  {Math.round(
                    (new Date(process.expectedEndTime).getTime() - new Date(process.startTime).getTime()) /
                      (1000 * 60 * 60),
                  )}{" "}
                  hours
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Production Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Target Quantity</label>
                  <p className="text-sm">{process.targetQuantity || "N/A"} kg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Quantity</label>
                  <p className="text-sm">{process.currentQuantity || "N/A"} kg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quality Score</label>
                  <p className="text-sm">{process.qualityScore || "N/A"}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Efficiency</label>
                  <p className="text-sm">{process.efficiency || "N/A"}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
