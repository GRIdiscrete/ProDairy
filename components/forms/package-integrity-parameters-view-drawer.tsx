"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Settings, Clock, Target, Package, Calendar } from "lucide-react"
import { FillerLog2PackageIntegrityParameters } from "@/lib/api/data-capture-forms"

interface PackageIntegrityParametersViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parameter: FillerLog2PackageIntegrityParameters | null
  onEdit: () => void
}

export function PackageIntegrityParametersViewDrawer({
  open,
  onOpenChange,
  parameter,
  onEdit
}: PackageIntegrityParametersViewDrawerProps) {
  if (!parameter) return null

  const getPackageIntegrityInfo = (packageIntegrity: any) => {
    if (!packageIntegrity) return "Unknown"
    return `Target: ${packageIntegrity.target || "N/A"}`
  }

  const getFillerLog2Info = (fillerLog2: any) => {
    if (!fillerLog2) return "Unknown"
    return `${fillerLog2.sku || "N/A"} - ${fillerLog2.shift || "N/A"}`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[60vw] sm:max-w-[60vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Package Integrity Parameters Details
          </SheetTitle>
          <SheetDescription>
            View package integrity parameters and category information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Parameters Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Category Name</label>
                <p className="text-sm font-semibold">{parameter.category_name || "N/A"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="text-sm font-semibold">
                  {parameter.time ? new Date(parameter.time).toLocaleString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Related Package Integrity Details */}
          {parameter.filler_log_2_package_integrit_filler_log_2_package_integri_fkey && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Related Package Integrity Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Target</label>
                  <p className="text-sm font-semibold">
                    {parameter.filler_log_2_package_integrit_filler_log_2_package_integri_fkey.target || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Time</label>
                  <p className="text-sm font-semibold">
                    {parameter.filler_log_2_package_integrit_filler_log_2_package_integri_fkey.time 
                      ? new Date(parameter.filler_log_2_package_integrit_filler_log_2_package_integri_fkey.time).toLocaleString()
                      : "N/A"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Filler Log 2 Details */}
          {parameter.filler_log_2_package_integrit_filler_log_2_package_integri_fkey?.filler_log_2_package_integrity_filler_log_2_id_fkey && (
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
                      {parameter.filler_log_2_package_integrit_filler_log_2_package_integri_fkey.filler_log_2_package_integrity_filler_log_2_id_fkey.date 
                        ? new Date(parameter.filler_log_2_package_integrit_filler_log_2_package_integri_fkey.filler_log_2_package_integrity_filler_log_2_id_fkey.date).toLocaleDateString()
                        : "N/A"
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">SKU</label>
                    <p className="text-sm font-semibold">
                      {parameter.filler_log_2_package_integrit_filler_log_2_package_integri_fkey.filler_log_2_package_integrity_filler_log_2_id_fkey.sku || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Shift</label>
                    <p className="text-sm font-semibold">
                      {parameter.filler_log_2_package_integrit_filler_log_2_package_integri_fkey.filler_log_2_package_integrity_filler_log_2_id_fkey.shift || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Packages Counter</label>
                    <p className="text-sm font-semibold">
                      {parameter.filler_log_2_package_integrit_filler_log_2_package_integri_fkey.filler_log_2_package_integrity_filler_log_2_id_fkey.packages_counter || 0}
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
                    {parameter.created_at ? new Date(parameter.created_at).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated At</label>
                  <p className="text-sm font-semibold">
                    {parameter.updated_at ? new Date(parameter.updated_at).toLocaleString() : "N/A"}
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
              Edit Parameters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
