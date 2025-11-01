import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useAppSelector } from "@/lib/store"
import { siloApi } from "@/lib/api/silo"
import { usersApi } from "@/lib/api/users"
import { FormIdCopy } from "@/components/ui/form-id-copy"

export function GeneralLabTestViewDrawer({ open, onClose, test, onEdit }: { open: boolean, onClose: () => void, test: any, onEdit?: () => void }) {
  const [silos, setSilos] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  useEffect(() => {
    const load = async () => {
      const silosRes = await siloApi.getSilos()
      setSilos(silosRes.data || [])
      const usersRes = await usersApi.getUsers()
      setUsers(usersRes.data || [])
    }
    if (open) load()
  }, [open])

  if (!test) return null
  const silo = silos.find((s: any) => s.id === test.source_silo)
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
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <h3 className="text-lg font-light text-gray-900 mb-4">Test Overview</h3>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-800 font-light">{silo?.name || test.source_silo}</Badge>
              <Badge className="bg-green-100 text-green-800 font-light">{analyst ? `${analyst.first_name} ${analyst.last_name}` : test.analyst}</Badge>
              <Badge className="bg-gray-100 text-gray-800 font-light">{test.time}</Badge>
            </div>
          </div>

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
