"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Users, Phone, Mail, MapPin, Package, TrendingUp, Calendar } from "lucide-react"
import { Supplier } from "@/lib/types"

interface SupplierViewDrawerProps {
  open: boolean
  onClose: () => void
  supplier: Supplier | null
  onEdit?: () => void
}

export function SupplierViewDrawer({ open, onClose, supplier, onEdit }: SupplierViewDrawerProps) {
  if (!supplier) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const volSupplied = supplier.volume_supplied || 0
  const volRejected = supplier.volume_rejected || 0
  const rejectionRate = volSupplied > 0 ? (volRejected / volSupplied) * 100 : 0
  const acceptanceRate = 100 - rejectionRate

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <SheetTitle className="flex items-center space-x-2">
                  <span>{supplier.first_name} {supplier.last_name}</span>
                </SheetTitle>
                {supplier.company_name && (
                  <p className="text-sm font-medium text-blue-600">{supplier.company_name}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Supplier Profile</p>
              </div>
            </div>
            {onEdit && (
              <Button size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Supplier
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <p className="text-sm font-semibold">{supplier.first_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-sm font-semibold">{supplier.last_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm font-semibold flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {supplier.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-sm font-semibold flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {supplier.phone_number}
                  </p>
                </div>
              </div>
              {supplier.company_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  <p className="text-sm font-semibold">{supplier.company_name}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Physical Address</label>
                <p className="text-sm font-semibold flex items-start">
                  <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                  {supplier.physical_address}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Supply Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Supply Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Raw Product</label>
                  <p className="text-sm font-semibold capitalize">{supplier.raw_product}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Number of Tanks</label>
                  <p className="text-sm font-semibold">{supplier.number_of_tanks || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Acceptance Rate</label>
                  <div className="flex items-center space-x-2">
                    <Badge className={acceptanceRate > 90 ? "text-green-600" : acceptanceRate > 75 ? "text-yellow-600" : "text-red-600"}>
                      {acceptanceRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Volume Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Volume Supplied</label>
                  <p className="text-2xl font-bold text-green-600">{volSupplied.toLocaleString()}L</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Volume Rejected</label>
                  <p className="text-2xl font-bold text-red-600">{volRejected.toLocaleString()}L</p>
                </div>
              </div>

              {/* Rejection Rate Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-500">Rejection Rate</label>
                  <span className={`text-sm font-semibold ${rejectionRate > 10 ? 'text-red-600' :
                    rejectionRate > 5 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                    {rejectionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${rejectionRate > 10 ? 'bg-red-500' :
                      rejectionRate > 5 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                    style={{ width: `${Math.min(rejectionRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Net Accepted Volume */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-500">Net Accepted Volume</label>
                <p className="text-lg font-semibold text-gray-700">
                  {(volSupplied - volRejected).toLocaleString()}L
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tanks Information */}
          {supplier.suppliers_tanks && supplier.suppliers_tanks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Supplier Tanks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {supplier.suppliers_tanks.map((tank) => (
                    <div key={tank.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{tank.name}</p>
                          <p className="text-xs text-gray-500">Code: {tank.code}</p>
                        </div>
                        <Badge variant="outline">
                          {tank.capacity ? `${tank.capacity.toLocaleString()}L` : 'N/A'} Capacity
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Quantity: </span>
                          <span className="font-medium text-blue-600">
                            {tank.quantity !== null && tank.quantity !== undefined ? `${tank.quantity.toLocaleString()}L` : '0L'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400">
                            Updated: {tank.updated_at ? new Date(tank.updated_at).toLocaleDateString() : (tank.created_at ? new Date(tank.created_at).toLocaleDateString() : 'N/A')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-500">Quality Score</p>
                  <p className={`text-lg font-bold ${acceptanceRate > 90 ? 'text-green-600' : acceptanceRate > 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {acceptanceRate > 90 ? 'Excellent' : acceptanceRate > 75 ? 'Good' : 'Poor'}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-500">Reliability</p>
                  <p className="text-lg font-bold text-blue-600">
                    {rejectionRate < 5 ? 'High' : rejectionRate < 10 ? 'Medium' : 'Low'}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={acceptanceRate > 75 ? "default" : "destructive"}>
                    {acceptanceRate > 75 ? "Active" : "Review"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created At
                  </label>
                  <p className="text-sm">{formatDate(supplier.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Updated At
                  </label>
                  <p className="text-sm">{formatDate(supplier.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}