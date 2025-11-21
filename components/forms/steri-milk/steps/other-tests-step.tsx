"use client"

import { ERPInput } from "@/components/erp/form-fields"

export function OtherTestsStep() {
  const prefix = "other_tests[0]"

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Other Tests Parameters</h3>
      <ERPInput name={`${prefix}.sample_details`} label="Sample Details" />
      <div className="grid grid-cols-3 gap-4">
        <ERPInput name={`${prefix}.ph`} label="pH" type="number" step="0.1" />
        <ERPInput name={`${prefix}.caustic`} label="Caustic" type="number" step="0.1" />
        <ERPInput name={`${prefix}.acid`} label="Acid" type="number" step="0.1" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ERPInput name={`${prefix}.chlorine`} label="Chlorine" type="number" step="0.1" />
        <ERPInput name={`${prefix}.hd`} label="HD" type="number" step="0.1" />
        <ERPInput name={`${prefix}.tds`} label="TDS" type="number" step="0.01" />
      </div>
      <ERPInput name={`${prefix}.hydrogen_peroxide`} label="Hydrogen Peroxide" type="number" step="0.01" />
      <ERPInput name={`${prefix}.remarks`} label="Remarks" />
    </div>
  )
}
