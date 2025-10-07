"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"
import { usersApi } from "@/lib/api/users"
import { FilmaticLinesGroup } from "@/lib/api/filmatic-lines-groups"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  department?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupData?: FilmaticLinesGroup | null
  onSave?: (managerId: string) => void
  loading?: boolean
}

export function FilmaticLinesGroupSettingsDrawer({ 
  open, 
  onOpenChange, 
  groupData, 
  onSave, 
  loading = false 
}: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedManagerId, setSelectedManagerId] = useState<string>("")

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  useEffect(() => {
    if (groupData) {
      setSelectedManagerId(groupData.manager_id || "")
    }
  }, [groupData])

  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const res = await usersApi.getUsers()
      setUsers(res.data || [])
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setUsersLoading(false)
    }
  }

  const handleSave = () => {
    if (onSave && selectedManagerId) {
      onSave(selectedManagerId)
    }
  }

  const hasChanges = selectedManagerId !== (groupData?.manager_id || "")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Group Settings</SheetTitle>
          <SheetDescription>
            Configure group manager and other settings
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Manager Selection */}
          <div className="space-y-2">
            <Label htmlFor="manager">Group Manager</Label>
            <Select
              value={selectedManagerId}
              onValueChange={setSelectedManagerId}
              disabled={usersLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col">
                      <span>{`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}</span>
                      {user.department && (
                        <span className="text-xs text-gray-500">{user.department}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {usersLoading && (
              <p className="text-xs text-gray-500">Loading users...</p>
            )}
          </div>

          {/* Group Information */}
          {groupData && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm">Group Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Group A:</span>
                  <span className="ml-2 font-medium">{groupData.group_a.length} operators</span>
                </div>
                <div>
                  <span className="text-gray-500">Group B:</span>
                  <span className="ml-2 font-medium">{groupData.group_b.length} operators</span>
                </div>
                <div>
                  <span className="text-gray-500">Group C:</span>
                  <span className="ml-2 font-medium">{groupData.group_c.length} operators</span>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <span className="ml-2 font-medium">
                    {groupData.group_a.length + groupData.group_b.length + groupData.group_c.length} operators
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Created: {new Date(groupData.created_at).toLocaleString()}
                {groupData.updated_at && (
                  <span className="block">
                    Last updated: {new Date(groupData.updated_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSave}
            disabled={loading || !hasChanges || !selectedManagerId}
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </LoadingButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}
