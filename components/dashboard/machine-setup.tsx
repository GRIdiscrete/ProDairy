"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Eye, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock machine data based on the images
const machineData = {
  "Floor 01": [
    { id: "M/C 01", status: "running", type: "Su", count: 140 },
    { id: "M/C 02", status: "running", type: "Rib", count: 220 },
    { id: "M/C 03", status: "running", type: "Lock", count: 180 },
    { id: "M/C 04", status: "running", type: "Pique", count: 240 },
    { id: "M/C 05", status: "idle", type: "", count: 0 },
    { id: "M/C 06", status: "running", type: "Su", count: 140 },
    { id: "M/C 07", status: "running", type: "Rib", count: 220 },
    { id: "M/C 08", status: "maintenance", type: "", count: 0 },
    { id: "M/C 09", status: "running", type: "Lock", count: 180 },
    { id: "M/C 10", status: "running", type: "Pique", count: 240 },
    { id: "M/C 11", status: "running", type: "Su", count: 140 },
    { id: "M/C 12", status: "running", type: "Rib", count: 220 },
    { id: "M/C 13", status: "running", type: "Lock", count: 180 },
    { id: "M/C 14", status: "running", type: "Lock", count: 180 },
    { id: "M/C 15", status: "running", type: "Pique", count: 240 },
  ],
}

const statusColors = {
  running: "bg-green-500",
  idle: "bg-yellow-500",
  maintenance: "bg-red-500",
  fault: "bg-red-600",
}

export function MachineSetup() {
  return (
    <Card className="col-span-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Machine Setup</CardTitle>
        <Select defaultValue="warehouse-01">
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="warehouse-01">Warehouse 01</SelectItem>
            <SelectItem value="warehouse-02">Warehouse 02</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Floor Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">Floor 01</span>
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="running" className="rounded" />
                <label htmlFor="running" className="text-sm">
                  Running
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="off" className="rounded" />
                <label htmlFor="off" className="text-sm">
                  Off
                </label>
              </div>
            </div>
          </div>

          {/* Machine Grid */}
          <div className="grid grid-cols-5 gap-3">
            {machineData["Floor 01"].map((machine) => (
              <div
                key={machine.id}
                className={cn(
                  "relative rounded-lg border p-3 text-center transition-colors",
                  machine.status === "running" && "border-green-200 bg-green-50",
                  machine.status === "idle" && "border-yellow-200 bg-yellow-50",
                  machine.status === "maintenance" && "border-red-200 bg-red-50",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{machine.id}</span>
                  <div
                    className={cn("h-2 w-2 rounded-full", statusColors[machine.status as keyof typeof statusColors])}
                  />
                </div>
                {machine.status === "running" && (
                  <>
                    <div className="text-xs text-muted-foreground mb-1">
                      {machine.type} ({machine.count})
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <Pause className="h-3 w-3" />
                    </div>
                  </>
                )}
                {machine.status === "maintenance" && <div className="text-xs text-red-600">Maintenance</div>}
                {machine.status === "idle" && <div className="text-xs text-yellow-600">Idle</div>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
