"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, SubmitHandler, Controller, UseFormReturn } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { Beaker, ChevronLeft, ChevronRight, CheckCircle, Clock } from "lucide-react"
import { steriMilkTestReportApi, type CreateSteriMilkTestReportRequest } from "@/lib/api/steri-milk-test-report"
import { usersApi, type UserEntity } from "@/lib/api/users"
import { steriMilkProcessLogApi, type SteriMilkProcessLog } from "@/lib/api/steri-milk-process-log"
import { tankerApi } from "@/lib/api/tanker"
import { Tanker } from "@/lib/api/tanker"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { normalizeDataUrlToBase64, base64ToPngDataUrl } from "@/lib/utils/signature"
import { toast } from "sonner"
import { LoadingButton } from "@/components/ui/loading-button"

const testReportSchema = yup.object({
  issue_date: yup.string().required("Issue date is required"),
  approved_by: yup.string().required("Approved by is required"),
  approver_signature: yup.string().required("Approver signature is required"),
  date_of_production: yup.string().required("Date of production is required"),
  batch_number: yup.number().required("Batch number is required"),
  variety: yup.string().required("Variety is required"),
  raw_milk_silos: yup.object({
    tank: yup.string(),
    time: yup.string(),
    temperature: yup.number(),
    alcohol: yup.number(),
    res: yup.number(),
    cob: yup.boolean(),
    ph: yup.number(),
    fat: yup.number(),
    lr_snf: yup.string(),
    acidity: yup.number(),
    remarks: yup.string(),
  }),
  other_tests: yup.object({
    sample_details: yup.string(),
    ph: yup.number(),
    caustic: yup.number(),
    acid: yup.number(),
    chlorine: yup.number(),
    hd: yup.number(),
    tds: yup.number(),
    hydrogen_peroxide: yup.number(),
    remarks: yup.string(),
  }),
  standardisation_and_pasteurisation: yup.object({
    tank: yup.string(),
    batch: yup.number(),
    time: yup.string(),
    temperature: yup.number(),
    ot: yup.string(),
    alcohol: yup.number(),
    phosphatase: yup.string(),
    ph: yup.number(),
    cob: yup.boolean(),
    fat: yup.number(),
    ci_si: yup.string(),
    lr_snf: yup.string(),
    acidity: yup.number(),
    analyst: yup.string(),
    remarks: yup.string(),
  }),
  uht_steri_milk: yup.object({
    time: yup.string(),
    batch: yup.string(),
    temperature: yup.number(),
    ot: yup.string(),
    alc: yup.number(),
    res: yup.number(),
    cob: yup.boolean(),
    ph: yup.number(),
    fat: yup.number(),
    lr_snf: yup.string(),
    ci_si: yup.string(),
    total_solids: yup.number(),
    acidity: yup.number(),
    coffee: yup.number(),
    coffee_remarks: yup.string(),
    hydrogen_peroxide_or_turbidity: yup.string(),
    analyst: yup.string(),
    remarks: yup.string(),
  })
})

type TestReportFormData = {
  issue_date: string
  approved_by: string
  approver_signature: string
  date_of_production: string
  batch_number: number
  variety: string
  raw_milk_silos: {
    tank: string
    time: string
    temperature: number
    alcohol: number
    res: number
    cob: boolean
    ph: number
    fat: number
    lr_snf: string
    acidity: number
    remarks: string
  }
  other_tests: {
    sample_details: string
    ph: number
    caustic: number
    acid: number
    chlorine: number
    hd: number
    tds: number
    hydrogen_peroxide: number
    remarks: string
  }
  standardisation_and_pasteurisation: {
    tank: string
    batch: number
    time: string
    temperature: number
    ot: string
    alcohol: number
    phosphatase: string
    ph: number
    cob: boolean
    fat: number
    ci_si: string
    lr_snf: string
    acidity: number
    analyst: string
    remarks: string
  }
  uht_steri_milk: {
    time: string
    batch: string
    temperature: number
    ot: string
    alc: number
    res: number
    cob: boolean
    ph: number
    fat: number
    lr_snf: string
    ci_si: string
    total_solids: number
    acidity: number
    coffee: number
    coffee_remarks: string
    hydrogen_peroxide_or_turbidity: string
    analyst: string
    remarks: string
  }
}

interface SteriMilkTestReportFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  processLogId?: string
  onSuccess?: () => void
}

const steps = [
  { id: 1, title: "Basic Information", description: "Enter basic test report details" },
  { id: 2, title: "Raw Milk Silos", description: "Raw milk silo test parameters" },
  { id: 3, title: "Other Tests", description: "Additional test parameters" },
  { id: 4, title: "Standardisation & Pasteurisation", description: "Pasteurisation process data" },
  { id: 5, title: "UHT Steri Milk", description: "UHT processing parameters" },
  { id: 6, title: "Review & Submit", description: "Review all data and submit" }
]

// Step 1: Basic Information Component
function Step1BasicInfo({ 
  control, 
  errors, 
  users, 
  loadingUsers, 
  watch, 
  setValue 
}: { 
  control: any
  errors: any
  users: UserEntity[]
  loadingUsers: boolean
  watch: any
  setValue: any
}) {
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [signatureViewOpen, setSignatureViewOpen] = useState(false)

  const handleUserSearch = async (query: string) => {
    if (!query.trim()) return []
    try {
      const usersResponse = await usersApi.getUsers({ filters: { search: query } })
      return (usersResponse.data || []).map(user => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`.trim() || user.email,
        description: `${user.department} • ${user.email}`
      }))
    } catch (error) {
      return []
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="issue_date">Issue Date</Label>
            <Controller
              name="issue_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select issue date"
                />
              )}
            />
            {errors.issue_date && (
              <p className="text-red-500 text-sm mt-1">{errors.issue_date.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="date_of_production">Date of Production</Label>
            <Controller
              name="date_of_production"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  className="mt-1 bg-gray-50"
                  disabled
                />
              )}
            />
            {errors.date_of_production && (
              <p className="text-red-500 text-sm mt-1">{errors.date_of_production.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="batch_number">Batch Number</Label>
            <Controller
              name="batch_number"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  className="mt-1 bg-gray-50"
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  disabled
                />
              )}
            />
            {errors.batch_number && (
              <p className="text-red-500 text-sm mt-1">{errors.batch_number.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="variety">Variety</Label>
            <Controller
              name="variety"
              control={control}
              render={({ field }) => (
                <Input {...field} className="mt-1" />
              )}
            />
            {errors.variety && (
              <p className="text-red-500 text-sm mt-1">{errors.variety.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="approved_by">Approved By</Label>
            <Controller
              name="approved_by"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={users.map(user => ({
                    value: user.id,
                    label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                    description: `${user.department} • ${user.email}`
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  onSearch={handleUserSearch}
                  placeholder="Search and select approver"
                  searchPlaceholder="Search users..."
                  emptyMessage="No users found"
                  loading={loadingUsers}
                />
              )}
            />
            {errors.approved_by && (
              <p className="text-red-500 text-sm mt-1">{errors.approved_by.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="approver_signature">Approver Signature</Label>
            <Controller
              name="approver_signature"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {field.value ? (
                    <img src={base64ToPngDataUrl(field.value)} alt="Approver signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                  ) : (
                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                      No signature captured
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSignatureOpen(true)}>
                      Add Signature
                    </Button>
                    {field.value && (
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSignatureViewOpen(true)}>
                        View Signature
                      </Button>
                    )}
                    {field.value && (
                      <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => field.onChange("")}>Clear</Button>
                    )}
                  </div>
                </div>
              )}
            />
            {errors.approver_signature && (
              <p className="text-red-500 text-sm mt-1">{errors.approver_signature.message}</p>
            )}
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
        value={watch("approver_signature")}
      />
    </>
  )
}

// Step 2: Raw Milk Silos Component
function Step2RawMilkSilos({ 
  control, 
  tankers, 
  loadingTankers 
}: { 
  control: any
  tankers: Tanker[]
  loadingTankers: boolean
}) {
  const handleTankerSearch = async (query: string) => {
    if (!query.trim()) return []
    try {
      const tankersResponse = await tankerApi.getAll()
      return (tankersResponse.data || [])
        .filter(tanker =>
          tanker.reg_number.toLowerCase().includes(query.toLowerCase()) ||
          tanker.condition.toLowerCase().includes(query.toLowerCase())
        )
        .map(tanker => ({
          value: tanker.id,
          label: `${tanker.reg_number} (${tanker.condition})`,
          description: `${tanker.capacity}L capacity • ${tanker.age} years old`
        }))
    } catch (error) {
      return []
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Raw Milk Silos Test Parameters</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="raw_milk_silos.tank">Tank</Label>
          <Controller
            name="raw_milk_silos.tank"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                options={tankers.map(tanker => ({
                  value: tanker.id,
                  label: `${tanker.reg_number} (${tanker.condition})`,
                  description: `${tanker.capacity}L capacity • ${tanker.age} years old`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleTankerSearch}
                placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}
                searchPlaceholder="Search tankers..."
                emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}
                loading={loadingTankers}
              />
            )}
          />
        </div>
        <div>
          <Controller
            name="raw_milk_silos.time"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                label="Time"
                showTime={true}
                placeholder="Select date and time"
              />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="raw_milk_silos.temperature">Temperature (°C)</Label>
          <Controller
            name="raw_milk_silos.temperature"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="raw_milk_silos.alcohol">Alcohol (%)</Label>
          <Controller
            name="raw_milk_silos.alcohol"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="raw_milk_silos.res">RES</Label>
          <Controller
            name="raw_milk_silos.res"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="raw_milk_silos.cob">COB</Label>
          <Controller
            name="raw_milk_silos.cob"
            control={control}
            render={({ field }) => (
              <div className="mt-1">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mr-2"
                />
                <span className="text-sm">COB Present</span>
              </div>
            )}
          />
        </div>
        <div>
          <Label htmlFor="raw_milk_silos.ph">pH</Label>
          <Controller
            name="raw_milk_silos.ph"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="raw_milk_silos.fat">Fat (%)</Label>
          <Controller
            name="raw_milk_silos.fat"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="raw_milk_silos.lr_snf">LR/SNF</Label>
          <Controller
            name="raw_milk_silos.lr_snf"
            control={control}
            render={({ field }) => (
              <Input {...field} className="mt-1" />
            )}
          />
        </div>
        <div>
          <Label htmlFor="raw_milk_silos.acidity">Acidity</Label>
          <Controller
            name="raw_milk_silos.acidity"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="raw_milk_silos.remarks">Remarks</Label>
        <Controller
          name="raw_milk_silos.remarks"
          control={control}
          render={({ field }) => (
            <Input {...field} className="mt-1" />
          )}
        />
      </div>
    </div>
  )
}

// Step 3: Other Tests Component
function Step3OtherTests({ control }: { control: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Other Tests Parameters</h3>
      <div>
        <Label htmlFor="other_tests.sample_details">Sample Details</Label>
        <Controller
          name="other_tests.sample_details"
          control={control}
          render={({ field }) => (
            <Input {...field} className="mt-1" />
          )}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="other_tests.ph">pH</Label>
          <Controller
            name="other_tests.ph"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="other_tests.caustic">Caustic</Label>
          <Controller
            name="other_tests.caustic"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="other_tests.acid">Acid</Label>
          <Controller
            name="other_tests.acid"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="other_tests.chlorine">Chlorine</Label>
          <Controller
            name="other_tests.chlorine"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="other_tests.hd">HD</Label>
          <Controller
            name="other_tests.hd"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="other_tests.tds">TDS</Label>
          <Controller
            name="other_tests.tds"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="other_tests.hydrogen_peroxide">Hydrogen Peroxide</Label>
        <Controller
          name="other_tests.hydrogen_peroxide"
          control={control}
          render={({ field }) => (
            <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
          )}
        />
      </div>
      <div>
        <Label htmlFor="other_tests.remarks">Remarks</Label>
        <Controller
          name="other_tests.remarks"
          control={control}
          render={({ field }) => (
            <Input {...field} className="mt-1" />
          )}
        />
      </div>
    </div>
  )
}

// Step 4: Standardisation & Pasteurisation Component
function Step4StandardisationPasteurisation({ 
  control, 
  tankers, 
  loadingTankers,
  users,
  loadingUsers 
}: { 
  control: any
  tankers: Tanker[]
  loadingTankers: boolean
  users: UserEntity[]
  loadingUsers: boolean
}) {
  const handleTankerSearch = async (query: string) => {
    if (!query.trim()) return []
    try {
      const tankersResponse = await tankerApi.getAll()
      return (tankersResponse.data || [])
        .filter(tanker =>
          tanker.reg_number.toLowerCase().includes(query.toLowerCase()) ||
          tanker.condition.toLowerCase().includes(query.toLowerCase())
        )
        .map(tanker => ({
          value: tanker.id,
          label: `${tanker.reg_number} (${tanker.condition})`,
          description: `${tanker.capacity}L capacity • ${tanker.age} years old`
        }))
    } catch (error) {
      return []
    }
  }

  const handleUserSearch = async (query: string) => {
    if (!query.trim()) return []
    try {
      const usersResponse = await usersApi.getUsers({ filters: { search: query } })
      return (usersResponse.data || []).map(user => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`.trim() || user.email,
        description: `${user.department} • ${user.email}`
      }))
    } catch (error) {
      return []
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Standardisation & Pasteurisation</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.tank">Tank</Label>
          <Controller
            name="standardisation_and_pasteurisation.tank"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                options={tankers.map(tanker => ({
                  value: tanker.id,
                  label: `${tanker.reg_number} (${tanker.condition})`,
                  description: `${tanker.capacity}L capacity • ${tanker.age} years old`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleTankerSearch}
                placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}
                searchPlaceholder="Search tankers..."
                emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}
                loading={loadingTankers}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.batch">Batch</Label>
          <Controller
            name="standardisation_and_pasteurisation.batch"
            control={control}
            render={({ field }) => (
              <Input {...field} disabled className="mt-1 bg-gray-50" />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Controller
            name="standardisation_and_pasteurisation.time"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                label="Time"
                showTime={true}
                placeholder="Select date and time"
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.temperature">Temperature (°C)</Label>
          <Controller
            name="standardisation_and_pasteurisation.temperature"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.ot">OT</Label>
          <Controller
            name="standardisation_and_pasteurisation.ot"
            control={control}
            render={({ field }) => (
              <Input {...field} className="mt-1" />
            )}
          />
        </div>
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.alcohol">Alcohol (%)</Label>
          <Controller
            name="standardisation_and_pasteurisation.alcohol"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.phosphatase">Phosphatase</Label>
          <Controller
            name="standardisation_and_pasteurisation.phosphatase"
            control={control}
            render={({ field }) => (
              <Input {...field} className="mt-1" />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.ph">pH</Label>
          <Controller
            name="standardisation_and_pasteurisation.ph"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.cob">COB</Label>
          <Controller
            name="standardisation_and_pasteurisation.cob"
            control={control}
            render={({ field }) => (
              <div className="mt-1">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mr-2"
                />
                <span className="text-sm">COB Present</span>
              </div>
            )}
          />
        </div>
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.fat">Fat (%)</Label>
          <Controller
            name="standardisation_and_pasteurisation.fat"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.ci_si">CI/SI</Label>
          <Controller
            name="standardisation_and_pasteurisation.ci_si"
            control={control}
            render={({ field }) => (
              <Input {...field} className="mt-1" />
            )}
          />
        </div>
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.lr_snf">LR/SNF</Label>
          <Controller
            name="standardisation_and_pasteurisation.lr_snf"
            control={control}
            render={({ field }) => (
              <Input {...field} className="mt-1" />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.acidity">Acidity</Label>
          <Controller
            name="standardisation_and_pasteurisation.acidity"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="standardisation_and_pasteurisation.analyst">Analyst</Label>
          <Controller
            name="standardisation_and_pasteurisation.analyst"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                  description: `${user.department} • ${user.email}`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleUserSearch}
                placeholder="Search and select analyst"
                searchPlaceholder="Search users..."
                emptyMessage="No users found"
                loading={loadingUsers}
              />
            )}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="standardisation_and_pasteurisation.remarks">Remarks</Label>
        <Controller
          name="standardisation_and_pasteurisation.remarks"
          control={control}
          render={({ field }) => (
            <Input {...field} className="mt-1" />
          )}
        />
      </div>
    </div>
  )
}

// Step 5: UHT Steri Milk Component
function Step5UHTSteriMilk({ 
  control,
  users,
  loadingUsers 
}: { 
  control: any
  users: UserEntity[]
  loadingUsers: boolean
}) {
  const handleUserSearch = async (query: string) => {
    if (!query.trim()) return []
    try {
      const usersResponse = await usersApi.getUsers({ filters: { search: query } })
      return (usersResponse.data || []).map(user => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`.trim() || user.email,
        description: `${user.department} • ${user.email}`
      }))
    } catch (error) {
      return []
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">UHT Steri Milk Parameters</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Controller
            name="uht_steri_milk.time"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                label="Time"
                showTime={true}
                placeholder="Select date and time"
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor="uht_steri_milk.batch">Batch</Label>
          <Controller
            name="uht_steri_milk.batch"
            control={control}
            render={({ field }) => (
              <Input {...field} disabled className="mt-1 bg-gray-50" />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="uht_steri_milk.temperature">Temperature (°C)</Label>
          <Controller
            name="uht_steri_milk.temperature"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="uht_steri_milk.ot">OT</Label>
          <Controller
            name="uht_steri_milk.ot"
            control={control}
            render={({ field }) => (
              <Input {...field} className="mt-1" />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="uht_steri_milk.alc">ALC</Label>
          <Controller
            name="uht_steri_milk.alc"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="uht_steri_milk.res">RES</Label>
          <Controller
            name="uht_steri_milk.res"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="uht_steri_milk.cob">COB</Label>
          <Controller
            name="uht_steri_milk.cob"
            control={control}
            render={({ field }) => (
              <div className="mt-1">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mr-2"
                />
                <span className="text-sm">COB Present</span>
              </div>
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="uht_steri_milk.ph">pH</Label>
          <Controller
            name="uht_steri_milk.ph"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="uht_steri_milk.fat">Fat (%)</Label>
          <Controller
            name="uht_steri_milk.fat"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="uht_steri_milk.lr_snf">LR/SNF</Label>
          <Controller
            name="uht_steri_milk.lr_snf"
            control={control}
            render={({ field }) => (
              <Input {...field} className="mt-1" />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="uht_steri_milk.ci_si">CI/SI</Label>
          <Controller
            name="uht_steri_milk.ci_si"
            control={control}
            render={({ field }) => (
              <Input {...field} className="mt-1" />
            )}
          />
        </div>
        <div>
          <Label htmlFor="uht_steri_milk.total_solids">Total Solids</Label>
          <Controller
            name="uht_steri_milk.total_solids"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="uht_steri_milk.acidity">Acidity</Label>
          <Controller
            name="uht_steri_milk.acidity"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="uht_steri_milk.coffee">Coffee</Label>
          <Controller
            name="uht_steri_milk.coffee"
            control={control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="uht_steri_milk.hydrogen_peroxide_or_turbidity">Hydrogen Peroxide/Turbidity</Label>
          <Controller
            name="uht_steri_milk.hydrogen_peroxide_or_turbidity"
            control={control}
            render={({ field }) => (
              <Input {...field} className="mt-1" />
            )}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="uht_steri_milk.coffee_remarks">Coffee Remarks</Label>
        <Controller
          name="uht_steri_milk.coffee_remarks"
          control={control}
          render={({ field }) => (
            <Input {...field} className="mt-1" />
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="uht_steri_milk.analyst">Analyst</Label>
          <Controller
            name="uht_steri_milk.analyst"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                  description: `${user.department} • ${user.email}`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleUserSearch}
                placeholder="Search and select analyst"
                searchPlaceholder="Search users..."
                emptyMessage="No users found"
                loading={loadingUsers}
              />
            )}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="uht_steri_milk.remarks">Remarks</Label>
        <Controller
          name="uht_steri_milk.remarks"
          control={control}
          render={({ field }) => (
            <Input {...field} className="mt-1" />
          )}
        />
      </div>
    </div>
  )
}

// Step 6: Review Component
function Step6Review({ 
  watch, 
  users, 
  tankers 
}: { 
  watch: any
  users: UserEntity[]
  tankers: Tanker[]
}) {
  const formData = watch()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Review & Submit</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Basic Information</h4>
        <p><strong>Issue Date:</strong> {formData.issue_date}</p>
        <p><strong>Date of Production:</strong> {formData.date_of_production}</p>
        <p><strong>Batch Number:</strong> {formData.batch_number}</p>
        <p><strong>Variety:</strong> {formData.variety}</p>
        <p><strong>Approved By:</strong> {
          users.find(user => user.id === formData.approved_by)?.first_name + ' ' +
          users.find(user => user.id === formData.approved_by)?.last_name ||
          formData.approved_by
        }</p>
        <p><strong>Approver Signature:</strong> {formData.approver_signature ? 'Captured' : 'Not captured'}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Raw Milk Silos</h4>
        <p><strong>Tanker:</strong> {
          tankers.find(tanker => tanker.id === formData.raw_milk_silos?.tank)?.reg_number ||
          formData.raw_milk_silos?.tank
        }</p>
        <p><strong>Time:</strong> {formData.raw_milk_silos?.time}</p>
        <p><strong>Temperature:</strong> {formData.raw_milk_silos?.temperature}°C</p>
        <p><strong>pH:</strong> {formData.raw_milk_silos?.ph}</p>
        <p><strong>Fat:</strong> {formData.raw_milk_silos?.fat}%</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Other Tests</h4>
        <p><strong>Sample Details:</strong> {formData.other_tests?.sample_details}</p>
        <p><strong>pH:</strong> {formData.other_tests?.ph}</p>
        <p><strong>TDS:</strong> {formData.other_tests?.tds}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Standardisation & Pasteurisation</h4>
        <p><strong>Tanker:</strong> {
          tankers.find(tanker => tanker.id === formData.standardisation_and_pasteurisation?.tank)?.reg_number ||
          formData.standardisation_and_pasteurisation?.tank
        }</p>
        <p><strong>Batch:</strong> {formData.standardisation_and_pasteurisation?.batch}</p>
        <p><strong>Time:</strong> {formData.standardisation_and_pasteurisation?.time}</p>
        <p><strong>Temperature:</strong> {formData.standardisation_and_pasteurisation?.temperature}°C</p>
        <p><strong>Phosphatase:</strong> {formData.standardisation_and_pasteurisation?.phosphatase}</p>
        <p><strong>Analyst:</strong> {
          users.find(user => user.id === formData.standardisation_and_pasteurisation?.analyst)?.first_name + ' ' +
          users.find(user => user.id === formData.standardisation_and_pasteurisation?.analyst)?.last_name ||
          formData.standardisation_and_pasteurisation?.analyst
        }</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">UHT Steri Milk</h4>
        <p><strong>Time:</strong> {formData.uht_steri_milk?.time}</p>
        <p><strong>Batch:</strong> {formData.uht_steri_milk?.batch}</p>
        <p><strong>Temperature:</strong> {formData.uht_steri_milk?.temperature}°C</p>
        <p><strong>Total Solids:</strong> {formData.uht_steri_milk?.total_solids}</p>
        <p><strong>Analyst:</strong> {
          users.find(user => user.id === formData.uht_steri_milk?.analyst)?.first_name + ' ' +
          users.find(user => user.id === formData.uht_steri_milk?.analyst)?.last_name ||
          formData.uht_steri_milk?.analyst
        }</p>
      </div>
    </div>
  )
}

export function SteriMilkTestReportFormDrawer({
  open,
  onOpenChange,
  processLogId,
  onSuccess
}: SteriMilkTestReportFormDrawerProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserEntity[]>([])
  const [tankers, setTankers] = useState<Tanker[]>([])
  const [loadingTankers, setLoadingTankers] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  const form = useForm<TestReportFormData>({
    resolver: yupResolver(testReportSchema) as any,
    mode: 'onChange',
    defaultValues: {
      issue_date: new Date().toISOString().split('T')[0],
      approved_by: "",
      approver_signature: "",
      date_of_production: new Date().toISOString().split('T')[0],
      batch_number: 0,
      variety: "Steri milk",
      raw_milk_silos: {
        tank: "",
        time: "",
        temperature: 0,
        alcohol: 0,
        res: 0,
        cob: false,
        ph: 0,
        fat: 0,
        lr_snf: "",
        acidity: 0,
        remarks: ""
      },
      other_tests: {
        sample_details: "",
        ph: 0,
        caustic: 0,
        acid: 0,
        chlorine: 0,
        hd: 0,
        tds: 0,
        hydrogen_peroxide: 0,
        remarks: ""
      },
      standardisation_and_pasteurisation: {
        tank: "",
        batch: 0,
        time: "",
        temperature: 0,
        ot: "",
        alcohol: 0,
        phosphatase: "",
        ph: 0,
        cob: false,
        fat: 0,
        ci_si: "",
        lr_snf: "",
        acidity: 0,
        analyst: "",
        remarks: ""
      },
      uht_steri_milk: {
        time: "",
        batch: "",
        temperature: 0,
        ot: "",
        alc: 0,
        res: 0,
        cob: false,
        ph: 0,
        fat: 0,
        lr_snf: "",
        ci_si: "",
        total_solids: 0,
        acidity: 0,
        coffee: 0,
        coffee_remarks: "",
        hydrogen_peroxide_or_turbidity: "",
        analyst: "",
        remarks: ""
      }
    }
  })

  const { control, handleSubmit, formState: { errors }, watch, setValue, reset } = form

  // Fetch users and tankers when drawer opens
  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      setLoadingUsers(true)
      setLoadingTankers(true)

      try {
        const [usersResponse, tankersResponse] = await Promise.all([
          usersApi.getUsers(),
          tankerApi.getAll()
        ])
        setUsers(usersResponse.data || [])
        setTankers(tankersResponse.data || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load form data')
      } finally {
        setLoadingUsers(false)
        setLoadingTankers(false)
      }
    }

    loadData()
  }, [open])

  // Fetch process log and prefill data
  useEffect(() => {
    if (!open || !processLogId) return

    const loadProcessLog = async () => {
      try {
        const processLogResponse = await steriMilkProcessLogApi.getLog(processLogId)
        if (processLogResponse) {
          const batchNumber = (processLogResponse as any).batch_id?.batch_number || 1001
          setValue('batch_number', batchNumber)
          setValue('date_of_production', (processLogResponse as any).batch_id?.created_at ?
            new Date((processLogResponse as any).batch_id.created_at).toISOString().split('T')[0] :
            new Date().toISOString().split('T')[0])
          setValue('standardisation_and_pasteurisation.batch', batchNumber)
          setValue('uht_steri_milk.batch', String(batchNumber))
        }
      } catch (error) {
        console.error('Failed to fetch process log:', error)
        toast.error('Failed to load batch data')
      }
    }

    loadProcessLog()
  }, [open, processLogId, setValue])

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit: SubmitHandler<TestReportFormData> = async (data) => {
    try {
      setLoading(true)

      console.log('Steri Milk Test Report Form Data:', data)

      const normalizedSignature = normalizeDataUrlToBase64(data.approver_signature)

      const payload: CreateSteriMilkTestReportRequest = {
        issue_date: data.issue_date,
        approved_by: data.approved_by,
        approver_signature: normalizedSignature,
        date_of_production: data.date_of_production,
        batch_number: data.batch_number,
        variety: data.variety,
        raw_milk_silos: [data.raw_milk_silos],
        other_tests: [data.other_tests],
        standardisation_and_pasteurisation: [data.standardisation_and_pasteurisation],
        uht_steri_milk: [data.uht_steri_milk]
      }

      console.log('Steri Milk Test Report Payload:', payload)

      await steriMilkTestReportApi.createTestReport(payload)
      toast.success('Steri Milk Test Report created successfully')

      reset()
      setCurrentStep(1)
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error creating test report:', error)
      toast.error(error?.message || 'Failed to create test report')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            control={control}
            errors={errors}
            users={users}
            loadingUsers={loadingUsers}
            watch={watch}
            setValue={setValue}
          />
        )
      case 2:
        return (
          <Step2RawMilkSilos
            control={control}
            tankers={tankers}
            loadingTankers={loadingTankers}
          />
        )
      case 3:
        return <Step3OtherTests control={control} />
      case 4:
        return (
          <Step4StandardisationPasteurisation
            control={control}
            tankers={tankers}
            loadingTankers={loadingTankers}
            users={users}
            loadingUsers={loadingUsers}
          />
        )
      case 5:
        return (
          <Step5UHTSteriMilk
            control={control}
            users={users}
            loadingUsers={loadingUsers}
          />
        )
      case 6:
        return (
          <Step6Review
            watch={watch}
            users={users}
            tankers={tankers}
          />
        )
      default:
        return null
    }
  }
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue_date">Issue Date</Label>
                <Controller
                  name="issue_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select issue date"
                    />
                  )}
                />
                {errors.issue_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.issue_date.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="date_of_production">Date of Production</Label>
                <Controller
                  name="date_of_production"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className="mt-1 bg-gray-50"
                      disabled
                    />
                  )}
                />
                {errors.date_of_production && (
                  <p className="text-red-500 text-sm mt-1">{errors.date_of_production.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batch_number">Batch Number</Label>
                <Controller
                  name="batch_number"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      className="mt-1 bg-gray-50"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      disabled
                    />
                  )}
                />
                {errors.batch_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.batch_number.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="variety">Variety</Label>
                <Controller
                  name="variety"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="mt-1"
                    />
                  )}
                />
                {errors.variety && (
                  <p className="text-red-500 text-sm mt-1">{errors.variety.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approved_by">Approved By</Label>
                <Controller
                  name="approved_by"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={users.map(user => ({
                        value: user.id,
                        label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                        description: `${user.department} • ${user.email}`
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearch={handleUserSearch}
                      placeholder="Search and select approver"
                      searchPlaceholder="Search users..."
                      emptyMessage="No users found"
                      loading={loadingUsers}
                    />
                  )}
                />
                {errors.approved_by && (
                  <p className="text-red-500 text-sm mt-1">{errors.approved_by.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="approver_signature">Approver Signature</Label>
                <Controller
                  name="approver_signature"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {field.value ? (
                        <img src={base64ToPngDataUrl(field.value)} alt="Approver signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                      ) : (
                        <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                          No signature captured
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSignatureOpen(true)}>
                          Add Signature
                        </Button>
                        {field.value && (
                          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSignatureViewOpen(true)}>
                            View Signature
                          </Button>
                        )}
                        {field.value && (
                          <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => field.onChange("")}>Clear</Button>
                        )}
                      </div>
                    </div>
                  )}
                />
                {errors.approver_signature && (
                  <p className="text-red-500 text-sm mt-1">{errors.approver_signature.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Raw Milk Silos Test Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="raw_milk_silos.tank">Tank</Label>
                <Controller
                  name="raw_milk_silos.tank"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={tankers.map(tanker => ({
                        value: tanker.id,
                        label: `${tanker.reg_number} (${tanker.condition})`,
                        description: `${tanker.capacity}L capacity • ${tanker.age} years old`
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearch={handleTankerSearch}
                      placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}
                      searchPlaceholder="Search tankers..."
                      emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}
                      loading={loadingTankers}
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  name="raw_milk_silos.time"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      label="Time"
                      showTime={true}
                      placeholder="Select date and time"
                    />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="raw_milk_silos.temperature">Temperature (°C)</Label>
                <Controller
                  name="raw_milk_silos.temperature"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="raw_milk_silos.alcohol">Alcohol (%)</Label>
                <Controller
                  name="raw_milk_silos.alcohol"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="raw_milk_silos.res">RES</Label>
                <Controller
                  name="raw_milk_silos.res"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="raw_milk_silos.cob">COB</Label>
                <Controller
                  name="raw_milk_silos.cob"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="raw_milk_silos.ph">pH</Label>
                <Controller
                  name="raw_milk_silos.ph"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="raw_milk_silos.fat">Fat (%)</Label>
                <Controller
                  name="raw_milk_silos.fat"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="raw_milk_silos.lr_snf">LR/SNF</Label>
                <Controller
                  name="raw_milk_silos.lr_snf"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="mt-1" />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="raw_milk_silos.acidity">Acidity</Label>
                <Controller
                  name="raw_milk_silos.acidity"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="raw_milk_silos.remarks">Remarks</Label>
              <Controller
                name="raw_milk_silos.remarks"
                control={control}
                render={({ field }) => (
                  <Input {...field} className="mt-1" />
                )}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Other Tests Parameters</h3>
            <div>
              <Label htmlFor="other_tests.sample_details">Sample Details</Label>
              <Controller
                name="other_tests.sample_details"
                control={control}
                render={({ field }) => (
                  <Input {...field} className="mt-1" />
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="other_tests.ph">pH</Label>
                <Controller
                  name="other_tests.ph"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="other_tests.caustic">Caustic</Label>
                <Controller
                  name="other_tests.caustic"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="other_tests.acid">Acid</Label>
                <Controller
                  name="other_tests.acid"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="other_tests.chlorine">Chlorine</Label>
                <Controller
                  name="other_tests.chlorine"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="other_tests.hd">HD</Label>
                <Controller
                  name="other_tests.hd"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="other_tests.tds">TDS</Label>
                <Controller
                  name="other_tests.tds"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="other_tests.hydrogen_peroxide">Hydrogen Peroxide</Label>
              <Controller
                name="other_tests.hydrogen_peroxide"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" step="0.01" className="mt-1" />
                )}
              />
            </div>
            <div>
              <Label htmlFor="other_tests.remarks">Remarks</Label>
              <Controller
                name="other_tests.remarks"
                control={control}
                render={({ field }) => (
                  <Input {...field} className="mt-1" />
                )}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Standardisation & Pasteurisation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.tank">Tank</Label>
                <Controller
                  name="standardisation_and_pasteurisation.tank"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={tankers.map(tanker => ({
                        value: tanker.id,
                        label: `${tanker.reg_number} (${tanker.condition})`,
                        description: `${tanker.capacity}L capacity • ${tanker.age} years old`
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearch={handleTankerSearch}
                      placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}
                      searchPlaceholder="Search tankers..."
                      emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}
                      loading={loadingTankers}
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.batch">Batch</Label>
                <Controller
                  name="standardisation_and_pasteurisation.batch"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} disabled className="mt-1 bg-gray-50" />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Controller
                  name="standardisation_and_pasteurisation.time"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      label="Time"
                      showTime={true}
                      placeholder="Select date and time"
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.temperature">Temperature (°C)</Label>
                <Controller
                  name="standardisation_and_pasteurisation.temperature"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.ot">OT</Label>
                <Controller
                  name="standardisation_and_pasteurisation.ot"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="mt-1" />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.alcohol">Alcohol (%)</Label>
                <Controller
                  name="standardisation_and_pasteurisation.alcohol"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.phosphatase">Phosphatase</Label>
                <Controller
                  name="standardisation_and_pasteurisation.phosphatase"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="mt-1" />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.ph">pH</Label>
                <Controller
                  name="standardisation_and_pasteurisation.ph"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.cob">COB</Label>
                <Controller
                  name="standardisation_and_pasteurisation.cob"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mr-2"
                      />
                      <span className="text-sm">COB Present</span>
                    </div>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.fat">Fat (%)</Label>
                <Controller
                  name="standardisation_and_pasteurisation.fat"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.ci_si">CI/SI</Label>
                <Controller
                  name="standardisation_and_pasteurisation.ci_si"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="mt-1" />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.lr_snf">LR/SNF</Label>
                <Controller
                  name="standardisation_and_pasteurisation.lr_snf"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="mt-1" />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="standardisation_and_pasteurisation.acidity">Acidity</Label>
                <Controller
                  name="standardisation_and_pasteurisation.acidity"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Controller
                  name="standardisation_and_pasteurisation.analyst"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={users.map(user => ({
                        value: user.id,
                        label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                        description: `${user.department} • ${user.email}`
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearch={handleUserSearch}
                      placeholder="Search and select analyst"
                      searchPlaceholder="Search users..."
                      emptyMessage="No users found"
                      loading={loadingUsers}
                    />
                  )}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="standardisation_and_pasteurisation.remarks">Remarks</Label>
              <Controller
                name="standardisation_and_pasteurisation.remarks"
                control={control}
                render={({ field }) => (
                  <Input {...field} className="mt-1" />
                )}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">UHT Steri Milk Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Controller
                  name="uht_steri_milk.time"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      label="Time"
                      showTime={true}
                      placeholder="Select date and time"
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="uht_steri_milk.batch">Batch</Label>
                <Controller
                  name="uht_steri_milk.batch"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} disabled className="mt-1 bg-gray-50" />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uht_steri_milk.temperature">Temperature (°C)</Label>
                <Controller
                  name="uht_steri_milk.temperature"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="uht_steri_milk.ot">OT</Label>
                <Controller
                  name="uht_steri_milk.ot"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="mt-1" />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="uht_steri_milk.alc">ALC</Label>
                <Controller
                  name="uht_steri_milk.alc"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="uht_steri_milk.res">RES</Label>
                <Controller
                  name="uht_steri_milk.res"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="uht_steri_milk.cob">COB</Label>
                <Controller
                  name="uht_steri_milk.cob"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mr-2"
                      />
                      <span className="text-sm">COB Present</span>
                    </div>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="uht_steri_milk.ph">pH</Label>
                <Controller
                  name="uht_steri_milk.ph"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="uht_steri_milk.fat">Fat (%)</Label>
                <Controller
                  name="uht_steri_milk.fat"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="uht_steri_milk.lr_snf">LR/SNF</Label>
                <Controller
                  name="uht_steri_milk.lr_snf"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="mt-1" />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="uht_steri_milk.ci_si">CI/SI</Label>
                <Controller
                  name="uht_steri_milk.ci_si"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="mt-1" />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="uht_steri_milk.total_solids">Total Solids</Label>
                <Controller
                  name="uht_steri_milk.total_solids"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="uht_steri_milk.acidity">Acidity</Label>
                <Controller
                  name="uht_steri_milk.acidity"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uht_steri_milk.coffee">Coffee</Label>
                <Controller
                  name="uht_steri_milk.coffee"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Coffee Present</span>
                    </div>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="uht_steri_milk.hydrogen_peroxide_or_turbidity">Hydrogen Peroxide/Turbidity</Label>
                <Controller
                  name="uht_steri_milk.hydrogen_peroxide_or_turbidity"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="mt-1" />
                  )}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="uht_steri_milk.coffee_remarks">Coffee Remarks</Label>
              <Controller
                name="uht_steri_milk.coffee_remarks"
                control={control}
                render={({ field }) => (
                  <Input {...field} className="mt-1" />
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Controller
                  name="uht_steri_milk.analyst"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={users.map(user => ({
                        value: user.id,
                        label: `${user.first_name} ${user.last_name}`.trim() || user.email,
                        description: `${user.department} • ${user.email}`
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSearch={handleUserSearch}
                      placeholder="Search and select analyst"
                      searchPlaceholder="Search users..."
                      emptyMessage="No users found"
                      loading={loadingUsers}
                    />
                  )}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="uht_steri_milk.remarks">Remarks</Label>
              <Controller
                name="uht_steri_milk.remarks"
                control={control}
                render={({ field }) => (
                  <Input {...field} className="mt-1" />
                )}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review & Submit</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Basic Information</h4>
              <p><strong>Issue Date:</strong> {watch('issue_date')}</p>
              <p><strong>Date of Production:</strong> {watch('date_of_production')}</p>
              <p><strong>Batch Number:</strong> {watch('batch_number')}</p>
              <p><strong>Variety:</strong> {watch('variety')}</p>
              <p><strong>Approved By:</strong> {
                users.find(user => user.id === watch('approved_by'))?.first_name + ' ' +
                users.find(user => user.id === watch('approved_by'))?.last_name ||
                watch('approved_by')
              }</p>
              <p><strong>Approver Signature:</strong> {watch('approver_signature')}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Raw Milk Silos</h4>
              <p><strong>Tanker:</strong> {
                tankers.find(tanker => tanker.id === watch('raw_milk_silos.tank'))?.reg_number ||
                watch('raw_milk_silos.tank')
              }</p>
              <p><strong>Time:</strong> {watch('raw_milk_silos.time')}</p>
              <p><strong>Temperature:</strong> {watch('raw_milk_silos.temperature')}°C</p>
              <p><strong>pH:</strong> {watch('raw_milk_silos.ph')}</p>
              <p><strong>Fat:</strong> {watch('raw_milk_silos.fat')}%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Other Tests</h4>
              <p><strong>Sample Details:</strong> {watch('other_tests.sample_details')}</p>
              <p><strong>pH:</strong> {watch('other_tests.ph')}</p>
              <p><strong>TDS:</strong> {watch('other_tests.tds')}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Standardisation & Pasteurisation</h4>
              <p><strong>Tanker:</strong> {
                tankers.find(tanker => tanker.id === watch('standardisation_and_pasteurisation.tank'))?.reg_number ||
                watch('standardisation_and_pasteurisation.tank')
              }</p>
              <p><strong>Batch:</strong> {watch('standardisation_and_pasteurisation.batch')}</p>
              <p><strong>Time:</strong> {watch('standardisation_and_pasteurisation.time')}</p>
              <p><strong>Temperature:</strong> {watch('standardisation_and_pasteurisation.temperature')}°C</p>
              <p><strong>Phosphatase:</strong> {watch('standardisation_and_pasteurisation.phosphatase')}</p>
              <p><strong>Analyst:</strong> {
                users.find(user => user.id === watch('standardisation_and_pasteurisation.analyst'))?.first_name + ' ' +
                users.find(user => user.id === watch('standardisation_and_pasteurisation.analyst'))?.last_name ||
                watch('standardisation_and_pasteurisation.analyst')
              }</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">UHT Steri Milk</h4>
              <p><strong>Time:</strong> {watch('uht_steri_milk.time')}</p>
              <p><strong>Batch:</strong> {watch('uht_steri_milk.batch')}</p>
              <p><strong>Temperature:</strong> {watch('uht_steri_milk.temperature')}°C</p>
              <p><strong>Total Solids:</strong> {watch('uht_steri_milk.total_solids')}</p>
              <p><strong>Analyst:</strong> {
                users.find(user => user.id === watch('uht_steri_milk.analyst'))?.first_name + ' ' +
                users.find(user => user.id === watch('uht_steri_milk.analyst'))?.last_name ||
                watch('uht_steri_milk.analyst')
              }</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="tablet-sheet-full overflow-y-auto p-6 bg-white">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5" />
              Create Steri Milk Test Report
            </SheetTitle>
            <SheetDescription>
              Complete the test report with all required parameters
            </SheetDescription>
          </SheetHeader>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium">{steps[currentStep - 1].title}</h3>
              <p className="text-xs text-gray-500">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {loadingData ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">Loading form data...</p>
                </div>
              </div>
            ) : (
              renderStepContent()
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <LoadingButton
                  type="submit"
                  loading={loading}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mixing & Pasteurizing Test
                </LoadingButton>
              )}
            </div>
          </form>
        </SheetContent>
      </Sheet>

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
        value={watch("approver_signature")}
      />
    </>
  )
}
