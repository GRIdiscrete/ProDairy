"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu, MapPin, Calendar, Edit, AlertTriangle, Wifi, WifiOff, Activity, Settings } from "lucide-react"

interface DeviceViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: any
  onEdit?: () => void
}

export function DeviceViewDrawer({ open, onOpenChange, device, onEdit }: DeviceViewDrawerProps) {
  if (!device) return null

  const isOnline = device.status === "Online"
  const isOffline = device.status === "Offline"
  const isMaintenance = device.status === "Maintenance"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online": return "bg-green-100 text-green-800"
      case "Offline": return "bg-red-100 text-red-800"
      case "Maintenance": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Temperature Sensor": return "bg-red-100 text-red-800"
      case "Flow Meter": return "bg-blue-100 text-blue-800"
      case "Pressure Gauge": return "bg-purple-100 text-purple-800"
      case "pH Sensor": return "bg-green-100 text-green-800"
      case "Level Sensor": return "bg-cyan-100 text-cyan-800"
      case "Humidity Sensor": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  const parseConfiguration = (config: string) => {
    try {
      return JSON.parse(config || '{}')
    } catch {
      return {}
    }
  }

  const configuration = parseConfiguration(device.configuration)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-[50vw] !max-w-[50vw] tablet-sheet-full overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-purple-500" />
                  <span>{device.name}</span>
                </SheetTitle>
                <SheetDescription>Device details and configuration</SheetDescription>
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
            {(isOffline || isMaintenance) && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-orange-800">Device Alert</p>
                      <div className="text-sm text-orange-700 space-y-1">
                        {isOffline && <p>• Device is currently offline</p>}
                        {isMaintenance && <p>• Device is under maintenance</p>}
                        <p>• Last seen: {formatLastSeen(device.last_seen)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Device Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>Device Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isOnline ? (
                      <Wifi className="h-8 w-8 text-green-500" />
                    ) : (
                      <WifiOff className="h-8 w-8 text-red-500" />
                    )}
                    <div>
                      <p className="text-lg font-semibold">{device.status}</p>
                      <p className="text-sm text-muted-foreground">
                        Last seen: {formatLastSeen(device.last_seen)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(device.status)}>{device.status}</Badge>
                </div>
                
                {isOnline && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">98.5%</p>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">24ms</p>
                      <p className="text-sm text-muted-foreground">Latency</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">-45dBm</p>
                      <p className="text-sm text-muted-foreground">Signal</p>
                    </div>
                  </div>
                )}
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
                    <p className="text-sm font-medium text-muted-foreground">Device Name</p>
                    <p className="text-lg font-semibold">{device.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Device ID</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{device.device_id}</code>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Device Type</p>
                    <Badge className={getTypeColor(device.type)}>{device.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{device.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration */}
            {device.configuration && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <span>Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(configuration).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(configuration).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No configuration data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Data transmission successful</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Configuration updated</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Device registered</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(device.last_seen).toLocaleDateString()}
                      </p>
                    </div>
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
                  <span className="font-medium">Last Seen:</span>
                  <span>{new Date(device.last_seen).toLocaleString()}</span>
                </div>
                
                {device.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                    <p className="text-sm bg-muted p-3 rounded">{device.description}</p>
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
