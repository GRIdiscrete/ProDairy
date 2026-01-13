import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

// Common country codes - can be expanded
const countries = [
    { value: "+263", label: "Zimbabwe (+263)", code: "ZW" },
    { value: "+27", label: "South Africa (+27)", code: "ZA" },
    { value: "+1", label: "United States (+1)", code: "US" },
    { value: "+44", label: "United Kingdom (+44)", code: "UK" },
    { value: "+260", label: "Zambia (+260)", code: "ZM" },
    { value: "+267", label: "Botswana (+267)", code: "BW" },
    { value: "+258", label: "Mozambique (+258)", code: "MZ" },
]

interface PhoneInputProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    className?: string
    error?: boolean
}

export function PhoneInput({ value = "", onChange, disabled, className, error }: PhoneInputProps) {
    const [open, setOpen] = React.useState(false)
    // Default to +263 if no value, or extract from value
    const [countryCode, setCountryCode] = React.useState("+263")
    const [phoneNumber, setPhoneNumber] = React.useState("")

    React.useEffect(() => {
        if (value) {
            // Try to find a matching country code
            const matchedCountry = countries.find(c => value.startsWith(c.value))
            if (matchedCountry) {
                setCountryCode(matchedCountry.value)
                setPhoneNumber(value.slice(matchedCountry.value.length))
            } else {
                // Fallback if we can't parse it easily, just assumes the current code logic might fail 
                // effectively handling "raw" numbers might require more complex logic or just keeping as is 
                // if it doesn't match known codes. 
                // For this component, we'll try to keep the country code separate.
                setPhoneNumber(value)
            }
        } else {
            setPhoneNumber("")
        }
    }, [value])

    const handleCountrySelect = (currentValue: string) => {
        setCountryCode(currentValue)
        setOpen(false)
        onChange(`${currentValue}${phoneNumber}`)
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // allow only numbers
        const newNumber = e.target.value.replace(/[^0-9]/g, "")
        setPhoneNumber(newNumber)
        onChange(`${countryCode}${newNumber}`)
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-[140px] justify-between",
                            error && "border-red-500 ring-red-500"
                        )}
                        disabled={disabled}
                    >
                        {countryCode ? (
                            <span className="flex items-center gap-2 truncate">
                                <span className="text-muted-foreground text-xs">{countries.find(c => c.value === countryCode)?.code}</span>
                                {countryCode}
                            </span>
                        ) : "Code"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {countries.map((country) => (
                                    <CommandItem
                                        key={country.value}
                                        value={country.label}
                                        onSelect={() => handleCountrySelect(country.value)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                countryCode === country.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {country.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Input
                type="tel"
                placeholder="772 123 456"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={disabled}
                className={cn(
                    "flex-1",
                    error && "border-red-500 focus-visible:ring-red-500"
                )}
            />
        </div>
    )
}
