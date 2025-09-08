"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Target, Clock, Package, Calendar } from "lucide-react"
import { FillerLog2PackageIntegrity } from "@/lib/api/data-capture-forms"

interface PackageIntegrityViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrity: FillerLog2PackageIntegrity | null
  onEdit: () => void
}

export function PackageIntegrityViewDrawer({
  open,
  onOpenChange,
  integrity,
  onEdit
}: PackageIntegrityViewDrawerProps) {
  if (!integrity) return null

  const getFillerLog2Info = (fillerLog2: any) => {
    if (!fillerLog2) return "Unknown"
    return `${fillerLog2.sku || "N/A"} - ${fillerLog2.shift || "N/A"}`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[60vw] sm:max-w-[60vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Package Integrity Details
          </SheetTitle>
          <SheetDescription>
            View package integrity information and target values
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Package Integrity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Filler Log 2</label>
                <p className="text-sm font-semibold">
                  {getFillerLog2Info(integrity.filler_log_2_package_integrity_filler_log_2_id_fkey)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Target</label>
                <p className="text-sm font-semibold">{integrity.target || 0}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="text-sm font-semibold">
                  {integrity.time ? new Date(integrity.time).toLocaleString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Related Filler Log 2 Details */}
          {integrity.filler_log_2_package_integrity_filler_log_2_id_fkey && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Related Filler Log 2 Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-sm font-semibold">
                      {integrity.filler_log_2_package_integrity_filler_log_2_id_fkey.date 
                        ? new Date(integrity.filler_log_2_package_integrity_filler_log_2_id_fkey.date).toLocaleDateString()
                        : "N/A"
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">SKU</label>
                    <p className="text-sm font-semibold">
                      {integrity.filler_log_2_package_integrity_filler_log_2_id_fkey.sku || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Shift</label>
                    <p className="text-sm font-semibold">
                      {integrity.filler_log_2_package_integrity_filler_log_2_id_fkey.shift || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Packages Counter</label>
                    <p className="text-sm font-semibold">
                      {integrity.filler_log_2_package_integrity_filler_log_2_id_fkey.packages_counter || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                    {integrity.created_at ? new Date(integrity.created_at).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated At</label>
                  <p className="text-sm font-semibold">
                    {integrity.updated_at ? new Date(integrity.updated_at).toLocaleString() : "N/A"}
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
              Edit Package Integrity
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
