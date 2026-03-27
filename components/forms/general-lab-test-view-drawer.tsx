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
          {/* Display all test fields in groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Physical/Chemical</h4>
              <div className="space-y-1 text-sm">
                <div>Temperature: {test.temperature}</div>
                <div>Fat: {test.fat}</div>
                <div>Protein: {test.protein}</div>
                <div>Lactometer: {test.lactometer_reading}</div>
                <div>SNF: {test.snf}</div>
                <div>TS: {test.ts}</div>
                <div>pH: {test.ph}</div>
                <div>Alcohol: {test.alcohol}</div>
                <div>TA: {test.ta}</div>
                <div>OT: {test.ot}</div>
                <div>Density: {test.density}</div>
                <div>Antibiotics: {test.antibiotics}</div>
                <div>SCC: {test.scc}</div>
                <div>Resazurin: {test.resazurin}</div>
                <div>Sedimentation Index: {test.sedimentation_index}</div>
                <div>Creaming Index: {test.creaming_index}</div>
                <div>Phosphate: {test.phosphate}</div>
                <div>Clot on Boil: {test.clot_on_boil}</div>
                <div>Coffee: {test.coffee}</div>
                <div>Hydrogen Peroxide: {test.hydrogen_peroxide}</div>
                <div>Turbidity: {test.turbidity}</div>
                <div>Brix: {test.brix}</div>
                <div>Viscosity: {test.viscosity}</div>
                <div>Moisture: {test.moisture}</div>
                <div>Salt: {test.salt}</div>
                <div>Curd: {test.curd}</div>
                <div>Appearance/Body: {test.appearance_body}</div>
                <div>Consistency: {test.consistency}</div>
                <div>Color: {test.color}</div>
                <div>Taste: {test.taste}</div>
                <div>Retention Sample: {test.retention_sample_taken ? "Yes" : "No"}</div>
                <div>Percent Raw Milk: {test.percent_raw_milk}</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Microbiological & Other</h4>
              <div className="space-y-1 text-sm">
                <div>Coliforms: {test.coliforms}</div>
                <div>TBC: {test.tbc}</div>
                <div>Y/M: {test.y_m}</div>
                <div>E. coli: {test.e_coli}</div>
                <div>S. aureus: {test.s_aureus}</div>
                <div>Salmonella: {test.salmonella}</div>
                <div>TS Duplicate: {test.ts_duplicate}</div>
                <div>TTS: {test.tts}</div>
                <div>TMS: {test.tms}</div>
                <div>Psychrotrophs: {test.psychrotrophs}</div>
                <div>ATP: {test.atp}</div>
                <div>TDS: {test.tds}</div>
                <div>Hardness: {test.hardness}</div>
                <div>Chlorine: {test.chlorine}</div>
                <div>P-Alkalinity: {test.p_alkalinity}</div>
                <div>OH-Alkalinity: {test.oh_alkalinity}</div>
                <div>Chlorides: {test.chlorides}</div>
                <div>Sulphites: {test.sulphites}</div>
                <div>Calcium Hardness: {test.calcium_hardness}</div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
