"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, Gauge, User as UserIcon, Edit, FileText } from "lucide-react"
import { Tanker } from "@/lib/api/tanker"
import { UserAvatar } from "@/components/ui/user-avatar"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  tanker: Tanker | null
  users?: any[]
  onEdit?: () => void
}

export function TankerViewDrawer({ open, onOpenChange, tanker, users = [], onEdit }: Props) {
  if (!tanker) return null
  const driver = Array.isArray(users) ? users.find((u: any) => u.id === tanker.driver_id) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 bg-white">
        <SheetHeader>
          <SheetTitle className="text-lg font-light">Tanker Details</SheetTitle>
          <SheetDescription className="text-sm font-light">View tanker information and stats</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-base font-light">{tanker.reg_number}</div>
                  <Badge className="bg-blue-100 text-blue-800 font-light">{Math.round(tanker.capacity)} L</Badge>
                </div>
                {onEdit && (
                  <Button onClick={onEdit}  size="sm" className=" bg-[#006BC4] text-white rounded-full"> 
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><FileText className="h-3 w-3" />Condition</div>
                <div className="text-sm font-light">{tanker.condition}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Gauge className="h-3 w-3" />Mileage</div>
                <div className="text-sm font-light">{tanker.mileage.toLocaleString()} km</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><FileText className="h-3 w-3" />Age</div>
                <div className="text-sm font-light">{tanker.age} years</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><FileText className="h-3 w-3" />Compartments</div>
                <div className="text-sm font-light">{tanker.compartments || 'N/A'}</div>
              </div>
              <div className="space-y-1 col-span-2">
                <div className="text-xs text-gray-500 flex items-center gap-1 mb-2"><UserIcon className="h-3 w-3" />Driver</div>
                {driver ? (
                  <UserAvatar user={driver} size="sm" showName={true} showEmail={true} />
                ) : (
                  <div className="text-sm font-light text-gray-500">Unassigned</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}


