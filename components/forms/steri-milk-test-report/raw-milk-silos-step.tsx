"use client"

import { UseFormReturn, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import type { RawMilkSilosFormData } from "./types"
import type { Tanker } from "@/lib/api/tanker"

interface RawMilkSilosStepProps {
  form: UseFormReturn<RawMilkSilosFormData>
  tankers: Tanker[]
  loadingTankers: boolean
}

export function RawMilkSilosStep({ form, tankers, loadingTankers }: RawMilkSilosStepProps) {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-medium">Raw Milk Silos Test Parameters</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tank">Tank</Label>
          <Controller
            name="tank"
            control={form.control}
            render={({ field }) => (
              <SearchableSelect
                options={tankers.map(tanker => ({
                  value: tanker.id,
                  label: `${tanker.reg_number} (${tanker.condition})`,
                  description: `${tanker.capacity}L capacity • ${tanker.age} years old`
                }))}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={loadingTankers ? "Loading tankers..." : "Select tank"}
                searchPlaceholder="Search tankers..."
                emptyMessage="No tankers found"
                loading={loadingTankers}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Controller
            name="time"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                showTime={true}
                placeholder="Select date and time"
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (°C)</Label>
          <Controller
            name="temperature"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" placeholder="0.0" />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alcohol">Alcohol</Label>
          <Controller
            name="alcohol"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" placeholder="0.0" />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="res">Res</Label>
          <Controller
            name="res"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" placeholder="0.0" />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 flex items-end">
          <Controller
            name="cob"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cob"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor="cob"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  COB
                </label>
              </div>
            )}
          />
        </div>

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
          <Label htmlFor="fat">Fat (%)</Label>
          <Controller
            name="fat"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.1" placeholder="0.0" />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lr_snf">LR/SNF</Label>
          <Controller
            name="lr_snf"
            control={form.control}
            render={({ field }) => (
              <Input {...field} placeholder="e.g., 30/8.95" />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="acidity">Acidity</Label>
          <Controller
            name="acidity"
            control={form.control}
            render={({ field }) => (
              <Input {...field} type="number" step="0.01" placeholder="0.00" />
            )}
          />
        </div>
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
