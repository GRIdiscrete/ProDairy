"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { rolesApi } from "@/lib/api/roles"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { SignatureViewer } from "@/components/ui/signature-viewer"

interface Props {
  open: boolean
  onOpenChange: (b:boolean) => void
  note: any | null
  onEdit?: () => void
}

export function QaReleaseNoteViewDrawer({ open, onOpenChange, note, onEdit }: Props) {
  if (!note) return null

  const [roles, setRoles] = useState<any[]>([])
  useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        const r = await rolesApi.getRoles()
        setRoles(r.data || [])
      } catch {
        setRoles([])
      }
    })()
  }, [open])

  const latestDetail = (note.qa_release_note_details && note.qa_release_note_details[0]) || null
  const approverRole = roles.find((r:any) => r.id === note.approved_by)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>QA Release Note</SheetTitle>
          <SheetDescription>View QA release note details</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          <div className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-light">Release Note</h3>
                <p className="text-sm text-gray-500">{note.tag}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-light">{note.created_at ? format(new Date(note.created_at), "PPP 'at' p") : "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs text-gray-500">Approver (Role)</span>
              <p className="text-sm font-light">{approverRole ? approverRole.role_name : (note.approved_by || "N/A")}</p>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-gray-500">Approver Signature</span>
              <div>
                {note.approver_signature ? (
                  <img src={base64ToPngDataUrl(note.approver_signature)} className="h-24 border rounded-md" alt="approver signature" />
                ) : <p className="text-sm font-light">N/A</p>}
              </div>
            </div>
          </div>

          {latestDetail && (
            <div className="border p-4 rounded-md bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Detail</h4>
                  <Badge className="bg-green-100 text-green-800 font-light">{latestDetail.status}</Badge>
                </div>
                <div className="text-sm text-gray-500">
                  <div>Product: {latestDetail.product}</div>
                  <div>Batch: {latestDetail.batch_no}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-500">MNF Date</span>
                  <p className="font-light">{latestDetail.mnf_date}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Release Date</span>
                  <p className="font-light">{latestDetail.release_date}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Pack Size (ml)</span>
                  <p className="font-light">{latestDetail.pack_size_ml}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Pallets On Hold</span>
                  <p className="font-light">{latestDetail.pallets_on_hold ?? 0}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Hold Times</span>
                  <p className="font-light">{latestDetail.hold_times ?? 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t bg-white">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {onEdit && <Button onClick={onEdit}>Edit</Button>}
        </div>
      </SheetContent>
    </Sheet>
  )
}
