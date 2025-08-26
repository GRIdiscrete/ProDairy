"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Package, BookOpen, Calendar, Clock, Info } from "lucide-react"
import { RawMaterial } from "@/lib/types"

interface RawMaterialViewDrawerProps {
  open: boolean
  onClose: () => void
  rawMaterial: RawMaterial | null
  onEdit?: () => void
}

export function RawMaterialViewDrawer({ open, onClose, rawMaterial, onEdit }: RawMaterialViewDrawerProps) {
  if (!rawMaterial) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeSinceCreation = () => {
    const createdDate = new Date(rawMaterial.created_at)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24))
    
    if (diffInDays === 0) return "Added today"
    if (diffInDays === 1) return "Added yesterday"
    if (diffInDays < 7) return `Added ${diffInDays} days ago`
    if (diffInDays < 30) return `Added ${Math.floor(diffInDays / 7)} weeks ago`
    return `Added ${Math.floor(diffInDays / 30)} months ago`
  }

  const getTimeSinceUpdate = () => {
    const updatedDate = new Date(rawMaterial.updated_at)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24))
    
    if (diffInDays === 0) return "Updated today"
    if (diffInDays === 1) return "Updated yesterday"
    if (diffInDays < 7) return `Updated ${diffInDays} days ago`
    if (diffInDays < 30) return `Updated ${Math.floor(diffInDays / 7)} weeks ago`
    return `Updated ${Math.floor(diffInDays / 30)} months ago`
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <SheetTitle className="flex items-center space-x-2">
                  <span>{rawMaterial.name}</span>
                  <Badge variant="outline" className="text-xs">Raw Material</Badge>
                </SheetTitle>
                <p className="text-sm text-gray-500 mt-1">Material Details</p>
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Material
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Material Name</label>
                <p className="text-lg font-semibold">{rawMaterial.name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Description & Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {rawMaterial.description ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {rawMaterial.description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No description provided</p>
                  )}
                </div>
              </div>

              {/* Description Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <p className="text-sm text-gray-500">Description Length</p>
                  <p className="text-lg font-bold text-blue-600">
                    {rawMaterial.description ? rawMaterial.description.length : 0} chars
                  </p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <p className="text-sm text-gray-500">Word Count</p>
                  <p className="text-lg font-bold text-green-600">
                    {rawMaterial.description ? rawMaterial.description.split(/\s+/).filter(word => word.length > 0).length : 0} words
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Status & Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                    <span className="text-xs text-gray-500">Available for use</span>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm font-semibold mt-1 capitalize">
                    {rawMaterial.name.toLowerCase().includes('milk') ? 'Dairy Product' :
                     rawMaterial.name.toLowerCase().includes('cream') ? 'Dairy Product' :
                     rawMaterial.name.toLowerCase().includes('powder') ? 'Powder' :
                     'Raw Material'}
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-500">Usage Recommendations</label>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Store in appropriate temperature conditions</li>
                  <li>• Check expiration dates before use</li>
                  <li>• Follow quality control procedures</li>
                  <li>• Maintain proper handling protocols</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Timeline & History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created At
                  </label>
                  <p className="text-sm font-semibold">{formatDate(rawMaterial.created_at)}</p>
                  <p className="text-xs text-gray-500">{getTimeSinceCreation()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Last Updated
                  </label>
                  <p className="text-sm font-semibold">{formatDate(rawMaterial.updated_at)}</p>
                  <p className="text-xs text-gray-500">{getTimeSinceUpdate()}</p>
                </div>
              </div>
              
              {/* Activity Summary */}
              <div className="p-3 border rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Summary</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Material entry created</span>
                    <span className="text-gray-700">{new Date(rawMaterial.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Last modification</span>
                    <span className="text-gray-700">{new Date(rawMaterial.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
