"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Database, Settings, Calendar, MapPin, Gauge, Activity, FileText, Wrench } from "lucide-react"
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
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
      case "offline":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const fillPercentage = silo.capacity > 0 ? (silo.milk_volume / silo.capacity) * 100 : 0

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 bg-white">
        <SheetHeader>
          <SheetTitle className="text-lg font-light">Silo Details</SheetTitle>
          <SheetDescription className="text-sm font-light">View silo information and capacity stats</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-base font-light">{silo.name}</div>
                  <Badge className={getStatusVariant(silo.status)}>{silo.status}</Badge>
                </div>
                {onEdit && (
                  <Button onClick={onEdit} variant="outline" size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"> 
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><FileText className="h-3 w-3" />Serial</div>
                <div className="text-sm font-light">{silo.serial_number}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Wrench className="h-3 w-3" />Category</div>
                <div className="text-sm font-light">{silo.category}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" />Location</div>
                <div className="text-sm font-light">{silo.location}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />Created</div>
                <div className="text-sm font-light">{new Date(silo.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Capacity & Volume Information */}
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 pb-0">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-blue-600" />
                <div className="text-base font-light">Capacity & Volume</div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-500">Total Capacity</div>
                  <div className="text-2xl font-light text-blue-600">{silo.capacity.toLocaleString()}L</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-500">Current Volume</div>
                  <div className="text-2xl font-light text-blue-600">{silo?.milk_volume?.toLocaleString()}L</div>
                </div>
              </div>
              
              {/* Fill Percentage Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">Fill Percentage</div>
                  <span className={`text-sm font-light ${
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
                <div className="text-xs text-gray-500">Available Space</div>
                <div className="text-lg font-light text-gray-700">
                  {(silo.capacity - silo.milk_volume).toLocaleString()}L
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}