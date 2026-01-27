"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FillerLog2StoppagesLog } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"

interface StoppagesLogViewDrawerProps {
  isOpen: boolean
  onClose: () => void
  stoppagesLog: FillerLog2StoppagesLog | null
}

export function StoppagesLogViewDrawer({ isOpen, onClose, stoppagesLog }: StoppagesLogViewDrawerProps) {
  if (!stoppagesLog) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Stoppages Log Details</SheetTitle>
          <SheetDescription>
            View stoppages log information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stoppages Log Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-sm">{stoppagesLog.id || "N/A"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Filler Log 2</label>
                <p className="text-sm">
                  {stoppagesLog.filler_log_2_stoppages_log_filler_log_2_id_fkey 
                    ? `${stoppagesLog.filler_log_2_stoppages_log_filler_log_2_id_fkey.sku} - ${stoppagesLog.filler_log_2_stoppages_log_filler_log_2_id_fkey.shift}`
                    : stoppagesLog.filler_log_2_id || "N/A"
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Time</label>
                  <p className="text-sm">
                    {stoppagesLog.start ? format(new Date(stoppagesLog.start), "PPpp") : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stop Time</label>
                  <p className="text-sm">
                    {stoppagesLog.stop ? format(new Date(stoppagesLog.stop), "PPpp") : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Reason for Stoppage</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">{stoppagesLog.reason_for_stoppage || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm">
                    {stoppagesLog.created_at ? format(new Date(stoppagesLog.created_at), "PPpp") : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated At</label>
                  <p className="text-sm">
                    {stoppagesLog.updated_at ? format(new Date(stoppagesLog.updated_at), "PPpp") : "N/A"}
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
