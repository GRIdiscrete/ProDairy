"use client"

import { ERPInput, ERPSelect, ERPDatePicker, ERPCheckbox } from "@/components/erp/form-fields"

interface StandardisationStepProps {
  tankers: any[]
  users: any[]
  loadingTankers: boolean
  loadingUsers: boolean
  handleTankerSearch: (query: string) => Promise<any[]>
  handleUserSearch: (query: string) => Promise<any[]>
}

export function StandardisationStep({ 
  tankers, 
  users, 
  loadingTankers, 
  loadingUsers, 
  handleTankerSearch, 
  handleUserSearch 
}: StandardisationStepProps) {
  const prefix = "standardisation_and_pasteurisation[0]"

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Standardisation & Pasteurisation</h3>
      <div className="grid grid-cols-2 gap-4">
        <ERPSelect
          name={`${prefix}.tank`}
          label="Tank"
          options={tankers.map(tanker => ({
            value: tanker.id,
            label: `${tanker.reg_number} (${tanker.condition})`,
            description: `${tanker.capacity}L capacity • ${tanker.age} years old`
          }))}
          onSearch={handleTankerSearch}
          loading={loadingTankers}
          placeholder={loadingTankers ? "Loading tankers..." : "Search and select tanker"}
          searchPlaceholder="Search tankers..."
          emptyMessage={loadingTankers ? "Loading tankers..." : "No tankers found"}
        />
        <ERPInput name={`${prefix}.batch`} label="Batch" disabled className="bg-gray-50" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ERPDatePicker name={`${prefix}.time`} label="Time" showTime placeholder="Select date and time" />
        <ERPInput name={`${prefix}.temperature`} label="Temperature (°C)" type="number" step="0.1" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ERPInput name={`${prefix}.ot`} label="OT" />
        <ERPInput name={`${prefix}.alcohol`} label="Alcohol (%)" type="number" step="0.1" />
        <ERPInput name={`${prefix}.phosphatase`} label="Phosphatase" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ERPInput name={`${prefix}.ph`} label="pH" type="number" step="0.1" />
        <ERPCheckbox name={`${prefix}.cob`} label="COB" text="COB Present" />
        <ERPInput name={`${prefix}.fat`} label="Fat (%)" type="number" step="0.1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ERPInput name={`${prefix}.ci_si`} label="CI/SI" />
        <ERPInput name={`${prefix}.lr_snf`} label="LR/SNF" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ERPInput name={`${prefix}.acidity`} label="Acidity" type="number" step="0.01" />
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
