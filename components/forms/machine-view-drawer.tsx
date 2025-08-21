"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MachineViewDrawerProps {
  open: boolean
  onClose: () => void
  machine: any
}

export function MachineViewDrawer({ open, onClose, machine }: MachineViewDrawerProps) {
  if (!machine) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[500px] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Machine Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Machine Name</label>
                  <p className="text-sm font-semibold">{machine.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                  <p className="text-sm font-mono">{machine.serialNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={machine.status === "running" ? "default" : "secondary"}>{machine.status}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-sm">{machine.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="text-sm">{machine.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Efficiency</label>
                  <p className="text-sm font-semibold">{machine.efficiency || "95"}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uptime</label>
                  <p className="text-sm font-semibold">{machine.uptime || "98.5"}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Maintenance</label>
                  <p className="text-sm">{machine.lastMaintenance || "2024-01-15"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Next Maintenance</label>
                  <p className="text-sm">{machine.nextMaintenance || "2024-02-15"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
