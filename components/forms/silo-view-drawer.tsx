import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Edit, Database, Settings, Calendar, MapPin, Gauge, 
  Activity, FileText, Wrench, Thermometer, Droplets,
  Truck, ClipboardList
} from "lucide-react"
import { Silo } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white border-l">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="text-xl font-light">Silo Details</SheetTitle>
            <SheetDescription className="text-sm font-light">View silo information and capacity stats</SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 pb-8 pt-4">
              <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-lg font-light leading-none flex items-center gap-2">
                          {silo.name}
                          <Badge className={getStatusVariant(silo.status)}>{silo.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Serial: {silo.serial_number}</p>
                      </div>
                    </div>
                    {onEdit && (
                      <Button onClick={onEdit} size="sm" className="bg-[#006BC4] hover:bg-[#005ba6] text-white rounded-full transition-colors"> 
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium flex items-center gap-1.5">
                      <Wrench className="h-3 w-3" />Category
                    </div>
                    <div className="text-sm font-light">{silo.category}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />Location
                    </div>
                    <div className="text-sm font-light">{silo.location || 'N/A'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium flex items-center gap-1.5">
                      <Droplets className="h-3 w-3 text-blue-500" />Fat Content
                    </div>
                    <div className="text-sm font-light flex items-center gap-1">
                      {silo.fat_content !== null ? `${silo.fat_content}%` : <span className="text-gray-300">N/A</span>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium flex items-center gap-1.5">
                      <Thermometer className="h-3 w-3 text-red-500" />Temperature
                    </div>
                    <div className="text-sm font-light flex items-center gap-1">
                      {silo.temperature !== null ? `${silo.temperature}°C` : <span className="text-gray-300">N/A</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity & Volume Information */}
              <div className="border border-gray-200 rounded-lg bg-white p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  <div className="text-base font-light font-medium">Capacity & Volume</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/30">
                    <div className="text-xs text-gray-500 mb-1">Total Capacity</div>
                    <div className="text-2xl font-light text-gray-900">{silo.capacity.toLocaleString()}L</div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl bg-blue-50/30">
                    <div className="text-xs text-gray-500 mb-1">Current Volume</div>
                    <div className="text-2xl font-light text-blue-600">{silo?.milk_volume?.toLocaleString()}L</div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/30">
                    <div className="text-xs text-gray-500 mb-1">Available Space</div>
                    <div className="text-2xl font-light text-gray-700">
                      {(silo.capacity - silo.milk_volume).toLocaleString()}L
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <div className="text-xs font-medium text-gray-500">Utilization Rate</div>
                    <Badge variant="outline" className={`font-light border-0 px-0 ${
                      fillPercentage > 90 ? 'text-red-600 font-medium' : 
                      fillPercentage > 75 ? 'text-orange-600 font-medium' : 
                      'text-green-600'
                    }`}>
                      {fillPercentage.toFixed(1)}% Full
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        fillPercentage > 90 ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-sm shadow-red-200' : 
                        fillPercentage > 75 ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 
                        'bg-gradient-to-r from-[#A0CF06] to-[#8fb905]'
                      }`}
                      style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Silo Composition - New Section */}
              <div className="border border-gray-200 rounded-lg bg-white">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="w-4 h-4 text-[#A0CF06]" />
                    <div className="text-base font-light font-medium">Silo Composition</div>
                  </div>
                  <Badge variant="secondary" className="font-light bg-gray-100 text-gray-600 border-0">
                    {silo.composition?.length || 0} Batches
                  </Badge>
                </div>
                <div className="p-0 overflow-hidden">
                  {!silo.composition || silo.composition.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <Truck className="w-6 h-6 opacity-20" />
                      </div>
                      <p className="text-sm italic">No composition data available for this silo</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {silo.composition.map((item, index) => (
                        <div key={`${item.collection_id}-${index}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mt-0.5">
                                <Truck className="w-3.5 h-3.5 text-blue-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 leading-tight">
                                  {item.supplier_first_name} {item.supplier_last_name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[10px] h-4 py-0 font-light border-gray-200">
                                    {item.voucher_tag}
                                  </Badge>
                                  <span className="text-gray-300">•</span>
                                  <span>{item.supplier_tank}</span>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1">
                                  {new Date(item.voucher_date).toLocaleDateString(undefined, { 
                                    year: 'numeric', month: 'short', day: 'numeric' 
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-blue-600">
                                {item.volume.toLocaleString()}L
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Contribution</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Technical Info */}
              <div className="flex items-center gap-2 text-xs text-gray-400 justify-center pb-2">
                <Calendar className="h-3 w-3" />
                <span>Created {new Date(silo.created_at).toLocaleDateString()}</span>
                <Separator orientation="vertical" className="h-3 h-3" />
                <span>Last Updated {new Date(silo.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}