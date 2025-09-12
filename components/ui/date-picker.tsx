"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  showTime?: boolean
  disabled?: boolean
  className?: string
  error?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  label,
  showTime = false,
  disabled = false,
  className,
  error = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState("")

  // Parse the current value
  const currentDate = value ? new Date(value) : undefined
  const isValidDate = currentDate && !isNaN(currentDate.getTime())

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    let dateString = format(date, "yyyy-MM-dd")
    
    // If time is enabled and we have a time value, append it
    if (showTime && timeValue) {
      dateString += `T${timeValue}`
    } else if (showTime && !timeValue) {
      // Default to current time if time is enabled but no time selected
      const now = new Date()
      dateString += `T${format(now, "HH:mm")}`
    }

    onChange?.(dateString)
  }

  // Handle time change
  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    
    if (currentDate) {
      const dateString = format(currentDate, "yyyy-MM-dd")
      onChange?.(`${dateString}T${time}`)
    }
  }

  // Initialize time value when date changes
  React.useEffect(() => {
    if (currentDate && showTime) {
      const timeStr = format(currentDate, "HH:mm")
      setTimeValue(timeStr)
    }
  }, [currentDate, showTime])

  // Format display value
  const displayValue = React.useMemo(() => {
    if (!isValidDate) return ""
    
    if (showTime) {
      return format(currentDate!, "MMM dd, yyyy 'at' HH:mm")
    }
    return format(currentDate!, "MMM dd, yyyy")
  }, [currentDate, isValidDate, showTime])

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-base font-normal text-gray-700">
          {label}
        </Label>
      )}
      
      <div className="space-y-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-12 border border-gray-300 hover:border-gray-400 focus:border-blue-500 shadow-none hover:shadow-none focus:shadow-none",
                !isValidDate && "text-muted-foreground",
                error && "border-red-500 focus:border-red-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {isValidDate ? (showTime ? format(currentDate!, "MMM dd, yyyy") : displayValue) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={isValidDate ? currentDate : undefined}
              captionLayout="dropdown"
              onSelect={(date) => {
                handleDateSelect(date)
                setOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {showTime && (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Time picker component for time-only inputs
interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
  error?: boolean
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  label,
  disabled = false,
  className,
  error = false,
}: TimePickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-base font-normal text-gray-700">
          {label}
        </Label>
      )}
      
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Input
          type="time"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            error && "border-red-500 focus:border-red-500"
          )}
        />
      </div>
    </div>
  )
}
