"use client"

import { useFormContext } from "react-hook-form"
import { ERPInput, ERPSelect, ERPDatePicker } from "@/components/erp/form-fields"
import { Button } from "@/components/ui/button"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { useState } from "react"
import { base64ToPngDataUrl } from "@/lib/utils"

interface BasicInfoStepProps {
  users: any[]
  loadingUsers: boolean
  handleUserSearch: (query: string) => Promise<any[]>
}

export function BasicInfoStep({ users, loadingUsers, handleUserSearch }: BasicInfoStepProps) {
  const { watch, setValue } = useFormContext()
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [signatureViewOpen, setSignatureViewOpen] = useState(false)
  const signature = watch("approver_signature")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <ERPDatePicker name="issue_date" label="Issue Date" placeholder="Select issue date" />
        <ERPInput name="date_of_production" label="Date of Production" type="date" disabled className="bg-gray-50" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ERPInput name="batch_number" label="Batch Number" type="number" disabled className="bg-gray-50" />
        <ERPInput name="variety" label="Variety" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ERPSelect
          name="approved_by"
          label="Approved By"
          options={users.map(user => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name}`.trim() || user.email,
            description: `${user.department} • ${user.email}`
          }))}
          onSearch={handleUserSearch}
          loading={loadingUsers}
          placeholder="Search and select approver"
          searchPlaceholder="Search users..."
          emptyMessage="No users found"
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Approver Signature
          </label>
          <div className="space-y-2">
            {signature ? (
              <img src={base64ToPngDataUrl(signature)} alt="Approver signature" className="h-24 border border-gray-200 rounded-md bg-white" />
            ) : (
              <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                No signature captured
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSignatureOpen(true)}>
                Add Signature
              </Button>
              {signature && (
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSignatureViewOpen(true)}>
                  View Signature
                </Button>
              )}
              {signature && (
                <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => setValue("approver_signature", "")}>Clear</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SignatureModal
        open={signatureOpen}
        onOpenChange={setSignatureOpen}
        title="Capture Approver Signature"
        onSave={(dataUrl) => {
          setValue("approver_signature", dataUrl, { shouldValidate: true })
        }}
      />
      <SignatureViewer
        open={signatureViewOpen}
        onOpenChange={setSignatureViewOpen}
        title="Approver Signature"
        value={signature}
      />
    </div>
  )
}
