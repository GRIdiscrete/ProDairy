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
  ChevronDownIcon,
} from "lucide-react";
import { TableFilters } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";

interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date";
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
  const [searchTerm, setSearchTerm] = React.useState(filters.search || "");
  const [showFilters, setShowFilters] = React.useState(false);
  const [fromDateOpen, setFromDateOpen] = React.useState(false);
  const [toDateOpen, setToDateOpen] = React.useState(false);

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
    console.log("handleDateRangeChange:", field, value);
    const newFilters = { ...filters };
    if (!newFilters.dateRange) {
      newFilters.dateRange = { from: "", to: "" };
    }
    newFilters.dateRange[field] = value;

    // Remove dateRange if both values are empty
    if (!newFilters.dateRange.from && !newFilters.dateRange.to) {
      delete newFilters.dateRange;
    }

    console.log("New filters:", newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    onFiltersChange({});
    onSearch("");
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const fromDate = filters.dateRange?.from
    ? new Date(filters.dateRange.from + "T00:00:00")
    : undefined;
  const toDate = filters.dateRange?.to
    ? new Date(filters.dateRange.to + "T00:00:00")
    : undefined;

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
                    <DatePicker
                      value={filters[field.key] || ""}
                      onChange={(value) => handleFilterChange(field.key, value)}
                      placeholder={field.placeholder || "Select date"}
                      className="h-10"
                    />
                  )}
                </div>
              ))}

              {/* Date Range Section - Always show when there are filter fields */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <Label className="text-base font-medium">Date Range</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {/* <Label className="text-sm text-muted-foreground">From Date</Label> */}
                    <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal h-10"
                          type="button"
                        >
                          {fromDate
                            ? fromDate.toLocaleDateString()
                            : "Select from date"}
                          <ChevronDownIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            console.log("From date selected:", date);
                            if (date) {
                              const dateString = date
                                .toISOString()
                                .split("T")[0];
                              handleDateRangeChange("from", dateString);
                            } else {
                              handleDateRangeChange("from", "");
                            }
                            setFromDateOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    {/* <Label className="text-sm text-muted-foreground">To Date</Label> */}
                    <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal h-10"
                          type="button"
                        >
                          {toDate
                            ? toDate.toLocaleDateString()
                            : "Select to date"}
                          <ChevronDownIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            console.log("To date selected:", date);
                            if (date) {
                              const dateString = date
                                .toISOString()
                                .split("T")[0];
                              handleDateRangeChange("to", dateString);
                            } else {
                              handleDateRangeChange("to", "");
                            }
                            setToDateOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
