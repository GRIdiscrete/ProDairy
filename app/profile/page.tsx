"use client"

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/store'
import { fetchUserProfile } from '@/lib/store/slices/authSlice'
import { usePathname } from 'next/navigation'
import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout'
import { DataCaptureDashboardLayout } from '@/components/layout/data-capture-dashboard-layout'
import { DriversDashboardLayout } from '@/components/layout/drivers-dashboard-layout'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Shield, 
  Mail, 
  Calendar, 
  Building, 
  Edit3,
  CheckCircle,
  Info
} from 'lucide-react'
import { ProfilePulseLoading } from '@/components/ui/pulse-loading'
import { EditProfileDrawer } from '@/components/forms/edit-profile-drawer'
import { ChangePasswordDrawer } from '@/components/forms/change-password-drawer'
import { PermissionGuard } from '@/components/auth/permission-guard'

export default function ProfilePage() {
  const { user, profile, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isChangePasswordDrawerOpen, setIsChangePasswordDrawerOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch user profile from backend when component mounts
  useEffect(() => {
    if (isClient && isAuthenticated && user?.id) {
      console.log('ProfilePage: Fetching user profile for ID:', user.id)
      dispatch(fetchUserProfile(user.id))
    }
  }, [isClient, isAuthenticated, user?.id, dispatch])

  // Determine which layout to use based on pathname
  const getDashboardLayout = () => {
    if (pathname.startsWith('/admin')) {
      return 'admin'
    } else if (pathname.startsWith('/drivers')) {
      return 'drivers'
    } else if (pathname.startsWith('/data-capture')) {
      return 'data-capture'
    }
    return 'admin' // Default
  }

  const dashboardLayout = getDashboardLayout()

  if (!isClient) {
    return <ProfilePulseLoading />
  }

  if (!isAuthenticated || !profile || isLoading) {
    return <ProfilePulseLoading />
  }


  // Extract role and permissions from the actual API response
  const userRole = profile.users_role_id_fkey
  const roleName = userRole?.role_name || 'Unknown Role'
  const roleDescription = `Role created on ${userRole?.created_at ? new Date(userRole.created_at).toLocaleDateString() : 'Unknown date'}`
  
  // Dynamically extract all *_operations arrays and flatten them
  const permissionCategories = [
    { key: "views", label: "Views", icon: "👁️" },
    { key: "role_operations", label: "Role Operations", icon: "👥" },
    { key: "user_operations", label: "User Operations", icon: "👤" },
    { key: "devices_operations", label: "Device Operations", icon: "📱" },
    { key: "process_operations", label: "Process Operations", icon: "⚙️" },
    { key: "supplier_operations", label: "Supplier Operations", icon: "🏢" },
    { key: "silo_item_operations", label: "Silo Operations", icon: "🏭" },
    { key: "machine_item_operations", label: "Machine Operations", icon: "🔧" },
    { key: "bmt_operations", label: "BMT Operations", icon: "🧪" },
    { key: "dispatch_operations", label: "Dispatch Operations", icon: "🚚" },
    { key: "incubation_operations", label: "Incubation Operations", icon: "🥚" },
    { key: "pasteurizing_operations", label: "Pasteurizing Operations", icon: "🔥" },
    { key: "production_plan_operations", label: "Production Plan Operations", icon: "📋" },
    { key: "raw_milk_intake_operations", label: "Raw Milk Intake Operations", icon: "🥛" },
    { key: "raw_milk_lab_test_operations", label: "Raw Milk Lab Test Operations", icon: "🧫" },
    { key: "filmatic_operation_operations", label: "Filmatic Operations", icon: "🧴" },
    { key: "incubation_lab_test_operations", label: "Incubation Lab Test Operations", icon: "🔬" },
    { key: "raw_product_collection_operations", label: "Raw Product Collection Operations", icon: "🧺" },
    { key: "steri_process_operation_operations", label: "Steri Process Operations", icon: "🧯" },
    { key: "before_and_after_autoclave_lab_test_operations", label: "Autoclave Lab Test Operations", icon: "🧪" },
  ]

  // Build permissions array from all present categories
  const permissions = permissionCategories
    .map(cat => ({
      category: cat.label,
      icon: cat.icon,
      permissions: Array.isArray(userRole?.[cat.key]) && userRole[cat.key]
        ? userRole[cat.key]
        : (userRole?.[cat.key] ? [userRole[cat.key]] : [])
    }))
    .filter(cat => cat.permissions && cat.permissions.length > 0)

  // Stats grid: count all permissions
  const totalPermissions = permissions.reduce((acc, cat) => acc + cat.permissions.length, 0)

  const profileContent = (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl text-white">
                {profile.first_name?.[0] || ''}{profile.last_name?.[0] || ''}
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl text-gray-900">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-xl text-gray-600">
                {roleName}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4" />
                  <span>{profile.department}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setIsChangePasswordDrawerOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-full px-6 py-2"
            >
              <Shield className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button 
              onClick={() => setIsEditDrawerOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full px-6 py-2"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-3xl text-gray-900">1</p>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Permissions</p>
              <p className="text-3xl text-gray-900">
                {totalPermissions}
              </p>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-3xl text-gray-900">
                {new Date(profile.created_at).getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-transparent p-0 gap-2">
          <TabsTrigger 
            value="roles" 
            className="flex items-center space-x-2 h-10 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            <span>Roles & Permissions</span>
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="flex items-center space-x-2 h-10 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
          >
            <User className="h-4 w-4" />
            <span>Profile Info</span>
          </TabsTrigger>
        </TabsList>


        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl text-gray-900">Role & Permissions</h2>
                  <p className="text-gray-600">Your current role and associated permissions</p>
                </div>
              </div>
              
              {/* Role Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg text-gray-900 mb-2">Current Role</h4>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {roleName}
                  </span>
                  <span className="text-sm text-gray-600">{roleDescription}</span>
                </div>
              </div>

              {/* Permissions Grid */}
              <div>
                <h4 className="text-lg text-gray-900 mb-4">Permissions by Category</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions.map((category: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg">{category.icon}</span>
                        <h5 className="text-lg text-gray-900">{category.category}</h5>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.permissions.map((permission: string, permIndex: number) => (
                          <span 
                            key={permIndex} 
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Profile Information Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl text-gray-900">Profile Information</h2>
                  <p className="text-gray-600">Your personal and account details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg text-gray-900">Personal Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="text-lg text-gray-900">{profile.first_name} {profile.last_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-lg text-gray-900">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="text-lg text-gray-900">{profile.department}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="text-lg text-gray-900">Account Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="text-lg text-gray-900">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Role ID</p>
                        <p className="text-lg text-gray-900">{profile.role_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Info className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="text-lg text-gray-900">
                          {profile.updated_at 
                            ? new Date(profile.updated_at).toLocaleDateString() 
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Drawer */}
      <EditProfileDrawer 
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        profile={profile}
        user={user}
      />
      
      {/* Change Password Drawer */}
      <ChangePasswordDrawer
        open={isChangePasswordDrawerOpen}
        onOpenChange={setIsChangePasswordDrawerOpen}
        userEmail={profile.email}
      />
    </div>
  )

  // Render with appropriate dashboard layout
  return (
    <PermissionGuard requiredView="profile_tab">
      {(() => {
        switch (dashboardLayout) {
          case 'admin':
            return (
              <AdminDashboardLayout title="Profile" subtitle="Your personal profile and settings">
                {profileContent}
              </AdminDashboardLayout>
            )
          case 'drivers':
            return (
              <DriversDashboardLayout title="Profile" subtitle="Your personal profile and settings">
                {profileContent}
              </DriversDashboardLayout>
            )
          case 'data-capture':
            return (
              <DataCaptureDashboardLayout title="Profile" subtitle="Your personal profile and settings">
                {profileContent}
              </DataCaptureDashboardLayout>
            )
          default:
            return (
              <AdminDashboardLayout title="Profile" subtitle="Your personal profile and settings">
                {profileContent}
              </AdminDashboardLayout>
            )
        }
      })()}
    </PermissionGuard>
  )
}
