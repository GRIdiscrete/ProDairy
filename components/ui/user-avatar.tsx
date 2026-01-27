"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, ChevronDown, Mail, Phone, Calendar, MapPin } from "lucide-react"

interface UserData {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role?: string
  department?: string
  created_at?: string
}

interface UserAvatarProps {
  user: UserData
  size?: "sm" | "md" | "lg"
  showName?: boolean
  showEmail?: boolean
  showDropdown?: boolean
}

export function UserAvatar({
  user,
  size = "md",
  showName = true,
  showEmail = false,
  showDropdown = false,
}: UserAvatarProps) {
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

  // Generate user initials
  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.trim() || ""
    const last = lastName?.trim() || ""
    return `${first[0] || ""}${last[0] || ""}`.toUpperCase()
  }

  const fullName = `${user.first_name} ${user.last_name}`.trim()
  const initials = getInitials(user.first_name, user.last_name)

  const UserInfo = ({ showChevron = false }) => (
    <div className="flex items-center space-x-3">
      <div className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium flex-shrink-0`}>
        {initials || <User className="w-4 h-4" />}
      </div>
      
      {(showName || showEmail) && (
        <div className="flex-1 min-w-0">
          {showName && (
            <div className={`font-medium text-gray-900 truncate ${textSizeClasses[size]}`}>
              {fullName}
            </div>
          )}
          
          {showEmail && user.email && (
            <div className={`text-gray-500 truncate ${size === "lg" ? "text-sm" : "text-xs"}`}>
              {user.email}
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
    return <UserInfo showChevron={false} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 justify-start hover:bg-gray-50">
          <UserInfo showChevron={true} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="start">
        <DropdownMenuLabel className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm">
            {initials || <User className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-xs text-gray-500">{user.role || 'User'}</div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center space-x-2 cursor-default">
          <Mail className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-sm font-medium">Email</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </DropdownMenuItem>
        
        {user.phone && (
          <DropdownMenuItem className="flex items-center space-x-2 cursor-default">
            <Phone className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Phone</div>
              <div className="text-xs text-gray-500">{user.phone}</div>
            </div>
          </DropdownMenuItem>
        )}
        
        {user.department && (
          <DropdownMenuItem className="flex items-center space-x-2 cursor-default">
            <MapPin className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Department</div>
              <div className="text-xs text-gray-500">{user.department}</div>
            </div>
          </DropdownMenuItem>
        )}
        
        {user.created_at && (
          <DropdownMenuItem className="flex items-center space-x-2 cursor-default">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Member Since</div>
              <div className="text-xs text-gray-500">
                {new Date(user.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long', 
                  year: 'numeric'
                })}
              </div>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}