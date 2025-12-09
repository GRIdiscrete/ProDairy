"use client"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { rolesApi } from "@/lib/api/roles"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { format } from "date-fns"

interface Props {
  open: boolean
  onOpenChange: (b:boolean) => void
  note: any | null
  onEdit?: () => void
}

export function QaRejectNoteViewDrawer({ open, onOpenChange, note, onEdit }: Props) {
  const [roles, setRoles] = useState<any[]>([])
  useEffect(()=> {
    if (!open) return
    rolesApi.getRoles().then(r=>setRoles(r.data||[])).catch(()=>setRoles([]))
  }, [open])

  if (!note) return null
  const d = (note.qa_reject_note_details && note.qa_reject_note_details[0]) || note.details_id || null
  const approverRole = roles.find(r=>r.id === note.approved_by)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>QA Reject Note</SheetTitle>
          <SheetDescription>View QA reject note details</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          <div className="border rounded-lg p-4  from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-light">Reject Note</h3>
                <p className="text-sm text-gray-500">{note.tag}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-light">{note.created_at ? format(new Date(note.created_at), "PPP 'at' p") : "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-500">Approver (Role)</span>
              <p className="text-sm font-light">{approverRole ? approverRole.role_name : (note.approved_by || "N/A")}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Approver Signature</span>
              <div className="mt-1">
                {note.approver_signature ? <img src={base64ToPngDataUrl(note.approver_signature)} className="h-24 border rounded-md" alt="sig" /> : <p className="text-sm font-light">N/A</p>}
              </div>
            </div>
          </div>

          {d && (
            <div className="border p-4 rounded-md bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Detail</h4>
                  <Badge className="bg-red-100 text-red-800 font-light">{d.status}</Badge>
                </div>
                <div className="text-sm text-gray-500">
                  <div>Product ID: {d.product}</div>
                  <div>Batch: {d.batch_no}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-500">Reject Date</span>
                  <p className="font-light">{d.reject_date}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">MNF Date</span>
                  <p className="font-light">{d.mnf_date}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Pack Size</span>
                  <p className="font-light">{d.pack_size}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Pallets Rejected</span>
                  <p className="font-light">{d.pallets_rejected ?? 0}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-500">Reason</span>
                  <p className="font-light">{d.reason || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t bg-white">
          <Button  onClick={() => onOpenChange(false)}>Close</Button>
          {onEdit && <Button onClick={onEdit}>Edit</Button>}
        </div>
      </SheetContent>
    </Sheet>
  )
}
