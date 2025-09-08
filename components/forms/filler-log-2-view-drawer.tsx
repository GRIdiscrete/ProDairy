"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Package, User, Building, Calendar, Clock, AlertTriangle } from "lucide-react"
import { FillerLog2 } from "@/lib/api/data-capture-forms"

interface FillerLog2ViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process: FillerLog2 | null
  onEdit: () => void
}

export function FillerLog2ViewDrawer({
  open,
  onOpenChange,
  process,
  onEdit
}: FillerLog2ViewDrawerProps) {
  if (!process) return null

  const getPersonName = (person: any) => {
    if (!person) return "Unknown"
    return `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email || "Unknown"
  }

  const getMachineName = (machine: any) => {
    if (!machine) return "Unknown"
    return machine.name || "Unknown"
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[60vw] sm:max-w-[60vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Filler Log 2 Details
          </SheetTitle>
          <SheetDescription>
            View complete filler log information and production data
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-sm font-semibold">
                    {process.date ? new Date(process.date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">SKU</label>
                  <p className="text-sm font-semibold">{process.sku || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Machine</label>
                  <p className="text-sm font-semibold">{getMachineName(process.filler_log_2_machine_id_fkey)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Shift</label>
                  <p className="text-sm font-semibold">{process.shift || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Counters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Production Counters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Packages Counter</label>
                  <p className="text-sm font-semibold">{process.packages_counter || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Counter</label>
                  <p className="text-sm font-semibold">{process.product_counter || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Filler Waste</label>
                  <p className="text-sm font-semibold">{process.filler_waste || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Flat Packs</label>
                  <p className="text-sm font-semibold">{process.flat_packs || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Waste Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Waste Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Shift Handling Waste</label>
                <p className="text-sm font-semibold">{process.shift_handling_waste || "N/A"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Inline Damages</label>
                <p className="text-sm font-semibold">{process.inline_damages || "N/A"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Counted Waste</label>
                <p className="text-sm font-semibold">{process.counted_waste || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Personnel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personnel Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Operator</label>
                  <p className="text-sm font-semibold">{getPersonName(process.filler_log_2_operator_id_fkey)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Operator Signature</label>
                  <p className="text-sm font-semibold">{process.operator_id_signature || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Supervisor</label>
                  <p className="text-sm font-semibold">{getPersonName(process.filler_log_2_supervisor_id_fkey)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Supervisor Signature</label>
                  <p className="text-sm font-semibold">{process.supervisor_id_signature || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Shift Technician</label>
                  <p className="text-sm font-semibold">{getPersonName(process.filler_log_2_shift_technician_id_fkey)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Technician Signature</label>
                  <p className="text-sm font-semibold">{process.shift_technician_id_signature || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shift Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Shift Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-gray-500">Comments</label>
                <p className="text-sm font-semibold mt-1">{process.shift_comment || "No comments"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm font-semibold">
                    {process.created_at ? new Date(process.created_at).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated At</label>
                  <p className="text-sm font-semibold">
                    {process.updated_at ? new Date(process.updated_at).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={onEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Filler Log 2
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
