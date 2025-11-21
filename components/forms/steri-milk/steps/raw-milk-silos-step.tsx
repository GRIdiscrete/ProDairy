"use client"

import { ERPInput, ERPSelect, ERPDatePicker } from "@/components/erp/form-fields"

interface RawMilkSilosStepProps {
  tankers: any[]
  loadingTankers: boolean
  handleTankerSearch: (query: string) => Promise<any[]>
}

export function RawMilkSilosStep({ tankers, loadingTankers, handleTankerSearch }: RawMilkSilosStepProps) {
  // We assume we are editing the first item in the array for now
  const prefix = "raw_milk_silos[0]"

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Raw Milk Silos Test Parameters</h3>
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
        <ERPDatePicker name={`${prefix}.time`} label="Time" showTime placeholder="Select date and time" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ERPInput name={`${prefix}.temperature`} label="Temperature (°C)" type="number" step="0.1" />
        <ERPInput name={`${prefix}.alcohol`} label="Alcohol (%)" type="number" step="0.1" />
        <ERPInput name={`${prefix}.res`} label="RES" type="number" step="0.1" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ERPInput name={`${prefix}.cob`} label="COB" type="number" step="0.1" />
        <ERPInput name={`${prefix}.ph`} label="pH" type="number" step="0.1" />
        <ERPInput name={`${prefix}.fat`} label="Fat (%)" type="number" step="0.1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ERPInput name={`${prefix}.lr_snf`} label="LR/SNF" />
        <ERPInput name={`${prefix}.acidity`} label="Acidity" type="number" step="0.01" />
      </div>
      <ERPInput name={`${prefix}.remarks`} label="Remarks" />
    </div>
  )
}
