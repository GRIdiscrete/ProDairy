"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
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
import { SteriMilkProcessLog, CreateSteriMilkProcessLogRequest } from "@/lib/api/steri-milk-process-log"
import { ChevronLeft, ChevronRight, ArrowRight, Factory, Beaker, FileText, Package, Clock, Thermometer, Gauge } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { id } from "date-fns/locale"

interface SteriMilkProcessLogDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log?: SteriMilkProcessLog | null
  mode?: "create" | "edit"
  processId: string
}

// Process Overview Component
const ProcessOverview = () => (
  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
    <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Beaker className="w-4 h-4 text-orange-600" />
        </div>
        <span className="text-sm font-light">Process Log</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Factory className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-600">Steri Milk Process Log</span>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Current Step
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Package className="h-4 w-4 text-gray-400" />
        </div>
        <span className="text-sm font-light text-gray-400">Next Process</span>
      </div>
    </div>
  </div>
)

// Step 1: Basic Information Schema
const basicInfoSchema = yup.object({
  approved: yup.boolean().optional(),
  approver_id: yup.string().optional(),
  filmatic_form_id: yup.string().optional(),
  batch_number: yup.number().optional(),
  date: yup.string().optional(), // added batch date
})

// Step 2: Process Times Schema
const processTimesSchema = yup.object({
  filling_start: yup.string().optional(),
  autoclave_start: yup.string().optional(),
  heating_start: yup.string().optional(),
  heating_finish: yup.string().optional(),
  sterilization_start: yup.string().optional(),
  sterilization_after_5: yup.string().optional(),
  sterilization_finish: yup.string().optional(),
  pre_cooling_start: yup.string().optional(),
  pre_cooling_finish: yup.string().optional(),
  cooling_1_start: yup.string().optional(),
  cooling_1_finish: yup.string().optional(),
  cooling_2_start: yup.string().optional(),
  cooling_2_finish: yup.string().optional(),
})

// Step 3: Process Details Schema
const processDetailsSchema = yup.object({
  filling_start_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  autoclave_start_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  heating_start_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  heating_finish_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  sterilization_start_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  sterilization_after_5_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  sterilization_finish_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  pre_cooling_start_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  pre_cooling_finish_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  cooling_1_start_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  cooling_1_finish_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  cooling_2_start_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
  cooling_2_finish_details: yup.object({
    time: yup.string().optional(),
    temperature: yup.number().optional(),
    pressure: yup.number().optional(),
  }).optional(),
})

type BasicInfoFormData = yup.InferType<typeof basicInfoSchema>
type ProcessTimesFormData = yup.InferType<typeof processTimesSchema>
type ProcessDetailsFormData = yup.InferType<typeof processDetailsSchema>

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

  // Basic info form
  const basicInfoForm = useForm({
    defaultValues: {
      approved: true,
      approver_id: "",
      filmatic_form_id: "",
      batch_number: 1,
      date: "" // added batch date (YYYY-MM-DD will be derived from DatePicker)
    },
  })

  // Process times form
  const processTimesForm = useForm({
    defaultValues: {
      filling_start: "",
      autoclave_start: "",
      heating_start: "",
      heating_finish: "",
      sterilization_start: "",
      sterilization_after_5: "",
      sterilization_finish: "",
      pre_cooling_start: "",
      pre_cooling_finish: "",
      cooling_1_start: "",
      cooling_1_finish: "",
      cooling_2_start: "",
      cooling_2_finish: "",
    },
  })

  // Process details form
  const processDetailsForm = useForm({
    defaultValues: {
      filling_start_details: { time: "", temperature: 0, pressure: 0 },
      autoclave_start_details: { time: "", temperature: 0, pressure: 0 },
      heating_start_details: { time: "", temperature: 0, pressure: 0 },
      heating_finish_details: { time: "", temperature: 0, pressure: 0 },
      sterilization_start_details: { time: "", temperature: 0, pressure: 0 },
      sterilization_after_5_details: { time: "", temperature: 0, pressure: 0 },
      sterilization_finish_details: { time: "", temperature: 0, pressure: 0 },
      pre_cooling_start_details: { time: "", temperature: 0, pressure: 0 },
      pre_cooling_finish_details: { time: "", temperature: 0, pressure: 0 },
      cooling_1_start_details: { time: "", temperature: 0, pressure: 0 },
      cooling_1_finish_details: { time: "", temperature: 0, pressure: 0 },
      cooling_2_start_details: { time: "", temperature: 0, pressure: 0 },
      cooling_2_finish_details: { time: "", temperature: 0, pressure: 0 },
    },
  })

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
        // pick single batch object from new API shape (batch_id)
        const batch = (log as any).batch_id || null

        // prefills
        basicInfoForm.reset({
          approved: !!log.approved,
          approver_id: log.approver_id || "",
          filmatic_form_id: log.filmatic_form_id || "",
          batch_number: batch?.batch_number ?? 1,
          // prefer explicit batch date, fallback to created_at (YYYY-MM-DD)
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

        // map time fields: prefer batch.*_details.time -> batch.* (object/string) -> ""
        processTimesForm.reset({
          filling_start: timeFrom(batch?.filling_start_details, batch?.filling_start),
          autoclave_start: timeFrom(batch?.autoclave_start_details, batch?.autoclave_start),
          heating_start: timeFrom(batch?.heating_start_details, batch?.heating_start),
          heating_finish: timeFrom(batch?.heating_finish_details, batch?.heating_finish),
          sterilization_start: timeFrom(batch?.sterilization_start_details, batch?.sterilization_start),
          sterilization_after_5: timeFrom(batch?.sterilization_after_5_details, batch?.sterilization_after_5),
          sterilization_finish: timeFrom(batch?.sterilization_finish_details, batch?.sterilization_finish),
          pre_cooling_start: timeFrom(batch?.pre_cooling_start_details, batch?.pre_cooling_start),
          pre_cooling_finish: timeFrom(batch?.pre_cooling_finish_details, batch?.pre_cooling_finish),
          cooling_1_start: timeFrom(batch?.cooling_1_start_details, batch?.cooling_1_start),
          cooling_1_finish: timeFrom(batch?.cooling_1_finish_details, batch?.cooling_1_finish),
          cooling_2_start: timeFrom(batch?.cooling_2_start_details, batch?.cooling_2_start),
          cooling_2_finish: timeFrom(batch?.cooling_2_finish_details, batch?.cooling_2_finish),
        })

        // map details (time, temperature, pressure) from *_details objects
        const detailsPrefill = {
          filling_start_details: {
            time: normalizeTime(batch?.filling_start_details?.time ?? batch?.filling_start),
            temperature: batch?.filling_start_details?.temperature ?? 0,
            pressure: batch?.filling_start_details?.pressure ?? 0
          },
          autoclave_start_details: {
            time: normalizeTime(batch?.autoclave_start_details?.time ?? batch?.autoclave_start),
            temperature: batch?.autoclave_start_details?.temperature ?? 0,
            pressure: batch?.autoclave_start_details?.pressure ?? 0
          },
          heating_start_details: {
            time: normalizeTime(batch?.heating_start_details?.time ?? batch?.heating_start),
            temperature: batch?.heating_start_details?.temperature ?? 0,
            pressure: batch?.heating_start_details?.pressure ?? 0
          },
          heating_finish_details: {
            time: normalizeTime(batch?.heating_finish_details?.time ?? batch?.heating_finish),
            temperature: batch?.heating_finish_details?.temperature ?? 0,
            pressure: batch?.heating_finish_details?.pressure ?? 0
          },
          sterilization_start_details: {
            time: normalizeTime(batch?.sterilization_start_details?.time ?? batch?.sterilization_start),
            temperature: batch?.sterilization_start_details?.temperature ?? 0,
            pressure: batch?.sterilization_start_details?.pressure ?? 0
          },
          sterilization_after_5_details: {
            time: normalizeTime(batch?.sterilization_after_5_details?.time ?? batch?.sterilization_after_5),
            temperature: batch?.sterilization_after_5_details?.temperature ?? 0,
            pressure: batch?.sterilization_after_5_details?.pressure ?? 0
          },
          sterilization_finish_details: {
            time: normalizeTime(batch?.sterilization_finish_details?.time ?? batch?.sterilization_finish),
            temperature: batch?.sterilization_finish_details?.temperature ?? 0,
            pressure: batch?.sterilization_finish_details?.pressure ?? 0
          },
          pre_cooling_start_details: {
            time: normalizeTime(batch?.pre_cooling_start_details?.time ?? batch?.pre_cooling_start),
            temperature: batch?.pre_cooling_start_details?.temperature ?? 0,
            pressure: batch?.pre_cooling_start_details?.pressure ?? 0
          },
          pre_cooling_finish_details: {
            time: normalizeTime(batch?.pre_cooling_finish_details?.time ?? batch?.pre_cooling_finish),
            temperature: batch?.pre_cooling_finish_details?.temperature ?? 0,
            pressure: batch?.pre_cooling_finish_details?.pressure ?? 0
          },
          cooling_1_start_details: {
            time: normalizeTime(batch?.cooling_1_start_details?.time ?? batch?.cooling_1_start),
            temperature: batch?.cooling_1_start_details?.temperature ?? 0,
            pressure: batch?.cooling_1_start_details?.pressure ?? 0
          },
          cooling_1_finish_details: {
            time: normalizeTime(batch?.cooling_1_finish_details?.time ?? batch?.cooling_1_finish),
            temperature: batch?.cooling_1_finish_details?.temperature ?? 0,
            pressure: batch?.cooling_1_finish_details?.pressure ?? 0
          },
          cooling_2_start_details: {
            time: normalizeTime(batch?.cooling_2_start_details?.time ?? batch?.cooling_2_start),
            temperature: batch?.cooling_2_start_details?.temperature ?? 0,
            pressure: batch?.cooling_2_start_details?.pressure ?? 0
          },
          cooling_2_finish_details: {
            time: normalizeTime(batch?.cooling_2_finish_details?.time ?? batch?.cooling_2_finish),
            temperature: batch?.cooling_2_finish_details?.temperature ?? 0,
            pressure: batch?.cooling_2_finish_details?.pressure ?? 0
          }
        }
        processDetailsForm.reset(detailsPrefill)

        // derive the simple process times from the details' time fields to avoid duplicate entry
        processTimesForm.reset({
          filling_start: detailsPrefill.filling_start_details?.time ?? "",
          autoclave_start: detailsPrefill.autoclave_start_details?.time ?? "",
          heating_start: detailsPrefill.heating_start_details?.time ?? "",
          heating_finish: detailsPrefill.heating_finish_details?.time ?? "",
          sterilization_start: detailsPrefill.sterilization_start_details?.time ?? "",
          sterilization_after_5: detailsPrefill.sterilization_after_5_details?.time ?? "",
          sterilization_finish: detailsPrefill.sterilization_finish_details?.time ?? "",
          pre_cooling_start: detailsPrefill.pre_cooling_start_details?.time ?? "",
          pre_cooling_finish: detailsPrefill.pre_cooling_finish_details?.time ?? "",
          cooling_1_start: detailsPrefill.cooling_1_start_details?.time ?? "",
          cooling_1_finish: detailsPrefill.cooling_1_finish_details?.time ?? "",
          cooling_2_start: detailsPrefill.cooling_2_start_details?.time ?? "",
          cooling_2_finish: detailsPrefill.cooling_2_finish_details?.time ?? "",
        })

        // set UI to first step
        setCurrentStep(1)
      } catch (err) {
        console.error("Error populating edit form:", err)
        // fallback to defaults if anything goes wrong
        basicInfoForm.reset()
        processTimesForm.reset()
        processDetailsForm.reset()
        setCurrentStep(1)
      }
    } else {
      // create mode -> clear forms
      basicInfoForm.reset()
      processTimesForm.reset()
      processDetailsForm.reset()
      setCurrentStep(1)
    }
  }, [open, mode, log, basicInfoForm, processTimesForm, processDetailsForm])

  const handleBasicInfoSubmit = async (data: BasicInfoFormData) => {
    setCurrentStep(2)
  }

  const handleProcessTimesSubmit = async (data: ProcessTimesFormData) => {
    setCurrentStep(3)
  }

  const handleProcessDetailsSubmit = async (data: any) => {
    try {
      const basicInfo = basicInfoForm.getValues()
      // removed usage of processTimesForm - backend doesn't need simple process times

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
            if (/^[+-]\d{4}$/.test(tz)) tz = tz.slice(0,3)
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
          if (m) return `${m[1].padStart(2,"0")}:${m[2]}:00+00`
        } catch { /* fallthrough */ }
        return null
      }

      // Build payload that matches your API examples: no simple process times, only details
      const formData: any = {
        approved: basicInfo.approved || false,
        approver_id: basicInfo.approver_id || "",
        filmatic_form_id: basicInfo.filmatic_form_id || "",
        batch: {
          // date should be YYYY-MM-DD or null
          date: basicInfo.date ? basicInfo.date : null,
          batch_number: basicInfo.batch_number || 1,
          // only include *_details objects (formatted times)
          filling_start_details: {
            time: convertTimeToBackend(data.filling_start_details?.time),
            temperature: data.filling_start_details?.temperature ?? 0,
            pressure: data.filling_start_details?.pressure ?? 0
          },
          autoclave_start_details: {
            time: convertTimeToBackend(data.autoclave_start_details?.time),
            temperature: data.autoclave_start_details?.temperature ?? 0,
            pressure: data.autoclave_start_details?.pressure ?? 0
          },
          heating_start_details: {
            time: convertTimeToBackend(data.heating_start_details?.time),
            temperature: data.heating_start_details?.temperature ?? 0,
            pressure: data.heating_start_details?.pressure ?? 0
          },
          heating_finish_details: {
            time: convertTimeToBackend(data.heating_finish_details?.time),
            temperature: data.heating_finish_details?.temperature ?? 0,
            pressure: data.heating_finish_details?.pressure ?? 0
          },
          sterilization_start_details: {
            time: convertTimeToBackend(data.sterilization_start_details?.time),
            temperature: data.sterilization_start_details?.temperature ?? 0,
            pressure: data.sterilization_start_details?.pressure ?? 0
          },
          sterilization_after_5_details: {
            time: convertTimeToBackend(data.sterilization_after_5_details?.time),
            temperature: data.sterilization_after_5_details?.temperature ?? 0,
            pressure: data.sterilization_after_5_details?.pressure ?? 0
          },
          sterilization_finish_details: {
            time: convertTimeToBackend(data.sterilization_finish_details?.time),
            temperature: data.sterilization_finish_details?.temperature ?? 0,
            pressure: data.sterilization_finish_details?.pressure ?? 0
          },
          pre_cooling_start_details: {
            time: convertTimeToBackend(data.pre_cooling_start_details?.time),
            temperature: data.pre_cooling_start_details?.temperature ?? 0,
            pressure: data.pre_cooling_start_details?.pressure ?? 0
          },
          pre_cooling_finish_details: {
            time: convertTimeToBackend(data.pre_cooling_finish_details?.time),
            temperature: data.pre_cooling_finish_details?.temperature ?? 0,
            pressure: data.pre_cooling_finish_details?.pressure ?? 0
          },
          cooling_1_start_details: {
            time: convertTimeToBackend(data.cooling_1_start_details?.time),
            temperature: data.cooling_1_start_details?.temperature ?? 0,
            pressure: data.cooling_1_start_details?.pressure ?? 0
          },
          cooling_1_finish_details: {
            time: convertTimeToBackend(data.cooling_1_finish_details?.time),
            temperature: data.cooling_1_finish_details?.temperature ?? 0,
            pressure: data.cooling_1_finish_details?.pressure ?? 0
          },
          cooling_2_start_details: {
            time: convertTimeToBackend(data.cooling_2_start_details?.time),
            temperature: data.cooling_2_start_details?.temperature ?? 0,
            pressure: data.cooling_2_start_details?.pressure ?? 0
          },
          cooling_2_finish_details: {
            time: convertTimeToBackend(data.cooling_2_finish_details?.time),
            temperature: data.cooling_2_finish_details?.temperature ?? 0,
            pressure: data.cooling_2_finish_details?.pressure ?? 0
          }
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
            filmatic_form_id: formData.filmatic_form_id,
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

  const handleUserSearch = async (query: string) => {
    if (!query.trim()) return []

    try {
      const usersResponse = await usersApi.getUsers({
        filters: { search: query }
      })
      return (usersResponse.data || [])
        .map(user => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name}`.trim() || user.email,
          description: `${user.department} • ${user.email}`
        }))
    } catch (error) {
      return []
    }
  }

  const handleUserRoleSearch = async (query: string) => {
    if (!query.trim()) return []

    try {
      const rolesResponse = await rolesApi.getRoles({
        filters: { search: query }
      })
      return (rolesResponse.data || [])
        .map(role => ({
          value: role.id,
          label: role.role_name,
          description: 'User Role'
        }))
    } catch (error) {
      return []
    }
  }

  const handleFilmaticFormSearch = async (query: string) => {
    if (!query.trim()) return []

    try {
      const form1Response = await filmaticLinesForm1Api.getForms()

      const allForms = [
        ...(form1Response || []).map((form: any) => ({ ...form, type: 'Form 1' }))
      ]

      return allForms
        .filter(form =>
          form.id?.toLowerCase().includes(query.toLowerCase()) ||
          form.date?.toLowerCase().includes(query.toLowerCase()) ||
          form.holding_tank_bmt?.toLowerCase().includes(query.toLowerCase())
        )
        .map(form => ({
          value: form.id,
          label: `${form.type} - ${form.date || 'N/A'} - ${form.holding_tank_bmt || 'N/A'}`,
          description: `ID: ${form.id?.slice(0, 8) || 'N/A'}...`
        }))
    } catch (error) {
      return []
    }
  }

  const renderStep1 = () => (
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
            control={basicInfoForm.control}
            render={({ field }) => (
              <Input
                id="batch_number"
                type="number"
                placeholder="Enter batch number"
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            )}
          />
          {basicInfoForm.formState.errors.batch_number && (
            <p className="text-sm text-red-500">{basicInfoForm.formState.errors.batch_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Batch Date</Label>
          <Controller
            name="date"
            control={basicInfoForm.control}
            render={({ field }) => {
              const parseToDate = (v: any): Date | undefined => {
                if (!v) return undefined
                if (v instanceof Date) return isNaN(v.getTime()) ? undefined : v
                // Dayjs-like
                if (v?.toDate && typeof v.toDate === "function") {
                  const d = v.toDate()
                  return isNaN(d.getTime()) ? undefined : d
                }
                // object with toISOString (e.g. some libs)
                if (v?.toISOString && typeof v.toISOString === "function") {
                  try {
                    const d = new Date(v.toISOString())
                    return isNaN(d.getTime()) ? undefined : d
                  } catch {
                    /* fallthrough */
                  }
                }
                // string fallback
                if (typeof v === "string") {
                  const d = new Date(v)
                  return isNaN(d.getTime()) ? undefined : d
                }
                // last resort
                const d = new Date(v as any)
                return isNaN(d.getTime()) ? undefined : d
              }

              const formatToIsoDate = (d: any): string => {
                if (!d) return ""
                // Dayjs-like
                if (d?.toDate && typeof d.toDate === "function") d = d.toDate()
                if (d instanceof Date) return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
                if (typeof d === "string") {
                  // if string starts with YYYY-MM-DD
                  const m = d.match(/^(\d{4}-\d{2}-\d{2})/)
                  if (m) return m[1]
                  const parsed = new Date(d)
                  return isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10)
                }
                if (d?.toISOString && typeof d.toISOString === "function") {
                  try { return d.toISOString().slice(0, 10) } catch { }
                }
                const parsed = new Date(d as any)
                return isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10)
              }

              return (
                <DatePicker
                  // pass Date or undefined to avoid invalid Date or empty string UI issues
                  value={parseToDate(field.value)}
                  selected={parseToDate(field.value)}
                  defaultValue={parseToDate(field.value)}
                  // wire common callbacks used by various date pickers
                  onChange={(val: any) => field.onChange(formatToIsoDate(val))}
                  onSelect={(val: any) => field.onChange(formatToIsoDate(val))}
                  onValueChange={(val: any) => field.onChange(formatToIsoDate(val))}
                  placeholder="Select batch date"
                />
              )
            }}
          />
          {basicInfoForm.formState.errors.date && (
            <p className="text-sm text-red-500">{basicInfoForm.formState.errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="approver_id">Approver</Label>
          <Controller
            name="approver_id"
            control={basicInfoForm.control}
            render={({ field }) => (
              <SearchableSelect
                options={userRoles.map(role => ({
                  value: role.id,
                  label: role.role_name,
                  description: role.description || 'User Role'
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleUserRoleSearch}
                placeholder="Search and select approver role"
                searchPlaceholder="Search roles..."
                emptyMessage="No roles found"
                loading={loadingUserRoles}
              />
            )}
          />
          {basicInfoForm.formState.errors.approver_id && (
            <p className="text-sm text-red-500">{basicInfoForm.formState.errors.approver_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="approved">Approved</Label>
            <Controller
              name="approved"
              control={basicInfoForm.control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          {basicInfoForm.formState.errors.approved && (
            <p className="text-sm text-red-500">{basicInfoForm.formState.errors.approved.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="filmatic_form_id">Filmatic Form</Label>
          <Controller
            name="filmatic_form_id"
            control={basicInfoForm.control}
            render={({ field }) => (
              <SearchableSelect
                options={filmaticForms.map(form => ({
                  value: form.id,
                  label: `${form?.tag}`,
                  //de ``
                }))}
                value={field.value}
                onValueChange={field.onChange}
                onSearch={handleFilmaticFormSearch}
                placeholder="Search and select filmatic form"
                searchPlaceholder="Search forms..."
                emptyMessage="No forms found"
                loading={loadingFilmaticForms}
              />
            )}
          />
          {basicInfoForm.formState.errors.filmatic_form_id && (
            <p className="text-sm text-red-500">{basicInfoForm.formState.errors.filmatic_form_id.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6 p-6">
      <ProcessOverview />

      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Process Details</h3>
          <p className="text-sm font-light text-gray-600 mt-2">Enter the detailed process information with temperature and pressure readings</p>
        </div>

        <div className="space-y-6">
          {/* Filling Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Filling Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Controller
                  name="filling_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filling_start_details_temperature">Temperature</Label>
                <Controller
                  name="filling_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="filling_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filling_start_details_pressure">Pressure</Label>
                <Controller
                  name="filling_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="filling_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Autoclave Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-red-600" />
              <span>Autoclave Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Controller
                  name="autoclave_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoclave_start_details_temperature">Temperature</Label>
                <Controller
                  name="autoclave_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="autoclave_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoclave_start_details_pressure">Pressure</Label>
                <Controller
                  name="autoclave_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="autoclave_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Heating Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-orange-600" />
              <span>Heating Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Controller
                  name="heating_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heating_start_details_temperature">Temperature</Label>
                <Controller
                  name="heating_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="heating_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heating_start_details_pressure">Pressure</Label>
                <Controller
                  name="heating_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="heating_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Heating Finish Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-orange-600" />
              <span>Heating Finish Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Controller
                  name="heating_finish_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heating_finish_details_temperature">Temperature</Label>
                <Controller
                  name="heating_finish_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="heating_finish_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heating_finish_details_pressure">Pressure</Label>
                <Controller
                  name="heating_finish_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="heating_finish_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sterilization Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-red-600" />
              <span>Sterilization Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Controller
                  name="sterilization_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_start_details_temperature">Temperature</Label>
                <Controller
                  name="sterilization_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_start_details_pressure">Pressure</Label>
                <Controller
                  name="sterilization_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sterilization After 5 Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-red-600" />
              <span>Sterilization After 5 Minutes Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Controller
                  name="sterilization_after_5_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_after_5_details_temperature">Temperature</Label>
                <Controller
                  name="sterilization_after_5_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_after_5_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_after_5_details_pressure">Pressure</Label>
                <Controller
                  name="sterilization_after_5_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_after_5_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sterilization Finish Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-red-600" />
              <span>Sterilization Finish Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sterilization_finish_details_time">Time *</Label>
                <Controller
                  name="sterilization_finish_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_finish_details_temperature">Temperature</Label>
                <Controller
                  name="sterilization_finish_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_finish_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sterilization_finish_details_pressure">Pressure</Label>
                <Controller
                  name="sterilization_finish_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="sterilization_finish_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Pre Cooling Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              <span>Pre Cooling Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_start_details_time">Time *</Label>
                <Controller
                  name="pre_cooling_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_start_details_temperature">Temperature</Label>
                <Controller
                  name="pre_cooling_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="pre_cooling_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_start_details_pressure">Pressure</Label>
                <Controller
                  name="pre_cooling_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="pre_cooling_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Pre Cooling Finish Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              <span>Pre Cooling Finish Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_finish_details_time">Time *</Label>
                <Controller
                  name="pre_cooling_finish_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_finish_details_temperature">Temperature</Label>
                <Controller
                  name="pre_cooling_finish_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="pre_cooling_finish_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pre_cooling_finish_details_pressure">Pressure</Label>
                <Controller
                  name="pre_cooling_finish_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="pre_cooling_finish_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Cooling 1 Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-cyan-600" />
              <span>Cooling 1 Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cooling_1_start_details_time">Time *</Label>
                <Controller
                  name="cooling_1_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_1_start_details_temperature">Temperature</Label>
                <Controller
                  name="cooling_1_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_1_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_1_start_details_pressure">Pressure</Label>
                <Controller
                  name="cooling_1_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_1_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Cooling 1 Finish Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-cyan-600" />
              <span>Cooling 1 Finish Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cooling_1_finish_details_time">Time *</Label>
                <Controller
                  name="cooling_1_finish_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_1_finish_details_temperature">Temperature *</Label>
                <Controller
                  name="cooling_1_finish_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_1_finish_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_1_finish_details_pressure">Pressure *</Label>
                <Controller
                  name="cooling_1_finish_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_1_finish_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Cooling 2 Start Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-indigo-600" />
              <span>Cooling 2 Start Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Controller
                  name="cooling_2_start_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_2_start_details_temperature">Temperature *</Label>
                <Controller
                  name="cooling_2_start_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_2_start_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_2_start_details_pressure">Pressure *</Label>
                <Controller
                  name="cooling_2_start_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_2_start_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Cooling 2 Finish Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-indigo-600" />
              <span>Cooling 2 Finish Details</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cooling_2_finish_details_time">Time *</Label>
                <Controller
                  name="cooling_2_finish_details.time"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <ShadcnTimePicker
                      label="Time"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select time"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_2_finish_details_temperature">Temperature *</Label>
                <Controller
                  name="cooling_2_finish_details.temperature"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_2_finish_details_temperature"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooling_2_finish_details_pressure">Pressure *</Label>
                <Controller
                  name="cooling_2_finish_details.pressure"
                  control={processDetailsForm.control}
                  render={({ field }) => (
                    <Input
                      id="cooling_2_finish_details_pressure"
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

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
          {currentStep === 1 ? renderStep1() : renderStep3()}
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t bg-white">
          <Button
            variant="outline"
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
