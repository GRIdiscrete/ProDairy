"use client"

import { useState, useEffect } from 'react'
import { useAppDispatch } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Camera, 
  Upload,
  Save,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import type { AuthUser, ExtendedUserProfile } from '@/lib/types/auth'

interface EditProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: ExtendedUserProfile
  user: AuthUser | null
}

export function EditProfileDrawer({ open, onOpenChange, profile, user }: EditProfileDrawerProps) {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    phone: '',
    bio: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        department: profile.department || '',
        phone: user?.phone || '',
        bio: ''
      })
    }
  }, [profile, user])


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)
    
    // Simulate upload delay
    setTimeout(() => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
        setIsUploading(false)
        toast.success('Profile picture updated successfully')
      }
      reader.readAsDataURL(file)
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      // In real app, this would update the profile via API
      // await dispatch(updateUserProfile(formData))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Profile updated successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        department: profile.department || '',
        phone: user?.phone || '',
        bio: ''
      })
    }
    setProfileImage(null)
  }

  // Shared form content component
  const FormContent = () => (
    <>
      <div className="space-y-6">
        {/* Profile Picture Section */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Profile Picture</Label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-2 ring-blue-100">
                <AvatarImage 
                  src={profileImage || user?.avatar || undefined} 
                  alt={`${profile.first_name} ${profile.last_name}`} 
                />
                <AvatarFallback className="text-xl font-semibold bg-gray-100 text-gray-600">
                  {profile.first_name?.[0] || ''}{profile.last_name?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              
              {/* Upload Button */}
              <div className="absolute -bottom-2 -right-2">
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </div>
                </Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                Upload a new profile picture. Supported formats: JPG, PNG, GIF
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: 5MB
              </p>
              {isUploading && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-600">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Personal Information Form */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Personal Information</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                First Name *
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
                className="border-gray-300 focus:border-[#006BC4] focus:ring-[#006BC4]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                Last Name *
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
                className="border-gray-300 focus:border-[#006BC4] focus:ring-[#006BC4]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="border-gray-300 focus:border-[#006BC4] focus:ring-[#006BC4]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                Department
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Enter department"
                className="border-gray-300 focus:border-[#006BC4] focus:ring-[#006BC4]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="border-gray-300 focus:border-[#006BC4] focus:ring-[#006BC4]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="border-gray-300 focus:border-[#006BC4] focus:ring-[#006BC4]"
            />
          </div>
        </div>

        <Separator />

        {/* Account Information (Read-only) */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Account Information</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">User ID</Label>
              <Input
                value={profile.id}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Role ID</Label>
              <Input
                value={profile.role_id}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Member Since</Label>
              <Input
                value={new Date(profile.created_at).toLocaleDateString()}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
              <Input
                value={profile.updated_at 
                  ? new Date(profile.updated_at).toLocaleDateString() 
                  : 'Never'
                }
                disabled
                className="bg-gray-50 border-gray-200 text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          
          onClick={handleReset}
          disabled={isLoading}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Reset
        </Button>
        <Button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] overflow-y-auto">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
            <SheetDescription>
              Update your personal information and profile picture
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <FormContent />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
