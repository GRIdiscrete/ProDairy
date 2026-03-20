import { Controller, UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
import { Clock, Thermometer } from "lucide-react"
import { ProcessOverview } from "./process-overview"
import type { ProcessDetailsFormData } from "./types"

interface ProcessDetailsStepProps {
  form: UseFormReturn<ProcessDetailsFormData>
}

const ProcessDetailCard = ({ 
  title, 
  icon, 
  iconColor, 
  timeFieldName, 
  tempFieldName, 
  pressureFieldName, 
  form 
}: any) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
      {icon === 'clock' ? (
        <Clock className={`h-5 w-5 ${iconColor}`} />
      ) : (
        <Thermometer className={`h-5 w-5 ${iconColor}`} />
      )}
      <span>{title}</span>
    </h4>
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Controller
          name={timeFieldName}
          control={form.control}
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
        <Label>Temperature</Label>
        <Controller
          name={tempFieldName}
          control={form.control}
          render={({ field }) => (
            <Input
              type="text"
              placeholder="75.5"
              {...field}
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={(e) => {
                field.onBlur()
                // Trigger form change to activate auto-prefill
                field.onChange(e.target.value)
              }}
            />
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>Pressure</Label>
        <Controller
          name={pressureFieldName}
          control={form.control}
          render={({ field }) => (
            <Input
              type="text"
              placeholder="15.2"
              {...field}
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={(e) => {
                field.onBlur()
                // Trigger form change to activate auto-prefill
                field.onChange(e.target.value)
              }}
            />
          )}
        />
      </div>
    </div>
  </div>
)

export function ProcessDetailsStep({ form }: ProcessDetailsStepProps) {
  return (
    <div className="space-y-6 p-6">
      <ProcessOverview />

      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light text-gray-900">Process Details</h3>
          <p className="text-sm font-light text-gray-600 mt-2">
            Enter the detailed process information with temperature and pressure readings
          </p>
        </div>

        <div className="space-y-6">
          <ProcessDetailCard
            title="Filling Start Details"
            icon="clock"
            iconColor="text-blue-600"
            timeFieldName="filling_start.time"
            tempFieldName="filling_start.temperature"
            pressureFieldName="filling_start.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Autoclave Start Details"
            icon="thermometer"
            iconColor="text-red-600"
            timeFieldName="autoclave_start.time"
            tempFieldName="autoclave_start.temperature"
            pressureFieldName="autoclave_start.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Heating Start Details"
            icon="thermometer"
            iconColor="text-orange-600"
            timeFieldName="heating_start.time"
            tempFieldName="heating_start.temperature"
            pressureFieldName="heating_start.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Heating Finish Details"
            icon="thermometer"
            iconColor="text-orange-600"
            timeFieldName="heating_finish.time"
            tempFieldName="heating_finish.temperature"
            pressureFieldName="heating_finish.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Steri 1"
            icon="thermometer"
            iconColor="text-red-600"
            timeFieldName="sterilization_start.time"
            tempFieldName="sterilization_start.temperature"
            pressureFieldName="sterilization_start.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Steri 2"
            icon="thermometer"
            iconColor="text-red-600"
            timeFieldName="sterilization_after_5.time"
            tempFieldName="sterilization_after_5.temperature"
            pressureFieldName="sterilization_after_5.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Sterilization Finish Details"
            icon="thermometer"
            iconColor="text-red-600"
            timeFieldName="sterilization_finish.time"
            tempFieldName="sterilization_finish.temperature"
            pressureFieldName="sterilization_finish.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Pre Cooling Start Details"
            icon="thermometer"
            iconColor="text-blue-600"
            timeFieldName="pre_cooling_start.time"
            tempFieldName="pre_cooling_start.temperature"
            pressureFieldName="pre_cooling_start.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Pre Cooling Finish Details"
            icon="thermometer"
            iconColor="text-blue-600"
            timeFieldName="pre_cooling_finish.time"
            tempFieldName="pre_cooling_finish.temperature"
            pressureFieldName="pre_cooling_finish.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Cooling 1 Start Details"
            icon="thermometer"
            iconColor="text-cyan-600"
            timeFieldName="cooling_1_start.time"
            tempFieldName="cooling_1_start.temperature"
            pressureFieldName="cooling_1_start.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Cooling 1 Finish Details"
            icon="thermometer"
            iconColor="text-cyan-600"
            timeFieldName="cooling_1_finish.time"
            tempFieldName="cooling_1_finish.temperature"
            pressureFieldName="cooling_1_finish.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Cooling 2 Start Details"
            icon="thermometer"
            iconColor="text-indigo-600"
            timeFieldName="cooling_2_start.time"
            tempFieldName="cooling_2_start.temperature"
            pressureFieldName="cooling_2_start.pressure"
            form={form}
          />
          <ProcessDetailCard
            title="Cooling 2 Finish Details"
            icon="thermometer"
            iconColor="indigo-600"
            timeFieldName="cooling_2_finish.time"
            tempFieldName="cooling_2_finish.temperature"
            pressureFieldName="cooling_2_finish.pressure"
            form={form}
          />
        </div>
      </div>
    </div>
  )
}
