import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CircleColorOption {
  value: string
  label: string
  color: string
}

interface CircleColorSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  options: CircleColorOption[]
  placeholder?: string
}

export function CircleColorSelector({ 
  value, 
  onValueChange, 
  options,
  placeholder = "Select color"
}: CircleColorSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${options.find(opt => opt.value === value)?.color}`} />
              <span>{options.find(opt => opt.value === value)?.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${option.color}`} />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
