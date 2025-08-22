"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Database, MapPin, Calendar, Edit, AlertTriangle, Droplets } from "lucide-react"

interface SiloViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  silo: any
  onEdit?: () => void
}

// Animated Silo Component
function AnimatedSilo({ capacity, currentVolume, status }: { capacity: number; currentVolume: number; status: string }) {
  const fillPercentage = (currentVolume / capacity) * 100
  const liquidHeight = Math.max(fillPercentage, 5) // Minimum 5% for visibility
  
  const getLiquidColor = () => {
    if (status === "Maintenance") return "#ef4444" // red
    if (fillPercentage > 80) return "#3b82f6" // blue
    if (fillPercentage > 50) return "#06b6d4" // cyan
    return "#0ea5e9" // sky blue
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {/* Silo Container */}
        <div className="relative w-32 h-48 bg-gray-200 rounded-t-lg border-4 border-gray-400 overflow-hidden">
          {/* Animated Liquid */}
          <div 
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out rounded-t-lg"
            style={{
              height: `${liquidHeight}%`,
              backgroundColor: getLiquidColor(),
              opacity: 0.7,
              animation: currentVolume > 0 ? 'liquid-wave 3s ease-in-out infinite' : 'none'
            }}
          >
            {/* Wave effect */}
            <div 
              className="absolute top-0 left-0 right-0 h-2"
              style={{
                background: `linear-gradient(90deg, transparent, ${getLiquidColor()}, transparent)`,
                animation: currentVolume > 0 ? 'wave-motion 2s linear infinite' : 'none'
              }}
            />
          </div>
          
          {/* Volume indicators */}
          <div className="absolute right-1 top-2 bottom-2 w-1 bg-gray-300 rounded">
            <div className="absolute right-2 top-0 text-xs text-gray-500 whitespace-nowrap">
              {capacity.toFixed(0)}L
            </div>
            <div className="absolute right-2 top-1/2 text-xs text-gray-500 whitespace-nowrap">
              {(capacity / 2).toFixed(0)}L
            </div>
            <div className="absolute right-2 bottom-0 text-xs text-gray-500 whitespace-nowrap">
              0L
            </div>
          </div>
        </div>
        
        {/* Silo Base */}
        <div className="w-36 h-6 bg-gray-400 rounded-b-lg -mt-1 border-4 border-gray-400 border-t-0" />
        
        {/* Pipes */}
        <div className="absolute -right-4 top-8 w-8 h-4 bg-gray-400 rounded-r-lg" />
        <div className="absolute -left-4 bottom-16 w-8 h-4 bg-gray-400 rounded-l-lg" />
      </div>
      
      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <div 
          className={`w-3 h-3 rounded-full ${
            status === "Active" ? "bg-green-500 animate-pulse" : 
            status === "Maintenance" ? "bg-red-500 animate-pulse" : 
            "bg-gray-400"
          }`} 
        />
        <span className="text-sm font-medium">{status}</span>
      </div>
      
      {/* Volume Display */}
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {currentVolume.toFixed(1)}L
        </div>
        <div className="text-sm text-muted-foreground">
          {fillPercentage.toFixed(1)}% Full
        </div>
      </div>
      
      <style jsx>{`
        @keyframes liquid-wave {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes wave-motion {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

export function SiloViewDrawer({ open, onOpenChange, silo, onEdit }: SiloViewDrawerProps) {
  if (!silo) return null

  const fillPercentage = (silo.milk_volume / silo.capacity) * 100
  const isLowVolume = fillPercentage < 20
  const isHighVolume = fillPercentage > 90

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Maintenance": return "bg-red-100 text-red-800"
      case "Inactive": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Pasteurizing Silos": return "bg-orange-100 text-orange-800"
      case "Storage Silos": return "bg-blue-100 text-blue-800"
      case "Cooling Silos": return "bg-cyan-100 text-cyan-800"
      case "Processing Silos": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-[50vw] !max-w-[50vw] overflow-y-auto" style={{ width: '50vw', maxWidth: '50vw' }}>
        <div className="p-6">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <span>{silo.name}</span>
                </SheetTitle>
                <SheetDescription>Detailed silo information and status</SheetDescription>
              </div>
              {onEdit && (
                <Button onClick={onEdit} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Alerts */}
            {(isLowVolume || isHighVolume || silo.status === "Maintenance") && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-orange-800">Attention Required</p>
                      <div className="text-sm text-orange-700 space-y-1">
                        {silo.status === "Maintenance" && <p>• Silo is currently under maintenance</p>}
                        {isLowVolume && <p>• Low volume alert: {fillPercentage.toFixed(1)}% capacity</p>}
                        {isHighVolume && <p>• High volume alert: {fillPercentage.toFixed(1)}% capacity</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Silo Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <span>Silo Visualization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <AnimatedSilo 
                    capacity={silo.capacity}
                    currentVolume={silo.milk_volume}
                    status={silo.status}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Silo Name</p>
                    <p className="text-lg font-semibold">{silo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{silo.serial_no}</code>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(silo.status)}>{silo.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <Badge className={getCategoryColor(silo.category)}>{silo.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Capacity */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Capacity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>{silo.location}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Volume:</span>
                    <span className="font-medium">{silo.milk_volume.toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Capacity:</span>
                    <span className="font-medium">{silo.capacity.toFixed(1)}L</span>
                  </div>
                  <Progress value={fillPercentage} className="h-3" />
                  <div className="text-center text-sm text-muted-foreground">
                    {fillPercentage.toFixed(1)}% Full
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span>{new Date(silo.created_at).toLocaleDateString()}</span>
                </div>
                
                {silo.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                    <p className="text-sm bg-muted p-3 rounded">{silo.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
