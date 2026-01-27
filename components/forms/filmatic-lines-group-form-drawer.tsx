"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Input } from "@/components/ui/input"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createFilmaticGroup, createFilmaticGroupDetails } from "@/lib/store/slices/filmaticLinesGroupsSlice"
import { usersApi } from "@/lib/api/users"

const step1Schema = yup.object({
  manager_id: yup.string().required("Manager is required"),
})

const step2Schema = yup.object({
  filmatic_line_groups_id: yup.string().required(),
  group_name: yup.string().required("Group name is required"),
  operator_ids: yup.array(yup.string()).min(1, "Select at least one operator").required(),
})

type Step1 = yup.InferType<typeof step1Schema>
type Step2 = yup.InferType<typeof step2Schema>

interface Props { open: boolean; onOpenChange: (open: boolean) => void }

export function FilmaticLinesGroupFormDrawer({ open, onOpenChange }: Props) {
  const dispatch = useAppDispatch()
  const { currentGroup, operationLoading } = useAppSelector((s) => (s as any).filmaticLinesGroups)
  const [currentStep, setCurrentStep] = useState(1)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const step1 = useForm<Step1>({ resolver: yupResolver(step1Schema), defaultValues: { manager_id: "" } })
  const step2 = useForm<Step2>({ resolver: yupResolver(step2Schema), defaultValues: { filmatic_line_groups_id: "", group_name: "", operator_ids: [] as string[] } as any })

  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      step1.reset({ manager_id: "" })
      step2.reset({ filmatic_line_groups_id: "", group_name: "", operator_ids: [] as any })
      loadUsers()
    }
  }, [open])

  useEffect(() => {
    if (currentGroup && currentStep === 1) {
      step2.setValue("filmatic_line_groups_id", currentGroup.id)
      setCurrentStep(2)
    }
  }, [currentGroup, currentStep, step2])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await usersApi.getUsers()
      setUsers(res.data || [])
    } catch { setUsers([]) } finally { setLoadingUsers(false) }
  }

  const handleUserSearch = async (query: string) => {
    if (!query.trim()) return []
    try {
      const res = await usersApi.getUsers({ filters: { search: query } })
      return (res?.data || []).map((u: any) => ({ value: u.id, label: `${u.first_name} ${u.last_name}`.trim() || u.email, description: `${u.department} • ${u.email}` }))
    } catch { return [] }
  }

  const submitStep1 = step1.handleSubmit(async (data) => {
    try { await dispatch(createFilmaticGroup(data)).unwrap() } catch {}
  })

  const submitStep2 = step2.handleSubmit(async (data) => {
    try { await dispatch(createFilmaticGroupDetails(data)).unwrap(); onOpenChange(false) } catch {}
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-0 bg-white">
        <SheetHeader className="p-6 pb-0 bg-white">
          <SheetTitle className="text-lg font-light">Create Filmatic Lines Group</SheetTitle>
          <SheetDescription className="text-sm font-light">Step {currentStep} of 2</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto bg-white" key={`flg-${open}-${currentStep}`}>
          {currentStep === 1 ? (
            <div className="space-y-6 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-light text-gray-900">Select Manager</h3>
                <p className="text-sm font-light text-gray-600 mt-2">Choose the manager for this group</p>
              </div>
              <div className="space-y-2">
                <Label>Manager *</Label>
                <Controller name="manager_id" control={step1.control} render={({ field }) => (
                  <SearchableSelect
                    options={users.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}`.trim() || u.email, description: `${u.department} • ${u.email}` }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    onSearch={handleUserSearch}
                    placeholder="Search and select manager"
                    loading={loadingUsers}
                  />
                )} />
                {step1.formState.errors.manager_id && <p className="text-sm text-red-500">{step1.formState.errors.manager_id.message}</p>}
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <LoadingButton onClick={submitStep1} disabled={operationLoading.create} className="rounded-full">Next</LoadingButton>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-light text-gray-900">Group Details</h3>
                <p className="text-sm font-light text-gray-600 mt-2">Name and assign operators</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Group Name *</Label>
                  <Controller name="group_name" control={step2.control} render={({ field }) => (
                    <Input placeholder="e.g., Production Team A" {...field} />
                  )} />
                  {step2.formState.errors.group_name && <p className="text-sm text-red-500">{step2.formState.errors.group_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Operators *</Label>
                  <Controller name="operator_ids" control={step2.control} render={({ field }) => (
                    <SearchableSelect
                      options={users.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}`.trim() || u.email, description: `${u.department} • ${u.email}` }))}
                      value={field.value as any}
                      onValueChange={field.onChange as any}
                      onSearch={handleUserSearch}
                      placeholder="Search and select operators"
                      multiple
                      loading={loadingUsers}
                    />
                  )} />
                  {step2.formState.errors.operator_ids && <p className="text-sm text-red-500">{(step2.formState.errors.operator_ids as any).message}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <LoadingButton  onClick={() => setCurrentStep(1)} className="rounded-full">Back</LoadingButton>
                <LoadingButton onClick={submitStep2} disabled={operationLoading.update} className="rounded-full">Save Group</LoadingButton>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}


