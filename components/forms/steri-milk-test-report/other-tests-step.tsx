"use client"

import { UseFormReturn, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { OtherTestsFormData } from "./types"

interface OtherTestsStepProps {
  form: UseFormReturn<OtherTestsFormData>
}

export function OtherTestsStep({ form }: OtherTestsStepProps) {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-medium">Other Tests Parameters</h3>

      <div className="space-y-2">
        <Label htmlFor="sample_details">Sample Details</Label>
        <Controller
          name="sample_details"
          control={form.control}
          render={({ field }) => (
            <Input {...field} placeholder="Enter sample details" />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ph">pH</Label>
          <Controller
            name="ph"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" placeholder="0.0" />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="caustic">Caustic</Label>
          <Controller
            name="caustic"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" placeholder="0.0" />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="acid">Acid</Label>
          <Controller
            name="acid"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" placeholder="0.0" />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="chlorine">Chlorine</Label>
          <Controller
            name="chlorine"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" placeholder="0.0" />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hd">HD</Label>
          <Controller
            name="hd"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" placeholder="0.0" />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tds">TDS</Label>
          <Controller
            name="tds"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.01" placeholder="0.00" />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hydrogen_peroxide">Hydrogen Peroxide</Label>
        <Controller
          name="hydrogen_peroxide"
          control={form.control}
          render={({ field }) => (
            <Input {...field} type="number" step="0.01" placeholder="0.00" />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Controller
          name="remarks"
          control={form.control}
          render={({ field }) => (
            <Input {...field} placeholder="Enter remarks" />
          )}
        />
      </div>
    </div>
  )
}
