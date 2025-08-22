"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Settings, Calendar, MapPin, Wrench, Activity, AlertTriangle } from "lucide-react"

interface MachineViewDrawerProps {
  open: boolean
  onClose: () => void
  machine: any
  onEdit?: () => void
}

export function MachineViewDrawer({ open, onClose, machine, onEdit }: MachineViewDrawerProps) {
  if (!machine) return null

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "default"
      case "maintenance":
        return "secondary"
      case "offline":
        return "destructive"
      default:
        return "outline"
    }
  }

  const isMaintenanceDue = (nextMaintenanceDate: string) => {
    if (!nextMaintenanceDate) return false
    const nextDate = new Date(nextMaintenanceDate)
    const today = new Date()
    const daysUntilMaintenance = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilMaintenance <= 7 && daysUntilMaintenance >= 0
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <SheetTitle className="flex items-center space-x-2">
                  <span>{machine.name}</span>
                  <Badge variant={getStatusVariant(machine.status)}>{machine.status}</Badge>
                </SheetTitle>
                <p className="text-sm text-gray-500 mt-1">Serial: {machine.serialNumber}</p>
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Machine
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Machine Name</label>
                  <p className="text-sm font-semibold">{machine.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm font-semibold">{machine.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Serial Number</label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{machine.serialNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm font-semibold flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {machine.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manufacturer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manufacturer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                  <p className="text-sm font-semibold">{machine.manufacturer || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Model</label>
                  <p className="text-sm font-semibold">{machine.model || "N/A"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Installation Date</label>
                <p className="text-sm font-semibold flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {machine.installationDate ? new Date(machine.installationDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Efficiency</label>
                  <p className="text-2xl font-bold text-green-600">{machine.efficiency || "95"}%</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Uptime</label>
                  <p className="text-2xl font-bold text-blue-600">{machine.uptime || "98.5"}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Wrench className="w-5 h-5 mr-2" />
                Maintenance Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Maintenance</label>
                  <p className="text-sm font-semibold flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {machine.lastMaintenanceDate ? new Date(machine.lastMaintenanceDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Maintenance</label>
                  <p className="text-sm font-semibold flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {machine.nextMaintenanceDate ? new Date(machine.nextMaintenanceDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
              {isMaintenanceDue(machine.nextMaintenanceDate) && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800 font-medium">Maintenance due soon!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          {machine.specifications && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {typeof machine.specifications === 'string' ? (
                    <p className="text-sm whitespace-pre-wrap">{machine.specifications}</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(machine.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm font-semibold">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {machine.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{machine.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
