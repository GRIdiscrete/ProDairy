"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
  createSteriMilkProcessLog,
  updateSteriMilkProcessLog,
  fetchSteriMilkProcessLogs
} from "@/lib/store/slices/steriMilkProcessLogSlice"
import { usersApi } from "@/lib/api/users"
import { rolesApi } from "@/lib/api/roles"
import { filmaticLinesForm1Api } from "@/lib/api/filmatic-lines-form-1"
import { toast } from "sonner"
import { SteriMilkProcessLog } from "@/lib/api/steri-milk-process-log"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BasicInfoStep } from "./steri-milk-log/basic-info-step"
import { ProcessDetailsStep } from "./steri-milk-log/process-details-step"
import { ProcessOverview } from "./steri-milk-log/process-overview"
import type { BasicInfoFormData, ProcessDetailsFormData } from "./steri-milk-log/types"

interface SteriMilkProcessLogDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log?: SteriMilkProcessLog | null
  mode?: "create" | "edit"
  processId: string
}

export function SteriMilkProcessLogDrawer({
  open,
  onOpenChange,
  log,
  mode = "create",
  processId
}: SteriMilkProcessLogDrawerProps) {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.steriMilkProcessLog)

  const [currentStep, setCurrentStep] = useState(1)
  const [users, setUsers] = useState<any[]>([])
  const [userRoles, setUserRoles] = useState<any[]>([])
  const [filmaticForms, setFilmaticForms] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingUserRoles, setLoadingUserRoles] = useState(false)
  const [loadingFilmaticForms, setLoadingFilmaticForms] = useState(false)

  const basicInfoForm = useForm<BasicInfoFormData>({
    defaultValues: {
      approved: true,
      approver_id: "",
      filmatic_form_id: "",
      batch_number: "",
      date: ""
    },
  })

  const processDetailsForm = useForm<ProcessDetailsFormData>({
    defaultValues: {
      filling_start_details: { time: "", temperature: "", pressure: "" },
      autoclave_start_details: { time: "", temperature: "", pressure: "" },
      heating_start_details: { time: "", temperature: "", pressure: "" },
      heating_finish_details: { time: "", temperature: "", pressure: "" },
      sterilization_start_details: { time: "", temperature: "", pressure: "" },
      sterilization_after_5_details: { time: "", temperature: "", pressure: "" },
      sterilization_finish_details: { time: "", temperature: "", pressure: "" },
      pre_cooling_start_details: { time: "", temperature: "", pressure: "" },
      pre_cooling_finish_details: { time: "", temperature: "", pressure: "" },
      cooling_1_start_details: { time: "", temperature: "", pressure: "" },
      cooling_1_finish_details: { time: "", temperature: "", pressure: "" },
      cooling_2_start_details: { time: "", temperature: "", pressure: "" },
      cooling_2_finish_details: { time: "", temperature: "", pressure: "" },
    },
  })

  // Add watch for auto-prefill functionality
  const watchAllFields = processDetailsForm.watch()

  // Helper function to check if a field has meaningful value
  const hasValue = (val: string | undefined | null): boolean => {
    return val !== undefined && val !== null && val !== ""
  }

  // Helper function to auto-fill next step fields
  const autoFillNextStep = (sourceField: string, targetField: string) => {
    const [sourceSection, sourceKey] = sourceField.split('.') as [keyof ProcessDetailsFormData, 'time' | 'temperature' | 'pressure']
    const [targetSection, targetKey] = targetField.split('.') as [keyof ProcessDetailsFormData, 'time' | 'temperature' | 'pressure']

    const sourceValue = watchAllFields[sourceSection]?.[sourceKey]
    const targetValue = watchAllFields[targetSection]?.[targetKey]

    if (hasValue(sourceValue) && !hasValue(targetValue)) {
      processDetailsForm.setValue(targetField as any, sourceValue, { shouldValidate: false, shouldDirty: false })
    }
  }

  // Auto-prefill: Heating Finish -> Sterilization Start (trigger on blur/change)
  useEffect(() => {
    const subscription = processDetailsForm.watch((value, { name }) => {
      // Only trigger when heating_finish fields are updated
      if (name?.startsWith('heating_finish_details')) {
        setTimeout(() => {
          autoFillNextStep('heating_finish_details.time', 'sterilization_start_details.time')
          autoFillNextStep('heating_finish_details.temperature', 'sterilization_start_details.temperature')
          autoFillNextStep('heating_finish_details.pressure', 'sterilization_start_details.pressure')
        }, 300) // Small delay to ensure value is set
      }

      // Sterilization Finish -> Pre Cooling Start
      if (name?.startsWith('sterilization_finish_details')) {
        setTimeout(() => {
          autoFillNextStep('sterilization_finish_details.time', 'pre_cooling_start_details.time')
          autoFillNextStep('sterilization_finish_details.temperature', 'pre_cooling_start_details.temperature')
          autoFillNextStep('sterilization_finish_details.pressure', 'pre_cooling_start_details.pressure')
        }, 300)
      }

      // Pre Cooling Finish -> Cooling 1 Start
      if (name?.startsWith('pre_cooling_finish_details')) {
        setTimeout(() => {
          autoFillNextStep('pre_cooling_finish_details.time', 'cooling_1_start_details.time')
          autoFillNextStep('pre_cooling_finish_details.temperature', 'cooling_1_start_details.temperature')
          autoFillNextStep('pre_cooling_finish_details.pressure', 'cooling_1_start_details.pressure')
        }, 300)
      }

      // Cooling 1 Finish -> Cooling 2 Start
      if (name?.startsWith('cooling_1_finish_details')) {
        setTimeout(() => {
          autoFillNextStep('cooling_1_finish_details.time', 'cooling_2_start_details.time')
          autoFillNextStep('cooling_1_finish_details.temperature', 'cooling_2_start_details.temperature')
          autoFillNextStep('cooling_1_finish_details.pressure', 'cooling_2_start_details.pressure')
        }, 300)
      }
    })

    return () => subscription.unsubscribe()
  }, [watchAllFields])

  // Load users, user roles and filmatic forms on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingUsers(true)
      setLoadingUserRoles(true)
      setLoadingFilmaticForms(true)

      try {
        // Load users
        try {
          const usersResponse = await usersApi.getUsers()
          setUsers(usersResponse.data || [])
        } catch (userError) {

        }

        // Load user roles
        try {
          const rolesResponse = await rolesApi.getRoles()
          setUserRoles(rolesResponse.data || [])
        } catch (roleError) {

        }

        // Load Filmatic forms (Form 1 only)
        try {
          const form1Response = await filmaticLinesForm1Api.getForms()

          console.log('Form1 Response:', form1Response)

          const allForms = [
            ...(form1Response || []).map((form: any) => ({ ...form, type: 'Form 1' }))
          ]

          console.log('All Forms:', allForms)
          setFilmaticForms(allForms)
        } catch (formError) {
          console.error('Error loading Filmatic forms:', formError)

        }
      } catch (error) {
        console.warn("Form will work with fallback data")
      } finally {
        setLoadingUsers(false)
        setLoadingUserRoles(false)
        setLoadingFilmaticForms(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  // Reset forms when drawer opens/closes and prefill when editing
  useEffect(() => {
    if (!open) return

    if (mode === "edit" && log) {
      try {
        const batch = (log as any).batch_id || null

        basicInfoForm.reset({
          approved: !!log.approved,
          approver_id: log.approver_id || "",
          filmatic_form_id: log.filmatic_form_id || "",
          batch_number: batch?.batch_number ? String(batch.batch_number) : "",
          date: batch?.date ?? (log.created_at ? String(log.created_at).slice(0, 10) : "")
        })

        // Helper: normalize various time representations to "HH:mm" or empty string
        const normalizeTime = (val: any): string => {
          if (!val && val !== 0) return ""
          // If it's an object with .time or .timestamp
          if (typeof val === "object") {
            if (val.time) return normalizeTime(val.time)
            if (val.timestamp) return normalizeTime(val.timestamp)
            // if object looks like a Date
            if (val instanceof Date) return isNaN(val.getTime()) ? "" : val.toTimeString().slice(0, 5)
            // fallback to JSON/string
            try { return normalizeTime(String(val)) } catch { return "" }
          }
          // If it's a Date-like (has toISOString/toDate)
          if (val?.toDate && typeof val.toDate === "function") {
            const d = val.toDate()
            return isNaN(d.getTime()) ? "" : d.toTimeString().slice(0, 5)
          }
          // string handling: capture first occurrence of HH:MM
          if (typeof val === "string") {
            // look for HH:MM pattern
            const m = val.match(/(\d{1,2}:\d{2})/)
            if (m) {
              // ensure leading zero for hour if needed
              const parts = m[1].split(":")
              const hh = parts[0].padStart(2, "0")
              const mm = parts[1]
              return `${hh}:${mm}`
            }
            // fallback parse as Date
            const parsed = new Date(val)
            if (!isNaN(parsed.getTime())) return parsed.toTimeString().slice(0, 5)
            return ""
          }
          // number or other primitive: convert to string
          return String(val)
        }

        // Helper to prefer detail.time, then legacy time object/string on batch, otherwise ""
        const timeFrom = (detailObj: any, legacyField?: any) => {
          // prefer explicit detail object time if present
          if (detailObj) {
            // detailObj may be object with .time or a string
            const t = detailObj.time ?? detailObj
            const normalized = normalizeTime(t)
            if (normalized) return normalized
          }
          // legacyField may be object or string
          if (legacyField) {
            const normalizedLegacy = normalizeTime(legacyField)
            if (normalizedLegacy) return normalizedLegacy
          }
          return ""
        }

        // Helper to extract details preferring specific object or fallback
        const getDetailValues = (baseKey: string) => {
          // Check both "key_details" and "key"
          const detail = batch?.[`${baseKey}_details`] || batch?.[baseKey]

          return {
            time: normalizeTime(detail?.time ?? detail),
            temperature: detail?.temperature ? String(detail.temperature) : "",
            pressure: detail?.pressure ? String(detail.pressure) : ""
          }
        }

        // map time fields
        processDetailsForm.reset({
          filling_start_details: getDetailValues('filling_start'),
          autoclave_start_details: getDetailValues('autoclave_start'),
          heating_start_details: getDetailValues('heating_start'),
          heating_finish_details: getDetailValues('heating_finish'),
          sterilization_start_details: getDetailValues('sterilization_start'),
          sterilization_after_5_details: getDetailValues('sterilization_after_5'),
          sterilization_finish_details: getDetailValues('sterilization_finish'),
          pre_cooling_start_details: getDetailValues('pre_cooling_start'),
          pre_cooling_finish_details: getDetailValues('pre_cooling_finish'),
          cooling_1_start_details: getDetailValues('cooling_1_start'),
          cooling_1_finish_details: getDetailValues('cooling_1_finish'),
          cooling_2_start_details: getDetailValues('cooling_2_start'),
          cooling_2_finish_details: getDetailValues('cooling_2_finish')
        })

        // set UI to first step
        setCurrentStep(1)
      } catch (err) {
        console.error("Error populating edit form:", err)
        // fallback to defaults if anything goes wrong
        basicInfoForm.reset()
        processDetailsForm.reset()
        setCurrentStep(1)
      }
    } else {
      // create mode -> clear forms
      basicInfoForm.reset()
      processDetailsForm.reset()
      setCurrentStep(1)
    }
  }, [open, mode, log, basicInfoForm, processDetailsForm])

  const handleBasicInfoSubmit = async (data: BasicInfoFormData) => {
    setCurrentStep(2)
  }

  const handleProcessDetailsSubmit = async (data: any) => {
    try {
      const basicInfo = basicInfoForm.getValues()

      // Helper to parse string to float or return 0
      const parseFloat = (val: string | number | undefined | null): number => {
        if (val === "" || val === null || val === undefined) return 0
        const parsed = Number(val)
        return isNaN(parsed) ? 0 : parsed
      }

      // Helper: convert various time inputs into backend format "HH:mm:SS+ZZ" (e.g. "10:30:00+00")
      const convertTimeToBackend = (val: any): string | null => {
        if (val === "" || val === null || val === undefined) return null

        // unwrap objects with .time or .timestamp
        if (typeof val === "object") {
          if (val.time) return convertTimeToBackend(val.time)
          if (val.timestamp) return convertTimeToBackend(val.timestamp)
          if (val instanceof Date) {
            if (isNaN(val.getTime())) return null
            const hh = String(val.getHours()).padStart(2, "0")
            const mm = String(val.getMinutes()).padStart(2, "0")
            return `${hh}:${mm}:00+00`
          }
          try { val = String(val) } catch { return null }
        }

        if (val?.toDate && typeof val.toDate === "function") {
          const d = val.toDate()
          if (isNaN(d.getTime())) return null
          const hh = String(d.getHours()).padStart(2, "0")
          const mm = String(d.getMinutes()).padStart(2, "0")
          return `${hh}:${mm}:00+00`
        }

        if (typeof val === "string") {
          const tzMatch = val.match(/([+-]\d{2}(?::?\d{2})?|Z)$/)
          let tz = "+00"
          if (tzMatch) {
            tz = tzMatch[1] === "Z" ? "+00" : tzMatch[1].replace(":", "")
            if (/^[+-]\d{4}$/.test(tz)) tz = tz.slice(0, 3)
          }
          const timeMatch = val.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
          if (timeMatch) {
            const hh = timeMatch[1].padStart(2, "0")
            const mm = timeMatch[2]
            const ss = timeMatch[3] ?? "00"
            return `${hh}:${mm}:${ss}${tz}`
          }
          const parsed = new Date(val)
          if (!isNaN(parsed.getTime())) {
            const hh = String(parsed.getHours()).padStart(2, "0")
            const mm = String(parsed.getMinutes()).padStart(2, "0")
            return `${hh}:${mm}:00+00`
          }
          return null
        }

        try {
          const s = String(val)
          const m = s.match(/(\d{1,2}):(\d{2})/)
          if (m) return `${m[1].padStart(2, "0")}:${m[2]}:00+00`
        } catch { /* fallthrough */ }
        return null
      }

      // Helper to build detail object with IDs for update mode
      const buildDetailObject = (detailData: any, existingDetail: any) => {
        const detailObj: any = {
          time: convertTimeToBackend(detailData?.time),
          temperature: parseFloat(detailData?.temperature),
          pressure: parseFloat(detailData?.pressure)
        }

        // On update, include the ID if it exists
        if (mode === "edit" && existingDetail?.id) {
          detailObj.id = existingDetail.id
        }

        return detailObj
      }

      // Get existing batch data for update mode
      const existingBatch = mode === "edit" && log ? (log as any).batch_id : null

      // Build payload that matches your API examples: no simple process times, only details
      const formData: any = {
        approved: basicInfo.approved || false,
        approver_id: basicInfo.approver_id || "",
        filmatic_form_id: basicInfo.filmatic_form_id || null,
        batch: {
          // date should be YYYY-MM-DD or null
          date: basicInfo.date ? basicInfo.date : null,
          batch_number: basicInfo.batch_number || "", // Keep as string — alphanumeric batch numbers supported
          // only include *_details objects (formatted times)
          filling_start_details: buildDetailObject(
            data.filling_start_details,
            existingBatch?.filling_start
          ),
          autoclave_start_details: buildDetailObject(
            data.autoclave_start_details,
            existingBatch?.autoclave_start
          ),
          heating_start_details: buildDetailObject(
            data.heating_start_details,
            existingBatch?.heating_start
          ),
          heating_finish_details: buildDetailObject(
            data.heating_finish_details,
            existingBatch?.heating_finish
          ),
          sterilization_start_details: buildDetailObject(
            data.sterilization_start_details,
            existingBatch?.sterilization_start
          ),
          sterilization_after_5_details: buildDetailObject(
            data.sterilization_after_5_details,
            existingBatch?.sterilization_after_5
          ),
          sterilization_finish_details: buildDetailObject(
            data.sterilization_finish_details,
            existingBatch?.sterilization_finish
          ),
          pre_cooling_start_details: buildDetailObject(
            data.pre_cooling_start_details,
            existingBatch?.pre_cooling_start
          ),
          pre_cooling_finish_details: buildDetailObject(
            data.pre_cooling_finish_details,
            existingBatch?.pre_cooling_finish
          ),
          cooling_1_start_details: buildDetailObject(
            data.cooling_1_start_details,
            existingBatch?.cooling_1_start
          ),
          cooling_1_finish_details: buildDetailObject(
            data.cooling_1_finish_details,
            existingBatch?.cooling_1_finish
          ),
          cooling_2_start_details: buildDetailObject(
            data.cooling_2_start_details,
            existingBatch?.cooling_2_start
          ),
          cooling_2_finish_details: buildDetailObject(
            data.cooling_2_finish_details,
            existingBatch?.cooling_2_finish
          )
        }
      }

      if (mode === "edit" && log?.id) {
        // update payload must include top-level id and batch.id per your example
        const batchId = log?.batch_id?.id || ""
        await dispatch(updateSteriMilkProcessLog({
          id: log.id,
          data: {
            id: log.id,
            approved: formData.approved,
            approver_id: formData.approver_id,
            filmatic_form_id: formData.filmatic_form_id || null,
            batch: { id: batchId, ...formData.batch }
          }
        })).unwrap()
        toast.success("Steri Milk Process Log updated successfully")
      } else {
        // create payload matches the curl you provided (no top-level id)
        await dispatch(createSteriMilkProcessLog(formData)).unwrap()
        toast.success("Steri Milk Process Log created successfully")
      }

      setTimeout(() => {
        dispatch(fetchSteriMilkProcessLogs({ filters: {} }))
      }, 1000)

      onOpenChange(false)
    } catch (err: any) {
      const msg = typeof err === "string" ? err : (err?.message || JSON.stringify(err) || "Failed to save Steri Milk Process Log")
      toast.error(msg)
      console.error(err)
    }
  }

  // Remove the old individual useEffect hooks for auto-prefill since we replaced them with the watch subscription above

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    // Only need to advance from Basic Information to Process Details
    if (currentStep === 1) {
      basicInfoForm.handleSubmit(handleBasicInfoSubmit)()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>
            {mode === "edit" ? "Edit Steri Milk Process Log" : "Create Steri Milk Process Log"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1
              ? "Basic Information: Enter the basic log information and batch details"
              : "Process Details: Enter the detailed process information with temperature and pressure readings"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white" key={`form-${open}-${currentStep}`}>
          {currentStep === 1 ? (
            <BasicInfoStep
              form={basicInfoForm}
              userRoles={userRoles}
              filmaticForms={filmaticForms}
              loadingUserRoles={loadingUserRoles}
              loadingFilmaticForms={loadingFilmaticForms}
            />
          ) : (
            <ProcessDetailsStep form={processDetailsForm} />
          )}
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t bg-white">
          <Button

            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentStep === 1 ? "Basic Information" : "Process Details"} • Step {currentStep} of 2
            </span>
          </div>

          {currentStep < 2 ? (
            <Button
              onClick={handleNext}
              disabled={loading.create}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={processDetailsForm.handleSubmit(handleProcessDetailsSubmit)}
              disabled={loading.create}
            >
              {mode === "edit" ? "Update Log" : "Create Log"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
