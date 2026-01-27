"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { Beaker } from "lucide-react"
import { labTestPostProcessApi, type CreateLabTestPostProcessRequest } from "@/lib/api/lab-test-post-process"
import { usersApi, type UserEntity } from "@/lib/api/users"
import { steriMilkProcessLogApi } from "@/lib/api/steri-milk-process-log"
import { toast } from "sonner"
import { LoadingButton } from "@/components/ui/loading-button"

const schema = yup.object({
  scientist_id: yup.string().required("Scientist is required"),
  batch_number: yup.number().required("Batch number is required"),
  time: yup.string().required("Time is required"),
  temperature: yup.number().required("Temperature is required"),
  alcohol: yup.number().required("Alcohol is required"),
  phosphatase: yup.number().required("Phosphatase is required"),
  res: yup.number().min(1, "RES must be at least 1").max(6, "RES must be at most 6").required("RES is required"),
  cob: yup.boolean().required("COB is required"),
  ph: yup.number().required("pH is required"),
  ci_si: yup.string().required("CI/SI is required"),
  lr_snf: yup.string().required("LR/SNF is required"),
  acidity: yup.number().required("Acidity is required"),
  coffee: yup.string().required("Coffee is required"),
  turbidity: yup.boolean().required("Turbidity is required"),
  remarks: yup.string().required("Remarks are required"),
})

type FormData = yup.InferType<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  batchNumber?: number
  processLogId?: string
}

export function SteriMilkPostTestFormDrawer({ open, onOpenChange, batchNumber, processLogId }: Props) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserEntity[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      scientist_id: "",
      batch_number: batchNumber ?? undefined,
      time: "",
      temperature: undefined,
      alcohol: undefined,
      phosphatase: undefined,
      res: undefined,
      cob: false,
      ph: undefined,
      ci_si: "",
      lr_snf: "",
      acidity: undefined,
      coffee: "",
      turbidity: false,
      remarks: "",
    }
  })

  useEffect(() => {
    if (!open) return
    // Prefill batch number like Test Report: prefer process log fetch, fallback to prop
    const prefill = async () => {
      let derivedBatch = batchNumber ?? 0
      if (processLogId) {
        try {
          const resp = await steriMilkProcessLogApi.getLog(processLogId)
          const bn = (resp.data as any)?.batch_id?.batch_number
          if (typeof bn === 'number') {
            derivedBatch = bn
          } else if (typeof bn === 'string' && bn.trim() !== '') {
            const parsed = Number(bn)
            if (!Number.isNaN(parsed)) derivedBatch = parsed
          }
        } catch (_) {
          // ignore and fallback
        }
      }
      setValue("batch_number", derivedBatch, { shouldValidate: true, shouldDirty: true })
    }
    prefill()
    const loadUsers = async () => {
      try {
        setLoadingUsers(true)
        const { data } = await usersApi.getUsers()
        setUsers(data || [])
      } finally {
        setLoadingUsers(false)
      }
    }
    loadUsers()
  }, [open, batchNumber, processLogId, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      const payload: CreateLabTestPostProcessRequest = { ...data }
      await labTestPostProcessApi.create(payload)
      toast.success("Post-process lab test saved")
      onOpenChange(false)
    } catch (err) {
      toast.error("Failed to save post-process lab test")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-6 bg-white overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5" />
            Create Post-Process Lab Test
          </SheetTitle>
          <SheetDescription>
            Capture post-process parameters for this batch
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Scientist</Label>
              <Controller
                name="scientist_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={users.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}`.trim() || u.email, description: `${u.department} • ${u.email}` }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    onSearch={async (q) => {
                      const { data } = await usersApi.getUsers({ filters: { search: q } })
                      return (data || []).map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}`.trim() || u.email, description: `${u.department} • ${u.email}` }))
                    }}
                    placeholder="Search and select scientist"
                    loading={loadingUsers}
                  />
                )}
              />
              {errors.scientist_id && <p className="text-sm text-red-500">{errors.scientist_id.message}</p>}
            </div>
            <div>
              <Label>Batch Number</Label>
              <Controller
                name="batch_number"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" disabled className="bg-gray-50" />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <DatePicker label="Time" value={field.value} onChange={field.onChange} showTime={true} placeholder="Select time" />
                )}
              />
              {errors.time && <p className="text-sm text-red-500">{errors.time.message}</p>}
            </div>
            <div>
              <Label>Temperature (°C)</Label>
              <Controller name="temperature" control={control} render={({ field }) => (
                <Input {...field} type="number" step="0.1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
              )} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Alcohol</Label>
              <Controller name="alcohol" control={control} render={({ field }) => (
                <Input {...field} type="number" step="0.1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
              )} />
            </div>
            <div>
              <Label>Phosphatase</Label>
              <Controller name="phosphatase" control={control} render={({ field }) => (
                <Input {...field} type="number" step="0.1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
              )} />
            </div>
            <div>
              <Label>RES (1-6)</Label>
              <Controller name="res" control={control} render={({ field }) => (
                <Input {...field} type="number" min="1" max="6" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
              )} />
              {errors.res && <p className="text-sm text-red-500">{errors.res.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>COB</Label>
              <Controller name="cob" control={control} render={({ field }) => (
                <div className="mt-2"><input type="checkbox" checked={field.value} onChange={field.onChange} /></div>
              )} />
            </div>
            <div>
              <Label>pH</Label>
              <Controller name="ph" control={control} render={({ field }) => (
                <Input {...field} type="number" step="0.1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
              )} />
            </div>
            <div>
              <Label>CI/SI</Label>
              <Controller name="ci_si" control={control} render={({ field }) => (
                <Input {...field} />
              )} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>LR/SNF</Label>
              <Controller name="lr_snf" control={control} render={({ field }) => (
                <Input {...field} />
              )} />
            </div>
            <div>
              <Label>Acidity</Label>
              <Controller name="acidity" control={control} render={({ field }) => (
                <Input {...field} type="number" step="0.1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
              )} />
            </div>
            <div>
              <Label>Coffee</Label>
              <Controller name="coffee" control={control} render={({ field }) => (
                <Input {...field} />
              )} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Turbidity</Label>
              <Controller name="turbidity" control={control} render={({ field }) => (
                <div className="mt-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mr-2"
                  />
                  <span className="text-sm">Turbidity Present</span>
                </div>
              )} />
            </div>
            <div>
              <Label>Remarks</Label>
              <Controller name="remarks" control={control} render={({ field }) => (
                <Input {...field} />
              )} />
            </div>
          </div>

          <div className="flex justify-end">
            <LoadingButton type="submit" loading={loading}>Save Post Test</LoadingButton>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


