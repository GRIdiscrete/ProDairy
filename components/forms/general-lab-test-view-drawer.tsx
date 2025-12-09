import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useAppSelector } from "@/lib/store"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { Package, MapPin, Layers, Droplet } from "lucide-react"

export function GeneralLabTestViewDrawer({ open, onClose, test, onEdit }: { open: boolean, onClose: () => void, test: any, onEdit?: () => void }) {
  const { items: users } = useAppSelector((state) => state.users)

  if (!test) return null
  
  const silo = test.source_silo
  const analyst = users.find((u: any) => u.id === test.analyst)

  const renderValue = (value: any) => {
    if (value === undefined || value === null) return "-"
    if (typeof value === "boolean") return value ? "Yes" : "No"
    return value.toString()
  }

  const renderParameter = (label: string, value: any, unit?: string) => (
    <div className="flex justify-between items-center py-1 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{renderValue(value)} {unit}</span>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-light">
            General Lab Test Details
          </SheetTitle>
          <SheetDescription className="text-sm font-light flex items-center gap-2">
            <span>Complete information about the general lab test record</span>
            <FormIdCopy 
              displayId={test.id?.slice(0, 8)}
              actualId={test.id || ''}
              size="md"
            />
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          {/* Test Overview */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Test Overview</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge className="bg-blue-100 text-blue-800 font-light">{silo?.name || 'N/A'}</Badge>
              {analyst ? (
                <UserAvatar user={analyst} size="sm" showName={true} showEmail={false} showDropdown={false} />
              ) : (
                <Badge className="bg-green-100 text-green-800 font-light">{test.analyst}</Badge>
              )}
              <Badge className="bg-gray-100 text-gray-800 font-light">{test.time}</Badge>
              {test.tag && <Badge className="bg-blue-100 text-blue-800 font-light">{test.tag}</Badge>}
            </div>
          </div>

          {/* Silo Information */}
          {silo && (
            <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-light">Silo Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Silo Name</span>
                    <span className="text-sm font-medium">{silo.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Category</span>
                    <Badge className="bg-blue-100 text-blue-800">{silo.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Location</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-sm font-medium">{silo.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Serial Number</span>
                    <span className="text-sm font-medium">{silo.serial_number}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Capacity</span>
                    <span className="text-sm font-medium">{silo.capacity.toLocaleString()} L</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Milk Volume</span>
                    <div className="flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-blue-500" />
                      <span className="text-sm font-medium">{silo.milk_volume ? `${silo.milk_volume.toLocaleString()} L` : 'N/A'}</span>
                    </div>
                  </div>
                  {silo.status && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge className={silo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {silo.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Parameters */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg text-gray-900 mb-4">Basic Parameters</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {renderParameter("Temperature", test.temperature, "°C")}
                {renderParameter("Fat", test.fat, "%")}
                {renderParameter("Protein", test.protein, "%")}
                {renderParameter("SNF", test.snf, "%")}
                {renderParameter("Total Solids", test.ts, "%")}
                {renderParameter("Density", test.density, "g/ml")}
              </div>
            </div>

            {/* Chemical Analysis */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg text-gray-900 mb-4">Chemical Analysis</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {renderParameter("pH", test.ph)}
                {renderParameter("Acidity", test.ta)}
                {renderParameter("Alcohol Test", test.alcohol)}
                {renderParameter("Antibiotics", test.antibiotics)}
                {renderParameter("Phosphate", test.phosphate)}
                {renderParameter("Hydrogen Peroxide", test.hydrogen_peroxide)}
              </div>
            </div>

            {/* Physical Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg text-gray-900 mb-4">Physical Properties</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {renderParameter("Viscosity", test.viscosity)}
                {renderParameter("Turbidity", test.turbidity)}
                {renderParameter("Brix", test.brix)}
                {renderParameter("Moisture", test.moisture, "%")}
                {renderParameter("Appearance", test.appearance_body)}
                {renderParameter("Color", test.color)}
              </div>
            </div>

            {/* Microbiological Tests */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg text-gray-900 mb-4">Microbiological Tests</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {renderParameter("TBC", test.tbc)}
                {renderParameter("Coliforms", test.coliforms)}
                {renderParameter("E. coli", test.e_coli)}
                {renderParameter("S. aureus", test.s_aureus)}
                {renderParameter("Salmonella", test.salmonella)}
                {renderParameter("Psychrotrophs", test.psychrotrophs)}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
