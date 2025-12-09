"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FillerLog2PrepAndSterilization } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"

interface PrepSterilizationViewDrawerProps {
  isOpen: boolean
  onClose: () => void
  prepSterilization: FillerLog2PrepAndSterilization | null
}

export function PrepSterilizationViewDrawer({ isOpen, onClose, prepSterilization }: PrepSterilizationViewDrawerProps) {
  if (!prepSterilization) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Prep & Sterilization Details</SheetTitle>
          <SheetDescription>
            View prep and sterilization information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prep & Sterilization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-sm">{prepSterilization.id || "N/A"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Filler Log 2</label>
                <p className="text-sm">
                  {prepSterilization.filler_log_2_prep_and_sterilization_filler_log_2_id_fkey 
                    ? `${prepSterilization.filler_log_2_prep_and_sterilization_filler_log_2_id_fkey.sku} - ${prepSterilization.filler_log_2_prep_and_sterilization_filler_log_2_id_fkey.shift}`
                    : prepSterilization.filler_log_2_id || "N/A"
                  }
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preparation Times</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preparation Start</label>
                    <p className="text-sm">
                      {prepSterilization.preparation_start ? format(new Date(prepSterilization.preparation_start), "PPpp") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preparation End</label>
                    <p className="text-sm">
                      {prepSterilization.preparation_end ? format(new Date(prepSterilization.preparation_end), "PPpp") : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sterilization Times</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sterilization Start</label>
                    <p className="text-sm">
                      {prepSterilization.sterilization_start ? format(new Date(prepSterilization.sterilization_start), "PPpp") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sterilization End</label>
                    <p className="text-sm">
                      {prepSterilization.sterilization_end ? format(new Date(prepSterilization.sterilization_end), "PPpp") : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm">
                    {prepSterilization.created_at ? format(new Date(prepSterilization.created_at), "PPpp") : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated At</label>
                  <p className="text-sm">
                    {prepSterilization.updated_at ? format(new Date(prepSterilization.updated_at), "PPpp") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
