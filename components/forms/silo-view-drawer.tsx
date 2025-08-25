"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Database, Settings, Eye, Calendar, MapPin, Gauge, Activity } from "lucide-react"
import { Silo } from "@/lib/types"

interface SiloViewDrawerProps {
  open: boolean
  onClose: () => void
  silo: Silo | null
  onEdit?: () => void
}

export function SiloViewDrawer({ open, onClose, silo, onEdit }: SiloViewDrawerProps) {
  if (!silo) return null

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "default"
      case "maintenance":
        return "secondary"
      case "offline":
        return "destructive"
      case "inactive":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fillPercentage = silo.capacity > 0 ? (silo.milk_volume / silo.capacity) * 100 : 0

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <SheetTitle className="flex items-center space-x-2">
                  <span>{silo.name}</span>
                  <Badge variant={getStatusVariant(silo.status)}>{silo.status}</Badge>
                </SheetTitle>
                <p className="text-sm text-gray-500 mt-1">Serial: {silo.serial_number}</p>
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Silo
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
                  <label className="text-sm font-medium text-gray-500">Silo Name</label>
                  <p className="text-sm font-semibold">{silo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm font-semibold">{silo.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Serial Number</label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{silo.serial_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm font-semibold flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {silo.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity & Volume Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Gauge className="w-5 h-5 mr-2" />
                Capacity & Volume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Total Capacity</label>
                  <p className="text-2xl font-bold text-blue-600">{silo.capacity.toLocaleString()}L</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Current Volume</label>
                  <p className="text-2xl font-bold text-purple-600">{silo.milk_volume.toLocaleString()}L</p>
                </div>
              </div>
              
              {/* Fill Percentage Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-500">Fill Percentage</label>
                  <span className={`text-sm font-semibold ${
                    fillPercentage > 80 ? 'text-red-600' : 
                    fillPercentage > 60 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {fillPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      fillPercentage > 80 ? 'bg-red-500' : 
                      fillPercentage > 60 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Available Space */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-500">Available Space</label>
                <p className="text-lg font-semibold text-gray-700">
                  {(silo.capacity - silo.milk_volume).toLocaleString()}L
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Status Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={getStatusVariant(silo.status)} className="capitalize">
                      {silo.status}
                    </Badge>
                    {silo.status === "active" && (
                      <span className="text-xs text-green-600">Operational</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm font-semibold mt-1">{silo.category}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created At
                  </label>
                  <p className="text-sm">{formatDate(silo.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Updated At
                  </label>
                  <p className="text-sm">{formatDate(silo.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}