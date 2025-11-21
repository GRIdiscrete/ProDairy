"use client"

import { ERPInput, ERPSelect, ERPDatePicker, ERPCheckbox } from "@/components/erp/form-fields"

interface UhtStepProps {
  users: any[]
  loadingUsers: boolean
  handleUserSearch: (query: string) => Promise<any[]>
}

export function UhtStep({ users, loadingUsers, handleUserSearch }: UhtStepProps) {
  const prefix = "uht_steri_milk[0]"

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">UHT Steri Milk Parameters</h3>
      <div className="grid grid-cols-2 gap-4">
        <ERPDatePicker name={`${prefix}.time`} label="Time" showTime placeholder="Select date and time" />
        <ERPInput name={`${prefix}.batch`} label="Batch" disabled className="bg-gray-50" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ERPInput name={`${prefix}.temperature`} label="Temperature (°C)" type="number" step="0.1" />
        <ERPInput name={`${prefix}.ot`} label="OT" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ERPInput name={`${prefix}.alc`} label="ALC" type="number" step="0.1" />
        <ERPInput name={`${prefix}.res`} label="RES" type="number" step="0.1" />
        <ERPCheckbox name={`${prefix}.cob`} label="COB" text="COB Present" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ERPInput name={`${prefix}.ph`} label="pH" type="number" step="0.1" />
        <ERPInput name={`${prefix}.fat`} label="Fat (%)" type="number" step="0.1" />
        <ERPInput name={`${prefix}.lr_snf`} label="LR/SNF" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ERPInput name={`${prefix}.ci_si`} label="CI/SI" />
        <ERPInput name={`${prefix}.total_solids`} label="Total Solids" type="number" step="0.1" />
        <ERPInput name={`${prefix}.acidity`} label="Acidity" type="number" step="0.01" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ERPCheckbox name={`${prefix}.coffee`} label="Coffee" text="Coffee Present" />
        <ERPInput name={`${prefix}.hydrogen_peroxide_or_turbidity`} label="Hydrogen Peroxide/Turbidity" />
      </div>
      <ERPInput name={`${prefix}.coffee_remarks`} label="Coffee Remarks" />
      <div className="grid grid-cols-2 gap-4">
        <ERPSelect
          name={`${prefix}.analyst`}
          label="Analyst"
          options={users.map(user => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name}`.trim() || user.email,
            description: `${user.department} • ${user.email}`
          }))}
          onSearch={handleUserSearch}
          loading={loadingUsers}
          placeholder="Search and select analyst"
          searchPlaceholder="Search users..."
          emptyMessage="No users found"
        />
      </div>
      <ERPInput name={`${prefix}.remarks`} label="Remarks" />
    </div>
  )
}
