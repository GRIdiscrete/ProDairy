"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: boolean
  disabled?: boolean
  className?: string
}

export function TimePicker({
  label,
  value,
  onChange,
  placeholder = "Select time",
  error = false,
  disabled = false,
  className
}: TimePickerProps) {
  const [time, setTime] = useState(value || "")

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    
    // Convert time to datetime string for API (using current date)
    if (newTime && onChange) {
      const currentDate = new Date().toISOString().split('T')[0]
      const dateTimeString = `${currentDate} ${newTime}:00.000000+00`
      onChange(dateTimeString)
    }
  }

  // Extract time from datetime string for display
  const displayTime = value ? 
    (value.includes('T') ? value.split('T')[1]?.substring(0, 5) : 
     value.includes(' ') ? value.split(' ')[1]?.substring(0, 5) : value) : ""

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="time-picker" className={error ? "text-red-500" : ""}>
          {label}
        </Label>
      )}
      <Input
        id="time-picker"
        type="time"
        value={displayTime}
        onChange={handleTimeChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          error && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
      />
    </div>
  )
}
