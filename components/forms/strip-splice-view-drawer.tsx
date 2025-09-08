"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FillerLog2StripSplice } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"

interface StripSpliceViewDrawerProps {
  isOpen: boolean
  onClose: () => void
  stripSplice: FillerLog2StripSplice | null
}

export function StripSpliceViewDrawer({ isOpen, onClose, stripSplice }: StripSpliceViewDrawerProps) {
  if (!stripSplice) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Strip Splice Details</SheetTitle>
          <SheetDescription>
            View strip splice information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strip Splice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-sm">{stripSplice.id || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">P Order</label>
                  <Badge variant="secondary">{stripSplice.p_order}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="text-sm">
                  {stripSplice.time ? format(new Date(stripSplice.time), "PPpp") : "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Packs Rejected</label>
                  <Badge variant="destructive">{stripSplice.packs_rejected}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Lane Number</label>
                  <Badge variant="outline">{stripSplice.lane_number}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Filler Log 2</label>
                <p className="text-sm">
                  {stripSplice.filler_log_2_strip_splice_filler_log_2_id_fkey 
                    ? `${stripSplice.filler_log_2_strip_splice_filler_log_2_id_fkey.sku} - ${stripSplice.filler_log_2_strip_splice_filler_log_2_id_fkey.shift}`
                    : stripSplice.filler_log_2_id || "N/A"
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm">
                    {stripSplice.created_at ? format(new Date(stripSplice.created_at), "PPpp") : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated At</label>
                  <p className="text-sm">
                    {stripSplice.updated_at ? format(new Date(stripSplice.updated_at), "PPpp") : "N/A"}
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
