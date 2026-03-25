"use client""use client""use client"



import { useState, useEffect } from "react"

import { useForm, SubmitHandler, Controller } from "react-hook-form"

import { yupResolver } from "@hookform/resolvers/yup"import { useState, useEffect } from "react"import { useState, useEffect, useMemo } from "react"

import * as yup from "yup"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"import { useForm, SubmitHandler, Controller } from "react-hook-form"import { useForm, SubmitHandler, Controller, UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"import { yupResolver } from "@hookform/resolvers/yup"import { yupResolver } from "@hookform/resolvers/yup"

import { Label } from "@/components/ui/label"

import { SearchableSelect } from "@/components/ui/searchable-select"import * as yup from "yup"import * as yup from "yup"

import { DatePicker } from "@/components/ui/date-picker"

import { Beaker, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { steriMilkTestReportApi, type CreateSteriMilkTestReportRequest } from "@/lib/api/steri-milk-test-report"

import { usersApi, type UserEntity } from "@/lib/api/users"import { Button } from "@/components/ui/button"import { Button } from "@/components/ui/button"

import { steriMilkProcessLogApi } from "@/lib/api/steri-milk-process-log"

import { tankerApi, type Tanker } from "@/lib/api/tanker"import { Input } from "@/components/ui/input"import { Input } from "@/components/ui/input"

import { SignatureModal } from "@/components/ui/signature-modal"

import { SignatureViewer } from "@/components/ui/signature-viewer"import { Label } from "@/components/ui/label"import { Label } from "@/components/ui/label"

import { normalizeDataUrlToBase64, base64ToPngDataUrl } from "@/lib/utils/signature"

import { toast } from "sonner"import { SearchableSelect } from "@/components/ui/searchable-select"import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { LoadingButton } from "@/components/ui/loading-button"

import { DatePicker } from "@/components/ui/date-picker"import { Badge } from "@/components/ui/badge"

const testReportSchema = yup.object({

  issue_date: yup.string().required("Issue date is required"),import { Beaker, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"import { SearchableSelect } from "@/components/ui/searchable-select"

  approved_by: yup.string().required("Approved by is required"),

  approver_signature: yup.string().required("Approver signature is required"),import { steriMilkTestReportApi, type CreateSteriMilkTestReportRequest } from "@/lib/api/steri-milk-test-report"import { DatePicker } from "@/components/ui/date-picker"

  date_of_production: yup.string().required("Date of production is required"),

  batch_number: yup.number().required("Batch number is required"),import { usersApi, type UserEntity } from "@/lib/api/users"import { Beaker, ChevronLeft, ChevronRight, CheckCircle, Clock } from "lucide-react"

  variety: yup.string().required("Variety is required"),

})import { steriMilkProcessLogApi } from "@/lib/api/steri-milk-process-log"import { steriMilkTestReportApi, type CreateSteriMilkTestReportRequest } from "@/lib/api/steri-milk-test-report"



type TestReportFormData = {import { tankerApi, type Tanker } from "@/lib/api/tanker"import { usersApi, type UserEntity } from "@/lib/api/users"

  issue_date: string

  approved_by: stringimport { SignatureModal } from "@/components/ui/signature-modal"import { steriMilkProcessLogApi, type SteriMilkProcessLog } from "@/lib/api/steri-milk-process-log"

  approver_signature: string

  date_of_production: stringimport { SignatureViewer } from "@/components/ui/signature-viewer"import { tankerApi } from "@/lib/api/tanker"

  batch_number: number

  variety: stringimport { normalizeDataUrlToBase64, base64ToPngDataUrl } from "@/lib/utils/signature"import { Tanker } from "@/lib/api/tanker"

  raw_milk_silos: {

    tank: stringimport { toast } from "sonner"import { SignatureModal } from "@/components/ui/signature-modal"

    time: string

    temperature: numberimport { LoadingButton } from "@/components/ui/loading-button"import { SignatureViewer } from "@/components/ui/signature-viewer"

    alcohol: number

    res: numberimport { normalizeDataUrlToBase64, base64ToPngDataUrl } from "@/lib/utils/signature"

    cob: boolean

    ph: numberconst testReportSchema = yup.object({import { toast } from "sonner"

    fat: number

    lr_snf: string  issue_date: yup.string().required("Issue date is required"),import { LoadingButton } from "@/components/ui/loading-button"

    acidity: number

    remarks: string  approved_by: yup.string().required("Approved by is required"),

  }

  other_tests: {  approver_signature: yup.string().required("Approver signature is required"),const testReportSchema = yup.object({

    sample_details: string

    ph: number  date_of_production: yup.string().required("Date of production is required"),  issue_date: yup.string().required("Issue date is required"),

    caustic: number

    acid: number  batch_number: yup.number().required("Batch number is required"),  approved_by: yup.string().required("Approved by is required"),

    chlorine: number

    hd: number  variety: yup.string().required("Variety is required"),  approver_signature: yup.string().required("Approver signature is required"),

    tds: number

    hydrogen_peroxide: number})  date_of_production: yup.string().required("Date of production is required"),

    remarks: string

  }  batch_number: yup.number().required("Batch number is required"),

  standardisation_and_pasteurisation: {

    tank: stringtype TestReportFormData = {  variety: yup.string().required("Variety is required"),

    batch: number

    time: string  issue_date: string  raw_milk_silos: yup.object({

    temperature: number

    ot: string  approved_by: string    tank: yup.string(),

    alcohol: number

    phosphatase: string  approver_signature: string    time: yup.string(),

    ph: number

    cob: boolean  date_of_production: string    temperature: yup.number(),

    fat: number

    ci_si: string  batch_number: number    alcohol: yup.number(),

    lr_snf: string

    acidity: number  variety: string    res: yup.number(),

    analyst: string

    remarks: string  raw_milk_silos: {    cob: yup.boolean(),

  }

  uht_steri_milk: {    tank: string    ph: yup.number(),

    time: string

    batch: string    time: string    fat: yup.number(),

    temperature: number

    ot: string    temperature: number    lr_snf: yup.string(),

    alc: number

    res: number    alcohol: number    acidity: yup.number(),

    cob: boolean

    ph: number    res: number    remarks: yup.string(),

    fat: number

    lr_snf: string    cob: boolean  }),

    ci_si: string

    total_solids: number    ph: number  other_tests: yup.object({

    acidity: number

    coffee: number    fat: number    sample_details: yup.string(),

    coffee_remarks: string

    hydrogen_peroxide_or_turbidity: string    lr_snf: string    ph: yup.number(),

    analyst: string

    remarks: string    acidity: number    caustic: yup.number(),

  }

}    remarks: string    acid: yup.number(),



interface SteriMilkTestReportFormDrawerProps {  }    chlorine: yup.number(),

  open: boolean

  onOpenChange: (open: boolean) => void  other_tests: {    hd: yup.number(),

  processLogId?: string

  onSuccess?: () => void    sample_details: string    tds: yup.number(),

}

    ph: number    hydrogen_peroxide: yup.number(),

const steps = [

  { id: 1, title: "Basic Information", description: "Enter basic test report details" },    caustic: number    remarks: yup.string(),

  { id: 2, title: "Raw Milk Silos", description: "Raw milk silo test parameters" },

  { id: 3, title: "Other Tests", description: "Additional test parameters" },    acid: number  }),

  { id: 4, title: "Standardisation & Pasteurisation", description: "Pasteurisation process data" },

  { id: 5, title: "UHT Steri Milk", description: "UHT processing parameters" },    chlorine: number  standardisation_and_pasteurisation: yup.object({

  { id: 6, title: "Review & Submit", description: "Review all data and submit" }

]    hd: number    tank: yup.string(),



export function SteriMilkTestReportFormDrawer({    tds: number    batch: yup.number(),

  open,

  onOpenChange,    hydrogen_peroxide: number    time: yup.string(),

  processLogId,

  onSuccess    remarks: string    temperature: yup.number(),

}: SteriMilkTestReportFormDrawerProps) {

  const [currentStep, setCurrentStep] = useState(1)  }    ot: yup.string(),

  const [loading, setLoading] = useState(false)

  const [users, setUsers] = useState<UserEntity[]>([])  standardisation_and_pasteurisation: {    alcohol: yup.number(),

  const [tankers, setTankers] = useState<Tanker[]>([])

  const [loadingTankers, setLoadingTankers] = useState(false)    tank: string    phosphatase: yup.string(),

  const [loadingUsers, setLoadingUsers] = useState(false)

  const [signatureOpen, setSignatureOpen] = useState(false)    batch: number    ph: yup.number(),

  const [signatureViewOpen, setSignatureViewOpen] = useState(false)

    time: string    cob: yup.boolean(),

  const form = useForm<TestReportFormData>({

    resolver: yupResolver(testReportSchema) as any,    temperature: number    fat: yup.number(),

    mode: 'all',

    defaultValues: {    ot: string    ci_si: yup.string(),

      issue_date: new Date().toISOString().split('T')[0],

      approved_by: "",    alcohol: number    lr_snf: yup.string(),

      approver_signature: "",

      date_of_production: new Date().toISOString().split('T')[0],    phosphatase: string    acidity: yup.number(),

      batch_number: 0,

      variety: "Steri milk",    ph: number    analyst: yup.string(),

      raw_milk_silos: {

        tank: "",    cob: boolean    remarks: yup.string(),

        time: "",

        temperature: 0,    fat: number  }),

        alcohol: 0,

        res: 0,    ci_si: string  uht_steri_milk: yup.object({

        cob: false,

        ph: 0,    lr_snf: string    time: yup.string(),

        fat: 0,

        lr_snf: "",    acidity: number    batch: yup.string(),

        acidity: 0,

        remarks: ""    analyst: string    temperature: yup.number(),

      },

      other_tests: {    remarks: string    ot: yup.string(),

        sample_details: "",

        ph: 0,  }    alc: yup.number(),

        caustic: 0,

        acid: 0,  uht_steri_milk: {    res: yup.number(),

        chlorine: 0,

        hd: 0,    time: string    cob: yup.boolean(),

        tds: 0,

        hydrogen_peroxide: 0,    batch: string    ph: yup.number(),

        remarks: ""

      },    temperature: number    fat: yup.number(),

      standardisation_and_pasteurisation: {

        tank: "",    ot: string    lr_snf: yup.string(),

        batch: 0,

        time: "",    alc: number    ci_si: yup.string(),

        temperature: 0,

        ot: "",    res: number    total_solids: yup.number(),

        alcohol: 0,

        phosphatase: "",    cob: boolean    acidity: yup.number(),

        ph: 0,

        cob: false,    ph: number    coffee: yup.number(),

        fat: 0,

        ci_si: "",    fat: number    coffee_remarks: yup.string(),

        lr_snf: "",

        acidity: 0,    lr_snf: string    hydrogen_peroxide_or_turbidity: yup.string(),

        analyst: "",

        remarks: ""    ci_si: string    analyst: yup.string(),

      },

      uht_steri_milk: {    total_solids: number    remarks: yup.string(),

        time: "",

        batch: "",    acidity: number  })

        temperature: 0,

        ot: "",    coffee: number})

        alc: 0,

        res: 0,    coffee_remarks: string

        cob: false,

        ph: 0,    hydrogen_peroxide_or_turbidity: stringtype TestReportFormData = {

        fat: 0,

        lr_snf: "",    analyst: string  issue_date: string

        ci_si: "",

        total_solids: 0,    remarks: string  approved_by: string

        acidity: 0,

        coffee: 0,  }  approver_signature: string

        coffee_remarks: "",

        hydrogen_peroxide_or_turbidity: "",}  date_of_production: string

        analyst: "",

        remarks: ""  batch_number: number

      }

    }interface SteriMilkTestReportFormDrawerProps {  variety: string

  })

  open: boolean  raw_milk_silos: {

  const { control, handleSubmit, formState: { errors }, watch, setValue, reset, getValues } = form

  onOpenChange: (open: boolean) => void    tank: string

  // Fetch users and tankers when drawer opens

  useEffect(() => {  processLogId?: string    time: string

    if (!open) return

  onSuccess?: () => void    temperature: number

    const loadData = async () => {

      setLoadingUsers(true)}    alcohol: number

      setLoadingTankers(true)

    res: number

      try {

        const [usersResponse, tankersResponse] = await Promise.all([const steps = [    cob: boolean

          usersApi.getUsers(),

          tankerApi.getAll()  { id: 1, title: "Basic Information", description: "Enter basic test report details" },    ph: number

        ])

        setUsers(usersResponse.data || [])  { id: 2, title: "Raw Milk Silos", description: "Raw milk silo test parameters" },    fat: number

        setTankers(tankersResponse.data || [])

      } catch (error) {  { id: 3, title: "Other Tests", description: "Additional test parameters" },    lr_snf: string

        console.error('Failed to fetch data:', error)

        toast.error('Failed to load form data')  { id: 4, title: "Standardisation & Pasteurisation", description: "Pasteurisation process data" },    acidity: number

      } finally {

        setLoadingUsers(false)  { id: 5, title: "UHT Steri Milk", description: "UHT processing parameters" },    remarks: string

        setLoadingTankers(false)

      }  { id: 6, title: "Review & Submit", description: "Review all data and submit" }  }

    }

]  other_tests: {

    loadData()

  }, [open])    sample_details: string



  // Fetch process log and prefill dataexport function SteriMilkTestReportFormDrawer({    ph: number

  useEffect(() => {

    if (!open || !processLogId) return  open,    caustic: number



    const loadProcessLog = async () => {  onOpenChange,    acid: number

      try {

        const processLogResponse = await steriMilkProcessLogApi.getLog(processLogId)  processLogId,    chlorine: number

        if (processLogResponse) {

          const batchNumber = (processLogResponse as any).batch_id?.batch_number || 1001  onSuccess    hd: number

          setValue('batch_number', batchNumber, { shouldValidate: false })

          setValue('date_of_production', (processLogResponse as any).batch_id?.created_at ?}: SteriMilkTestReportFormDrawerProps) {    tds: number

            new Date((processLogResponse as any).batch_id.created_at).toISOString().split('T')[0] :

            new Date().toISOString().split('T')[0], { shouldValidate: false })  const [currentStep, setCurrentStep] = useState(1)    hydrogen_peroxide: number

          setValue('standardisation_and_pasteurisation.batch', batchNumber, { shouldValidate: false })

          setValue('uht_steri_milk.batch', String(batchNumber), { shouldValidate: false })  const [loading, setLoading] = useState(false)    remarks: string

        }

      } catch (error) {  const [users, setUsers] = useState<UserEntity[]>([])  }

        console.error('Failed to fetch process log:', error)

        toast.error('Failed to load batch data')  const [tankers, setTankers] = useState<Tanker[]>([])  standardisation_and_pasteurisation: {

      }

    }  const [loadingTankers, setLoadingTankers] = useState(false)    tank: string



    loadProcessLog()  const [loadingUsers, setLoadingUsers] = useState(false)    batch: number

  }, [open, processLogId, setValue])

  const [signatureOpen, setSignatureOpen] = useState(false)    time: string

  const handleUserSearch = async (query: string) => {

    if (!query.trim()) return []  const [signatureViewOpen, setSignatureViewOpen] = useState(false)    temperature: number

    try {

      const usersResponse = await usersApi.getUsers({ filters: { search: query } })    ot: string

      return (usersResponse.data || []).map(user => ({

        value: user.id,  const form = useForm<TestReportFormData>({    alcohol: number

        label: `${user.first_name} ${user.last_name}`.trim() || user.email,

        description: `${user.department} • ${user.email}`    resolver: yupResolver(testReportSchema) as any,    phosphatase: string

      }))

    } catch (error) {    mode: 'all',    ph: number

      return []

    }    defaultValues: {    cob: boolean

  }

      issue_date: new Date().toISOString().split('T')[0],    fat: number

  const handleTankerSearch = async (query: string) => {

    if (!query.trim()) return []      approved_by: "",    ci_si: string

    try {

      const tankersResponse = await tankerApi.getAll()      approver_signature: "",    lr_snf: string

      return (tankersResponse.data || [])

        .filter(tanker =>      date_of_production: new Date().toISOString().split('T')[0],    acidity: number

          tanker.reg_number.toLowerCase().includes(query.toLowerCase()) ||

          tanker.condition.toLowerCase().includes(query.toLowerCase())      batch_number: 0,    analyst: string

        )

        .map(tanker => ({      variety: "Steri milk",    remarks: string

          value: tanker.id,

          label: `${tanker.reg_number} (${tanker.condition})`,      raw_milk_silos: {  }

          description: `${tanker.capacity}L capacity • ${tanker.age} years old`

        }))        tank: "",  uht_steri_milk: {

    } catch (error) {

      return []        time: "",    time: string

    }

  }        temperature: 0,    batch: string



  const nextStep = () => {        alcohol: 0,    temperature: number

    if (currentStep < steps.length) {

      setCurrentStep(currentStep + 1)        res: 0,    ot: string

    }

  }        cob: false,    alc: number



  const prevStep = () => {        ph: 0,    res: number

    if (currentStep > 1) {

      setCurrentStep(currentStep - 1)        fat: 0,    cob: boolean

    }

  }        lr_snf: "",    ph: number



  const onSubmit: SubmitHandler<TestReportFormData> = async (data) => {        acidity: 0,    fat: number

    try {

      setLoading(true)        remarks: ""    lr_snf: string



      console.log('Steri Milk Test Report Form Data:', data)      },    ci_si: string



      const normalizedSignature = normalizeDataUrlToBase64(data.approver_signature)      other_tests: {    total_solids: number



      const payload: CreateSteriMilkTestReportRequest = {        sample_details: "",    acidity: number

        issue_date: data.issue_date,

        approved_by: data.approved_by,        ph: 0,    coffee: number

        approver_signature: normalizedSignature,

        date_of_production: data.date_of_production,        caustic: 0,    coffee_remarks: string

        batch_number: data.batch_number,

        variety: data.variety,        acid: 0,    hydrogen_peroxide_or_turbidity: string

        raw_milk_silos: [data.raw_milk_silos],

        other_tests: [data.other_tests],        chlorine: 0,    analyst: string

        standardisation_and_pasteurisation: [data.standardisation_and_pasteurisation],

        uht_steri_milk: [data.uht_steri_milk]        hd: 0,    remarks: string

      }

        tds: 0,  }

      console.log('Steri Milk Test Report Payload:', payload)

        hydrogen_peroxide: 0,}

      await steriMilkTestReportApi.createTestReport(payload)

      toast.success('Steri Milk Test Report created successfully')        remarks: ""



      reset()      },interface SteriMilkTestReportFormDrawerProps {

      setCurrentStep(1)

      onOpenChange(false)      standardisation_and_pasteurisation: {  open: boolean

      if (onSuccess) {

        onSuccess()        tank: "",  onOpenChange: (open: boolean) => void

      }

    } catch (error: any) {        batch: 0,  processLogId?: string

      console.error('Error creating test report:', error)

      toast.error(error?.message || 'Failed to create test report')        time: "",  onSuccess?: () => void

    } finally {

      setLoading(false)        temperature: 0,}

    }

  }        ot: "",



  // Get current form data for review        alcohol: 0,const steps = [

  const formData = getValues()

        phosphatase: "",  { id: 1, title: "Basic Information", description: "Enter basic test report details" },

  return (

    <>        ph: 0,  { id: 2, title: "Raw Milk Silos", description: "Raw milk silo test parameters" },

      <Sheet open={open} onOpenChange={onOpenChange}>

        <SheetContent className="tablet-sheet-full overflow-y-auto p-6 bg-white">        cob: false,  { id: 3, title: "Other Tests", description: "Additional test parameters" },

          <SheetHeader className="mb-6">

            <SheetTitle className="flex items-center gap-2">        fat: 0,  { id: 4, title: "Standardisation & Pasteurisation", description: "Pasteurisation process data" },

              <Beaker className="w-5 h-5" />

              Create Steri Milk Test Report        ci_si: "",  { id: 5, title: "UHT Steri Milk", description: "UHT processing parameters" },

            </SheetTitle>

            <SheetDescription>        lr_snf: "",  { id: 6, title: "Review & Submit", description: "Review all data and submit" }

              Complete the test report with all required parameters

            </SheetDescription>        acidity: 0,]

          </SheetHeader>

        analyst: "",

          {/* Progress Steps */}

          <div className="mb-6">        remarks: ""// Step 1: Basic Information Component

            <div className="flex items-center justify-between">

              {steps.map((step, index) => (      },function Step1BasicInfo({ 

                <div key={step.id} className="flex items-center">

                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= step.id      uht_steri_milk: {  control, 

                      ? 'bg-blue-500 text-white'

                      : 'bg-gray-200 text-gray-600'        time: "",  errors, 

                    }`}>

                    {currentStep > step.id ? (        batch: "",  users, 

                      <CheckCircle className="w-4 h-4" />

                    ) : (        temperature: 0,  loadingUsers, 

                      <span className="text-sm font-medium">{step.id}</span>

                    )}        ot: "",  watch, 

                  </div>

                  {index < steps.length - 1 && (        alc: 0,  setValue 

                    <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'

                      }`} />        res: 0,}: { 

                  )}

                </div>        cob: false,  control: any

              ))}

            </div>        ph: 0,  errors: any

            <div className="mt-2">

              <h3 className="text-sm font-medium">{steps[currentStep - 1].title}</h3>        fat: 0,  users: UserEntity[]

              <p className="text-xs text-gray-500">{steps[currentStep - 1].description}</p>

            </div>        lr_snf: "",  loadingUsers: boolean

          </div>

        ci_si: "",  watch: any

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* STEP 1: Basic Information */}        total_solids: 0,  setValue: any

            <div style={{ display: currentStep === 1 ? 'block' : 'none' }} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">        acidity: 0,}) {

                <div>

                  <Label htmlFor="issue_date">Issue Date</Label>        coffee: 0,  const [signatureOpen, setSignatureOpen] = useState(false)

                  <Controller

                    name="issue_date"        coffee_remarks: "",  const [signatureViewOpen, setSignatureViewOpen] = useState(false)

                    control={control}

                    render={({ field }) => (        hydrogen_peroxide_or_turbidity: "",

                      <DatePicker

                        value={field.value}        analyst: "",  const handleUserSearch = async (query: string) => {

                        onChange={field.onChange}

                        placeholder="Select issue date"        remarks: ""    if (!query.trim()) return []

                      />

                    )}      }    try {

                  />

                  {errors.issue_date && (    }      const usersResponse = await usersApi.getUsers({ filters: { search: query } })

                    <p className="text-red-500 text-sm mt-1">{errors.issue_date.message}</p>

                  )}  })      return (usersResponse.data || []).map(user => ({

                </div>

                <div>        value: user.id,

                  <Label htmlFor="date_of_production">Date of Production</Label>

                  <Controller  const { control, handleSubmit, formState: { errors }, watch, setValue, reset, getValues } = form        label: `${user.first_name} ${user.last_name}`.trim() || user.email,

                    name="date_of_production"

                    control={control}        description: `${user.department} • ${user.email}`

                    render={({ field }) => (

                      <Input  // Fetch users and tankers when drawer opens      }))

                        {...field}

                        type="date"  useEffect(() => {    } catch (error) {

                        className="mt-1 bg-gray-50"

                        disabled    if (!open) return      return []

                      />

                    )}    }

                  />

                  {errors.date_of_production && (    const loadData = async () => {  }

                    <p className="text-red-500 text-sm mt-1">{errors.date_of_production.message}</p>

                  )}      setLoadingUsers(true)

                </div>

              </div>      setLoadingTankers(true)  return (

              <div className="grid grid-cols-2 gap-4">

                <div>    <>

                  <Label htmlFor="batch_number">Batch Number</Label>

                  <Controller      try {      <div className="space-y-4">

                    name="batch_number"

                    control={control}        const [usersResponse, tankersResponse] = await Promise.all([        <div className="grid grid-cols-2 gap-4">

                    render={({ field }) => (

                      <Input          usersApi.getUsers(),          <div>

                        {...field}

                        type="number"          tankerApi.getAll()            <Label htmlFor="issue_date">Issue Date</Label>

                        className="mt-1 bg-gray-50"

                        onChange={(e) => field.onChange(parseInt(e.target.value))}        ])            <Controller

                        disabled

                      />        setUsers(usersResponse.data || [])              name="issue_date"

                    )}

                  />        setTankers(tankersResponse.data || [])              control={control}

                  {errors.batch_number && (

                    <p className="text-red-500 text-sm mt-1">{errors.batch_number.message}</p>      } catch (error) {              render={({ field }) => (

                  )}

                </div>        console.error('Failed to fetch data:', error)                <DatePicker

                <div>

                  <Label htmlFor="variety">Variety</Label>        toast.error('Failed to load form data')                  value={field.value}

                  <Controller

                    name="variety"      } finally {                  onChange={field.onChange}

                    control={control}

                    render={({ field }) => (        setLoadingUsers(false)                  placeholder="Select issue date"

                      <Input {...field} className="mt-1" />

                    )}        setLoadingTankers(false)                />

                  />

                  {errors.variety && (      }              )}

                    <p className="text-red-500 text-sm mt-1">{errors.variety.message}</p>

                  )}    }            />

                </div>

              </div>            {errors.issue_date && (

              <div className="grid grid-cols-2 gap-4">

                <div>    loadData()              <p className="text-red-500 text-sm mt-1">{errors.issue_date.message}</p>

                  <Label htmlFor="approved_by">Approved By</Label>

                  <Controller  }, [open])            )}

                    name="approved_by"

                    control={control}          </div>

                    render={({ field }) => (

                      <SearchableSelect  // Fetch process log and prefill data          <div>

                        options={users.map(user => ({

                          value: user.id,  useEffect(() => {            <Label htmlFor="date_of_production">Date of Production</Label>

                          label: `${user.first_name} ${user.last_name}`.trim() || user.email,

                          description: `${user.department} • ${user.email}`    if (!open || !processLogId) return            <Controller

                        }))}

                        value={field.value}              name="date_of_production"

                        onValueChange={field.onChange}

                        onSearch={handleUserSearch}    const loadProcessLog = async () => {              control={control}

                        placeholder="Search and select approver"

                        searchPlaceholder="Search users..."      try {              render={({ field }) => (

                        emptyMessage="No users found"

                        loading={loadingUsers}        const processLogResponse = await steriMilkProcessLogApi.getLog(processLogId)                <Input

                      />

                    )}        if (processLogResponse) {                  {...field}

                  />

                  {errors.approved_by && (          const batchNumber = (processLogResponse as any).batch_id?.batch_number || 1001                  type="date"

                    <p className="text-red-500 text-sm mt-1">{errors.approved_by.message}</p>

                  )}          setValue('batch_number', batchNumber, { shouldValidate: false })                  className="mt-1 bg-gray-50"

                </div>

                <div>          setValue('date_of_production', (processLogResponse as any).batch_id?.created_at ?                  disabled

                  <Label htmlFor="approver_signature">Approver Signature</Label>

                  <Controller            new Date((processLogResponse as any).batch_id.created_at).toISOString().split('T')[0] :                />

                    name="approver_signature"

                    control={control}            new Date().toISOString().split('T')[0], { shouldValidate: false })              )}

                    render={({ field }) => (

                      <div className="space-y-2">          setValue('standardisation_and_pasteurisation.batch', batchNumber, { shouldValidate: false })            />

                        {field.value ? (

                          <img src={base64ToPngDataUrl(field.value)} alt="Approver signature" className="h-24 border border-gray-200 rounded-md bg-white" />          setValue('uht_steri_milk.batch', String(batchNumber), { shouldValidate: false })            {errors.date_of_production && (

                        ) : (

                          <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">        }              <p className="text-red-500 text-sm mt-1">{errors.date_of_production.message}</p>

                            No signature captured

                          </div>      } catch (error) {            )}

                        )}

                        <div className="flex items-center gap-2">        console.error('Failed to fetch process log:', error)          </div>

                          <Button type="button"  size="sm" className="rounded-full" onClick={() => setSignatureOpen(true)}>

                            Add Signature        toast.error('Failed to load batch data')        </div>

                          </Button>

                          {field.value && (      }        <div className="grid grid-cols-2 gap-4">

                            <>

                              <Button type="button"  size="sm" className="rounded-full" onClick={() => setSignatureViewOpen(true)}>    }          <div>

                                View Signature

                              </Button>            <Label htmlFor="batch_number">Batch Number</Label>

                              <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => field.onChange("")}>Clear</Button>

                            </>    loadProcessLog()            <Controller

                          )}

                        </div>  }, [open, processLogId, setValue])              name="batch_number"

                      </div>

                    )}              control={control}

                  />

                  {errors.approver_signature && (  const handleUserSearch = async (query: string) => {              render={({ field }) => (

                    <p className="text-red-500 text-sm mt-1">{errors.approver_signature.message}</p>

                  )}    if (!query.trim()) return []                <Input

                </div>

              </div>    try {                  {...field}

            </div>

      const usersResponse = await usersApi.getUsers({ filters: { search: query } })                  type="number"

            {/* STEP 2: Raw Milk Silos */}

            <div style={{ display: currentStep === 2 ? 'block' : 'none' }} className="space-y-4">      return (usersResponse.data || []).map(user => ({                  className="mt-1 bg-gray-50"

              <h3 className="text-lg font-medium">Raw Milk Silos Test Parameters</h3>

              <div className="grid grid-cols-2 gap-4">        value: user.id,                  onChange={(e) => field.onChange(parseInt(e.target.value))}

                <div>

                  <Label htmlFor="raw_milk_silos.tank">Tank</Label>        label: `${user.first_name} ${user.last_name}`.trim() || user.email,                  disabled

                  <Controller

                    name="raw_milk_silos.tank"        description: `${user.department} • ${user.email}`                />

                    control={control}

                    render={({ field }) => (      }))              )}

                      <SearchableSelect

                        options={tankers.map(tanker => ({    } catch (error) {            />

                          value: tanker.id,

                          label: `${tanker.reg_number} (${tanker.condition})`,      return []            {errors.batch_number && (

                          description: `${tanker.capacity}L capacity • ${tanker.age} years old`

                        }))}    }              <p className="text-red-500 text-sm mt-1">{errors.batch_number.message}</p>

                        value={field.value}

                        onValueChange={field.onChange}  }            )}

                        onSearch={handleTankerSearch}

                        placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}          </div>

                        searchPlaceholder="Search tankers..."

                        emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}  const handleTankerSearch = async (query: string) => {          <div>

                        loading={loadingTankers}

                      />    if (!query.trim()) return []            <Label htmlFor="variety">Variety</Label>

                    )}

                  />    try {            <Controller

                </div>

                <div>      const tankersResponse = await tankerApi.getAll()              name="variety"

                  <Controller

                    name="raw_milk_silos.time"      return (tankersResponse.data || [])              control={control}

                    control={control}

                    render={({ field }) => (        .filter(tanker =>              render={({ field }) => (

                      <DatePicker

                        value={field.value}          tanker.reg_number.toLowerCase().includes(query.toLowerCase()) ||                <Input {...field} className="mt-1" />

                        onChange={field.onChange}

                        label="Time"          tanker.condition.toLowerCase().includes(query.toLowerCase())              )}

                        showTime={true}

                        placeholder="Select date and time"        )            />

                      />

                    )}        .map(tanker => ({            {errors.variety && (

                  />

                </div>          value: tanker.id,              <p className="text-red-500 text-sm mt-1">{errors.variety.message}</p>

              </div>

              <div className="grid grid-cols-3 gap-4">          label: `${tanker.reg_number} (${tanker.condition})`,            )}

                <div>

                  <Label htmlFor="raw_milk_silos.temperature">Temperature (°C)</Label>          description: `${tanker.capacity}L capacity • ${tanker.age} years old`          </div>

                  <Controller

                    name="raw_milk_silos.temperature"        }))        </div>

                    control={control}

                    render={({ field }) => (    } catch (error) {        <div className="grid grid-cols-2 gap-4">

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}      return []          <div>

                  />

                </div>    }            <Label htmlFor="approved_by">Approved By</Label>

                <div>

                  <Label htmlFor="raw_milk_silos.alcohol">Alcohol (%)</Label>  }            <Controller

                  <Controller

                    name="raw_milk_silos.alcohol"              name="approved_by"

                    control={control}

                    render={({ field }) => (  const nextStep = () => {              control={control}

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}    if (currentStep < steps.length) {              render={({ field }) => (

                  />

                </div>      setCurrentStep(currentStep + 1)                <SearchableSelect

                <div>

                  <Label htmlFor="raw_milk_silos.res">RES</Label>    }                  options={users.map(user => ({

                  <Controller

                    name="raw_milk_silos.res"  }                    value: user.id,

                    control={control}

                    render={({ field }) => (                    label: `${user.first_name} ${user.last_name}`.trim() || user.email,

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}  const prevStep = () => {                    description: `${user.department} • ${user.email}`

                  />

                </div>    if (currentStep > 1) {                  }))}

              </div>

              <div className="grid grid-cols-3 gap-4">      setCurrentStep(currentStep - 1)                  value={field.value}

                <div>

                  <Label htmlFor="raw_milk_silos.cob">COB</Label>    }                  onValueChange={field.onChange}

                  <Controller

                    name="raw_milk_silos.cob"  }                  onSearch={handleUserSearch}

                    control={control}

                    render={({ field }) => (                  placeholder="Search and select approver"

                      <div className="mt-1">

                        <input  const onSubmit: SubmitHandler<TestReportFormData> = async (data) => {                  searchPlaceholder="Search users..."

                          type="checkbox"

                          checked={field.value}    try {                  emptyMessage="No users found"

                          onChange={field.onChange}

                          className="mr-2"      setLoading(true)                  loading={loadingUsers}

                        />

                        <span className="text-sm">COB Present</span>                />

                      </div>

                    )}      console.log('Steri Milk Test Report Form Data:', data)              )}

                  />

                </div>            />

                <div>

                  <Label htmlFor="raw_milk_silos.ph">pH</Label>      const normalizedSignature = normalizeDataUrlToBase64(data.approver_signature)            {errors.approved_by && (

                  <Controller

                    name="raw_milk_silos.ph"              <p className="text-red-500 text-sm mt-1">{errors.approved_by.message}</p>

                    control={control}

                    render={({ field }) => (      const payload: CreateSteriMilkTestReportRequest = {            )}

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}        issue_date: data.issue_date,          </div>

                  />

                </div>        approved_by: data.approved_by,          <div>

                <div>

                  <Label htmlFor="raw_milk_silos.fat">Fat (%)</Label>        approver_signature: normalizedSignature,            <Label htmlFor="approver_signature">Approver Signature</Label>

                  <Controller

                    name="raw_milk_silos.fat"        date_of_production: data.date_of_production,            <Controller

                    control={control}

                    render={({ field }) => (        batch_number: data.batch_number,              name="approver_signature"

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}        variety: data.variety,              control={control}

                  />

                </div>        raw_milk_silos: [data.raw_milk_silos],              render={({ field }) => (

              </div>

              <div className="grid grid-cols-2 gap-4">        other_tests: [data.other_tests],                <div className="space-y-2">

                <div>

                  <Label htmlFor="raw_milk_silos.lr_snf">LR/SNF</Label>        standardisation_and_pasteurisation: [data.standardisation_and_pasteurisation],                  {field.value ? (

                  <Controller

                    name="raw_milk_silos.lr_snf"        uht_steri_milk: [data.uht_steri_milk]                    <img src={base64ToPngDataUrl(field.value)} alt="Approver signature" className="h-24 border border-gray-200 rounded-md bg-white" />

                    control={control}

                    render={({ field }) => (      }                  ) : (

                      <Input {...field} className="mt-1" />

                    )}                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">

                  />

                </div>      console.log('Steri Milk Test Report Payload:', payload)                      No signature captured

                <div>

                  <Label htmlFor="raw_milk_silos.acidity">Acidity</Label>                    </div>

                  <Controller

                    name="raw_milk_silos.acidity"      await steriMilkTestReportApi.createTestReport(payload)                  )}

                    control={control}

                    render={({ field }) => (      toast.success('Steri Milk Test Report created successfully')                  <div className="flex items-center gap-2">

                      <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}                    <Button type="button"  size="sm" className="rounded-full" onClick={() => setSignatureOpen(true)}>

                  />

                </div>      reset()                      Add Signature

              </div>

              <div>      setCurrentStep(1)                    </Button>

                <Label htmlFor="raw_milk_silos.remarks">Remarks</Label>

                <Controller      onOpenChange(false)                    {field.value && (

                  name="raw_milk_silos.remarks"

                  control={control}      if (onSuccess) {                      <Button type="button"  size="sm" className="rounded-full" onClick={() => setSignatureViewOpen(true)}>

                  render={({ field }) => (

                    <Input {...field} className="mt-1" />        onSuccess()                        View Signature

                  )}

                />      }                      </Button>

              </div>

            </div>    } catch (error: any) {                    )}



            {/* STEP 3: Other Tests */}      console.error('Error creating test report:', error)                    {field.value && (

            <div style={{ display: currentStep === 3 ? 'block' : 'none' }} className="space-y-4">

              <h3 className="text-lg font-medium">Other Tests Parameters</h3>      toast.error(error?.message || 'Failed to create test report')                      <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => field.onChange("")}>Clear</Button>

              <div>

                <Label htmlFor="other_tests.sample_details">Sample Details</Label>    } finally {                    )}

                <Controller

                  name="other_tests.sample_details"      setLoading(false)                  </div>

                  control={control}

                  render={({ field }) => (    }                </div>

                    <Input {...field} className="mt-1" />

                  )}  }              )}

                />

              </div>            />

              <div className="grid grid-cols-3 gap-4">

                <div>  // Get current form data for review            {errors.approver_signature && (

                  <Label htmlFor="other_tests.ph">pH</Label>

                  <Controller  const formData = getValues()              <p className="text-red-500 text-sm mt-1">{errors.approver_signature.message}</p>

                    name="other_tests.ph"

                    control={control}            )}

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />  return (          </div>

                    )}

                  />    <>        </div>

                </div>

                <div>      <Sheet open={open} onOpenChange={onOpenChange}>      </div>

                  <Label htmlFor="other_tests.caustic">Caustic</Label>

                  <Controller        <SheetContent className="tablet-sheet-full overflow-y-auto p-6 bg-white">

                    name="other_tests.caustic"

                    control={control}          <SheetHeader className="mb-6">      <SignatureModal

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />            <SheetTitle className="flex items-center gap-2">        open={signatureOpen}

                    )}

                  />              <Beaker className="w-5 h-5" />        onOpenChange={setSignatureOpen}

                </div>

                <div>              Create Steri Milk Test Report        title="Capture Approver Signature"

                  <Label htmlFor="other_tests.acid">Acid</Label>

                  <Controller            </SheetTitle>        onSave={(dataUrl) => {

                    name="other_tests.acid"

                    control={control}            <SheetDescription>          setValue("approver_signature", dataUrl, { shouldValidate: true })

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />              Complete the test report with all required parameters        }}

                    )}

                  />            </SheetDescription>      />

                </div>

              </div>          </SheetHeader>      <SignatureViewer

              <div className="grid grid-cols-3 gap-4">

                <div>        open={signatureViewOpen}

                  <Label htmlFor="other_tests.chlorine">Chlorine</Label>

                  <Controller          {/* Progress Steps */}        onOpenChange={setSignatureViewOpen}

                    name="other_tests.chlorine"

                    control={control}          <div className="mb-6">        title="Approver Signature"

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />            <div className="flex items-center justify-between">        value={watch("approver_signature")}

                    )}

                  />              {steps.map((step, index) => (      />

                </div>

                <div>                <div key={step.id} className="flex items-center">    </>

                  <Label htmlFor="other_tests.hd">HD</Label>

                  <Controller                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= step.id  )

                    name="other_tests.hd"

                    control={control}                      ? 'bg-blue-500 text-white'}

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                      : 'bg-gray-200 text-gray-600'

                    )}

                  />                    }`}>// Step 2: Raw Milk Silos Component

                </div>

                <div>                    {currentStep > step.id ? (function Step2RawMilkSilos({ 

                  <Label htmlFor="other_tests.tds">TDS</Label>

                  <Controller                      <CheckCircle className="w-4 h-4" />  control, 

                    name="other_tests.tds"

                    control={control}                    ) : (  tankers, 

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                      <span className="text-sm font-medium">{step.id}</span>  loadingTankers 

                    )}

                  />                    )}}: { 

                </div>

              </div>                  </div>  control: any

              <div>

                <Label htmlFor="other_tests.hydrogen_peroxide">Hydrogen Peroxide</Label>                  {index < steps.length - 1 && (  tankers: Tanker[]

                <Controller

                  name="other_tests.hydrogen_peroxide"                    <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'  loadingTankers: boolean

                  control={control}

                  render={({ field }) => (                      }`} />}) {

                    <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                  )}                  )}  const handleTankerSearch = async (query: string) => {

                />

              </div>                </div>    if (!query.trim()) return []

              <div>

                <Label htmlFor="other_tests.remarks">Remarks</Label>              ))}    try {

                <Controller

                  name="other_tests.remarks"            </div>      const tankersResponse = await tankerApi.getAll()

                  control={control}

                  render={({ field }) => (            <div className="mt-2">      return (tankersResponse.data || [])

                    <Input {...field} className="mt-1" />

                  )}              <h3 className="text-sm font-medium">{steps[currentStep - 1].title}</h3>        .filter(tanker =>

                />

              </div>              <p className="text-xs text-gray-500">{steps[currentStep - 1].description}</p>          tanker.reg_number.toLowerCase().includes(query.toLowerCase()) ||

            </div>

            </div>          tanker.condition.toLowerCase().includes(query.toLowerCase())

            {/* STEP 4: Standardisation & Pasteurisation */}

            <div style={{ display: currentStep === 4 ? 'block' : 'none' }} className="space-y-4">          </div>        )

              <h3 className="text-lg font-medium">Standardisation & Pasteurisation</h3>

              <div className="grid grid-cols-2 gap-4">        .map(tanker => ({

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.tank">Tank</Label>          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">          value: tanker.id,

                  <Controller

                    name="standardisation_and_pasteurisation.tank"            {/* STEP 1: Basic Information */}          label: `${tanker.reg_number} (${tanker.condition})`,

                    control={control}

                    render={({ field }) => (            <div style={{ display: currentStep === 1 ? 'block' : 'none' }} className="space-y-4">          description: `${tanker.capacity}L capacity • ${tanker.age} years old`

                      <SearchableSelect

                        options={tankers.map(tanker => ({              <div className="grid grid-cols-2 gap-4">        }))

                          value: tanker.id,

                          label: `${tanker.reg_number} (${tanker.condition})`,                <div>    } catch (error) {

                          description: `${tanker.capacity}L capacity • ${tanker.age} years old`

                        }))}                  <Label htmlFor="issue_date">Issue Date</Label>      return []

                        value={field.value}

                        onValueChange={field.onChange}                  <Controller    }

                        onSearch={handleTankerSearch}

                        placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}                    name="issue_date"  }

                        searchPlaceholder="Search tankers..."

                        emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}                    control={control}

                        loading={loadingTankers}

                      />                    render={({ field }) => (  return (

                    )}

                  />                      <DatePicker    <div className="space-y-4">

                </div>

                <div>                        value={field.value}      <h3 className="text-lg font-medium">Raw Milk Silos Test Parameters</h3>

                  <Label htmlFor="standardisation_and_pasteurisation.batch">Batch</Label>

                  <Controller                        onChange={field.onChange}      <div className="grid grid-cols-2 gap-4">

                    name="standardisation_and_pasteurisation.batch"

                    control={control}                        placeholder="Select issue date"        <div>

                    render={({ field }) => (

                      <Input {...field} disabled className="mt-1 bg-gray-50" />                      />          <Label htmlFor="raw_milk_silos.tank">Tank</Label>

                    )}

                  />                    )}          <Controller

                </div>

              </div>                  />            name="raw_milk_silos.tank"

              <div className="grid grid-cols-2 gap-4">

                <div>                  {errors.issue_date && (            control={control}

                  <Controller

                    name="standardisation_and_pasteurisation.time"                    <p className="text-red-500 text-sm mt-1">{errors.issue_date.message}</p>            render={({ field }) => (

                    control={control}

                    render={({ field }) => (                  )}              <SearchableSelect

                      <DatePicker

                        value={field.value}                </div>                options={tankers.map(tanker => ({

                        onChange={field.onChange}

                        label="Time"                <div>                  value: tanker.id,

                        showTime={true}

                        placeholder="Select date and time"                  <Label htmlFor="date_of_production">Date of Production</Label>                  label: `${tanker.reg_number} (${tanker.condition})`,

                      />

                    )}                  <Controller                  description: `${tanker.capacity}L capacity • ${tanker.age} years old`

                  />

                </div>                    name="date_of_production"                }))}

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.temperature">Temperature (°C)</Label>                    control={control}                value={field.value}

                  <Controller

                    name="standardisation_and_pasteurisation.temperature"                    render={({ field }) => (                onValueChange={field.onChange}

                    control={control}

                    render={({ field }) => (                      <Input                onSearch={handleTankerSearch}

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}                        {...field}                placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}

                  />

                </div>                        type="date"                searchPlaceholder="Search tankers..."

              </div>

              <div className="grid grid-cols-3 gap-4">                        className="mt-1 bg-gray-50"                emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.ot">OT</Label>                        disabled                loading={loadingTankers}

                  <Controller

                    name="standardisation_and_pasteurisation.ot"                      />              />

                    control={control}

                    render={({ field }) => (                    )}            )}

                      <Input {...field} className="mt-1" />

                    )}                  />          />

                  />

                </div>                  {errors.date_of_production && (        </div>

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.alcohol">Alcohol (%)</Label>                    <p className="text-red-500 text-sm mt-1">{errors.date_of_production.message}</p>        <div>

                  <Controller

                    name="standardisation_and_pasteurisation.alcohol"                  )}          <Controller

                    control={control}

                    render={({ field }) => (                </div>            name="raw_milk_silos.time"

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}              </div>            control={control}

                  />

                </div>              <div className="grid grid-cols-2 gap-4">            render={({ field }) => (

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.phosphatase">Phosphatase</Label>                <div>              <DatePicker

                  <Controller

                    name="standardisation_and_pasteurisation.phosphatase"                  <Label htmlFor="batch_number">Batch Number</Label>                value={field.value}

                    control={control}

                    render={({ field }) => (                  <Controller                onChange={field.onChange}

                      <Input {...field} className="mt-1" />

                    )}                    name="batch_number"                label="Time"

                  />

                </div>                    control={control}                showTime={true}

              </div>

              <div className="grid grid-cols-3 gap-4">                    render={({ field }) => (                placeholder="Select date and time"

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.ph">pH</Label>                      <Input              />

                  <Controller

                    name="standardisation_and_pasteurisation.ph"                        {...field}            )}

                    control={control}

                    render={({ field }) => (                        type="number"          />

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}                        className="mt-1 bg-gray-50"        </div>

                  />

                </div>                        onChange={(e) => field.onChange(parseInt(e.target.value))}      </div>

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.cob">COB</Label>                        disabled      <div className="grid grid-cols-3 gap-4">

                  <Controller

                    name="standardisation_and_pasteurisation.cob"                      />        <div>

                    control={control}

                    render={({ field }) => (                    )}          <Label htmlFor="raw_milk_silos.temperature">Temperature (°C)</Label>

                      <div className="mt-1">

                        <input                  />          <Controller

                          type="checkbox"

                          checked={field.value}                  {errors.batch_number && (            name="raw_milk_silos.temperature"

                          onChange={field.onChange}

                          className="mr-2"                    <p className="text-red-500 text-sm mt-1">{errors.batch_number.message}</p>            control={control}

                        />

                        <span className="text-sm">COB Present</span>                  )}            render={({ field }) => (

                      </div>

                    )}                </div>              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                  />

                </div>                <div>            )}

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.fat">Fat (%)</Label>                  <Label htmlFor="variety">Variety</Label>          />

                  <Controller

                    name="standardisation_and_pasteurisation.fat"                  <Controller        </div>

                    control={control}

                    render={({ field }) => (                    name="variety"        <div>

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}                    control={control}          <Label htmlFor="raw_milk_silos.alcohol">Alcohol (%)</Label>

                  />

                </div>                    render={({ field }) => (          <Controller

              </div>

              <div className="grid grid-cols-2 gap-4">                      <Input {...field} className="mt-1" />            name="raw_milk_silos.alcohol"

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.ci_si">CI/SI</Label>                    )}            control={control}

                  <Controller

                    name="standardisation_and_pasteurisation.ci_si"                  />            render={({ field }) => (

                    control={control}

                    render={({ field }) => (                  {errors.variety && (              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                      <Input {...field} className="mt-1" />

                    )}                    <p className="text-red-500 text-sm mt-1">{errors.variety.message}</p>            )}

                  />

                </div>                  )}          />

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.lr_snf">LR/SNF</Label>                </div>        </div>

                  <Controller

                    name="standardisation_and_pasteurisation.lr_snf"              </div>        <div>

                    control={control}

                    render={({ field }) => (              <div className="grid grid-cols-2 gap-4">          <Label htmlFor="raw_milk_silos.res">RES</Label>

                      <Input {...field} className="mt-1" />

                    )}                <div>          <Controller

                  />

                </div>                  <Label htmlFor="approved_by">Approved By</Label>            name="raw_milk_silos.res"

              </div>

              <div className="grid grid-cols-2 gap-4">                  <Controller            control={control}

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.acidity">Acidity</Label>                    name="approved_by"            render={({ field }) => (

                  <Controller

                    name="standardisation_and_pasteurisation.acidity"                    control={control}              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    control={control}

                    render={({ field }) => (                    render={({ field }) => (            )}

                      <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}                      <SearchableSelect          />

                  />

                </div>                        options={users.map(user => ({        </div>

                <div>

                  <Label htmlFor="standardisation_and_pasteurisation.analyst">Analyst</Label>                          value: user.id,      </div>

                  <Controller

                    name="standardisation_and_pasteurisation.analyst"                          label: `${user.first_name} ${user.last_name}`.trim() || user.email,      <div className="grid grid-cols-3 gap-4">

                    control={control}

                    render={({ field }) => (                          description: `${user.department} • ${user.email}`        <div>

                      <SearchableSelect

                        options={users.map(user => ({                        }))}          <Label htmlFor="raw_milk_silos.cob">COB</Label>

                          value: user.id,

                          label: `${user.first_name} ${user.last_name}`.trim() || user.email,                        value={field.value}          <Controller

                          description: `${user.department} • ${user.email}`

                        }))}                        onValueChange={field.onChange}            name="raw_milk_silos.cob"

                        value={field.value}

                        onValueChange={field.onChange}                        onSearch={handleUserSearch}            control={control}

                        onSearch={handleUserSearch}

                        placeholder="Search and select analyst"                        placeholder="Search and select approver"            render={({ field }) => (

                        searchPlaceholder="Search users..."

                        emptyMessage="No users found"                        searchPlaceholder="Search users..."              <div className="mt-1">

                        loading={loadingUsers}

                      />                        emptyMessage="No users found"                <input

                    )}

                  />                        loading={loadingUsers}                  type="checkbox"

                </div>

              </div>                      />                  checked={field.value}

              <div>

                <Label htmlFor="standardisation_and_pasteurisation.remarks">Remarks</Label>                    )}                  onChange={field.onChange}

                <Controller

                  name="standardisation_and_pasteurisation.remarks"                  />                  className="mr-2"

                  control={control}

                  render={({ field }) => (                  {errors.approved_by && (                />

                    <Input {...field} className="mt-1" />

                  )}                    <p className="text-red-500 text-sm mt-1">{errors.approved_by.message}</p>                <span className="text-sm">COB Present</span>

                />

              </div>                  )}              </div>

            </div>

                </div>            )}

            {/* STEP 5: UHT Steri Milk */}

            <div style={{ display: currentStep === 5 ? 'block' : 'none' }} className="space-y-4">                <div>          />

              <h3 className="text-lg font-medium">UHT Steri Milk Parameters</h3>

              <div className="grid grid-cols-2 gap-4">                  <Label htmlFor="approver_signature">Approver Signature</Label>        </div>

                <div>

                  <Controller                  <Controller        <div>

                    name="uht_steri_milk.time"

                    control={control}                    name="approver_signature"          <Label htmlFor="raw_milk_silos.ph">pH</Label>

                    render={({ field }) => (

                      <DatePicker                    control={control}          <Controller

                        value={field.value}

                        onChange={field.onChange}                    render={({ field }) => (            name="raw_milk_silos.ph"

                        label="Time"

                        showTime={true}                      <div className="space-y-2">            control={control}

                        placeholder="Select date and time"

                      />                        {field.value ? (            render={({ field }) => (

                    )}

                  />                          <img src={base64ToPngDataUrl(field.value)} alt="Approver signature" className="h-24 border border-gray-200 rounded-md bg-white" />              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                </div>

                <div>                        ) : (            )}

                  <Label htmlFor="uht_steri_milk.batch">Batch</Label>

                  <Controller                          <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">          />

                    name="uht_steri_milk.batch"

                    control={control}                            No signature captured        </div>

                    render={({ field }) => (

                      <Input {...field} disabled className="mt-1 bg-gray-50" />                          </div>        <div>

                    )}

                  />                        )}          <Label htmlFor="raw_milk_silos.fat">Fat (%)</Label>

                </div>

              </div>                        <div className="flex items-center gap-2">          <Controller

              <div className="grid grid-cols-2 gap-4">

                <div>                          <Button type="button"  size="sm" className="rounded-full" onClick={() => setSignatureOpen(true)}>            name="raw_milk_silos.fat"

                  <Label htmlFor="uht_steri_milk.temperature">Temperature (°C)</Label>

                  <Controller                            Add Signature            control={control}

                    name="uht_steri_milk.temperature"

                    control={control}                          </Button>            render={({ field }) => (

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                          {field.value && (              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}

                  />                            <>            )}

                </div>

                <div>                              <Button type="button"  size="sm" className="rounded-full" onClick={() => setSignatureViewOpen(true)}>          />

                  <Label htmlFor="uht_steri_milk.ot">OT</Label>

                  <Controller                                View Signature        </div>

                    name="uht_steri_milk.ot"

                    control={control}                              </Button>      </div>

                    render={({ field }) => (

                      <Input {...field} className="mt-1" />                              <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => field.onChange("")}>Clear</Button>      <div className="grid grid-cols-2 gap-4">

                    )}

                  />                            </>        <div>

                </div>

              </div>                          )}          <Label htmlFor="raw_milk_silos.lr_snf">LR/SNF</Label>

              <div className="grid grid-cols-3 gap-4">

                <div>                        </div>          <Controller

                  <Label htmlFor="uht_steri_milk.alc">ALC</Label>

                  <Controller                      </div>            name="raw_milk_silos.lr_snf"

                    name="uht_steri_milk.alc"

                    control={control}                    )}            control={control}

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                  />            render={({ field }) => (

                    )}

                  />                  {errors.approver_signature && (              <Input {...field} className="mt-1" />

                </div>

                <div>                    <p className="text-red-500 text-sm mt-1">{errors.approver_signature.message}</p>            )}

                  <Label htmlFor="uht_steri_milk.res">RES</Label>

                  <Controller                  )}          />

                    name="uht_steri_milk.res"

                    control={control}                </div>        </div>

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />              </div>        <div>

                    )}

                  />            </div>          <Label htmlFor="raw_milk_silos.acidity">Acidity</Label>

                </div>

                <div>          <Controller

                  <Label htmlFor="uht_steri_milk.cob">COB</Label>

                  <Controller            {/* STEP 2: Raw Milk Silos */}            name="raw_milk_silos.acidity"

                    name="uht_steri_milk.cob"

                    control={control}            <div style={{ display: currentStep === 2 ? 'block' : 'none' }} className="space-y-4">            control={control}

                    render={({ field }) => (

                      <div className="mt-1">              <h3 className="text-lg font-medium">Raw Milk Silos Test Parameters</h3>            render={({ field }) => (

                        <input

                          type="checkbox"              <div className="grid grid-cols-2 gap-4">              <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                          checked={field.value}

                          onChange={field.onChange}                <div>            )}

                          className="mr-2"

                        />                  <Label htmlFor="raw_milk_silos.tank">Tank</Label>          />

                        <span className="text-sm">COB Present</span>

                      </div>                  <Controller        </div>

                    )}

                  />                    name="raw_milk_silos.tank"      </div>

                </div>

              </div>                    control={control}      <div>

              <div className="grid grid-cols-3 gap-4">

                <div>                    render={({ field }) => (        <Label htmlFor="raw_milk_silos.remarks">Remarks</Label>

                  <Label htmlFor="uht_steri_milk.ph">pH</Label>

                  <Controller                      <SearchableSelect        <Controller

                    name="uht_steri_milk.ph"

                    control={control}                        options={tankers.map(tanker => ({          name="raw_milk_silos.remarks"

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                          value: tanker.id,          control={control}

                    )}

                  />                          label: `${tanker.reg_number} (${tanker.condition})`,          render={({ field }) => (

                </div>

                <div>                          description: `${tanker.capacity}L capacity • ${tanker.age} years old`            <Input {...field} className="mt-1" />

                  <Label htmlFor="uht_steri_milk.fat">Fat (%)</Label>

                  <Controller                        }))}          )}

                    name="uht_steri_milk.fat"

                    control={control}                        value={field.value}        />

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                        onValueChange={field.onChange}      </div>

                    )}

                  />                        onSearch={handleTankerSearch}    </div>

                </div>

                <div>                        placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}  )

                  <Label htmlFor="uht_steri_milk.lr_snf">LR/SNF</Label>

                  <Controller                        searchPlaceholder="Search tankers..."}

                    name="uht_steri_milk.lr_snf"

                    control={control}                        emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}

                    render={({ field }) => (

                      <Input {...field} className="mt-1" />                        loading={loadingTankers}// Step 3: Other Tests Component

                    )}

                  />                      />function Step3OtherTests({ control }: { control: any }) {

                </div>

              </div>                    )}  return (

              <div className="grid grid-cols-3 gap-4">

                <div>                  />    <div className="space-y-4">

                  <Label htmlFor="uht_steri_milk.ci_si">CI/SI</Label>

                  <Controller                </div>      <h3 className="text-lg font-medium">Other Tests Parameters</h3>

                    name="uht_steri_milk.ci_si"

                    control={control}                <div>      <div>

                    render={({ field }) => (

                      <Input {...field} className="mt-1" />                  <Controller        <Label htmlFor="other_tests.sample_details">Sample Details</Label>

                    )}

                  />                    name="raw_milk_silos.time"        <Controller

                </div>

                <div>                    control={control}          name="other_tests.sample_details"

                  <Label htmlFor="uht_steri_milk.total_solids">Total Solids</Label>

                  <Controller                    render={({ field }) => (          control={control}

                    name="uht_steri_milk.total_solids"

                    control={control}                      <DatePicker          render={({ field }) => (

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                        value={field.value}            <Input {...field} className="mt-1" />

                    )}

                  />                        onChange={field.onChange}          )}

                </div>

                <div>                        label="Time"        />

                  <Label htmlFor="uht_steri_milk.acidity">Acidity</Label>

                  <Controller                        showTime={true}      </div>

                    name="uht_steri_milk.acidity"

                    control={control}                        placeholder="Select date and time"      <div className="grid grid-cols-3 gap-4">

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                      />        <div>

                    )}

                  />                    )}          <Label htmlFor="other_tests.ph">pH</Label>

                </div>

              </div>                  />          <Controller

              <div className="grid grid-cols-2 gap-4">

                <div>                </div>            name="other_tests.ph"

                  <Label htmlFor="uht_steri_milk.coffee">Coffee</Label>

                  <Controller              </div>            control={control}

                    name="uht_steri_milk.coffee"

                    control={control}              <div className="grid grid-cols-3 gap-4">            render={({ field }) => (

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                <div>              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}

                  />                  <Label htmlFor="raw_milk_silos.temperature">Temperature (°C)</Label>            )}

                </div>

                <div>                  <Controller          />

                  <Label htmlFor="uht_steri_milk.hydrogen_peroxide_or_turbidity">Hydrogen Peroxide/Turbidity</Label>

                  <Controller                    name="raw_milk_silos.temperature"        </div>

                    name="uht_steri_milk.hydrogen_peroxide_or_turbidity"

                    control={control}                    control={control}        <div>

                    render={({ field }) => (

                      <Input {...field} className="mt-1" />                    render={({ field }) => (          <Label htmlFor="other_tests.caustic">Caustic</Label>

                    )}

                  />                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />          <Controller

                </div>

              </div>                    )}            name="other_tests.caustic"

              <div>

                <Label htmlFor="uht_steri_milk.coffee_remarks">Coffee Remarks</Label>                  />            control={control}

                <Controller

                  name="uht_steri_milk.coffee_remarks"                </div>            render={({ field }) => (

                  control={control}

                  render={({ field }) => (                <div>              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    <Input {...field} className="mt-1" />

                  )}                  <Label htmlFor="raw_milk_silos.alcohol">Alcohol (%)</Label>            )}

                />

              </div>                  <Controller          />

              <div className="grid grid-cols-2 gap-4">

                <div>                    name="raw_milk_silos.alcohol"        </div>

                  <Label htmlFor="uht_steri_milk.analyst">Analyst</Label>

                  <Controller                    control={control}        <div>

                    name="uht_steri_milk.analyst"

                    control={control}                    render={({ field }) => (          <Label htmlFor="other_tests.acid">Acid</Label>

                    render={({ field }) => (

                      <SearchableSelect                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />          <Controller

                        options={users.map(user => ({

                          value: user.id,                    )}            name="other_tests.acid"

                          label: `${user.first_name} ${user.last_name}`.trim() || user.email,

                          description: `${user.department} • ${user.email}`                  />            control={control}

                        }))}

                        value={field.value}                </div>            render={({ field }) => (

                        onValueChange={field.onChange}

                        onSearch={handleUserSearch}                <div>              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                        placeholder="Search and select analyst"

                        searchPlaceholder="Search users..."                  <Label htmlFor="raw_milk_silos.res">RES</Label>            )}

                        emptyMessage="No users found"

                        loading={loadingUsers}                  <Controller          />

                      />

                    )}                    name="raw_milk_silos.res"        </div>

                  />

                </div>                    control={control}      </div>

              </div>

              <div>                    render={({ field }) => (      <div className="grid grid-cols-3 gap-4">

                <Label htmlFor="uht_steri_milk.remarks">Remarks</Label>

                <Controller                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />        <div>

                  name="uht_steri_milk.remarks"

                  control={control}                    )}          <Label htmlFor="other_tests.chlorine">Chlorine</Label>

                  render={({ field }) => (

                    <Input {...field} className="mt-1" />                  />          <Controller

                  )}

                />                </div>            name="other_tests.chlorine"

              </div>

            </div>              </div>            control={control}



            {/* STEP 6: Review */}              <div className="grid grid-cols-3 gap-4">            render={({ field }) => (

            <div style={{ display: currentStep === 6 ? 'block' : 'none' }} className="space-y-4">

              <h3 className="text-lg font-medium">Review & Submit</h3>                <div>              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

              <div className="bg-gray-50 p-4 rounded-lg">

                <h4 className="font-medium mb-2">Basic Information</h4>                  <Label htmlFor="raw_milk_silos.cob">COB</Label>            )}

                <p><strong>Issue Date:</strong> {formData.issue_date}</p>

                <p><strong>Date of Production:</strong> {formData.date_of_production}</p>                  <Controller          />

                <p><strong>Batch Number:</strong> {formData.batch_number}</p>

                <p><strong>Variety:</strong> {formData.variety}</p>                    name="raw_milk_silos.cob"        </div>

                <p><strong>Approved By:</strong> {

                  users.find(user => user.id === formData.approved_by)?.first_name + ' ' +                    control={control}        <div>

                  users.find(user => user.id === formData.approved_by)?.last_name ||

                  formData.approved_by                    render={({ field }) => (          <Label htmlFor="other_tests.hd">HD</Label>

                }</p>

                <p><strong>Approver Signature:</strong> {formData.approver_signature ? 'Captured' : 'Not captured'}</p>                      <div className="mt-1">          <Controller

              </div>

              <div className="bg-gray-50 p-4 rounded-lg">                        <input            name="other_tests.hd"

                <h4 className="font-medium mb-2">Raw Milk Silos</h4>

                <p><strong>Tanker:</strong> {                          type="checkbox"            control={control}

                  tankers.find(tanker => tanker.id === formData.raw_milk_silos?.tank)?.reg_number ||

                  formData.raw_milk_silos?.tank || 'Not selected'                          checked={field.value}            render={({ field }) => (

                }</p>

                <p><strong>Time:</strong> {formData.raw_milk_silos?.time || 'Not set'}</p>                          onChange={field.onChange}              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                <p><strong>Temperature:</strong> {formData.raw_milk_silos?.temperature}°C</p>

                <p><strong>pH:</strong> {formData.raw_milk_silos?.ph}</p>                          className="mr-2"            )}

                <p><strong>Fat:</strong> {formData.raw_milk_silos?.fat}%</p>

              </div>                        />          />

              <div className="bg-gray-50 p-4 rounded-lg">

                <h4 className="font-medium mb-2">Other Tests</h4>                        <span className="text-sm">COB Present</span>        </div>

                <p><strong>Sample Details:</strong> {formData.other_tests?.sample_details || 'Not provided'}</p>

                <p><strong>pH:</strong> {formData.other_tests?.ph}</p>                      </div>        <div>

                <p><strong>TDS:</strong> {formData.other_tests?.tds}</p>

              </div>                    )}          <Label htmlFor="other_tests.tds">TDS</Label>

              <div className="bg-gray-50 p-4 rounded-lg">

                <h4 className="font-medium mb-2">Standardisation & Pasteurisation</h4>                  />          <Controller

                <p><strong>Tanker:</strong> {

                  tankers.find(tanker => tanker.id === formData.standardisation_and_pasteurisation?.tank)?.reg_number ||                </div>            name="other_tests.tds"

                  formData.standardisation_and_pasteurisation?.tank || 'Not selected'

                }</p>                <div>            control={control}

                <p><strong>Batch:</strong> {formData.standardisation_and_pasteurisation?.batch}</p>

                <p><strong>Time:</strong> {formData.standardisation_and_pasteurisation?.time || 'Not set'}</p>                  <Label htmlFor="raw_milk_silos.ph">pH</Label>            render={({ field }) => (

                <p><strong>Temperature:</strong> {formData.standardisation_and_pasteurisation?.temperature}°C</p>

                <p><strong>Phosphatase:</strong> {formData.standardisation_and_pasteurisation?.phosphatase || 'Not tested'}</p>                  <Controller              <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                <p><strong>Analyst:</strong> {

                  users.find(user => user.id === formData.standardisation_and_pasteurisation?.analyst)?.first_name + ' ' +                    name="raw_milk_silos.ph"            )}

                  users.find(user => user.id === formData.standardisation_and_pasteurisation?.analyst)?.last_name ||

                  formData.standardisation_and_pasteurisation?.analyst || 'Not assigned'                    control={control}          />

                }</p>

              </div>                    render={({ field }) => (        </div>

              <div className="bg-gray-50 p-4 rounded-lg">

                <h4 className="font-medium mb-2">UHT Steri Milk</h4>                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />      </div>

                <p><strong>Time:</strong> {formData.uht_steri_milk?.time || 'Not set'}</p>

                <p><strong>Batch:</strong> {formData.uht_steri_milk?.batch}</p>                    )}      <div>

                <p><strong>Temperature:</strong> {formData.uht_steri_milk?.temperature}°C</p>

                <p><strong>Total Solids:</strong> {formData.uht_steri_milk?.total_solids}</p>                  />        <Label htmlFor="other_tests.hydrogen_peroxide">Hydrogen Peroxide</Label>

                <p><strong>Analyst:</strong> {

                  users.find(user => user.id === formData.uht_steri_milk?.analyst)?.first_name + ' ' +                </div>        <Controller

                  users.find(user => user.id === formData.uht_steri_milk?.analyst)?.last_name ||

                  formData.uht_steri_milk?.analyst || 'Not assigned'                <div>          name="other_tests.hydrogen_peroxide"

                }</p>

              </div>                  <Label htmlFor="raw_milk_silos.fat">Fat (%)</Label>          control={control}

            </div>

                  <Controller          render={({ field }) => (

            <div className="flex justify-between pt-6 border-t">

              <Button                    name="raw_milk_silos.fat"            <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                type="button"

                                    control={control}          )}

                onClick={prevStep}

                disabled={currentStep === 1}                    render={({ field }) => (        />

                className="flex items-center gap-2"

              >                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />      </div>

                <ChevronLeft className="w-4 h-4" />

                Previous                    )}      <div>

              </Button>

                  />        <Label htmlFor="other_tests.remarks">Remarks</Label>

              {currentStep < steps.length ? (

                <Button                </div>        <Controller

                  type="button"

                  onClick={nextStep}              </div>          name="other_tests.remarks"

                  className="flex items-center gap-2"

                >              <div className="grid grid-cols-2 gap-4">          control={control}

                  Next

                  <ChevronRight className="w-4 h-4" />                <div>          render={({ field }) => (

                </Button>

              ) : (                  <Label htmlFor="raw_milk_silos.lr_snf">LR/SNF</Label>            <Input {...field} className="mt-1" />

                <LoadingButton

                  type="submit"                  <Controller          )}

                  loading={loading}

                  className="flex items-center gap-2"                    name="raw_milk_silos.lr_snf"        />

                >

                  <CheckCircle className="w-4 h-4" />                    control={control}      </div>

                  Submit Test Report

                </LoadingButton>                    render={({ field }) => (    </div>

              )}

            </div>                      <Input {...field} className="mt-1" />  )

          </form>

        </SheetContent>                    )}}

      </Sheet>

                  />

      <SignatureModal

        open={signatureOpen}                </div>// Step 4: Standardisation & Pasteurisation Component

        onOpenChange={setSignatureOpen}

        title="Capture Approver Signature"                <div>function Step4StandardisationPasteurisation({ 

        onSave={(dataUrl) => {

          setValue("approver_signature", dataUrl, { shouldValidate: true })                  <Label htmlFor="raw_milk_silos.acidity">Acidity</Label>  control, 

        }}

      />                  <Controller  tankers, 

      <SignatureViewer

        open={signatureViewOpen}                    name="raw_milk_silos.acidity"  loadingTankers,

        onOpenChange={setSignatureViewOpen}

        title="Approver Signature"                    control={control}  users,

        value={watch("approver_signature")}

      />                    render={({ field }) => (  loadingUsers 

    </>

  )                      <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />}: { 

}

                    )}  control: any

                  />  tankers: Tanker[]

                </div>  loadingTankers: boolean

              </div>  users: UserEntity[]

              <div>  loadingUsers: boolean

                <Label htmlFor="raw_milk_silos.remarks">Remarks</Label>}) {

                <Controller  const handleTankerSearch = async (query: string) => {

                  name="raw_milk_silos.remarks"    if (!query.trim()) return []

                  control={control}    try {

                  render={({ field }) => (      const tankersResponse = await tankerApi.getAll()

                    <Input {...field} className="mt-1" />      return (tankersResponse.data || [])

                  )}        .filter(tanker =>

                />          tanker.reg_number.toLowerCase().includes(query.toLowerCase()) ||

              </div>          tanker.condition.toLowerCase().includes(query.toLowerCase())

            </div>        )

        .map(tanker => ({

            {/* STEP 3: Other Tests */}          value: tanker.id,

            <div style={{ display: currentStep === 3 ? 'block' : 'none' }} className="space-y-4">          label: `${tanker.reg_number} (${tanker.condition})`,

              <h3 className="text-lg font-medium">Other Tests Parameters</h3>          description: `${tanker.capacity}L capacity • ${tanker.age} years old`

              <div>        }))

                <Label htmlFor="other_tests.sample_details">Sample Details</Label>    } catch (error) {

                <Controller      return []

                  name="other_tests.sample_details"    }

                  control={control}  }

                  render={({ field }) => (

                    <Input {...field} className="mt-1" />  const handleUserSearch = async (query: string) => {

                  )}    if (!query.trim()) return []

                />    try {

              </div>      const usersResponse = await usersApi.getUsers({ filters: { search: query } })

              <div className="grid grid-cols-3 gap-4">      return (usersResponse.data || []).map(user => ({

                <div>        value: user.id,

                  <Label htmlFor="other_tests.ph">pH</Label>        label: `${user.first_name} ${user.last_name}`.trim() || user.email,

                  <Controller        description: `${user.department} • ${user.email}`

                    name="other_tests.ph"      }))

                    control={control}    } catch (error) {

                    render={({ field }) => (      return []

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />    }

                    )}  }

                  />

                </div>  return (

                <div>    <div className="space-y-4">

                  <Label htmlFor="other_tests.caustic">Caustic</Label>      <h3 className="text-lg font-medium">Standardisation & Pasteurisation</h3>

                  <Controller      <div className="grid grid-cols-2 gap-4">

                    name="other_tests.caustic"        <div>

                    control={control}          <Label htmlFor="standardisation_and_pasteurisation.tank">Tank</Label>

                    render={({ field }) => (          <Controller

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />            name="standardisation_and_pasteurisation.tank"

                    )}            control={control}

                  />            render={({ field }) => (

                </div>              <SearchableSelect

                <div>                options={tankers.map(tanker => ({

                  <Label htmlFor="other_tests.acid">Acid</Label>                  value: tanker.id,

                  <Controller                  label: `${tanker.reg_number} (${tanker.condition})`,

                    name="other_tests.acid"                  description: `${tanker.capacity}L capacity • ${tanker.age} years old`

                    control={control}                }))}

                    render={({ field }) => (                value={field.value}

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                onValueChange={field.onChange}

                    )}                onSearch={handleTankerSearch}

                  />                placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}

                </div>                searchPlaceholder="Search tankers..."

              </div>                emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}

              <div className="grid grid-cols-3 gap-4">                loading={loadingTankers}

                <div>              />

                  <Label htmlFor="other_tests.chlorine">Chlorine</Label>            )}

                  <Controller          />

                    name="other_tests.chlorine"        </div>

                    control={control}        <div>

                    render={({ field }) => (          <Label htmlFor="standardisation_and_pasteurisation.batch">Batch</Label>

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />          <Controller

                    )}            name="standardisation_and_pasteurisation.batch"

                  />            control={control}

                </div>            render={({ field }) => (

                <div>              <Input {...field} disabled className="mt-1 bg-gray-50" />

                  <Label htmlFor="other_tests.hd">HD</Label>            )}

                  <Controller          />

                    name="other_tests.hd"        </div>

                    control={control}      </div>

                    render={({ field }) => (      <div className="grid grid-cols-2 gap-4">

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />        <div>

                    )}          <Controller

                  />            name="standardisation_and_pasteurisation.time"

                </div>            control={control}

                <div>            render={({ field }) => (

                  <Label htmlFor="other_tests.tds">TDS</Label>              <DatePicker

                  <Controller                value={field.value}

                    name="other_tests.tds"                onChange={field.onChange}

                    control={control}                label="Time"

                    render={({ field }) => (                showTime={true}

                      <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                placeholder="Select date and time"

                    )}              />

                  />            )}

                </div>          />

              </div>        </div>

              <div>        <div>

                <Label htmlFor="other_tests.hydrogen_peroxide">Hydrogen Peroxide</Label>          <Label htmlFor="standardisation_and_pasteurisation.temperature">Temperature (°C)</Label>

                <Controller          <Controller

                  name="other_tests.hydrogen_peroxide"            name="standardisation_and_pasteurisation.temperature"

                  control={control}            control={control}

                  render={({ field }) => (            render={({ field }) => (

                    <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                  )}            )}

                />          />

              </div>        </div>

              <div>      </div>

                <Label htmlFor="other_tests.remarks">Remarks</Label>      <div className="grid grid-cols-3 gap-4">

                <Controller        <div>

                  name="other_tests.remarks"          <Label htmlFor="standardisation_and_pasteurisation.ot">OT</Label>

                  control={control}          <Controller

                  render={({ field }) => (            name="standardisation_and_pasteurisation.ot"

                    <Input {...field} className="mt-1" />            control={control}

                  )}            render={({ field }) => (

                />              <Input {...field} className="mt-1" />

              </div>            )}

            </div>          />

        </div>

            {/* STEP 4: Standardisation & Pasteurisation */}        <div>

            <div style={{ display: currentStep === 4 ? 'block' : 'none' }} className="space-y-4">          <Label htmlFor="standardisation_and_pasteurisation.alcohol">Alcohol (%)</Label>

              <h3 className="text-lg font-medium">Standardisation & Pasteurisation</h3>          <Controller

              <div className="grid grid-cols-2 gap-4">            name="standardisation_and_pasteurisation.alcohol"

                <div>            control={control}

                  <Label htmlFor="standardisation_and_pasteurisation.tank">Tank</Label>            render={({ field }) => (

                  <Controller              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    name="standardisation_and_pasteurisation.tank"            )}

                    control={control}          />

                    render={({ field }) => (        </div>

                      <SearchableSelect        <div>

                        options={tankers.map(tanker => ({          <Label htmlFor="standardisation_and_pasteurisation.phosphatase">Phosphatase</Label>

                          value: tanker.id,          <Controller

                          label: `${tanker.reg_number} (${tanker.condition})`,            name="standardisation_and_pasteurisation.phosphatase"

                          description: `${tanker.capacity}L capacity • ${tanker.age} years old`            control={control}

                        }))}            render={({ field }) => (

                        value={field.value}              <Input {...field} className="mt-1" />

                        onValueChange={field.onChange}            )}

                        onSearch={handleTankerSearch}          />

                        placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}        </div>

                        searchPlaceholder="Search tankers..."      </div>

                        emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}      <div className="grid grid-cols-3 gap-4">

                        loading={loadingTankers}        <div>

                      />          <Label htmlFor="standardisation_and_pasteurisation.ph">pH</Label>

                    )}          <Controller

                  />            name="standardisation_and_pasteurisation.ph"

                </div>            control={control}

                <div>            render={({ field }) => (

                  <Label htmlFor="standardisation_and_pasteurisation.batch">Batch</Label>              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                  <Controller            )}

                    name="standardisation_and_pasteurisation.batch"          />

                    control={control}        </div>

                    render={({ field }) => (        <div>

                      <Input {...field} disabled className="mt-1 bg-gray-50" />          <Label htmlFor="standardisation_and_pasteurisation.cob">COB</Label>

                    )}          <Controller

                  />            name="standardisation_and_pasteurisation.cob"

                </div>            control={control}

              </div>            render={({ field }) => (

              <div className="grid grid-cols-2 gap-4">              <div className="mt-1">

                <div>                <input

                  <Controller                  type="checkbox"

                    name="standardisation_and_pasteurisation.time"                  checked={field.value}

                    control={control}                  onChange={field.onChange}

                    render={({ field }) => (                  className="mr-2"

                      <DatePicker                />

                        value={field.value}                <span className="text-sm">COB Present</span>

                        onChange={field.onChange}              </div>

                        label="Time"            )}

                        showTime={true}          />

                        placeholder="Select date and time"        </div>

                      />        <div>

                    )}          <Label htmlFor="standardisation_and_pasteurisation.fat">Fat (%)</Label>

                  />          <Controller

                </div>            name="standardisation_and_pasteurisation.fat"

                <div>            control={control}

                  <Label htmlFor="standardisation_and_pasteurisation.temperature">Temperature (°C)</Label>            render={({ field }) => (

                  <Controller              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    name="standardisation_and_pasteurisation.temperature"            )}

                    control={control}          />

                    render={({ field }) => (        </div>

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />      </div>

                    )}      <div className="grid grid-cols-2 gap-4">

                  />        <div>

                </div>          <Label htmlFor="standardisation_and_pasteurisation.ci_si">CI/SI</Label>

              </div>          <Controller

              <div className="grid grid-cols-3 gap-4">            name="standardisation_and_pasteurisation.ci_si"

                <div>            control={control}

                  <Label htmlFor="standardisation_and_pasteurisation.ot">OT</Label>            render={({ field }) => (

                  <Controller              <Input {...field} className="mt-1" />

                    name="standardisation_and_pasteurisation.ot"            )}

                    control={control}          />

                    render={({ field }) => (        </div>

                      <Input {...field} className="mt-1" />        <div>

                    )}          <Label htmlFor="standardisation_and_pasteurisation.lr_snf">LR/SNF</Label>

                  />          <Controller

                </div>            name="standardisation_and_pasteurisation.lr_snf"

                <div>            control={control}

                  <Label htmlFor="standardisation_and_pasteurisation.alcohol">Alcohol (%)</Label>            render={({ field }) => (

                  <Controller              <Input {...field} className="mt-1" />

                    name="standardisation_and_pasteurisation.alcohol"            )}

                    control={control}          />

                    render={({ field }) => (        </div>

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />      </div>

                    )}      <div className="grid grid-cols-2 gap-4">

                  />        <div>

                </div>          <Label htmlFor="standardisation_and_pasteurisation.acidity">Acidity</Label>

                <div>          <Controller

                  <Label htmlFor="standardisation_and_pasteurisation.phosphatase">Phosphatase</Label>            name="standardisation_and_pasteurisation.acidity"

                  <Controller            control={control}

                    name="standardisation_and_pasteurisation.phosphatase"            render={({ field }) => (

                    control={control}              <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    render={({ field }) => (            )}

                      <Input {...field} className="mt-1" />          />

                    )}        </div>

                  />        <div>

                </div>          <Label htmlFor="standardisation_and_pasteurisation.analyst">Analyst</Label>

              </div>          <Controller

              <div className="grid grid-cols-3 gap-4">            name="standardisation_and_pasteurisation.analyst"

                <div>            control={control}

                  <Label htmlFor="standardisation_and_pasteurisation.ph">pH</Label>            render={({ field }) => (

                  <Controller              <SearchableSelect

                    name="standardisation_and_pasteurisation.ph"                options={users.map(user => ({

                    control={control}                  value: user.id,

                    render={({ field }) => (                  label: `${user.first_name} ${user.last_name}`.trim() || user.email,

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                  description: `${user.department} • ${user.email}`

                    )}                }))}

                  />                value={field.value}

                </div>                onValueChange={field.onChange}

                <div>                onSearch={handleUserSearch}

                  <Label htmlFor="standardisation_and_pasteurisation.cob">COB</Label>                placeholder="Search and select analyst"

                  <Controller                searchPlaceholder="Search users..."

                    name="standardisation_and_pasteurisation.cob"                emptyMessage="No users found"

                    control={control}                loading={loadingUsers}

                    render={({ field }) => (              />

                      <div className="mt-1">            )}

                        <input          />

                          type="checkbox"        </div>

                          checked={field.value}      </div>

                          onChange={field.onChange}      <div>

                          className="mr-2"        <Label htmlFor="standardisation_and_pasteurisation.remarks">Remarks</Label>

                        />        <Controller

                        <span className="text-sm">COB Present</span>          name="standardisation_and_pasteurisation.remarks"

                      </div>          control={control}

                    )}          render={({ field }) => (

                  />            <Input {...field} className="mt-1" />

                </div>          )}

                <div>        />

                  <Label htmlFor="standardisation_and_pasteurisation.fat">Fat (%)</Label>      </div>

                  <Controller    </div>

                    name="standardisation_and_pasteurisation.fat"  )

                    control={control}}

                    render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />// Step 5: UHT Steri Milk Component

                    )}function Step5UHTSteriMilk({ 

                  />  control,

                </div>  users,

              </div>  loadingUsers 

              <div className="grid grid-cols-2 gap-4">}: { 

                <div>  control: any

                  <Label htmlFor="standardisation_and_pasteurisation.ci_si">CI/SI</Label>  users: UserEntity[]

                  <Controller  loadingUsers: boolean

                    name="standardisation_and_pasteurisation.ci_si"}) {

                    control={control}  const handleUserSearch = async (query: string) => {

                    render={({ field }) => (    if (!query.trim()) return []

                      <Input {...field} className="mt-1" />    try {

                    )}      const usersResponse = await usersApi.getUsers({ filters: { search: query } })

                  />      return (usersResponse.data || []).map(user => ({

                </div>        value: user.id,

                <div>        label: `${user.first_name} ${user.last_name}`.trim() || user.email,

                  <Label htmlFor="standardisation_and_pasteurisation.lr_snf">LR/SNF</Label>        description: `${user.department} • ${user.email}`

                  <Controller      }))

                    name="standardisation_and_pasteurisation.lr_snf"    } catch (error) {

                    control={control}      return []

                    render={({ field }) => (    }

                      <Input {...field} className="mt-1" />  }

                    )}

                  />  return (

                </div>    <div className="space-y-4">

              </div>      <h3 className="text-lg font-medium">UHT Steri Milk Parameters</h3>

              <div className="grid grid-cols-2 gap-4">      <div className="grid grid-cols-2 gap-4">

                <div>        <div>

                  <Label htmlFor="standardisation_and_pasteurisation.acidity">Acidity</Label>          <Controller

                  <Controller            name="uht_steri_milk.time"

                    name="standardisation_and_pasteurisation.acidity"            control={control}

                    control={control}            render={({ field }) => (

                    render={({ field }) => (              <DatePicker

                      <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                value={field.value}

                    )}                onChange={field.onChange}

                  />                label="Time"

                </div>                showTime={true}

                <div>                placeholder="Select date and time"

                  <Label htmlFor="standardisation_and_pasteurisation.analyst">Analyst</Label>              />

                  <Controller            )}

                    name="standardisation_and_pasteurisation.analyst"          />

                    control={control}        </div>

                    render={({ field }) => (        <div>

                      <SearchableSelect          <Label htmlFor="uht_steri_milk.batch">Batch</Label>

                        options={users.map(user => ({          <Controller

                          value: user.id,            name="uht_steri_milk.batch"

                          label: `${user.first_name} ${user.last_name}`.trim() || user.email,            control={control}

                          description: `${user.department} • ${user.email}`            render={({ field }) => (

                        }))}              <Input {...field} disabled className="mt-1 bg-gray-50" />

                        value={field.value}            )}

                        onValueChange={field.onChange}          />

                        onSearch={handleUserSearch}        </div>

                        placeholder="Search and select analyst"      </div>

                        searchPlaceholder="Search users..."      <div className="grid grid-cols-2 gap-4">

                        emptyMessage="No users found"        <div>

                        loading={loadingUsers}          <Label htmlFor="uht_steri_milk.temperature">Temperature (°C)</Label>

                      />          <Controller

                    )}            name="uht_steri_milk.temperature"

                  />            control={control}

                </div>            render={({ field }) => (

              </div>              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

              <div>            )}

                <Label htmlFor="standardisation_and_pasteurisation.remarks">Remarks</Label>          />

                <Controller        </div>

                  name="standardisation_and_pasteurisation.remarks"        <div>

                  control={control}          <Label htmlFor="uht_steri_milk.ot">OT</Label>

                  render={({ field }) => (          <Controller

                    <Input {...field} className="mt-1" />            name="uht_steri_milk.ot"

                  )}            control={control}

                />            render={({ field }) => (

              </div>              <Input {...field} className="mt-1" />

            </div>            )}

          />

            {/* STEP 5: UHT Steri Milk */}        </div>

            <div style={{ display: currentStep === 5 ? 'block' : 'none' }} className="space-y-4">      </div>

              <h3 className="text-lg font-medium">UHT Steri Milk Parameters</h3>      <div className="grid grid-cols-3 gap-4">

              <div className="grid grid-cols-2 gap-4">        <div>

                <div>          <Label htmlFor="uht_steri_milk.alc">ALC</Label>

                  <Controller          <Controller

                    name="uht_steri_milk.time"            name="uht_steri_milk.alc"

                    control={control}            control={control}

                    render={({ field }) => (            render={({ field }) => (

                      <DatePicker              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                        value={field.value}            )}

                        onChange={field.onChange}          />

                        label="Time"        </div>

                        showTime={true}        <div>

                        placeholder="Select date and time"          <Label htmlFor="uht_steri_milk.res">RES</Label>

                      />          <Controller

                    )}            name="uht_steri_milk.res"

                  />            control={control}

                </div>            render={({ field }) => (

                <div>              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                  <Label htmlFor="uht_steri_milk.batch">Batch</Label>            )}

                  <Controller          />

                    name="uht_steri_milk.batch"        </div>

                    control={control}        <div>

                    render={({ field }) => (          <Label htmlFor="uht_steri_milk.cob">COB</Label>

                      <Input {...field} disabled className="mt-1 bg-gray-50" />          <Controller

                    )}            name="uht_steri_milk.cob"

                  />            control={control}

                </div>            render={({ field }) => (

              </div>              <div className="mt-1">

              <div className="grid grid-cols-2 gap-4">                <input

                <div>                  type="checkbox"

                  <Label htmlFor="uht_steri_milk.temperature">Temperature (°C)</Label>                  checked={field.value}

                  <Controller                  onChange={field.onChange}

                    name="uht_steri_milk.temperature"                  className="mr-2"

                    control={control}                />

                    render={({ field }) => (                <span className="text-sm">COB Present</span>

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />              </div>

                    )}            )}

                  />          />

                </div>        </div>

                <div>      </div>

                  <Label htmlFor="uht_steri_milk.ot">OT</Label>      <div className="grid grid-cols-3 gap-4">

                  <Controller        <div>

                    name="uht_steri_milk.ot"          <Label htmlFor="uht_steri_milk.ph">pH</Label>

                    control={control}          <Controller

                    render={({ field }) => (            name="uht_steri_milk.ph"

                      <Input {...field} className="mt-1" />            control={control}

                    )}            render={({ field }) => (

                  />              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                </div>            )}

              </div>          />

              <div className="grid grid-cols-3 gap-4">        </div>

                <div>        <div>

                  <Label htmlFor="uht_steri_milk.alc">ALC</Label>          <Label htmlFor="uht_steri_milk.fat">Fat (%)</Label>

                  <Controller          <Controller

                    name="uht_steri_milk.alc"            name="uht_steri_milk.fat"

                    control={control}            control={control}

                    render={({ field }) => (            render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                    )}            )}

                  />          />

                </div>        </div>

                <div>        <div>

                  <Label htmlFor="uht_steri_milk.res">RES</Label>          <Label htmlFor="uht_steri_milk.lr_snf">LR/SNF</Label>

                  <Controller          <Controller

                    name="uht_steri_milk.res"            name="uht_steri_milk.lr_snf"

                    control={control}            control={control}

                    render={({ field }) => (            render={({ field }) => (

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />              <Input {...field} className="mt-1" />

                    )}            )}

                  />          />

                </div>        </div>

                <div>      </div>

                  <Label htmlFor="uht_steri_milk.cob">COB</Label>      <div className="grid grid-cols-3 gap-4">

                  <Controller        <div>

                    name="uht_steri_milk.cob"          <Label htmlFor="uht_steri_milk.ci_si">CI/SI</Label>

                    control={control}          <Controller

                    render={({ field }) => (            name="uht_steri_milk.ci_si"

                      <div className="mt-1">            control={control}

                        <input            render={({ field }) => (

                          type="checkbox"              <Input {...field} className="mt-1" />

                          checked={field.value}            )}

                          onChange={field.onChange}          />

                          className="mr-2"        </div>

                        />        <div>

                        <span className="text-sm">COB Present</span>          <Label htmlFor="uht_steri_milk.total_solids">Total Solids</Label>

                      </div>          <Controller

                    )}            name="uht_steri_milk.total_solids"

                  />            control={control}

                </div>            render={({ field }) => (

              </div>              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

              <div className="grid grid-cols-3 gap-4">            )}

                <div>          />

                  <Label htmlFor="uht_steri_milk.ph">pH</Label>        </div>

                  <Controller        <div>

                    name="uht_steri_milk.ph"          <Label htmlFor="uht_steri_milk.acidity">Acidity</Label>

                    control={control}          <Controller

                    render={({ field }) => (            name="uht_steri_milk.acidity"

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />            control={control}

                    )}            render={({ field }) => (

                  />              <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                </div>            )}

                <div>          />

                  <Label htmlFor="uht_steri_milk.fat">Fat (%)</Label>        </div>

                  <Controller      </div>

                    name="uht_steri_milk.fat"      <div className="grid grid-cols-2 gap-4">

                    control={control}        <div>

                    render={({ field }) => (          <Label htmlFor="uht_steri_milk.coffee">Coffee</Label>

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />          <Controller

                    )}            name="uht_steri_milk.coffee"

                  />            control={control}

                </div>            render={({ field }) => (

                <div>              <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />

                  <Label htmlFor="uht_steri_milk.lr_snf">LR/SNF</Label>            )}

                  <Controller          />

                    name="uht_steri_milk.lr_snf"        </div>

                    control={control}        <div>

                    render={({ field }) => (          <Label htmlFor="uht_steri_milk.hydrogen_peroxide_or_turbidity">Hydrogen Peroxide/Turbidity</Label>

                      <Input {...field} className="mt-1" />          <Controller

                    )}            name="uht_steri_milk.hydrogen_peroxide_or_turbidity"

                  />            control={control}

                </div>            render={({ field }) => (

              </div>              <Input {...field} className="mt-1" />

              <div className="grid grid-cols-3 gap-4">            )}

                <div>          />

                  <Label htmlFor="uht_steri_milk.ci_si">CI/SI</Label>        </div>

                  <Controller      </div>

                    name="uht_steri_milk.ci_si"      <div>

                    control={control}        <Label htmlFor="uht_steri_milk.coffee_remarks">Coffee Remarks</Label>

                    render={({ field }) => (        <Controller

                      <Input {...field} className="mt-1" />          name="uht_steri_milk.coffee_remarks"

                    )}          control={control}

                  />          render={({ field }) => (

                </div>            <Input {...field} className="mt-1" />

                <div>          )}

                  <Label htmlFor="uht_steri_milk.total_solids">Total Solids</Label>        />

                  <Controller      </div>

                    name="uht_steri_milk.total_solids"      <div className="grid grid-cols-2 gap-4">

                    control={control}        <div>

                    render={({ field }) => (          <Label htmlFor="uht_steri_milk.analyst">Analyst</Label>

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />          <Controller

                    )}            name="uht_steri_milk.analyst"

                  />            control={control}

                </div>            render={({ field }) => (

                <div>              <SearchableSelect

                  <Label htmlFor="uht_steri_milk.acidity">Acidity</Label>                options={users.map(user => ({

                  <Controller                  value: user.id,

                    name="uht_steri_milk.acidity"                  label: `${user.first_name} ${user.last_name}`.trim() || user.email,

                    control={control}                  description: `${user.department} • ${user.email}`

                    render={({ field }) => (                }))}

                      <Input {...field} type="number" step="0.01" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />                value={field.value}

                    )}                onValueChange={field.onChange}

                  />                onSearch={handleUserSearch}

                </div>                placeholder="Search and select analyst"

              </div>                searchPlaceholder="Search users..."

              <div className="grid grid-cols-2 gap-4">                emptyMessage="No users found"

                <div>                loading={loadingUsers}

                  <Label htmlFor="uht_steri_milk.coffee">Coffee</Label>              />

                  <Controller            )}

                    name="uht_steri_milk.coffee"          />

                    control={control}        </div>

                    render={({ field }) => (      </div>

                      <Input {...field} type="number" step="0.1" className="mt-1" value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} />      <div>

                    )}        <Label htmlFor="uht_steri_milk.remarks">Remarks</Label>

                  />        <Controller

                </div>          name="uht_steri_milk.remarks"

                <div>          control={control}

                  <Label htmlFor="uht_steri_milk.hydrogen_peroxide_or_turbidity">Hydrogen Peroxide/Turbidity</Label>          render={({ field }) => (

                  <Controller            <Input {...field} className="mt-1" />

                    name="uht_steri_milk.hydrogen_peroxide_or_turbidity"          )}

                    control={control}        />

                    render={({ field }) => (      </div>

                      <Input {...field} className="mt-1" />    </div>

                    )}  )

                  />}

                </div>

              </div>// Step 6: Review Component

              <div>function Step6Review({ 

                <Label htmlFor="uht_steri_milk.coffee_remarks">Coffee Remarks</Label>  watch, 

                <Controller  users, 

                  name="uht_steri_milk.coffee_remarks"  tankers 

                  control={control}}: { 

                  render={({ field }) => (  watch: any

                    <Input {...field} className="mt-1" />  users: UserEntity[]

                  )}  tankers: Tanker[]

                />}) {

              </div>  const formData = watch()

              <div className="grid grid-cols-2 gap-4">

                <div>  return (

                  <Label htmlFor="uht_steri_milk.analyst">Analyst</Label>    <div className="space-y-4">

                  <Controller      <h3 className="text-lg font-medium">Review & Submit</h3>

                    name="uht_steri_milk.analyst"      <div className="bg-gray-50 p-4 rounded-lg">

                    control={control}        <h4 className="font-medium mb-2">Basic Information</h4>

                    render={({ field }) => (        <p><strong>Issue Date:</strong> {formData.issue_date}</p>

                      <SearchableSelect        <p><strong>Date of Production:</strong> {formData.date_of_production}</p>

                        options={users.map(user => ({        <p><strong>Batch Number:</strong> {formData.batch_number}</p>

                          value: user.id,        <p><strong>Variety:</strong> {formData.variety}</p>

                          label: `${user.first_name} ${user.last_name}`.trim() || user.email,        <p><strong>Approved By:</strong> {

                          description: `${user.department} • ${user.email}`          users.find(user => user.id === formData.approved_by)?.first_name + ' ' +

                        }))}          users.find(user => user.id === formData.approved_by)?.last_name ||

                        value={field.value}          formData.approved_by

                        onValueChange={field.onChange}        }</p>

                        onSearch={handleUserSearch}        <p><strong>Approver Signature:</strong> {formData.approver_signature ? 'Captured' : 'Not captured'}</p>

                        placeholder="Search and select analyst"      </div>

                        searchPlaceholder="Search users..."      <div className="bg-gray-50 p-4 rounded-lg">

                        emptyMessage="No users found"        <h4 className="font-medium mb-2">Raw Milk Silos</h4>

                        loading={loadingUsers}        <p><strong>Tanker:</strong> {

                      />          tankers.find(tanker => tanker.id === formData.raw_milk_silos?.tank)?.reg_number ||

                    )}          formData.raw_milk_silos?.tank

                  />        }</p>

                </div>        <p><strong>Time:</strong> {formData.raw_milk_silos?.time}</p>

              </div>        <p><strong>Temperature:</strong> {formData.raw_milk_silos?.temperature}°C</p>

              <div>        <p><strong>pH:</strong> {formData.raw_milk_silos?.ph}</p>

                <Label htmlFor="uht_steri_milk.remarks">Remarks</Label>        <p><strong>Fat:</strong> {formData.raw_milk_silos?.fat}%</p>

                <Controller      </div>

                  name="uht_steri_milk.remarks"      <div className="bg-gray-50 p-4 rounded-lg">

                  control={control}        <h4 className="font-medium mb-2">Other Tests</h4>

                  render={({ field }) => (        <p><strong>Sample Details:</strong> {formData.other_tests?.sample_details}</p>

                    <Input {...field} className="mt-1" />        <p><strong>pH:</strong> {formData.other_tests?.ph}</p>

                  )}        <p><strong>TDS:</strong> {formData.other_tests?.tds}</p>

                />      </div>

              </div>      <div className="bg-gray-50 p-4 rounded-lg">

            </div>        <h4 className="font-medium mb-2">Standardisation & Pasteurisation</h4>

        <p><strong>Tanker:</strong> {

            {/* STEP 6: Review */}          tankers.find(tanker => tanker.id === formData.standardisation_and_pasteurisation?.tank)?.reg_number ||

            <div style={{ display: currentStep === 6 ? 'block' : 'none' }} className="space-y-4">          formData.standardisation_and_pasteurisation?.tank

              <h3 className="text-lg font-medium">Review & Submit</h3>        }</p>

              <div className="bg-gray-50 p-4 rounded-lg">        <p><strong>Batch:</strong> {formData.standardisation_and_pasteurisation?.batch}</p>

                <h4 className="font-medium mb-2">Basic Information</h4>        <p><strong>Time:</strong> {formData.standardisation_and_pasteurisation?.time}</p>

                <p><strong>Issue Date:</strong> {formData.issue_date}</p>        <p><strong>Temperature:</strong> {formData.standardisation_and_pasteurisation?.temperature}°C</p>

                <p><strong>Date of Production:</strong> {formData.date_of_production}</p>        <p><strong>Phosphatase:</strong> {formData.standardisation_and_pasteurisation?.phosphatase}</p>

                <p><strong>Batch Number:</strong> {formData.batch_number}</p>        <p><strong>Analyst:</strong> {

                <p><strong>Variety:</strong> {formData.variety}</p>          users.find(user => user.id === formData.standardisation_and_pasteurisation?.analyst)?.first_name + ' ' +

                <p><strong>Approved By:</strong> {          users.find(user => user.id === formData.standardisation_and_pasteurisation?.analyst)?.last_name ||

                  users.find(user => user.id === formData.approved_by)?.first_name + ' ' +          formData.standardisation_and_pasteurisation?.analyst

                  users.find(user => user.id === formData.approved_by)?.last_name ||        }</p>

                  formData.approved_by      </div>

                }</p>      <div className="bg-gray-50 p-4 rounded-lg">

                <p><strong>Approver Signature:</strong> {formData.approver_signature ? 'Captured' : 'Not captured'}</p>        <h4 className="font-medium mb-2">UHT Steri Milk</h4>

              </div>        <p><strong>Time:</strong> {formData.uht_steri_milk?.time}</p>

              <div className="bg-gray-50 p-4 rounded-lg">        <p><strong>Batch:</strong> {formData.uht_steri_milk?.batch}</p>

                <h4 className="font-medium mb-2">Raw Milk Silos</h4>        <p><strong>Temperature:</strong> {formData.uht_steri_milk?.temperature}°C</p>

                <p><strong>Tanker:</strong> {        <p><strong>Total Solids:</strong> {formData.uht_steri_milk?.total_solids}</p>

                  tankers.find(tanker => tanker.id === formData.raw_milk_silos?.tank)?.reg_number ||        <p><strong>Analyst:</strong> {

                  formData.raw_milk_silos?.tank || 'Not selected'          users.find(user => user.id === formData.uht_steri_milk?.analyst)?.first_name + ' ' +

                }</p>          users.find(user => user.id === formData.uht_steri_milk?.analyst)?.last_name ||

                <p><strong>Time:</strong> {formData.raw_milk_silos?.time || 'Not set'}</p>          formData.uht_steri_milk?.analyst

                <p><strong>Temperature:</strong> {formData.raw_milk_silos?.temperature}°C</p>        }</p>

                <p><strong>pH:</strong> {formData.raw_milk_silos?.ph}</p>      </div>

                <p><strong>Fat:</strong> {formData.raw_milk_silos?.fat}%</p>    </div>

              </div>  )

              <div className="bg-gray-50 p-4 rounded-lg">}

                <h4 className="font-medium mb-2">Other Tests</h4>

                <p><strong>Sample Details:</strong> {formData.other_tests?.sample_details || 'Not provided'}</p>export function SteriMilkTestReportFormDrawer({

                <p><strong>pH:</strong> {formData.other_tests?.ph}</p>  open,

                <p><strong>TDS:</strong> {formData.other_tests?.tds}</p>  onOpenChange,

              </div>  processLogId,

              <div className="bg-gray-50 p-4 rounded-lg">  onSuccess

                <h4 className="font-medium mb-2">Standardisation & Pasteurisation</h4>}: SteriMilkTestReportFormDrawerProps) {

                <p><strong>Tanker:</strong> {  const [currentStep, setCurrentStep] = useState(1)

                  tankers.find(tanker => tanker.id === formData.standardisation_and_pasteurisation?.tank)?.reg_number ||  const [loading, setLoading] = useState(false)

                  formData.standardisation_and_pasteurisation?.tank || 'Not selected'  const [users, setUsers] = useState<UserEntity[]>([])

                }</p>  const [tankers, setTankers] = useState<Tanker[]>([])

                <p><strong>Batch:</strong> {formData.standardisation_and_pasteurisation?.batch}</p>  const [loadingTankers, setLoadingTankers] = useState(false)

                <p><strong>Time:</strong> {formData.standardisation_and_pasteurisation?.time || 'Not set'}</p>  const [loadingUsers, setLoadingUsers] = useState(false)

                <p><strong>Temperature:</strong> {formData.standardisation_and_pasteurisation?.temperature}°C</p>

                <p><strong>Phosphatase:</strong> {formData.standardisation_and_pasteurisation?.phosphatase || 'Not tested'}</p>  const form = useForm<TestReportFormData>({

                <p><strong>Analyst:</strong> {    resolver: yupResolver(testReportSchema) as any,

                  users.find(user => user.id === formData.standardisation_and_pasteurisation?.analyst)?.first_name + ' ' +    mode: 'onChange',

                  users.find(user => user.id === formData.standardisation_and_pasteurisation?.analyst)?.last_name ||    defaultValues: {

                  formData.standardisation_and_pasteurisation?.analyst || 'Not assigned'      issue_date: new Date().toISOString().split('T')[0],

                }</p>      approved_by: "",

              </div>      approver_signature: "",

              <div className="bg-gray-50 p-4 rounded-lg">      date_of_production: new Date().toISOString().split('T')[0],

                <h4 className="font-medium mb-2">UHT Steri Milk</h4>      batch_number: 0,

                <p><strong>Time:</strong> {formData.uht_steri_milk?.time || 'Not set'}</p>      variety: "Steri milk",

                <p><strong>Batch:</strong> {formData.uht_steri_milk?.batch}</p>      raw_milk_silos: {

                <p><strong>Temperature:</strong> {formData.uht_steri_milk?.temperature}°C</p>        tank: "",

                <p><strong>Total Solids:</strong> {formData.uht_steri_milk?.total_solids}</p>        time: "",

                <p><strong>Analyst:</strong> {        temperature: 0,

                  users.find(user => user.id === formData.uht_steri_milk?.analyst)?.first_name + ' ' +        alcohol: 0,

                  users.find(user => user.id === formData.uht_steri_milk?.analyst)?.last_name ||        res: 0,

                  formData.uht_steri_milk?.analyst || 'Not assigned'        cob: false,

                }</p>        ph: 0,

              </div>        fat: 0,

            </div>        lr_snf: "",

        acidity: 0,

            <div className="flex justify-between pt-6 border-t">        remarks: ""

              <Button      },

                type="button"      other_tests: {

                        sample_details: "",

                onClick={prevStep}        ph: 0,

                disabled={currentStep === 1}        caustic: 0,

                className="flex items-center gap-2"        acid: 0,

              >        chlorine: 0,

                <ChevronLeft className="w-4 h-4" />        hd: 0,

                Previous        tds: 0,

              </Button>        hydrogen_peroxide: 0,

        remarks: ""

              {currentStep < steps.length ? (      },

                <Button      standardisation_and_pasteurisation: {

                  type="button"        tank: "",

                  onClick={nextStep}        batch: 0,

                  className="flex items-center gap-2"        time: "",

                >        temperature: 0,

                  Next        ot: "",

                  <ChevronRight className="w-4 h-4" />        alcohol: 0,

                </Button>        phosphatase: "",

              ) : (        ph: 0,

                <LoadingButton        cob: false,

                  type="submit"        fat: 0,

                  loading={loading}        ci_si: "",

                  className="flex items-center gap-2"        lr_snf: "",

                >        acidity: 0,

                  <CheckCircle className="w-4 h-4" />        analyst: "",

                  Submit Test Report        remarks: ""

                </LoadingButton>      },

              )}      uht_steri_milk: {

            </div>        time: "",

          </form>        batch: "",

        </SheetContent>        temperature: 0,

      </Sheet>        ot: "",

        alc: 0,

      <SignatureModal        res: 0,

        open={signatureOpen}        cob: false,

        onOpenChange={setSignatureOpen}        ph: 0,

        title="Capture Approver Signature"        fat: 0,

        onSave={(dataUrl) => {        lr_snf: "",

          setValue("approver_signature", dataUrl, { shouldValidate: true })        ci_si: "",

        }}        total_solids: 0,

      />        acidity: 0,

      <SignatureViewer        coffee: 0,

        open={signatureViewOpen}        coffee_remarks: "",

        onOpenChange={setSignatureViewOpen}        hydrogen_peroxide_or_turbidity: "",

        title="Approver Signature"        analyst: "",

        value={watch("approver_signature")}        remarks: ""

      />      }

    </>    }

  )  })

}

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
                        <Button type="button"  size="sm" className="rounded-full" onClick={() => setSignatureOpen(true)}>
                          Add Signature
                        </Button>
                        {field.value && (
                          <Button type="button"  size="sm" className="rounded-full" onClick={() => setSignatureViewOpen(true)}>
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
