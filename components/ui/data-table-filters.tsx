"use client";

import * as React from "react";
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
  Calendar as CalendarIcon,
  Search,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import { TableFilters } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface DataTableFiltersProps {
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
  onSearch?: (searchTerm: string) => void;
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
  const [showFilters, setShowFilters] = React.useState(false);
  const [fromDateOpen, setFromDateOpen] = React.useState(false);
  const [toDateOpen, setToDateOpen] = React.useState(false);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value || undefined };
    if (!value) delete newFilters.search;
    onFiltersChange(newFilters);
    if (onSearch) onSearch(value);
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

    // Create a new dateRange object to ensure state update
    newFilters.dateRange = {
      ...newFilters.dateRange,
      [field]: value
    };

    // Remove dateRange if both values are empty
    if (!newFilters.dateRange.from && !newFilters.dateRange.to) {
      delete newFilters.dateRange;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    if (onSearch) onSearch("");
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const fromDate = filters.dateRange?.from
    ? new Date(filters.dateRange.from)
    : undefined;
  const toDate = filters.dateRange?.to
    ? new Date(filters.dateRange.to)
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {showSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={searchPlaceholder}
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10 rounded-full border-gray-200"
            />
          </div>
        )}

        <div className="flex gap-2">
          {filterFields.length > 0 && (
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 h-10 px-4 rounded-full",
                showFilters && "bg-primary text-primary-foreground"
              )}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 bg-white text-primary rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                  {Object.keys(filters).filter(k => k !== 'search').length}
                </span>
              )}
            </Button>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="flex items-center gap-2 h-10 px-4 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {showFilters && filterFields.length > 0 && (
        <Card className="border-gray-200 shadow-none overflow-hidden">
          <CardHeader className="bg-gray-50/50 py-3 px-6 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Filter className="w-4 h-4" />
              Detailed Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{field.label}</Label>
                  {field.type === "text" && (
                    <Input
                      placeholder={field.placeholder}
                      value={filters[field.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(field.key, e.target.value)
                      }
                      className="h-10 rounded-full border-gray-200"
                    />
                  )}
                  {field.type === "select" && field.options && (
                    <Select
                      value={filters[field.key] || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(field.key, value)
                      }
                    >
                      <SelectTrigger className="w-full h-10 rounded-full border-gray-200">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All {field.label}s</SelectItem>
                        {field.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === "date" && (
                    <DatePicker
                      value={filters[field.key] || ""}
                      onChange={(value) => handleFilterChange(field.key, value)}
                      placeholder={field.placeholder || "Select date"}
                      className="h-10 rounded-full border-gray-200 w-full"
                    />
                  )}
                </div>
              ))}

              <div className="lg:col-span-1 space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 rounded-full px-4 border-gray-200",
                          !fromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{fromDate ? fromDate.toLocaleDateString() : "From"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={(date) => {
                          if (date) {
                            const dateString = date.toISOString().split("T")[0];
                            handleDateRangeChange("from", dateString);
                          } else {
                            handleDateRangeChange("from", "");
                          }
                          setFromDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 rounded-full px-4 border-gray-200",
                          !toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{toDate ? toDate.toLocaleDateString() : "To"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={(date) => {
                          if (date) {
                            const dateString = date.toISOString().split("T")[0];
                            handleDateRangeChange("to", dateString);
                          } else {
                            handleDateRangeChange("to", "");
                          }
                          setToDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
