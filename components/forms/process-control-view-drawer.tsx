"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FillerLog2ProcessControl } from "@/lib/api/data-capture-forms"
import { format } from "date-fns"

interface ProcessControlViewDrawerProps {
  isOpen: boolean
  onClose: () => void
  processControl: FillerLog2ProcessControl | null
}

export function ProcessControlViewDrawer({ isOpen, onClose, processControl }: ProcessControlViewDrawerProps) {
  if (!processControl) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Process Control Details</SheetTitle>
          <SheetDescription>
            View process control information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Process Control Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-sm">{processControl.id || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Target</label>
                  <Badge variant="secondary">{processControl.target}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="text-sm">
                  {processControl.time ? format(new Date(processControl.time), "PPpp") : "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Filler Log 2</label>
                <p className="text-sm">
                  {processControl.filler_log_2_process_control_filler_log_2_id_fkey 
                    ? `${processControl.filler_log_2_process_control_filler_log_2_id_fkey.sku} - ${processControl.filler_log_2_process_control_filler_log_2_id_fkey.shift}`
                    : processControl.filler_log_2_id || "N/A"
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm">
                    {processControl.created_at ? format(new Date(processControl.created_at), "PPpp") : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated At</label>
                  <p className="text-sm">
                    {processControl.updated_at ? format(new Date(processControl.updated_at), "PPpp") : "N/A"}
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
