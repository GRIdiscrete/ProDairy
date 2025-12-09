"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Mail, User, Building, Shield, Calendar } from "lucide-react"
import { User as UserType } from "@/lib/types"
import { format } from "date-fns"

interface UserViewDrawerProps {
  open: boolean
  onClose: () => void
  user: UserType | null
  onEdit?: () => void
}

export function UserViewDrawer({ open, onClose, user, onEdit }: UserViewDrawerProps) {
  if (!user) return null

  const getRoleColor = (roleId: string) => {
    const role = roleId?.toLowerCase()
    switch (role) {
      case 'admin':
      case 'administrator':
        return 'bg-blue-100 text-blue-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'operator':
      case 'editor':
        return 'bg-green-100 text-green-800'
      case 'technician':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] p-6 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SheetTitle className="flex items-center gap-2 m-0">
                <User className="w-6 h-6" />
                {`${user.first_name} ${user.last_name}`.trim()}
              </SheetTitle>
           
            </div>
            <Button
              
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
                onClose()
              }}
              className="ml-auto"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Profile */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold truncate">
                    {`${user.first_name} ${user.last_name}`.trim()}
                  </h2>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4">
                    {user.department && (
                      <div className="flex items-center text-sm bg-muted/50 px-3 py-1 rounded-md">
                        <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{user.department}</span>
                      </div>
                    )}
                    {/* {user.role_id && (
                      <div className="flex items-center text-sm bg-muted/50 px-3 py-1 rounded-md">
                        <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{user.role_id}</span>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Name</span>
                  </div>
                  <p className="font-medium">{`${user.first_name} ${user.last_name}`.trim() || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="font-medium">{user.email || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">
                      {user.updated_at ? formatDate(user.updated_at) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">
                      {user.created_at ? formatDate(user.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
