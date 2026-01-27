"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Eye, Pause, Settings, Thermometer } from "lucide-react"
import { cn } from "@/lib/utils"

// Extended machine data with more details
const machineData = {
  "Floor 01": [
    { id: "M/C 01", status: "running", type: "Su", count: 140, temperature: 85, efficiency: 96 },
    { id: "M/C 02", status: "running", type: "Rib", count: 220, temperature: 82, efficiency: 94 },
    { id: "M/C 03", status: "running", type: "Lock", count: 180, temperature: 88, efficiency: 98 },
    { id: "M/C 04", status: "running", type: "Pique", count: 240, temperature: 86, efficiency: 95 },
    { id: "M/C 05", status: "idle", type: "", count: 0, temperature: 25, efficiency: 0 },
    { id: "M/C 06", status: "running", type: "Su", count: 140, temperature: 84, efficiency: 97 },
    { id: "M/C 07", status: "running", type: "Rib", count: 220, temperature: 83, efficiency: 93 },
    { id: "M/C 08", status: "maintenance", type: "", count: 0, temperature: 25, efficiency: 0 },
    { id: "M/C 09", status: "running", type: "Lock", count: 180, temperature: 87, efficiency: 96 },
    { id: "M/C 10", status: "running", type: "Pique", count: 240, temperature: 85, efficiency: 99 },
    { id: "M/C 11", status: "running", type: "Su", count: 140, temperature: 86, efficiency: 95 },
    { id: "M/C 12", status: "running", type: "Rib", count: 220, temperature: 84, efficiency: 92 },
    { id: "M/C 13", status: "running", type: "Lock", count: 180, temperature: 89, efficiency: 97 },
    { id: "M/C 14", status: "running", type: "Lock", count: 180, temperature: 87, efficiency: 94 },
    { id: "M/C 15", status: "running", type: "Pique", count: 240, temperature: 88, efficiency: 98 },
  ],
}

const statusColors = {
  running: "bg-green-500",
  idle: "bg-yellow-500",
  maintenance: "bg-red-500",
  fault: "bg-red-600",
}

const statusBgColors = {
  running: "border-green-200 bg-green-50",
  idle: "border-yellow-200 bg-yellow-50",
  maintenance: "border-red-200 bg-red-50",
  fault: "border-red-200 bg-red-50",
}

export function MachineStatusGrid() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Machine Status Overview</CardTitle>
        <div className="flex items-center space-x-2">
          <Select defaultValue="warehouse-01">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warehouse-01">Warehouse 01</SelectItem>
              <SelectItem value="warehouse-02">Warehouse 02</SelectItem>
            </SelectContent>
          </Select>
          <Button  size="sm">
            Real-time View
          </Button>
        </div>
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
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">
                  Running ({machineData["Floor 01"].filter((m) => m.status === "running").length})
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm">
                  Idle ({machineData["Floor 01"].filter((m) => m.status === "idle").length})
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm">
                  Maintenance ({machineData["Floor 01"].filter((m) => m.status === "maintenance").length})
                </span>
              </div>
            </div>
          </div>

          {/* Machine Grid */}
          <div className="grid grid-cols-5 gap-4">
            {machineData["Floor 01"].map((machine) => (
              <div
                key={machine.id}
                className={cn(
                  "relative rounded-lg border p-4 transition-all hover:shadow-md cursor-pointer",
                  statusBgColors[machine.status as keyof typeof statusBgColors],
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">{machine.id}</span>
                  <div
                    className={cn("h-3 w-3 rounded-full", statusColors[machine.status as keyof typeof statusColors])}
                  />
                </div>

                {machine.status === "running" && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {machine.type} ({machine.count})
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <Thermometer className="h-3 w-3" />
                        <span>{machine.temperature}°C</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {machine.efficiency}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center space-x-2 pt-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Pause className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {machine.status === "maintenance" && (
                  <div className="text-center">
                    <div className="text-xs text-red-600 font-medium">Under Maintenance</div>
                    <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs">
                      View Details
                    </Button>
                  </div>
                )}

                {machine.status === "idle" && (
                  <div className="text-center">
                    <div className="text-xs text-yellow-600 font-medium">Idle</div>
                    <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs">
                      Start Machine
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
