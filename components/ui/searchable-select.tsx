"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface SearchableSelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface SearchableSelectProps {
  options?: SearchableSelectOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  onSearch?: (searchTerm: string) => void
  loading?: boolean
  multiple?: boolean
  maxDisplayItems?: number
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  disabled = false,
  className,
  onSearch,
  loading = false,
  multiple = false,
  maxDisplayItems = 3,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<SearchableSelectOption[]>([])
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Filter options based on search term
  const filteredOptions = (options || []).filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (onSearch && searchTerm) {
        onSearch(searchTerm)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, onSearch])

  // Update selected options when value changes
  useEffect(() => {
    if (multiple && Array.isArray(value)) {
      const selected = (options || []).filter(option => value.includes(option.value))
      setSelectedOptions(selected)
    } else if (!multiple && value) {
      const selected = (options || []).find(option => option.value === value)
      setSelectedOptions(selected ? [selected] : [])
    } else {
      setSelectedOptions([])
    }
  }, [value, options, multiple])

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue]
      onValueChange(newValues as any)
    } else {
      onValueChange(optionValue)
      setOpen(false)
    }
  }

  const handleRemove = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      const newValues = value.filter(v => v !== optionValue)
      onValueChange(newValues as any)
    }
  }

  const getDisplayText = () => {
    if (multiple) {
      if (selectedOptions.length === 0) return placeholder
      if (selectedOptions.length <= maxDisplayItems) {
        return selectedOptions.map(opt => opt.label).join(", ")
      }
      return `${selectedOptions.slice(0, maxDisplayItems).map(opt => opt.label).join(", ")} +${selectedOptions.length - maxDisplayItems} more`
    } else {
      return selectedOptions[0]?.label || placeholder
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-12 border border-gray-300 hover:border-gray-400 focus:border-blue-500 shadow-none hover:shadow-none focus:shadow-none",
            !selectedOptions.length && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {multiple && selectedOptions.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {selectedOptions.slice(0, maxDisplayItems).map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(option.value)
                      }}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedOptions.length > maxDisplayItems && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedOptions.length - maxDisplayItems}
                  </Badge>
                )}
              </div>
            )}
            {(!multiple || selectedOptions.length === 0) && (
              <span className="truncate">{getDisplayText()}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
            />
          </div>
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : filteredOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = multiple
                    ? Array.isArray(value) && value.includes(option.value)
                    : value === option.value

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="font-normal">{option.label}</span>
                          {option.description && (
                            <span className="text-sm text-muted-foreground">
                              {option.description}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Specialized components for different entity types
interface EntitySearchableSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  onSearch?: (searchTerm: string) => void
  loading?: boolean
}

export function SiloSearchableSelect({
  value,
  onValueChange,
  placeholder = "Select silo...",
  disabled = false,
  className,
  onSearch,
  loading = false,
}: EntitySearchableSelectProps) {
  const [silos, setSilos] = useState<SearchableSelectOption[]>([])

  const handleSearch = async (searchTerm: string) => {
    if (onSearch) {
      onSearch(searchTerm)
    }
    // The parent component should handle the actual API call and update options
  }

  return (
    <SearchableSelect
      options={silos}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search silos..."
      emptyMessage="No silos found."
      disabled={disabled}
      className={className}
      onSearch={handleSearch}
      loading={loading}
    />
  )
}

export function UserSearchableSelect({
  value,
  onValueChange,
  placeholder = "Select user...",
  disabled = false,
  className,
  onSearch,
  loading = false,
}: EntitySearchableSelectProps) {
  const [users, setUsers] = useState<SearchableSelectOption[]>([])

  const handleSearch = async (searchTerm: string) => {
    if (onSearch) {
      onSearch(searchTerm)
    }
    // The parent component should handle the actual API call and update options
  }

  return (
    <SearchableSelect
      options={users}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search users..."
      emptyMessage="No users found."
      disabled={disabled}
      className={className}
      onSearch={handleSearch}
      loading={loading}
    />
  )
}

export function MachineSearchableSelect({
  value,
  onValueChange,
  placeholder = "Select machine...",
  disabled = false,
  className,
  onSearch,
  loading = false,
}: EntitySearchableSelectProps) {
  const [machines, setMachines] = useState<SearchableSelectOption[]>([])

  const handleSearch = async (searchTerm: string) => {
    if (onSearch) {
      onSearch(searchTerm)
    }
    // The parent component should handle the actual API call and update options
  }

  return (
    <SearchableSelect
      options={machines}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search machines..."
      emptyMessage="No machines found."
      disabled={disabled}
      className={className}
      onSearch={handleSearch}
      loading={loading}
    />
  )
}
