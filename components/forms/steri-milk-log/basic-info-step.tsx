"use client"

import { Controller, UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { Switch } from "@/components/ui/switch"
import { ProcessOverview } from "./process-overview"
import type { BasicInfoFormData } from "./types"

interface BasicInfoStepProps {
  form: UseFormReturn<BasicInfoFormData>
  userRoles: any[]
  filmaticForms: any[]
  loadingUserRoles: boolean
  loadingFilmaticForms: boolean
}

export function BasicInfoStep({
  form,
  userRoles,
  filmaticForms,
  loadingUserRoles,
  loadingFilmaticForms
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6 p-6">
      <ProcessOverview />

      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Basic Information</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the basic log information and batch details</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="batch_number">Batch Number</Label>
          <Controller
            name="batch_number"
            control={form.control}
            render={({ field }) => (
              <Input
                id="batch_number"
                type="text"
                placeholder="Enter batch number"
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
          {form.formState.errors.batch_number && (
            <p className="text-sm text-red-500">{form.formState.errors.batch_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Batch Date</Label>
          <Controller
            name="date"
            control={form.control}
            render={({ field }) => {
              const parseDate = (dateStr: string | Date | undefined): Date | undefined => {
                if (!dateStr) return undefined
                if (dateStr instanceof Date) {
                  return isNaN(dateStr.getTime()) ? undefined : dateStr
                }
                if (typeof dateStr === 'string') {
                  const parsed = new Date(dateStr)
                  return isNaN(parsed.getTime()) ? undefined : parsed
                }
                return undefined
              }

              return (
                <DatePicker
                  value={parseDate(field.value)}
                  selected={parseDate(field.value)}
                  onChange={(date: Date | undefined) => {
                    if (!date) {
                      field.onChange("")
                      return
                    }
                    
                    // Handle if date is actually a string
                    const actualDate = date instanceof Date ? date : new Date(date)
                    
                    if (isNaN(actualDate.getTime())) {
                      field.onChange("")
                      return
                    }

                    const year = actualDate.getFullYear()
                    const month = String(actualDate.getMonth() + 1).padStart(2, '0')
                    const day = String(actualDate.getDate()).padStart(2, '0')
                    field.onChange(`${year}-${month}-${day}`)
                  }}
                  placeholder="Select batch date"
                />
              )
            }}
          />
          {form.formState.errors.date && (
            <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="approver_id">Approver</Label>
          <Controller
            name="approver_id"
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
          {form.formState.errors.approver_id && (
            <p className="text-sm text-red-500">{form.formState.errors.approver_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="approved">Approved</Label>
            <Controller
              name="approved"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          {form.formState.errors.approved && (
            <p className="text-sm text-red-500">{form.formState.errors.approved.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="filmatic_form_id">Filmatic Form</Label>
          <Controller
            name="filmatic_form_id"
            control={form.control}
            render={({ field }) => (
              <SearchableSelect
                options={filmaticForms.map(form => ({
                  value: form.id,
                  label: `${form?.tag || 'N/A'}`,
                }))}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Search and select filmatic form"
                searchPlaceholder="Search forms..."
                emptyMessage="No forms found"
                loading={loadingFilmaticForms}
              />
            )}
          />
          {form.formState.errors.filmatic_form_id && (
            <p className="text-sm text-red-500">{form.formState.errors.filmatic_form_id.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
