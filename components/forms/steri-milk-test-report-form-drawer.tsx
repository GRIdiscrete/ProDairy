"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { usersApi, type UserEntity } from "@/lib/api/users"
import { rolesApi } from "@/lib/api/roles"
import { siloApi } from "@/lib/api/silo"
import { steriMilkProcessLogApi, type SteriMilkProcessLog } from "@/lib/api/steri-milk-process-log"
import { steriMilkTestReportApi } from "@/lib/api/steri-milk-test-report"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { normalizeDataUrlToBase64 } from "@/lib/utils/signature"
// import { BasicInfoStep } from "./steri-milk-test-report/basic-info-step"
// import { RawMilkSilosStep } from "./steri-milk-test-report/raw-milk-silos-step"
// import { OtherTestsStep } from "./steri-milk-test-report/other-tests-step"
// import { StandardisationStep } from "./steri-milk-test-report/standardisation-step"
// import { UhtSteriMilkStep } from "./steri-milk-test-report/uht-steri-milk-step"
// import type {
//   BasicInfoFormData,
//   RawMilkSilosFormData,
//   OtherTestsFormData,
//   StandardisationFormData,
//   UhtSteriMilkFormData
// } from "./steri-milk-test-report/types"
import { BasicInfoStep } from "./steri-milk-test-report/basic-info-step"
import { RawMilkSilosStep } from "./steri-milk-test-report/raw-milk-silos-step"
import { OtherTestsStep } from "./steri-milk-test-report/other-tests-step"
import { StandardisationStep } from "./steri-milk-test-report/standardisation-step"
import { UhtSteriMilkStep } from "./steri-milk-test-report/uht-steri-milk-step"
import { BasicInfoFormData, OtherTestsFormData, RawMilkSilosFormData, StandardisationFormData, UhtSteriMilkFormData } from "./steri-milk-test-report/types"

interface SteriMilkTestReportFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  processLogId?: string
  reportData?: any
  mode?: "create" | "edit"
  onSuccess?: () => void
}

export function SteriMilkTestReportFormDrawer({
  open,
  onOpenChange,
  processLogId,
  reportData,
  mode = "create",
  onSuccess
}: SteriMilkTestReportFormDrawerProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserEntity[]>([])
  const [userRoles, setUserRoles] = useState<any[]>([])
  const [silos, setSilos] = useState<any[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingUserRoles, setLoadingUserRoles] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  const basicInfoForm = useForm<BasicInfoFormData>({
    defaultValues: {
      issue_date: new Date().toISOString().split('T')[0],
      approved_by: "",
      approver_signature: "",
      date_of_production: new Date().toISOString().split('T')[0],
      batch_number: "",
      variety: "Steri milk"
    }
  })

  const rawMilkSilosForm = useForm<RawMilkSilosFormData>({
    defaultValues: {
      tank: "",
      time: "",
      temperature: "",
      alcohol: "",
      res: "",
      cob: false,
      ph: "",
      fat: "",
      lr_snf: "",
      acidity: "",
      remarks: ""
    }
  })

  const otherTestsForm = useForm<OtherTestsFormData>({
    defaultValues: {
      sample_details: "",
      ph: "",
      caustic: "",
      acid: "",
      chlorine: "",
      hd: "",
      tds: "",
      hydrogen_peroxide: "",
      remarks: ""
    }
  })

  const standardisationForm = useForm<StandardisationFormData>({
    defaultValues: {
      tank: "",
      batch: "",
      time: "",
      temperature: "",
      ot: "",
      alcohol: "",
      phosphatase: "",
      ph: "",
      cob: false,
      fat: "",
      ci_si: "",
      lr_snf: "",
      acidity: "",
      analyst: "",
      remarks: ""
    }
  })

  const uhtSteriMilkForm = useForm<UhtSteriMilkFormData>({
    defaultValues: {
      time: "",
      batch: "",
      temperature: "",
      ot: "",
      alc: "",
      res: "",
      cob: false,
      ph: "",
      fat: "",
      lr_snf: "",
      ci_si: "",
      total_solids: "",
      acidity: "",
      coffee: "",
      hydrogen_peroxide_or_turbidity: "",
      analyst: "",
      remarks: ""
    }
  })

  // Always fetch approvers (user roles), analysts (users), and silos when the drawer opens
  useEffect(() => {
    if (!open) return
    const loadUsersAndTankers = async () => {
      // Load user roles for approvers
      setLoadingUserRoles(true)
      try {
        const rolesResponse = await rolesApi.getRoles()
        setUserRoles(rolesResponse.data || [])
      } catch (err) {
        console.error('Failed to fetch user roles:', err)
        setUserRoles([])
      } finally {
        setLoadingUserRoles(false)
      }

      // Load users for analysts
      try {
        setLoadingUsers(true)
        const usersResponse = await usersApi.getUsers()
        setUsers(usersResponse.data || [])
      } catch (err) {
        console.error('Failed to fetch users:', err)
        setUsers([])
      } finally {
        setLoadingUsers(false)
      }

      // Load silos for both Raw Milk Silos and Standardisation steps
      setLoadingSilos(true)
      try {
        const silosResponse = await siloApi.getSilos()
        setSilos(silosResponse.data || [])
      } catch (siloError) {
        console.error('Failed to fetch silos:', siloError)
        setSilos([])
      } finally {
        setLoadingSilos(false)
      }
    }
    loadUsersAndTankers()
  }, [open])

  // Fetch process log data (and prefill) when provided
  useEffect(() => {
    if (!open || !processLogId) return
    const loadProcessLog = async () => {
      setLoadingData(true)
      try {
        const processLogResponse = await steriMilkProcessLogApi.getLog(processLogId)

        if (processLogResponse) {
          const batchNumber = (processLogResponse as any).batch_id?.batch_number || 1001
          basicInfoForm.setValue('batch_number', String(batchNumber))
          basicInfoForm.setValue('date_of_production', (processLogResponse as any).batch_id?.created_at ?
            new Date((processLogResponse as any).batch_id.created_at).toISOString().split('T')[0] :
            new Date().toISOString().split('T')[0])
          standardisationForm.setValue('batch', String(batchNumber))
          uhtSteriMilkForm.setValue('batch', String(batchNumber))
        }
      } catch (error) {
        console.error('Failed to fetch process log:', error)
        toast.error('Failed to load form data')
      } finally {
        setLoadingData(false)
      }
    }
    loadProcessLog()
  }, [open, processLogId])

  // Prefill form data when editing
  useEffect(() => {
    if (!open) return

    if (mode === "edit" && reportData) {
      try {
        // Basic info
        basicInfoForm.reset({
          issue_date: reportData.issue_date || new Date().toISOString().split('T')[0],
          approved_by: reportData.approved_by || "",
          approver_signature: reportData.approver_signature || "",
          date_of_production: reportData.date_of_production || new Date().toISOString().split('T')[0],
          batch_number: String(reportData.batch_number || ""),
          variety: reportData.variety || "Steri milk"
        })

        // Raw milk silos
        if (reportData.raw_milk_silos && reportData.raw_milk_silos[0]) {
          const rms = reportData.raw_milk_silos[0]
          rawMilkSilosForm.reset({
            tank: rms.tank || "",
            time: rms.time || "",
            temperature: String(rms.temperature || ""),
            alcohol: String(rms.alcohol || ""),
            res: String(rms.res || ""),
            cob: !!rms.cob,
            ph: String(rms.ph || ""),
            fat: String(rms.fat || ""),
            lr_snf: rms.lr_snf || "",
            acidity: String(rms.acidity || ""),
            remarks: rms.remarks || ""
          })
        }

        // Other tests
        if (reportData.other_tests && reportData.other_tests[0]) {
          const ot = reportData.other_tests[0]
          otherTestsForm.reset({
            sample_details: ot.sample_details || "",
            ph: String(ot.ph || ""),
            caustic: String(ot.caustic || ""),
            acid: String(ot.acid || ""),
            chlorine: String(ot.chlorine || ""),
            hd: String(ot.hd || ""),
            tds: String(ot.tds || ""),
            hydrogen_peroxide: String(ot.hydrogen_peroxide || ""),
            remarks: ot.remarks || ""
          })
        }

        // Standardisation
        if (reportData.standardisation_and_pasteurisation && reportData.standardisation_and_pasteurisation[0]) {
          const sap = reportData.standardisation_and_pasteurisation[0]
          standardisationForm.reset({
            tank: sap.tank || "",
            batch: String(sap.batch || ""),
            time: sap.time || "",
            temperature: String(sap.temperature || ""),
            ot: sap.ot || "",
            alcohol: String(sap.alcohol || ""),
            phosphatase: sap.phosphatase || "",
            ph: String(sap.ph || ""),
            cob: !!sap.cob,
            fat: String(sap.fat || ""),
            ci_si: sap.ci_si || "",
            lr_snf: sap.lr_snf || "",
            acidity: String(sap.acidity || ""),
            analyst: sap.analyst || "",
            remarks: sap.remarks || ""
          })
        }

        // UHT steri milk
        if (reportData.uht_steri_milk && reportData.uht_steri_milk[0]) {
          const uht = reportData.uht_steri_milk[0]
          uhtSteriMilkForm.reset({
            time: uht.time || "",
            batch: uht.batch || "",
            temperature: String(uht.temperature || ""),
            ot: uht.ot || "",
            alc: String(uht.alc || ""),
            res: String(uht.res || ""),
            cob: !!uht.cob,
            ph: String(uht.ph || ""),
            fat: String(uht.fat || ""),
            lr_snf: uht.lr_snf || "",
            ci_si: uht.ci_si || "",
            total_solids: String(uht.total_solids || ""),
            acidity: String(uht.acidity || ""),
            coffee: String(uht.coffee || ""),
            hydrogen_peroxide_or_turbidity: uht.hydrogen_peroxide_or_turbidity || "",
            analyst: uht.analyst || "",
            remarks: uht.remarks || ""
          })
        }

        setCurrentStep(1)
      } catch (err) {
        console.error("Error populating edit form:", err)
        toast.error("Failed to load report data")
      }
    } else {
      // Create mode -> clear forms
      basicInfoForm.reset()
      rawMilkSilosForm.reset()
      otherTestsForm.reset()
      standardisationForm.reset()
      uhtSteriMilkForm.reset()
      setCurrentStep(1)
    }
  }, [open, mode, reportData])

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const basicInfo = basicInfoForm.getValues()
      const rawMilkSilos = rawMilkSilosForm.getValues()
      const otherTests = otherTestsForm.getValues()
      const standardisation = standardisationForm.getValues()
      const uhtSteriMilk = uhtSteriMilkForm.getValues()

      // Helper to convert time to backend format
      const convertTimeToBackend = (val: string): string | null => {
        if (!val) return null
        
        // If it's an ISO datetime string (e.g., "2025-11-07T10:54:00+00" or "2025-11-07T10:54:00.000Z")
        if (val.includes('T')) {
          const date = new Date(val)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          const seconds = String(date.getSeconds()).padStart(2, '0')
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}+00`
        }
        
        // If already in correct format "YYYY-MM-DD HH:mm:ss+00"
        if (val.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\+\d{2}$/)) {
          return val
        }
        
        // If it's just HH:mm format, convert to full datetime with today's date
        if (val.match(/^\d{2}:\d{2}$/) || val.match(/^\d{2}:\d{2}:\d{2}$/)) {
          const today = new Date().toISOString().split('T')[0]
          const time = val.length === 5 ? `${val}:00` : val
          return `${today} ${time}+00`
        }
        
        // Otherwise, return as is
        return val
      }

      // Helper to parse number or return undefined
      const parseNumber = (val: string): number | undefined => {
        if (val === "" || val === null || val === undefined) return undefined
        const parsed = parseFloat(val)
        return isNaN(parsed) ? undefined : parsed
      }

      const payload: any = {
        issue_date: basicInfo.issue_date,
        approved_by: basicInfo.approved_by,
        approver_signature: normalizeDataUrlToBase64(basicInfo.approver_signature) || undefined,
        date_of_production: basicInfo.date_of_production,
        batch_number: parseInt(basicInfo.batch_number) || 1,
        variety: basicInfo.variety,
        raw_milk_silos: [
          {
            tank: rawMilkSilos.tank || undefined,
            time: convertTimeToBackend(rawMilkSilos.time),
            temperature: parseNumber(rawMilkSilos.temperature),
            alcohol: parseNumber(rawMilkSilos.alcohol),
            res: parseNumber(rawMilkSilos.res),
            cob: rawMilkSilos.cob,
            ph: parseNumber(rawMilkSilos.ph),
            fat: parseNumber(rawMilkSilos.fat),
            lr_snf: rawMilkSilos.lr_snf || undefined,
            acidity: parseNumber(rawMilkSilos.acidity),
            remarks: rawMilkSilos.remarks || undefined
          }
        ],
        other_tests: [
          {
            sample_details: otherTests.sample_details || undefined,
            ph: parseNumber(otherTests.ph),
            caustic: parseNumber(otherTests.caustic),
            acid: parseNumber(otherTests.acid),
            chlorine: parseNumber(otherTests.chlorine),
            hd: parseNumber(otherTests.hd),
            tds: parseNumber(otherTests.tds),
            hydrogen_peroxide: parseNumber(otherTests.hydrogen_peroxide),
            remarks: otherTests.remarks || undefined
          }
        ],
        standardisation_and_pasteurisation: [
          {
            tank: standardisation.tank || undefined,
            batch: parseInt(standardisation.batch) || undefined,
            time: convertTimeToBackend(standardisation.time),
            temperature: parseNumber(standardisation.temperature),
            ot: standardisation.ot || undefined,
            alcohol: parseNumber(standardisation.alcohol),
            phosphatase: standardisation.phosphatase || undefined,
            ph: parseNumber(standardisation.ph),
            cob: standardisation.cob,
            fat: parseNumber(standardisation.fat),
            ci_si: standardisation.ci_si || undefined,
            lr_snf: standardisation.lr_snf || undefined,
            acidity: parseNumber(standardisation.acidity),
            analyst: standardisation.analyst || undefined,
            remarks: standardisation.remarks || undefined
          }
        ],
        uht_steri_milk: [
          {
            time: convertTimeToBackend(uhtSteriMilk.time),
            batch: uhtSteriMilk.batch || undefined,
            temperature: parseNumber(uhtSteriMilk.temperature),
            ot: uhtSteriMilk.ot || undefined,
            alc: parseNumber(uhtSteriMilk.alc),
            res: parseNumber(uhtSteriMilk.res),
            cob: uhtSteriMilk.cob,
            ph: parseNumber(uhtSteriMilk.ph),
            fat: parseNumber(uhtSteriMilk.fat),
            lr_snf: uhtSteriMilk.lr_snf || undefined,
            ci_si: uhtSteriMilk.ci_si || undefined,
            total_solids: parseNumber(uhtSteriMilk.total_solids),
            acidity: parseNumber(uhtSteriMilk.acidity),
            coffee: parseNumber(uhtSteriMilk.coffee),
            hydrogen_peroxide_or_turbidity: uhtSteriMilk.hydrogen_peroxide_or_turbidity || undefined,
            analyst: uhtSteriMilk.analyst || undefined,
            remarks: uhtSteriMilk.remarks || undefined
          }
        ]
      }

      if (mode === "edit" && reportData?.id) {
        // Include IDs for update
        payload.id = reportData.id
        if (reportData.raw_milk_silos?.[0]?.id) {
          payload.raw_milk_silos[0].id = reportData.raw_milk_silos[0].id
        }
        if (reportData.other_tests?.[0]?.id) {
          payload.other_tests[0].id = reportData.other_tests[0].id
        }
        if (reportData.standardisation_and_pasteurisation?.[0]?.id) {
          payload.standardisation_and_pasteurisation[0].id = reportData.standardisation_and_pasteurisation[0].id
        }
        if (reportData.uht_steri_milk?.[0]?.id) {
          payload.uht_steri_milk[0].id = reportData.uht_steri_milk[0].id
        }

        await steriMilkTestReportApi.updateTestReport(reportData.id, payload)
        toast.success("Steri Milk Test Report updated successfully")
      } else {
        await steriMilkTestReportApi.createTestReport(payload)
        toast.success("Steri Milk Test Report created successfully")
      }

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      const msg = typeof err === "string" ? err : (err?.message || JSON.stringify(err) || "Failed to save Steri Milk Test Report")
      toast.error(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle>
            {mode === "edit" ? "Edit Steri Milk Test Report" : "Create Steri Milk Test Report"}
          </SheetTitle>
          <SheetDescription>
            {currentStep === 1 && "Basic Information: Enter the basic report information"}
            {currentStep === 2 && "Raw Milk Silos: Enter raw milk silo test parameters"}
            {currentStep === 3 && "Other Tests: Enter additional test parameters"}
            {currentStep === 4 && "Standardisation & Pasteurisation: Enter pasteurisation data"}
            {currentStep === 5 && "UHT Steri Milk: Enter UHT processing parameters"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white" key={`form-${open}-${currentStep}`}>
          {loadingData ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Loading process data...</p>
              </div>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <BasicInfoStep
                  form={basicInfoForm}
                  userRoles={userRoles}
                  loadingUserRoles={loadingUserRoles}
                />
              )}
              {currentStep === 2 && (
                <RawMilkSilosStep
                  form={rawMilkSilosForm}
                  silos={silos}
                  loadingSilos={loadingSilos}
                />
              )}
              {currentStep === 3 && (
                <OtherTestsStep form={otherTestsForm} />
              )}
              {currentStep === 4 && (
                <StandardisationStep
                  form={standardisationForm}
                  silos={silos}
                  loadingSilos={loadingSilos}
                  users={users}
                  loadingUsers={loadingUsers}
                />
              )}
              {currentStep === 5 && (
                <UhtSteriMilkStep
                  form={uhtSteriMilkForm}
                  users={users}
                  loadingUsers={loadingUsers}
                />
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between p-6 pt-0 border-t bg-white">
          <Button
            
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of 5
            </span>
          </div>

          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {mode === "edit" ? "Update Report" : "Create Report"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
