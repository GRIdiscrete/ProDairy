"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface ERPFieldProps {
  name: string
  label?: string
  placeholder?: string
  description?: string
  className?: string
  disabled?: boolean
}

interface ERPInputProps extends ERPFieldProps {
  type?: string
  step?: string | number
}

export function ERPInput({ name, label, type = "text", step, placeholder, description, className, disabled }: ERPInputProps) {
  const { control, formState: { errors } } = useFormContext()
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            id={name}
            type={type}
            step={step}
            placeholder={placeholder}
            disabled={disabled}
            value={field.value ?? ""}
            onChange={(e) => {
              if (type === 'number') {
                const val = e.target.value === '' ? undefined : parseFloat(e.target.value)
                field.onChange(val)
              } else {
                field.onChange(e)
              }
            }}
            className={errors[name] ? "border-red-500" : ""}
          />
        )}
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {errors[name] && (
        <p className="text-sm text-red-500">{(errors[name] as any)?.message}</p>
      )}
    </div>
  )
}

interface ERPSelectProps extends ERPFieldProps {
  options: { value: string; label: string; description?: string }[]
  onSearch?: (query: string) => Promise<any[]>
  loading?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
}

export function ERPSelect({ 
  name, 
  label, 
  options, 
  placeholder, 
  description, 
  className, 
  disabled,
  onSearch,
  loading,
  searchPlaceholder,
  emptyMessage
}: ERPSelectProps) {
  const { control, formState: { errors } } = useFormContext()

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <SearchableSelect
            value={field.value?.toString()}
            onValueChange={field.onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
            onSearch={onSearch}
            loading={loading}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
          />
        )}
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {errors[name] && (
        <p className="text-sm text-red-500">{(errors[name] as any)?.message}</p>
      )}
    </div>
  )
}

interface ERPDatePickerProps extends ERPFieldProps {
  showTime?: boolean
}

export function ERPDatePicker({ name, label, placeholder, description, className, disabled, showTime }: ERPDatePickerProps) {
  const { control, formState: { errors } } = useFormContext()

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
            showTime={showTime}
            label={label}
          />
        )}
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {errors[name] && (
        <p className="text-sm text-red-500">{(errors[name] as any)?.message}</p>
      )}
    </div>
  )
}

interface ERPCheckboxProps extends ERPFieldProps {
  text: string
}

export function ERPCheckbox({ name, label, text, description, className, disabled }: ERPCheckboxProps) {
  const { control, formState: { errors } } = useFormContext()

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            <label
              htmlFor={name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {text}
            </label>
          </div>
        )}
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {errors[name] && (
        <p className="text-sm text-red-500">{(errors[name] as any)?.message}</p>
      )}
    </div>
  )
}
