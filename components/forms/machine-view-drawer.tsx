"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Settings, Calendar, MapPin, Wrench, Activity, AlertTriangle, FileText } from "lucide-react"

interface MachineViewDrawerProps {
  open: boolean
  onClose: () => void
  machine: any
  onEdit?: () => void
}

export function MachineViewDrawer({ open, onClose, machine, onEdit }: MachineViewDrawerProps) {
  if (!machine) return null

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

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 bg-white">
        <SheetHeader>
          <SheetTitle className="text-lg font-light">Machine Details</SheetTitle>
          <SheetDescription className="text-sm font-light">View machine information and stats</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-base font-light">{machine.name}</div>
                  <Badge className={getStatusVariant(machine.status)}>{machine.status}</Badge>
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
                <div className="text-sm font-light">{machine.serial_number}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Wrench className="h-3 w-3" />Category</div>
                <div className="text-sm font-light">{machine.category}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" />Location</div>
                <div className="text-sm font-light">{machine.location}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />Created</div>
                <div className="text-sm font-light">{new Date(machine.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}