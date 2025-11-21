"use client"

import { UseFormReturn, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { useState } from "react"
import type { BasicInfoFormData } from "./types"

interface BasicInfoStepProps {
  form: UseFormReturn<BasicInfoFormData>
  userRoles: any[]
  loadingUserRoles: boolean
}

export function BasicInfoStep({ form, userRoles, loadingUserRoles }: BasicInfoStepProps) {
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [signatureViewOpen, setSignatureViewOpen] = useState(false)

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="issue_date">Issue Date *</Label>
          <Controller
            name="issue_date"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select issue date"
              />
            )}
          />
          {form.formState.errors.issue_date && (
            <p className="text-sm text-red-500">{form.formState.errors.issue_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_production">Date of Production *</Label>
          <Controller
            name="date_of_production"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                type="date"
                disabled
                className="bg-gray-50"
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="batch_number">Batch Number *</Label>
          <Controller
            name="batch_number"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                disabled
                className="bg-gray-50"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variety">Variety *</Label>
          <Controller
            name="variety"
            control={form.control}
            render={({ field }) => (
              <Input {...field} />
            )}
          />
          {form.formState.errors.variety && (
            <p className="text-sm text-red-500">{form.formState.errors.variety.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="approved_by">Approved By *</Label>
          <Controller
            name="approved_by"
            control={form.control}
            render={({ field }) => (
              <SearchableSelect
                options={userRoles.map(role => ({
                  value: role.id,
                  label: role.role_name,
                  description: role.description || 'User Role'
                }))}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Search and select approver role"
                searchPlaceholder="Search roles..."
                emptyMessage="No roles found"
                loading={loadingUserRoles}
              />
            )}
          />
          {form.formState.errors.approved_by && (
            <p className="text-sm text-red-500">{form.formState.errors.approved_by.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Approver Signature *</Label>
          <Controller
            name="approver_signature"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {field.value ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSignatureViewOpen(true)}
                      >
                        View Signature
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSignatureOpen(true)}
                      >
                        Change Signature
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSignatureOpen(true)}
                    >
                      Add Signature
                    </Button>
                  )}
                </div>
                {field.value && (
                  <div className="border rounded-md p-3 bg-gray-50">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <div className="bg-white border rounded p-2 inline-block">
                      <img 
                        src={field.value} 
                        alt="Signature preview" 
                        className="h-20 w-auto max-w-[200px] object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          />
          {form.formState.errors.approver_signature && (
            <p className="text-sm text-red-500">{form.formState.errors.approver_signature.message}</p>
          )}
        </div>
      </div>

      <SignatureModal
        open={signatureOpen}
        onOpenChange={setSignatureOpen}
        title="Capture Approver Signature"
        onSave={(dataUrl) => {
          form.setValue("approver_signature", dataUrl, { shouldValidate: true })
        }}
      />
      <SignatureViewer
        open={signatureViewOpen}
        onOpenChange={setSignatureViewOpen}
        title="Approver Signature"
        value={form.watch("approver_signature")}
      />
    </div>
  )
}
