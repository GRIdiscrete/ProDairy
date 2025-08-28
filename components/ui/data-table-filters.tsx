"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, Filter, X } from "lucide-react";
import { TableFilters } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

interface DatePickerWithTextProps {
  value?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
}

function DatePickerWithText({
  value,
  onDateChange,
  placeholder,
}: DatePickerWithTextProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(value);
  const [inputValue, setInputValue] = useState(formatDate(value));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = new Date(e.target.value);
    setInputValue(e.target.value);
    if (isValidDate(inputDate)) {
      onDateChange(inputDate);
      setMonth(inputDate);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    onDateChange(date);
    setInputValue(formatDate(date));
    setOpen(false);
  };

  return (
    <div className="relative">
      <Input
        value={inputValue}
        placeholder={placeholder}
        className="bg-background pr-10 h-10"
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0 hover:bg-transparent"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end" sideOffset={4}>
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={handleCalendarSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "daterange";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface DataTableFiltersProps {
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
  onSearch: (searchTerm: string) => void;
  searchPlaceholder?: string;
  filterFields?: FilterField[];
  showSearch?: boolean;
}

export function DataTableFilters({
  filters,
  onFiltersChange,
  onSearch,
  searchPlaceholder = "Search...",
  filterFields = [],
  showSearch = true,
}: DataTableFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const newFilters = { ...filters, search: value || undefined };
    onFiltersChange(newFilters);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = { ...filters };
    if (value && value !== "" && value !== "all") {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (field: "from" | "to", value: string) => {
    const newFilters = { ...filters };
    if (!newFilters.dateRange) {
      newFilters.dateRange = { from: "", to: "" };
    }
    newFilters.dateRange[field] = value;

    // Remove dateRange if both values are empty
    if (!newFilters.dateRange.from && !newFilters.dateRange.to) {
      delete newFilters.dateRange;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    onFiltersChange({});
    onSearch("");
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {showSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        )}

        {filterFields.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 h-10 px-4"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="flex items-center gap-2 h-10 px-4"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && filterFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">{field.label}</Label>
                  {field.type === "text" && (
                    <Input
                      placeholder={field.placeholder}
                      value={filters[field.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(field.key, e.target.value)
                      }
                      className="h-10"
                    />
                  )}
                  {field.type === "select" && field.options && (
                    <Select
                      value={filters[field.key] || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(field.key, value)
                      }
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {field.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === "date" && (
                    <Input
                      type="date"
                      value={filters[field.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(field.key, e.target.value)
                      }
                      className="h-10"
                    />
                  )}
                </div>
              ))}

              {filterFields.length > 0 && (
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <Label className="text-base font-medium">Date Range</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        From Date
                      </Label>
                      <DatePickerWithText
                        value={
                          filters.dateRange?.from
                            ? new Date(filters.dateRange.from)
                            : undefined
                        }
                        onDateChange={(date) =>
                          handleDateRangeChange(
                            "from",
                            date ? date.toISOString().split("T")[0] : ""
                          )
                        }
                        placeholder="Select from date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        To Date
                      </Label>
                      <DatePickerWithText
                        value={
                          filters.dateRange?.to
                            ? new Date(filters.dateRange.to)
                            : undefined
                        }
                        onDateChange={(date) =>
                          handleDateRangeChange(
                            "to",
                            date ? date.toISOString().split("T")[0] : ""
                          )
                        }
                        placeholder="Select to date"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
