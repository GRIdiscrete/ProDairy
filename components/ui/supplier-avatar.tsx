"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, ChevronDown, Phone, Mail, MapPin, Package, TrendingUp, TrendingDown } from "lucide-react"

interface Supplier {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  physical_address: string
  raw_product: string
  volume_supplied: number
  volume_rejected: number
  created_at: string
  updated_at: string
}

interface SupplierAvatarProps {
  supplier: Supplier
  size?: "sm" | "md" | "lg"
  showName?: boolean
  showEmail?: boolean
  showDropdown?: boolean
}

export function SupplierAvatar({
  supplier,
  size = "md",
  showName = true,
  showEmail = false,
  showDropdown = false,
}: SupplierAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.trim() || ""
    const last = lastName?.trim() || ""
    return `${first[0] || ""}${last[0] || ""}`.toUpperCase()
  }

  const fullName = `${supplier.first_name} ${supplier.last_name}`.trim()
  const initials = getInitials(supplier.first_name, supplier.last_name)

  const SupplierInfo = ({ showChevron = false }) => (
    <div className="flex items-center space-x-3">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-medium flex-shrink-0`}>
        {initials || <Building2 className="w-4 h-4" />}
      </div>
      
      {(showName || showEmail) && (
        <div className="flex-1 min-w-0">
          {showName && (
            <div className={`font-medium text-gray-900 truncate ${textSizeClasses[size]}`}>
              {fullName}
            </div>
          )}
          
          {showEmail && supplier.email && (
            <div className={`text-gray-500 truncate ${size === "lg" ? "text-sm" : "text-xs"}`}>
              {supplier.email}
            </div>
          )}
        </div>
      )}
      
      {showChevron && (
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
    </div>
  )

  if (!showDropdown) {
    return <SupplierInfo showChevron={false} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 justify-start hover:bg-gray-50">
          <SupplierInfo showChevron={true} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuLabel className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-medium text-sm">
            {initials || <Building2 className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-xs text-gray-500">Supplier</div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-default">
          <Mail className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-sm font-medium">Email</div>
            <div className="text-xs text-gray-500">{supplier.email}</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-default">
          <Phone className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-sm font-medium">Phone</div>
            <div className="text-xs text-gray-500">{supplier.phone_number}</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-default">
          <MapPin className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-sm font-medium">Address</div>
            <div className="text-xs text-gray-500">{supplier.physical_address}</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-default">
          <Package className="w-4 h-4 text-blue-500" />
          <div>
            <div className="text-sm font-medium">Raw Product</div>
            <div className="text-xs text-gray-500 capitalize">{supplier.raw_product}</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-default">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <div>
            <div className="text-sm font-medium">Volume Supplied</div>
            <div className="text-xs text-green-600">{supplier.volume_supplied.toLocaleString()}L</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-default">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <div>
            <div className="text-sm font-medium">Volume Rejected</div>
            <div className="text-xs text-red-600">{supplier.volume_rejected.toLocaleString()}L</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}