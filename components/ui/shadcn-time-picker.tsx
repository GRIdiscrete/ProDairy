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
  const [hours, setHours] = React.useState("12")
  const [minutes, setMinutes] = React.useState("00")
  const [period, setPeriod] = React.useState("AM")

  // Parse the current value
  React.useEffect(() => {
    if (value) {
      let timeString = ""

      // Extract time from various formats
      if (value.includes('T')) {
        timeString = value.split('T')[1]?.substring(0, 5) || ""
      } else if (value.includes(' ')) {
        timeString = value.split(' ')[1]?.substring(0, 5) || ""
      } else if (value.match(/^\d{2}:\d{2}$/)) {
        timeString = value
      }

      if (timeString) {
        const [h, m] = timeString.split(':')
        const hour24 = parseInt(h)
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24

        setHours(hour12.toString().padStart(2, '0'))
        setMinutes(m)
        setPeriod(hour24 >= 12 ? 'PM' : 'AM')
      }
    }
  }, [value])

  const handleTimeChange = () => {
    const hour24 = period === 'AM'
      ? (parseInt(hours) === 12 ? 0 : parseInt(hours))
      : (parseInt(hours) === 12 ? 12 : parseInt(hours) + 12)

    const timeString = `${hour24.toString().padStart(2, '0')}:${minutes}`

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

    if (timeString) {
      const [h, m] = timeString.split(':')
      const hour24 = parseInt(h)
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      const period = hour24 >= 12 ? 'PM' : 'AM'
      return `${hour12}:${m} ${period}`
    }

    return ""
  }, [value])

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1
    return { value: hour.toString().padStart(2, '0'), label: hour.toString() }
  })

  // Generate minute options (00, 15, 30, 45 as defaults, but allow all 00-59)
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
              "w-full justify-start text-left font-normal",
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
            <div className="text-sm font-medium text-center">Select Time</div>

            <div className="grid grid-cols-3 gap-2">
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


              <div className="space-y-2">
                <Label className="text-xs">Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
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
