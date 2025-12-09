"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FillerLog2PMSplice } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"

interface PMSpliceViewDrawerProps {
  isOpen: boolean
  onClose: () => void
  pmSplice: FillerLog2PMSplice | null
}

export function PMSpliceViewDrawer({ isOpen, onClose, pmSplice }: PMSpliceViewDrawerProps) {
  if (!pmSplice) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>PM Splice Details</SheetTitle>
          <SheetDescription>
            View PM splice information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PM Splice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-sm">{pmSplice.id || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">P Order</label>
                  <Badge variant="secondary">{pmSplice.p_order}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="text-sm">
                  {pmSplice.time ? format(new Date(pmSplice.time), "PPpp") : "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Packs Rejected</label>
                  <Badge variant="destructive">{pmSplice.packs_rejected}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Lane Number</label>
                  <Badge >{pmSplice.lane_number}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Filler Log 2</label>
                <p className="text-sm">
                  {pmSplice.filler_log_2_pm_splice_filler_log_2_id_fkey 
                    ? `${pmSplice.filler_log_2_pm_splice_filler_log_2_id_fkey.sku} - ${pmSplice.filler_log_2_pm_splice_filler_log_2_id_fkey.shift}`
                    : pmSplice.filler_log_2_id || "N/A"
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm">
                    {pmSplice.created_at ? format(new Date(pmSplice.created_at), "PPpp") : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated At</label>
                  <p className="text-sm">
                    {pmSplice.updated_at ? format(new Date(pmSplice.updated_at), "PPpp") : "N/A"}
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
