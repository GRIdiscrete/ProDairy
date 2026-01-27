"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
  error?: boolean
  required?: boolean
}

export function ShadcnTimePicker({
  value,
  onChange,
  placeholder = "Select time",
  label,
  disabled = false,
  className,
  error = false,
  required = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hours, setHours] = React.useState("00")
  const [minutes, setMinutes] = React.useState("00")

  // Parse the current value
  React.useEffect(() => {
    if (value) {
      let timeString = ""
      if (value.includes('T')) {
        timeString = value.split('T')[1]?.substring(0, 5) || ""
      } else if (value.includes(' ')) {
        timeString = value.split(' ')[1]?.substring(0, 5) || ""
      } else if (value.match(/^\d{2}:\d{2}$/)) {
        timeString = value
      }
      if (timeString) {
        const [h, m] = timeString.split(':')
        setHours(h.padStart(2, '0'))
        setMinutes(m)
      }
    }
  }, [value])

  const handleTimeChange = () => {
    const timeString = `${hours}:${minutes}`
    if (onChange) {
      // Convert to datetime string for API
      const currentDate = new Date().toISOString().split('T')[0]
      const dateTimeString = `${currentDate} ${timeString}:00.000000+00`
      onChange(dateTimeString)
    }
    setOpen(false)
  }

  const displayTime = React.useMemo(() => {
    if (!value) return ""
    let timeString = ""
    if (value.includes('T')) {
      timeString = value.split('T')[1]?.substring(0, 5) || ""
    } else if (value.includes(' ')) {
      timeString = value.split(' ')[1]?.substring(0, 5) || ""
    } else if (value.match(/^\d{2}:\d{2}$/)) {
      timeString = value
    }
    return timeString
  }, [value])

  // Generate hour options (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i
    return { value: hour.toString().padStart(2, '0'), label: hour.toString().padStart(2, '0') }
  })

  // Generate minute options (00-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, '0')
    return { value: minute, label: minute }
  })

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn("text-sm font-medium", error && "text-red-500")}> 
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-12 justify-start text-left font-normal bg-transparent hover:bg-transparent border border-gray-300 hover:border-gray-400 focus:border-[#006BC4]",
              !displayTime && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <Clock className="mr-2 h-4 w-4" />
            {displayTime || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="text-sm font-medium text-center">Select Time (24h)</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">Hour</Label>
                <Select value={hours} onValueChange={setHours}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hourOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Minute</Label>
                <Select value={minutes} onValueChange={setMinutes}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-32">
                    {minuteOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button  size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleTimeChange}>
                Set Time
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
